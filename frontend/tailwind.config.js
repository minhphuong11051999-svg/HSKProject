/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 900: '#12142a', 700: '#232a52' },
        indigo: { 900: '#1a2044', 800: '#232b56', 600: '#3a4a8f', 400: '#6d7fc4' },
        paper: '#fdfcf8',
        paperline: '#eae7dc',
        seal: '#a33529',
        gold: '#b08a3e',
        // Neutral scales are CSS variables so the whole app can flip between the
        // dark and light theme (see index.css) without touching every className.
        slate: {
          100: 'var(--c-slate-100)',
          200: 'var(--c-slate-200)',
          300: 'var(--c-slate-300)',
          400: 'var(--c-slate-400)',
          500: 'var(--c-slate-500)',
        },
        night: {
          950: 'var(--c-night-950)',
          900: 'var(--c-night-900)',
          800: 'var(--c-night-800)',
          700: 'var(--c-night-700)',
          600: 'var(--c-night-600)',
        },
        coral: {
          // Scholarly gold accent. 400 is theme-aware (used as plain text/badges);
          // 500/600 stay fixed so white button text keeps AA contrast in both themes.
          50: '#fdf3e7',
          100: '#fae3c2',
          300: '#f0b873',
          400: 'var(--c-coral-accent)',
          500: '#b45309',
          600: '#92400e',
          700: '#78350f',
        },
      },
      fontFamily: {
        zh: ['"Noto Serif SC"', '"Be Vietnam Pro"', 'serif'],
        brand: ['"Cormorant Garamond"', '"Noto Serif SC"', 'serif'],
        sans: ['"Be Vietnam Pro"', '"Noto Sans SC"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
