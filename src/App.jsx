import { useState } from 'react';
import Typography from '@mui/material/Typography';
import AppLayout from './components/Layout/AppLayout.jsx';
import ErrorBoundary from './components/Layout/ErrorBoundary.jsx';
import AddCostForm from './components/Forms/AddCostForm.jsx';

// Views arrive in Tasks 10 to 13; tabs 0, 2 and 3 still render a
// placeholder until their own tasks fill them in.
function App() {
  const [tab, setTab] = useState(0);

  return (
    <AppLayout tab={tab} onTabChange={setTab}>
      <ErrorBoundary>
        {tab === 1 ? <AddCostForm /> : <Typography>Screen {tab}</Typography>}
      </ErrorBoundary>
    </AppLayout>
  );
}

export default App;
