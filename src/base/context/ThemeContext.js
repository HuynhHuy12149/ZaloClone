import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme, Appearance } from 'react-native';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { getCache, setCache, CACHE_KEYS } from '@/base/shared/store/cache';

const ThemeContext = createContext({
  themeMode: 'system', // 'light' | 'dark' | 'system'
  isDark: true,
  setThemeMode: () => {},
  toggleTheme: () => {},
  colors: {},
});

export const lightColors = {
  bg: '#f2f2f7',
  bgCard: '#ffffff',
  bgSection: '#f2f2f7',
  bgInput: '#e5e5ea',
  bgHeader: '#ffffff',
  bgHighlight: '#e8f0fe',
  bgStory: '#e5e5ea',
  text: '#0a0a0a',
  textSub: '#6b7280',
  textPlaceholder: '#9ca3af',
  textMuted: '#9ca3af',
  icon: '#0068ff',
  iconSub: '#9ca3af',
  iconAction: '#374151',
  border: '#e5e7eb',
  divider: '#f3f4f6',
  tabBg: '#ffffff',
  tabBorder: '#e5e7eb',
  tabActive: '#0068ff',
  tabInactive: '#9ca3af',
  online: '#22c55e',
  badge: '#ef4444',
  searchBg: '#e5e7eb',
  searchText: '#6b7280',
  accent: '#0068ff',
  accentLight: '#e8f0fe',
  storyBorder: '#0068ff',
  postAction: '#6b7280',
  headerText: '#0a0a0a',
  navBg: '#ffffff',
  shimmer: '#e5e7eb',
};

export const darkColors = {
  bg: '#000000',
  bgCard: '#1c1c1e',
  bgSection: '#111111',
  bgInput: '#2c2c2e',
  bgHeader: '#1c1c1e',
  bgHighlight: '#1e3a5f',
  bgStory: '#2c2c2e',
  text: '#f9f9f9',
  textSub: '#8e8e93',
  textPlaceholder: '#636366',
  textMuted: '#636366',
  icon: '#0a84ff',
  iconSub: '#636366',
  iconAction: '#ebebf5',
  border: '#2c2c2e',
  divider: '#1c1c1e',
  tabBg: '#1c1c1e',
  tabBorder: '#38383a',
  tabActive: '#0a84ff',
  tabInactive: '#636366',
  online: '#32d74b',
  badge: '#ff453a',
  searchBg: '#2c2c2e',
  searchText: '#8e8e93',
  accent: '#0a84ff',
  accentLight: '#1e3a5f',
  storyBorder: '#0a84ff',
  postAction: '#8e8e93',
  headerText: '#f9f9f9',
  navBg: '#1c1c1e',
  shimmer: '#2c2c2e',
};

export function ThemeProvider({ children }) {
  const deviceColorScheme = useDeviceColorScheme();
  const { setColorScheme: setNwColorScheme } = useNativeWindColorScheme();

  const [themeMode, setThemeModeState] = useState('system'); // 'light' | 'dark' | 'system'
  const [deviceTheme, setDeviceTheme] = useState(deviceColorScheme || 'light');

  // Load saved theme preference from Cache
  useEffect(() => {
    getCache(CACHE_KEYS.THEME_MODE).then((savedMode) => {
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        setThemeModeState(savedMode);
        applyTheme(savedMode, deviceTheme);
      } else {
        applyTheme('system', deviceTheme);
      }
    });

    // Listen to device theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setDeviceTheme(colorScheme || 'light');
      if (themeMode === 'system') {
        applyTheme('system', colorScheme || 'light');
      }
    });

    return () => subscription.remove();
  }, []);

  const applyTheme = (mode, currentDeviceTheme) => {
    const effectiveTheme = mode === 'system' ? (currentDeviceTheme || 'light') : mode;
    if (setNwColorScheme) {
      setNwColorScheme(effectiveTheme);
    }
  };

  const setThemeMode = async (mode) => {
    setThemeModeState(mode);
    applyTheme(mode, deviceTheme);
    await setCache(CACHE_KEYS.THEME_MODE, mode);
  };

  const toggleTheme = () => {
    const isCurrentlyDark = themeMode === 'system' ? deviceTheme === 'dark' : themeMode === 'dark';
    const nextMode = isCurrentlyDark ? 'light' : 'dark';
    setThemeMode(nextMode);
  };

  // Determine current active dark mode state
  const isDark = themeMode === 'system' ? deviceTheme === 'dark' : themeMode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, setThemeMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
