import { Meal } from "./Meal";

export type UserMeal = Meal & {
  _id: string;
  userId: string;          // ID du créateur
  groupId?: string;        // Optionnel : pour partager dans un groupe
  createdAt: string;       // ISO date string
  updatedAt?: string;      // Optionnel
  baseMealId?: string;
  visibility : string;
};