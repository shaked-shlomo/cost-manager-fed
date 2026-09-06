import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import RatesStatus from './RatesStatus.jsx';

// Fixed tab order that the four screen tasks are built against.
const TAB_LABELS = ['Report', 'Add Cost', 'Charts', 'Settings'];

// The frame every screen sits in: title, the four tabs, and the ambient
// rates indicator. Tab state lives in App so the frame stays presentational.
function AppLayout({ tab, onTabChange, children }) {
  return (
    <Box>
      {/* Transparent and elevation zero because the Swiss grid direction
          uses hairline rules rather than shadows to separate regions. */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ borderBottom: 1, borderColor: 'divider', gap: 2 }}>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            Cost Manager
          </Typography>
          <RatesStatus />
        </Toolbar>
        {/* MUI passes (event, value) to onChange and only the value is
            wanted here. Labels are fixed and unique, so they serve as keys. */}
        <Tabs
          value={tab}
          onChange={(event, next) => onTabChange(next)}
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          {TAB_LABELS.map((label) => <Tab key={label} label={label} />)}
        </Tabs>
      </AppBar>
      {/* maxWidth md keeps the measure readable on a desktop monitor,
          which is the only target the project document asks for. */}
      <Container maxWidth="md" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}

export default AppLayout;
