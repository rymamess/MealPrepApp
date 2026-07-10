// /components/themed-view.tsx
import React from 'react';
import { View, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

type Props = ViewProps & {
  children: React.ReactNode;
  // À utiliser sur les écrans sans en-tête natif (headerShown: false),
  // pour ne pas laisser le contenu passer sous la zone de l'heure/batterie.
  safeTop?: boolean;
};

export const ThemedView: React.FC<Props> = ({ style, children, safeTop, ...props }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[{ backgroundColor: theme.background }, safeTop && { paddingTop: insets.top }, style]}
      {...props}
    >
      {children}
    </View>
  );
};
