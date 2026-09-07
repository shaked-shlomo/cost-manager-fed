import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { MONTH_NAMES } from '../common/PeriodSelector.jsx';

// Formats a figure with two decimals and its own currency symbol. Rows
// are shown in the currency they were entered in, never converted.
function formatAmount(sum, currency) {
  return sum.toFixed(2) + ' ' + currency;
}

/*
  Rebuilds the full calendar date for one row. getReport deliberately returns
  only the day on each row, because that is the exact shape the project
  document specifies, so the month and year are read from the report itself
  rather than widening the library's return value.
*/
function formatDate(year, month, day) {
  // MONTH_NAMES is indexed 0-11 while the report months are 1-12.
  return day + ' ' + MONTH_NAMES[month - 1] + ' ' + year;
}

function ReportTable({ report }) {
  if (report.costs.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 4 }}>
        No cost items were recorded for this month.
      </Typography>
    );
  }

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell>Category</TableCell>
          <TableCell>Description</TableCell>
          <TableCell align="right">Amount</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {/* Each row keeps report.costs' own sum and currency: only the
            total below is converted to the currency the user picked. */}
        {report.costs.map((row, index) => (
          <TableRow key={index}>
            <TableCell>{formatDate(report.year, report.month, row.date.day)}</TableCell>
            <TableCell>{row.category}</TableCell>
            <TableCell>{row.description}</TableCell>
            <TableCell align="right">{formatAmount(row.sum, row.currency)}</TableCell>
          </TableRow>
        ))}
        {/* border: 0 keeps this row visually attached to the last data
            row instead of reading as a new table section. */}
        <TableRow>
          <TableCell colSpan={3} sx={{ fontWeight: 700, border: 0 }}>Total</TableCell>
          <TableCell align="right" sx={{ fontWeight: 700, border: 0 }}>
            {formatAmount(report.total.sum, report.total.currency)}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

export default ReportTable;
