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

export type Meal = {
  _id: string;
  name: string;
  photo: string; // URL ou require('@/assets/xxx.png')
  prepTime: string;
  cookTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  servings: number;
  category: 'Breakfast' | 'Snack' | 'Lunch' | 'Dinner' | 'Dessert';
  ingredients: Ingredient[];
  spices: Spice[];
  description: string;
};