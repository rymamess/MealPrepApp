import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const PERIOD_START_KEY = 'mealprep_planning_period_start';
const PERIOD_END_KEY = 'mealprep_planning_period_end';

// expo-secure-store has no functional web implementation, so fall back to localStorage on web.
const getItem = (key: string) =>
  Platform.OS === 'web' ? Promise.resolve(window.localStorage.getItem(key)) : SecureStore.getItemAsync(key);

const setItem = (key: string, value: string) => {
  if (Platform.OS === 'web') {
    window.localStorage.setItem(key, value);
    return Promise.resolve();
  }
  return SecureStore.setItemAsync(key, value);
};

export async function getStoredPeriod(): Promise<{ periodStart: string; periodEnd: string } | null> {
  const [periodStart, periodEnd] = await Promise.all([getItem(PERIOD_START_KEY), getItem(PERIOD_END_KEY)]);
  if (!periodStart || !periodEnd) return null;
  return { periodStart, periodEnd };
}

export async function setStoredPeriod(periodStart: string, periodEnd: string): Promise<void> {
  await Promise.all([setItem(PERIOD_START_KEY, periodStart), setItem(PERIOD_END_KEY, periodEnd)]);
}
