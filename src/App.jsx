import { useState } from 'react';
import Typography from '@mui/material/Typography';
import AppLayout from './components/Layout/AppLayout.jsx';
import ErrorBoundary from './components/Layout/ErrorBoundary.jsx';

// Views arrive in Tasks 10 to 13; each tab renders a placeholder for now
// so the shell is testable on its own before any screen exists.
function App() {
  const [tab, setTab] = useState(0);

  return (
    <AppLayout tab={tab} onTabChange={setTab}>
      <ErrorBoundary>
        <Typography>Screen {tab}</Typography>
      </ErrorBoundary>
    </AppLayout>
  );
}

export default App;
