//TODO: RENOMMER POUR TYPES

export type Ingredient = {
  name: string;
  quantity: string;
};

export type Spice = {
  name: string;
  quantity: string;
};

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

export type UserMeal = Meal & {
  userId: string;          // ID du créateur
  groupId?: string;        // Optionnel : pour partager dans un groupe
  createdAt: string;       // ISO date string
  updatedAt?: string;      // Optionnel
  baseMealId?: string;
};