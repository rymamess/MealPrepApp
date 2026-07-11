import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { SearchInput } from '@/components/SearchInput';
import { ThemedView } from '@/components/themed-view';
import { getCategoryMeta, IngredientCategory, INGREDIENT_CATEGORIES } from '@/constants/ingredientCategories';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createIngredient, fetchIngredients, toggleFavoriteIngredient } from '@/services/ingredientService';
import { CatalogIngredient } from '@/types/Ingredient';
import { getContrastTextColor } from '@/utils/color';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (name: string, category: IngredientCategory) => void;
  // Catégorie pré-sélectionnée dans le mini-formulaire "+ Nouvel ingrédient"
  // (ex: 'Spices' quand le picker est ouvert depuis la liste Épices).
  defaultCategory?: IngredientCategory;
  // Restreint les catégories affichées/sélectionnables (ex: uniquement 'Spices'
  // pour la liste Épices, ou toutes sauf 'Spices' pour la liste Ingrédients).
  // Si absent, toutes les catégories sont disponibles.
  allowedCategories?: IngredientCategory[];
};

export function IngredientPickerModal({ visible, onClose, onSelect, defaultCategory, allowedCategories }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const categories = allowedCategories ?? INGREDIENT_CATEGORIES;

  const [items, setItems] = useState<CatalogIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<IngredientCategory>(defaultCategory ?? categories[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setSearch('');
    setShowAddForm(false);
    setNewName('');
    setNewCategory(defaultCategory ?? categories[0]);
    load();
  }, [visible, defaultCategory]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchIngredients();
      setItems(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      if (!categories.includes(item.category)) return false;
      if (query && !item.name.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [items, search, categories]);

  const favorites = useMemo(() => filtered.filter((item) => item.isFavorite), [filtered]);

  const groupedByCategory = useMemo(() => {
    const groups = new Map<IngredientCategory, CatalogIngredient[]>();
    for (const category of categories) groups.set(category, []);
    for (const item of filtered) groups.get(item.category)?.push(item);
    return groups;
  }, [filtered, categories]);

  const handleToggleFavorite = async (item: CatalogIngredient) => {
    setItems((prev) =>
      prev.map((i) => (i.itemType === item.itemType && i.itemId === item.itemId ? { ...i, isFavorite: !i.isFavorite } : i))
    );
    try {
      await toggleFavoriteIngredient(item.itemType, item.itemId);
    } catch (err) {
      // Revert on failure
      setItems((prev) =>
        prev.map((i) => (i.itemType === item.itemType && i.itemId === item.itemId ? { ...i, isFavorite: item.isFavorite } : i))
      );
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Impossible de modifier les favoris');
    }
  };

  const handleSelect = (item: CatalogIngredient) => {
    onSelect(item.name, item.category);
    onClose();
  };

  const handleSubmitNew = async () => {
    if (!newName.trim()) {
      Alert.alert('Erreur', "Le nom de l'ingrédient est requis");
      return;
    }
    try {
      setSubmitting(true);
      const created = await createIngredient(newName.trim(), newCategory);
      onSelect(created.name, created.category);
      onClose();
    } catch (err) {
      Alert.alert('Erreur', err instanceof Error ? err.message : "Impossible de créer cet ingrédient");
    } finally {
      setSubmitting(false);
    }
  };

  const renderRow = (item: CatalogIngredient) => {
    const meta = getCategoryMeta(item.category);
    return (
      <View key={`${item.itemType}-${item.itemId}`} style={[styles.row, { borderColor: theme.border }]}>
        <Pressable style={styles.rowMain} onPress={() => handleSelect(item)}>
          <View style={[styles.iconBadge, { backgroundColor: meta.color }]}>
            <MaterialCommunityIcons name={meta.icon as any} size={16} color={getContrastTextColor(meta.color)} />
          </View>
          <Text style={[styles.rowLabel, { color: theme.text }]} numberOfLines={1}>
            {item.name}
          </Text>
        </Pressable>
        <Pressable onPress={() => handleToggleFavorite(item)} hitSlop={8}>
          <MaterialCommunityIcons
            name={item.isFavorite ? 'star' : 'star-outline'}
            size={20}
            color={item.isFavorite ? '#f4c542' : `${theme.text}55`}
          />
        </Pressable>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ThemedView safeTop style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Choisir un ingrédient</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={[styles.closeLabel, { color: theme.tint }]}>Fermer</Text>
          </Pressable>
        </View>

        <SearchInput
          containerStyle={styles.searchInput}
          placeholder="Rechercher un ingrédient…"
          value={search}
          onChangeText={setSearch}
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
          <ScrollView contentContainerStyle={styles.list}>
            {favorites.length > 0 ? (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>★ Favoris</Text>
                {favorites.map(renderRow)}
              </View>
            ) : null}

            {categories.map((category) => {
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
                  {categoryItems.map(renderRow)}
                </View>
              );
            })}

            {!showAddForm ? (
              <Pressable style={[styles.addButton, { borderColor: theme.border }]} onPress={() => setShowAddForm(true)}>
                <Text style={[styles.addLabel, { color: theme.tint }]}>+ Nouvel ingrédient</Text>
              </Pressable>
            ) : (
              <View style={[styles.addForm, { borderColor: theme.border, backgroundColor: theme.card }]}>
                <TextInput
                  style={[styles.searchInput, { borderColor: theme.border, color: theme.text }]}
                  placeholder="Nom de l'ingrédient"
                  placeholderTextColor={`${theme.text}55`}
                  value={newName}
                  onChangeText={setNewName}
                />
                {categories.length > 1 ? (
                <View style={styles.categoryChips}>
                  {categories.map((category) => {
                    const meta = getCategoryMeta(category);
                    const isActive = newCategory === category;
                    return (
                      <Pressable
                        key={category}
                        style={[
                          styles.categoryChip,
                          { borderColor: isActive ? meta.color : theme.border },
                          isActive && { backgroundColor: meta.color },
                        ]}
                        onPress={() => setNewCategory(category)}
                      >
                        <MaterialCommunityIcons
                          name={meta.icon as any}
                          size={14}
                          color={isActive ? getContrastTextColor(meta.color) : theme.text}
                        />
                        <Text style={[styles.categoryChipLabel, { color: isActive ? getContrastTextColor(meta.color) : theme.text }]}>
                          {meta.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                ) : null}
                <Pressable
                  style={[styles.submitButton, { backgroundColor: theme.tint, opacity: submitting ? 0.6 : 1 }]}
                  onPress={handleSubmitNew}
                  disabled={submitting}
                >
                  <Text style={[styles.submitLabel, { color: getContrastTextColor(theme.tint) }]}>
                    {submitting ? 'Création…' : 'Ajouter et sélectionner'}
                  </Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        )}
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
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  searchInput: {
    marginHorizontal: 24,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  feedback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 20,
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 15,
    flex: 1,
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
  addForm: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  categoryChipLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitButton: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitLabel: {
    fontWeight: '700',
    fontSize: 14,
  },
});
