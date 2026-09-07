import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
// The library, shared state, and this screen's building blocks.
import { openCostsDB } from '../db/db.js';
import { DATABASE_NAME, DATABASE_VERSION } from '../db/constants.js';
import { useAppState } from '../state/AppStateProvider.jsx';
import PeriodSelector, { currentPeriod } from '../components/common/PeriodSelector.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import CategoryPieChart from '../components/charts/CategoryPieChart.jsx';
import MonthlyBarChart from '../components/charts/MonthlyBarChart.jsx';

// Both charts share one period and currency, as the document groups them.
function ChartsScreen() {
  // As in ReportScreen, consuming context triggers recomputation.
  const { ratesState } = useAppState();
  const [period, setPeriod] = useState(currentPeriod);

  let categoryTotals = null;
  let monthlyTotals = null;
  let error = null;
  try {
    // Computed together, so either failure surfaces as one error.
    const costsDB = openCostsDB(DATABASE_NAME, DATABASE_VERSION);
    categoryTotals = costsDB.getCategoryTotals(period.currency, period.year, period.month);
    monthlyTotals = costsDB.getMonthlyTotals(period.currency, period.year);
  } catch (caught) {
    error = caught;
  }

  /*
  One tree rather than an early return, so the period selector is declared
  once and the two copies cannot drift.
  */
  return (
    <Paper sx={{ p: 3 }}>
      <PeriodSelector value={period} onChange={setPeriod} showMonth />
      {ratesState.status === 'loading' ? (
        <Alert severity="info" sx={{ mb: 2 }}>Loading exchange rates.</Alert>
      ) : null}
      {error !== null ? <ErrorMessage error={error} /> : null}
      {/* Item (3): one slice per category, for the selected month. */}
      <Typography variant="overline" color="text.secondary">
        Costs by category
      </Typography>
      {error === null ? (
        <CategoryPieChart totals={categoryTotals} currency={period.currency} />
      ) : null}
      {/* Item (4): all twelve months, empty ones included. */}
      <Typography variant="overline" color="text.secondary" sx={{ mt: 4, display: 'block' }}>
        Costs by month
      </Typography>
      {error === null ? (
        <MonthlyBarChart totals={monthlyTotals} currency={period.currency} />
      ) : null}
    </Paper>
  );
}

export default ChartsScreen;
