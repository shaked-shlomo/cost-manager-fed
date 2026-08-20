import { createTheme } from '@mui/material/styles';

// Swiss grid direction: flat surfaces, hairline rules, one accent colour.
// Square corners and zero elevation are what separate this from stock MUI.
const INK = '#111418';
const INK_SOFT = '#8B929B';
const ACCENT = '#0B6E6E';
const RULE = '#E4E7EB';
const RULE_LIGHT = '#EEF0F2';

// Ordered categorical palette for the pie chart. Desaturated so the
// slices sit beside the accent instead of fighting it.
const CHART_COLORS = [
  '#0B6E6E', '#B45309', '#3F5A8A', '#7A3E6B',
  '#4A7C3F', '#A14D3A', '#5C6370'
];

const theme = createTheme({
  palette: {
    mode: 'light',
    background: { default: '#FFFFFF', paper: '#F5F6F7' },
    text: { primary: INK, secondary: INK_SOFT },
    divider: RULE,
    primary: { main: ACCENT, light: '#E3F2F2', contrastText: '#FFFFFF' },
    error: { main: '#B42318' },
    warning: { main: '#B7791F' },
    success: { main: '#2F6F4E' }
  },
  shape: { borderRadius: 0 },
  typography: {
    fontFamily: 'Inter, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h5: { fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontWeight: 700, letterSpacing: '-0.02em' },
    overline: { fontWeight: 700, fontSize: 10, letterSpacing: '0.1em' }
  },
  components: {
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { border: `1px solid ${RULE}` } }
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { fontWeight: 600 } }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${RULE_LIGHT}`,
          fontVariantNumeric: 'tabular-nums',
          paddingTop: 8,
          paddingBottom: 8
        }
      }
    }
  }
});

// Chart series read this, so the charts inherit the same palette.
theme.chartColors = CHART_COLORS;

export default theme;
