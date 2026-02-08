import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Theme } from '@/constants/Theme';

interface IconButtonProps {
  onPress: () => void;
  icon: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export function IconButton({ onPress, icon, disabled, style }: IconButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
        style
      ]}
    >
      <Text style={[styles.icon, disabled && styles.iconDisabled]}>
        {icon}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.primary,
  },
  buttonDisabled: {
    backgroundColor: Theme.colors.disabled,
    borderColor: Theme.colors.border,
  },
  icon: {
    fontSize: Theme.fontSize.xl,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.pixel, // ← Añadido
  },
  iconDisabled: {
    color: Theme.colors.textMuted,
  },
});