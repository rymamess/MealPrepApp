export type Store = {
  _id: string;
  userId: string;
  name: string;
};

export type UserCategory = {
  _id: string;
  userId: string;
  name: string;
  color: string;
  icon: string;
};

export type CategoryStoreDefault = {
  _id: string;
  userId: string;
  category: string;
  store: string;
};

export type IngredientPreference = {
  _id: string;
  userId: string;
  ingredientName: string;
  ingredientNameLower: string;
  store: string | null;
  category: string | null;
};
