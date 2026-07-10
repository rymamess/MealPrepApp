import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getContrastTextColor } from '@/utils/color';
import { formatISODate, parseISODate } from '@/utils/week';

const MONTH_NAMES = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];
const WEEKDAY_HEADERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

// Grille du mois, alignée sur des semaines commençant le lundi. `null` = case vide (hors mois).
function getMonthGrid(viewMonth: Date): (Date | null)[] {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const firstWeekday = firstDay.getDay(); // 0 = dimanche
  const leadingBlanks = firstWeekday === 0 ? 6 : firstWeekday - 1;

  const cells: (Date | null)[] = Array(leadingBlanks).fill(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

type Props = {
  label: string;
  value: string | null; // 'YYYY-MM-DD'
  onChange: (value: string | null) => void;
  allowClear?: boolean;
  clearLabel?: string;
};

export function DateField({ label, value, onChange, allowClear = false, clearLabel = 'Aucune date' }: Props) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [visible, setVisible] = useState(false);
  const selectedDate = value ? parseISODate(value) : null;
  const [viewMonth, setViewMonth] = useState(() => selectedDate ?? new Date());

  const grid = useMemo(() => getMonthGrid(viewMonth), [viewMonth]);
  const selectedTextColor = getContrastTextColor(theme.tint);

  const open = () => {
    setViewMonth(selectedDate ?? new Date());
    setVisible(true);
  };

  const handleSelectDay = (day: Date) => {
    onChange(formatISODate(day));
    setVisible(false);
  };

  const handleClear = () => {
    onChange(null);
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <Pressable style={[styles.field, { borderColor: theme.border }]} onPress={open}>
        <Text style={[styles.fieldText, { color: value ? theme.text : `${theme.text}80` }]}>
          {selectedDate ? formatDisplayDate(selectedDate) : clearLabel}
        </Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.monthNav}>
              <Pressable
                style={[styles.navButton, { borderColor: theme.border }]}
                onPress={() => setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                hitSlop={8}
              >
                <Text style={{ color: theme.text, fontWeight: '700' }}>‹</Text>
              </Pressable>
              <Text style={[styles.monthLabel, { color: theme.text }]}>
                {MONTH_NAMES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
              </Text>
              <Pressable
                style={[styles.navButton, { borderColor: theme.border }]}
                onPress={() => setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                hitSlop={8}
              >
                <Text style={{ color: theme.text, fontWeight: '700' }}>›</Text>
              </Pressable>
            </View>

            <View style={styles.weekdayRow}>
              {WEEKDAY_HEADERS.map((d, i) => (
                <Text key={i} style={[styles.weekdayLabel, { color: `${theme.text}88` }]}>{d}</Text>
              ))}
            </View>

            <View style={styles.grid}>
              {grid.map((day, index) => {
                if (!day) return <View key={index} style={styles.dayCell} />;
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                return (
                  <Pressable
                    key={index}
                    style={[styles.dayCell, isSelected && { backgroundColor: theme.tint, borderRadius: 999 }]}
                    onPress={() => handleSelectDay(day)}
                  >
                    <Text style={{ color: isSelected ? selectedTextColor : theme.text }}>{day.getDate()}</Text>
                  </Pressable>
                );
              })}
            </View>

            {allowClear ? (
              <Pressable style={styles.clearButton} onPress={handleClear}>
                <Text style={[styles.clearLabel, { color: theme.tint }]}>{clearLabel}</Text>
              </Pressable>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function formatDisplayDate(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  field: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  fieldText: {
    fontSize: 15,
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
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    alignItems: 'center',
    paddingTop: 4,
  },
  clearLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
