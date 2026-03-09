// context/ThemeContext.tsx — Global Tema Yönetimi
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES, ThemeMode, ThemeColors, SharedColors } from '../constants/theme';

interface ThemeContextType {
  mode: ThemeMode;
  theme: ThemeColors;
  shared: SharedColors;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  isSystemTheme: boolean;
  setSystemTheme: (val: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('light');
  const [isSystemTheme, setIsSystemTheme] = useState(true);

  // Uygulama açılışında kayıtlı tercihi yükle
  useEffect(() => {
    AsyncStorage.getItem('themeMode').then((saved) => {
      if (saved === 'system' || !saved) {
        setIsSystemTheme(true);
        setMode(systemScheme === 'dark' ? 'dark' : 'light');
      } else {
        setIsSystemTheme(false);
        setMode(saved as ThemeMode);
      }
    });
  }, []);

  // Sistem teması değişince güncelle
  useEffect(() => {
    if (isSystemTheme) {
      setMode(systemScheme === 'dark' ? 'dark' : 'light');
    }
  }, [systemScheme, isSystemTheme]);

  const toggleTheme = () => {
    const next = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    setIsSystemTheme(false);
    AsyncStorage.setItem('themeMode', next);
  };

  const setThemeMode = (newMode: ThemeMode) => {
    setMode(newMode);
    setIsSystemTheme(false);
    AsyncStorage.setItem('themeMode', newMode);
  };

  const handleSetSystemTheme = (val: boolean) => {
    setIsSystemTheme(val);
    if (val) {
      setMode(systemScheme === 'dark' ? 'dark' : 'light');
      AsyncStorage.setItem('themeMode', 'system');
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        theme: THEMES[mode],
        shared: THEMES.shared,
        toggleTheme,
        setTheme: setThemeMode,
        isSystemTheme,
        setSystemTheme: handleSetSystemTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme, ThemeProvider içinde kullanılmalı');
  return ctx;
};
