import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { UserMeal } from '@/types/UserMeal';

type Props = {
  meal: Partial<UserMeal>;
  onChange: (key: keyof UserMeal, value: any) => void;
  onSubmit: () => void;
  submitLabel?: string;
};

type SegmentOption<T extends string> = {
  label: string;
  value: T;
};

const categories: SegmentOption<UserMeal['category']>[] = [
  { label: 'Déjeuner', value: 'Breakfast' },
  { label: 'Snack', value: 'Snack' },
  { label: 'Dîner', value: 'Lunch' },
  { label: 'Souper', value: 'Dinner' },
  { label: 'Dessert', value: 'Dessert' },
];

const difficulties: SegmentOption<UserMeal['difficulty']>[] = [
  { label: 'Facile', value: 'Easy' },
  { label: 'Intermédiaire', value: 'Medium' },
  { label: 'Expert', value: 'Hard' },
];

const visibilityOptions: SegmentOption<'private' | 'group'>[] = [
  { label: 'Privé', value: 'private' },
  { label: 'Groupe', value: 'group' },
];

export const UserMealForm: React.FC<Props> = ({ meal, onChange, onSubmit, submitLabel = 'Enregistrer' }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const ingredients = useMemo(() => meal.ingredients ?? [], [meal.ingredients]);
  const spices = useMemo(() => meal.spices ?? [], [meal.spices]);

  const handleListChange = (
    listKey: 'ingredients' | 'spices',
    index: number,
    field: 'name' | 'quantity',
    value: string,
  ) => {
    const list = listKey === 'ingredients' ? ingredients : spices;
    const updated = list.map((item, idx) => (idx === index ? { ...item, [field]: value } : item));
    onChange(listKey, updated);
  };

  const handleAddItem = (listKey: 'ingredients' | 'spices') => {
    const list = listKey === 'ingredients' ? ingredients : spices;
    onChange(listKey, [...list, { name: '', quantity: '' }]);
  };

  const handleRemoveItem = (listKey: 'ingredients' | 'spices', index: number) => {
    const list = listKey === 'ingredients' ? ingredients : spices;
    const updated = list.filter((_, idx) => idx !== index);
    onChange(listKey, updated);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.heading, { color: theme.text }]}>Créer une nouvelle recette</Text>

      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Informations générales</Text>
        <Text style={[styles.label, { color: theme.text }]}>Nom de la recette</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          placeholder="Bols de pâtes crémeux..."
          placeholderTextColor={`${theme.text}55`}
          value={meal.name}
          onChangeText={(text) => onChange('name', text)}
        />

        <Text style={[styles.label, { color: theme.text }]}>Photo (URL)</Text>
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          placeholder="https://..."
          placeholderTextColor={`${theme.text}55`}
          value={meal.photo}
          onChangeText={(text) => onChange('photo', text)}
          autoCapitalize="none"
        />

        <Text style={[styles.label, { color: theme.text }]}>Description</Text>
        <TextInput
          style={[styles.input, styles.multiline, { borderColor: theme.border, color: theme.text }]}
          placeholder="Décris l'histoire ou les étapes clés de ta recette."
          placeholderTextColor={`${theme.text}55`}
          value={meal.description}
          onChangeText={(text) => onChange('description', text)}
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Profil de la recette</Text>

        <Text style={[styles.label, { color: theme.text }]}>Catégorie</Text>
        <SegmentedControl
          options={categories}
          value={meal.category ?? 'Lunch'}
          onChange={(value) => onChange('category', value)}
          themeTint={theme.tint}
          themeText={theme.text}
        />

        <Text style={[styles.label, { color: theme.text }]}>Difficulté</Text>
        <SegmentedControl
          options={difficulties}
          value={meal.difficulty ?? 'Easy'}
          onChange={(value) => onChange('difficulty', value)}
          themeTint={theme.tint}
          themeText={theme.text}
        />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={[styles.label, { color: theme.text }]}>Préparation (min)</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              keyboardType="number-pad"
              value={meal.prepTime ?? ''}
              onChangeText={(text) => onChange('prepTime', text.replace(/[^0-9]/g, ''))}
              placeholder="15"
              placeholderTextColor={`${theme.text}55`}
            />
          </View>

          <View style={styles.halfField}>
            <Text style={[styles.label, { color: theme.text }]}>Cuisson (min)</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              keyboardType="number-pad"
              value={meal.cookTime ?? ''}
              onChangeText={(text) => onChange('cookTime', text.replace(/[^0-9]/g, ''))}
              placeholder="30"
              placeholderTextColor={`${theme.text}55`}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={[styles.label, { color: theme.text }]}>Portions</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              keyboardType="number-pad"
              value={meal.servings ? String(meal.servings) : ''}
              onChangeText={(text) => {
                const normalized = text.replace(/[^0-9]/g, '');
                onChange('servings', normalized ? parseInt(normalized, 10) : 0);
              }}
              placeholder="4"
              placeholderTextColor={`${theme.text}55`}
            />
          </View>

          <View style={styles.halfField}>
            <Text style={[styles.label, { color: theme.text }]}>Visibilité</Text>
            <SegmentedControl
              options={visibilityOptions}
              value={(meal.visibility as 'private' | 'group') ?? 'private'}
              onChange={(value) => onChange('visibility', value)}
              themeTint={theme.tint}
              themeText={theme.text}
            />
          </View>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Ingrédients</Text>
        {ingredients.length === 0 ? (
          <Text style={[styles.helperText, { color: `${theme.text}80` }]}>Ajoute chaque ingrédient avec sa quantité.</Text>
        ) : null}
        {ingredients.map((ingredient, index) => (
          <View key={`ingredient-${index}`} style={styles.listRow}>
            <TextInput
              style={[styles.input, styles.listInput, { borderColor: theme.border, color: theme.text }]}
              placeholder="Nom"
              placeholderTextColor={`${theme.text}55`}
              value={ingredient.name}
              onChangeText={(text) => handleListChange('ingredients', index, 'name', text)}
            />
            <TextInput
              style={[styles.input, styles.listInput, { borderColor: theme.border, color: theme.text }]}
              placeholder="Quantité"
              placeholderTextColor={`${theme.text}55`}
              value={ingredient.quantity}
              onChangeText={(text) => handleListChange('ingredients', index, 'quantity', text)}
            />
            <Pressable
              style={[styles.removeChip, { borderColor: theme.border }]}
              onPress={() => handleRemoveItem('ingredients', index)}
            >
              <Text style={[styles.removeChipLabel, { color: theme.text }]}>Retirer</Text>
            </Pressable>
          </View>
        ))}
        <Pressable
          style={[styles.addButton, { borderColor: theme.border }]}
          onPress={() => handleAddItem('ingredients')}
        >
          <Text style={[styles.addLabel, { color: theme.tint }]}>+ Ajouter un ingrédient</Text>
        </Pressable>
      </View>

      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Épices</Text>
        {spices.length === 0 ? (
          <Text style={[styles.helperText, { color: `${theme.text}80` }]}>Optionnel, mais parfait pour noter les saveurs clés.</Text>
        ) : null}
        {spices.map((spice, index) => (
          <View key={`spice-${index}`} style={styles.listRow}>
            <TextInput
              style={[styles.input, styles.listInput, { borderColor: theme.border, color: theme.text }]}
              placeholder="Nom"
              placeholderTextColor={`${theme.text}55`}
              value={spice.name}
              onChangeText={(text) => handleListChange('spices', index, 'name', text)}
            />
            <TextInput
              style={[styles.input, styles.listInput, { borderColor: theme.border, color: theme.text }]}
              placeholder="Quantité"
              placeholderTextColor={`${theme.text}55`}
              value={spice.quantity}
              onChangeText={(text) => handleListChange('spices', index, 'quantity', text)}
            />
            <Pressable
              style={[styles.removeChip, { borderColor: theme.border }]}
              onPress={() => handleRemoveItem('spices', index)}
            >
              <Text style={[styles.removeChipLabel, { color: theme.text }]}>Retirer</Text>
            </Pressable>
          </View>
        ))}
        <Pressable style={[styles.addButton, { borderColor: theme.border }]} onPress={() => handleAddItem('spices')}>
          <Text style={[styles.addLabel, { color: theme.tint }]}>+ Ajouter une épice</Text>
        </Pressable>
      </View>

      <Pressable style={[styles.submitButton, { backgroundColor: theme.tint }]} onPress={onSubmit}>
        <Text style={styles.submitLabel}>{submitLabel}</Text>
      </Pressable>
    </ScrollView>
  );
};

type SegmentedControlProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  themeTint: string;
  themeText: string;
};

const SegmentedControl = <T extends string>({ options, value, onChange, themeTint, themeText }: SegmentedControlProps<T>) => {
  return (
    <View style={styles.segmentContainer}>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[
              styles.segmentChip,
              {
                backgroundColor: isActive ? themeTint : 'transparent',
                borderColor: isActive ? themeTint : `${themeText}33`,
              },
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text
              style={[
                styles.segmentLabel,
                { color: isActive ? '#fff' : `${themeText}cc` },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    gap: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginTop: 12,
  },
  section: {
    padding: 20,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  multiline: {
    minHeight: 110,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfField: {
    flex: 1,
    gap: 8,
  },
  segmentContainer: {
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
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  listInput: {
    flex: 1,
  },
  removeChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  removeChipLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
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
    fontWeight: '600',
    fontSize: 14,
  },
  submitButton: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 32,
  },
  submitLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
