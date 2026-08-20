import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { subscribe, getRatesState } from '../api/rates.js';

const AppStateContext = createContext(null);

/*
  Holds the two pieces of state that cross screen boundaries: the status
  of the rates service, and a counter that increments whenever a cost is
  added so the report and chart screens know to recompute.
*/
function AppStateProvider({ children }) {
  const [ratesState, setRatesState] = useState(getRatesState);
  const [dataVersion, setDataVersion] = useState(0);

  // Mirror the rates module into React state so components re-render.
  useEffect(() => {
    const unsubscribe = subscribe(() => setRatesState(getRatesState()));
    return unsubscribe;
  }, []);

  // dataVersion and ratesState both belong in the memo deps: either one
  // changing means every screen reading this context should re-render.
  const value = useMemo(() => {
    return {
      ratesState: ratesState,
      dataVersion: dataVersion,
      notifyDataChanged: () => setDataVersion((current) => current + 1)
    };
  }, [ratesState, dataVersion]);

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

// Throwing here catches a screen rendered outside the provider at
// development time instead of failing silently with undefined fields.
function useAppState() {
  const value = useContext(AppStateContext);
  if (value === null) {
    throw new Error('useAppState must be used inside AppStateProvider');
  }
  return value;
}

export { AppStateProvider, useAppState };
