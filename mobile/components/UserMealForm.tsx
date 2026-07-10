import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { IngredientPickerModal } from '@/components/IngredientPickerModal';
import { SelectField } from '@/components/SelectField';
import { getCategoryMeta, IngredientCategory, INGREDIENT_CATEGORIES } from '@/constants/ingredientCategories';
import { Colors, ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ingredient, Unit, UNITS } from '@/types/Meal';
import { UserMeal } from '@/types/UserMeal';
import { getContrastTextColor, getRelativeLuminance } from '@/utils/color';

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

const SPICE_CATEGORIES: IngredientCategory[] = ['Spices'];
const INGREDIENT_ONLY_CATEGORIES: IngredientCategory[] = INGREDIENT_CATEGORIES.filter((c) => c !== 'Spices');
const UNIT_OPTIONS: SegmentOption<Unit>[] = UNITS.map((unit) => ({ label: unit, value: unit }));

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
  const tintContrastColor = getRelativeLuminance(theme.tint) > 0.65 ? '#111' : '#fff';

  const ingredients = useMemo(() => meal.ingredients ?? [], [meal.ingredients]);
  const spices = useMemo(() => meal.spices ?? [], [meal.spices]);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [pickerTarget, setPickerTarget] = useState<{ listKey: 'ingredients' | 'spices'; index: number } | null>(null);

  const activeStep = steps[activeStepIndex];
  const isLastStep = activeStepIndex === steps.length - 1;

  const handleListChange = (
    listKey: 'ingredients' | 'spices',
    index: number,
    field: 'name' | 'quantity' | 'unit',
    value: string | number,
  ) => {
    const list = listKey === 'ingredients' ? ingredients : spices;
    const updated = list.map((item, idx) => (idx === index ? { ...item, [field]: value } : item));
    onChange(listKey, updated);
  };

  const handleAddItem = (listKey: 'ingredients' | 'spices') => {
    const list = listKey === 'ingredients' ? ingredients : spices;
    const defaultUnit: Unit = listKey === 'spices' ? 'pincée' : 'g';
    onChange(listKey, [...list, { name: '', quantity: 0, unit: defaultUnit }]);
  };

  const handleRemoveItem = (listKey: 'ingredients' | 'spices', index: number) => {
    const list = listKey === 'ingredients' ? ingredients : spices;
    const updated = list.filter((_, idx) => idx !== index);
    onChange(listKey, updated);
  };

  const handlePickIngredient = (name: string, category: IngredientCategory) => {
    if (!pickerTarget) return;
    const { listKey, index } = pickerTarget;
    const list = listKey === 'ingredients' ? ingredients : spices;
    const updated = list.map((item, idx) => (idx === index ? { ...item, name, category } : item));
    onChange(listKey, updated);
    setPickerTarget(null);
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
            <PhotoPickerField
              label="Photo"
              value={meal.photo}
              onChange={(uri) => onChange('photo', uri)}
              theme={theme}
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
              onOpenPicker={(index) => setPickerTarget({ listKey: 'ingredients', index })}
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
              onOpenPicker={(index) => setPickerTarget({ listKey: 'spices', index })}
            />
          </View>
        );
    }
  };

  return (
    <>
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
                      color: isActive ? tintContrastColor : isCompleted ? theme.tint : `${theme.text}aa`,
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
          <Text style={[styles.primaryLabel, { color: tintContrastColor }]}>{isLastStep ? submitLabel : 'Continuer'}</Text>
        </Pressable>
      </View>
    </ScrollView>

    <IngredientPickerModal
      visible={pickerTarget !== null}
      onClose={() => setPickerTarget(null)}
      onSelect={handlePickIngredient}
      allowedCategories={pickerTarget?.listKey === 'spices' ? SPICE_CATEGORIES : INGREDIENT_ONLY_CATEGORIES}
    />
    </>
  );
};

type PhotoPickerFieldProps = {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  theme: ThemeColors;
};

const getAssetMimeType = (asset: ImagePicker.ImagePickerAsset) => {
  if (asset.mimeType) {
    return asset.mimeType;
  }

  const extension = asset.uri.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'heic':
    case 'heif':
      return 'image/heic';
    default:
      return 'image/jpeg';
  }
};

const PhotoPickerField: React.FC<PhotoPickerFieldProps> = ({ label, value, onChange, theme }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const tintContrastColor = getRelativeLuminance(theme.tint) > 0.65 ? '#111' : '#fff';

  const ensurePermission = async (source: 'camera' | 'library') => {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission requise',
        source === 'camera'
          ? "Nous avons besoin d'accéder à la caméra pour prendre une photo de ta recette."
          : "Nous avons besoin d'accéder à ta galerie pour sélectionner une photo.",
      );
      return false;
    }

    return true;
  };

  const handlePick = async (source: 'camera' | 'library') => {
    const hasPermission = await ensurePermission(source);
    if (!hasPermission) return;

    try {
      setIsProcessing(true);

      const pickerOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      };

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(pickerOptions)
          : await ImagePicker.launchImageLibraryAsync(pickerOptions);

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset) {
        Alert.alert('Erreur', "Impossible de récupérer l'image sélectionnée.");
        return;
      }

      if (!asset.base64) {
        Alert.alert('Erreur', "Impossible de convertir l'image sélectionnée.");
        return;
      }

      const dataUrl = `data:${getAssetMimeType(asset)};base64,${asset.base64}`;
      onChange(dataUrl);
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', "Une erreur est survenue lors de la sélection de l'image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = () => {
    if (!isProcessing) {
      onChange('');
    }
  };

  return (
    <View style={styles.inputBlock}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      {value ? (
        <>
          <View style={[styles.photoPreview, { borderColor: theme.border }]}>
            <Image source={{ uri: value }} style={styles.photo} />
          </View>
          <Pressable
            style={[
              styles.removeChip,
              styles.removePhotoChip,
              { borderColor: theme.border, opacity: isProcessing ? 0.6 : 1 },
            ]}
            onPress={handleRemove}
            disabled={isProcessing}
          >
            <Text style={[styles.removeChipLabel, { color: theme.text }]}>Retirer la photo</Text>
          </Pressable>
        </>
      ) : (
        <View style={[styles.photoPlaceholder, { borderColor: theme.border }]}>
          <Text style={[styles.helperText, { color: `${theme.text}80`, textAlign: 'center' }]}>
            Ajoute une image depuis ta galerie ou en prenant une photo.
          </Text>
        </View>
      )}

      <View style={styles.photoActions}>
        <Pressable
          style={[
            styles.photoActionButton,
            styles.photoActionSecondary,
            { borderColor: theme.border, opacity: isProcessing ? 0.6 : 1 },
          ]}
          onPress={() => handlePick('library')}
          disabled={isProcessing}
        >
          <Text style={[styles.photoActionLabel, { color: theme.text }]}>
            {isProcessing ? 'Patiente…' : 'Depuis la galerie'}
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.photoActionButton,
            styles.photoActionPrimary,
            { backgroundColor: theme.tint, opacity: isProcessing ? 0.6 : 1 },
          ]}
          onPress={() => handlePick('camera')}
          disabled={isProcessing}
        >
          <Text style={[styles.photoActionLabel, { color: tintContrastColor }]}>
            {isProcessing ? 'Patiente…' : 'Prendre une photo'}
          </Text>
        </Pressable>
      </View>
    </View>
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

type IngredientNameFieldProps = {
  name: string;
  category?: IngredientCategory;
  onPress: () => void;
  theme: ThemeColors;
};

const IngredientNameField: React.FC<IngredientNameFieldProps> = ({ name, category, onPress, theme }) => {
  const meta = category ? getCategoryMeta(category) : null;

  return (
    <Pressable
      style={[
        styles.ingredientNameField,
        { borderColor: meta ? meta.color : theme.border, backgroundColor: meta ? `${meta.color}22` : 'transparent' },
      ]}
      onPress={onPress}
    >
      {meta ? (
        <View style={[styles.ingredientIconBadge, { backgroundColor: meta.color }]}>
          <MaterialCommunityIcons name={meta.icon as any} size={14} color={getContrastTextColor(meta.color)} />
        </View>
      ) : null}
      <Text style={[styles.ingredientNameText, { color: name ? theme.text : `${theme.text}80` }]} numberOfLines={1}>
        {name || 'Choisir un ingrédient'}
      </Text>
    </Pressable>
  );
};

type EditableListProps = {
  title: string;
  emptyHint: string;
  addLabel: string;
  items: Ingredient[];
  onItemChange: (index: number, field: 'name' | 'quantity' | 'unit', value: string | number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  theme: ThemeColors;
  onOpenPicker?: (index: number) => void;
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
  onOpenPicker,
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
        <View key={`${title}-${index}`} style={[styles.listItem, { borderColor: theme.border }]}>
          {onOpenPicker ? (
            <IngredientNameField
              name={item.name}
              category={item.category}
              onPress={() => onOpenPicker(index)}
              theme={theme}
            />
          ) : (
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Nom"
              placeholderTextColor={`${theme.text}55`}
              value={item.name}
              onChangeText={(text) => onItemChange(index, 'name', text)}
            />
          )}
          <View style={styles.listRow}>
            <TextInput
              style={[styles.input, styles.quantityInput, { borderColor: theme.border, color: theme.text }]}
              placeholder="Qté"
              placeholderTextColor={`${theme.text}55`}
              value={item.quantity ? String(item.quantity) : ''}
              onChangeText={(text) => {
                const normalized = text.replace(/[^0-9.,]/g, '').replace(',', '.');
                onItemChange(index, 'quantity', normalized ? parseFloat(normalized) : 0);
              }}
              keyboardType="decimal-pad"
            />
            <View style={styles.unitPicker}>
              <SelectField value={item.unit} options={UNIT_OPTIONS} onChange={(unit) => onItemChange(index, 'unit', unit)} />
            </View>
            <Pressable style={[styles.removeChip, { borderColor: theme.border }]} onPress={() => onRemove(index)}>
              <Text style={[styles.removeChipLabel, { color: theme.text }]}>Retirer</Text>
            </Pressable>
          </View>
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
  photoPreview: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
    width: '100%',
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
  },
  photoActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoActionSecondary: {
    borderWidth: 1,
  },
  photoActionPrimary: {},
  photoActionLabel: {
    fontWeight: '600',
    fontSize: 14,
  },
  removePhotoChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  ingredientNameField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  ingredientIconBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientNameText: {
    fontSize: 15,
    flex: 1,
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
  listItem: {
    gap: 10,
    paddingBottom: 14,
    marginBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantityInput: {
    flex: 1,
  },
  unitPicker: {
    flex: 1.4,
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
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
