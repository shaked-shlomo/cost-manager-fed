import React from 'react';
import ReactDOM from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
// Imports needed for theming and app root composition.
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme/theme.js';
import App from './App.jsx';
import { AppStateProvider } from './state/AppStateProvider.jsx';
import { startRates } from './services/rates.js';

// Mount point is the single div in the XHTML shell.
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

// Rates are loaded before the first paint is requested so that getReport,
// which is synchronous, has them available as early as possible.
startRates();

// Apply the Swiss grid theme to all components.
// Wrap app in the theme provider for consistent styling.
root.render(
  // StrictMode enables extra dev-only checks; it adds nothing to production build.
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppStateProvider>
        <App />
      </AppStateProvider>
    </ThemeProvider>
  </React.StrictMode>
);
