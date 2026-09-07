import { createTheme } from '@mui/material/styles';

// Swiss grid: flat surfaces, hairline rules, one accent, square corners.
const INK = '#111418';
const INK_SOFT = '#8B929B';
const ACCENT = '#0B6E6E';
const RULE = '#E4E7EB';
const RULE_LIGHT = '#EEF0F2';

// Pie palette, desaturated so slices sit beside the accent.
const CHART_COLORS = [
  '#0B6E6E', '#B45309', '#3F5A8A', '#7A3E6B',
  '#4A7C3F', '#A14D3A', '#5C6370'
];

// The theme itself.
const theme = createTheme({
  palette: {
    mode: 'light',
    background: { default: '#FFFFFF', paper: '#F5F6F7' },
    text: { primary: INK, secondary: INK_SOFT },
    divider: RULE,
    // Deep teal accent, plus the semantic states.
    primary: { main: ACCENT, light: '#E3F2F2', contrastText: '#FFFFFF' },
    error: { main: '#B42318' },
    warning: { main: '#B7791F' },
    success: { main: '#2F6F4E' }
  },
  // Square corners, never rounded.
  shape: { borderRadius: 0 },
  typography: {
    fontFamily: 'Inter, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    // Tight letterspacing for hierarchy.
    h5: { fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontWeight: 700, letterSpacing: '-0.02em' },
    overline: { fontWeight: 700, fontSize: 10, letterSpacing: '0.1em' }
  },
  components: {
    // Paper is flat, separated by a hairline rule.
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { border: `1px solid ${RULE}` } }
    },
    // No shadow, no raised effect.
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { fontWeight: 600 } }
    },
    // Tabular numerals align money by magnitude.
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${RULE_LIGHT}`,
          fontVariantNumeric: 'tabular-nums',
          // Breathing room between rows.
          paddingTop: 8,
          paddingBottom: 8
        }
      }
    }
  }
});

// Read by the chart series.
theme.chartColors = CHART_COLORS;

export default theme;
