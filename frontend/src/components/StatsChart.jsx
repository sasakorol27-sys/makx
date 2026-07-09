import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { ChartBar } from '@phosphor-icons/react';
import { api } from '@/lib/api';

// Modern minimalist palette — works in light & dark themes.
const PALETTE = ['#FF6F61', '#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#64748B'];

export default function StatsChart() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(14);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get(`/api/stats/daily?days=${days}`)
      .then((r) => { if (!cancelled) setData(r.data); })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [days]);

  if (loading || !data) {
    return (
      <div className="p-6 rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="text-sm text-muted-foreground">Lade Statistik …</div>
      </div>
    );
  }

  const landlords = data.landlords || [];
  const chartData = data.points.map((p) => {
    const row = { date: p.date.slice(5), total: p.total };
    landlords.forEach((l) => { row[l] = p.byLandlord[l] || 0; });
    return row;
  });

  const totalInWindow = data.points.reduce((s, p) => s + p.total, 0);
  const activeDays = data.points.filter((p) => p.total > 0).length;
  const avgPerDay = activeDays > 0 ? (totalInWindow / activeDays).toFixed(1) : '0';
  const peak = data.points.reduce((m, p) => (p.total > m.total ? p : m), { total: 0, date: '—' });
  const colorOf = (i) => PALETTE[i % PALETTE.length];

  const rangeBtn = (active) =>
    `px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 ${
      active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted'
    }`;

  const kpi = (label, value, sub) => (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</div>
      <div className="font-heading text-3xl font-bold mt-1.5">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );

  return (
    <div data-testid="stats-chart" className="space-y-6">
      {/* Header + range */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <ChartBar weight="bold" size={20} />
          </div>
          <h2 className="font-heading text-xl font-semibold">Übersicht</h2>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30].map((d) => (
            <button key={d} onClick={() => setDays(d)} data-testid={`stats-range-${d}d`} className={rangeBtn(days === d)}>
              {d} Tage
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div data-testid="stats-total">{kpi('Gesamt', totalInWindow)}</div>
        <div data-testid="stats-avg">{kpi('Ø pro aktivem Tag', avgPerDay)}</div>
        <div data-testid="stats-peak">{kpi('Spitzentag', peak.total, peak.date.slice(5))}</div>
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-6">
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={chartData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="rgba(148,163,184,0.18)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: 'rgba(148,163,184,0.3)' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: 'rgba(148,163,184,0.3)' }} tickLine={false} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: 'rgba(255,111,97,0.08)' }}
              contentStyle={{
                fontSize: 12,
                borderRadius: 12,
                border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--card))',
                color: 'hsl(var(--foreground))',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              }}
              labelFormatter={(label) => `Datum: ${label}`}
            />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12, color: '#94a3b8' }} iconType="circle" />
            {landlords.map((l, i) => (
              <Bar key={l} dataKey={l} stackId="a" fill={colorOf(i)} radius={i === landlords.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
