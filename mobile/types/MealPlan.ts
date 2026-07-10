import { Meal } from '@/types/Meal';
import { UserMeal } from '@/types/UserMeal';

export type MealType = 'Breakfast' | 'Snack' | 'Lunch' | 'Dinner' | 'Dessert';
export type PlannableItemType = 'Meal' | 'UserMeal';

export type MealPlanEntry = {
  _id: string;
  userId: string;
  periodStart: string; // 'YYYY-MM-DD'
  periodEnd: string; // 'YYYY-MM-DD'
  plannedDay: string | null; // 'YYYY-MM-DD', purement indicatif
  mealType: MealType;
  itemType: PlannableItemType;
  itemId: Meal | UserMeal; // populated by the server
  servings: number;
  createdAt: string;
};

export type ShoppingListItem = {
  name: string;
  quantity: number;
  unit: string;
};

export type ShoppingList = {
  ingredients: ShoppingListItem[];
  spices: ShoppingListItem[];
};
