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
        // Neutral scales are CSS variables (RGB channels, so opacity modifiers like
        // bg-night-900/80 work) so the whole app can flip between the
        // dark and light theme (see index.css) without touching every className.
        slate: {
          100: 'rgb(var(--c-slate-100) / <alpha-value>)',
          200: 'rgb(var(--c-slate-200) / <alpha-value>)',
          300: 'rgb(var(--c-slate-300) / <alpha-value>)',
          400: 'rgb(var(--c-slate-400) / <alpha-value>)',
          500: 'rgb(var(--c-slate-500) / <alpha-value>)',
        },
        night: {
          950: 'rgb(var(--c-night-950) / <alpha-value>)',
          900: 'rgb(var(--c-night-900) / <alpha-value>)',
          800: 'rgb(var(--c-night-800) / <alpha-value>)',
          700: 'rgb(var(--c-night-700) / <alpha-value>)',
          600: 'rgb(var(--c-night-600) / <alpha-value>)',
        },
        coral: {
          // Brand accent: porcelain cobalt from the landing artwork. 400 is
          // theme-aware (text/badges, RGB channels so /10 opacity works);
          // 500/600 stay fixed so white button text keeps AA in both themes.
          50: '#eef3fb',
          100: '#dfe8f7',
          300: '#9db8f0',
          400: 'rgb(var(--c-coral-accent) / <alpha-value>)',
          500: '#1f3f8f',
          600: '#172f6d',
          700: '#122557',
        },
        kicker: 'var(--c-kicker)',
        // Theme-aware right/wrong feedback colours (see --c-ok / --c-err).
        ok: 'rgb(var(--c-ok) / <alpha-value>)',
        err: 'rgb(var(--c-err) / <alpha-value>)',
      },
      fontFamily: {
        zh: ['"Noto Serif SC"', '"Be Vietnam Pro"', 'serif'],
        brand: ['"Pinyon Script"', 'Georgia', 'serif'],
        brandSerif: ['Marcellus', '"Noto Serif SC"', 'serif'],
        sans: ['"Be Vietnam Pro"', '"Noto Sans SC"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
