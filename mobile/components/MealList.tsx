import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View, useWindowDimensions, ActivityIndicator, Text } from 'react-native';
import { MealCard } from './MealCard';
import { Meal } from '@/constants/types'; // garder le type Meal

const SPACING = 18;
const MIN_CARD_WIDTH = 160;

export const MealList: React.FC = () => {
  const { width } = useWindowDimensions();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Calcul du nombre de colonnes selon la largeur d’écran
  const numColumns = useMemo(() => {
    return Math.max(1, Math.floor((width - SPACING) / (MIN_CARD_WIDTH + SPACING)));
  }, [width]);

  const cardWidth = useMemo(() => {
    return (width - SPACING * (numColumns + 1)) / numColumns;
  }, [width, numColumns]);

  // 🔹 Fetch des repas depuis le BE
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const res = await fetch('https://refactored-goldfish-jq7grq67vj5fjjg-5000.app.github.dev/meals'); // changer si URL publique
        if (!res.ok) throw new Error('Erreur lors de la récupération des repas');
        const data = await res.json();
        setMeals(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMeals();
  }, []);

  // 🔹 Ajouter des placeholders pour compléter la dernière ligne
  const data = useMemo(() => {
    const remainder = meals.length % numColumns;
    if (remainder === 0) return meals;
    const placeholders = Array(numColumns - remainder).fill(null);
    return [...meals, ...placeholders];
  }, [meals, numColumns]);

  const renderItem = ({ item }: { item: Meal | null }) => {
    if (!item) return <View style={[styles.cardWrapper, { width: cardWidth }]} />;
    return (
      <View style={[styles.cardWrapper, { width: cardWidth }]}>
        <MealCard meal={item} />
      </View>
    );
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  if (error) return <Text style={{ flex: 1, textAlign: 'center', marginTop: 20 }}>{error}</Text>;

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item, index) => (item ? item._id : `placeholder-${index}`)}
      numColumns={numColumns}
      contentContainerStyle={styles.container}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING,
    paddingHorizontal: SPACING / 2,
  },
  row: {
    justifyContent: 'space-between',
  },
  cardWrapper: {
    marginBottom: SPACING,
  },
});
