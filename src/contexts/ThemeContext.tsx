import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { Theme, SiteSettings } from '@/lib/types';

interface ThemeContextValue {
  theme: Theme | null;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTheme() {
      setLoading(true);

      // First get site settings to check for active theme
      const { data: settings } = await supabase
        .from('site_settings')
        .select('active_theme_id')
        .limit(1)
        .maybeSingle();

      // Check for an event-based theme that should be active today
      const today = new Date().toISOString().split('T')[0];
      const { data: activeEvent } = await supabase
        .from('events')
        .select('theme_id, theme:themes(*)')
        .lte('start_date', today)
        .gte('end_date', today)
        .eq('is_active', true)
        .maybeSingle();

      if (activeEvent?.theme) {
        setTheme(activeEvent.theme as unknown as Theme);
      } else if (settings?.active_theme_id) {
        const { data: activeTheme } = await supabase
          .from('themes')
          .select('*')
          .eq('id', settings.active_theme_id)
          .maybeSingle();
        if (activeTheme) {
          setTheme(activeTheme as Theme);
        }
      } else {
        // Fall back to default theme
        const { data: defaultTheme } = await supabase
          .from('themes')
          .select('*')
          .eq('is_default', true)
          .maybeSingle();
        setTheme(defaultTheme as Theme | null);
      }

      setLoading(false);
    }

    loadTheme();
  }, []);

  useEffect(() => {
    if (theme) {
      const root = document.documentElement;
      root.style.setProperty('--color-primary', theme.primary_color);
      root.style.setProperty('--color-secondary', theme.secondary_color);
      root.style.setProperty('--color-accent', theme.accent_color);
      root.style.setProperty('--color-text', theme.text_color);
      root.style.setProperty('--color-background', theme.background_color);
      root.style.setProperty('--color-button', theme.button_color);

      document.body.style.backgroundColor = theme.background_color;
      document.body.style.color = theme.text_color;
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
