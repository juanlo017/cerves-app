import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

type FillState = 'empty' | 'quarter' | 'half' | 'full' | 'overflow';

interface GlassDayProps {
  dayShort: string;
  liters: number;
  fillState: FillState;
  isToday?: boolean;
}

export function GlassDay({ dayShort, liters, fillState, isToday }: GlassDayProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.dayLabel}>{dayShort}</Text>
      
      <View style={[
        styles.glass,
        styles[`glass_${fillState}`],
        isToday && styles.glassToday
      ]}>
        <Text style={styles.icon}>🍺</Text>
      </View>
      
      <Text style={styles.litersText}>
        {liters > 0 ? `${liters.toFixed(2)}L` : '-'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
  },
  dayLabel: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.sm,
  },
  glass: {
    width: 40,
    height: 60,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
    borderWidth: 2,
  },
  glassToday: {
    borderColor: Theme.colors.secondary,
    borderWidth: 3,
  },
  glass_empty: {
    backgroundColor: Theme.colors.glassEmpty,
    borderColor: Theme.colors.border,
  },
  glass_quarter: {
    backgroundColor: Theme.colors.glassQuarter,
    borderColor: Theme.colors.primary,
  },
  glass_half: {
    backgroundColor: Theme.colors.glassHalf,
    borderColor: Theme.colors.primary,
  },
  glass_full: {
    backgroundColor: Theme.colors.glassFull,
    borderColor: Theme.colors.primaryDark,
  },
  glass_overflow: {
    backgroundColor: Theme.colors.glassOverflow,
    borderColor: Theme.colors.error,
  },
  icon: {
    fontSize: 24,
  },
  litersText: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.textSecondary,
  },
});