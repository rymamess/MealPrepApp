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

export const MOCK_MEALS: Meal[] = [
  {
    _id: '1',
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
  }
];
