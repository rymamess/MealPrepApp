// meals/[id].tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, Image, ActivityIndicator, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Meal } from '@/constants/mockMeals';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeal = async () => {
      try {
        const res = await fetch(`https://refactored-goldfish-jq7grq67vj5fjjg-5000.app.github.dev/meals/${id}`);
        if (!res.ok) throw new Error('Erreur lors de la récupération du repas');
        const data = await res.json();
        setMeal(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMeal();
  }, [id]);

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  if (error) return <Text style={{ flex: 1, textAlign: 'center', marginTop: 20 }}>{error}</Text>;
  if (!meal) return <Text style={{ flex: 1, textAlign: 'center', marginTop: 20 }}>Repas introuvable</Text>;

  return (
    <ThemedView style={styles.container}>
      {meal.photo ? <Image source={{ uri: meal.photo }} style={styles.image} /> : null}
      <ThemedText type="title" style={[styles.name, { color: theme.text }]}>{meal.name}</ThemedText>
      <ThemedText style={{ color: theme.text }}>{`Prep: ${meal.prepTime} min | Cook: ${meal.cookTime} min | Difficulty: ${meal.difficulty}`}</ThemedText>
      
      <ScrollView style={styles.section}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: theme.text }]}>Ingredients:</ThemedText>
        {meal.ingredients?.map((ing, idx) => (
          <Text key={idx} style={{ color: theme.text }}>{`${ing.name} - ${ing.quantity}`}</Text>
        ))}
      </ScrollView>

      <ScrollView style={styles.section}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: theme.text }]}>Spices:</ThemedText>
        {meal.spices?.map((sp, idx) => (
          <Text key={idx} style={{ color: theme.text }}>{`${sp.name} - ${sp.quantity}`}</Text>
        ))}
      </ScrollView>

      {meal.description ? (
        <ScrollView style={styles.section}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: theme.text }]}>Description:</ThemedText>
          <Text style={{ color: theme.text }}>{meal.description}</Text>
        </ScrollView>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
});
