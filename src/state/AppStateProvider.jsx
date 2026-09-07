import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { subscribe, getRatesState } from '../services/rates.js';

const AppStateContext = createContext(null);

/*
The two pieces of state that cross screens: the rates status, and a
counter that ticks whenever a cost is added.
*/
function AppStateProvider({ children }) {
  const [ratesState, setRatesState] = useState(getRatesState);
  const [dataVersion, setDataVersion] = useState(0);

  /*
  The snapshot is taken during render but this runs after commit, so
  re-read once before subscribing to catch anything that landed between.
  */
  useEffect(() => {
    setRatesState(getRatesState());
    const unsubscribe = subscribe(() => setRatesState(getRatesState()));
    return unsubscribe;
  }, []);

  /*
  A new object identity on every change is what re-renders all four
  screens. dataVersion is a change token, not a value to read. Do not
  stabilise this identity without replacing the mechanism.
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

// Catches a screen rendered outside the provider, instead of undefined.
function useAppState() {
  const value = useContext(AppStateContext);
  if (value === null) {
    throw new Error('useAppState must be used inside AppStateProvider');
  }
  return value;
}

export { AppStateProvider, useAppState };
