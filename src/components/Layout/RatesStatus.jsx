import Chip from '@mui/material/Chip';
import { useAppState } from '../../state/AppStateContext.jsx';

// Renders a clock time for the moment rates last loaded successfully.
function formatTime(date) {
  if (date === null) {
    return '';
  }
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return hours + ':' + minutes;
}

// The ambient indicator for the background rates service. It is the only
// place the user sees that anything asynchronous is happening.
function RatesStatus() {
  const { ratesState } = useAppState();

  if (ratesState.status === 'loading') {
    return <Chip size="small" variant="outlined" label="Loading rates" />;
  }
  // The accent colour marks the one state where the numbers on screen
  // are guaranteed fresh.
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

  // Status is 'error' here. Keep the previous timestamp visible when there
  // is one, since stale-but-known rates are still useful context.
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
