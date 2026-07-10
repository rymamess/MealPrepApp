export const INGREDIENT_CATEGORIES = [
  'Meat',
  'Seafood',
  'Dairy',
  'Vegetables',
  'Fruits',
  'Grains',
  'Spices',
  'Condiments',
  'Other',
] as const;

export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number];

type CategoryMeta = {
  label: string;
  color: string;
  icon: string; // nom d'icône MaterialCommunityIcons
};

const CATEGORY_META: Record<IngredientCategory, CategoryMeta> = {
  Meat: { label: 'Viande', color: '#e74c3c', icon: 'food-drumstick' },
  Seafood: { label: 'Poisson & fruits de mer', color: '#3498db', icon: 'fish' },
  Dairy: { label: 'Produits laitiers', color: '#f4d03f', icon: 'cheese' },
  Vegetables: { label: 'Légumes', color: '#2ecc71', icon: 'carrot' },
  Fruits: { label: 'Fruits', color: '#e67e22', icon: 'fruit-cherries' },
  Grains: { label: 'Céréales & féculents', color: '#a0785a', icon: 'bread-slice' },
  Spices: { label: 'Épices & herbes', color: '#16a34a', icon: 'shaker-outline' },
  Condiments: { label: 'Sauces & condiments', color: '#9b59b6', icon: 'bottle-tonic-outline' },
  Other: { label: 'Autre', color: '#95a5a6', icon: 'food-variant' },
};

export function getCategoryMeta(category: IngredientCategory): CategoryMeta {
  return CATEGORY_META[category];
}
