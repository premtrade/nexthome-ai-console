'use client';

import { useState, useEffect, useMemo } from 'react';
import { useData } from '@/app/lib/useData';
import { Lead, formatPrice } from '@/app/lib/types';
import {
    TrendingUp, MapPin, DollarSign, BarChart3, Building2, RefreshCw, Sparkles, Target, Zap,
    ArrowUpRight, ArrowDownRight, Clock, MoreHorizontal, Eye, Send, X
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

export default function MarketPage() {
    const { data, loading, refresh, postAction } = useData(15000);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleRunAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            await postAction('analyze_market', {});
            await refresh();
        } finally {
            setIsAnalyzing(false);
        }
    };

    const analytics = useMemo(() => {
        if (!data?.properties) return null;
        const props = data.properties;

        // Parish breakdown
        const parishStats: Record<string, { count: number; totalPrice: number; underpriced: number; overpriced: number }> = {};
        props.forEach(p => {
            const parish = p.parish || 'Unknown';
            if (!parishStats[parish]) parishStats[parish] = { count: 0, totalPrice: 0, underpriced: 0, overpriced: 0 };
            parishStats[parish].count++;
            parishStats[parish].totalPrice += parseFloat(p.price || '0');
            if (p.competitiveness?.toLowerCase() === 'underpriced') parishStats[parish].underpriced++;
            if (p.competitiveness?.toLowerCase() === 'overpriced') parishStats[parish].overpriced++;
        });

        const parishData = Object.entries(parishStats).map(([name, stats]) => ({
            name: name.replace('St. ', 'St.'),
            fullName: name,
            listings: stats.count,
            avgPrice: stats.count > 0 ? stats.totalPrice / stats.count : 0,
            underpriced: stats.underpriced,
            overpriced: stats.overpriced,
        })).sort((a, b) => b.listings - a.listings);

        // Competitiveness breakdown
        const compStats: Record<string, number> = { Underpriced: 0, Fair: 0, Overpriced: 0 };
        props.forEach(p => {
            const c = p.competitiveness || '';
            if (c in compStats) compStats[c]++;
        });
        const compData = Object.entries(compStats).map(([name, value]) => ({ name, value }));

        // Price stats
        const prices = props.map(p => parseFloat(p.price || '0')).filter(p => p > 0);
        const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
        const medianPrice = prices.length > 0 ? prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)] : 0;

        return { parishData, compData, avgPrice, medianPrice, total: props.length };
    }, [data]);

    if (loading || !analytics) {
        return (
            <div className="animate-fade-in">
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 32 }}>Market Intelligence</h1>
                <div className="responsive-grid">
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
                </div>
            </div>
        );
    }

    const compColors = { Underpriced: '#10b981', Fair: '#f59e0b', Overpriced: '#f43f5e' };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Market Intelligence</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Real-time market analysis across {analytics.parishData.length} parishes</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        className="btn-primary"
                        onClick={handleRunAnalysis}
                        disabled={isAnalyzing}
                        style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-cyan))' }}
                    >
                        <Zap size={14} /> {isAnalyzing ? 'Analyzing...' : 'Run Arbitrage AI'}
                    </button>
                    <button className="btn-secondary" onClick={refresh}><RefreshCw size={14} /></button>
                </div>
            </div>

            {/* Price KPIs */}
            <div className="responsive-grid" style={{ marginBottom: 28 }}>
                <div className="kpi-card accent">
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Average Price</div>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>{formatPrice(analytics.avgPrice)}</div>
                </div>
                <div className="kpi-card cyan">
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Median Price</div>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>{formatPrice(analytics.medianPrice)}</div>
                </div>
                <div className="kpi-card emerald">
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Market Depth</div>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>{analytics.total} Units</div>
                </div>
                <div className="kpi-card amber">
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Active Parishes</div>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>{analytics.parishData.filter(p => p.listings > 0).length} Regions</div>
                </div>
            </div>

            <div className="responsive-grid" style={{ marginBottom: 28, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24 }}>Listings by Parish</h3>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.parishData.slice(0, 8)}>
                                <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8 }} />
                                <Bar dataKey="listings" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24 }}>Market Competitiveness</h3>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analytics.compData}
                                    cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {analytics.compData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={compColors[entry.name as keyof typeof compColors]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 8 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="table-container glass-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>Parish Market Data</h3>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Parish</th>
                            <th>Active Listings</th>
                            <th>Average Price</th>
                            <th>Underpriced</th>
                            <th>Overpriced</th>
                        </tr>
                    </thead>
                    <tbody>
                        {analytics.parishData.map((p) => (
                            <tr key={p.name}>
                                <td style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{p.fullName}</td>
                                <td>{p.listings}</td>
                                <td>{formatPrice(p.avgPrice)}</td>
                                <td><span style={{ color: 'var(--color-emerald)', fontWeight: 600 }}>{p.underpriced}</span></td>
                                <td><span style={{ color: 'var(--color-rose)', fontWeight: 600 }}>{p.overpriced}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Arbitrage Opportunities */}
            <div className="table-container glass-card" style={{ padding: 24, marginTop: 28, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <Target size={20} color="var(--color-emerald)" />
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>Top Arbitrage Opportunities (AI Scored)</h3>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Property</th>
                            <th>Parish</th>
                            <th>Market Delta</th>
                            <th>Price</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(data?.properties || [])
                            .filter((p: any) => p.competitiveness === 'Underpriced')
                            .slice(0, 5)
                            .map((p: any) => (
                                <tr key={p.id}>
                                    <td style={{ fontWeight: 600 }}>{p.title}</td>
                                    <td>{p.parish}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-emerald)' }}>
                                            <TrendingUp size={14} /> 15%+ Below Avg
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 700 }}>{formatPrice(p.price)}</td>
                                    <td><span className="badge badge-success">High Potential</span></td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
