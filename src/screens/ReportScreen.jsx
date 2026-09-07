import { useState } from 'react';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
// The library, its constants and app-wide state.
import { openCostsDB } from '../db/db.js';
import { DATABASE_NAME, DATABASE_VERSION } from '../db/constants.js';
import { useAppState } from '../state/AppStateProvider.jsx';
import PeriodSelector, { currentPeriod } from '../components/common/PeriodSelector.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import ReportTable from '../components/report/ReportTable.jsx';

function ReportScreen() {
  // Consuming the context is what makes this screen recompute.
  const { ratesState } = useAppState();
  const [period, setPeriod] = useState(currentPeriod);

  // On every render, not in an effect, so the table is never stale.
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
      {/* On failure the message replaces the table, never sits beside it. */}
      {error === null ? <ReportTable report={report} /> : <ErrorMessage error={error} />}
    </Paper>
  );
}

export default ReportScreen;
