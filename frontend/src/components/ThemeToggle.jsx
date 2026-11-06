import { useTheme } from '../hooks/useTheme';
import { Moon, Sun } from '@phosphor-icons/react';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      aria-label={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      className={`w-9 h-9 flex items-center justify-center rounded-full border border-night-600 bg-night-800 text-slate-200 hover:bg-night-700 transition-colors ${className}`}
    >
      {theme === 'dark' ? <Moon size={18} weight="fill" aria-hidden="true" /> : <Sun size={18} weight="fill" aria-hidden="true" />}
    </button>
  );
}
