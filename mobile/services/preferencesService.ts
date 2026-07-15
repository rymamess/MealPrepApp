import { API_BASE_URL } from "@/constants/config";
import { authHeaders } from "@/services/apiClient";
import { CategoryStoreDefault, IngredientPreference, Store, UserCategory } from "@/types/Preferences";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}/preferences${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(await authHeaders()), ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? "Une erreur est survenue");
  }
  return res.json();
}

// ---------- Magasins ----------

export const fetchStores = (): Promise<Store[]> => request("/stores");

export const createStore = (name: string): Promise<Store> =>
  request("/stores", { method: "POST", body: JSON.stringify({ name }) });

export const deleteStore = (id: string): Promise<{ message: string }> =>
  request(`/stores/${id}`, { method: "DELETE" });

// ---------- Catégories personnelles ----------

export const fetchUserCategories = (): Promise<UserCategory[]> => request("/categories");

export const createUserCategory = (name: string, color: string, icon: string): Promise<UserCategory> =>
  request("/categories", { method: "POST", body: JSON.stringify({ name, color, icon }) });

export const deleteUserCategory = (id: string): Promise<{ message: string }> =>
  request(`/categories/${id}`, { method: "DELETE" });

// ---------- Défauts catégorie -> magasin ----------

export const fetchCategoryStores = (): Promise<CategoryStoreDefault[]> => request("/category-stores");

export const setCategoryStore = (category: string, store: string): Promise<CategoryStoreDefault> =>
  request(`/category-stores/${encodeURIComponent(category)}`, {
    method: "PUT",
    body: JSON.stringify({ store }),
  });

export const deleteCategoryStore = (category: string): Promise<{ message: string }> =>
  request(`/category-stores/${encodeURIComponent(category)}`, { method: "DELETE" });

// ---------- Overrides par ingrédient ----------

export const fetchIngredientPreferences = (): Promise<IngredientPreference[]> => request("/ingredients");

export const setIngredientPreference = (
  ingredientName: string,
  patch: { store?: string | null; category?: string | null }
): Promise<IngredientPreference | { deleted: true }> =>
  request(`/ingredients/${encodeURIComponent(ingredientName)}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });

export const deleteIngredientPreference = (ingredientName: string): Promise<{ message: string }> =>
  request(`/ingredients/${encodeURIComponent(ingredientName)}`, { method: "DELETE" });
