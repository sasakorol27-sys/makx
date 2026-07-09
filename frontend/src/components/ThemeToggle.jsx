import { Sun, Moon } from '@phosphor-icons/react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggleTheme}
      data-testid="theme-toggle"
      aria-label={isDark ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln'}
      className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-border/60 bg-card text-foreground hover:bg-secondary hover:-translate-y-0.5 transition-[transform,background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {isDark ? <Sun weight="bold" size={18} /> : <Moon weight="bold" size={18} />}
    </button>
  );
}
