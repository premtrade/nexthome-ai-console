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
  const { data, loading, refresh } = useData(8000);

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
        <button className="btn-secondary" onClick={refresh} style={{ gap: 6 }}>
          <RefreshCw size={14} /> <span className="hide-mobile">Refresh</span>
        </button>
      </div>

      <div className="responsive-grid" style={{ marginBottom: 32 }}>
        <div className="kpi-card accent">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Total Properties
              </div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{totalProps}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--color-accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} color="var(--color-accent-light)" />
            </div>
          </div>
        </div>

        <div className="kpi-card emerald">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                AI Processed
              </div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{aiProcessed}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--color-emerald-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} color="var(--color-emerald)" />
            </div>
          </div>
        </div>

        <div className="kpi-card cyan">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Success Rate
              </div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{successRate}%</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--color-cyan-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={20} color="var(--color-cyan)" />
            </div>
          </div>
        </div>

        <div className="kpi-card amber">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Avg. Price
              </div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{formatPrice(avgPrice)}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--color-amber-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color="var(--color-amber)" />
            </div>
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

      <div className="table-container glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Recent Properties</h3>
          <Link href="/properties" className="btn-secondary" style={{ fontSize: 12, padding: '4px 12px' }}>View All</Link>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Parish</th>
              <th>Price</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {properties.slice(0, 10).map((p) => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.title}</td>
                <td>{p.parish}</td>
                <td>{formatPrice(p.price)}</td>
                <td>
                  <span className={`badge ${p.ai_processed === true || p.ai_processed === 't' || p.ai_processed === 'true' ? 'badge-success' : 'badge-warning'}`}>
                    {p.ai_processed === true || p.ai_processed === 't' || p.ai_processed === 'true' ? 'Processed' : 'Pending'}
                  </span>
                </td>
                <td suppressHydrationWarning>{timeAgo(p.created_at || '')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
