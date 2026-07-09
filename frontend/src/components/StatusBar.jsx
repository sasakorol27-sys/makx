import { useState } from 'react';
import { Broadcast, Buildings, Gear, SignOut, User as UserIcon, ChartBar, Sparkle, List, X } from '@phosphor-icons/react';
import ThemeToggle from './ThemeToggle';

export default function StatusBar({ scanStatus, onScanNow, user, onLogout, onAdminClick, onProfileClick, onStatsClick }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navBtn = "inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted hover:-translate-y-0.5 transition-[transform,background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
  const mobileBtn = "w-full inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition-colors duration-200";

  const closeAnd = (fn) => () => { setMenuOpen(false); fn?.(); };

  const Metrics = ({ mobile = false }) => (
    <>
      <div className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-card border border-border/60 ${mobile ? 'flex-1 justify-center' : ''}`}>
        <Buildings weight="bold" size={16} className="text-primary" />
        <span className="text-sm font-semibold" data-testid="total-apartments">{scanStatus?.total_apartments || 0}</span>
        <span className="text-xs text-muted-foreground">gesamt</span>
      </div>
      <div className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary ${mobile ? 'flex-1 justify-center' : ''}`}>
        <Sparkle weight="fill" size={15} />
        <span className="text-sm font-semibold" data-testid="new-apartments-count">{scanStatus?.new_apartments || 0}</span>
        <span className="text-xs opacity-80">neu / 24h</span>
      </div>
    </>
  );

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60">
      <div className="px-4 sm:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
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

          {/* Desktop metrics + actions */}
          <div className="hidden lg:flex flex-wrap items-center gap-2.5">
            <Metrics />
            <button
              onClick={onScanNow}
              disabled={scanStatus?.is_scanning}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:brightness-105 active:scale-[0.98] transition-[transform,filter] duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              data-testid="scan-now-button"
            >
              <Broadcast weight="bold" size={16} />
              Scan jetzt
            </button>
            {user?.role === 'admin' && (
              <button onClick={onAdminClick} className={navBtn} data-testid="admin-panel-button">
                <Gear weight="bold" size={16} />Admin
              </button>
            )}
            <button onClick={onProfileClick} className={`${navBtn} relative`} data-testid="profile-button">
              <UserIcon weight="bold" size={16} />Profil
              {user?.notifications_enabled && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[hsl(var(--success))] rounded-full ring-2 ring-background" />
              )}
            </button>
            <button onClick={onStatsClick} className={navBtn} data-testid="stats-button">
              <ChartBar weight="bold" size={16} />Statistik
            </button>
            <ThemeToggle />
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-destructive hover:text-destructive-foreground transition-colors duration-200"
              data-testid="logout-button"
            >
              <SignOut weight="bold" size={16} />Logout
            </button>
          </div>

          {/* Mobile: theme toggle + menu button */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              data-testid="mobile-menu-toggle"
              aria-label="Menü"
              aria-expanded={menuOpen}
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-secondary text-secondary-foreground hover:bg-muted transition-colors duration-200"
            >
              {menuOpen ? <X weight="bold" size={20} /> : <List weight="bold" size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-border/50 flex flex-col gap-2.5 animate-enter" data-testid="mobile-menu">
            <div className="flex gap-2.5">
              <Metrics mobile />
            </div>
            <button
              onClick={closeAnd(onScanNow)}
              disabled={scanStatus?.is_scanning}
              className="w-full inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:brightness-105 active:scale-[0.99] transition-[transform,filter] duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              data-testid="scan-now-button-mobile"
            >
              <Broadcast weight="bold" size={18} />Scan jetzt
            </button>
            {user?.role === 'admin' && (
              <button onClick={closeAnd(onAdminClick)} className={mobileBtn} data-testid="admin-panel-button-mobile">
                <Gear weight="bold" size={18} />Admin
              </button>
            )}
            <button onClick={closeAnd(onProfileClick)} className={mobileBtn} data-testid="profile-button-mobile">
              <UserIcon weight="bold" size={18} />Profil
              {user?.notifications_enabled && (
                <span className="ml-auto w-2.5 h-2.5 bg-[hsl(var(--success))] rounded-full" />
              )}
            </button>
            <button onClick={closeAnd(onStatsClick)} className={mobileBtn} data-testid="stats-button-mobile">
              <ChartBar weight="bold" size={18} />Statistik
            </button>
            <button
              onClick={closeAnd(onLogout)}
              className="w-full inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-destructive hover:text-destructive-foreground transition-colors duration-200"
              data-testid="logout-button-mobile"
            >
              <SignOut weight="bold" size={18} />Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
