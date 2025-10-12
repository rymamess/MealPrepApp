// /components/themed-view.tsx
import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

type Props = ViewProps & {
  children: React.ReactNode;
};

export const ThemedView: React.FC<Props> = ({ style, children, ...props }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View
      style={[{ backgroundColor: theme.background }, style]}
      {...props}
    >
      {children}
    </View>
  );
};
