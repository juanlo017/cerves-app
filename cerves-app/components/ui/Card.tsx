import { View, StyleSheet, ViewStyle } from 'react-native';
import { Theme } from '@/constants/Theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'highlight' | 'dark';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  return (
    <View style={[
      styles.card,
      variant === 'highlight' && styles.cardHighlight,
      variant === 'dark' && styles.cardDark,
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.backgroundCard,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginHorizontal: Theme.spacing.md,
    marginVertical: Theme.spacing.sm,
    borderWidth: 2,
    borderColor: Theme.colors.border,
  },
  cardHighlight: {
    borderColor: Theme.colors.primary,
    backgroundColor: Theme.colors.backgroundLight,
  },
  cardDark: {
    backgroundColor: Theme.colors.background,
  },
});