import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from 'react-native';

import { Colors, ThemeColors } from '@/constants/theme';
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

const steps = [
  { key: 'basics', title: 'Base', caption: 'Nom, image et histoire de ta recette.' },
  { key: 'profile', title: 'Profil', caption: 'Catégorie, difficulté et temps requis.' },
  { key: 'composition', title: 'Composition', caption: 'Ingrédients et épices à rassembler.' },
] as const;

type StepKey = (typeof steps)[number]['key'];

export const UserMealForm: React.FC<Props> = ({ meal, onChange, onSubmit, submitLabel = 'Enregistrer' }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const ingredients = useMemo(() => meal.ingredients ?? [], [meal.ingredients]);
  const spices = useMemo(() => meal.spices ?? [], [meal.spices]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const activeStep = steps[activeStepIndex];
  const isLastStep = activeStepIndex === steps.length - 1;

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

  const handleStepPress = (index: number) => {
    setActiveStepIndex(index);
  };

  const handleNext = () => {
    setActiveStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrevious = () => {
    setActiveStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const renderStep = (stepKey: StepKey) => {
    switch (stepKey) {
      case 'basics':
        return (
          <View style={styles.fieldGroup}>
            <InputField
              label="Nom de la recette"
              placeholder="Bols de pâtes crémeux..."
              value={meal.name}
              onChangeText={(text) => onChange('name', text)}
              theme={theme}
            />
            <InputField
              label="Photo (URL)"
              placeholder="https://..."
              value={meal.photo}
              onChangeText={(text) => onChange('photo', text)}
              theme={theme}
              autoCapitalize="none"
            />
            <InputField
              label="Description"
              placeholder="Décris l'histoire ou les étapes clés de ta recette."
              value={meal.description}
              onChangeText={(text) => onChange('description', text)}
              theme={theme}
              multiline
            />
          </View>
        );
      case 'profile':
        return (
          <View style={styles.fieldGroup}>
            <View style={styles.segmentBlock}>
              <Text style={[styles.label, { color: theme.text }]}>Catégorie</Text>
              <SegmentedControl
                options={categories}
                value={meal.category ?? 'Lunch'}
                onChange={(value) => onChange('category', value)}
                themeTint={theme.tint}
                themeText={theme.text}
              />
            </View>

            <View style={styles.segmentBlock}>
              <Text style={[styles.label, { color: theme.text }]}>Difficulté</Text>
              <SegmentedControl
                options={difficulties}
                value={meal.difficulty ?? 'Easy'}
                onChange={(value) => onChange('difficulty', value)}
                themeTint={theme.tint}
                themeText={theme.text}
              />
            </View>

            <View style={styles.row}>
              <InputField
                label="Préparation (min)"
                placeholder="15"
                value={meal.prepTime ?? ''}
                onChangeText={(text) => onChange('prepTime', text.replace(/[^0-9]/g, ''))}
                theme={theme}
                keyboardType="number-pad"
              />
              <InputField
                label="Cuisson (min)"
                placeholder="30"
                value={meal.cookTime ?? ''}
                onChangeText={(text) => onChange('cookTime', text.replace(/[^0-9]/g, ''))}
                theme={theme}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.row}>
              <InputField
                label="Portions"
                placeholder="4"
                value={meal.servings ? String(meal.servings) : ''}
                onChangeText={(text) => {
                  const normalized = text.replace(/[^0-9]/g, '');
                  onChange('servings', normalized ? parseInt(normalized, 10) : 0);
                }}
                theme={theme}
                keyboardType="number-pad"
              />
              <View style={styles.segmentBlock}>
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
        );
      case 'composition':
      default:
        return (
          <View style={styles.fieldGroup}>
            <EditableList
              title="Ingrédients"
              emptyHint="Ajoute chaque ingrédient avec sa quantité."
              addLabel="Ajouter un ingrédient"
              items={ingredients}
              onItemChange={(index, field, value) => handleListChange('ingredients', index, field, value)}
              onAdd={() => handleAddItem('ingredients')}
              onRemove={(index) => handleRemoveItem('ingredients', index)}
              theme={theme}
            />

            <EditableList
              title="Épices"
              emptyHint="Optionnel, mais parfait pour noter les saveurs clés."
              addLabel="Ajouter une épice"
              items={spices}
              onItemChange={(index, field, value) => handleListChange('spices', index, field, value)}
              onAdd={() => handleAddItem('spices')}
              onRemove={(index) => handleRemoveItem('spices', index)}
              theme={theme}
            />
          </View>
        );
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={[styles.heading, { color: theme.text }]}>Ta nouvelle recette</Text>
        <Text style={[styles.caption, { color: `${theme.text}99` }]}>{activeStep.caption}</Text>
        <View style={[styles.stepper, { backgroundColor: `${theme.border}55` }]}>
          {steps.map((step, index) => {
            const isActive = index === activeStepIndex;
            const isCompleted = index < activeStepIndex;
            return (
              <Pressable
                key={step.key}
                style={[styles.stepPill, isActive && { backgroundColor: theme.tint }]}
                onPress={() => handleStepPress(index)}
              >
                <Text
                  style={[
                    styles.stepPillLabel,
                    {
                      color: isActive ? '#fff' : isCompleted ? theme.tint : `${theme.text}aa`,
                    },
                  ]}
                >
                  {step.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {renderStep(activeStep.key)}
      </View>

      <View style={styles.footerActions}>
        {activeStepIndex > 0 ? (
          <Pressable style={[styles.secondaryButton, { borderColor: theme.border }]} onPress={handlePrevious}>
            <Text style={[styles.secondaryLabel, { color: theme.text }]}>Retour</Text>
          </Pressable>
        ) : null}

        <Pressable
          style={[styles.primaryButton, { backgroundColor: theme.tint }]}
          onPress={isLastStep ? onSubmit : handleNext}
        >
          <Text style={styles.primaryLabel}>{isLastStep ? submitLabel : 'Continuer'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

type InputFieldProps = {
  label: string;
  value?: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  theme: ThemeColors;
  multiline?: boolean;
  keyboardType?: 'default' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  placeholder,
  onChangeText,
  theme,
  multiline = false,
  keyboardType = 'default',
  autoCapitalize,
}) => {
  return (
    <View style={styles.inputBlock}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          { borderColor: theme.border, color: theme.text },
        ]}
        placeholder={placeholder}
        placeholderTextColor={`${theme.text}55`}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'auto'}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
};

type EditableListProps = {
  title: string;
  emptyHint: string;
  addLabel: string;
  items: { name: string; quantity: string }[];
  onItemChange: (index: number, field: 'name' | 'quantity', value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  theme: ThemeColors;
};

const EditableList: React.FC<EditableListProps> = ({
  title,
  emptyHint,
  addLabel,
  items,
  onItemChange,
  onAdd,
  onRemove,
  theme,
}) => {
  return (
    <View style={styles.listSection}>
      <View style={styles.listHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.itemCount, { color: `${theme.text}88` }]}>{items.length} élément(s)</Text>
      </View>
      {items.length === 0 ? (
        <Text style={[styles.helperText, { color: `${theme.text}80` }]}>{emptyHint}</Text>
      ) : null}
      {items.map((item, index) => (
        <View key={`${title}-${index}`} style={styles.listRow}>
          <TextInput
            style={[styles.input, styles.listInput, { borderColor: theme.border, color: theme.text }]}
            placeholder="Nom"
            placeholderTextColor={`${theme.text}55`}
            value={item.name}
            onChangeText={(text) => onItemChange(index, 'name', text)}
          />
          <TextInput
            style={[styles.input, styles.listInput, { borderColor: theme.border, color: theme.text }]}
            placeholder="Quantité"
            placeholderTextColor={`${theme.text}55`}
            value={item.quantity}
            onChangeText={(text) => onItemChange(index, 'quantity', text)}
          />
          <Pressable style={[styles.removeChip, { borderColor: theme.border }]} onPress={() => onRemove(index)}>
            <Text style={[styles.removeChipLabel, { color: theme.text }]}>Retirer</Text>
          </Pressable>
        </View>
      ))}
      <Pressable style={[styles.addButton, { borderColor: theme.border }]} onPress={onAdd}>
        <Text style={[styles.addLabel, { color: theme.tint }]}>+ {addLabel}</Text>
      </Pressable>
    </View>
  );
};

type SegmentedControlProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  themeTint: string;
  themeText: string;
};

const getRelativeLuminance = (color: string) => {
  const normalized = color.replace('#', '');
  const fallback = normalized[normalized.length - 1] ?? '0';
  const hex = normalized.length === 3
    ? normalized
        .split('')
        .map((char) => `${char}${char}`)
        .join('')
    : normalized.padEnd(6, fallback);

  const value = (channel: string) => {
    const parsed = parseInt(channel, 16);
    const raw = Number.isNaN(parsed) ? 0 : parsed / 255;
    return raw <= 0.03928 ? raw / 12.92 : Math.pow((raw + 0.055) / 1.055, 2.4);
  };

  const r = value(hex.substring(0, 2));
  const g = value(hex.substring(2, 4));
  const b = value(hex.substring(4, 6));

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const SegmentedControl = <T extends string>({ options, value, onChange, themeTint, themeText }: SegmentedControlProps<T>) => {
  const isTintLight = getRelativeLuminance(themeTint) > 0.65;
  const activeTextColor = isTintLight ? '#111' : '#fff';

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
                { color: isActive ? activeTextColor : `${themeText}cc` },
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
    paddingBottom: 56,
    gap: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  caption: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    padding: 22,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  itemCount: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
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
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  multiline: {
    minHeight: 130,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
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
  header: {
    gap: 12,
  },
  stepper: {
    flexDirection: 'row',
    borderRadius: 999,
    padding: 6,
    gap: 6,
  },
  stepPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
  },
  stepPillLabel: {
    fontWeight: '600',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  fieldGroup: {
    gap: 20,
  },
  segmentBlock: {
    gap: 8,
    flex: 1,
  },
  inputBlock: {
    gap: 8,
    flex: 1,
  },
  listSection: {
    gap: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLabel: {
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
