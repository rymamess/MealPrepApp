import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getRelativeLuminance } from '@/utils/color';

export type SegmentOption<T extends string> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  themeTint: string;
  themeText: string;
};

export const SegmentedControl = <T extends string>({ options, value, onChange, themeTint, themeText }: SegmentedControlProps<T>) => {
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

type MultiSegmentedControlProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T[];
  onChange: (value: T[]) => void;
  themeTint: string;
  themeText: string;
  // Autorise à tout désélectionner (ex: filtres, où [] veut dire "pas de filtre").
  // Par défaut, empêche de retirer le dernier élément sélectionné (ex: formulaire recette).
  allowEmpty?: boolean;
};

export const MultiSegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  themeTint,
  themeText,
  allowEmpty,
}: MultiSegmentedControlProps<T>) => {
  const isTintLight = getRelativeLuminance(themeTint) > 0.65;
  const activeTextColor = isTintLight ? '#111' : '#fff';

  const toggle = (option: T) => {
    if (value.includes(option)) {
      if (!allowEmpty && value.length === 1) return;
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <View style={styles.segmentContainer}>
      {options.map((option) => {
        const isActive = value.includes(option.value);
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
            onPress={() => toggle(option.value)}
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
});
