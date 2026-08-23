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

  /*
    The initial snapshot is taken during render, but this effect only runs
    after commit, so a notification landing in between would otherwise be
    missed until the next poll. Re-reading once before subscribing closes
    that gap.
  */
  useEffect(() => {
    setRatesState(getRatesState());
    const unsubscribe = subscribe(() => setRatesState(getRatesState()));
    return unsubscribe;
  }, []);

  /*
    How the screens stay current: this memo deliberately produces a NEW
    object identity whenever either dependency changes, and React re-renders
    every consumer of a context whose value identity changed. So all four
    screens recompute on a rates refresh or on a cost being added, whichever
    fields they happen to destructure. dataVersion is a change token rather
    than a value to read - nothing reads it, and nothing should need to.
    Do not memoise this into a stable identity or add a context selector
    without replacing the mechanism; the re-render is the feature.
  */
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
