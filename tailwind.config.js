/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      colors: {
        /*
         * =====================================================
         * COULEURS DU THÈME
         * =====================================================
         *
         * Les couleurs principales viennent directement
         * des variables CSS appliquées par SettingsContext.
         */

        primary: {
          50: 'var(--theme-primary)',
          100: 'var(--theme-primary)',
          200: 'var(--theme-primary)',
          300: 'var(--theme-secondary)',
          400: 'var(--theme-secondary)',
          500: 'var(--theme-primary)',
          600: 'var(--theme-primary)',
          700: 'var(--theme-primary)',
          800: 'var(--theme-primary)',
          900: 'var(--theme-primary)',
        },

        accent: {
          50: 'var(--theme-accent)',
          100: 'var(--theme-accent)',
          200: 'var(--theme-accent)',
          300: 'var(--theme-accent)',
          400: 'var(--theme-accent)',
          500: 'var(--theme-accent)',
          600: 'var(--theme-accent)',
          700: 'var(--theme-accent)',
          800: 'var(--theme-accent)',
          900: 'var(--theme-accent)',
        },

        cream: {
          50: 'var(--theme-background)',
          100: 'var(--theme-background)',
          200: 'var(--theme-background)',
          300: 'var(--theme-secondary)',
          400: 'var(--theme-secondary)',
          500: 'var(--theme-secondary)',
        },

        /*
         * =====================================================
         * COULEURS FIXES DU SYSTÈME
         * =====================================================
         */

        success: {
          500: '#2D6A4F',
          600: '#1B5E3F',
        },

        warning: {
          500: '#E0A800',
          600: '#C09000',
        },

        error: {
          500: '#C53030',
          600: '#A02020',
        },
      },

      /*
       * =====================================================
       * TYPOGRAPHIE
       * =====================================================
       */

      fontFamily: {
        display: [
          '"Playfair Display"',
          'serif',
        ],

        sans: [
          'Inter',
          'system-ui',
          'sans-serif',
        ],
      },

      /*
       * =====================================================
       * ANIMATIONS
       * =====================================================
       */

      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',

        'slide-in-right':
          'slideInRight 0.4s ease-out',

        'slide-in-left':
          'slideInLeft 0.4s ease-out',

        'scale-in':
          'scaleIn 0.3s ease-out',

        shimmer:
          'shimmer 2s linear infinite',

        float:
          'float 6s ease-in-out infinite',

        glow:
          'glow 3s ease-in-out infinite',

        'bounce-subtle':
          'bounceSubtle 2s ease-in-out infinite',
      },

      /*
       * =====================================================
       * KEYFRAMES
       * =====================================================
       */

      keyframes: {
        fadeIn: {
          '0%': {
            opacity: '0',
          },

          '100%': {
            opacity: '1',
          },
        },

        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },

          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },

        fadeInDown: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-20px)',
          },

          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },

        slideInRight: {
          '0%': {
            opacity: '0',
            transform: 'translateX(30px)',
          },

          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },

        slideInLeft: {
          '0%': {
            opacity: '0',
            transform: 'translateX(-30px)',
          },

          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },

        scaleIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.9)',
          },

          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },

        shimmer: {
          '0%': {
            backgroundPosition: '-200% 0',
          },

          '100%': {
            backgroundPosition: '200% 0',
          },
        },

        float: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },

          '50%': {
            transform: 'translateY(-12px)',
          },
        },

        glow: {
          '0%, 100%': {
            opacity: '0.5',
          },

          '50%': {
            opacity: '1',
          },
        },

        bounceSubtle: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },

          '50%': {
            transform: 'translateY(-4px)',
          },
        },
      },

      /*
       * =====================================================
       * DÉGRADÉS DYNAMIQUES
       * =====================================================
       */

      backgroundImage: {
        'gradient-gold':
          'linear-gradient(135deg, var(--theme-accent, #D4AF37) 0%, var(--theme-secondary, #C8A96A) 50%, var(--theme-accent, #D4AF37) 100%)',

        'gradient-chocolate':
          'linear-gradient(135deg, var(--theme-primary, #3D2817) 0%, color-mix(in srgb, var(--theme-primary, #3D2817) 80%, white) 100%)',

        shimmer:
          'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--theme-accent, #D4AF37) 15%, transparent) 50%, transparent 100%)',
      },

      /*
       * =====================================================
       * BLUR
       * =====================================================
       */

      backdropBlur: {
        xs: '2px',
      },
    },
  },

  plugins: [],
};