import { View, Text, StyleSheet, Image } from 'react-native';
import { Theme } from '@/constants/Theme';

type FillState = 'empty' | 'quarter' | 'half' | 'full' | 'overflow';

interface GlassDayProps {
  dayShort: string;
  liters: number;
  fillState: FillState;
  isToday?: boolean;
}

// Mapeo de estados a imágenes
const glassImages = {
  empty: require('@/assets/images/secuenciaCerveza/secuenciaCerveza0.png'),
  quarter: require('@/assets/images/secuenciaCerveza/secuenciaCerveza1.png'),
  half: require('@/assets/images/secuenciaCerveza/secuenciaCerveza2.png'),
  full: require('@/assets/images/secuenciaCerveza/secuenciaCerveza3.png'),
  overflow: require('@/assets/images/secuenciaCerveza/secuenciaCerveza3.png'), // Desbordando usa la misma que full
};

export function GlassDay({ dayShort, liters, fillState, isToday }: GlassDayProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.dayLabel}>{dayShort}</Text>
      
      <View style={[
        styles.glass,
        isToday ? styles.glassToday : { borderColor: Theme.colors.border, borderWidth: 2 }
        ]}>
        <Image 
          source={glassImages[fillState]} 
          style={styles.glassImage}
          resizeMode="contain"
        />
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
    fontFamily: Theme.fonts.pixel,
  },
  glass: {
    width: 40,
    height: 60,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    backgroundColor: 'transparent',
    },
    glassToday: {
    borderColor: Theme.colors.secondary,
    borderWidth: 3,
    },
  glassImage: {
    width: 36,
    height: 56,
  },
  litersText: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.pixel,
  },
});