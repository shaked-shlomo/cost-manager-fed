import { useState } from 'react';
// MUI building blocks for the form.
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
// Settings persistence, the rates service, state and errors.
import { getRatesUrl, DEFAULT_RATES_URL } from '../services/settings.js';
import { setRatesUrl } from '../services/rates.js';
import { useAppState } from '../state/AppStateProvider.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

// Rejected here so the problem shows next to the field, not in the network.
function isValidUrl(candidate) {
  try {
    // The URL constructor throws on anything it cannot parse.
    const parsed = new URL(candidate);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

function SettingsScreen() {
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
    // Immediate effect, as the course forum requires.
    setRatesUrl(url);
  }

  /*
  Clears the override rather than writing the default into it, so a user
  who restores keeps tracking the default even if it later changes. The
  field still shows it, since an empty box would say nothing.
  */
  function handleRestore() {
    setUrl(DEFAULT_RATES_URL);
    setFieldError('');
    setRatesUrl('');
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="overline" color="text.secondary">
        Exchange rates source
      </Typography>
      {/* Validated before anything reaches the rates service. */}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2, mt: 2 }}>
        <TextField
          label="Rates URL"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          error={fieldError.length > 0}
          /* Doubles as hint and validation message, one at a time. */
          helperText={fieldError.length > 0
            ? fieldError
            : 'The response must be JSON with USD, ILS, GBP and EURO.'}
        />
        {/* Two actions, not a toggle: they are independent intents. */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button type="submit" variant="contained">Use this URL</Button>
          <Button onClick={handleRestore}>Restore default</Button>
        </Box>
      </Box>
      {/* Previous rates survive a failed refresh, so this only reports it. */}
      {ratesState.status === 'error'
        ? <ErrorMessage error={ratesState.error} />
        : null}
    </Paper>
  );
}

export default SettingsScreen;
