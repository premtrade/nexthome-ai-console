'use client';

import { useData } from '@/app/lib/useData';
import { formatPrice, timeAgo, getCompBadgeClass, getPersonaIcon } from '@/app/lib/types';
import {
  Building2, Cpu, TrendingUp, AlertTriangle,
  CheckCircle2, XCircle, Clock, RefreshCw, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export default function Dashboard() {
  const { data, loading, isRefreshing, refresh } = useData(8000, true);

  if (loading || !data) {
    return (
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Loading intelligence data...</p>
          </div>
        </div>
        <div className="responsive-grid">
          {[1, 2, 3, 4].map(i => <div key={`skeleton-${i}`} className="skeleton" style={{ height: 140, borderRadius: 16 }} />)}
        </div>
      </div>
    );
  }

  const { properties, execStats, recentExecs } = data;
  const totalProps = properties.length;
  const aiProcessed = properties.filter(p => p.ai_processed === true || p.ai_processed === 't' || p.ai_processed === 'true').length;
  const pending = totalProps - aiProcessed;
  const successExecs = execStats.find(e => e.status === 'success');
  const errorExecs = execStats.find(e => e.status === 'error');
  const successCount = parseInt(successExecs?.count || '0');
  const errorCount = parseInt(errorExecs?.count || '0');
  const totalExecs = successCount + errorCount;
  const successRate = totalExecs > 0 ? ((successCount / totalExecs) * 100).toFixed(1) : '0';

  const parishMap: Record<string, number> = {};
  properties.forEach(p => {
    const parish = p.parish || 'Unknown';
    parishMap[parish] = (parishMap[parish] || 0) + 1;
  });
  const parishData = Object.entries(parishMap).map(([name, count]) => ({ name: name.replace('St. ', 'St.'), count }));

  const personaMap: Record<string, number> = {};
  properties.forEach(p => {
    if (p.buyer_persona) {
      personaMap[p.buyer_persona] = (personaMap[p.buyer_persona] || 0) + 1;
    }
  });
  const personaData = Object.entries(personaMap).map(([name, value]) => ({ name, value }));
  const pieColors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];

  const priceRanges = [
    { range: '<$500K', count: 0 },
    { range: '$500K-1M', count: 0 },
    { range: '$1M-2M', count: 0 },
    { range: '$2M-5M', count: 0 },
    { range: '$5M+', count: 0 },
  ];
  properties.forEach(p => {
    const price = parseFloat(p.price);
    if (price < 500000) priceRanges[0].count++;
    else if (price < 1000000) priceRanges[1].count++;
    else if (price < 2000000) priceRanges[2].count++;
    else if (price < 5000000) priceRanges[3].count++;
    else priceRanges[4].count++;
  });

  const avgPrice = properties.reduce((s, p) => s + parseFloat(p.price || '0'), 0) / (totalProps || 1);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Real-time property intelligence overview</p>
        </div>
        <button className="btn-secondary" onClick={refresh} disabled={isRefreshing} style={{ gap: 6 }}>
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} /> <span className="hide-mobile">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 32 }}>
        <div className="kpi-card accent">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Total Properties
              </div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{totalProps}</div>
              <div style={{ fontSize: 12, color: 'var(--color-accent-light)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                <ArrowUpRight size={14} /> Active Listings
              </div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={24} color="var(--color-accent-light)" />
            </div>
          </div>
        </div>

        <div className="kpi-card emerald">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                AI Accuracy
              </div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{successRate}%</div>
              <div style={{ fontSize: 12, color: 'var(--color-emerald)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={14} /> Optimized
              </div>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--color-emerald-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={24} color="var(--color-emerald)" />
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, border: '1px solid var(--color-accent-glow)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Quick Actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Link href="/properties/add" className="btn-primary" style={{ padding: '8px 12px', fontSize: 12, justifyContent: 'center' }}>
              Add Property
            </Link>
            <button className="btn-secondary" onClick={() => refresh()} disabled={isRefreshing} style={{ padding: '8px 12px', fontSize: 12, justifyContent: 'center', gap: 6 }}>
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} /> Scan Market
            </button>
          </div>
        </div>
      </div>

      <div className="responsive-grid" style={{ marginBottom: 32, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24 }}>Price Distribution</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceRanges}>
                <XAxis dataKey="range" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8 }} />
                <Bar dataKey="count" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24 }}>Buyer Personas</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={personaData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {personaData.map((entry, index) => <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32, marginBottom: 32 }}>
        {/* Main Feed: Recent Properties */}
        <div className="table-container glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Active Intelligence Feed</h3>
            <Link href="/properties" className="btn-secondary" style={{ fontSize: 12, padding: '4px 12px' }}>View All</Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Status</th>
                <th>Price</th>
                <th>Persona</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {properties.slice(0, 10).map((p) => (
                <tr key={p.id} className="animate-fade-in">
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{p.parish}</div>
                  </td>
                  <td>
                    <span className={`badge ${p.ai_processed === true || p.ai_processed === 't' || p.ai_processed === 'true' ? 'badge-success' : 'badge-warning'}`}>
                      {p.ai_processed === true || p.ai_processed === 't' || p.ai_processed === 'true' ? 'Processed' : 'Analyzing'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--color-accent-light)' }}>{formatPrice(p.price)}</td>
                  <td>
                    {p.buyer_persona ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                        {getPersonaIcon(p.buyer_persona)} {p.buyer_persona.split(' ')[0]}
                      </div>
                    ) : '---'}
                  </td>
                  <td suppressHydrationWarning style={{ fontSize: 12 }}>{timeAgo(p.updated_at || p.created_at || '')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AI State: Executions & Errors */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="glass-card" style={{ padding: 24, flex: 1 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Cpu size={16} color="var(--color-accent-light)" /> AI Engine State
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentExecs.length > 0 ? (
                recentExecs.slice(0, 5).map(e => (
                  <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: e.status === 'success' ? 'var(--color-emerald)' : 'var(--color-rose)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>Workflow Execution</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{timeAgo(e.startedAt)}</div>
                    </div>
                    {e.status === 'success' ? <CheckCircle2 size={12} color="var(--color-emerald)" /> : <AlertTriangle size={12} color="var(--color-rose)" />}
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 13, color: 'var(--color-text-muted)' }}>
                  No recent executions detected.
                </div>
              )}
            </div>
          </div>

          <div className="glass-card" style={{ padding: 24, background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.1)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: 'var(--color-rose)' }}>System Alerts</h3>
            {data.errors?.length > 0 ? (
              data.errors.slice(0, 2).map((err: any) => (
                <div key={err.id} style={{ fontSize: 12, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(244, 63, 94, 0.1)' }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{err.node_name || 'Workflow Error'}</div>
                  <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{err.error_message}</div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>All systems operational. No AI errors detected.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
