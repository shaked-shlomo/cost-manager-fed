import { useState } from 'react';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
// Local imports: the library, its shared constants and app-wide state.
import { openCostsDB } from '../../db/db.js';
import { DATABASE_NAME, DATABASE_VERSION } from '../../db/constants.js';
import { useAppState } from '../../state/AppStateContext.jsx';
import PeriodSelector from '../Forms/PeriodSelector.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';
import ReportTable from './ReportTable.jsx';

// Defaults to the current month and year in USD, matching the document's
// statement that USD is the application's main currency.
function currentPeriod() {
  const today = new Date();
  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    currency: 'USD'
  };
}

function ReportView() {
  // Reading these from context is what makes the screen recompute: adding
  // a cost bumps dataVersion and a rates refresh replaces ratesState, and
  // either one re-renders this consumer.
  const { ratesState } = useAppState();
  const [period, setPeriod] = useState(currentPeriod);

  // getReport runs on every render rather than in an effect, so the table
  // is always in sync with the period picked and with dataVersion above.
  let report = null;
  let error = null;
  try {
    const costsDB = openCostsDB(DATABASE_NAME, DATABASE_VERSION);
    report = costsDB.getReport(period.currency, period.year, period.month);
  } catch (caught) {
    error = caught;
  }

  return (
    <Paper sx={{ p: 3 }}>
      <PeriodSelector value={period} onChange={setPeriod} showMonth />
      {ratesState.status === 'loading' ? (
        <Alert severity="info" sx={{ mb: 2 }}>Loading exchange rates.</Alert>
      ) : null}
      {/* On failure ErrorMessage replaces the table rather than the two
          rendering side by side with stale or partial data. */}
      {error === null ? <ReportTable report={report} /> : <ErrorMessage error={error} />}
    </Paper>
  );
}

export default ReportView;
