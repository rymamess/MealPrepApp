import React from 'react';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { MealList } from '@/components/MealList';

export default function MealsScreen() {
  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Mes Recettes</ThemedText>
      <MealList />
    </ThemedView>
  );
}
