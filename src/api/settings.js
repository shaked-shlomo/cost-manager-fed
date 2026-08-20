'use strict';

// The default lives here rather than in db.js because the module version
// of the library never fetches. It is absolute so it resolves from any
// origin the application is served from.
const DEFAULT_RATES_URL = 'https://cost-manager-fed-a4vc.onrender.com/rates.json';

const SETTINGS_KEY = 'costmanager_settings';

// Reads the settings object, tolerating a missing or damaged entry
// because a broken preference must not stop the application starting.
function readSettings() {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (raw === null) {
      return {};
    }
    // Guard against corrupted storage: ensure parsed value is an object
    const parsed = JSON.parse(raw);
    return parsed !== null && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
}

function getRatesUrl() {
  const settings = readSettings();
  const stored = settings.ratesUrl;
  return typeof stored === 'string' && stored.length > 0
    ? stored
    : DEFAULT_RATES_URL;
}

// Persists a custom rates URL. An empty string restores the default.
function setRatesUrl(url) {
  const settings = readSettings();
  settings.ratesUrl = typeof url === 'string' ? url.trim() : '';
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export { getRatesUrl, setRatesUrl, DEFAULT_RATES_URL };
