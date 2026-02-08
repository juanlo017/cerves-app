import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';
import { Typography } from './Typography';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  disabled?: boolean[];
}

export function SegmentedControl({ 
  options, 
  selectedIndex, 
  onSelect,
  disabled = []
}: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const isSelected = selectedIndex === index;
        const isDisabled = disabled[index];
        
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.segment,
              isSelected && styles.segmentSelected,
              isDisabled && styles.segmentDisabled,
            ]}
            onPress={() => !isDisabled && onSelect(index)}
            disabled={isDisabled}
          >
            <Typography
              variant="body"
              color={
                isDisabled 
                  ? Theme.colors.textMuted 
                  : isSelected 
                    ? Theme.colors.background 
                    : Theme.colors.text
              }
            >
              {option}
            </Typography>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.backgroundCard,
    borderRadius: Theme.borderRadius.lg,
    padding: 4,
    marginHorizontal: Theme.spacing.md,
    borderWidth: 2,
    borderColor: Theme.colors.border,
  },
  segment: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  segmentSelected: {
    backgroundColor: Theme.colors.primary,
  },
  segmentDisabled: {
    opacity: 0.5,
  },
});