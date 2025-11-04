import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { UserMeal } from '@/types/UserMeal';
import { MealCard } from '@/components/MealCard';
import { getUserMeals } from '@/services/userMealService';

export default function UserMealsScreen() {
  const router = useRouter();
  const [meals, setMeals] = useState<UserMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Récupération des recettes utilisateur
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const data = await getUserMeals();
        setMeals(data);
      } catch (err: any) {
        console.error('Erreur fetch userMeals:', err);
        setError(err.message || 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1, marginTop: 40 }} />;
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (meals.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Aucune recette enregistrée 😕</Text>
        <Button title="Créer une recette" onPress={() => router.push('/userMeals/new')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes recettes</Text>

      <FlatList
        data={meals}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <MealCard meal={item} />}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      />

      <Button title="Créer une recette" onPress={() => router.push('/userMeals/new')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: 'red', fontSize: 16, textAlign: 'center' },
});
