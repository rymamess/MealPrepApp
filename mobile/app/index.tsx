import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { MealCard } from '@/components/MealCard';
import { MealGrid } from '@/components/MealGrid';
import { ThemedView } from '@/components/themed-view';
import { UserMealActions } from '@/components/UserMealActions';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMealCollection } from '@/hooks/useMealCollection';
import { fetchMeals } from '@/services/mealService';
import { deleteUserMeal, getUserMeals } from '@/services/userMealService';
import { Meal } from '@/types/Meal';
import { UserMeal } from '@/types/UserMeal';

type SegmentKey = 'discover' | 'personal';

type Segment = {
  key: SegmentKey;
  label: string;
  description: string;
};

const SEGMENTS: Segment[] = [
  {
    key: 'discover',
    label: 'Explorer',
    description: 'Découvrez les recettes inspirantes de la communauté.',
  },
  {
    key: 'personal',
    label: 'Mes recettes',
    description: 'Retrouvez vos propres créations et mettez-les à jour.',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [segment, setSegment] = useState<SegmentKey>('discover');

  const publicMeals = useMealCollection(fetchMeals);
  const personalMeals = useMealCollection(getUserMeals);

  const activeCollection = segment === 'discover' ? publicMeals : personalMeals;

  const activeData = useMemo(() => {
    return segment === 'discover' ? publicMeals.data : (personalMeals.data as Meal[]);
  }, [segment, publicMeals.data, personalMeals.data]);

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
          footer={
            <UserMealActions
              onEdit={() => router.push({ pathname: '/userMeals/edit/[id]', params: { id: userMeal._id } })}
              onDelete={() => confirmDelete(userMeal._id)}
            />
          }
        />
      );
    }

    return <MealCard meal={meal} />;
  };

  const emptyState = segment === 'discover'
    ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Aucune recette à explorer pour le moment.</Text>
          <Text style={[styles.emptyText, { color: theme.text }]}>Revenez plus tard pour découvrir de nouvelles idées !</Text>
        </View>
      )
    : (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Ajoutez votre première création</Text>
          <Text style={[styles.emptyText, { color: theme.text }]}>Utilisez le bouton « + » pour composer une nouvelle recette personnelle.</Text>
        </View>
      );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.topBar, { borderColor: `${theme.border}66`, backgroundColor: theme.card }]}>
        <View style={styles.topBarCopy}>
          <Text style={[styles.topBarLabel, { color: theme.text }]}>Recettes</Text>
          <Text style={[styles.topBarSubtitle, { color: theme.text }]}>Explorez la communauté ou organisez vos propres plats.</Text>
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
              <Text style={[styles.segmentDescription, { color: isActive ? (colorScheme === 'dark' ? '#000' : '#fff') : theme.text }]}>
                {item.description}
              </Text>
            </Pressable>
          );
        })}
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
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
    padding: 20,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  topBarCopy: {
    flex: 1,
    gap: 4,
  },
  topBarLabel: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  topBarSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.75,
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fabLabel: {
    fontSize: 28,
    fontWeight: '600',
    marginTop: -4,
  },
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 6,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
    marginBottom: 12,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    justifyContent: 'center',
    gap: 4,
  },
  segmentLabel: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  segmentDescription: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
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
