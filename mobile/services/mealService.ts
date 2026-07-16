import { Meal } from '@/types/Meal';
import { API_BASE_URL } from "@/constants/config";
import { authHeaders } from "@/services/apiClient";

// 🔹 Récupérer tous les repas
export const fetchMeals = async (): Promise<Meal[]> => {
  const res = await fetch(`${API_BASE_URL}/meals`, { headers: await authHeaders() });
  if (!res.ok) throw new Error('Erreur lors de la récupération des repas');
  return res.json();
};

// 🔹 Récupérer un repas par ID
export const fetchMealById = async (id: string): Promise<Meal> => {
  const res = await fetch(`${API_BASE_URL}/meals/${id}`);
  if (!res.ok) throw new Error('Erreur lors de la récupération du repas');
  return res.json();
};

// 🔹 Créer un repas (utile pour admin ou test)
export const createMeal = async (meal: Partial<Meal>): Promise<Meal> => {
  const res = await fetch(`${API_BASE_URL}/meals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify(meal),
  });
  if (!res.ok) throw new Error('Erreur lors de la création du repas');
  return res.json();
};

// 🔹 Basculer une recette (Meal ou UserMeal) en favori / retirer des favoris
export const toggleFavoriteMeal = async (
  itemType: 'Meal' | 'UserMeal',
  itemId: string
): Promise<{ isFavorite: boolean }> => {
  const res = await fetch(`${API_BASE_URL}/meals/favorites/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify({ itemType, itemId }),
  });
  if (!res.ok) throw new Error('Impossible de modifier les favoris');
  return res.json();
};
