import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { IngredientPickerModal } from '@/components/IngredientPickerModal';
import { SelectField } from '@/components/SelectField';
import { ThemedView } from '@/components/themed-view';
import { getCategoryMeta, INGREDIENT_CATEGORIES, resolveCategoryMeta } from '@/constants/ingredientCategories';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createIngredient, fetchIngredients, toggleFavoriteIngredient } from '@/services/ingredientService';
import {
  createStore,
  createUserCategory,
  deleteCategoryStore,
  deleteIngredientPreference,
  deleteStore,
  deleteUserCategory,
  fetchCategoryStores,
  fetchIngredientPreferences,
  fetchStores,
  fetchUserCategories,
  setCategoryStore,
  setIngredientPreference,
} from '@/services/preferencesService';
import { CatalogIngredient } from '@/types/Ingredient';
import { CategoryStoreDefault, IngredientPreference, Store, UserCategory } from '@/types/Preferences';
import { getContrastTextColor } from '@/utils/color';

const COLOR_CHOICES = ['#e74c3c', '#3498db', '#f4d03f', '#2ecc71', '#e67e22', '#9b59b6', '#1abc9c', '#95a5a6'];
const ICON_CHOICES = [
  'basket-outline',
  'store-outline',
  'tag-outline',
  'food-variant',
  'bottle-tonic-outline',
  'leaf',
  'ice-pop',
  'bread-slice',
];

const NO_STORE = '__none__';

export default function PreferencesScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const [loading, setLoading] = useState(true);
  const [allIngredients, setAllIngredients] = useState<CatalogIngredient[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [userCategories, setUserCategories] = useState<UserCategory[]>([]);
  const [categoryStores, setCategoryStores] = useState<CategoryStoreDefault[]>([]);
  const [ingredientPrefs, setIngredientPrefs] = useState<IngredientPreference[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ingredients, storesList, categories, catStores, prefs] = await Promise.all([
        fetchIngredients(),
        fetchStores(),
        fetchUserCategories(),
        fetchCategoryStores(),
        fetchIngredientPreferences(),
      ]);
      setAllIngredients(ingredients);
      setStores(storesList);
      setUserCategories(categories);
      setCategoryStores(catStores);
      setIngredientPrefs(prefs);
    } catch (err) {
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const favorites = useMemo(() => allIngredients.filter((i) => i.isFavorite), [allIngredients]);
  const myIngredients = useMemo(() => allIngredients.filter((i) => i.itemType === 'UserIngredient'), [allIngredients]);

  const allCategories = useMemo(
    () => [...INGREDIENT_CATEGORIES, ...userCategories.map((c) => c.name)],
    [userCategories]
  );

  const storeOptions = useMemo(
    () => [{ label: 'Aucun', value: NO_STORE }, ...stores.map((s) => ({ label: s.name, value: s.name }))],
    [stores]
  );

  const categoryStoreMap = useMemo(
    () => new Map(categoryStores.map((c) => [c.category, c.store])),
    [categoryStores]
  );

  if (loading) {
    return (
      <ThemedView style={styles.feedback}>
        <ActivityIndicator size="large" color={theme.tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <FavoritesSection theme={theme} favorites={favorites} allIngredients={allIngredients} onChanged={load} />
        <MyIngredientsSection theme={theme} ingredients={myIngredients} onChanged={load} />
        <StoresSection theme={theme} stores={stores} onChanged={load} />
        <CategoriesSection theme={theme} categories={userCategories} onChanged={load} />
        <CategoryStoreSection
          theme={theme}
          allCategories={allCategories}
          userCategories={userCategories}
          categoryStoreMap={categoryStoreMap}
          storeOptions={storeOptions}
          onChanged={load}
        />
        <IngredientOverridesSection
          theme={theme}
          prefs={ingredientPrefs}
          allCategories={allCategories}
          userCategories={userCategories}
          storeOptions={storeOptions}
          onChanged={load}
        />
      </ScrollView>
    </ThemedView>
  );
}

// ---------- Favoris ----------

function FavoritesSection({
  theme,
  favorites,
  allIngredients,
  onChanged,
}: {
  theme: (typeof Colors)['light'];
  favorites: CatalogIngredient[];
  allIngredients: CatalogIngredient[];
  onChanged: () => void;
}) {
  const [pickerVisible, setPickerVisible] = useState(false);

  const handleToggle = async (item: CatalogIngredient) => {
    try {
      await toggleFavoriteIngredient(item.itemType, item.itemId);
      onChanged();
    } catch (err) {
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Impossible de modifier les favoris');
    }
  };

  const handlePickFavorite = async (name: string, category: string) => {
    const match = allIngredients.find(
      (i) => i.name.toLowerCase() === name.toLowerCase() && i.category === category
    );
    if (!match || match.isFavorite) return;
    await handleToggle(match);
  };

  return (
    <Section theme={theme} title="Ingrédients favoris" description="Ceux que tu utilises souvent.">
      {favorites.length === 0 ? (
        <Text style={[styles.emptyText, { color: `${theme.text}88` }]}>Aucun favori pour l'instant.</Text>
      ) : (
        favorites.map((item) => {
          const meta = getCategoryMeta(item.category);
          return (
            <View key={`${item.itemType}-${item.itemId}`} style={[styles.row, { borderColor: theme.border }]}>
              <View style={[styles.iconBadge, { backgroundColor: meta.color }]}>
                <MaterialCommunityIcons name={meta.icon as any} size={16} color={getContrastTextColor(meta.color)} />
              </View>
              <Text style={[styles.rowLabel, { color: theme.text }]}>{item.name}</Text>
              <Pressable onPress={() => handleToggle(item)} hitSlop={8}>
                <MaterialCommunityIcons name="star" size={20} color="#f4c542" />
              </Pressable>
            </View>
          );
        })
      )}

      <Pressable style={[styles.addButton, { borderColor: theme.border }]} onPress={() => setPickerVisible(true)}>
        <Text style={[styles.addLabel, { color: theme.tint }]}>+ Ajouter un favori</Text>
      </Pressable>

      <IngredientPickerModal visible={pickerVisible} onClose={() => setPickerVisible(false)} onSelect={handlePickFavorite} />
    </Section>
  );
}

// ---------- Mes ingrédients ----------

const CATEGORY_OPTIONS = INGREDIENT_CATEGORIES.map((c) => ({ label: getCategoryMeta(c).label, value: c }));

function MyIngredientsSection({
  theme,
  ingredients,
  onChanged,
}: {
  theme: (typeof Colors)['light'];
  ingredients: CatalogIngredient[];
  onChanged: () => void;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<(typeof INGREDIENT_CATEGORIES)[number]>(INGREDIENT_CATEGORIES[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) return;
    try {
      setSubmitting(true);
      await createIngredient(name.trim(), category);
      setName('');
      onChanged();
    } catch (err) {
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Impossible de créer cet ingrédient');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Section theme={theme} title="Mes ingrédients" description="Ceux que tu as ajoutés toi-même, en plus du catalogue partagé.">
      {ingredients.length === 0 ? (
        <Text style={[styles.emptyText, { color: `${theme.text}88` }]}>Aucun ingrédient perso pour l'instant.</Text>
      ) : (
        ingredients.map((item) => {
          const meta = getCategoryMeta(item.category);
          return (
            <View key={`${item.itemType}-${item.itemId}`} style={[styles.row, { borderColor: theme.border }]}>
              <View style={[styles.iconBadge, { backgroundColor: meta.color }]}>
                <MaterialCommunityIcons name={meta.icon as any} size={16} color={getContrastTextColor(meta.color)} />
              </View>
              <Text style={[styles.rowLabel, { color: theme.text }]}>{item.name}</Text>
            </View>
          );
        })
      )}

      <View style={styles.inlineFormColumn}>
        <TextInput
          style={[styles.textInput, { borderColor: theme.border, color: theme.text }]}
          placeholder="Nom de l'ingrédient"
          placeholderTextColor={`${theme.text}55`}
          value={name}
          onChangeText={setName}
        />
        <SelectField value={category} options={CATEGORY_OPTIONS} onChange={setCategory} />
        <Pressable
          style={[styles.inlineButton, { backgroundColor: theme.tint, opacity: submitting ? 0.6 : 1 }]}
          onPress={handleAdd}
          disabled={submitting}
        >
          <Text style={[styles.inlineButtonLabel, { color: getContrastTextColor(theme.tint) }]}>
            {submitting ? 'Création…' : 'Ajouter cet ingrédient'}
          </Text>
        </Pressable>
      </View>
    </Section>
  );
}

// ---------- Magasins ----------

function StoresSection({
  theme,
  stores,
  onChanged,
}: {
  theme: (typeof Colors)['light'];
  stores: Store[];
  onChanged: () => void;
}) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) return;
    try {
      setSubmitting(true);
      await createStore(name.trim());
      setName('');
      onChanged();
    } catch (err) {
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Impossible de créer ce magasin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (store: Store) => {
    Alert.alert('Retirer ce magasin', `Retirer "${store.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Retirer',
        style: 'destructive',
        onPress: async () => {
          await deleteStore(store._id);
          onChanged();
        },
      },
    ]);
  };

  return (
    <Section theme={theme} title="Mes magasins" description="Juste un nom, pas besoin d'adresse.">
      {stores.length === 0 ? (
        <Text style={[styles.emptyText, { color: `${theme.text}88` }]}>Aucun magasin pour l'instant.</Text>
      ) : (
        stores.map((store) => (
          <View key={store._id} style={[styles.row, { borderColor: theme.border }]}>
            <Text style={[styles.rowLabel, { color: theme.text }]}>{store.name}</Text>
            <Pressable onPress={() => handleDelete(store)} hitSlop={8}>
              <Text style={[styles.removeLabel, { color: '#d64545' }]}>Retirer</Text>
            </Pressable>
          </View>
        ))
      )}

      <View style={styles.inlineForm}>
        <TextInput
          style={[styles.textInput, { borderColor: theme.border, color: theme.text }]}
          placeholder="Nom du magasin"
          placeholderTextColor={`${theme.text}55`}
          value={name}
          onChangeText={setName}
        />
        <Pressable
          style={[styles.inlineButton, { backgroundColor: theme.tint, opacity: submitting ? 0.6 : 1 }]}
          onPress={handleAdd}
          disabled={submitting}
        >
          <Text style={[styles.inlineButtonLabel, { color: getContrastTextColor(theme.tint) }]}>Ajouter</Text>
        </Pressable>
      </View>
    </Section>
  );
}

// ---------- Catégories personnelles ----------

function CategoriesSection({
  theme,
  categories,
  onChanged,
}: {
  theme: (typeof Colors)['light'];
  categories: UserCategory[];
  onChanged: () => void;
}) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLOR_CHOICES[0]);
  const [icon, setIcon] = useState(ICON_CHOICES[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) return;
    try {
      setSubmitting(true);
      await createUserCategory(name.trim(), color, icon);
      setName('');
      onChanged();
    } catch (err) {
      Alert.alert('Erreur', err instanceof Error ? err.message : 'Impossible de créer cette catégorie');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (category: UserCategory) => {
    Alert.alert('Retirer cette catégorie', `Retirer "${category.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Retirer',
        style: 'destructive',
        onPress: async () => {
          await deleteUserCategory(category._id);
          onChanged();
        },
      },
    ]);
  };

  return (
    <Section theme={theme} title="Mes catégories" description="En plus des catégories déjà proposées.">
      {categories.length === 0 ? (
        <Text style={[styles.emptyText, { color: `${theme.text}88` }]}>Aucune catégorie perso pour l'instant.</Text>
      ) : (
        categories.map((category) => (
          <View key={category._id} style={[styles.row, { borderColor: theme.border }]}>
            <View style={[styles.iconBadge, { backgroundColor: category.color }]}>
              <MaterialCommunityIcons name={category.icon as any} size={16} color={getContrastTextColor(category.color)} />
            </View>
            <Text style={[styles.rowLabel, { color: theme.text }]}>{category.name}</Text>
            <Pressable onPress={() => handleDelete(category)} hitSlop={8}>
              <Text style={[styles.removeLabel, { color: '#d64545' }]}>Retirer</Text>
            </Pressable>
          </View>
        ))
      )}

      <View style={styles.inlineFormColumn}>
        <TextInput
          style={[styles.textInput, { borderColor: theme.border, color: theme.text }]}
          placeholder="Nom de la catégorie"
          placeholderTextColor={`${theme.text}55`}
          value={name}
          onChangeText={setName}
        />
        <View style={styles.swatchRow}>
          {COLOR_CHOICES.map((c) => (
            <Pressable
              key={c}
              style={[styles.swatch, { backgroundColor: c }, color === c && styles.swatchActive]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>
        <View style={styles.swatchRow}>
          {ICON_CHOICES.map((i) => (
            <Pressable
              key={i}
              style={[
                styles.iconChoice,
                { borderColor: theme.border },
                icon === i && { borderColor: theme.tint, backgroundColor: `${theme.tint}22` },
              ]}
              onPress={() => setIcon(i)}
            >
              <MaterialCommunityIcons name={i as any} size={18} color={theme.text} />
            </Pressable>
          ))}
        </View>
        <Pressable
          style={[styles.inlineButton, { backgroundColor: theme.tint, opacity: submitting ? 0.6 : 1 }]}
          onPress={handleAdd}
          disabled={submitting}
        >
          <Text style={[styles.inlineButtonLabel, { color: getContrastTextColor(theme.tint) }]}>Créer la catégorie</Text>
        </Pressable>
      </View>
    </Section>
  );
}

// ---------- Associations catégorie -> magasin ----------

function CategoryStoreSection({
  theme,
  allCategories,
  userCategories,
  categoryStoreMap,
  storeOptions,
  onChanged,
}: {
  theme: (typeof Colors)['light'];
  allCategories: string[];
  userCategories: UserCategory[];
  categoryStoreMap: Map<string, string>;
  storeOptions: { label: string; value: string }[];
  onChanged: () => void;
}) {
  const handleChange = async (category: string, value: string) => {
    try {
      if (value === NO_STORE) await deleteCategoryStore(category);
      else await setCategoryStore(category, value);
      onChanged();
    } catch (err) {
      Alert.alert('Erreur', err instanceof Error ? err.message : "Impossible de mettre à jour l'association");
    }
  };

  return (
    <Section theme={theme} title="Magasin par défaut" description="Par catégorie, ex: Meat → Costco.">
      {allCategories.map((category) => {
        const meta = resolveCategoryMeta(category, userCategories);
        const currentStore = categoryStoreMap.get(category) ?? NO_STORE;
        return (
          <View key={category} style={[styles.row, { borderColor: theme.border }]}>
            <View style={[styles.iconBadge, { backgroundColor: meta.color }]}>
              <MaterialCommunityIcons name={meta.icon as any} size={16} color={getContrastTextColor(meta.color)} />
            </View>
            <Text style={[styles.rowLabel, { color: theme.text }]}>{meta.label}</Text>
            <View style={styles.rowSelect}>
              <SelectField value={currentStore} options={storeOptions} onChange={(v) => handleChange(category, v)} />
            </View>
          </View>
        );
      })}
    </Section>
  );
}

// ---------- Overrides par ingrédient ----------

function IngredientOverridesSection({
  theme,
  prefs,
  allCategories,
  userCategories,
  storeOptions,
  onChanged,
}: {
  theme: (typeof Colors)['light'];
  prefs: IngredientPreference[];
  allCategories: string[];
  userCategories: UserCategory[];
  storeOptions: { label: string; value: string }[];
  onChanged: () => void;
}) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pendingName, setPendingName] = useState<string | null>(null);
  const [pendingCategory, setPendingCategory] = useState(NO_STORE);
  const [pendingStore, setPendingStore] = useState(NO_STORE);

  const categoryOptions = useMemo(
    () => [{ label: 'Aucune (garder la catégorie de la recette)', value: NO_STORE }, ...allCategories.map((c) => ({
      label: resolveCategoryMeta(c, userCategories).label,
      value: c,
    }))],
    [allCategories, userCategories]
  );

  const handlePickIngredient = (name: string) => {
    setPickerVisible(false);
    setPendingName(name);
    setPendingCategory(NO_STORE);
    setPendingStore(NO_STORE);
  };

  const handleConfirmPending = async () => {
    if (!pendingName) return;
    if (pendingCategory === NO_STORE && pendingStore === NO_STORE) {
      Alert.alert('Erreur', 'Choisis au moins une catégorie ou un magasin.');
      return;
    }
    await setIngredientPreference(pendingName, {
      category: pendingCategory === NO_STORE ? null : pendingCategory,
      store: pendingStore === NO_STORE ? null : pendingStore,
    });
    setPendingName(null);
    onChanged();
  };

  const handleChangeStore = async (pref: IngredientPreference, value: string) => {
    await setIngredientPreference(pref.ingredientName, { store: value === NO_STORE ? null : value });
    onChanged();
  };

  const handleChangeCategory = async (pref: IngredientPreference, value: string) => {
    await setIngredientPreference(pref.ingredientName, { category: value === NO_STORE ? null : value });
    onChanged();
  };

  const handleDelete = (pref: IngredientPreference) => {
    Alert.alert('Retirer cet override', `Retirer les préférences pour "${pref.ingredientName}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Retirer',
        style: 'destructive',
        onPress: async () => {
          await deleteIngredientPreference(pref.ingredientName);
          onChanged();
        },
      },
    ]);
  };

  return (
    <Section theme={theme} title="Cas particuliers par ingrédient" description="Surclasse le défaut de la catégorie pour un ingrédient précis.">
      {prefs.length === 0 ? (
        <Text style={[styles.emptyText, { color: `${theme.text}88` }]}>Aucun cas particulier pour l'instant.</Text>
      ) : (
        prefs.map((pref) => (
          <View key={pref._id} style={[styles.overrideCard, { borderColor: theme.border }]}>
            <View style={styles.overrideHeader}>
              <Text style={[styles.rowLabel, { color: theme.text }]}>{pref.ingredientName}</Text>
              <Pressable onPress={() => handleDelete(pref)} hitSlop={8}>
                <Text style={[styles.removeLabel, { color: '#d64545' }]}>Retirer</Text>
              </Pressable>
            </View>
            <View style={styles.overrideFields}>
              <View style={styles.overrideField}>
                <Text style={[styles.overrideFieldLabel, { color: `${theme.text}99` }]}>Catégorie</Text>
                <SelectField
                  value={pref.category ?? NO_STORE}
                  options={categoryOptions}
                  onChange={(v) => handleChangeCategory(pref, v)}
                />
              </View>
              <View style={styles.overrideField}>
                <Text style={[styles.overrideFieldLabel, { color: `${theme.text}99` }]}>Magasin</Text>
                <SelectField
                  value={pref.store ?? NO_STORE}
                  options={storeOptions}
                  onChange={(v) => handleChangeStore(pref, v)}
                />
              </View>
            </View>
          </View>
        ))
      )}

      {pendingName ? (
        <View style={[styles.overrideCard, { borderColor: theme.tint }]}>
          <Text style={[styles.rowLabel, { color: theme.text }]}>{pendingName}</Text>
          <View style={styles.overrideFields}>
            <View style={styles.overrideField}>
              <Text style={[styles.overrideFieldLabel, { color: `${theme.text}99` }]}>Catégorie</Text>
              <SelectField value={pendingCategory} options={categoryOptions} onChange={setPendingCategory} />
            </View>
            <View style={styles.overrideField}>
              <Text style={[styles.overrideFieldLabel, { color: `${theme.text}99` }]}>Magasin</Text>
              <SelectField value={pendingStore} options={storeOptions} onChange={setPendingStore} />
            </View>
          </View>
          <View style={styles.overrideHeader}>
            <Pressable onPress={() => setPendingName(null)} hitSlop={8}>
              <Text style={[styles.removeLabel, { color: `${theme.text}99` }]}>Annuler</Text>
            </Pressable>
            <Pressable onPress={handleConfirmPending} hitSlop={8}>
              <Text style={[styles.removeLabel, { color: theme.tint }]}>Enregistrer</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <Pressable style={[styles.addButton, { borderColor: theme.border }]} onPress={() => setPickerVisible(true)}>
        <Text style={[styles.addLabel, { color: theme.tint }]}>+ Ajouter un cas particulier</Text>
      </Pressable>

      <IngredientPickerModal visible={pickerVisible} onClose={() => setPickerVisible(false)} onSelect={handlePickIngredient} />
    </Section>
  );
}

// ---------- Section wrapper ----------

function Section({
  theme,
  title,
  description,
  defaultExpanded = false,
  children,
}: {
  theme: (typeof Colors)['light'];
  title: string;
  description: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Pressable style={styles.sectionHeaderRow} onPress={() => setExpanded((prev) => !prev)}>
        <View style={styles.sectionHeaderText}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.sectionDescription, { color: `${theme.text}88` }]}>{description}</Text>
        </View>
        <MaterialCommunityIcons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={22}
          color={`${theme.text}99`}
        />
      </Pressable>
      {expanded ? <View style={styles.sectionBody}>{children}</View> : null}
    </View>
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
    padding: 24,
    gap: 20,
    paddingBottom: 56,
  },
  section: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionHeaderText: {
    flex: 1,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  sectionDescription: {
    fontSize: 13,
  },
  sectionBody: {
    marginTop: 12,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowSelect: {
    minWidth: 140,
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
  removeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  addButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  addLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  inlineForm: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  inlineFormColumn: {
    gap: 10,
    marginTop: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  inlineButton: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineButtonLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchActive: {
    borderColor: '#111',
  },
  iconChoice: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overrideCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  overrideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overrideFields: {
    flexDirection: 'row',
    gap: 12,
  },
  overrideField: {
    flex: 1,
    gap: 4,
  },
  overrideFieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
