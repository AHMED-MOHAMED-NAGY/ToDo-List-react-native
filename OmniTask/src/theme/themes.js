/**
 * OmniTask - Theme Configurations
 * Light, Dark, and Neon theme color palettes
 */

export const themes = {
  // ──────────────────────────────────────────────
  // LIGHT THEME
  // ──────────────────────────────────────────────
  light: {
    name: 'Light',
    isDark: false,
    colors: {
      // Surface & Background
      background: '#F5F7FA',
      surface: '#FFFFFF',
      surfaceElevated: '#FFFFFF',
      card: '#FFFFFF',

      // Primary & Accent
      primary: '#4A6CF7',
      primaryLight: '#7B93F9',
      primaryDark: '#2A4AD4',
      accent: '#FF6B6B',

      // Text
      textPrimary: '#1A1C2B',
      textSecondary: '#6B7280',
      textMuted: '#9CA3AF',
      textOnPrimary: '#FFFFFF',

      // Status Colors
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',

      // Priority Colors
      priorityHigh: '#EF4444',
      priorityMedium: '#F59E0B',
      priorityLow: '#10B981',

      // Borders & Dividers
      border: '#E5E7EB',
      divider: '#F3F4F6',

      // Floating Widget
      widgetBackground: 'rgba(255, 255, 255, 0.95)',
      widgetShadow: 'rgba(0, 0, 0, 0.15)',

      // Navigation
      tabActive: '#4A6CF7',
      tabInactive: '#9CA3AF',
      tabBackground: '#FFFFFF',

      // Status Bar
      statusBar: '#F5F7FA',
      statusBarStyle: 'dark-content',
    },
    shadows: {
      small: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
      },
    },
  },

  // ──────────────────────────────────────────────
  // DARK THEME
  // ──────────────────────────────────────────────
  dark: {
    name: 'Dark',
    isDark: true,
    colors: {
      // Surface & Background
      background: '#0F1117',
      surface: '#1A1D29',
      surfaceElevated: '#232736',
      card: '#1E2233',

      // Primary & Accent
      primary: '#6C8AFF',
      primaryLight: '#8FA8FF',
      primaryDark: '#4A6CF7',
      accent: '#FF7B7B',

      // Text
      textPrimary: '#E8ECF4',
      textSecondary: '#8B95A8',
      textMuted: '#5A6478',
      textOnPrimary: '#FFFFFF',

      // Status Colors
      success: '#34D399',
      warning: '#FBBF24',
      error: '#F87171',
      info: '#60A5FA',

      // Priority Colors
      priorityHigh: '#F87171',
      priorityMedium: '#FBBF24',
      priorityLow: '#34D399',

      // Borders & Dividers
      border: '#2D3348',
      divider: '#1F2437',

      // Floating Widget
      widgetBackground: 'rgba(26, 29, 41, 0.96)',
      widgetShadow: 'rgba(0, 0, 0, 0.5)',

      // Navigation
      tabActive: '#6C8AFF',
      tabInactive: '#5A6478',
      tabBackground: '#141722',

      // Status Bar
      statusBar: '#0F1117',
      statusBarStyle: 'light-content',
    },
    shadows: {
      small: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
      },
    },
  },

  // ──────────────────────────────────────────────
  // NEON THEME
  // ──────────────────────────────────────────────
  neon: {
    name: 'Neon',
    isDark: true,
    colors: {
      // Surface & Background
      background: '#050508',
      surface: '#0D0E14',
      surfaceElevated: '#13141C',
      card: '#10111A',

      // Primary & Accent - Neon Cyan & Magenta
      primary: '#00F5FF',
      primaryLight: '#33F7FF',
      primaryDark: '#00C4CC',
      accent: '#FF00E5',

      // Text
      textPrimary: '#E0F7FA',
      textSecondary: '#7FDBFF',
      textMuted: '#3A6073',
      textOnPrimary: '#050508',

      // Status Colors
      success: '#00FF88',
      warning: '#FFE500',
      error: '#FF0055',
      info: '#00BFFF',

      // Priority Colors
      priorityHigh: '#FF0055',
      priorityMedium: '#FFE500',
      priorityLow: '#00FF88',

      // Borders & Dividers - Subtle neon glow
      border: '#1A2F3A',
      divider: '#0D1A22',

      // Floating Widget
      widgetBackground: 'rgba(13, 14, 20, 0.97)',
      widgetShadow: 'rgba(0, 245, 255, 0.15)',

      // Navigation
      tabActive: '#00F5FF',
      tabInactive: '#3A6073',
      tabBackground: '#080A10',

      // Neon Glow Colors
      glowCyan: 'rgba(0, 245, 255, 0.3)',
      glowMagenta: 'rgba(255, 0, 229, 0.3)',
      glowGreen: 'rgba(0, 255, 136, 0.3)',
      glowYellow: 'rgba(255, 229, 0, 0.3)',
      glowRed: 'rgba(255, 0, 85, 0.3)',

      // Status Bar
      statusBar: '#050508',
      statusBarStyle: 'light-content',
    },
    shadows: {
      small: {
        shadowColor: '#00F5FF',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
      },
      medium: {
        shadowColor: '#00F5FF',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
      },
      large: {
        shadowColor: '#FF00E5',
        shadowOffset: {width: 0, height: 6},
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
      },
    },
  },
};

/**
 * Gets the current theme object by key
 * @param {string} themeKey - 'light', 'dark', or 'neon'
 * @returns {Object} Theme config object
 */
export const getTheme = (themeKey) => {
  return themes[themeKey] || themes.dark;
};

/**
 * Shared typography scales
 */
export const typography = {
  h1: {fontSize: 28, fontWeight: '700', letterSpacing: -0.5},
  h2: {fontSize: 22, fontWeight: '700', letterSpacing: -0.3},
  h3: {fontSize: 18, fontWeight: '600'},
  body: {fontSize: 15, fontWeight: '400', lineHeight: 22},
  bodySmall: {fontSize: 13, fontWeight: '400', lineHeight: 18},
  caption: {fontSize: 11, fontWeight: '500', letterSpacing: 0.5},
  button: {fontSize: 15, fontWeight: '600', letterSpacing: 0.3},
};

/**
 * Shared spacing scale
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * Shared border radius
 */
export const borderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};
