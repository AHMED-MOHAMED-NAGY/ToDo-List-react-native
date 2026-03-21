/**
 * OmniTask - Theme Context Provider
 * Provides theme-aware styling throughout the app via React Context
 */
import React, {createContext, useContext, useMemo} from 'react';
import {useAppStore} from '../core/store/useAppStore';
import {getTheme, typography, spacing, borderRadius} from './themes';

const ThemeContext = createContext(null);

/**
 * ThemeProvider - Wraps the app and exposes current theme
 */
export const ThemeProvider = ({children}) => {
  const theme = useAppStore((state) => state.theme);

  const value = useMemo(() => {
    const currentTheme = getTheme(theme);
    return {
      theme: currentTheme,
      colors: currentTheme.colors,
      shadows: currentTheme.shadows,
      isDark: currentTheme.isDark,
      themeName: theme,
      typography,
      spacing,
      borderRadius,
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access the current theme
 * @returns {Object} {theme, colors, shadows, isDark, themeName, typography, spacing, borderRadius}
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
