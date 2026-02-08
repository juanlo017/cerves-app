import { View, StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';
import { Typography } from './Typography';
import { IconButton } from './IconButton';

interface MonthNavigatorProps {
  month: string; // e.g., "FEBRERO 2024"
  onPrevious: () => void;
  onNext: () => void;
  canGoNext: boolean;
}

export function MonthNavigator({ month, onPrevious, onNext, canGoNext }: MonthNavigatorProps) {
  return (
    <View style={styles.container}>
      <IconButton icon="◀" onPress={onPrevious} />
      
      <Typography variant="h2" align="center" style={styles.month}>
        {month}
      </Typography>
      
      <IconButton icon="▶" onPress={onNext} disabled={!canGoNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.backgroundLight,
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.border,
  },
  month: {
    flex: 1,
    marginHorizontal: Theme.spacing.md,
  },
});