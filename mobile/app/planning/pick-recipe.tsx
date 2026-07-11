import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { MealCard } from '@/components/MealCard';
import { MealGrid } from '@/components/MealGrid';
import { SearchInput } from '@/components/SearchInput';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMealCollection } from '@/hooks/useMealCollection';
import { fetchMeals } from '@/services/mealService';
import { getUserMeals } from '@/services/userMealService';
import { MealType } from '@/types/MealPlan';
import { getContrastTextColor } from '@/utils/color';

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

  const publicMeals = useMealCollection(fetchMeals);
  const personalMeals = useMealCollection(getUserMeals);

  const activeCollection = segment === 'discover' ? publicMeals : personalMeals;
  const contrastColor = getContrastTextColor(theme.tint);

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return activeCollection.data;
    return activeCollection.data.filter((meal) => meal.name.toLowerCase().includes(query));
  }, [activeCollection.data, search]);

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
        <SearchInput value={search} onChangeText={setSearch} placeholder="Rechercher une recette…" />
      </View>

      <MealGrid
        data={filteredData}
        loading={activeCollection.loading}
        error={activeCollection.error}
        keyExtractor={(item) => item._id}
        renderItem={(item) => (
          <MealCard meal={item} onPress={() => handlePick(item._id)} />
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
    marginHorizontal: 24,
    marginBottom: 12,
  },
});
