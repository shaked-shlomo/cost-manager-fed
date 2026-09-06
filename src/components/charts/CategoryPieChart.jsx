import { PieChart } from '@mui/x-charts/PieChart';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

// Draws one slice per category, all expressed in the selected currency.
function CategoryPieChart({ totals, currency }) {
  const theme = useTheme();

  if (totals.length === 0) {
    return (
      <Typography color="text.secondary">
        No cost items were recorded for this month.
      </Typography>
    );
  }

  const data = totals.map((row, index) => {
    return {
      id: index,
      value: row.total,
      label: row.category,
      color: theme.chartColors[index % theme.chartColors.length]
    };
  });

  return (
    <PieChart
      height={320}
      series={[{ data: data, valueFormatter: (item) => item.value.toFixed(2) + ' ' + currency }]}
    />
  );
}

export default CategoryPieChart;
