import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// One bar per month of the selected year, in the selected currency.
function MonthlyBarChart({ totals, currency }) {
  const theme = useTheme();

  return (
    <BarChart
      height={320}
      // Band scale spaces all twelve months evenly, including the
      // ones with a zero total, unlike a continuous numeric axis.
      xAxis={[{ scaleType: 'band', data: MONTH_LABELS }]}
      series={[{
        data: totals,
        color: theme.palette.primary.main,
        // getMonthlyTotals always returns numbers, never null, but the
        // library types a bar value as number | null, so this guards
        // against a null reaching toFixed and throwing during render.
        valueFormatter: (value) => (value === null ? '' : value.toFixed(2) + ' ' + currency)
      }]}
    />
  );
}

export default MonthlyBarChart;
