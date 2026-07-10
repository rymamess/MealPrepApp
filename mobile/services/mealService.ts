import { Meal } from '@/types/Meal';
import { API_BASE_URL } from "@/constants/config";
import { getToken } from "@/services/tokenStorage";

// 🔹 Récupérer tous les repas
export const fetchMeals = async (): Promise<Meal[]> => {
  const res = await fetch(`${API_BASE_URL}/meals`);
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
  const token = await getToken();
  const res = await fetch(`${API_BASE_URL}/meals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(meal),
  });
  if (!res.ok) throw new Error('Erreur lors de la création du repas');
  return res.json();
};
