import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Meal } from '@/types/Meal';

type Props = {
  meal: Meal;
  onPress?: () => void;
  footer?: React.ReactNode;
};

export const MealCard: React.FC<Props> = ({ meal, onPress, footer }) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    router.push(`/meals/${meal._id}`);
  };

  return (
    <Pressable
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      android_ripple={{ color: `${theme.tint}33` }}
      onPress={handlePress}
    >
      <Image source={{ uri: meal.photo }} style={styles.image} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
          {meal.name}
        </Text>
        <Text style={[styles.meta, { color: theme.text }]} numberOfLines={1}>
          {`Préparation ${meal.prepTime} • Cuisson ${meal.cookTime}`}
        </Text>
        <Text style={[styles.tag, { color: theme.text }]}>{meal.difficulty}</Text>
      </View>
      {footer ? <View style={[styles.footer, { borderTopColor: theme.border }]}>{footer}</View> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  image: {
    width: '100%',
    height: 160,
  },
  info: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
    opacity: 0.7,
  },
  tag: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    opacity: 0.8,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});
