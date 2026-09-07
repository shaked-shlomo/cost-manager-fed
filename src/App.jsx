import { useState } from 'react';
import AppLayout from './components/layout/AppLayout.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import AddCostScreen from './screens/AddCostScreen.jsx';
import ReportScreen from './screens/ReportScreen.jsx';
import ChartsScreen from './screens/ChartsScreen.jsx';
import SettingsScreen from './screens/SettingsScreen.jsx';

// Maps the four tabs to the four screens.
function App() {
  const [tab, setTab] = useState(0);

  return (
    <AppLayout tab={tab} onTabChange={setTab}>
      {/* key remounts the boundary per tab, so one crash cannot latch the
      fallback on for every other tab. */}
      <ErrorBoundary key={tab}>
        {/* 0-based position, unrelated to the 1-based months elsewhere. */}
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
