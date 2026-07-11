import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = Omit<TextInputProps, 'style' | 'placeholderTextColor'> & {
  containerStyle?: TextInputProps['style'];
};

export function SearchInput({ placeholder = 'Rechercher...', containerStyle, ...props }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <TextInput
      style={[styles.input, { borderColor: theme.border, color: theme.text }, containerStyle]}
      placeholder={placeholder}
      placeholderTextColor={`${theme.text}55`}
      autoCapitalize="none"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
});
