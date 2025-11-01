import React from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { UserMeal } from '@/types/UserMeal';
import { MealCard } from '@/components/MealCard';

// 💡 Exemple statique pour l'instant
const dummyMeals: UserMeal[] = [
  {
    _id: '1',
    userId: '123',
    name: 'Salade de quinoa',
    photo: '',
    prepTime: '10 min',
    cookTime: '0 min',
    difficulty: 'Easy',
    servings: 2,
    category: 'Lunch',
    ingredients: [{ name: 'Quinoa', quantity: '100g' }],
    spices: [],
    description: 'Une salade rapide et saine',
    visibility: 'private',
    createdAt: new Date().toISOString(),
  },
  {
    _id: '2',
    userId: '123',
    name: 'Omelette aux herbes',
    photo: '',
    prepTime: '5 min',
    cookTime: '10 min',
    difficulty: 'Easy',
    servings: 1,
    category: 'Breakfast',
    ingredients: [{ name: 'Œufs', quantity: '2' }],
    spices: [],
    description: 'Rapide et protéinée',
    visibility: 'private',
    createdAt: new Date().toISOString(),
  },
];

export default function UserMealsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes recettes</Text>

      <FlatList
        data={dummyMeals}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <MealCard meal={item} />}
        contentContainerStyle={{ paddingBottom: 16 }}
      />

      <Button
        title="Explorer les recettes"
        onPress={() => router.push('/meals')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
});
