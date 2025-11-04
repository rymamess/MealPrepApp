import React, { useEffect, useState } from "react";
import { View, FlatList, Button, Alert, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { UserMeal } from "@/types/UserMeal";
import { deleteUserMeal, getUserMeals } from "@/services/userMealService";
import { MealCard } from "@/components/MealCard";

export default function UserMealsPage() {
  const router = useRouter();
  const [meals, setMeals] = useState<UserMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const data = await getUserMeals();
      setMeals(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert("Supprimer la recette", "Voulez-vous vraiment supprimer cette recette ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteUserMeal(id);
            setMeals(meals.filter((m) => m._id !== id));
          } catch (err: any) {
            Alert.alert("Erreur", err.message);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: UserMeal }) => (
    <View style={styles.cardWrapper}>
      <MealCard meal={item} />
      <View style={styles.actions}>
        <Button
          title="Editer"
          onPress={() => router.push({ pathname: "/userMeals/edit/[id]", params: { id: item._id } })}
        />
        <Button title="Supprimer" color="red" onPress={() => handleDelete(item._id)} />
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  if (error) return <Text style={{ flex: 1, textAlign: "center", marginTop: 20 }}>{error}</Text>;

  return (
    <View style={styles.container}>
      <Button
        title="Explorer les recettes"
        onPress={() => router.push("/meals")}
      />
      <Button title="Créer une nouvelle recette" onPress={() => router.push("/userMeals/new")} />
      <FlatList
        data={meals}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  cardWrapper: { marginBottom: 16 },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
});
