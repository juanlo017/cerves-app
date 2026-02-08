import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';

interface StatItemProps {
  icon: string;
  value: string | number;
  label?: string;
}

export function StatItem({ icon, value, label }: StatItemProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.value}>{value}</Text>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    minWidth: 80,
  },
  icon: {
    fontSize: 28,
    marginBottom: Theme.spacing.xs,
  },
  value: {
    fontSize: Theme.fontSize.lg,
    fontWeight: Theme.fontWeight.bold,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.mono, // ← Añadido
  },
  label: {
    fontSize: Theme.fontSize.xs,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
    fontFamily: Theme.fonts.system, // ← Añadido
  },
});