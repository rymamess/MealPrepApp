import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { MealCard } from '@/components/MealCard';
import { MealFilterModal } from '@/components/MealFilterModal';
import { MealGrid } from '@/components/MealGrid';
import { SearchInput } from '@/components/SearchInput';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMealCollection } from '@/hooks/useMealCollection';
import { fetchMeals, toggleFavoriteMeal } from '@/services/mealService';
import { getUserMeals } from '@/services/userMealService';
import { Meal } from '@/types/Meal';
import { MealType } from '@/types/MealPlan';
import { getContrastTextColor } from '@/utils/color';
import { DEFAULT_MEAL_FILTERS, MealFilters, countActiveMealFilters, matchesMealFilters } from '@/utils/mealFilters';

type SegmentKey = 'discover' | 'personal';

export default function PickRecipeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { mealType, periodStart, periodEnd } = useLocalSearchParams<{
    mealType: MealType;
    periodStart: string;
    periodEnd: string;
  }>();

  const [segment, setSegment] = useState<SegmentKey>('personal');
  const [search, setSearch] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [filters, setFilters] = useState<MealFilters>(DEFAULT_MEAL_FILTERS);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const publicMeals = useMealCollection(fetchMeals);
  const personalMeals = useMealCollection(getUserMeals);

  const activeCollection = segment === 'discover' ? publicMeals : personalMeals;
  const contrastColor = getContrastTextColor(theme.tint);

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();
    return activeCollection.data
      .filter((meal) => !query || meal.name.toLowerCase().includes(query))
      .filter((meal) => !showFavoritesOnly || meal.isFavorite)
      .filter((meal) => matchesMealFilters(meal, filters));
  }, [activeCollection.data, search, showFavoritesOnly, filters]);

  const toggleFavoriteInData = (mealId: string, isFavorite: boolean) => {
    if (segment === 'discover') {
      publicMeals.setData((prev) => prev.map((m) => (m._id === mealId ? { ...m, isFavorite } : m)));
    } else {
      personalMeals.setData((prev) => prev.map((m) => (m._id === mealId ? { ...m, isFavorite } : m)));
    }
  };

  const handleToggleFavorite = async (meal: Meal) => {
    const itemType = segment === 'discover' ? 'Meal' : 'UserMeal';
    toggleFavoriteInData(meal._id, !meal.isFavorite);
    try {
      await toggleFavoriteMeal(itemType, meal._id);
    } catch (err) {
      toggleFavoriteInData(meal._id, meal.isFavorite);
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Impossible de modifier les favoris');
    }
  };

  const handlePick = (mealId: string) => {
    router.push({
      pathname: '/planning/configure-entry',
      params: {
        itemType: segment === 'discover' ? 'Meal' : 'UserMeal',
        itemId: mealId,
        mealType,
        periodStart,
        periodEnd,
      },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.segmentedControl, { borderColor: theme.border, backgroundColor: theme.card }]}>
        <Pressable
          style={[styles.segmentButton, segment === 'discover' && { backgroundColor: theme.tint }]}
          onPress={() => setSegment('discover')}
        >
          <Text style={[styles.segmentLabel, { color: segment === 'discover' ? contrastColor : theme.text }]}>Explorer</Text>
        </Pressable>
        <Pressable
          style={[styles.segmentButton, segment === 'personal' && { backgroundColor: theme.tint }]}
          onPress={() => setSegment('personal')}
        >
          <Text style={[styles.segmentLabel, { color: segment === 'personal' ? contrastColor : theme.text }]}>Mes recettes</Text>
        </Pressable>
      </View>

      <View style={styles.searchWrapper}>
        <View style={{ flex: 1 }}>
          <SearchInput value={search} onChangeText={setSearch} placeholder="Rechercher une recette…" />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filtrer les recettes"
          hitSlop={8}
          style={[
            styles.favoritesFilterButton,
            { borderColor: theme.border, backgroundColor: countActiveMealFilters(filters) > 0 ? theme.tint : theme.card },
          ]}
          onPress={() => setFilterModalVisible(true)}
        >
          <MaterialCommunityIcons
            name="tune-variant"
            size={20}
            color={countActiveMealFilters(filters) > 0 ? contrastColor : theme.text}
          />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Afficher uniquement les favoris"
          hitSlop={8}
          style={[
            styles.favoritesFilterButton,
            { borderColor: theme.border, backgroundColor: showFavoritesOnly ? theme.tint : theme.card },
          ]}
          onPress={() => setShowFavoritesOnly((v) => !v)}
        >
          <MaterialCommunityIcons
            name={showFavoritesOnly ? 'heart' : 'heart-outline'}
            size={20}
            color={showFavoritesOnly ? contrastColor : theme.text}
          />
        </Pressable>
      </View>

      <MealFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={filters}
        onChange={setFilters}
      />

      <MealGrid
        data={filteredData}
        loading={activeCollection.loading}
        error={activeCollection.error}
        keyExtractor={(item) => item._id}
        renderItem={(item) => (
          <MealCard
            meal={item}
            onPress={() => handlePick(item._id)}
            isFavorite={item.isFavorite}
            onToggleFavorite={() => handleToggleFavorite(item)}
          />
        )}
        refreshing={activeCollection.refreshing}
        onRefresh={activeCollection.refresh}
        onRetry={activeCollection.retry}
        emptyState={
          <Text style={{ color: theme.text, textAlign: 'center' }}>
            {search.trim() ? `Aucun résultat pour « ${search.trim()} »` : 'Aucune recette disponible.'}
          </Text>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 20,
    padding: 6,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
    marginBottom: 12,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 24,
    marginBottom: 12,
  },
  favoritesFilterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
