export type Ingredient = {
  name: string;
  quantity: string;
};

export type Spice = {
  name: string;
  quantity: string;
};

export type Meal = {
  id: string;
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

export const MOCK_MEALS: Meal[] = [
  {
    id: '1',
    name: 'Salade méditerranéenne',
    photo: 'https://cdn.pratico-pratiques.com/app/uploads/sites/3/2018/08/20200225/salade-grecque-feta-et-edamames.jpeg',
    prepTime: '10 min',
    cookTime: '0 min',
    difficulty: 'Easy',
    servings: 2,
    category: 'Lunch',
    ingredients: [
      { name: 'Tomates', quantity: '2' },
      { name: 'Concombre', quantity: '1' },
      { name: 'Feta', quantity: '100g' },
      { name: 'Olives', quantity: '50g' },
    ],
    spices: [
      { name: 'Sel', quantity: '1 tsp' },
      { name: 'Poivre', quantity: '½ tsp' },
    ],
    description: 'Coupez tous les légumes, mélangez avec la feta et les épices.',
  },
  {
    id: '2',
    name: 'Omelette aux champignons',
    photo: 'https://images.ricardocuisine.com/services/recipes/992x1340_7920-portrait.jpg',
    prepTime: '5 min',
    cookTime: '10 min',
    difficulty: 'Easy',
    servings: 1,
    category: 'Breakfast',
    ingredients: [
      { name: 'Œufs', quantity: '3' },
      { name: 'Champignons', quantity: '100g' },
      { name: 'Lait', quantity: '50ml' },
    ],
    spices: [{ name: 'Sel', quantity: '½ tsp' }],
    description: 'Battre les œufs avec le lait, ajouter les champignons et cuire à la poêle.',
  },
];
