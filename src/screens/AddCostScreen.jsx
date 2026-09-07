import { useState } from 'react';
// MUI form building blocks.
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
// The library, its constants and app-wide state.
import { openCostsDB } from '../db/db.js';
import {
  SUPPORTED_CURRENCIES,
  DATABASE_NAME,
  DATABASE_VERSION
} from '../db/constants.js';
import { useAppState } from '../state/AppStateProvider.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

// No date field: the document has the library stamp the date.
function AddCostScreen() {
  const { notifyDataChanged } = useAppState();
  // The four fields, their messages, a caught error, the snackbar.
  const [sum, setSum] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  /*
  Both touch storage and can throw. Caught here so ErrorMessage can give
  specific advice; escaping would reach the boundary's generic wording.
  */
  let costsDB = null;
  let suggestions = [];
  let storageError = null;
  try {
    costsDB = openCostsDB(DATABASE_NAME, DATABASE_VERSION);
    // Currency free, so the rates cannot block it.
    suggestions = costsDB.getCategories();
  } catch (caught) {
    storageError = caught;
  }

  // No database means no form worth showing.
  if (storageError !== null) {
    return (
      <Paper sx={{ p: 3 }}>
        <ErrorMessage error={storageError} />
      </Paper>
    );
  }

  // UI first, so library errors stay a last line of defence.
  function validate() {
    const problems = {};
    const parsedSum = Number(sum);
    if (sum.trim().length === 0 || Number.isFinite(parsedSum) === false ||
        parsedSum <= 0) {
      problems.sum = 'Enter an amount greater than 0.';
    }
    // Every field, so one submit surfaces every mistake.
    if (category.trim().length === 0) {
      problems.category = 'Choose a category or type a new one.';
    }
    if (description.trim().length === 0) {
      problems.description = 'Enter a short description.';
    }
    // Set even when empty, to clear messages from an earlier attempt.
    setFieldErrors(problems);
    return Object.keys(problems).length === 0;
  }

  // Validates, then hands the trimmed fields to the library.
  function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    if (validate() === false) {
      return;
    }
    // Only addCost is wrapped; validate reported its own problems.
    try {
      costsDB.addCost({
        sum: Number(sum),
        currency: currency,
        category: category.trim(),
        description: description.trim()
      });
      // Currency is kept: several costs in a row usually share one.
      setSum('');
      setCategory('');
      setDescription('');
      setSaved(true);
      notifyDataChanged();
    } catch (caught) {
      setError(caught);
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="overline" color="text.secondary">
        New cost item
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2, mt: 2 }}>
        <TextField
          label="Sum"
          value={sum}
          onChange={(event) => setSum(event.target.value)}
          error={fieldErrors.sum !== undefined}
          helperText={fieldErrors.sum}
          inputProps={{ inputMode: 'decimal' }}
        />
        {/* USD is first and the default, as the document states. */}
        <TextField
          select
          label="Currency"
          value={currency}
          onChange={(event) => setCurrency(event.target.value)}
        >
          {SUPPORTED_CURRENCIES.map((code) => (
            <MenuItem key={code} value={code}>{code}</MenuItem>
          ))}
        </TextField>
        {/* freeSolo allows a new category; options offers the stored ones. */}
        <Autocomplete
          freeSolo
          options={suggestions}
          inputValue={category}
          onInputChange={(event, next) => setCategory(next)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Category"
              error={fieldErrors.category !== undefined}
              helperText={fieldErrors.category}
            />
          )}
        />
        <TextField
          label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          error={fieldErrors.description !== undefined}
          helperText={fieldErrors.description}
        />
        {/* Wrapped to keep its natural width. Submitting through the form,
        not an onClick, is what makes Enter work. */}
        <Box>
          <Button type="submit" variant="contained">Add cost</Button>
        </Box>
      </Box>
      <ErrorMessage error={error} />
      {/* Without onClose the snackbar would never dismiss itself. */}
      <Snackbar
        open={saved}
        autoHideDuration={3000}
        onClose={() => setSaved(false)}
        message="Cost item saved"
      />
    </Paper>
  );
}

export default AddCostScreen;
