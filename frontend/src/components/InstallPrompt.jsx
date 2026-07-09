import { useEffect, useState } from 'react';
import { DownloadSimple, X, Buildings } from '@phosphor-icons/react';

const STORAGE_KEY = 'pwa_install_dismissed';

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function isIos() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  return /iphone|ipad|ipod/i.test(ua) && !/crios|fxios/i.test(ua);
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(STORAGE_KEY) === '1') return;

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    if (isIos()) {
      const t = setTimeout(() => setVisible(true), 4000);
      return () => {
        clearTimeout(t);
        window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      };
    }
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    setShowIosHint(false);
    localStorage.setItem(STORAGE_KEY, '1');
  };

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setVisible(false);
      if (outcome === 'accepted') localStorage.setItem(STORAGE_KEY, '1');
      return;
    }
    setShowIosHint(true);
  };

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96 rounded-2xl bg-card border border-border/60 shadow-[0_12px_40px_rgba(0,0,0,0.18)] animate-enter"
      role="dialog"
      data-testid="install-prompt"
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
          <Buildings weight="bold" size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-semibold text-sm">App installieren</p>
          <p className="text-xs text-muted-foreground mt-1 leading-snug">
            Direkt vom Startbildschirm öffnen — schneller Zugriff & Push-Benachrichtigungen.
          </p>
          {showIosHint && (
            <div className="mt-3 rounded-xl bg-secondary/70 border border-border/60 p-3 text-xs leading-relaxed">
              <p className="font-semibold mb-1">iOS Safari:</p>
              <ol className="list-decimal pl-4 space-y-0.5 text-muted-foreground">
                <li>Auf <span className="font-medium text-foreground">Teilen</span>-Symbol tippen (↑)</li>
                <li><span className="font-medium text-foreground">„Zum Home-Bildschirm"</span> auswählen</li>
                <li>Bestätigen mit <span className="font-medium text-foreground">„Hinzufügen"</span></li>
              </ol>
            </div>
          )}
          <div className="flex gap-2 mt-3">
            {!showIosHint && (
              <button
                type="button"
                onClick={install}
                className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:brightness-105 active:scale-[0.98] transition-[transform,filter] duration-200 flex items-center gap-1.5"
                data-testid="install-prompt-install"
              >
                <DownloadSimple weight="bold" size={14} />
                Installieren
              </button>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="px-3.5 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium hover:bg-muted transition-colors duration-200"
              data-testid="install-prompt-dismiss"
            >
              Später
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors duration-200 flex-shrink-0"
          aria-label="Schließen"
        >
          <X weight="bold" size={16} />
        </button>
      </div>
    </div>
  );
}
