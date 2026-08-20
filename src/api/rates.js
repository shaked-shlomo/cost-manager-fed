'use strict';

import { setExchangeRates } from '../db/db.js';
import { getRatesUrl, setRatesUrl as persistRatesUrl } from './settings.js';

// Exchange rates move slowly, so a five minute poll is frequent enough to
// stay current without making pointless requests.
const RATES_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

// The four symbols the project document names. A payload missing any of
// them cannot serve the application and is rejected as a failed refresh.
const REQUIRED_CURRENCIES = ['USD', 'ILS', 'GBP', 'EURO'];

let status = 'loading';
let lastUpdatedAt = null;
let lastError = null;
let requestSequence = 0;
let timerId = null;
const listeners = [];

function notify() {
  listeners.forEach((listener) => listener());
}

// Subscribe to rate changes and return an unsubscribe function
function subscribe(listener) {
  listeners.push(listener);
  // Return function that removes listener from the array
  return function unsubscribe() {
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
}

// Return the current state of the rates service
function getRatesState() {
  // Build object from module state and current URL setting
  return {
    status: status,
    lastUpdatedAt: lastUpdatedAt,
    url: getRatesUrl(),
    error: lastError
  };
}

function failure(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

// Rejects anything that is not a complete, positive rates map. Being
// strict here is what keeps a bad response from poisoning good rates.
function validateRates(payload) {
  if (payload === null || typeof payload !== 'object') {
    throw failure('RATES_BAD_SHAPE',
      'the exchange rates response is not an object');
  }
  // Ensure each required currency exists and is a positive finite number
  REQUIRED_CURRENCIES.forEach((currency) => {
    const value = payload[currency];
    // Check that the currency is a valid positive finite number
    if (typeof value !== 'number' || Number.isFinite(value) === false
        || value <= 0) {
      throw failure('RATES_BAD_SHAPE',
        'the exchange rates response is missing a currency: ' + currency);
    }
  });
}

/*
  Fetches the rates once. A sequence number guards against an older
  request resolving after a newer one, which would otherwise let a slow
  response from a previous URL overwrite the rates just loaded.
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
    // Parse JSON response, treating parse errors as fetch failures
    try {
      payload = await response.json();
    } catch (error) {
      throw failure('RATES_BAD_JSON',
        'that URL did not return valid JSON');
    }
    validateRates(payload);

    // A superseded request must not touch any shared state.
    if (mySequence !== requestSequence) {
      return;
    }
    // Rates are valid; commit them to the database and mark as ready
    setExchangeRates(payload);
    status = 'ready';
    lastUpdatedAt = new Date();
    lastError = null;
  } catch (error) {
    // Check if this request is still the newest before updating state
    if (mySequence !== requestSequence) {
      return;
    }
    // The previously loaded rates stay in place on purpose.
    status = 'error';
    lastError = error.code === undefined
      ? failure('RATES_NETWORK_ERROR', 'could not reach the rates URL')
      : error;
  }
  notify();
}

// Called once at start up. Loads rates immediately and then keeps them
// fresh for as long as the page is open.
function startRates() {
  refreshRates();
  if (timerId === null) {
    timerId = window.setInterval(refreshRates, RATES_REFRESH_INTERVAL_MS);
  }
}

// Changing the URL takes effect at once, as the course forum requires.
function setRatesUrl(url) {
  persistRatesUrl(url);
  status = 'loading';
  lastError = null;
  notify();
  refreshRates();
}

// Public API for rate management and subscription
export {
  startRates,
  refreshRates,
  setRatesUrl,
  // Query and listen for state changes
  getRatesState,
  subscribe,
  RATES_REFRESH_INTERVAL_MS
};
