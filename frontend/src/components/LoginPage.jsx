import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from './ui/input';
import { Label } from './ui/label';
import ThemeToggle from './ThemeToggle';
import { Lock, EnvelopeSimple, Buildings, ArrowRight } from '@phosphor-icons/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Anmeldung fehlgeschlagen');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* soft gradient glow backdrop */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-32 -left-24 w-[380px] h-[380px] rounded-full bg-chart-2/10 blur-[120px]" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
            <Buildings weight="bold" size={20} />
          </div>
          <span className="font-heading font-bold tracking-tight">Hamburg Scanner</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-heading text-4xl font-bold tracking-tight">Willkommen zurück</h1>
            <p className="text-muted-foreground mt-2">
              Immomio.com Wohnungsüberwachung für Hamburg
            </p>
          </div>

          <div className="bg-card border border-border/60 rounded-2xl shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-2 block">
                  E-Mail
                </Label>
                <div className="relative">
                  <EnvelopeSimple weight="bold" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                    className="h-12 rounded-xl bg-background pl-11 focus-visible:ring-2 focus-visible:ring-primary"
                    data-testid="login-email-input"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-2 block">
                  Passwort
                </Label>
                <div className="relative">
                  <Lock weight="bold" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-12 rounded-xl bg-background pl-11 focus-visible:ring-2 focus-visible:ring-primary"
                    data-testid="login-password-input"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3" data-testid="login-error">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium hover:brightness-105 active:scale-[0.99] transition-[transform,filter] duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                data-testid="login-submit-button"
              >
                {loading ? 'Einloggen…' : 'Einloggen'}
                {!loading && <ArrowRight weight="bold" size={18} className="group-hover:translate-x-0.5 transition-transform duration-200" />}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Zugang nur für autorisierte Benutzer
          </p>
        </div>
      </main>
    </div>
  );
}
