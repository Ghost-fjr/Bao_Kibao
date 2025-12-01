/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#E31E24', // Bao Kibao Red
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#00843D', // Palestinian Green
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        accent: {
          red: '#E31E24',      // Palestinian flag red
          green: '#00843D',    // Palestinian flag green
          black: '#000000',    // Palestinian flag black
          white: '#FFFFFF',    // Palestinian flag white
        },
        palestine: {
          red: '#E31E24',
          green: '#00843D',
          black: '#000000',
          white: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #E31E24 0%, #b91c1c 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #00843D 0%, #15803d 100%)',
        'gradient-palestine': 'linear-gradient(135deg, #E31E24 0%, #000000 50%, #00843D 100%)',
      },
    },
  },
  plugins: [],
}
