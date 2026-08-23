import { useState } from 'react';
// MUI form building blocks used across this screen.
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
// Local imports: the library, its shared constants and app-wide state.
import { openCostsDB } from '../../db/db.js';
import {
  SUPPORTED_CURRENCIES,
  DATABASE_NAME,
  DATABASE_VERSION
} from '../../db/constants.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';

// The one form for creating a cost item. No edit or delete here, and no
// date field: the project document has the library stamp the date.
function AddCostForm() {
  const { notifyDataChanged } = useAppState();
  // Local state: the four form fields, per-field validation messages, a
  // caught library error, and whether the just-saved snackbar shows.
  const [sum, setSum] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const costsDB = openCostsDB(DATABASE_NAME, DATABASE_VERSION);
  // Suggestions come straight from storage. getCategories takes no
  // currency, so it can never fail because rates have not loaded.
  const suggestions = costsDB.getCategories();

  // Validates in the user interface first, so the library errors act as a
  // last line of defence rather than the primary experience.
  function validate() {
    const problems = {};
    const parsedSum = Number(sum);
    if (sum.trim().length === 0 || Number.isFinite(parsedSum) === false ||
        parsedSum <= 0) {
      problems.sum = 'Enter an amount greater than 0.';
    }
    // Every field is checked, not just the first invalid one, so a
    // single submit surfaces all of the user's mistakes at once.
    if (category.trim().length === 0) {
      problems.category = 'Choose a category or type a new one.';
    }
    if (description.trim().length === 0) {
      problems.description = 'Enter a short description.';
    }
    // Setting fieldErrors even when problems is empty clears any
    // messages left over from an earlier, failed attempt.
    setFieldErrors(problems);
    return Object.keys(problems).length === 0;
  }

  // Runs validation, then hands the trimmed fields to the library. A
  // thrown library error is a second line of defence, shown through
  // ErrorMessage rather than crashing the screen.
  function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    if (validate() === false) {
      return;
    }
    // Only the library call is wrapped: validate() already reported its
    // own problems through fieldErrors, so this catch is just for addCost.
    try {
      costsDB.addCost({
        sum: Number(sum),
        currency: currency,
        category: category.trim(),
        description: description.trim()
      });
      // Clear the form and surface the snackbar; currency is left as is
      // since the user is likely entering several costs in a row.
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
        {/* USD is first in SUPPORTED_CURRENCIES and is the default
            selection above, matching the project document. */}
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
        {/* freeSolo lets a first-time category be typed in, while
            options still offers every category already in storage. */}
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
        {/* Wrapping the button keeps it at its natural width instead of
            stretching across the grid column the fields occupy. Submitting
            through the form, not an onClick, is what makes Enter work. */}
        <Box>
          <Button type="submit" variant="contained">Add cost</Button>
        </Box>
      </Box>
      <ErrorMessage error={error} />
      {/* autoHideDuration plus onClose is the MUI-documented pairing;
          without onClose the snackbar would never dismiss itself. */}
      <Snackbar
        open={saved}
        autoHideDuration={3000}
        onClose={() => setSaved(false)}
        message="Cost item saved"
      />
    </Paper>
  );
}

export default AddCostForm;
