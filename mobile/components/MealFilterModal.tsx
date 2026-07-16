import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { MultiSegmentedControl, SegmentedControl, SegmentOption } from '@/components/SegmentedControl';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DIFFICULTY_LABELS, Difficulty, MEAL_CATEGORY_LABELS, MealCategory } from '@/types/Meal';
import { DEFAULT_MEAL_FILTERS, MealFilters, countActiveMealFilters } from '@/utils/mealFilters';

type Props = {
  visible: boolean;
  onClose: () => void;
  filters: MealFilters;
  onChange: (filters: MealFilters) => void;
};

const CATEGORY_OPTIONS: SegmentOption<MealCategory>[] = (
  Object.keys(MEAL_CATEGORY_LABELS) as MealCategory[]
).map((value) => ({ label: MEAL_CATEGORY_LABELS[value], value }));

const DIFFICULTY_OPTIONS: SegmentOption<Difficulty>[] = (
  Object.keys(DIFFICULTY_LABELS) as Difficulty[]
).map((value) => ({ label: DIFFICULTY_LABELS[value], value }));

type CookTimeKey = 'all' | '15' | '30' | '60';

const COOK_TIME_OPTIONS: SegmentOption<CookTimeKey>[] = [
  { label: 'Tous', value: 'all' },
  { label: '≤ 15 min', value: '15' },
  { label: '≤ 30 min', value: '30' },
  { label: '≤ 60 min', value: '60' },
];

export function MealFilterModal({ visible, onClose, filters, onChange }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const cookTimeValue: CookTimeKey = filters.maxCookTime == null ? 'all' : (String(filters.maxCookTime) as CookTimeKey);

  const activeCount = countActiveMealFilters(filters);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ThemedView safeTop style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Filtres</Text>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => onChange(DEFAULT_MEAL_FILTERS)}
              disabled={activeCount === 0}
              hitSlop={8}
              style={[styles.resetButton, { borderColor: theme.border, opacity: activeCount === 0 ? 0.4 : 1 }]}
            >
              <Text style={[styles.resetLabel, { color: theme.tint }]}>Réinitialiser</Text>
            </Pressable>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={[styles.closeLabel, { color: theme.tint }]}>Fermer</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Catégorie</Text>
            <MultiSegmentedControl
              options={CATEGORY_OPTIONS}
              value={filters.categories}
              onChange={(categories) => onChange({ ...filters, categories })}
              themeTint={theme.tint}
              themeText={theme.text}
              allowEmpty
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Difficulté</Text>
            <MultiSegmentedControl
              options={DIFFICULTY_OPTIONS}
              value={filters.difficulties}
              onChange={(difficulties) => onChange({ ...filters, difficulties })}
              themeTint={theme.tint}
              themeText={theme.text}
              allowEmpty
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Temps de cuisson</Text>
            <SegmentedControl
              options={COOK_TIME_OPTIONS}
              value={cookTimeValue}
              onChange={(value) => onChange({ ...filters, maxCookTime: value === 'all' ? null : Number(value) })}
              themeTint={theme.tint}
              themeText={theme.text}
            />
          </View>
        </View>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  resetButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  content: {
    paddingHorizontal: 24,
    gap: 24,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  resetLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
