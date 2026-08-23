import { useState } from 'react';
// MUI building blocks used for the settings form layout.
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
// Local imports: settings persistence, the rates service, app state and
// the shared error renderer.
import { getRatesUrl, DEFAULT_RATES_URL } from '../../api/settings.js';
import { setRatesUrl } from '../../api/rates.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';

// Rejects a value the browser cannot resolve, before it reaches the
// rates service, so the user sees the problem next to the field.
function isValidUrl(candidate) {
  try {
    // The URL constructor throws for anything it cannot parse, which is
    // the simplest way to catch typos before they reach the network.
    const parsed = new URL(candidate);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

function SettingsForm() {
  const { ratesState } = useAppState();
  const [url, setUrl] = useState(getRatesUrl);
  const [fieldError, setFieldError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    if (isValidUrl(url) === false) {
      setFieldError('That is not a valid URL. Include http:// or https://.');
      return;
    }
    setFieldError('');
    // Applying at once is a requirement stated on the course forum.
    setRatesUrl(url);
  }

  function handleRestore() {
    setUrl(DEFAULT_RATES_URL);
    setFieldError('');
    setRatesUrl(DEFAULT_RATES_URL);
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="overline" color="text.secondary">
        Exchange rates source
      </Typography>
      {/* onSubmit runs isValidUrl before anything reaches the rates
          service, so a bad URL never leaves this screen. */}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2, mt: 2 }}>
        <TextField
          label="Rates URL"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          error={fieldError.length > 0}
          /* helperText doubles as the field hint and the validation
             message, so only one of them is visible at a time. */
          helperText={fieldError.length > 0
            ? fieldError
            : 'The response must be JSON with USD, ILS, GBP and EURO.'}
        />
        {/* Two separate actions rather than one toggle, since submitting a
            URL and restoring the default are independent user intents. */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button type="submit" variant="contained">Use this URL</Button>
          <Button onClick={handleRestore}>Restore default</Button>
        </Box>
      </Box>
      {/* The rates service keeps the previous rates on a failed refresh,
          so this only reports the failure without hiding anything else. */}
      {ratesState.status === 'error'
        ? <ErrorMessage error={ratesState.error} />
        : null}
    </Paper>
  );
}

export default SettingsForm;
