import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import RatesStatus from './RatesStatus.jsx';

// Fixed tab order.
const TAB_LABELS = ['Report', 'Add Cost', 'Charts', 'Settings'];

// The frame every screen sits in. Tab state lives in App.
function AppLayout({ tab, onTabChange, children }) {
  return (
    <Box>
      {/* Hairline rules rather than shadows separate the regions. */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ borderBottom: 1, borderColor: 'divider', gap: 2 }}>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            Cost Manager
          </Typography>
          <RatesStatus />
        </Toolbar>
        {/* Only the value is wanted. Labels are unique, so they are the keys. */}
        <Tabs
          value={tab}
          onChange={(event, next) => onTabChange(next)}
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          {TAB_LABELS.map((label) => <Tab key={label} label={label} />)}
        </Tabs>
      </AppBar>
      {/* md keeps the measure readable on the desktop target. */}
      <Container maxWidth="md" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}

export default AppLayout;
