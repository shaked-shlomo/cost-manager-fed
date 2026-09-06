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
function saveRatesUrl(url) {
  const settings = readSettings();
  settings.ratesUrl = typeof url === 'string' ? url.trim() : '';
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    /*
      Storage can refuse in private browsing. Swallowing that is deliberate:
      the caller in rates.js refreshes from the new URL regardless, so the
      choice still takes effect for this session and only fails to survive a
      reload. Throwing here would escape a React event handler, where an
      error boundary cannot catch it, and the click would look like a no-op.
    */
  }
}

export { getRatesUrl, saveRatesUrl, DEFAULT_RATES_URL };
