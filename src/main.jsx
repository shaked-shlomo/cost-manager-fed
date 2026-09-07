import React from 'react';
import ReactDOM from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
// Theming and app root composition.
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme/theme.js';
import App from './App.jsx';
import { AppStateProvider } from './state/AppStateProvider.jsx';
import { startRates } from './services/rates.js';

// Mount point is the single div in the XHTML shell.
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

// Started before the first paint, so synchronous getReport has rates early.
startRates();

// One theme for every component below.
root.render(
  // Dev-only checks. Nothing reaches the production build.
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppStateProvider>
        <App />
      </AppStateProvider>
    </ThemeProvider>
  </React.StrictMode>
);
