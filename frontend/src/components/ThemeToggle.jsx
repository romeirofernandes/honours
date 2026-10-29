import { useCallback, useEffect, useState } from 'react';
import { Icon } from './Icon.jsx';
import { Moon, Sun } from '../lib/icons.js';

const STORAGE_KEY = 'glycostrat-theme';

function currentTheme() {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function syncThemeColor(theme) {
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#090909' : '#F7F5EF');
}

/**
 * Skiper UI's circular reveal (skiper26) without next-themes, adapted for Vite.
 * The new theme grows from the button as a clip-path circle. Browsers without
 * the View Transitions API, and anyone who prefers reduced motion, get an
 * instant swap instead.
 */
function useThemeToggle() {
  const [theme, setTheme] = useState(currentTheme);

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const sync = (event) => {
      if (localStorage.getItem(STORAGE_KEY)) return;
      const next = event.matches ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', next === 'dark');
      syncThemeColor(next);
      setTheme(next);
    };
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const toggleTheme = useCallback(
    (event) => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const apply = () => {
        document.documentElement.classList.toggle('dark', next === 'dark');
        syncThemeColor(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          /* Private mode can block writes; the theme still applies for this visit. */
        }
        setTheme(next);
      };

      if (!document.startViewTransition || reduced) {
        apply();
        return;
      }

      // Suppress color transitions while the snapshot swaps, otherwise all of
      // them run at once and the reveal smears. Do NOT touch animations: the
      // page's entrance animations have already finished, and disabling them
      // here would make them replay on the left side when this style is removed.
      const suppress = document.createElement('style');
      suppress.textContent = '*,*::before,*::after{transition:none!important}';
      document.head.appendChild(suppress);

      const transition = document.startViewTransition(apply);
      const rect = event.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );

      transition.ready
        .then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${radius}px at ${x}px ${y}px)`,
              ],
              filter: ['blur(14px)', 'blur(0px)'],
            },
            {
              duration: 1600,
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              pseudoElement: '::view-transition-new(root)',
            },
          );
        })
        .catch(() => {
          /* The swap already happened; only the reveal is skipped. */
        })
        .finally(() => {
          transition.finished.finally(() => suppress.remove());
        });
    },
    [],
  );

  return { theme, isDark: theme === 'dark', toggleTheme };
}

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeToggle();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Dark mode"
      aria-pressed={isDark}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="press relative flex size-10 items-center justify-center rounded-full border border-line-strong/60 bg-surface text-ink hover:border-line-strong hover:bg-sunken"
    >
      <span className="relative flex size-5 items-center justify-center">
        <Icon
          icon={Sun}
          size={20}
          className={`absolute transition-[opacity,scale,filter] duration-500 ease-[cubic-bezier(0.2,0,0,1)] ${
            isDark ? 'scale-[0.25] opacity-0 blur-[4px]' : 'scale-100 opacity-100 blur-0'
          }`}
        />
        <Icon
          icon={Moon}
          size={20}
          className={`absolute transition-[opacity,scale,filter] duration-500 ease-[cubic-bezier(0.2,0,0,1)] ${
            isDark ? 'scale-100 opacity-100 blur-0' : 'scale-[0.25] opacity-0 blur-[4px]'
          }`}
        />
      </span>
    </button>
  );
}
