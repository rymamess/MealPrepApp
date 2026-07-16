import { IngredientCategory } from '@/constants/ingredientCategories';

export const UNITS = ['g', 'kg', 'ml', 'l', 'unité', 'c. à soupe', 'c. à café', 'pincée', 'tasse', 'au goût'] as const;

export type Unit = (typeof UNITS)[number];

export type Ingredient = {
  name: string;
  quantity: number;
  unit: Unit;
  category?: IngredientCategory;
};

export type Spice = Ingredient;

export const COOK_MODES = ['Plaque', 'Four', 'Airfryer', 'Micro-ondes', 'Grill', 'Aucune'] as const;

export type CookMode = (typeof COOK_MODES)[number];

export type MealCategory = 'Breakfast' | 'Snack' | 'Lunch' | 'Dinner' | 'Dessert';

export const MEAL_CATEGORY_LABELS: Record<MealCategory, string> = {
  Breakfast: 'Déjeuner',
  Snack: 'Snack',
  Lunch: 'Dîner',
  Dinner: 'Souper',
  Dessert: 'Dessert',
};

export type Meal = {
  _id: string;
  name: string;
  photo: string; // URL ou require('@/assets/xxx.png')
  prepTime: string;
  cookTime: string;
  cookMode: CookMode;
  cookTemp?: string; // en °C, optionnel
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
  category: MealCategory[];
  ingredients: Ingredient[];
  spices: Spice[];
  description: string;
  isFavorite: boolean;
};