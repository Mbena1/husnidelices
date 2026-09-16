import { createContext, useContext, type ReactNode } from 'react';
import { useSettings } from './SettingsContext';
import type { Theme } from '@/lib/types';

interface ThemeContextValue {
  theme: Theme | null;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, loading } = useSettings();

  return (
    <ThemeContext.Provider value={{ theme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);

  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return ctx;
}