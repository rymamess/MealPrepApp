import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

import { DateField } from '@/components/DateField';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMealCollection } from '@/hooks/useMealCollection';
import { deleteMealPlanEntry, fetchMealPlan } from '@/services/mealPlanService';
import { MealPlanEntry, MealType } from '@/types/MealPlan';
import { addDays, formatDayLabel, formatISODate, parseISODate } from '@/utils/week';

const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: 'Breakfast', label: 'Déjeuner' },
  { value: 'Snack', label: 'Collation' },
  { value: 'Lunch', label: 'Dîner' },
  { value: 'Dinner', label: 'Souper' },
  { value: 'Dessert', label: 'Dessert' },
];

export default function PlanningScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [periodStart, setPeriodStart] = useState(() => formatISODate(new Date()));
  const [periodEnd, setPeriodEnd] = useState(() => formatISODate(addDays(new Date(), 6)));

  const fetcher = useCallback(() => fetchMealPlan(periodStart, periodEnd), [periodStart, periodEnd]);
  const { data, loading, error, refresh, retry } = useMealCollection<MealPlanEntry>(fetcher);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const groupedByMealType = useMemo(() => {
    const groups = new Map<MealType, MealPlanEntry[]>();
    for (const { value } of MEAL_TYPES) groups.set(value, []);
    for (const entry of data) {
      groups.get(entry.mealType)?.push(entry);
    }
    return groups;
  }, [data]);

  const handleAdd = (mealType: MealType) => {
    router.push({
      pathname: '/planning/pick-recipe',
      params: { mealType, periodStart, periodEnd },
    });
  };

  const handleRemove = (entry: MealPlanEntry) => {
    Alert.alert('Retirer du planning', 'Retirer cette recette du planning ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Retirer',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMealPlanEntry(entry._id);
            refresh();
          } catch (err) {
            Alert.alert('Erreur', err instanceof Error ? err.message : 'Impossible de retirer cette recette');
          }
        },
      },
    ]);
  };

  // 'YYYY-MM-DD' se compare lexicographiquement comme des dates : pas besoin de parser.
  const handlePeriodStartChange = (value: string | null) => {
    if (!value) return;
    setPeriodStart(value);
    if (value > periodEnd) setPeriodEnd(value);
  };

  const handlePeriodEndChange = (value: string | null) => {
    if (!value) return;
    setPeriodEnd(value);
    if (value < periodStart) setPeriodStart(value);
  };

  const handleEdit = (entry: MealPlanEntry) => {
    router.push({
      pathname: '/planning/configure-entry',
      params: {
        editId: entry._id,
        itemType: entry.itemType,
        itemId: typeof entry.itemId === 'string' ? entry.itemId : entry.itemId._id,
        mealType: entry.mealType,
        servings: String(entry.servings),
        // Le serveur renvoie des ISO complets ("...T00:00:00.000Z") ; on ne garde
        // que la partie date pour rester au format 'YYYY-MM-DD' attendu par DateField
        // et par le payload de createMealPlanEntry/updateMealPlanEntry.
        periodStart: entry.periodStart.slice(0, 10),
        periodEnd: entry.periodEnd.slice(0, 10),
        plannedDay: entry.plannedDay ? entry.plannedDay.slice(0, 10) : '',
      },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.periodRow}>
        <View style={styles.periodField}>
          <DateField label="Du" value={periodStart} onChange={handlePeriodStartChange} />
        </View>
        <View style={styles.periodField}>
          <DateField label="Au" value={periodEnd} onChange={handlePeriodEndChange} />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.tint} style={styles.feedback} />
      ) : error ? (
        <View style={styles.feedback}>
          <Text style={{ color: theme.text }}>{error}</Text>
          <Pressable onPress={retry}>
            <Text style={{ color: theme.tint, marginTop: 8 }}>Réessayer</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.groups}>
          {MEAL_TYPES.map(({ value, label }) => {
            const entries = groupedByMealType.get(value) ?? [];
            return (
              <View key={value} style={[styles.groupCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.groupHeader}>
                  <Text style={[styles.groupLabel, { color: theme.text }]}>{label}</Text>
                  <Pressable onPress={() => handleAdd(value)} hitSlop={8}>
                    <Text style={[styles.addLabel, { color: theme.tint }]}>+ Ajouter</Text>
                  </Pressable>
                </View>

                {entries.length === 0 ? (
                  <Text style={[styles.emptyText, { color: `${theme.text}80` }]}>Rien de prévu.</Text>
                ) : (
                  entries.map((entry) => {
                    const recipe = entry.itemId;
                    const recipeName = recipe && typeof recipe === 'object' ? recipe.name : null;
                    return (
                      <View key={entry._id} style={[styles.entryRow, { borderColor: theme.border }]}>
                        <View style={styles.entryInfo}>
                          <Text style={[styles.entryName, { color: theme.text }]} numberOfLines={1}>
                            {recipeName ?? 'Recette supprimée'}
                          </Text>
                          <Text style={[styles.entryMeta, { color: `${theme.text}88` }]}>
                            {entry.servings} portion{entry.servings > 1 ? 's' : ''}
                            {entry.plannedDay ? ` · ${formatDayLabel(parseISODate(entry.plannedDay))} ${parseISODate(entry.plannedDay).getDate()}` : ''}
                          </Text>
                        </View>
                        <View style={styles.entryActions}>
                          <Pressable onPress={() => handleEdit(entry)} hitSlop={8}>
                            <Text style={[styles.actionLabel, { color: theme.tint }]}>Modifier</Text>
                          </Pressable>
                          <Pressable onPress={() => handleRemove(entry)} hitSlop={8}>
                            <Text style={[styles.actionLabel, { color: '#d64545' }]}>Retirer</Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  periodRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  periodField: {
    flex: 1,
  },
  feedback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groups: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 16,
  },
  groupCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupLabel: {
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  addLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  entryInfo: {
    flex: 1,
    gap: 2,
  },
  entryName: {
    fontSize: 15,
    fontWeight: '600',
  },
  entryMeta: {
    fontSize: 12,
  },
  entryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
