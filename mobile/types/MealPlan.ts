import { IngredientCategory } from '@/constants/ingredientCategories';
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
  // Présent quand une contribution manuelle existe dans la ligne ('manual' ou 'mixed') —
  // permet de la retirer (voir source ci-dessous).
  id?: string;
  name: string;
  // Catégorie fixe (IngredientCategory) OU nom d'une UserCategory personnelle si un
  // override par ingrédient s'applique (voir server/utils/shoppingList.js#applyUserPreferences).
  category: IngredientCategory | string;
  quantity: number;
  unit: string;
  // 'recipe': vient uniquement des recettes planifiées.
  // 'manual': vient uniquement d'ajouts manuels.
  // 'mixed': recette + manuel fusionnés (retirer ne supprime que la part manuelle).
  source: 'recipe' | 'manual' | 'mixed';
  // Magasin résolu (override ingrédient > défaut catégorie > null). Ignoré par le tri
  // "par catégorie", utilisé par le tri "par magasin".
  store: string | null;
};
