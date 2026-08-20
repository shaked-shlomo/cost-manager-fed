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

    return { passed: passed, failed: failed, lines: lines };
  }

  root.runSelfTest = runSelfTest;
}(typeof window === 'undefined' ? globalThis : window));
