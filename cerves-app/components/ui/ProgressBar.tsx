import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

interface ProgressBarProps {
  current: number;
  goal: number;
  showPercentage?: boolean;
  showValues?: boolean;
  color?: string;
}

export function ProgressBar({ 
  current, 
  goal, 
  showPercentage = true, 
  showValues = true,
  color = Theme.colors.primary 
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((current / goal) * 100), 100);
  
  return (
    <View style={styles.container}>
      {showValues && (
        <Text style={styles.valuesText}>
          {current.toFixed(1)}L / {goal}L
        </Text>
      )}
      
      <View style={styles.barContainer}>
        <View 
          style={[
            styles.barFill, 
            { width: `${percentage}%`, backgroundColor: color }
          ]} 
        />
      </View>
      
      {showPercentage && (
        <Text style={styles.percentageText}>{percentage}%</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  valuesText: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
    fontFamily: Theme.fonts.mono, // ← Añadido
  },
  barContainer: {
    width: '100%',
    height: 24,
    backgroundColor: Theme.colors.glassEmpty,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Theme.colors.border,
  },
  barFill: {
    height: '100%',
  },
  percentageText: {
    fontSize: Theme.fontSize.base,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: Theme.spacing.sm,
    fontFamily: Theme.fonts.mono, // ← Añadido
  },
});