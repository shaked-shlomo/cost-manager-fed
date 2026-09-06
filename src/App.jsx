import { useState } from 'react';
import AppLayout from './components/layout/AppLayout.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import AddCostScreen from './screens/AddCostScreen.jsx';
import ReportScreen from './screens/ReportScreen.jsx';
import ChartsScreen from './screens/ChartsScreen.jsx';
import SettingsScreen from './screens/SettingsScreen.jsx';

// All four screens from Tasks 10 to 13 are now wired to their tabs.
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
          <ReportScreen />
        ) : tab === 1 ? (
          <AddCostScreen />
        ) : tab === 2 ? (
          <ChartsScreen />
        ) : (
          <SettingsScreen />
        )}
      </ErrorBoundary>
    </AppLayout>
  );
}

export default App;
