import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// One bar per month, in the selected currency.
function MonthlyBarChart({ totals, currency }) {
  const theme = useTheme();

  return (
    <BarChart
      height={320}
      // Band spaces all twelve evenly, zero totals included.
      xAxis={[{ scaleType: 'band', data: MONTH_LABELS }]}
      series={[{
        data: totals,
        color: theme.palette.primary.main,
        // The library types a bar value as number | null, so guard toFixed.
        valueFormatter: (value) => (value === null ? '' : value.toFixed(2) + ' ' + currency)
      }]}
    />
  );
}

export default MonthlyBarChart;
