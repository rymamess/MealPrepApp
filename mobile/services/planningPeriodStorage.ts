import * as SecureStore from 'expo-secure-store';

const PERIOD_START_KEY = 'mealprep_planning_period_start';
const PERIOD_END_KEY = 'mealprep_planning_period_end';

export async function getStoredPeriod(): Promise<{ periodStart: string; periodEnd: string } | null> {
  const [periodStart, periodEnd] = await Promise.all([
    SecureStore.getItemAsync(PERIOD_START_KEY),
    SecureStore.getItemAsync(PERIOD_END_KEY),
  ]);
  if (!periodStart || !periodEnd) return null;
  return { periodStart, periodEnd };
}

export async function setStoredPeriod(periodStart: string, periodEnd: string): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(PERIOD_START_KEY, periodStart),
    SecureStore.setItemAsync(PERIOD_END_KEY, periodEnd),
  ]);
}
