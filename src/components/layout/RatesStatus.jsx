import Chip from '@mui/material/Chip';
import { useAppState } from '../../state/AppStateProvider.jsx';

// Clock time of the last successful load.
function formatTime(date) {
  if (date === null) {
    return '';
  }
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return hours + ':' + minutes;
}

// The only place the user sees the background service at work.
function RatesStatus() {
  const { ratesState } = useAppState();

  if (ratesState.status === 'loading') {
    return <Chip size="small" variant="outlined" label="Loading rates" />;
  }
  // Accent marks the one state where the numbers are fresh.
  if (ratesState.status === 'ready') {
    return (
      <Chip
        size="small"
        color="primary"
        variant="outlined"
        label={'Rates updated ' + formatTime(ratesState.lastUpdatedAt)}
      />
    );
  }

  // On error, keep the old timestamp: stale but known is still useful.
  const suffix = ratesState.lastUpdatedAt === null
    ? ''
    : ', still using rates from ' + formatTime(ratesState.lastUpdatedAt);
  return (
    <Chip
      size="small"
      color="warning"
      variant="outlined"
      label={'Rates refresh failed' + suffix}
    />
  );
}

export default RatesStatus;
