import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, formatApiErrorDetail } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from './ui/input';
import { Label } from './ui/label';
import ThemeToggle from './ThemeToggle';
import {
  ArrowLeft, UserPlus, Trash, Plus, Link as LinkIcon, SignOut,
  EnvelopeSimple, Lock, User, CalendarCheck, Infinity as InfinityIcon, Clock, Warning,
  Users, Buildings, Key, ArrowClockwise, Gauge, Broadcast
} from '@phosphor-icons/react';
import { toast, Toaster } from 'sonner';

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('users');

  // Users
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', role: 'user', access_days: '' });
  const [accessDaysInput, setAccessDaysInput] = useState({});

  // Manual immomio URLs
  const [manualUrls, setManualUrls] = useState([]);
  const [newUrl, setNewUrl] = useState('');

  // Immowelt + ScraperAPI
  const [immoweltProfiles, setImmoweltProfiles] = useState([]);
  const [newProfile, setNewProfile] = useState({ url: '', name: '' });
  const [scraperAccount, setScraperAccount] = useState(null);
  const [newApiKey, setNewApiKey] = useState('');
  const [immoweltScanning, setImmoweltScanning] = useState(false);
  const [intervalMin, setIntervalMin] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchManualUrls();
    fetchImmoweltProfiles();
    fetchScraperAccount();
    fetchInterval();
  }, []);

  // ---------- fetchers ----------
  const fetchUsers = async () => {
    try { const { data } = await api.get('/api/admin/users'); setUsers(data); }
    catch { toast.error('Fehler beim Laden der Benutzer'); }
  };
  const fetchManualUrls = async () => {
    try { const { data } = await api.get('/api/admin/manual-urls'); setManualUrls(data); } catch {}
  };
  const fetchImmoweltProfiles = async () => {
    try { const { data } = await api.get('/api/admin/immowelt-profiles'); setImmoweltProfiles(data); } catch {}
  };
  const fetchScraperAccount = async () => {
    try { const { data } = await api.get('/api/admin/scrapfly/account'); setScraperAccount(data); } catch {}
  };
  const fetchInterval = async () => {
    try { const { data } = await api.get('/api/admin/immowelt/interval'); setIntervalMin(String(data.minutes)); } catch {}
  };
  const handleSaveInterval = async (e) => {
    e.preventDefault();
    const m = parseInt(intervalMin, 10);
    if (Number.isNaN(m) || m < 1) { toast.error('Bitte eine gültige Anzahl Minuten (≥ 1) eingeben'); return; }
    try {
      const { data } = await api.put('/api/admin/immowelt/interval', { minutes: m });
      toast.success(`Scan-Intervall auf ${data.minutes} Min gesetzt`);
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || 'Fehler'); }
  };

  // ---------- users ----------
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newUser };
      payload.access_days = newUser.access_days === '' ? null : parseInt(newUser.access_days, 10);
      await api.post('/api/admin/users', payload);
      toast.success('Benutzer erstellt');
      setNewUser({ email: '', password: '', name: '', role: 'user', access_days: '' });
      fetchUsers();
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || 'Fehler'); }
  };
  const handleSetAccess = async (userId) => {
    const days = parseInt(accessDaysInput[userId], 10);
    if (Number.isNaN(days) || days <= 0) { toast.error('Bitte eine gültige Anzahl Tage eingeben'); return; }
    try {
      await api.put(`/api/admin/users/${userId}/access`, { days });
      toast.success(`Zugang auf ${days} Tage gesetzt`);
      setAccessDaysInput((p) => ({ ...p, [userId]: '' }));
      fetchUsers();
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || 'Fehler'); }
  };
  const handleRevokeAccess = async (userId) => {
    if (!window.confirm('Zugang sofort sperren?')) return;
    try { await api.put(`/api/admin/users/${userId}/access`, { days: 0 }); toast.success('Zugang gesperrt'); fetchUsers(); }
    catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || 'Fehler'); }
  };
  const handleUnlimitedAccess = async (userId) => {
    try { await api.put(`/api/admin/users/${userId}/access/unlimited`); toast.success('Unbegrenzter Zugang gesetzt'); fetchUsers(); }
    catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || 'Fehler'); }
  };
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Benutzer wirklich löschen?')) return;
    try { await api.delete(`/api/admin/users/${userId}`); toast.success('Benutzer gelöscht'); fetchUsers(); }
    catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || 'Fehler'); }
  };

  // ---------- manual urls ----------
  const handleAddUrl = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('URL wird hinzugefügt...');
    try {
      const { data } = await api.post('/api/admin/manual-urls', { url: newUrl });
      toast.dismiss(loadingToast);
      const count = data?.apartments_count ?? 0;
      if (data?.type === 'homepage_token') {
        toast.success(count > 0 ? `Landlord-Token hinzugefügt — ${count} neue Wohnung(en).` : 'Landlord-Token hinzugefügt.');
      } else if (data?.apartment) {
        toast.success(`URL hinzugefügt — ${data.apartment.title || 'Wohnung'} gefunden`);
      } else { toast.success('URL hinzugefügt'); }
      setNewUrl(''); fetchManualUrls();
    } catch (err) { toast.dismiss(loadingToast); toast.error(formatApiErrorDetail(err.response?.data?.detail) || 'Fehler'); }
  };
  const handleRemoveUrl = async (url) => {
    try { await api.delete('/api/admin/manual-urls', { data: { url } }); toast.success('URL entfernt'); fetchManualUrls(); }
    catch { toast.error('Fehler beim Entfernen'); }
  };

  // ---------- immowelt + scraperapi ----------
  const handleAddProfile = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/immowelt-profiles', newProfile);
      toast.success('Profil hinzugefügt');
      setNewProfile({ url: '', name: '' });
      fetchImmoweltProfiles();
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || 'Fehler'); }
  };
  const handleRemoveProfile = async (url) => {
    try { await api.delete('/api/admin/immowelt-profiles', { data: { url } }); toast.success('Profil entfernt'); fetchImmoweltProfiles(); }
    catch { toast.error('Fehler beim Entfernen'); }
  };
  const handleUpdateApiKey = async (e) => {
    e.preventDefault();
    if (!newApiKey.trim()) { toast.error('Bitte einen API-Key eingeben'); return; }
    try {
      await api.put('/api/admin/scrapfly/key', { api_key: newApiKey.trim() });
      toast.success('Scrapfly-Key aktualisiert');
      setNewApiKey('');
      fetchScraperAccount();
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || 'Fehler'); }
  };
  const handleImmoweltScan = async () => {
    setImmoweltScanning(true);
    try {
      await api.post('/api/admin/immowelt/scan');
      toast.success('Immowelt-Scan gestartet — neue Wohnungen erscheinen in Kürze');
      setTimeout(fetchScraperAccount, 8000);
    } catch (err) { toast.error(formatApiErrorDetail(err.response?.data?.detail) || 'Fehler'); }
    finally { setImmoweltScanning(false); }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const cardCls = "bg-card border border-border/60 rounded-2xl shadow-sm";
  const primaryBtn = "w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:brightness-105 active:scale-[0.99] transition-[transform,filter] duration-200 flex items-center justify-center gap-2 shadow-sm";
  const inputCls = "h-11 rounded-xl bg-background pl-10 focus-visible:ring-2 focus-visible:ring-primary";

  const tabs = [
    { id: 'users', label: 'Benutzer', icon: Users },
    { id: 'urls', label: 'immomio-URLs', icon: LinkIcon },
    { id: 'immowelt', label: 'Immowelt & Scrapfly', icon: Buildings },
  ];

  const creditsPct = scraperAccount?.requestLimit
    ? Math.round(((scraperAccount.creditsLeft ?? 0) / scraperAccount.requestLimit) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60">
        <div className="px-4 sm:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')}
              className="w-10 h-10 rounded-xl bg-secondary text-secondary-foreground flex items-center justify-center hover:bg-muted transition-colors duration-200"
              data-testid="back-to-dashboard">
              <ArrowLeft weight="bold" size={20} />
            </button>
            <div>
              <h1 className="font-heading text-xl sm:text-2xl font-bold tracking-tight">Admin Panel</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Verwaltung</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-muted-foreground">{user?.email}</span>
            <ThemeToggle />
            <button onClick={handleLogout}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-destructive hover:text-destructive-foreground transition-colors duration-200"
              data-testid="logout-button">
              <SignOut weight="bold" size={16} />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="px-4 sm:px-8 flex gap-1.5 overflow-x-auto pb-3">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} data-testid={`tab-${t.id}`}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  active ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-secondary text-secondary-foreground hover:bg-muted'
                }`}>
                <Icon weight="bold" size={16} />
                {t.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        {/* ============ USERS TAB ============ */}
        {activeTab === 'users' && (
          <section className={`${cardCls} p-6`} data-testid="users-tab">
            <h2 className="font-heading text-xl font-semibold mb-5 flex items-center gap-2">
              <UserPlus weight="bold" size={22} className="text-primary" />
              Benutzerverwaltung
            </h2>

            <form onSubmit={handleCreateUser} className="rounded-xl bg-secondary/60 border border-border/60 p-5 mb-6" data-testid="create-user-form">
              <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-4">Neuer Benutzer</h3>
              <div className="space-y-3">
                <div><Label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-1.5 block">Email</Label>
                  <div className="relative">
                    <EnvelopeSimple weight="bold" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input type="email" required value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="client@example.com" className={inputCls} data-testid="new-user-email" />
                  </div>
                </div>
                <div><Label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-1.5 block">Passwort</Label>
                  <div className="relative">
                    <Lock weight="bold" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input type="password" required minLength={6} value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="mindestens 6 Zeichen" className={inputCls} data-testid="new-user-password" />
                  </div>
                </div>
                <div><Label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-1.5 block">Name (optional)</Label>
                  <div className="relative">
                    <User weight="bold" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input type="text" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="Max Mustermann" className={inputCls} data-testid="new-user-name" />
                  </div>
                </div>
                <div><Label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-1.5 block">Zugang (Tage)</Label>
                  <div className="relative">
                    <CalendarCheck weight="bold" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input type="number" min="1" value={newUser.access_days} onChange={(e) => setNewUser({ ...newUser, access_days: e.target.value })} placeholder="z.B. 30 (leer = unbegrenzt)" className={inputCls} data-testid="new-user-access-days" />
                  </div>
                </div>
                <button type="submit" className={primaryBtn} data-testid="create-user-submit"><Plus weight="bold" size={16} />Benutzer erstellen</button>
              </div>
            </form>

            <div className="space-y-2">
              {users.map((u) => {
                const isAdmin = u.role === 'admin';
                const unlimited = !u.access_expires_at;
                const expired = u.access_active === false;
                let statusLabel, statusCls, StatusIcon;
                if (isAdmin || unlimited) { statusLabel = isAdmin ? 'Admin · unbegrenzt' : 'Unbegrenzt'; statusCls = 'bg-secondary text-muted-foreground'; StatusIcon = InfinityIcon; }
                else if (expired) { statusLabel = 'Abgelaufen'; statusCls = 'bg-destructive/10 text-destructive'; StatusIcon = Warning; }
                else { statusLabel = `Noch ${u.access_days_left} Tag(e)`; statusCls = 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]'; StatusIcon = Clock; }
                const expDate = u.access_expires_at ? new Date(u.access_expires_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : null;
                return (
                  <div key={u.id} className="rounded-xl border border-border/60 bg-background p-4" data-testid={`user-row-${u.email}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{u.email}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-[0.08em] mt-0.5">{u.role} {u.name ? `· ${u.name}` : ''}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusCls}`} data-testid={`user-access-status-${u.email}`}>
                          <StatusIcon weight="bold" size={13} />{statusLabel}
                        </span>
                        {u.id !== user?.id && (
                          <button onClick={() => handleDeleteUser(u.id)} className="w-9 h-9 rounded-xl flex items-center justify-center text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors duration-200" data-testid={`delete-user-${u.email}`}>
                            <Trash weight="bold" size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    {!isAdmin && (
                      <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2 flex-wrap">
                        {expDate && <span className="text-xs text-muted-foreground mr-1">Läuft ab: {expDate}</span>}
                        <div className="flex items-center gap-2 ml-auto">
                          <Input type="number" min="1" value={accessDaysInput[u.id] || ''} onChange={(e) => setAccessDaysInput((p) => ({ ...p, [u.id]: e.target.value }))} placeholder="Tage" className="h-9 w-24 rounded-lg bg-card text-sm focus-visible:ring-2 focus-visible:ring-primary" data-testid={`access-days-input-${u.email}`} />
                          <button onClick={() => handleSetAccess(u.id)} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:brightness-105 transition-[filter] duration-200" data-testid={`set-access-${u.email}`}>Setzen</button>
                          <button onClick={() => handleUnlimitedAccess(u.id)} className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-muted transition-colors duration-200" data-testid={`unlimited-access-${u.email}`} title="Unbegrenzter Zugang">∞</button>
                          {!expired && !unlimited && (
                            <button onClick={() => handleRevokeAccess(u.id)} className="px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-destructive hover:text-destructive-foreground transition-colors duration-200" data-testid={`revoke-access-${u.email}`}>Sperren</button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ============ URLS TAB ============ */}
        {activeTab === 'urls' && (
          <section className={`${cardCls} p-6`} data-testid="urls-tab">
            <h2 className="font-heading text-xl font-semibold mb-4 flex items-center gap-2">
              <LinkIcon weight="bold" size={22} className="text-primary" />
              Manuelle immomio-URLs
            </h2>
            <div className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Einzelne Wohnung: <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">tenant.immomio.com/apply/...</code><br />
              Vermieter-Pool: <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">homepage.immomio.com/de/properties?token=...</code>
            </div>
            <form onSubmit={handleAddUrl} className="rounded-xl bg-secondary/60 border border-border/60 p-5 mb-6" data-testid="add-url-form">
              <div className="space-y-3">
                <Input type="url" required value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="tenant.immomio.com/apply/... oder homepage.immomio.com/..." className="h-11 rounded-xl bg-background text-sm focus-visible:ring-2 focus-visible:ring-primary" data-testid="new-url-input" />
                <button type="submit" className={primaryBtn} data-testid="add-url-submit"><Plus weight="bold" size={16} />URL hinzufügen</button>
              </div>
            </form>
            <div className="space-y-2">
              {manualUrls.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-6 text-center"><p className="text-sm text-muted-foreground">Keine manuellen URLs</p></div>
              ) : manualUrls.map((item, idx) => (
                <div key={idx} className="rounded-xl border border-border/60 bg-background p-4 flex items-center justify-between gap-3" data-testid={`url-row-${idx}`}>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {item.type === 'homepage_token' && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider flex-shrink-0">Pool</span>}
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline break-all">{item.url}</a>
                  </div>
                  <button onClick={() => handleRemoveUrl(item.url)} className="w-9 h-9 rounded-xl flex items-center justify-center text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors duration-200 flex-shrink-0" data-testid={`delete-url-${idx}`}>
                    <Trash weight="bold" size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ============ IMMOWELT + SCRAPERAPI TAB ============ */}
        {activeTab === 'immowelt' && (
          <div className="space-y-6" data-testid="immowelt-tab">
            {/* ScraperAPI account */}
            <section className={`${cardCls} p-6`}>
              <div className="flex items-center justify-between gap-3 mb-5">
                <h2 className="font-heading text-xl font-semibold flex items-center gap-2">
                  <Gauge weight="bold" size={22} className="text-primary" />
                  Scrapfly Konto
                </h2>
                <button onClick={fetchScraperAccount} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-muted transition-colors duration-200" data-testid="refresh-account">
                  <ArrowClockwise weight="bold" size={14} />Aktualisieren
                </button>
              </div>

              {scraperAccount?.configured ? (
                scraperAccount.error ? (
                  <div className="rounded-xl bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 text-sm" data-testid="account-error">
                    Fehler: {scraperAccount.error}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl border border-border/60 bg-background p-4 text-center">
                        <div className="font-heading text-2xl font-bold" data-testid="credits-left">{scraperAccount.creditsLeft ?? '—'}</div>
                        <div className="text-xs text-muted-foreground mt-1">Verbleibend</div>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-background p-4 text-center">
                        <div className="font-heading text-2xl font-bold">{scraperAccount.requestCount ?? '—'}</div>
                        <div className="text-xs text-muted-foreground mt-1">Verbraucht</div>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-background p-4 text-center">
                        <div className="font-heading text-2xl font-bold">{scraperAccount.requestLimit ?? '—'}</div>
                        <div className="text-xs text-muted-foreground mt-1">Limit / Monat</div>
                      </div>
                    </div>
                    <div>
                      <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${creditsPct}%` }} data-testid="credits-bar" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">{creditsPct}% Kredite übrig · Key: {scraperAccount.key_masked}</p>
                    </div>
                  </div>
                )
              ) : (
                <p className="text-sm text-muted-foreground" data-testid="account-not-configured">Kein Scrapfly-Key konfiguriert.</p>
              )}

              {/* Change API key */}
              <form onSubmit={handleUpdateApiKey} className="mt-6 rounded-xl bg-secondary/60 border border-border/60 p-5" data-testid="apikey-form">
                <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-3 flex items-center gap-1.5"><Key weight="bold" size={14} />API-Key ändern (bei Limit-Erschöpfung)</h3>
                <div className="flex gap-2">
                  <Input type="text" value={newApiKey} onChange={(e) => setNewApiKey(e.target.value)} placeholder="Neuer Scrapfly-Key" className="h-11 rounded-xl bg-background text-sm focus-visible:ring-2 focus-visible:ring-primary" data-testid="new-apikey-input" />
                  <button type="submit" className="px-5 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:brightness-105 transition-[filter] duration-200 whitespace-nowrap" data-testid="save-apikey">Speichern</button>
                </div>
              </form>
            </section>

            {/* Immowelt profiles */}
            <section className={`${cardCls} p-6`}>
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="font-heading text-xl font-semibold flex items-center gap-2">
                  <Buildings weight="bold" size={22} className="text-primary" />
                  Immowelt-Profile
                </h2>
                <button onClick={handleImmoweltScan} disabled={immoweltScanning} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:brightness-105 transition-[filter] duration-200 disabled:opacity-50" data-testid="immowelt-scan-now">
                  <Broadcast weight="bold" size={14} />{immoweltScanning ? 'Scannt…' : 'Jetzt scannen'}
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Neue <strong className="text-foreground/80">Wohnungen</strong> (keine Gewerbe/Büros) werden automatisch erkannt, die immomio-Bewerbungslinks extrahiert und veröffentlicht.
              </p>

              {/* Scan interval */}
              <form onSubmit={handleSaveInterval} className="rounded-xl bg-secondary/60 border border-border/60 p-5 mb-5" data-testid="interval-form">
                <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Clock weight="bold" size={14} />Scan-Intervall (Minuten)
                </h3>
                <div className="flex gap-2 items-center">
                  <Input type="number" min="1" value={intervalMin} onChange={(e) => setIntervalMin(e.target.value)} placeholder="z.B. 60" className="h-11 w-32 rounded-xl bg-background text-sm focus-visible:ring-2 focus-visible:ring-primary" data-testid="interval-input" />
                  <button type="submit" className="px-5 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:brightness-105 transition-[filter] duration-200 whitespace-nowrap" data-testid="save-interval">Speichern</button>
                  <span className="text-xs text-muted-foreground ml-1">höher = weniger Kredite</span>
                </div>
              </form>
              <form onSubmit={handleAddProfile} className="rounded-xl bg-secondary/60 border border-border/60 p-5 mb-6" data-testid="add-profile-form">
                <div className="space-y-3">
                  <Input type="url" required value={newProfile.url} onChange={(e) => setNewProfile({ ...newProfile, url: e.target.value })} placeholder="https://www.immowelt.de/profil/..." className="h-11 rounded-xl bg-background text-sm focus-visible:ring-2 focus-visible:ring-primary" data-testid="new-profile-url" />
                  <Input type="text" value={newProfile.name} onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })} placeholder="Name (optional, z.B. SAGA)" className="h-11 rounded-xl bg-background text-sm focus-visible:ring-2 focus-visible:ring-primary" data-testid="new-profile-name" />
                  <button type="submit" className={primaryBtn} data-testid="add-profile-submit"><Plus weight="bold" size={16} />Profil hinzufügen</button>
                </div>
              </form>
              <div className="space-y-2">
                {immoweltProfiles.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center"><p className="text-sm text-muted-foreground">Keine Profile hinterlegt</p></div>
                ) : immoweltProfiles.map((p, idx) => (
                  <div key={idx} className="rounded-xl border border-border/60 bg-background p-4 flex items-center justify-between gap-3" data-testid={`profile-row-${idx}`}>
                    <div className="flex-1 min-w-0">
                      {p.name && <p className="text-sm font-medium">{p.name}</p>}
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline break-all">{p.url}</a>
                    </div>
                    <button onClick={() => handleRemoveProfile(p.url)} className="w-9 h-9 rounded-xl flex items-center justify-center text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors duration-200 flex-shrink-0" data-testid={`delete-profile-${idx}`}>
                      <Trash weight="bold" size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
