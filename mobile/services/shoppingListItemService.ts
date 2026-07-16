import { API_BASE_URL } from "@/constants/config";
import { IngredientCategory } from "@/constants/ingredientCategories";
import { authHeaders } from "@/services/apiClient";

export type ManualShoppingItemInput = {
  name: string;
  category: IngredientCategory;
  quantity: number;
  unit: string;
  periodStart: string;
  periodEnd: string;
};

export const createManualShoppingItem = async (input: ManualShoppingItemInput): Promise<{ _id: string }> => {
  const res = await fetch(`${API_BASE_URL}/shoppingListItems`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Impossible d'ajouter cet ingrédient à la liste de courses");
  return res.json();
};

export const deleteManualShoppingItem = async (id: string): Promise<{ message: string }> => {
  const res = await fetch(`${API_BASE_URL}/shoppingListItems/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Impossible de retirer cet ingrédient");
  return res.json();
};

// 🔹 Déplace ponctuellement un item vers un autre magasin pour cette période
// uniquement (store = null pour revenir au magasin par défaut).
export const setShoppingListItemStoreOverride = async (
  name: string,
  periodStart: string,
  periodEnd: string,
  store: string | null
): Promise<{ store: string | null }> => {
  const res = await fetch(`${API_BASE_URL}/shoppingListItems/store-override`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ name, periodStart, periodEnd, store }),
  });
  if (!res.ok) throw new Error("Impossible de déplacer cet item");
  return res.json();
};
