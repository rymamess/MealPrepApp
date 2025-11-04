import React, { useEffect, useState } from "react";
import { Alert, ActivityIndicator, Text, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { UserMealForm } from "@/components/UserMealForm";
import { getUserMeal, updateUserMeal } from "@/services/userMealService";
import { UserMeal } from "@/types/UserMeal";

export default function EditUserMealPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [meal, setMeal] = useState<Partial<UserMeal> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchMeal = async () => {
      try {
        setLoading(true);
        const data = await getUserMeal(id);
        setMeal(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMeal();
  }, [id]);

  const handleChange = (key: keyof UserMeal, value: any) => {
    if (meal) setMeal({ ...meal, [key]: value });
  };

  const handleSave = async () => {
    if (!meal) return;
    try {
      if (!meal.name) {
        Alert.alert("Erreur", "Le nom de la recette est requis");
        return;
      }
      await updateUserMeal(id, meal as UserMeal);
      router.push("/userMeals");
    } catch (err: any) {
      Alert.alert("Erreur", err.message);
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  if (error) return <Text style={{ flex: 1, textAlign: "center", marginTop: 20 }}>{error}</Text>;
  if (!meal) return <View />;

  return (
    <UserMealForm
      meal={meal}
      onChange={handleChange}
      onSubmit={handleSave}
      submitLabel="Mettre à jour la recette"
    />
  );
}
