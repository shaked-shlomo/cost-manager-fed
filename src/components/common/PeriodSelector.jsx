import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { SUPPORTED_CURRENCIES } from '../../db/constants.js';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Current month and year in USD, the document's main currency. Shared,
// so both screens open on the same period.
function currentPeriod() {
  const today = new Date();
  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    currency: 'USD'
  };
}

// This year and the four before it.
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

// Shared, so the two screens cannot drift apart.
function PeriodSelector({ value, onChange, showMonth }) {
  // Spread, so changing one field preserves the other two.
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
          {/* 1-based, matching month everywhere else. */}
          {MONTH_NAMES.map((name, index) => (
            <MenuItem key={name} value={index + 1}>{name}</MenuItem>
          ))}
        </TextField>
      ) : null}
      {/* Always shown: every screen needs at least a year. */}
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
      {/* Passed to getReport, so only the total reflects this choice. */}
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

export { currentPeriod, MONTH_NAMES };
export default PeriodSelector;
