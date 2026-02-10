import { Text, StyleSheet, TextStyle } from 'react-native';
import { Theme } from '@/constants/Theme';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
  numberOfLines?: number;
}

export function Typography({ 
    children, 
    variant = 'body', 
    color = Theme.colors.text,
    align = 'left',
    style,
    numberOfLines
  }: TypographyProps) {
    return (
      <Text style={[
        styles.base,
        styles[variant],
        { color, textAlign: align },
        style
      ]}
        numberOfLines={numberOfLines} 
      >
        {children}
      </Text>
    );  
  }

const styles = StyleSheet.create({
  base: {
    color: Theme.colors.text,
    fontFamily: Theme.fonts.pixel, 
  },
  h1: {
    fontSize: Theme.fontSize.xxxl,
    fontWeight: Theme.fontWeight.bold,
  },
  h2: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: Theme.fontWeight.bold,
  },
  h3: {
    fontSize: Theme.fontSize.xl,
    fontWeight: Theme.fontWeight.semibold,
  },
  body: {
    fontSize: Theme.fontSize.base,
    fontWeight: Theme.fontWeight.normal,
  },
  caption: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.normal,
    color: Theme.colors.textSecondary,
  },
  label: {
    fontSize: Theme.fontSize.sm,
    fontWeight: Theme.fontWeight.semibold,
  },
});