import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { MealCard } from '@/components/MealCard';
import { MealGrid } from '@/components/MealGrid';
import { SearchInput } from '@/components/SearchInput';
import { ThemedView } from '@/components/themed-view';
import { UserMealActions } from '@/components/UserMealActions';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMealCollection } from '@/hooks/useMealCollection';
import { fetchMeals, toggleFavoriteMeal } from '@/services/mealService';
import { deleteUserMeal, getUserMeals } from '@/services/userMealService';
import { Meal } from '@/types/Meal';
import { UserMeal } from '@/types/UserMeal';
import { consumePendingScrollTarget } from '@/utils/pendingScrollTarget';

type SegmentKey = 'discover' | 'personal';

type Segment = {
  key: SegmentKey;
  label: string;
};

const SEGMENTS: Segment[] = [
  { key: 'discover', label: 'Explorer' },
  { key: 'personal', label: 'Mes recettes' },
];

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [segment, setSegment] = useState<SegmentKey>('personal');
  const [search, setSearch] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [scrollToId, setScrollToId] = useState<string | undefined>();

  const publicMeals = useMealCollection(fetchMeals);
  const personalMeals = useMealCollection(getUserMeals);

  useFocusEffect(
    useCallback(() => {
      const pendingId = consumePendingScrollTarget();
      if (pendingId) {
        setSegment('personal');
        setScrollToId(pendingId);
        personalMeals.refresh();
      }
    }, [personalMeals.refresh])
  );

  const activeCollection = segment === 'discover' ? publicMeals : personalMeals;

  const activeData = useMemo(() => {
    const data = segment === 'discover' ? publicMeals.data : (personalMeals.data as Meal[]);
    const query = search.trim().toLowerCase();
    return data
      .filter((meal) => !query || meal.name.toLowerCase().includes(query))
      .filter((meal) => !showFavoritesOnly || meal.isFavorite);
  }, [segment, publicMeals.data, personalMeals.data, search, showFavoritesOnly]);

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

  const handleCreate = () => router.push('/userMeals/new');

  const handleOpenUserMeal = (id: string) => {
    router.push({ pathname: '/userMeals/[id]', params: { id } });
  };

  const confirmDelete = (id: string) => {
    Alert.alert('Supprimer la recette', 'Voulez-vous vraiment supprimer cette création ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteUserMeal(id);
            personalMeals.setData((prev) => prev.filter((meal) => meal._id !== id));
          } catch (err) {
            const message = err instanceof Error ? err.message : "Impossible de supprimer la recette";
            Alert.alert('Erreur', message);
          }
        },
      },
    ]);
  };

  const renderCard = (meal: Meal) => {
    if (segment === 'personal') {
      const userMeal = meal as UserMeal;
      return (
        <MealCard
          meal={userMeal}
          onPress={() => handleOpenUserMeal(userMeal._id)}
          isFavorite={userMeal.isFavorite}
          onToggleFavorite={() => handleToggleFavorite(userMeal)}
          footer={
            <UserMealActions
              onEdit={() => router.push({ pathname: '/userMeals/edit/[id]', params: { id: userMeal._id } })}
              onDelete={() => confirmDelete(userMeal._id)}
            />
          }
        />
      );
    }

    return <MealCard meal={meal} isFavorite={meal.isFavorite} onToggleFavorite={() => handleToggleFavorite(meal)} />;
  };

  const emptyState = search.trim()
    ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Aucun résultat pour « {search.trim()} »</Text>
          <Text style={[styles.emptyText, { color: theme.text }]}>Essaie un autre terme de recherche.</Text>
        </View>
      )
    : segment === 'discover'
    ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Aucune recette à explorer pour le moment.</Text>
          <Text style={[styles.emptyText, { color: theme.text }]}>Revenez plus tard pour découvrir de nouvelles idées !</Text>
        </View>
      )
    : (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Ajoutez votre première création</Text>
          <Text style={[styles.emptyText, { color: theme.text }]}>Utilisez le bouton « + » pour composer une nouvelle recette personnelle.</Text>
        </View>
      );

  return (
    <ThemedView safeTop style={styles.container}>
      <View style={styles.headerRow}>
        <View style={[styles.segmentedControl, { borderColor: theme.border, backgroundColor: theme.card }]}>
          {SEGMENTS.map((item) => {
            const isActive = segment === item.key;
            return (
              <Pressable
                key={item.key}
                style={[styles.segmentButton, isActive && { backgroundColor: theme.tint }]}
                onPress={() => setSegment(item.key)}
              >
                <Text
                  style={[
                    styles.segmentLabel,
                    { color: isActive ? (colorScheme === 'dark' ? '#000' : '#fff') : theme.text },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ajouter une recette"
          hitSlop={8}
          style={[styles.fab, { backgroundColor: theme.tint }]}
          onPress={handleCreate}
        >
          <Text style={[styles.fabLabel, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>+</Text>
        </Pressable>
      </View>

      <View style={styles.searchWrapper}>
        <View style={{ flex: 1 }}>
          <SearchInput value={search} onChangeText={setSearch} placeholder="Rechercher une recette…" />
        </View>
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
            color={showFavoritesOnly ? (colorScheme === 'dark' ? '#000' : '#fff') : theme.text}
          />
        </Pressable>
      </View>

      <MealGrid<Meal>
        data={activeData}
        loading={activeCollection.loading}
        error={activeCollection.error}
        keyExtractor={(item) => item._id}
        renderItem={renderCard}
        refreshing={activeCollection.refreshing}
        onRefresh={activeCollection.refresh}
        onRetry={activeCollection.retry}
        emptyState={emptyState}
        scrollToKey={segment === 'personal' ? scrollToId : undefined}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 12,
    gap: 10,
  },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fabLabel: {
    fontSize: 26,
    fontWeight: '600',
    marginTop: -2,
  },
  segmentedControl: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 20,
    padding: 6,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
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
  emptyState: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    opacity: 0.7,
  },
});
