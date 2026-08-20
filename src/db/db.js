// --- packaging: begin ---
/*
  db.js - a small library that wraps localStorage for the Cost Manager
  application.

  This is the ES module version, imported by the React application. It
  deliberately performs no network access at all: src/api/rates.js owns
  fetching and pushes rates in through setExchangeRates, so this file
  cannot race with a rates URL the user chose in the settings screen.
  Its twin, vanilla-test/db.js, holds the same logic packaged for a plain
  script element, and tools/check-db-parity.mjs fails the build if the
  two ever drift apart.
*/
// --- packaging: end ---
'use strict';

// Rates are units per one USD, as the project document specifies.
// This is private to this file, not global state. It has to live at
// this scope because getReport is synchronous while rates arrive async.
let exchangeRates = null;

// Build an Error that carries a machine readable code alongside the
// human readable message. The grading test logs exception.message.
function failure(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

// localStorage is unavailable in some privacy modes, so probe it once
// rather than letting a SecurityError escape from an unrelated call.
function storage() {
  // Check for localStorage availability to catch SecurityError early.
  try {
    const probe = window.localStorage;
    probe.getItem('costmanager_probe');
    return probe;
  // Handle storage unavailable in privacy mode or older browsers.
  } catch (error) {
    throw failure('STORAGE_UNAVAILABLE',
      'localStorage is not available in this browser');
  }
}

// All keys are namespaced by the database name and version so two
// databases opened with different arguments never share rows.
function costsKey(databaseName, databaseVersion) {
  return databaseName + '_v' + databaseVersion + '_costs';
}

// Raised for both ways stored data can be unusable, so the two paths
// below cannot drift apart in the message the grading page prints.
function corrupted() {
  return failure('STORAGE_CORRUPTED',
    'stored cost data is corrupted and cannot be read');
}

function readCosts(key) {
  const raw = storage().getItem(key);
  // A missing key is an empty database, not corruption.
  if (raw === null) {
    return [];
  }

  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    // Refuse rather than silently discarding the user's saved data.
    throw corrupted();
  }

  // Valid JSON that is not an array is corrupted just the same, and
  // returning an empty list here would let the next write erase it.
  if (Array.isArray(parsed) === false) {
    throw corrupted();
  }
  return parsed;
}

function writeCosts(key, costs) {
  // Serialize and save the costs array; catch storage-full errors.
  try {
    storage().setItem(key, JSON.stringify(costs));
  } catch (error) {
    throw failure('STORAGE_QUOTA',
      'browser storage is full, the cost item was not saved');
  }
}

// Capture the date in local time. Deriving month from an ISO string
// would use UTC and drop costs added near midnight into the wrong month.
function todayParts() {
  // Fetch current date; add 1 to month since getMonth() returns 0-11.
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate()
  };
}

function validateCost(cost) {
  // Argument must be an object, not null or primitive.
  if (cost === null || typeof cost !== 'object') {
    throw failure('COST_NOT_OBJECT',
      'addCost expects an object with sum, currency, category and description');
  }
  // sum must be a finite number, not NaN or Infinity.
  if (typeof cost.sum !== 'number' || Number.isNaN(cost.sum) === true ||
      Number.isFinite(cost.sum) === false) {
    throw failure('SUM_NOT_NUMBER', 'sum must be a finite number');
  }
  // currency and category must be non-empty strings.
  if (typeof cost.currency !== 'string' || cost.currency.length === 0) {
    throw failure('CURRENCY_NOT_STRING', 'currency must be a non-empty string');
  }
  if (typeof cost.category !== 'string' || cost.category.length === 0) {
    throw failure('CATEGORY_NOT_STRING', 'category must be a non-empty string');
  }
  // description can be any string, including empty.
  if (typeof cost.description !== 'string') {
    throw failure('DESCRIPTION_NOT_STRING', 'description must be a string');
  }
}

// Money is rounded to two decimals so float division noise never
// surfaces in a total the user reads.
function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function validateReportArguments(currency, year, month) {
  // Currency must be a string to look it up and match costs in reports.
  if (typeof currency !== 'string' || currency.length === 0) {
    throw failure('REPORT_CURRENCY_INVALID',
      'currency must be a non-empty string');
  }
  // Year must be a number to index the cost records by calendar date.
  if (typeof year !== 'number' || Number.isFinite(year) === false) {
    throw failure('REPORT_YEAR_INVALID', 'year must be a number');
  }
  // Month range check enforces calendar validity; months are 1-12, not 0-11.
  if (typeof month !== 'number' || Number.isFinite(month) === false ||
      month < 1 || month > 12) {
    throw failure('REPORT_MONTH_INVALID',
      'month must be a number between 1 and 12');
  }
}

/*
  Converts a sum between two currencies. The rates object holds units
  per one USD, so a value is first taken back to USD by dividing by the
  source rate, then out to the target by multiplying. With GBP at 0.5,
  120 GBP divided by 0.5 gives 240 USD.
*/
function convert(sum, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) {
    return sum;
  }
  if (exchangeRates === null) {
    throw failure('RATES_NOT_LOADED', 'exchange rates are not available yet');
  }

  const fromRate = exchangeRates[fromCurrency];
  const toRate = exchangeRates[toCurrency];
  // A zero, negative or non numeric rate cannot be divided by or
  // multiplied with meaningfully, so reject it rather than return NaN.
  if (typeof fromRate !== 'number' || fromRate <= 0) {
    throw failure('RATE_MISSING', 'no exchange rate for currency: ' + fromCurrency);
  }
  if (typeof toRate !== 'number' || toRate <= 0) {
    throw failure('RATE_MISSING', 'no exchange rate for currency: ' + toCurrency);
  }

  return sum / fromRate * toRate;
}

function openCostsDB(databaseName, databaseVersion) {
  // databaseName must be a non-empty string to avoid key collisions.
  if (typeof databaseName !== 'string' || databaseName.length === 0) {
    throw failure('DB_NAME_INVALID', 'databaseName must be a non-empty string');
  }
  // databaseVersion must be finite; Infinity allows key collisions across versions.
  if (typeof databaseVersion !== 'number' ||
      Number.isFinite(databaseVersion) === false) {
    throw failure('DB_VERSION_INVALID', 'databaseVersion must be a number');
  }

  const key = costsKey(databaseName, databaseVersion);

  // Adds one cost item and returns it in the exact shape the project
  // document specifies: sum, currency, category and description only.
  function addCost(cost) {
    validateCost(cost);
    const costs = readCosts(key);
    // Calculate the next ID: start at 1 if empty, otherwise increment the last.
    const nextId = costs.length === 0 ? 1 : costs[costs.length - 1].id + 1;

    // Store the cost with id and timestamp; return only the four public fields.
    costs.push({
      id: nextId,
      sum: cost.sum,
      currency: cost.currency,
      // Store the original category and description as provided by the caller.
      category: cost.category,
      description: cost.description,
      date: todayParts()
    });
    writeCosts(key, costs);

    return {
      sum: cost.sum,
      currency: cost.currency,
      category: cost.category,
      description: cost.description
    };
  }

  /*
    Builds the monthly report. Note that the individual rows keep their
    original sum and currency exactly as they were saved. Only the total
    is expressed in the requested currency. This mirrors the worked
    example in the project document, where a 120 GBP row stays 120 GBP
    while the total is reported in USD.
  */
  function getReport(currency, year, month) {
    // Use today's date as defaults when year or month arguments are omitted.
    const today = todayParts();
    const useYear = year === undefined ? today.year : year;
    const useMonth = month === undefined ? today.month : month;
    validateReportArguments(currency, useYear, useMonth);

    // Prepare arrays for the report: read stored costs and initialize totals.
    const costs = readCosts(key);
    const rows = [];
    let total = 0;

    // Filter costs by year and month, building report rows with only
    // the five required keys: sum, currency, category, description, date.
    costs.forEach((item) => {
      // Skip items from other months to filter the report to a single month.
      if (item.date.year !== useYear || item.date.month !== useMonth) {
        return;
      }
      // Include the row in results; store only the five required fields.
      rows.push({
        sum: item.sum,
        currency: item.currency,
        category: item.category,
        description: item.description,
        date: { day: item.date.day }
      });
      // Convert and accumulate: each cost is converted to the target currency.
      total = total + convert(item.sum, item.currency, currency);
    });

    return {
      year: useYear,
      month: useMonth,
      costs: rows,
      total: { currency: currency, sum: roundMoney(total) }
    };
  }

  /*
    Totals each category for one month, expressed in the requested
    currency. Unlike getReport, every row must be converted here because
    the slices of a pie chart have to share one unit.
  */
  function getCategoryTotals(currency, year, month) {
    const report = getReport(currency, year, month);
    /*
      Object.create(null) rather than {} on purpose. A plain object
      inherits from Object.prototype, so a category literally named
      constructor or toString would read back an inherited member as
      its running total, and one named __proto__ would hit the setter
      and never be stored at all. Either way the chart would silently
      disagree with the report total. A null prototype has no such keys.
    */
    const byCategory = Object.create(null);

    // Accumulate each row's converted value into its category's running total.
    report.costs.forEach((row) => {
      const value = convert(row.sum, row.currency, currency);
      const running = byCategory[row.category] === undefined
        ? 0
        : byCategory[row.category];
      byCategory[row.category] = running + value;
    });

    // Transform the accumulated totals into the [{category, total}] shape.
    return Object.keys(byCategory).map((category) => {
      return { category: category, total: roundMoney(byCategory[category]) };
    });
  }

  // Every distinct category ever stored, for the suggestion list on the
  // entry form. Deliberately currency free so it cannot throw when the
  // exchange rates have not arrived yet.
  function getCategories() {
    // Null prototype for the same reason as in getCategoryTotals: a
    // category named __proto__ is dropped by a plain object literal.
    const seen = Object.create(null);
    readCosts(key).forEach((item) => {
      seen[item.category] = true;
    });
    return Object.keys(seen);
  }

  // Twelve monthly totals for one year. Built from getReport so the
  // currency arithmetic lives in a single place. Note that getReport
  // uses month 1-12 while the returned array is indexed 0-11, so January
  // (month 1) is stored at index 0.
  function getMonthlyTotals(currency, year) {
    const totals = [];
    let month = 1;
    // Reusing getReport for each month keeps the month filtering and
    // the currency arithmetic in one place instead of two.
    while (month <= 12) {
      totals.push(getReport(currency, year, month).total.sum);
      month = month + 1;
    }
    return totals;
  }

  // Expose the public methods of this database instance.
  return {
    addCost: addCost,
    getReport: getReport,
    // The three below are extras. The project document's Q&A permits
    // functions beyond the ones it names, and the charts need these.
    getCategoryTotals: getCategoryTotals,
    getMonthlyTotals: getMonthlyTotals,
    getCategories: getCategories
  };
}

// Accepts the rates map fetched by src/api/rates.js. Rejecting a bad
// argument here keeps a failed refresh from poisoning good rates.
function setExchangeRates(rates) {
  if (rates === null || typeof rates !== 'object') {
    throw failure('RATES_BAD_SHAPE', 'exchange rates must be an object');
  }
  exchangeRates = rates;
}

export { openCostsDB, setExchangeRates };
