import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, formatApiErrorDetail } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from './ui/input';
import { Label } from './ui/label';
import ThemeToggle from './ThemeToggle';
import {
  ArrowLeft, EnvelopeSimple, User as UserIcon, FloppyDisk,
  Bell, BellSlash, Funnel, CurrencyEur, Bed, DeviceMobile
} from '@phosphor-icons/react';
import { toast, Toaster } from 'sonner';
import {
  isPushSupported, subscribeToPush, unsubscribeFromPush,
  getCurrentSubscription, sendTestPush,
} from '@/lib/push';

export default function ProfilePage() {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    notification_email: '', notifications_enabled: false,
    min_price: '', max_price: '', min_rooms: '', max_rooms: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushSupported] = useState(() => isPushSupported());
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => {
    fetchProfile();
    if (isPushSupported()) {
      getCurrentSubscription().then((s) => setPushSubscribed(!!s)).catch(() => {});
    }
  }, []);

  const handlePushToggle = async () => {
    setPushBusy(true);
    try {
      if (pushSubscribed) {
        await unsubscribeFromPush();
        setPushSubscribed(false);
        toast.success('Push-Benachrichtigungen deaktiviert');
      } else {
        await subscribeToPush();
        setPushSubscribed(true);
        toast.success('Push-Benachrichtigungen aktiviert!');
      }
    } catch (e) {
      toast.error(e?.message || 'Fehler bei Push-Einstellungen');
    } finally {
      setPushBusy(false);
    }
  };

  const handlePushTest = async () => {
    setPushBusy(true);
    try {
      const res = await sendTestPush();
      toast.success(`Test-Push gesendet (${res?.sent || 0} Gerät(e))`);
    } catch (e) {
      toast.error(formatApiErrorDetail(e) || 'Test-Push fehlgeschlagen');
    } finally {
      setPushBusy(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/api/profile');
      setProfile({
        notification_email: data.notification_email || '',
        notifications_enabled: data.notifications_enabled || false,
        min_price: data.min_price ?? '', max_price: data.max_price ?? '',
        min_rooms: data.min_rooms ?? '', max_rooms: data.max_rooms ?? '',
      });
      setLoading(false);
    } catch (e) {
      toast.error('Fehler beim Laden des Profils');
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        notification_email: profile.notification_email,
        notifications_enabled: profile.notifications_enabled,
        min_price: profile.min_price === '' ? null : parseFloat(profile.min_price),
        max_price: profile.max_price === '' ? null : parseFloat(profile.max_price),
        min_rooms: profile.min_rooms === '' ? null : parseFloat(profile.min_rooms),
        max_rooms: profile.max_rooms === '' ? null : parseFloat(profile.max_rooms),
      };
      await api.put('/api/profile', payload);
      await checkAuth();
      toast.success('Profil gespeichert');
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || 'Fehler beim Speichern');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-[3px] border-muted border-t-primary animate-spin" />
      </div>
    );
  }

  const cardCls = "bg-card border border-border/60 rounded-2xl shadow-sm p-6";
  const inputCls = "h-11 rounded-xl bg-background focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />

      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60">
        <div className="px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="w-10 h-10 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center hover:bg-muted transition-colors duration-200"
              data-testid="back-to-dashboard"
            >
              <ArrowLeft weight="bold" size={20} />
            </button>
            <div>
              <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight">Mein Profil</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Persönliche Einstellungen</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-4 sm:p-8">
        <form onSubmit={handleSave} data-testid="profile-form" className="space-y-6">
          {/* Account Info */}
          <div className={cardCls}>
            <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
              <UserIcon weight="bold" size={20} className="text-primary" />
              Konto
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Login E-Mail</Label>
                <p className="text-sm mt-1 font-medium" data-testid="account-email">{user?.email}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Rolle</Label>
                <p className="text-sm mt-1 font-medium uppercase" data-testid="account-role">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className={cardCls}>
            <h2 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell weight="bold" size={20} className="text-primary" />
              Benachrichtigungen
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-2 block">
                  Benachrichtigungs E-Mail
                </Label>
                <div className="relative">
                  <EnvelopeSimple weight="bold" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input type="email" value={profile.notification_email}
                    onChange={(e) => setProfile({ ...profile, notification_email: e.target.value })}
                    placeholder="ihre@email.com" className={`${inputCls} pl-11`} data-testid="notification-email-input" />
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer rounded-xl bg-secondary/60 border border-border/60 p-4" data-testid="notifications-toggle-label">
                <input type="checkbox" checked={profile.notifications_enabled}
                  onChange={(e) => setProfile({ ...profile, notifications_enabled: e.target.checked })}
                  className="mt-0.5 w-5 h-5 rounded-md accent-primary cursor-pointer"
                  data-testid="notifications-enabled-checkbox" />
                <div>
                  <p className="font-medium text-sm flex items-center gap-2">
                    {profile.notifications_enabled
                      ? <Bell weight="bold" size={16} className="text-[hsl(var(--success))]" />
                      : <BellSlash weight="bold" size={16} className="text-muted-foreground" />}
                    E-Mail Benachrichtigungen aktivieren
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Erhalten Sie automatische E-Mails über neue Wohnungen, die Ihren Filtern entsprechen.
                  </p>
                </div>
              </label>

              {/* Push notifications */}
              <div className="rounded-xl bg-secondary/60 border border-border/60 p-4" data-testid="push-section">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 flex-1 min-w-[260px]">
                    <DeviceMobile weight="bold" size={26}
                      className={pushSubscribed ? 'text-[hsl(var(--success))] mt-0.5' : 'text-muted-foreground mt-0.5'} />
                    <div>
                      <p className="font-medium text-sm">Push-Benachrichtigungen</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Sofort-Push aufs Gerät (auch bei geschlossenem Browser), gefiltert nach Ihren persönlichen Einstellungen.
                      </p>
                      {!pushSupported && (
                        <p className="text-xs text-destructive mt-2">Dieser Browser unterstützt keine Push-Benachrichtigungen.</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={handlePushToggle} disabled={!pushSupported || pushBusy}
                      data-testid="push-toggle-button"
                      className={`px-4 py-2 rounded-xl text-xs font-medium transition-[transform,filter] duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${
                        pushSubscribed ? 'bg-destructive text-destructive-foreground hover:brightness-105' : 'bg-primary text-primary-foreground hover:brightness-105'
                      }`}>
                      {pushBusy ? '…' : pushSubscribed ? 'Deaktivieren' : 'Aktivieren'}
                    </button>
                    {pushSubscribed && (
                      <button type="button" onClick={handlePushTest} disabled={pushBusy}
                        data-testid="push-test-button"
                        className="px-4 py-2 rounded-xl bg-card border border-border/60 text-xs font-medium hover:bg-muted transition-colors duration-200 disabled:opacity-50">
                        Test
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Filters */}
          <div className={cardCls}>
            <h2 className="font-heading text-lg font-semibold mb-1 flex items-center gap-2">
              <Funnel weight="bold" size={20} className="text-primary" />
              Persönliche Filter
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Diese Filter gelten nur für Ihr Konto. Andere Benutzer haben ihre eigenen Filter.
            </p>
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-2 flex items-center gap-1.5">
                  <CurrencyEur weight="bold" size={14} />
                  Preis (€) — Miete pro Monat
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" value={profile.min_price}
                    onChange={(e) => setProfile({ ...profile, min_price: e.target.value })}
                    placeholder="Min (€)" className={inputCls} data-testid="profile-min-price" />
                  <Input type="number" value={profile.max_price}
                    onChange={(e) => setProfile({ ...profile, max_price: e.target.value })}
                    placeholder="Max (€)" className={inputCls} data-testid="profile-max-price" />
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Bed weight="bold" size={14} />
                  Zimmer
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" step="0.5" value={profile.min_rooms}
                    onChange={(e) => setProfile({ ...profile, min_rooms: e.target.value })}
                    placeholder="Min" className={inputCls} data-testid="profile-min-rooms" />
                  <Input type="number" step="0.5" value={profile.max_rooms}
                    onChange={(e) => setProfile({ ...profile, max_rooms: e.target.value })}
                    placeholder="Max" className={inputCls} data-testid="profile-max-rooms" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic">
                Leere Felder = kein Filter. Beispiel: nur Max-Preis = 1500€ filtert Wohnungen bis 1500€.
              </p>
            </div>
          </div>

          {/* Save */}
          <button type="submit" disabled={saving}
            className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium hover:brightness-105 active:scale-[0.99] transition-[transform,filter] duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            data-testid="save-profile-button">
            <FloppyDisk weight="bold" size={18} />
            {saving ? 'Speichern…' : 'Profil speichern'}
          </button>
        </form>
      </div>
    </div>
  );
}
