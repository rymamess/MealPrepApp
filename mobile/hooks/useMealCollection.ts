import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';

export type MealCollectionState<T> = {
  data: T[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
  setData: Dispatch<SetStateAction<T[]>>;
};

export function useMealCollection<T>(fetcher: () => Promise<T[]>): MealCollectionState<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const result = await fetcher();
        setData(result);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Une erreur est survenue';
        setError(message);
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [fetcher]
  );

  useEffect(() => {
    load(false);
  }, [load]);

  const refresh = useCallback(async () => {
    await load(true);
  }, [load]);

  const retry = useCallback(async () => {
    await load(false);
  }, [load]);

  return { data, loading, refreshing, error, refresh, retry, setData };
}
