import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const SPACING = 20;
const MIN_CARD_WIDTH = 200;

type MealGridProps<T> = {
  data: T[];
  loading: boolean;
  error?: string | null;
  renderItem: (item: T) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  refreshing?: boolean;
  onRefresh?: () => void;
  emptyState?: React.ReactNode;
  onRetry?: () => void;
};

export function MealGrid<T>({
  data,
  loading,
  error,
  renderItem,
  keyExtractor,
  refreshing = false,
  onRefresh,
  emptyState,
  onRetry,
}: MealGridProps<T>) {
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const numColumns = useMemo(() => {
    return Math.max(1, Math.floor((width - SPACING) / (MIN_CARD_WIDTH + SPACING)));
  }, [width]);

  const cardWidth = useMemo(() => {
    return (width - SPACING * (numColumns + 1)) / numColumns;
  }, [width, numColumns]);

  const dataWithPlaceholders = useMemo(() => {
    const remainder = data.length % numColumns;
    if (remainder === 0) return data as (T | null)[];

    const placeholders: (T | null)[] = Array(numColumns - remainder).fill(null);
    return [...data, ...placeholders];
  }, [data, numColumns]);

  if (loading) {
    return (
      <View style={styles.feedbackContainer}>
        <ActivityIndicator size="large" color={theme.tint} />
        <Text style={[styles.feedbackText, { color: theme.text }]}>Chargement des recettes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.feedbackContainer}>
        <Text style={[styles.feedbackTitle, { color: theme.text }]}>Une erreur est survenue</Text>
        <Text style={[styles.feedbackText, { color: theme.text }]}>{error}</Text>
        {onRetry && (
          <Pressable style={[styles.retryButton, { borderColor: theme.border }]} onPress={onRetry}>
            <Text style={[styles.retryLabel, { color: theme.tint }]}>Réessayer</Text>
          </Pressable>
        )}
      </View>
    );
  }

  if (data.length === 0 && emptyState) {
    return <View style={styles.feedbackContainer}>{emptyState}</View>;
  }

  return (
    <FlatList
      key={numColumns}
      data={dataWithPlaceholders}
      keyExtractor={(item, index) => (item ? keyExtractor(item, index) : `placeholder-${index}`)}
      numColumns={numColumns}
      renderItem={({ item }) => {
        if (!item) {
          return <View style={[styles.cardWrapper, { width: cardWidth }]} />;
        }

        return <View style={[styles.cardWrapper, { width: cardWidth }]}>{renderItem(item)}</View>;
      }}
      contentContainerStyle={styles.listContent}
      columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh
          ? (
              <RefreshControl
                tintColor={theme.tint}
                colors={[theme.tint]}
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            )
          : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: SPACING,
    paddingBottom: SPACING * 2,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  cardWrapper: {
    marginBottom: SPACING,
  },
  feedbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 12,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  feedbackText: {
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 999,
  },
  retryLabel: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
