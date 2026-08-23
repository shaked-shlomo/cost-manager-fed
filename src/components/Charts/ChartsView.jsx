import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
// Local imports: the database layer, shared state, and this screen's
// building blocks (the shared period selector, error display, and charts).
import { openCostsDB } from '../../db/db.js';
import { DATABASE_NAME, DATABASE_VERSION } from '../../db/constants.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import PeriodSelector from '../Forms/PeriodSelector.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';
import CategoryPieChart from './CategoryPieChart.jsx';
import MonthlyBarChart from './MonthlyBarChart.jsx';

function currentPeriod() {
  const today = new Date();
  return { year: today.getFullYear(), month: today.getMonth() + 1, currency: 'USD' };
}

// Holds both required charts. They share one period and currency because
// the project document groups them under a single requirement.
function ChartsView() {
  // As in ReportView, consuming context is what triggers recomputation
  // when a cost is added or the exchange rates change.
  const { ratesState } = useAppState();
  const [period, setPeriod] = useState(currentPeriod);

  let categoryTotals = null;
  let monthlyTotals = null;
  let error = null;
  try {
    // Both totals are computed together; a failure in either (rates
    // not loaded yet, an unknown currency) aborts the render as one error.
    const costsDB = openCostsDB(DATABASE_NAME, DATABASE_VERSION);
    categoryTotals = costsDB.getCategoryTotals(period.currency, period.year, period.month);
    monthlyTotals = costsDB.getMonthlyTotals(period.currency, period.year);
  } catch (caught) {
    error = caught;
  }

  /*
    One tree for both outcomes rather than an early return, so the period
    selector is declared once. Duplicating it would let the two copies drift.
    The loading banner matches the Report screen: the two views read the same
    rates state and should say the same thing about it.
  */
  return (
    <Paper sx={{ p: 3 }}>
      <PeriodSelector value={period} onChange={setPeriod} showMonth />
      {ratesState.status === 'loading' ? (
        <Alert severity="info" sx={{ mb: 2 }}>Loading exchange rates.</Alert>
      ) : null}
      {error !== null ? <ErrorMessage error={error} /> : null}
      {/* Item (3) of the project document: one pie chart, one slice per
          category, for the selected month and year. */}
      <Typography variant="overline" color="text.secondary">
        Costs by category
      </Typography>
      {error === null ? (
        <CategoryPieChart totals={categoryTotals} currency={period.currency} />
      ) : null}
      {/* Item (4): all twelve months of the selected year, including
          the empty ones, so the shape of spending across the year shows. */}
      <Typography variant="overline" color="text.secondary" sx={{ mt: 4, display: 'block' }}>
        Costs by month
      </Typography>
      {error === null ? (
        <MonthlyBarChart totals={monthlyTotals} currency={period.currency} />
      ) : null}
    </Paper>
  );
}

export default ChartsView;
