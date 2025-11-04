import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { MealCard } from '@/components/MealCard';
import { MealGrid } from '@/components/MealGrid';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMealCollection } from '@/hooks/useMealCollection';
import { fetchMeals } from '@/services/mealService';
import { ThemedView } from '@/components/themed-view';

export default function MealsScreen() {
  const { data, loading, error, refresh, retry, refreshing } = useMealCollection(fetchMeals);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Explorer les recettes</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>Des idées fraîches pour vos prochains repas.</Text>
      </View>

      <MealGrid
        data={data}
        loading={loading}
        error={error}
        keyExtractor={(item) => item._id}
        renderItem={(item) => <MealCard meal={item} />}
        refreshing={refreshing}
        onRefresh={refresh}
        onRetry={retry}
        emptyState={<Text style={[styles.emptyText, { color: theme.text }]}>Aucune recette disponible pour le moment.</Text>}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 16,
  },
});
