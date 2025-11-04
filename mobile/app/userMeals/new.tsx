import React, { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { UserMealForm } from "@/components/UserMealForm";
import { createUserMeal } from "@/services/userMealService";
import { UserMeal } from "@/types/UserMeal";

export default function NewUserMealPage() {
  const router = useRouter();
  const [meal, setMeal] = useState<Partial<UserMeal>>({
    name: "",
    photo: "",
    category: "Lunch",
    prepTime: "0",
    cookTime: "0",
    difficulty: "Easy",
    servings: 1,
    ingredients: [],
    spices: [],
    description: "",
    visibility: "private",
  });

  const handleChange = (key: keyof UserMeal, value: any) => setMeal({ ...meal, [key]: value });

  const handleSave = async () => {
    try {
      if (!meal.name) {
        Alert.alert("Erreur", "Le nom de la recette est requis");
        return;
      }
      await createUserMeal(meal as UserMeal);
      router.push("/userMeals");
    } catch (err: any) {
      Alert.alert("Erreur", err.message);
    }
  };

  return <UserMealForm meal={meal} onChange={handleChange} onSubmit={handleSave} submitLabel="Créer la recette" />;
}