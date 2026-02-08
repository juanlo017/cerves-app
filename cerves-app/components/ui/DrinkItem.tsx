import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';
import { Typography } from './Typography';

interface DrinkItemProps {
  name: string;
  liters: number;
  calories: number; // ← Changed from price
  onPress: () => void;
}

export function DrinkItem({ name, liters, calories, onPress }: DrinkItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.info}>
        <Typography variant="h3">{name}</Typography>
        <Typography variant="caption" style={styles.details}>
          {liters}L • {calories} kcal
        </Typography>
      </View>
      <Typography variant="h3" color={Theme.colors.primary}>
        +
      </Typography>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.backgroundCard,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginVertical: Theme.spacing.sm,
    marginHorizontal: Theme.spacing.md,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  details: {
    marginTop: Theme.spacing.xs,
  },
});