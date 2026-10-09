/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: '480px',
      },
      colors: {
        forest: {
          DEFAULT: '#263D2F',
          dark: '#1A2A20',
          light: '#314E3C',
          muted: '#415C4B',
        },
        sage: {
          DEFAULT: '#647668',
          light: '#839587',
          dark: '#4D5C50',
        },
        ivory: {
          DEFAULT: '#F9F6F0',
          dark: '#EEE9E0',
          light: '#FCFAF7',
        },
        cream: {
          DEFAULT: '#FFFFFF',
          surface: '#FCFAF6',
          border: '#E9E4DB',
        },
        terracotta: {
          DEFAULT: '#B8684A',
          light: '#CC7D60',
          dark: '#985137',
        },
        charcoal: {
          DEFAULT: '#1C231E',
          muted: '#576159',
          light: '#808B82',
          subtle: '#A3ACA5',
        },
        luxury: {
          dark: '#1A2A20',
          black: '#F9F6F0', // mapped to warm off-white canvas
          surface: '#FFFFFF', // mapped to clean card surface
          card: '#FCFAF6',
          border: '#E9E4DB',
          borderLight: '#DFD8CC',
          gold: {
            DEFAULT: '#263D2F', // forest green brand primary
            light: '#647668',   // sage
            muted: '#647668',
            dark: '#1A2A20',
          },
          sand: '#F9F6F0',
          cream: '#FFFFFF',
          stone: '#E9E4DB',
          muted: '#576159',
          subtle: '#808B82',
        },
      },
      fontFamily: {
        serif: ['"Newsreader"', '"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      letterSpacing: {
        luxurious: '0.25em',
        widest: '0.18em',
        wide: '0.08em',
      },
      animation: {
        'fade-in': 'fadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'mode-fade': 'modeFade 0.35s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        modeFade: {
          '0%': { opacity: '0', transform: 'scale(0.995)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
