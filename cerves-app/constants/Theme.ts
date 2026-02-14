export const Theme = {
  colors: {
    // Primary colors (blue tones like the image)
    primary: '#00D4FF',
    primaryDark: '#0099CC',
    primaryLight: '#66E0FF',
    
    // Secondary colors
    secondary: '#FFD700',
    secondaryDark: '#FFA500',
    
    // Status colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    
    // Background colors
    background: '#1A1A2E',
    backgroundLight: '#16213E',
    backgroundCard: '#0F3460',
    streakBackgroundCard: '#fcba03',
    
    // Text colors
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textMuted: '#808080',
    
    // Glass fill states
    glassEmpty: '#2A2A3E',
    glassQuarter: '#00D4FF',
    glassHalf: '#0099CC',
    glassFull: '#0066AA',
    glassOverflow: '#FF6B6B',
    
    // UI elements
    border: '#334155',
    borderActive: '#00D4FF',
    disabled: '#4A5568',
    streakBorder: '#fc6203',
  },
  
  fonts: {
    pixel: 'PressStart2P',  // For headings/titles
    mono: 'SpaceMono',      // For numbers/stats
    system: 'System',       // For body text (readable)
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  
  fontSize: {
    xxs: 8,
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 48,
  },
  
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};