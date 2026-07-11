import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { IngredientPickerModal } from '@/components/IngredientPickerModal';
import { PeriodPicker } from '@/components/PeriodPicker';
import { SelectField } from '@/components/SelectField';
import { ThemedView } from '@/components/themed-view';
import { getCategoryMeta, IngredientCategory, INGREDIENT_CATEGORIES } from '@/constants/ingredientCategories';
import { Colors } from '@/constants/theme';
import { usePlanningPeriod } from '@/contexts/PlanningPeriodContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fetchShoppingList } from '@/services/mealPlanService';
import { createManualShoppingItem, deleteManualShoppingItem } from '@/services/shoppingListItemService';
import { ShoppingListItem } from '@/types/MealPlan';
import { Unit, UNITS } from '@/types/Meal';
import { getContrastTextColor } from '@/utils/color';

const UNIT_OPTIONS = UNITS.map((unit) => ({ label: unit, value: unit }));

type PendingIngredient = { name: string; category: IngredientCategory };

// Les cases cochées sont un état local uniquement (non persisté côté serveur) :
// elles se réinitialisent à chaque rafraîchissement ou changement de période.
// Les items ajoutés manuellement, eux, sont bien persistés (server/models/ManualShoppingItem.js).
export default function ShoppingListScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const { periodStart, periodEnd, setPeriodStart, setPeriodEnd } = usePlanningPeriod();
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pendingIngredient, setPendingIngredient] = useState<PendingIngredient | null>(null);
  const [pendingQuantity, setPendingQuantity] = useState('1');
  const [pendingUnit, setPendingUnit] = useState<Unit>('unité');
  const [submittingManual, setSubmittingManual] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchShoppingList(periodStart, periodEnd);
      setItems(result);
      setChecked(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [periodStart, periodEnd]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const groupedByCategory = useMemo(() => {
    const groups = new Map<IngredientCategory, ShoppingListItem[]>();
    for (const category of INGREDIENT_CATEGORIES) groups.set(category, []);
    for (const item of items) groups.get(item.category)?.push(item);
    return groups;
  }, [items]);

  const rowKey = (item: ShoppingListItem) =>
    item.id ? `item-${item.id}` : `recipe-${item.category}-${item.name}-${item.unit}`;

  const toggleChecked = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handlePickIngredient = (name: string, category: IngredientCategory) => {
    setPendingQuantity('1');
    setPendingUnit('unité');
    setPendingIngredient({ name, category });
  };

  const handleConfirmAddIngredient = async () => {
    if (!pendingIngredient) return;
    const quantity = parseFloat(pendingQuantity.replace(',', '.'));
    if (!quantity || quantity <= 0) {
      Alert.alert('Erreur', 'La quantité doit être supérieure à 0');
      return;
    }
    try {
      setSubmittingManual(true);
      await createManualShoppingItem({
        name: pendingIngredient.name,
        category: pendingIngredient.category,
        quantity,
        unit: pendingUnit,
        periodStart,
        periodEnd,
      });
      setPendingIngredient(null);
      load();
    } catch (err) {
      Alert.alert('Erreur', err instanceof Error ? err.message : "Impossible d'ajouter cet ingrédient");
    } finally {
      setSubmittingManual(false);
    }
  };

  const handleRemoveManual = (item: ShoppingListItem) => {
    if (!item.id) return;
    Alert.alert('Retirer de la liste', `Retirer "${item.name}" de la liste de courses ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Retirer',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteManualShoppingItem(item.id!);
            load();
          } catch (err) {
            Alert.alert('Erreur', err instanceof Error ? err.message : 'Impossible de retirer cet ingrédient');
          }
        },
      },
    ]);
  };

  const contrastColor = getContrastTextColor(theme.tint);

  return (
    <ThemedView safeTop style={styles.container}>
      <PeriodPicker
        periodStart={periodStart}
        periodEnd={periodEnd}
        onChangeStart={setPeriodStart}
        onChangeEnd={setPeriodEnd}
      />

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
          {INGREDIENT_CATEGORIES.map((category) => {
            const categoryItems = groupedByCategory.get(category) ?? [];
            if (categoryItems.length === 0) return null;
            const meta = getCategoryMeta(category);

            return (
              <View key={category} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.iconBadge, { backgroundColor: meta.color }]}>
                    <MaterialCommunityIcons name={meta.icon as any} size={16} color={getContrastTextColor(meta.color)} />
                  </View>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>{meta.label}</Text>
                </View>

                {categoryItems.map((item) => {
                  const key = rowKey(item);
                  const isChecked = checked.has(key);
                  return (
                    <Pressable
                      key={key}
                      style={[styles.itemRow, { borderColor: theme.border }]}
                      onPress={() => toggleChecked(key)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          { borderColor: theme.border },
                          isChecked && { backgroundColor: theme.tint, borderColor: theme.tint },
                        ]}
                      >
                        {isChecked ? <Text style={[styles.checkmark, { color: contrastColor }]}>✓</Text> : null}
                      </View>
                      <Text
                        style={[styles.itemLabel, { color: theme.text }, isChecked && styles.itemLabelChecked]}
                      >
                        {item.name} — {item.quantity} {item.unit}
                      </Text>
                      {item.id ? (
                        <Pressable onPress={() => handleRemoveManual(item)} hitSlop={8}>
                          <Text style={[styles.removeLabel, { color: '#d64545' }]}>Retirer</Text>
                        </Pressable>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            );
          })}

          {items.length === 0 ? (
            <Text style={[styles.emptyText, { color: `${theme.text}88` }]}>Rien pour cette période.</Text>
          ) : null}

          <Pressable style={[styles.addButton, { borderColor: theme.border }]} onPress={() => setPickerVisible(true)}>
            <Text style={[styles.addLabel, { color: theme.tint }]}>+ Ajouter un ingrédient</Text>
          </Pressable>
        </ScrollView>
      )}

      <IngredientPickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={handlePickIngredient}
      />

      <Modal visible={pendingIngredient !== null} transparent animationType="fade" onRequestClose={() => setPendingIngredient(null)}>
        <Pressable style={styles.quantityBackdrop} onPress={() => setPendingIngredient(null)}>
          <Pressable style={[styles.quantityCard, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={(e) => e.stopPropagation()}>
            <Text style={[styles.quantityTitle, { color: theme.text }]}>{pendingIngredient?.name}</Text>
            <View style={styles.quantityRow}>
              <TextInput
                style={[styles.quantityInput, { borderColor: theme.border, color: theme.text }]}
                keyboardType="decimal-pad"
                value={pendingQuantity}
                onChangeText={(text) => setPendingQuantity(text.replace(/[^0-9.,]/g, ''))}
                autoFocus
              />
              <View style={styles.quantityUnit}>
                <SelectField value={pendingUnit} options={UNIT_OPTIONS} onChange={setPendingUnit} />
              </View>
            </View>
            <Pressable
              style={[styles.quantitySubmit, { backgroundColor: theme.tint, opacity: submittingManual ? 0.6 : 1 }]}
              onPress={handleConfirmAddIngredient}
              disabled={submittingManual}
            >
              <Text style={[styles.quantitySubmitLabel, { color: getContrastTextColor(theme.tint) }]}>
                {submittingManual ? 'Ajout…' : 'Ajouter à la liste'}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    gap: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  iconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
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
  removeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  addButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  quantityBackdrop: {
    flex: 1,
    backgroundColor: '#00000066',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  quantityCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    gap: 16,
  },
  quantityTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  quantityRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quantityInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  quantityUnit: {
    flex: 1.2,
  },
  quantitySubmit: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  quantitySubmitLabel: {
    fontWeight: '700',
    fontSize: 14,
  },
});
