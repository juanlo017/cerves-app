import { Text, StyleSheet, TextStyle } from 'react-native';
import { Theme } from '@/constants/Theme';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
}

export function Typography({ 
  children, 
  variant = 'body', 
  color = Theme.colors.text,
  align = 'left',
  style 
}: TypographyProps) {
  return (
    <Text style={[
      styles.base,
      styles[variant],
      { color, textAlign: align },
      style
    ]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: Theme.colors.text,
  },
  h1: {
    fontSize: Theme.fontSize.xxxl,
    fontWeight: Theme.fontWeight.bold,
    fontFamily: Theme.fonts.pixel, // Pixel font for big headings
  },
  h2: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: Theme.fontWeight.bold,
    fontFamily: Theme.fonts.pixel,
  },
  h3: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.semibold,
    fontFamily: Theme.fonts.pixel,
  },
  body: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.normal,
    fontFamily: Theme.fonts.system, // System for readability
  },
  caption: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.normal,
    color: Theme.colors.textSecondary,
    fontFamily: Theme.fonts.system,
  },
  label: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.semibold,
    fontFamily: Theme.fonts.mono, // Monospace for labels/stats
  },
});