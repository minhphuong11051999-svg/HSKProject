import { AnimatePresence, motion } from 'motion/react';
import { ThemeToggler } from '@animate-ui/react/primitives/effects/theme-toggler';
import { useTheme } from '../hooks/useTheme';
import { Moon, Sun } from '@phosphor-icons/react';

// Animate UI ThemeToggler: the new theme wipes across the screen (View
// Transitions API; falls back to an instant switch where unsupported or when
// the user prefers reduced motion). The icon itself spins/fades between sun and moon.
export default function ThemeToggle({ className = '' }) {
  const { theme, setTheme } = useTheme();

  return (
    <ThemeToggler theme={theme} resolvedTheme={theme} setTheme={setTheme} direction="ltr">
      {({ resolved, toggleTheme }) => {
        const label = resolved === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối';
        return (
          <button
            type="button"
            onClick={() => toggleTheme(resolved === 'dark' ? 'light' : 'dark')}
            title={label}
            aria-label={label}
            className={`relative w-11 h-11 flex items-center justify-center rounded-full border border-night-600 bg-night-800 text-slate-200 hover:bg-night-700 transition-colors overflow-hidden ${className}`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={resolved}
                initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex"
              >
                {resolved === 'dark' ? (
                  <Moon size={18} weight="fill" aria-hidden="true" />
                ) : (
                  <Sun size={18} weight="fill" aria-hidden="true" />
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        );
      }}
    </ThemeToggler>
  );
}
