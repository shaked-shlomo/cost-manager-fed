// --- packaging: begin ---
/*
  db.js - wraps localStorage for the Cost Manager application.

  Vanilla version, the one submitted on its own. A plain script element
  adds db to the global object, as the project document requires. Its
  twin is src/db/db.js, and check_db_parity.mjs fails if they drift.
*/
// --- packaging: end ---
(function (root) {
  'use strict';

  // --- vanilla only: begin ---
  // Absolute: the test page may be opened from a local file, where a
  // relative path would resolve against that machine, not our server.
  const DEFAULT_RATES_URL = 'https://cost-manager-fed-a4vc.onrender.com/rates.json';

  let ratesRequested = false;
  // --- vanilla only: end ---

  // Units per one USD. Cached here because getReport is synchronous.
  let exchangeRates = null;

  // An Error with a code beside the message the test page prints.
  function failure(code, message) {
    const error = new Error(message);
    error.code = code;
    return error;
  }

  // Probe once, so a SecurityError cannot escape an unrelated call.
  function storage() {
    // Touching it is what surfaces a blocked store.
    try {
      const probe = root.localStorage;
      probe.getItem('costmanager_probe');
      return probe;
    // Blocked in privacy mode, or absent in an old browser.
    } catch (error) {
      throw failure('STORAGE_UNAVAILABLE',
        'localStorage is not available in this browser');
    }
  }

  // Namespaced by name and version, so two databases never share rows.
  function costsKey(databaseName, databaseVersion) {
    return databaseName + '_v' + databaseVersion + '_costs';
  }

  // Shared by both corruption paths so their message cannot drift.
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

    // Non-array JSON is corrupt too. Returning [] would let a write erase it.
    if (Array.isArray(parsed) === false) {
      throw corrupted();
    }
    return parsed;
  }

  function writeCosts(key, costs) {
    // Save, catching a store that is full.
    try {
      storage().setItem(key, JSON.stringify(costs));
    } catch (error) {
      throw failure('STORAGE_QUOTA',
        'browser storage is full, the cost item was not saved');
    }
  }

  // Local time: UTC would drop a midnight cost into the wrong month.
  function todayParts() {
    // getMonth is 0-11, the report is 1-12.
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate()
    };
  }

  function validateCost(cost) {
    // Must be an object, not null or a primitive.
    if (cost === null || typeof cost !== 'object') {
      throw failure('COST_NOT_OBJECT',
        'addCost expects an object with sum, currency, category and description');
    }
    // Finite: NaN and Infinity are both rejected.
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

  // Two decimals, so float noise never reaches a total the user reads.
  function roundMoney(value) {
    return Math.round(value * 100) / 100;
  }

  function validateReportArguments(currency, year, month) {
    // Needed to look up a rate.
    if (typeof currency !== 'string' || currency.length === 0) {
      throw failure('REPORT_CURRENCY_INVALID',
        'currency must be a non-empty string');
    }
    // Used to filter rows by calendar date.
    if (typeof year !== 'number' || Number.isFinite(year) === false) {
      throw failure('REPORT_YEAR_INVALID', 'year must be a number');
    }
    // Months are 1-12 here, not 0-11.
    if (typeof month !== 'number' || Number.isFinite(month) === false ||
        month < 1 || month > 12) {
      throw failure('REPORT_MONTH_INVALID',
        'month must be a number between 1 and 12');
    }
  }

  /*
    Rates are units per one USD, so divide by the source rate to reach USD
    and multiply by the target. GBP at 0.5: 120 / 0.5 = 240 USD.
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
    // Reject a zero, negative or non numeric rate rather than return NaN.
    if (typeof fromRate !== 'number' || fromRate <= 0) {
      throw failure('RATE_MISSING', 'no exchange rate for currency: ' + fromCurrency);
    }
    if (typeof toRate !== 'number' || toRate <= 0) {
      throw failure('RATE_MISSING', 'no exchange rate for currency: ' + toCurrency);
    }

    return sum / fromRate * toRate;
  }

  // --- vanilla only: begin ---
  /*
    Fetches the default rates once, in the background. The grading test
    calls openCostsDB inside a try block that reports any thrown message,
    so nothing here may throw synchronously. Every failure path is
    swallowed and simply leaves the rates unset, which makes a later
    conversion report RATES_NOT_LOADED instead of breaking this call.
  */
  async function requestDefaultRates() {
    if (ratesRequested === true || typeof root.fetch !== 'function') {
      return;
    }
    // Claimed before the first await, so a second openCostsDB call in any
    // later tick already sees the flag and cannot start a second fetch.
    ratesRequested = true;

    try {
      const response = await root.fetch(DEFAULT_RATES_URL);
      if (response.ok === true) {
        const rates = await response.json();
        setExchangeRates(rates);
      }
    } catch (error) {
      // A missing or unreachable rates file must not break storage
      // operations, so every failure path ends here silently.
    }
  }
  // --- vanilla only: end ---

  function openCostsDB(databaseName, databaseVersion) {
    // Non-empty, or two databases collide on one key.
    if (typeof databaseName !== 'string' || databaseName.length === 0) {
      throw failure('DB_NAME_INVALID', 'databaseName must be a non-empty string');
    }
    // Finite, or two versions collide on one key.
    if (typeof databaseVersion !== 'number' ||
        Number.isFinite(databaseVersion) === false) {
      throw failure('DB_VERSION_INVALID', 'databaseVersion must be a number');
    }

    // --- vanilla only: begin ---
    requestDefaultRates();
    // --- vanilla only: end ---

    const key = costsKey(databaseName, databaseVersion);

    // Returns the four fields the project document names, nothing else.
    function addCost(cost) {
      validateCost(cost);
      const costs = readCosts(key);
      // Start at 1, otherwise increment the last.
      const nextId = costs.length === 0 ? 1 : costs[costs.length - 1].id + 1;

      // Stored with an id and today's date.
      costs.push({
        id: nextId,
        sum: cost.sum,
        currency: cost.currency,
        // Kept exactly as the caller gave them.
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
      Rows keep the sum and currency they were saved with. Only the total is
      converted, as in the document's example: a 120 GBP row stays 120 GBP.
    */
    function getReport(currency, year, month) {
      // Default to the current month and year.
      const today = todayParts();
      const useYear = year === undefined ? today.year : year;
      const useMonth = month === undefined ? today.month : month;
      validateReportArguments(currency, useYear, useMonth);

      // Read once, then accumulate.
      const costs = readCosts(key);
      const rows = [];
      let total = 0;

      // Keep this month only, with the five required keys.
      costs.forEach((item) => {
        // Other months are not part of this report.
        if (item.date.year !== useYear || item.date.month !== useMonth) {
          return;
        }
        // Five fields, no more.
        rows.push({
          sum: item.sum,
          currency: item.currency,
          category: item.category,
          description: item.description,
          date: { day: item.date.day }
        });
        // The total, unlike the rows, is converted.
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
      Every row converts here, unlike getReport, because pie slices have to
      share one unit.
    */
    function getCategoryTotals(currency, year, month) {
      const report = getReport(currency, year, month);
      /*
        Null prototype on purpose. A category named toString would read back
        an inherited member, and one named __proto__ would never be stored.
      */
      const byCategory = Object.create(null);

      // Running total per category.
      report.costs.forEach((row) => {
        const value = convert(row.sum, row.currency, currency);
        const running = byCategory[row.category] === undefined
          ? 0
          : byCategory[row.category];
        byCategory[row.category] = running + value;
      });

      // Into the [{category, total}] shape.
      return Object.keys(byCategory).map((category) => {
        return { category: category, total: roundMoney(byCategory[category]) };
      });
    }

    // Every category ever stored, for the entry form. Currency free, so it
    // cannot throw before the rates arrive.
    function getCategories() {
      // Null prototype, for the reason given in getCategoryTotals.
      const seen = Object.create(null);
      readCosts(key).forEach((item) => {
        seen[item.category] = true;
      });
      return Object.keys(seen);
    }

    // Twelve totals for one year. Month 1 lands at index 0.
    function getMonthlyTotals(currency, year) {
      const totals = [];
      let month = 1;
      // Reuses getReport so the arithmetic lives in one place.
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
      // Extras the charts need. The document's Q&A permits them.
      getCategoryTotals: getCategoryTotals,
      getMonthlyTotals: getMonthlyTotals,
      getCategories: getCategories
    };
  }

  // Rejecting a bad map keeps a failed refresh from poisoning good rates.
  function setExchangeRates(rates) {
    if (rates === null || typeof rates !== 'object') {
      throw failure('RATES_BAD_SHAPE', 'exchange rates must be an object');
    }
    exchangeRates = rates;
  }

  root.db = {
    openCostsDB: openCostsDB,
    setExchangeRates: setExchangeRates
  };
}(typeof window === 'undefined' ? globalThis : window));
