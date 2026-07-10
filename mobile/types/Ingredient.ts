import { IngredientCategory } from '@/constants/ingredientCategories';

export type CatalogItemType = 'Ingredient' | 'UserIngredient';

export type CatalogIngredient = {
  itemType: CatalogItemType;
  itemId: string;
  name: string;
  category: IngredientCategory;
  isFavorite: boolean;
};
