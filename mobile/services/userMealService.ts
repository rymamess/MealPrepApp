import { API_BASE_URL } from "@/constants/config";
import { authHeaders } from "@/services/apiClient";
import { UserMeal } from "@/types/UserMeal";

// 🔹 GET all user meals
export const getUserMeals = async (): Promise<UserMeal[]> => {
  const res = await fetch(`${API_BASE_URL}/userMeals`, { headers: await authHeaders() });
  if (!res.ok) throw new Error("Erreur lors de la récupération des recettes de l'utilisateur");
  return res.json();
};

// 🔹 GET one user meal
export const getUserMeal = async (id: string): Promise<UserMeal> => {
  const res = await fetch(`${API_BASE_URL}/userMeals/${id}`, { headers: await authHeaders() });
  if (!res.ok) throw new Error("Recette introuvable");
  return res.json();
};

// 🔹 POST create a user meal (from scratch ou à partir d'un baseMealId)
export const createUserMeal = async (mealData: Partial<UserMeal>): Promise<UserMeal> => {
  const res = await fetch(`${API_BASE_URL}/userMeals`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    credentials: "include",
    body: JSON.stringify(mealData),
  });
  if (!res.ok) throw new Error("Impossible de créer la recette");
  return res.json();
};

// 🔹 PUT update a user meal
export const updateUserMeal = async (id: string, mealData: Partial<UserMeal>): Promise<UserMeal> => {
  const res = await fetch(`${API_BASE_URL}/userMeals/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    credentials: "include",
    body: JSON.stringify(mealData),
  });
  if (!res.ok) throw new Error("Impossible de mettre à jour la recette");
  return res.json();
};

// 🔹 DELETE a user meal
export const deleteUserMeal = async (id: string): Promise<{ message: string }> => {
  const res = await fetch(`${API_BASE_URL}/userMeals/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Impossible de supprimer la recette");
  return res.json();
};
