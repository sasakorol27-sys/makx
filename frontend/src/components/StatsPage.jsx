import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import ThemeToggle from './ThemeToggle';
import StatsChart from './StatsChart';

export default function StatsPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60">
        <div className="px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight">Statistik</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tägliche Anzahl gefundener Wohnungen, gruppiert nach Anbieter.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => navigate('/')}
              data-testid="stats-back-button"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition-colors duration-200"
            >
              <ArrowLeft weight="bold" size={16} />
              <span className="hidden sm:inline">Zurück</span>
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-8 py-8 max-w-6xl mx-auto">
        <StatsChart />
      </div>
    </div>
  );
}
