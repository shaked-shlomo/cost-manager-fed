import { useState } from 'react';
import Typography from '@mui/material/Typography';
import AppLayout from './components/Layout/AppLayout.jsx';
import ErrorBoundary from './components/Layout/ErrorBoundary.jsx';
import AddCostForm from './components/Forms/AddCostForm.jsx';
import ReportView from './components/Report/ReportView.jsx';

// Views arrive in Tasks 10 to 13; tabs 2 and 3 still render a
// placeholder until their own tasks fill them in.
function App() {
  const [tab, setTab] = useState(0);

  return (
    <AppLayout tab={tab} onTabChange={setTab}>
      {/* key={tab} remounts the boundary on every tab change. Without it a
          crash on one screen latches its failed state on, and every other
          tab would keep rendering the fallback instead of its own content. */}
      <ErrorBoundary key={tab}>
        {/* tab is 0-based tab position here, unrelated to the 1-based
            month values used elsewhere in the app. */}
        {tab === 0 ? (
          <ReportView />
        ) : tab === 1 ? (
          <AddCostForm />
        ) : (
          <Typography>Screen {tab}</Typography>
        )}
      </ErrorBoundary>
    </AppLayout>
  );
}

export default App;
