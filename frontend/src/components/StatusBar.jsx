import { Broadcast, Buildings, Gear, SignOut, User as UserIcon, ChartBar, Sparkle } from '@phosphor-icons/react';
import ThemeToggle from './ThemeToggle';

export default function StatusBar({ scanStatus, onScanNow, user, onLogout, onAdminClick, onProfileClick, onStatsClick }) {
  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Nie';
    const date = new Date(dateStr);
    return date.toLocaleString('de-DE', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const navBtn = "inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted hover:-translate-y-0.5 transition-[transform,background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60">
      <div className="px-4 sm:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Brand + live status */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
              <Buildings weight="bold" size={22} />
            </div>
            <div>
              <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight leading-none">
                Hamburg Scanner
              </h1>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`w-2 h-2 rounded-full ${scanStatus?.is_scanning ? 'bg-[hsl(var(--success))] animate-pulse' : 'bg-muted-foreground/50'}`} data-testid="scan-indicator" />
                <span className="text-xs text-muted-foreground font-medium" data-testid="scan-status-text">
                  {scanStatus?.is_scanning ? 'Scannt gerade…' : 'Bereit'}
                </span>
              </div>
            </div>
          </div>

          {/* Metrics + actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-card border border-border/60">
              <Buildings weight="bold" size={16} className="text-primary" />
              <span className="text-sm font-semibold" data-testid="total-apartments">{scanStatus?.total_apartments || 0}</span>
              <span className="text-xs text-muted-foreground">gesamt</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Sparkle weight="fill" size={15} />
              <span className="text-sm font-semibold" data-testid="new-apartments-count">{scanStatus?.new_apartments || 0}</span>
              <span className="text-xs opacity-80">neu / 24h</span>
            </div>

            <button
              onClick={onScanNow}
              disabled={scanStatus?.is_scanning}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:brightness-105 active:scale-[0.98] transition-[transform,filter] duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              data-testid="scan-now-button"
            >
              <Broadcast weight="bold" size={16} />
              <span className="hidden sm:inline">Scan jetzt</span>
            </button>

            {user?.role === 'admin' && (
              <button onClick={onAdminClick} className={navBtn} data-testid="admin-panel-button">
                <Gear weight="bold" size={16} />
                <span className="hidden md:inline">Admin</span>
              </button>
            )}

            <button onClick={onProfileClick} className={`${navBtn} relative`} data-testid="profile-button">
              <UserIcon weight="bold" size={16} />
              <span className="hidden md:inline">Profil</span>
              {user?.notifications_enabled && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[hsl(var(--success))] rounded-full ring-2 ring-background" />
              )}
            </button>

            <button onClick={onStatsClick} className={navBtn} data-testid="stats-button">
              <ChartBar weight="bold" size={16} />
              <span className="hidden md:inline">Statistik</span>
            </button>

            <ThemeToggle />

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-destructive hover:text-destructive-foreground transition-colors duration-200"
              data-testid="logout-button"
            >
              <SignOut weight="bold" size={16} />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>

        {scanStatus?.last_scan && (
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs text-muted-foreground" data-testid="last-scan-info">
              Letzter Scan: <span className="text-foreground/80 font-medium">{formatDateTime(scanStatus.last_scan)}</span>
            </p>
            {user && (
              <p className="text-xs text-muted-foreground" data-testid="user-info">
                Angemeldet als: <span className="text-foreground/80 font-medium">{user.email}</span> {user.role === 'admin' && '(Admin)'}
              </p>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
