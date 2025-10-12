// /components/themed-text.tsx
import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

type TextType = 'default' | 'defaultSemiBold' | 'title' | 'subtitle';

type Props = TextProps & {
  type?: TextType;
  children: React.ReactNode;
};

export const ThemedText: React.FC<Props> = ({ type = 'default', style, children, ...props }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const textStyles = StyleSheet.create({
    default: { color: theme.text },
    defaultSemiBold: { color: theme.text, fontWeight: '600' },
    title: { color: theme.text, fontSize: 24, fontWeight: '700' },
    subtitle: { color: theme.text, fontSize: 18, fontWeight: '600' },
  });

  return (
    <Text style={[textStyles[type], style]} {...props}>
      {children}
    </Text>
  );
};
