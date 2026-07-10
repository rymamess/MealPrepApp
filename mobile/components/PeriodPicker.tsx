import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DateField } from '@/components/DateField';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatISODate } from '@/utils/week';

type Props = {
  periodStart: string;
  periodEnd: string;
  onChangeStart: (value: string) => void;
  onChangeEnd: (value: string) => void;
};

export function PeriodPicker({ periodStart, periodEnd, onChangeStart, onChangeEnd }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isPast = periodEnd < formatISODate(new Date());

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.field}>
          <DateField label="Du" value={periodStart} onChange={(v) => v && onChangeStart(v)} />
        </View>
        <View style={styles.field}>
          <DateField label="Au" value={periodEnd} onChange={(v) => v && onChangeEnd(v)} />
        </View>
      </View>
      {isPast ? (
        <Text style={[styles.warning, { color: theme.text }]}>⚠️ Cette période est déjà passée.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  field: {
    flex: 1,
  },
  warning: {
    fontSize: 13,
    fontWeight: '600',
  },
});
