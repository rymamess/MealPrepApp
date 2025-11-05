import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
  onEdit: () => void;
  onDelete: () => void;
};

export const UserMealActions: React.FC<Props> = ({ onEdit, onDelete }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      <Pressable style={[styles.outlineButton, { borderColor: theme.border }]} onPress={onEdit}>
        <Text style={[styles.label, { color: theme.tint }]}>Modifier</Text>
      </Pressable>
      <Pressable style={styles.destructiveButton} onPress={onDelete}>
        <Text style={[styles.label, styles.destructiveLabel]}>Supprimer</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  outlineButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destructiveButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff6b6b1a',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  destructiveLabel: {
    color: '#d64545',
  },
});
