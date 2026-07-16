import { Difficulty, Meal, MealCategory } from '@/types/Meal';

export type MealFilters = {
  categories: MealCategory[]; // [] = pas de filtre
  difficulties: Difficulty[]; // [] = pas de filtre
  maxCookTime: number | null; // null = pas de filtre
};

export const DEFAULT_MEAL_FILTERS: MealFilters = {
  categories: [],
  difficulties: [],
  maxCookTime: null,
};

export function matchesMealFilters(meal: Meal, filters: MealFilters): boolean {
  if (filters.categories.length && !meal.category.some((c) => filters.categories.includes(c))) return false;
  if (filters.difficulties.length && !filters.difficulties.includes(meal.difficulty)) return false;
  // meal.cookTime est typé string côté mobile mais l'API renvoie en réalité un nombre.
  if (filters.maxCookTime != null && Number(meal.cookTime) > filters.maxCookTime) return false;
  return true;
}

export function countActiveMealFilters(filters: MealFilters): number {
  return (
    (filters.categories.length ? 1 : 0) +
    (filters.difficulties.length ? 1 : 0) +
    (filters.maxCookTime != null ? 1 : 0)
  );
}
