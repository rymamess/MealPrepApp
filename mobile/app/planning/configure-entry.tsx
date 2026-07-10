import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { DateField } from '@/components/DateField';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createMealPlanEntry, updateMealPlanEntry } from '@/services/mealPlanService';
import { fetchMealById } from '@/services/mealService';
import { getUserMeal } from '@/services/userMealService';
import { MealType, PlannableItemType } from '@/types/MealPlan';
import { getContrastTextColor } from '@/utils/color';

const MEAL_TYPES: { value: MealType; label: string }[] = [
  { value: 'Breakfast', label: 'Déjeuner' },
  { value: 'Snack', label: 'Collation' },
  { value: 'Lunch', label: 'Dîner' },
  { value: 'Dinner', label: 'Souper' },
  { value: 'Dessert', label: 'Dessert' },
];

export default function ConfigureEntryScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams<{
    editId?: string;
    itemType: PlannableItemType;
    itemId: string;
    mealType: MealType;
    servings?: string;
    periodStart: string;
    periodEnd: string;
    plannedDay?: string;
  }>();

  const isEditMode = Boolean(params.editId);
  const contrastColor = getContrastTextColor(theme.tint);

  const [recipeName, setRecipeName] = useState<string | null>(null);
  const [loadingRecipe, setLoadingRecipe] = useState(true);
  const [mealType, setMealType] = useState<MealType>(params.mealType);
  const [servings, setServings] = useState(params.servings ?? '');
  const [periodStart, setPeriodStart] = useState(params.periodStart);
  const [periodEnd, setPeriodEnd] = useState(params.periodEnd);
  const [plannedDay, setPlannedDay] = useState<string | null>(params.plannedDay || null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const recipe = params.itemType === 'Meal'
          ? await fetchMealById(params.itemId)
          : await getUserMeal(params.itemId);
        setRecipeName(recipe.name);
        if (!params.servings) setServings(String(recipe.servings ?? 1));
      } catch {
        setRecipeName(null);
      } finally {
        setLoadingRecipe(false);
      }
    })();
  }, [params.itemType, params.itemId, params.servings]);

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

  const handleSubmit = async () => {
    const parsedServings = parseInt(servings, 10);
    if (!parsedServings || parsedServings < 1) {
      Alert.alert('Erreur', 'Le nombre de portions doit être au moins 1');
      return;
    }

    try {
      setSubmitting(true);
      if (isEditMode && params.editId) {
        await updateMealPlanEntry(params.editId, {
          mealType,
          servings: parsedServings,
          periodStart,
          periodEnd,
          plannedDay,
        });
      } else {
        await createMealPlanEntry({
          itemType: params.itemType,
          itemId: params.itemId,
          mealType,
          servings: parsedServings,
          periodStart,
          periodEnd,
          plannedDay,
        });
      }
      router.dismissTo('/planning');
    } catch (err) {
      Alert.alert('Erreur', err instanceof Error ? err.message : "Impossible d'enregistrer cette entrée");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.heading, { color: theme.text }]}>
          {loadingRecipe ? 'Chargement…' : recipeName ?? 'Recette'}
        </Text>

        <View style={styles.segmentBlock}>
          <Text style={[styles.label, { color: theme.text }]}>Créneau</Text>
          <View style={styles.segmentRow}>
            {MEAL_TYPES.map(({ value, label }) => {
              const isActive = mealType === value;
              return (
                <Pressable
                  key={value}
                  style={[
                    styles.segmentChip,
                    { borderColor: isActive ? theme.tint : theme.border },
                    isActive && { backgroundColor: theme.tint },
                  ]}
                  onPress={() => setMealType(value)}
                >
                  <Text style={[styles.segmentLabel, { color: isActive ? contrastColor : theme.text }]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.inputBlock}>
          <Text style={[styles.label, { color: theme.text }]}>Portions</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            keyboardType="number-pad"
            value={servings}
            onChangeText={(text) => setServings(text.replace(/[^0-9]/g, ''))}
          />
        </View>

        <View style={styles.periodRow}>
          <View style={styles.periodField}>
            <DateField label="Du" value={periodStart} onChange={handlePeriodStartChange} />
          </View>
          <View style={styles.periodField}>
            <DateField label="Au" value={periodEnd} onChange={handlePeriodEndChange} />
          </View>
        </View>

        <DateField
          label="Jour prévu (optionnel)"
          value={plannedDay}
          onChange={setPlannedDay}
          allowClear
          clearLabel="Aucun jour précis"
        />

        <Pressable
          style={[styles.submitButton, { backgroundColor: theme.tint, opacity: submitting ? 0.6 : 1 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={contrastColor} />
          ) : (
            <Text style={[styles.submitLabel, { color: contrastColor }]}>
              {isEditMode ? 'Enregistrer' : 'Ajouter au planning'}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  segmentBlock: {
    gap: 8,
  },
  segmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  segmentChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  segmentLabel: {
    fontWeight: '600',
    fontSize: 13,
  },
  inputBlock: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  periodRow: {
    flexDirection: 'row',
    gap: 12,
  },
  periodField: {
    flex: 1,
  },
  submitButton: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitLabel: {
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
