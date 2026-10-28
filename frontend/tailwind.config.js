/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 900: '#12142a', 700: '#232a52' },
        indigo: { 900: '#1a2044', 800: '#232b56', 600: '#3a4a8f', 400: '#6d7fc4' },
        slate: { 50: '#f4f5f9', 100: '#e9ebf3', 300: '#c7cbdc', 500: '#4d5480' },
        paper: '#fdfcf8',
        paperline: '#eae7dc',
        seal: '#a33529',
        gold: '#b08a3e',
      },
      fontFamily: {
        zh: ['"Noto Serif SC"', '"Be Vietnam Pro"', 'serif'],
        sans: ['"Be Vietnam Pro"', '"Noto Sans SC"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
