'use strict';

import { setExchangeRates } from '../db/db.js';
import { SUPPORTED_CURRENCIES } from '../db/constants.js';
import { getRatesUrl, saveRatesUrl } from './settings.js';

// Rates move slowly. Five minutes stays current without pointless calls.
const RATES_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

let status = 'loading';
let lastUpdatedAt = null;
let lastError = null;
let requestSequence = 0;
let timerId = null;
const listeners = [];

/*
refreshRates is called without await, so a throwing listener would abandon
the rest and reject a floating promise. Isolate each one.
*/
function notify() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      // A subscriber's failure is not this service's problem.
    }
  });
}

// Returns the detach function React wants as its effect cleanup.
function subscribe(listener) {
  listeners.push(listener);
  return function unsubscribe() {
    // Identity match. Callers subscribe once.
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
}

// One snapshot, so no component sees a half updated status.
function getRatesState() {
  return {
    status: status,
    lastUpdatedAt: lastUpdatedAt,
    error: lastError
  };
}

// The UI switches on the code to choose a message and a place for it.
function failure(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

// Strict here is what keeps a bad response from poisoning good rates.
function validateRates(payload) {
  if (payload === null || typeof payload !== 'object') {
    throw failure('RATES_BAD_SHAPE',
      'the exchange rates response is not an object');
  }
  // Zero or below would divide by zero or go negative, so reject outright.
  SUPPORTED_CURRENCIES.forEach((currency) => {
    const value = payload[currency];
    if (typeof value !== 'number' || Number.isFinite(value) === false
        || value <= 0) {
      // Naming it tells the user which key their JSON is missing.
      throw failure('RATES_BAD_SHAPE',
        'the exchange rates response is missing a currency: ' + currency);
    }
  });
}

/*
Fetches once. The sequence number stops a slow older request from
overwriting rates a newer one already loaded.
*/
async function refreshRates() {
  requestSequence = requestSequence + 1;
  const mySequence = requestSequence;
  const url = getRatesUrl();

  try {
    const response = await window.fetch(url);
    if (response.ok === false) {
      throw failure('RATES_HTTP_ERROR',
        'the rates server answered with status ' + response.status);
    }

    let payload = null;
    // A parse error is a fetch failure like any other.
    try {
      payload = await response.json();
    } catch (error) {
      throw failure('RATES_BAD_JSON',
        'that URL did not return valid JSON');
    }
    validateRates(payload);

    // A superseded request touches nothing.
    if (mySequence !== requestSequence) {
      return;
    }
    // Pushing them in is what lets getReport stay synchronous.
    setExchangeRates(payload);
    status = 'ready';
    lastUpdatedAt = new Date();
    lastError = null;
  } catch (error) {
    // A stale failure must not overwrite a newer success.
    if (mySequence !== requestSequence) {
      return;
    }
    // The rates already loaded stay in place.
    status = 'error';
    lastError = error.code === undefined
      ? failure('RATES_NETWORK_ERROR', 'could not reach the rates URL')
      : error;
  }
  notify();
}

// Called once at start up: load now, then keep them fresh.
function startRates() {
  refreshRates();
  if (timerId === null) {
    timerId = window.setInterval(refreshRates, RATES_REFRESH_INTERVAL_MS);
  }
}

// Changing the URL takes effect at once, as the course forum requires.
function setRatesUrl(url) {
  saveRatesUrl(url);
  status = 'loading';
  lastError = null;
  notify();
  refreshRates();
}

// Only what the app consumes. startRates is the single entry point.
export { startRates, setRatesUrl, getRatesState, subscribe };
