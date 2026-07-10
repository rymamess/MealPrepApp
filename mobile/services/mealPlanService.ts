import { API_BASE_URL } from "@/constants/config";
import { authHeaders } from "@/services/apiClient";
import { MealPlanEntry, MealType, PlannableItemType, ShoppingList } from "@/types/MealPlan";

export const fetchMealPlan = async (start: string, end: string): Promise<MealPlanEntry[]> => {
  const res = await fetch(`${API_BASE_URL}/mealPlan?start=${start}&end=${end}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Erreur lors de la récupération du planning");
  return res.json();
};

export const fetchShoppingList = async (start: string, end: string): Promise<ShoppingList> => {
  const res = await fetch(`${API_BASE_URL}/mealPlan/shopping-list?start=${start}&end=${end}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Erreur lors de la récupération de la liste de courses");
  return res.json();
};

export type MealPlanEntryInput = {
  itemType: PlannableItemType;
  itemId: string;
  mealType: MealType;
  servings: number;
  periodStart: string;
  periodEnd: string;
  plannedDay?: string | null;
};

export const createMealPlanEntry = async (entry: MealPlanEntryInput): Promise<MealPlanEntry> => {
  const res = await fetch(`${API_BASE_URL}/mealPlan`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error("Impossible d'ajouter cette recette au planning");
  return res.json();
};

export const updateMealPlanEntry = async (
  id: string,
  patch: Partial<Omit<MealPlanEntryInput, "itemType" | "itemId">>
): Promise<MealPlanEntry> => {
  const res = await fetch(`${API_BASE_URL}/mealPlan/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Impossible de modifier cette entrée de planning");
  return res.json();
};

export const deleteMealPlanEntry = async (id: string): Promise<{ message: string }> => {
  const res = await fetch(`${API_BASE_URL}/mealPlan/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (!res.ok) throw new Error("Impossible de retirer cette recette du planning");
  return res.json();
};
