import { View, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';
import { Typography } from './Typography';

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onChange: (value: number) => void;
}

export function QuantitySelector({ quantity, onIncrease, onDecrease, onChange }: QuantitySelectorProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={onDecrease}
        disabled={quantity <= 1}
      >
        <Typography variant="h2" color={quantity <= 1 ? Theme.colors.disabled : Theme.colors.text}>
          -
        </Typography>
      </TouchableOpacity>
      
      <TextInput
        style={styles.input}
        value={quantity.toString()}
        onChangeText={(text) => {
          const num = parseInt(text) || 1;
          onChange(Math.max(1, num));
        }}
        keyboardType="number-pad"
        selectTextOnFocus
      />
      
      <TouchableOpacity style={styles.button} onPress={onIncrease}>
        <Typography variant="h2" color={Theme.colors.text}>
          +
        </Typography>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Theme.spacing.md,
  },
  button: {
    width: 50,
    height: 50,
    backgroundColor: Theme.colors.backgroundCard,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: 80,
    height: 60,
    backgroundColor: Theme.colors.backgroundCard,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    textAlign: 'center',
    fontSize: Theme.fontSize.xl,
    color: Theme.colors.text,
    fontFamily: Theme.fonts.pixel,
  },
});