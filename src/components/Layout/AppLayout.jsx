import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import RatesStatus from './RatesStatus.jsx';

// Fixed tab order the four screen tasks (10-13) are built against.
const TAB_LABELS = ['Report', 'Add Cost', 'Charts', 'Settings'];

// The frame every screen sits in: title, the four tabs, and the ambient
// rates indicator. Tab state lives in App so the frame stays presentational.
function AppLayout({ tab, onTabChange, children }) {
  // Title and the ambient rates chip share one row at the top of the frame.
  const headerRow = (
    <Toolbar sx={{ borderBottom: 1, borderColor: 'divider', gap: 2 }}>
      <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
        Cost Manager
      </Typography>
      <RatesStatus />
    </Toolbar>
  );

  // Tab key is the label itself since labels are fixed and unique; MUI's
  // onChange passes (event, value) and only the value matters here.
  const tabRow = (
    <Tabs
      value={tab}
      onChange={(event, next) => onTabChange(next)}
      sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
    >
      {TAB_LABELS.map((label) => <Tab key={label} label={label} />)}
    </Tabs>
  );

  // Compose the two rows under one AppBar; screens render below in Container.
  return (
    <Box>
      <AppBar position="static" color="transparent" elevation={0}>
        {headerRow}
        {tabRow}
      </AppBar>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}

export default AppLayout;
