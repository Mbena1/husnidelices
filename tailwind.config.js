/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F8F0E8',
          100: '#EDE0D0',
          200: '#DBC0A1',
          300: '#C8A96A',
          400: '#A88B4F',
          500: '#8B6F3A',
          600: '#6B5530',
          700: '#52401F',
          800: '#3D2817',
          900: '#2A1F14',
        },
        accent: {
          50: '#FBF6E8',
          100: '#F5EBC8',
          200: '#EDD99A',
          300: '#E0C66C',
          400: '#D4AF37',
          500: '#BF9B2E',
          600: '#A08426',
          700: '#806B20',
          800: '#605018',
          900: '#403510',
        },
        cream: {
          50: '#FEFCF9',
          100: '#FAF6F0',
          200: '#F4EDE2',
          300: '#EBE0D0',
          400: '#DCCBB4',
          500: '#C8B095',
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
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
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
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #C8A96A 50%, #D4AF37 100%)',
        'gradient-chocolate': 'linear-gradient(135deg, #3D2817 0%, #52401F 100%)',
        'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.15) 50%, transparent 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
