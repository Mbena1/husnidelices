import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import type { SiteSettings, Theme } from '@/lib/types';

interface SettingsContextValue {
  settings: SiteSettings | null;
  theme: Theme | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SettingsContext = createContext<
  SettingsContextValue | undefined
>(undefined);

export function SettingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [settings, setSettings] =
    useState<SiteSettings | null>(null);

  const [theme, setTheme] =
    useState<Theme | null>(null);

  const [loading, setLoading] =
    useState(true);

  async function loadSettings() {
    try {
      setLoading(true);

      /*
       * =====================================================
       * CHARGEMENT DES PARAMÈTRES DU SITE
       * =====================================================
       */

      const {
        data: settingsData,
        error: settingsError,
      } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (settingsError) {
        console.error(
          'Erreur chargement site_settings:',
          settingsError
        );

        setSettings(null);
        setTheme(null);
        applyTheme(null);

        return;
      }

      const siteSettings =
        settingsData as SiteSettings | null;

      setSettings(siteSettings);

      /*
       * =====================================================
       * AUCUN THÈME ACTIF
       * =====================================================
       */

      if (!siteSettings?.active_theme_id) {
        setTheme(null);
        applyTheme(null);
        return;
      }

      /*
       * =====================================================
       * CHARGEMENT DU THÈME ACTIF
       * =====================================================
       */

      const {
        data: themeData,
        error: themeError,
      } = await supabase
        .from('themes')
        .select('*')
        .eq(
          'id',
          siteSettings.active_theme_id
        )
        .maybeSingle();

      if (themeError) {
        console.error(
          'Erreur chargement thème:',
          themeError
        );

        setTheme(null);
        applyTheme(null);

        return;
      }

      const activeTheme =
        themeData as Theme | null;

      setTheme(activeTheme);

      applyTheme(activeTheme);
    } catch (error) {
      console.error(
        'Erreur inattendue lors du chargement des paramètres:',
        error
      );

      setTheme(null);
      applyTheme(null);
    } finally {
      setLoading(false);
    }
  }

  /*
   * =========================================================
   * CHARGEMENT INITIAL
   * =========================================================
   */

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

/*
 * ===========================================================
 * APPLICATION DU THÈME
 * ===========================================================
 */

function applyTheme(theme: Theme | null) {
  const root = document.documentElement;

  /*
   * ---------------------------------------------------------
   * THÈME PAR DÉFAUT
   * ---------------------------------------------------------
   */

  if (!theme) {
    root.style.setProperty(
      '--theme-primary',
      '#3D2817'
    );

    root.style.setProperty(
      '--theme-secondary',
      '#C8A96A'
    );

    root.style.setProperty(
      '--theme-accent',
      '#D4AF37'
    );

    root.style.setProperty(
      '--theme-text',
      '#2A1F14'
    );

    root.style.setProperty(
      '--theme-background',
      '#FAF6F0'
    );

    root.style.setProperty(
      '--theme-button',
      '#3D2817'
    );

    /*
     * Variables RGB
     */

    root.style.setProperty(
      '--theme-primary-rgb',
      '61, 40, 23'
    );

    root.style.setProperty(
      '--theme-secondary-rgb',
      '200, 169, 106'
    );

    root.style.setProperty(
      '--theme-accent-rgb',
      '212, 175, 55'
    );

    root.style.setProperty(
      '--theme-text-rgb',
      '42, 31, 20'
    );

    root.style.setProperty(
      '--theme-background-rgb',
      '250, 246, 240'
    );

    root.style.setProperty(
      '--theme-button-rgb',
      '61, 40, 23'
    );

    root.style.removeProperty(
      '--theme-font'
    );

    root.style.removeProperty(
      '--theme-hero-image'
    );

    /*
     * Fond et texte du document
     */

    document.body.style.backgroundColor =
      '#FAF6F0';

    document.body.style.color =
      '#2A1F14';

    return;
  }

  /*
   * ---------------------------------------------------------
   * COULEURS DU THÈME ACTIF
   * ---------------------------------------------------------
   */

  root.style.setProperty(
    '--theme-primary',
    theme.primary_color
  );

  root.style.setProperty(
    '--theme-secondary',
    theme.secondary_color
  );

  root.style.setProperty(
    '--theme-accent',
    theme.accent_color
  );

  root.style.setProperty(
    '--theme-text',
    theme.text_color
  );

  root.style.setProperty(
    '--theme-background',
    theme.background_color
  );

  root.style.setProperty(
    '--theme-button',
    theme.button_color
  );

  /*
   * ---------------------------------------------------------
   * VARIABLES RGB
   * ---------------------------------------------------------
   *
   * Elles permettent d'utiliser :
   *
   * rgba(var(--theme-primary-rgb), 0.5)
   *
   * pour créer des couleurs transparentes.
   */

  root.style.setProperty(
    '--theme-primary-rgb',
    hexToRgb(theme.primary_color)
  );

  root.style.setProperty(
    '--theme-secondary-rgb',
    hexToRgb(theme.secondary_color)
  );

  root.style.setProperty(
    '--theme-accent-rgb',
    hexToRgb(theme.accent_color)
  );

  root.style.setProperty(
    '--theme-text-rgb',
    hexToRgb(theme.text_color)
  );

  root.style.setProperty(
    '--theme-background-rgb',
    hexToRgb(theme.background_color)
  );

  root.style.setProperty(
    '--theme-button-rgb',
    hexToRgb(theme.button_color)
  );

  /*
   * ---------------------------------------------------------
   * POLICE
   * ---------------------------------------------------------
   */

  if (theme.font_family) {
    root.style.setProperty(
      '--theme-font',
      theme.font_family
    );
  } else {
    root.style.removeProperty(
      '--theme-font'
    );
  }

  /*
   * ---------------------------------------------------------
   * IMAGE HERO
   * ---------------------------------------------------------
   */

  if (theme.hero_image) {
    root.style.setProperty(
      '--theme-hero-image',
      `url("${theme.hero_image}")`
    );
  } else {
    root.style.removeProperty(
      '--theme-hero-image'
    );
  }

  /*
   * ---------------------------------------------------------
   * FOND ET TEXTE GLOBAL
   * ---------------------------------------------------------
   */

  document.body.style.backgroundColor =
    theme.background_color;

  document.body.style.color =
    theme.text_color;
}

/*
 * ===========================================================
 * HEX → RGB
 * ===========================================================
 */

function hexToRgb(hex: string): string {
  const cleanHex = hex
    .replace('#', '')
    .trim();

  /*
   * Format court : #FFF
   */

  if (cleanHex.length === 3) {
    const r = parseInt(
      cleanHex[0] + cleanHex[0],
      16
    );

    const g = parseInt(
      cleanHex[1] + cleanHex[1],
      16
    );

    const b = parseInt(
      cleanHex[2] + cleanHex[2],
      16
    );

    return `${r}, ${g}, ${b}`;
  }

  /*
   * Format normal : #FFFFFF
   */

  if (cleanHex.length === 6) {
    const r = parseInt(
      cleanHex.substring(0, 2),
      16
    );

    const g = parseInt(
      cleanHex.substring(2, 4),
      16
    );

    const b = parseInt(
      cleanHex.substring(4, 6),
      16
    );

    return `${r}, ${g}, ${b}`;
  }

  /*
   * Sécurité si une couleur incorrecte
   * arrive depuis Supabase.
   */

  return '61, 40, 23';
}

/*
 * ===========================================================
 * HOOK
 * ===========================================================
 */

export function useSettings() {
  const ctx = useContext(SettingsContext);

  if (!ctx) {
    throw new Error(
      'useSettings must be used within SettingsProvider'
    );
  }

  return ctx;
}