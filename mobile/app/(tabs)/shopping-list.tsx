import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fetchShoppingList } from '@/services/mealPlanService';
import { ShoppingList, ShoppingListItem } from '@/types/MealPlan';
import { getContrastTextColor } from '@/utils/color';
import { addDays, addWeeks, formatISODate, formatWeekRangeLabel, getStartOfWeek } from '@/utils/week';

// Les cases cochées sont un état local uniquement (non persisté côté serveur) :
// elles se réinitialisent à chaque rafraîchissement ou changement de semaine.
export default function ShoppingListScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [weekStart, setWeekStart] = useState(() => getStartOfWeek(new Date()));
  const [data, setData] = useState<ShoppingList>({ ingredients: [], spices: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchShoppingList(formatISODate(weekStart), formatISODate(addDays(weekStart, 6)));
      setData(result);
      setChecked(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const toggleChecked = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const contrastColor = getContrastTextColor(theme.tint);

  const renderSection = (title: string, items: ShoppingListItem[], prefix: string) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      {items.length === 0 ? (
        <Text style={[styles.emptyText, { color: `${theme.text}88` }]}>Rien pour cette semaine.</Text>
      ) : (
        items.map((item, index) => {
          const key = `${prefix}-${index}-${item.name}`;
          const isChecked = checked.has(key);
          return (
            <Pressable
              key={key}
              style={[styles.itemRow, { borderColor: theme.border }]}
              onPress={() => toggleChecked(key)}
            >
              <View style={[styles.checkbox, { borderColor: theme.border }, isChecked && { backgroundColor: theme.tint, borderColor: theme.tint }]}>
                {isChecked ? <Text style={[styles.checkmark, { color: contrastColor }]}>✓</Text> : null}
              </View>
              <Text
                style={[
                  styles.itemLabel,
                  { color: theme.text },
                  isChecked && styles.itemLabelChecked,
                ]}
              >
                {item.name} — {item.quantity} {item.unit}
              </Text>
            </Pressable>
          );
        })
      )}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.weekNav}>
        <Pressable style={[styles.navButton, { borderColor: theme.border }]} onPress={() => setWeekStart((prev) => addWeeks(prev, -1))} hitSlop={8}>
          <Text style={[styles.navButtonLabel, { color: theme.text }]}>‹</Text>
        </Pressable>
        <Text style={[styles.weekLabel, { color: theme.text }]}>{formatWeekRangeLabel(weekStart)}</Text>
        <Pressable style={[styles.navButton, { borderColor: theme.border }]} onPress={() => setWeekStart((prev) => addWeeks(prev, 1))} hitSlop={8}>
          <Text style={[styles.navButtonLabel, { color: theme.text }]}>›</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.tint} style={styles.feedback} />
      ) : error ? (
        <View style={styles.feedback}>
          <Text style={{ color: theme.text }}>{error}</Text>
          <Pressable onPress={load}>
            <Text style={{ color: theme.tint, marginTop: 8 }}>Réessayer</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {renderSection('Ingrédients', data.ingredients, 'ing')}
          {renderSection('Épices', data.spices, 'sp')}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  weekLabel: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  feedback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 24,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  emptyText: {
    fontSize: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 14,
    fontWeight: '700',
  },
  itemLabel: {
    fontSize: 15,
    flex: 1,
  },
  itemLabelChecked: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
});
