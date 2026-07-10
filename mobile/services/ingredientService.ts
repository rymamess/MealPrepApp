import { API_BASE_URL } from "@/constants/config";
import { IngredientCategory } from "@/constants/ingredientCategories";
import { authHeaders } from "@/services/apiClient";
import { CatalogIngredient, CatalogItemType } from "@/types/Ingredient";

export const fetchIngredients = async (): Promise<CatalogIngredient[]> => {
  const res = await fetch(`${API_BASE_URL}/ingredients`, { headers: await authHeaders() });
  if (!res.ok) throw new Error("Erreur lors de la récupération des ingrédients");
  return res.json();
};

export const createIngredient = async (
  name: string,
  category: IngredientCategory
): Promise<CatalogIngredient> => {
  const res = await fetch(`${API_BASE_URL}/ingredients`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ name, category }),
  });
  if (!res.ok) throw new Error("Impossible de créer cet ingrédient");
  return res.json();
};

export const toggleFavoriteIngredient = async (
  itemType: CatalogItemType,
  itemId: string
): Promise<{ isFavorite: boolean }> => {
  const res = await fetch(`${API_BASE_URL}/ingredients/favorites/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ itemType, itemId }),
  });
  if (!res.ok) throw new Error("Impossible de modifier les favoris");
  return res.json();
};
