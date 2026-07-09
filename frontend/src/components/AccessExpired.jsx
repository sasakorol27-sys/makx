import { Crown, TelegramLogo, LockKey, SignOut } from '@phosphor-icons/react';
import ThemeToggle from './ThemeToggle';

export default function AccessExpired({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-primary/20 blur-[120px]" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
            <LockKey weight="bold" size={20} />
          </div>
          <span className="font-heading font-bold tracking-tight">Hamburg Scanner</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-muted transition-colors duration-200"
            data-testid="access-expired-logout"
          >
            <SignOut weight="bold" size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center" data-testid="access-expired-screen">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
            <LockKey weight="bold" size={30} />
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Zugang geschlossen</h1>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            Ihr Abonnement ist abgelaufen. Benachrichtigungen werden nicht mehr gesendet.
            Bitte verlängern Sie Ihr Abonnement, um den Wohnungs-Scanner weiter zu nutzen.
          </p>

          <div className="bg-card border border-border/60 rounded-2xl shadow-sm p-6 mt-8">
            <a
              href="https://t.me/albina_pay"
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium hover:brightness-105 active:scale-[0.99] transition-[transform,filter] duration-200 flex items-center justify-center gap-2.5 shadow-sm"
              data-testid="renew-subscription-button"
            >
              <Crown weight="fill" size={18} />
              Abonnement verlängern
              <TelegramLogo weight="fill" size={18} className="group-hover:translate-x-0.5 transition-transform duration-200" />
            </a>
            <p className="text-xs text-muted-foreground mt-3">
              Verlängerung über Telegram @albina_pay
            </p>
          </div>

          {user?.email && (
            <p className="text-xs text-muted-foreground mt-6">
              Angemeldet als {user.email}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
