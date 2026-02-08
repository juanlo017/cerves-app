import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Theme } from '@/constants/Theme';
import { Typography } from './Typography';

interface CategoryCardProps {
  title: string;
  icon: string;
  onPress: () => void;
  style?: ViewStyle;
}

export function CategoryCard({ title, icon, onPress, style }: CategoryCardProps) {
  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress}>
      <Text style={styles.icon}>{icon}</Text>
      <Typography variant="h3" align="center" style={styles.title}>
        {title}
      </Typography>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.backgroundCard,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.xl,
    marginVertical: Theme.spacing.sm,
    marginHorizontal: Theme.spacing.md,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: Theme.spacing.md,
  },
  title: {
    marginTop: Theme.spacing.sm,
  },
});