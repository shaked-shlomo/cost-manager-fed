'use strict';

// Here, not in db.js, because the module library never fetches. Absolute
// so it resolves from any origin.
const DEFAULT_RATES_URL = 'https://cost-manager-fed-a4vc.onrender.com/rates.json';

const SETTINGS_KEY = 'costmanager_settings';

// A missing or damaged entry must not stop the app starting.
function readSettings() {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (raw === null) {
      return {};
    }
    // Anything that is not an object is treated as no preference.
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
function saveRatesUrl(url) {
  const settings = readSettings();
  settings.ratesUrl = typeof url === 'string' ? url.trim() : '';
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    /*
      Private browsing can refuse. Swallowed on purpose: rates.js refreshes
      regardless, so the choice holds for this session and only fails to
      survive a reload. Throwing here would escape the event handler.
    */
  }
}

export { getRatesUrl, saveRatesUrl, DEFAULT_RATES_URL };
