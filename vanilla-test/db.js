/*
  db.js - a small library that wraps localStorage for the Cost Manager
  application. This is the vanilla version. Loading it with a plain
  script element adds the db property to the global object.

  The module version in src/db/db.js is the same body with the closing
  lines replaced by an export statement.
*/
(function (root) {
  'use strict';

  // Rates are units per one USD, as the project document specifies.
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
    try {
      const probe = root.localStorage;
      probe.getItem('costmanager_probe');
      return probe;
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

  function readCosts(key) {
    const raw = storage().getItem(key);
    if (raw === null) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      // Refuse rather than silently discarding the user's saved data.
      throw failure('STORAGE_CORRUPTED',
        'stored cost data is corrupted and cannot be read');
    }
  }

  function writeCosts(key, costs) {
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
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate()
    };
  }

  function validateCost(cost) {
    if (cost === null || typeof cost !== 'object') {
      throw failure('COST_NOT_OBJECT',
        'addCost expects an object with sum, currency, category and description');
    }
    if (typeof cost.sum !== 'number' || Number.isNaN(cost.sum) === true ||
        Number.isFinite(cost.sum) === false) {
      throw failure('SUM_NOT_NUMBER', 'sum must be a finite number');
    }
    if (typeof cost.currency !== 'string' || cost.currency.length === 0) {
      throw failure('CURRENCY_NOT_STRING', 'currency must be a non-empty string');
    }
    if (typeof cost.category !== 'string' || cost.category.length === 0) {
      throw failure('CATEGORY_NOT_STRING', 'category must be a non-empty string');
    }
    if (typeof cost.description !== 'string') {
      throw failure('DESCRIPTION_NOT_STRING', 'description must be a string');
    }
  }

  function openCostsDB(databaseName, databaseVersion) {
    if (typeof databaseName !== 'string' || databaseName.length === 0) {
      throw failure('DB_NAME_INVALID', 'databaseName must be a non-empty string');
    }
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
      const nextId = costs.length === 0 ? 1 : costs[costs.length - 1].id + 1;

      costs.push({
        id: nextId,
        sum: cost.sum,
        currency: cost.currency,
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

    return {
      addCost: addCost
    };
  }

  // Task 4 adds setExchangeRates. Declared here so the shape is stable.
  function setExchangeRates(rates) {
    exchangeRates = rates;
  }

  root.db = {
    openCostsDB: openCostsDB,
    setExchangeRates: setExchangeRates
  };
}(typeof window === 'undefined' ? globalThis : window));
