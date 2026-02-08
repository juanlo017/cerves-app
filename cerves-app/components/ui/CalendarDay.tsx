import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '@/constants/Theme';
import { Typography } from './Typography';

type FillState = 'empty' | 'quarter' | 'half' | 'full' | 'overflow';

interface CalendarDayProps {
  day: number | null; // null for empty cells
  liters: number;
  fillState: FillState;
  isToday?: boolean;
  onPress?: () => void;
}

export function CalendarDay({ day, liters, fillState, isToday, onPress }: CalendarDayProps) {
  if (day === null) {
    return <View style={styles.emptyCell} />;
  }

  return (
    <TouchableOpacity 
      style={[
        styles.cell,
        isToday && styles.cellToday
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Typography variant="caption" style={styles.dayNumber}>
        {day}
      </Typography>
      
      <View style={[styles.indicator, styles[`indicator_${fillState}`]]} />
      
      {liters > 0 && (
        <Typography variant="caption" style={styles.litersText}>
          {liters.toFixed(1)}L
        </Typography>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  emptyCell: {
    width: '14.28%', // 100% / 7 days
    aspectRatio: 1,
  },
  cell: {
    width: '14.28%', // 100% / 7 days
    aspectRatio: 1,
    backgroundColor: Theme.colors.backgroundCard,
    borderRadius: Theme.borderRadius.sm,
    padding: 2,
    margin: 1,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cellToday: {
    borderColor: Theme.colors.secondary,
    borderWidth: 2,
  },
  dayNumber: {
    fontSize: 8,
    alignSelf: 'flex-start',
  },
  indicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  indicator_empty: {
    backgroundColor: Theme.colors.glassEmpty,
    borderColor: Theme.colors.border,
  },
  indicator_quarter: {
    backgroundColor: Theme.colors.glassQuarter,
    borderColor: Theme.colors.primary,
  },
  indicator_half: {
    backgroundColor: Theme.colors.glassHalf,
    borderColor: Theme.colors.primary,
  },
  indicator_full: {
    backgroundColor: Theme.colors.glassFull,
    borderColor: Theme.colors.primaryDark,
  },
  indicator_overflow: {
    backgroundColor: Theme.colors.glassOverflow,
    borderColor: Theme.colors.error,
  },
  litersText: {
    fontSize: 7,
  },
});