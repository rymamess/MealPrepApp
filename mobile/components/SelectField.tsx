import React, { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getContrastTextColor } from '@/utils/color';

type Option<T extends string> = {
  label: string;
  value: T;
};

type Props<T extends string> = {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
};

export function SelectField<T extends string>({ value, options, onChange, disabled = false }: Props<T>) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [visible, setVisible] = useState(false);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;
  const contrastColor = getContrastTextColor(theme.tint);

  const handleSelect = (option: Option<T>) => {
    onChange(option.value);
    setVisible(false);
  };

  return (
    <View>
      <Pressable
        style={[styles.field, { borderColor: theme.border, opacity: disabled ? 0.5 : 1 }]}
        onPress={() => !disabled && setVisible(true)}
        disabled={disabled}
      >
        <Text style={[styles.fieldText, { color: theme.text }]} numberOfLines={1}>
          {selectedLabel}
        </Text>
        {disabled ? (
          <ActivityIndicator size="small" color={theme.text} />
        ) : (
          <Text style={[styles.chevron, { color: `${theme.text}88` }]}>▾</Text>
        )}
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={(e) => e.stopPropagation()}>
            <ScrollView style={styles.optionsList}>
              {options.map((option) => {
                const isActive = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    style={[styles.option, isActive && { backgroundColor: theme.tint }]}
                    onPress={() => handleSelect(option)}
                  >
                    <Text style={[styles.optionLabel, { color: isActive ? contrastColor : theme.text }]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  fieldText: {
    fontSize: 14,
    flex: 1,
  },
  chevron: {
    fontSize: 12,
  },
  backdrop: {
    flex: 1,
    backgroundColor: '#00000066',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 280,
    maxHeight: 360,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 8,
  },
  optionsList: {
    maxHeight: 340,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});
