import React from 'react';
import ReactDOM from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
// Imports needed for theming and app root composition.
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme/theme.js';
import App from './App.jsx';

// Mount point is the single div in the XHTML shell.
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

// Apply the Swiss grid theme to all components.
// Wrap app in the theme provider for consistent styling.
root.render(
  // StrictMode enables extra dev-only checks; it adds nothing to production build.
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
