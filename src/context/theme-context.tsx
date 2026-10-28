import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { Colors } from '@/constants/theme';

export type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  colors: (typeof Colors)[ThemeMode];
  toggleTheme: () => void;
};

const THEME_KEY = 'epmaps.theme';
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') setMode(saved);
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((current) => {
      const next = current === 'light' ? 'dark' : 'light';
      void AsyncStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ mode, colors: Colors[mode], toggleTheme }),
    [mode, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useAppTheme debe usarse dentro de ThemeProvider');
  return theme;
}
