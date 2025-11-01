import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Meal } from '@/types/Meal';
import { ThemedView } from './themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

type Props = {
  meal: Meal;
};

export const MealCard: React.FC<Props> = ({ meal }) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <Pressable
      style={[
        styles.card,
        { borderColor: theme.border, backgroundColor: theme.card },
      ]}
      onPress={() => router.push(`/meals/${meal._id}`)}
    >
      <Image source={{ uri: meal.photo }} style={styles.image} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.text }]}>{meal.name}</Text>
        <Text style={{ color: theme.text }}>{`Prep: ${meal.prepTime} | Cook: ${meal.cookTime}`}</Text>
        <Text style={{ color: theme.text }}>{`Difficulty: ${meal.difficulty}`}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
  },
  info: {
    padding: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  container: {
    flex: 1,
    maxWidth: 200,
    borderRadius: 12,
    overflow: 'hidden',
  }
});
