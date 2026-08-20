/*
  Shared assertion suite for db.js. It is deliberately dependency free so
  the same file runs in a browser via selftest.html and under Node via
  tools/run-selftest.mjs. It takes the db object as an argument so it can
  be pointed at either the vanilla build or the module build.
*/
(function (root) {
  'use strict';

  function runSelfTest(db) {
    // Accumulate test results as structured records for reporting.
    const lines = [];
    let passed = 0;
    let failed = 0;

    // Record one assertion result.
    function check(name, condition) {
      if (condition) {
        passed = passed + 1;
        lines.push('PASS  ' + name);
        return;
      }
      // Failure path: increment counter and log the failed test for the report.
      failed = failed + 1;
      lines.push('FAIL  ' + name);
    }

    // Run a function and return the error code it threw, or null.
    function codeOf(fn) {
      try {
        fn();
      } catch (error) {
        return error.code;
      }
      // Null return signals success: the function did not throw, so no error code exists.
      return null;
    }

    // Every run starts from empty storage so totals are predictable.
    root.localStorage.clear();

    // Basic object structure checks.
    const ob = db.openCostsDB('costsdb', 1);
    check('openCostsDB returns an object', Boolean(ob));
    check('costsDB exposes addCost', typeof ob.addCost === 'function');
    check('costsDB exposes getReport', typeof ob.getReport === 'function');

    // DB opening argument validation.
    check('openCostsDB rejects an empty name',
      codeOf(() => db.openCostsDB('', 1)) === 'DB_NAME_INVALID');
    check('openCostsDB rejects a non numeric version',
      codeOf(() => db.openCostsDB('costsdb', 'one')) === 'DB_VERSION_INVALID');

    // Non-array JSON in storage is corrupted data, not an empty database.
    root.localStorage.setItem('costsdb_v1_costs', '{}');
    check('readCosts throws on non-array JSON',
      codeOf(() => db.openCostsDB('costsdb', 1).addCost(
        { sum: 1, currency: 'USD', category: 'a', description: 'b' }
      )) === 'STORAGE_CORRUPTED');
    root.localStorage.clear();

    // addCost returns the cost with exactly the four public fields.
    const added = ob.addCost({
      sum: 200,
      currency: 'USD',
      category: 'FOOD',
      description: 'pizza'
    });
    // Verify the returned object shape and echoed values.
    check('addCost returns a truthy object', Boolean(added));
    check('addCost returns exactly four keys', Object.keys(added).length === 4);
    check('addCost echoes the sum', added.sum === 200);
    check('addCost echoes the category verbatim', added.category === 'FOOD');

    // addCost validates the cost object structure and types.
    check('addCost rejects a non object',
      codeOf(() => ob.addCost(null)) === 'COST_NOT_OBJECT');
    check('addCost rejects a non numeric sum',
      codeOf(() => ob.addCost({ sum: 'x', currency: 'USD', category: 'a', description: 'b' }))
        === 'SUM_NOT_NUMBER');
    // Validation continues with string fields to ensure category exists and is non-empty.
    check('addCost rejects an empty category',
      codeOf(() => ob.addCost({ sum: 1, currency: 'USD', category: '', description: 'b' }))
        === 'CATEGORY_NOT_STRING');

    // ---- getReport ----
    root.localStorage.clear();
    const rb = db.openCostsDB('costsdb', 1);
    rb.addCost({ sum: 200, currency: 'USD', category: 'Food', description: 'Milk 3%' });
    rb.addCost({ sum: 50, currency: 'USD', category: 'Car', description: 'fuel' });

    const now = new Date();
    const report = rb.getReport('USD', now.getFullYear(), now.getMonth() + 1);
    check('report carries the year', report.year === now.getFullYear());
    check('report carries a 1 based month', report.month === now.getMonth() + 1);
    check('report lists both costs', report.costs.length === 2);
    check('report total is 250', report.total.sum === 250);
    check('report total names the currency', report.total.currency === 'USD');

    const firstRow = report.costs[0];
    check('report row has exactly five keys', Object.keys(firstRow).length === 5);
    check('report row date is day only',
      Object.keys(firstRow.date).length === 1 && typeof firstRow.date.day === 'number');
    check('report row keeps its own currency', firstRow.currency === 'USD');

    const defaulted = rb.getReport('USD');
    check('getReport defaults to the current month', defaulted.month === now.getMonth() + 1);
    check('getReport defaults to the current year', defaulted.year === now.getFullYear());

    const empty = rb.getReport('USD', 1999, 1);
    check('a month with no costs reports zero', empty.total.sum === 0);
    check('a month with no costs has no rows', empty.costs.length === 0);

    check('getReport rejects month 13',
      codeOf(() => rb.getReport('USD', 2026, 13)) === 'REPORT_MONTH_INVALID');
    check('getReport rejects a non numeric year',
      codeOf(() => rb.getReport('USD', 'x', 1)) === 'REPORT_YEAR_INVALID');

    // ---- conversion ----
    // Two currencies in one month is what makes the total conversion
    // observable: a USD only month would pass even with broken arithmetic.
    root.localStorage.clear();
    const cb = db.openCostsDB('costsdb', 1);
    cb.addCost({ sum: 200, currency: 'USD', category: 'Food', description: 'Milk 3%' });
    cb.addCost({ sum: 120, currency: 'GBP', category: 'Education', description: 'Zoom' });

    const yearNow = new Date().getFullYear();
    const monthNow = new Date().getMonth() + 1;

    check('conversion without rates throws',
      codeOf(() => cb.getReport('ILS', yearNow, monthNow)) === 'RATES_NOT_LOADED');

    // The project document's worked example: 1 GBP equals 2 USD, so the
    // rate is 0.5 GBP per USD, and 200 USD plus 120 GBP totals 440 USD.
    db.setExchangeRates({ USD: 1, GBP: 0.5, EURO: 0.7, ILS: 3.4 });
    const converted = cb.getReport('USD', yearNow, monthNow);
    check('document worked example totals 440', converted.total.sum === 440);
    check('rows are never converted', converted.costs[1].sum === 120);
    check('rows keep the original currency', converted.costs[1].currency === 'GBP');

    check('an unknown currency throws',
      codeOf(() => cb.getReport('JPY', yearNow, monthNow)) === 'RATE_MISSING');

    // Rounding: 100 ILS at 3.4 per USD is 29.411764... which must be 29.41.
    root.localStorage.clear();
    const rr = db.openCostsDB('costsdb', 1);
    rr.addCost({ sum: 100, currency: 'ILS', category: 'Food', description: 'x' });
    check('totals round to two decimals',
      rr.getReport('USD', yearNow, monthNow).total.sum === 29.41);

    // ---- chart aggregations ----
    root.localStorage.clear();
    const ab = db.openCostsDB('costsdb', 1);
    db.setExchangeRates({ USD: 1, GBP: 0.5, EURO: 0.7, ILS: 3.4 });
    ab.addCost({ sum: 100, currency: 'USD', category: 'Food', description: 'a' });
    ab.addCost({ sum: 50, currency: 'USD', category: 'Food', description: 'b' });
    ab.addCost({ sum: 10, currency: 'GBP', category: 'Car', description: 'c' });

    const totals = ab.getCategoryTotals('USD', yearNow, monthNow);
    check('two categories are grouped', totals.length === 2);
    const foodRow = totals.filter((row) => row.category === 'Food')[0];
    check('food totals 150', foodRow.total === 150);
    const carRow = totals.filter((row) => row.category === 'Car')[0];
    check('car converts 10 GBP to 20 USD', carRow.total === 20);

    const monthly = ab.getMonthlyTotals('USD', yearNow);
    check('monthly totals has twelve entries', monthly.length === 12);
    check('the current month holds the total', monthly[monthNow - 1] === 170);
    check('other months are zero', monthly[monthNow === 1 ? 11 : 0] === 0);

    const categories = ab.getCategories();
    check('getCategories lists both categories', categories.length === 2);
    check('getCategories needs no rates', categories.indexOf('Car') !== -1);

    return { passed: passed, failed: failed, lines: lines };
  }

  root.runSelfTest = runSelfTest;
}(typeof window === 'undefined' ? globalThis : window));
