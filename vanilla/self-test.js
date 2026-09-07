/*
Assertion suite for db.js. Dependency free, so the same file runs in the
browser and under Node. Takes db as an argument, so it can point at either
build.
*/
(function (root) {
  'use strict';

  function runSelfTest(db) {
    // Results as structured records.
    const lines = [];
    let passed = 0;
    let failed = 0;

    // One assertion.
    function check(name, condition) {
      if (condition) {
        passed = passed + 1;
        lines.push('PASS  ' + name);
        return;
      }
      // Failure: count it and log it.
      failed = failed + 1;
      lines.push('FAIL  ' + name);
    }

    // Returns the code a function threw, or null.
    function codeOf(fn) {
      try {
        fn();
      } catch (error) {
        return error.code;
      }
      // No throw means no code.
      return null;
    }

    // Empty storage, so totals are predictable.
    root.localStorage.clear();

    // Object structure.
    const ob = db.openCostsDB('costsdb', 1);
    check('openCostsDB returns an object', Boolean(ob));
    check('costsDB exposes addCost', typeof ob.addCost === 'function');
    check('costsDB exposes getReport', typeof ob.getReport === 'function');

    // openCostsDB arguments.
    check('openCostsDB rejects an empty name',
      codeOf(() => db.openCostsDB('', 1)) === 'DB_NAME_INVALID');
    check('openCostsDB rejects a non numeric version',
      codeOf(() => db.openCostsDB('costsdb', 'one')) === 'DB_VERSION_INVALID');

    // Non-array JSON is corrupt, not empty.
    root.localStorage.setItem('costsdb_v1_costs', '{}');
    check('readCosts throws on non-array JSON',
      codeOf(() => db.openCostsDB('costsdb', 1).addCost(
        { sum: 1, currency: 'USD', category: 'a', description: 'b' }
      )) === 'STORAGE_CORRUPTED');
    root.localStorage.clear();

    // Exactly the four public fields.
    const added = ob.addCost({
      sum: 200,
      currency: 'USD',
      category: 'FOOD',
      description: 'pizza'
    });
    // Shape and echoed values.
    check('addCost returns a truthy object', Boolean(added));
    check('addCost returns exactly four keys', Object.keys(added).length === 4);
    check('addCost echoes the sum', added.sum === 200);
    check('addCost echoes the category verbatim', added.category === 'FOOD');

    // Structure and type validation.
    check('addCost rejects a non object',
      codeOf(() => ob.addCost(null)) === 'COST_NOT_OBJECT');
    check('addCost rejects a non numeric sum',
      codeOf(() => ob.addCost({ sum: 'x', currency: 'USD', category: 'a', description: 'b' }))
        === 'SUM_NOT_NUMBER');
    // The string fields.
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
    // Two currencies: a USD only month would pass with broken arithmetic.
    root.localStorage.clear();
    const cb = db.openCostsDB('costsdb', 1);
    cb.addCost({ sum: 200, currency: 'USD', category: 'Food', description: 'Milk 3%' });
    cb.addCost({ sum: 120, currency: 'GBP', category: 'Education', description: 'Zoom' });

    const yearNow = new Date().getFullYear();
    const monthNow = new Date().getMonth() + 1;

    check('conversion without rates throws',
      codeOf(() => cb.getReport('ILS', yearNow, monthNow)) === 'RATES_NOT_LOADED');

    // The document's example: 1 GBP is 2 USD, so 200 USD plus 120 GBP is 440.
    db.setExchangeRates({ USD: 1, GBP: 0.5, EURO: 0.7, ILS: 3.4 });
    const converted = cb.getReport('USD', yearNow, monthNow);
    check('document worked example totals 440', converted.total.sum === 440);
    check('rows are never converted', converted.costs[1].sum === 120);
    check('rows keep the original currency', converted.costs[1].currency === 'GBP');

    check('an unknown currency throws',
      codeOf(() => cb.getReport('JPY', yearNow, monthNow)) === 'RATE_MISSING');

    // 100 ILS at 3.4 is 29.411764..., which must round to 29.41.
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

    // Category names are free text and can collide with Object.prototype.
    // Both maps use a null prototype so they behave like any other.
    root.localStorage.clear();
    const pb = db.openCostsDB('costsdb', 1);
    pb.addCost({ sum: 10, currency: 'USD', category: 'constructor', description: 'a' });
    pb.addCost({ sum: 20, currency: 'USD', category: '__proto__', description: 'b' });
    const proto = pb.getCategoryTotals('USD', yearNow, monthNow);
    const protoTotal = proto.reduce((running, row) => running + row.total, 0);

    // Before the fix, constructor totalled NaN and __proto__ vanished.
    check('prototype named categories still total correctly', protoTotal === 30);
    check('prototype named categories are not dropped', proto.length === 2);
    check('getCategories keeps a __proto__ category',
      pb.getCategories().indexOf('__proto__') !== -1);

    return { passed: passed, failed: failed, lines: lines };
  }

  root.runSelfTest = runSelfTest;
}(typeof window === 'undefined' ? globalThis : window));
