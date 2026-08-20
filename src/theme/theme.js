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

// Create the MUI theme with Swiss grid foundations.
const theme = createTheme({
  palette: {
    mode: 'light',
    background: { default: '#FFFFFF', paper: '#F5F6F7' },
    text: { primary: INK, secondary: INK_SOFT },
    divider: RULE,
    // Deep teal accent; supporting palette for semantic states.
    primary: { main: ACCENT, light: '#E3F2F2', contrastText: '#FFFFFF' },
    error: { main: '#B42318' },
    warning: { main: '#B7791F' },
    success: { main: '#2F6F4E' }
  },
  // Square corners enforce flat Swiss aesthetic without rounded surfaces.
  shape: { borderRadius: 0 },
  typography: {
    fontFamily: 'Inter, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    // Headings use tight letterspacing for visual hierarchy.
    h5: { fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontWeight: 700, letterSpacing: '-0.02em' },
    overline: { fontWeight: 700, fontSize: 10, letterSpacing: '0.1em' }
  },
  components: {
    // Swiss grid enforces zero elevation: Paper is flat with hairline rule.
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { border: `1px solid ${RULE}` } }
    },
    // Buttons follow the Swiss direction: no shadow or raised effect.
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { fontWeight: 600 } }
    },
    // Table cells use tabular numerals so money amounts align by magnitude.
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${RULE_LIGHT}`,
          fontVariantNumeric: 'tabular-nums',
          // Padding creates breathing room between rows without violating flat Swiss grid.
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
