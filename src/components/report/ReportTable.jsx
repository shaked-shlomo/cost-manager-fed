import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { MONTH_NAMES } from '../common/PeriodSelector.jsx';

// Two decimals and the row's own currency, never converted.
function formatAmount(sum, currency) {
  return sum.toFixed(2) + ' ' + currency;
}

/*
getReport returns only the day, which is the shape the document specifies,
so the month and year come from the report rather than from the row.
*/
function formatDate(year, month, day) {
  // MONTH_NAMES is 0-11, report months are 1-12.
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
        {/* Rows keep their own currency. Only the total converts. */}
        {report.costs.map((row, index) => (
          <TableRow key={index}>
            <TableCell>{formatDate(report.year, report.month, row.date.day)}</TableCell>
            <TableCell>{row.category}</TableCell>
            <TableCell>{row.description}</TableCell>
            <TableCell align="right">{formatAmount(row.sum, row.currency)}</TableCell>
          </TableRow>
        ))}
        {/* No border, so it attaches to the last row rather than reading
        as a new section. */}
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
