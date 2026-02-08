import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Theme } from '@/constants/Theme';
import { Typography } from './Typography';

type FillState = 'empty' | 'quarter' | 'half' | 'full' | 'overflow';

interface CalendarDayProps {
  day: number | null;
  liters: number;
  fillState: FillState;
  isToday?: boolean;
  onPress?: () => void;
}

const glassImages = {
  empty: require('@/assets/images/secuenciaCerveza/secuenciaCerveza0.png'),
  quarter: require('@/assets/images/secuenciaCerveza/secuenciaCerveza1.png'),
  half: require('@/assets/images/secuenciaCerveza/secuenciaCerveza2.png'),
  full: require('@/assets/images/secuenciaCerveza/secuenciaCerveza3.png'),
  overflow: require('@/assets/images/secuenciaCerveza/secuenciaCerveza3.png'),
};

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
      
      <Image 
        source={glassImages[fillState]} 
        style={styles.glassImage}
        resizeMode="contain"
      />
      
      <Typography variant="caption" style={styles.litersText}>
        {liters.toFixed(1)}L
      </Typography>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  emptyCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 3,
  },
  cell: {
    width: '14.28%',
    aspectRatio: 1,
    backgroundColor: Theme.colors.backgroundCard,
    borderRadius: Theme.borderRadius.sm,
    padding: 3,
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
  glassImage: {
    width: 18,
    height: 18,
  },
  litersText: {
    fontSize: 7,
  },
});