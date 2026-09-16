import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { SiteSettings, Theme } from '@/lib/types';

interface SettingsContextValue {
  settings: SiteSettings | null;
  theme: Theme | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadSettings() {
    setLoading(true);

    const { data: settingsData, error: settingsError } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (settingsError) {
      console.error('Error loading settings:', settingsError);
      setSettings(null);
      setTheme(null);
      setLoading(false);
      return;
    }

    const siteSettings = settingsData as SiteSettings | null;
    setSettings(siteSettings);

    let activeTheme: Theme | null = null;

    if (siteSettings?.active_theme_id) {
      const { data: themeData, error: themeError } = await supabase
        .from('themes')
        .select('*')
        .eq('id', siteSettings.active_theme_id)
        .maybeSingle();

      if (themeError) {
        console.error('Error loading active theme:', themeError);
      }

      activeTheme = themeData as Theme | null;
    }

    setTheme(activeTheme);
    applyTheme(activeTheme);

    setLoading(false);
  }

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        theme,
        loading,
        refresh: loadSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

function applyTheme(theme: Theme | null) {
  const root = document.documentElement;

  if (!theme) {
    root.style.removeProperty('--theme-primary');
    root.style.removeProperty('--theme-secondary');
    root.style.removeProperty('--theme-accent');
    root.style.removeProperty('--theme-text');
    root.style.removeProperty('--theme-background');
    root.style.removeProperty('--theme-button');
    root.style.removeProperty('--theme-hero-image');
    root.style.removeProperty('--theme-font');
    return;
  }

  root.style.setProperty('--theme-primary', theme.primary_color);
  root.style.setProperty('--theme-secondary', theme.secondary_color);
  root.style.setProperty('--theme-accent', theme.accent_color);
  root.style.setProperty('--theme-text', theme.text_color);
  root.style.setProperty('--theme-background', theme.background_color);
  root.style.setProperty('--theme-button', theme.button_color);

  if (theme.hero_image) {
    root.style.setProperty('--theme-hero-image', `url("${theme.hero_image}")`);
  } else {
    root.style.removeProperty('--theme-hero-image');
  }

  if (theme.font_family) {
    root.style.setProperty('--theme-font', theme.font_family);
  } else {
    root.style.removeProperty('--theme-font');
  }
}

export function useSettings() {
  const ctx = useContext(SettingsContext);

  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }

  return ctx;
}