import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Theme } from '@/constants/Theme';
import { Typography } from './Typography';

interface GroupSelectorProps {
  groups: Array<{ id: string; name: string }>;
  selectedGroupId: string | null;
  onSelect: (groupId: string) => void;
}

export function GroupSelector({ groups, selectedGroupId, onSelect }: GroupSelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {groups.map((group) => {
        const isSelected = group.id === selectedGroupId;
        return (
          <TouchableOpacity
            key={group.id}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onSelect(group.id)}
          >
            <Typography
              variant="caption"
              style={isSelected ? styles.chipTextSelected : styles.chipText}
            >
              {group.name}
            </Typography>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Theme.spacing.sm,
  },
  content: {
    paddingHorizontal: Theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.backgroundCard,
    marginRight: Theme.spacing.sm,
  },
  chipSelected: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  chipText: {
    color: Theme.colors.textSecondary,
  },
  chipTextSelected: {
    color: Theme.colors.background,
  },
});
