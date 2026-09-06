import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { SUPPORTED_CURRENCIES } from '../../db/constants.js';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Defaults to the current month and year in USD, matching the document's
// statement that USD is the application's main currency. Shared by the
// report and charts screens so both open on the same period.
function currentPeriod() {
  const today = new Date();
  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    currency: 'USD'
  };
}

// Offers the current year and the four before it, which covers any data
// a user of this application could plausibly have entered.
function yearOptions() {
  const current = new Date().getFullYear();
  const years = [];
  let offset = 0;
  while (offset < 5) {
    years.push(current - offset);
    offset = offset + 1;
  }
  return years;
}

// Shared by the report and the charts so the two screens cannot drift
// apart in how a period is chosen.
function PeriodSelector({ value, onChange, showMonth }) {
  // Spreads the previous value so the other two fields are preserved
  // when only one selector changes.
  function update(field, next) {
    onChange({ ...value, [field]: next });
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
      {showMonth === true ? (
        <TextField
          select
          label="Month"
          value={value.month}
          onChange={(event) => update('month', Number(event.target.value))}
          sx={{ minWidth: 150 }}
        >
          {/* index + 1 keeps the option values 1-based, matching month
              everywhere else in the app. */}
          {MONTH_NAMES.map((name, index) => (
            <MenuItem key={name} value={index + 1}>{name}</MenuItem>
          ))}
        </TextField>
      ) : null}
      {/* Year is always shown, unlike month, since every screen that
          reuses this selector needs at least a year to scope its data. */}
      <TextField
        select
        label="Year"
        value={value.year}
        onChange={(event) => update('year', Number(event.target.value))}
        sx={{ minWidth: 120 }}
      >
        {yearOptions().map((year) => (
          <MenuItem key={year} value={year}>{year}</MenuItem>
        ))}
      </TextField>
      {/* Currency is requested from getReport, not applied client side,
          so the row values below stay in whatever currency they were
          entered in - only the report total reflects this selection. */}
      <TextField
        select
        label="Currency"
        value={value.currency}
        onChange={(event) => update('currency', event.target.value)}
        sx={{ minWidth: 120 }}
      >
        {SUPPORTED_CURRENCIES.map((code) => (
          <MenuItem key={code} value={code}>{code}</MenuItem>
        ))}
      </TextField>
    </Box>
  );
}

export { currentPeriod };
export default PeriodSelector;
