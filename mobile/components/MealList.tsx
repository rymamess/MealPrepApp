import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { MealCard } from './MealCard';
import { MOCK_MEALS } from '@/constants/mockMeals';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export const MealList: React.FC = () => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      {MOCK_MEALS.map((meal) => (
        <MealCard key={meal.id} meal={meal} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
