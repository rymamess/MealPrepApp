import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MealCard } from '@/components/MealCard';
import { MealGrid } from '@/components/MealGrid';
import { ThemedView } from '@/components/themed-view';
import { UserMealActions } from '@/components/UserMealActions';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMealCollection } from '@/hooks/useMealCollection';
import { deleteUserMeal, getUserMeals } from '@/services/userMealService';
import { UserMeal } from '@/types/UserMeal';

export default function UserMealsPage() {
  const router = useRouter();
  const { data, loading, error, refresh, retry, refreshing, setData } = useMealCollection(getUserMeals);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const handleCreate = () => router.push('/userMeals/new');

  const handleOpenMeal = (id: string) => {
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
            setData((prev) => prev.filter((meal) => meal._id !== id));
          } catch (err) {
            const message = err instanceof Error ? err.message : "Impossible de supprimer la recette";
            Alert.alert('Erreur', message);
          }
        },
      },
    ]);
  };

  const renderFooter = (meal: UserMeal) => (
    <UserMealActions
      onEdit={() => router.push({ pathname: '/userMeals/edit/[id]', params: { id: meal._id } })}
      onDelete={() => confirmDelete(meal._id)}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.gridWrapper}>
        <MealGrid
          data={data}
          loading={loading}
          error={error}
          keyExtractor={(item) => item._id}
          renderItem={(item) => (
            <MealCard meal={item} onPress={() => handleOpenMeal(item._id)} footer={renderFooter(item)} />
          )}
          refreshing={refreshing}
          onRefresh={refresh}
          onRetry={retry}
          emptyState={
            <View style={styles.emptyState}>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Aucune recette personnelle</Text>
              <Text style={[styles.emptyText, { color: theme.text }]}>Créez votre première recette pour la retrouver ici.</Text>
            </View>
          }
        />
      </View>

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + 16, backgroundColor: theme.background, borderTopColor: theme.border },
        ]}
      >
        <Pressable style={[styles.primaryButton, { backgroundColor: theme.tint }]} onPress={handleCreate}>
          <Text style={[styles.primaryButtonLabel, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>+ Créer une recette</Text>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridWrapper: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  primaryButton: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
  },
  primaryButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
});
