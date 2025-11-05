import React from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Meal } from '@/types/Meal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type Props = {
  meal?: Meal | null;
  loading: boolean;
  error?: string | null;
};

export const MealDetailContent: React.FC<Props> = ({ meal, loading, error }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  if (error) {
    return <Text style={{ flex: 1, textAlign: 'center', marginTop: 20 }}>{error}</Text>;
  }

  if (!meal) {
    return <Text style={{ flex: 1, textAlign: 'center', marginTop: 20 }}>Repas introuvable</Text>;
  }

  return (
    <ThemedView style={styles.container}>
      {meal.photo ? <Image source={{ uri: meal.photo }} style={styles.image} /> : null}

      <ThemedText type="title" style={styles.name}>
        {meal.name}
      </ThemedText>

      <ThemedText style={{ color: theme.text }}>
        {`Prep: ${meal.prepTime} min | Cook: ${meal.cookTime} min | Difficulty: ${meal.difficulty}`}
      </ThemedText>

      <ScrollView style={styles.section}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: theme.text }]}>
          Ingredients:
        </ThemedText>
        {meal.ingredients?.map((ing, idx) => (
          <Text key={idx} style={{ color: theme.text }}>{`${ing.name} - ${ing.quantity}`}</Text>
        ))}
      </ScrollView>

      <ScrollView style={styles.section}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: theme.text }]}>
          Spices:
        </ThemedText>
        {meal.spices?.map((sp, idx) => (
          <Text key={idx} style={{ color: theme.text }}>{`${sp.name} - ${sp.quantity}`}</Text>
        ))}
      </ScrollView>

      {meal.description ? (
        <ScrollView style={styles.section}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: theme.text }]}>
            Description:
          </ThemedText>
          <Text style={{ color: theme.text }}>{meal.description}</Text>
        </ScrollView>
      ) : null}
    </ThemedView>
  );
};

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
