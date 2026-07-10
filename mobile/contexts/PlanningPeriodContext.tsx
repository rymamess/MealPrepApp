import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { getStoredPeriod, setStoredPeriod } from '@/services/planningPeriodStorage';
import { addDays, formatISODate } from '@/utils/week';

type PlanningPeriodContextValue = {
  periodStart: string;
  periodEnd: string;
  setPeriodStart: (value: string) => void;
  setPeriodEnd: (value: string) => void;
};

const PlanningPeriodContext = createContext<PlanningPeriodContextValue | undefined>(undefined);

export function PlanningPeriodProvider({ children }: { children: React.ReactNode }) {
  const [periodStart, setPeriodStartState] = useState(() => formatISODate(new Date()));
  const [periodEnd, setPeriodEndState] = useState(() => formatISODate(addDays(new Date(), 6)));

  useEffect(() => {
    (async () => {
      const stored = await getStoredPeriod();
      if (stored) {
        setPeriodStartState(stored.periodStart);
        setPeriodEndState(stored.periodEnd);
      }
    })();
  }, []);

  // 'YYYY-MM-DD' se compare lexicographiquement comme des dates : pas besoin de parser.
  const setPeriodStart = useCallback((value: string) => {
    setPeriodEndState((currentEnd) => {
      const nextEnd = value > currentEnd ? value : currentEnd;
      setStoredPeriod(value, nextEnd).catch(() => {});
      return nextEnd;
    });
    setPeriodStartState(value);
  }, []);

  const setPeriodEnd = useCallback((value: string) => {
    setPeriodStartState((currentStart) => {
      const nextStart = value < currentStart ? value : currentStart;
      setStoredPeriod(nextStart, value).catch(() => {});
      return nextStart;
    });
    setPeriodEndState(value);
  }, []);

  return (
    <PlanningPeriodContext.Provider value={{ periodStart, periodEnd, setPeriodStart, setPeriodEnd }}>
      {children}
    </PlanningPeriodContext.Provider>
  );
}

export function usePlanningPeriod() {
  const ctx = useContext(PlanningPeriodContext);
  if (!ctx) throw new Error('usePlanningPeriod must be used within PlanningPeriodProvider');
  return ctx;
}
