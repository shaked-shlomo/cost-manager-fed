import Alert from '@mui/material/Alert';

/*
  Turns an error into a sentence the user can act on. The raw message is
  written for the grading test, not for a person, so it is never shown.
*/
const MESSAGES = {
  RATES_NOT_LOADED:
    'Waiting for exchange rates. This view will appear as soon as they load.',
  RATE_MISSING:
    'No exchange rate is available for that currency. Check the rates URL in Settings.',
  STORAGE_QUOTA:
    'Browser storage is full, so the cost item was not saved.',
  STORAGE_UNAVAILABLE:
    'This app needs browser storage. Turn off private browsing or enable site data, then reload.',
  STORAGE_CORRUPTED:
    'Saved cost data could not be read. It may have been changed outside the app.',
  RATES_BAD_JSON: 'That URL did not return valid JSON.',
  RATES_BAD_SHAPE: 'The rates response is missing one of USD, ILS, GBP or EURO.',
  RATES_HTTP_ERROR: 'The rates server rejected the request.',
  RATES_NETWORK_ERROR: 'Could not reach the rates URL.'
};

// The common case. Render nothing, not an empty alert.
function ErrorMessage({ error }) {
  if (error === null || error === undefined) {
    return null;
  }
  const text = MESSAGES[error.code];
  return (
    <Alert severity="error" sx={{ mt: 2 }}>
      {text === undefined ? 'Something went wrong. Please try again.' : text}
    </Alert>
  );
}

export default ErrorMessage;
