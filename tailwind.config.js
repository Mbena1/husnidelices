/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],

  theme: {
    extend: {
      colors: {
        primary: {
          50: 'color-mix(in srgb, var(--theme-primary, #3D2817) 8%, white)',
          100: 'color-mix(in srgb, var(--theme-primary, #3D2817) 15%, white)',
          200: 'color-mix(in srgb, var(--theme-primary, #3D2817) 25%, white)',
          300: 'color-mix(in srgb, var(--theme-secondary, #C8A96A) 70%, white)',
          400: 'color-mix(in srgb, var(--theme-secondary, #C8A96A) 85%, black)',
          500: 'color-mix(in srgb, var(--theme-primary, #3D2817) 55%, white)',
          600: 'color-mix(in srgb, var(--theme-primary, #3D2817) 65%, white)',
          700: 'color-mix(in srgb, var(--theme-primary, #3D2817) 80%, white)',
          800: 'var(--theme-primary, #3D2817)',
          900: 'color-mix(in srgb, var(--theme-primary, #3D2817) 90%, black)',
        },

        accent: {
          50: 'color-mix(in srgb, var(--theme-accent, #D4AF37) 8%, white)',
          100: 'color-mix(in srgb, var(--theme-accent, #D4AF37) 15%, white)',
          200: 'color-mix(in srgb, var(--theme-accent, #D4AF37) 30%, white)',
          300: 'color-mix(in srgb, var(--theme-accent, #D4AF37) 60%, white)',
          400: 'var(--theme-accent, #D4AF37)',
          500: 'color-mix(in srgb, var(--theme-accent, #D4AF37) 80%, black)',
          600: 'color-mix(in srgb, var(--theme-accent, #D4AF37) 70%, black)',
          700: 'color-mix(in srgb, var(--theme-accent, #D4AF37) 60%, black)',
          800: 'color-mix(in srgb, var(--theme-accent, #D4AF37) 50%, black)',
          900: 'color-mix(in srgb, var(--theme-accent, #D4AF37) 40%, black)',
        },

        cream: {
          50: 'color-mix(in srgb, var(--theme-background, #FAF6F0) 95%, white)',
          100: 'var(--theme-background, #FAF6F0)',
          200: 'color-mix(in srgb, var(--theme-background, #FAF6F0) 85%, var(--theme-secondary, #C8A96A))',
          300: 'color-mix(in srgb, var(--theme-background, #FAF6F0) 70%, var(--theme-secondary, #C8A96A))',
          400: 'color-mix(in srgb, var(--theme-secondary, #C8A96A) 60%, white)',
          500: 'var(--theme-secondary, #C8A96A)',
        },

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

      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 6s ease-in-out infinite',
        glow: 'glow 3s ease-in-out infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },

        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },

        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },

        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },

        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },

        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },

        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },

        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },

        glow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },

        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },

      backgroundImage: {
        'gradient-gold':
          'linear-gradient(135deg, var(--theme-accent, #D4AF37) 0%, var(--theme-secondary, #C8A96A) 50%, var(--theme-accent, #D4AF37) 100%)',

        'gradient-chocolate':
          'linear-gradient(135deg, var(--theme-primary, #3D2817) 0%, color-mix(in srgb, var(--theme-primary, #3D2817) 80%, white) 100%)',

        shimmer:
          'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--theme-accent, #D4AF37) 15%, transparent) 50%, transparent 100%)',
      },

      backdropBlur: {
        xs: '2px',
      },
    },
  },

  plugins: [],
};