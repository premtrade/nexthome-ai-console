'use client';

import { useMemo } from 'react';
import { useData } from '@/app/lib/useData';
import { formatPrice, timeAgo, getPersonaIcon } from '@/app/lib/types';
import type { Property } from '@/app/lib/types';
import {
    Bell, AlertTriangle, TrendingDown, DollarSign,
    Target, RefreshCw, CheckCircle2, XCircle
} from 'lucide-react';

interface Alert {
    id: string;
    type: 'underpriced' | 'investor' | 'error' | 'new';
    severity: 'high' | 'medium' | 'low';
    title: string;
    message: string;
    property?: Property;
    time: string;
}

export default function AlertsPage() {
    const { data, loading, refresh } = useData(10000);

    const alerts = useMemo(() => {
        if (!data) return [];
        const result: Alert[] = [];

        // Underpriced alerts
        data.properties.forEach(p => {
            if (p.competitiveness?.toLowerCase() === 'underpriced' && (p.ai_processed === true || p.ai_processed === 't' || p.ai_processed === 'true')) {
                result.push({
                    id: `underpriced-${p.id}`,
                    type: 'underpriced',
                    severity: 'high',
                    title: `Underpriced Property: ${p.title}`,
                    message: `${p.title} (${formatPrice(p.price)}) in ${p.parish} is classified as underpriced compared to similar ${p.bedrooms}-bedroom properties. This could represent a buying opportunity or suggest a pricing adjustment.`,
                    property: p,
                    time: p.updated_at,
                });
            }
        });

        // Investor-match alerts
        data.properties.forEach(p => {
            if ((p.buyer_persona || '').toLowerCase().includes('investor') && (p.ai_processed === true || p.ai_processed === 't' || p.ai_processed === 'true')) {
                result.push({
                    id: `investor-${p.id}`,
                    type: 'investor',
                    severity: 'medium',
                    title: `Investment Match: ${p.title}`,
                    message: `${p.title} has been classified for investor personas. Consider targeting investment-focused marketing channels.`,
                    property: p,
                    time: p.updated_at,
                });
            }
        });

        // New unprocessed properties
        data.properties.forEach(p => {
            if (p.ai_processed !== true && p.ai_processed !== 't' && p.ai_processed !== 'true') {
                result.push({
                    id: `pending-${p.id}`,
                    type: 'new',
                    severity: 'low',
                    title: `Pending AI Processing: ${p.title}`,
                    message: `${p.title} has been added and is awaiting AI processing. SEO, persona classification, and market analysis will be generated within ~2 minutes.`,
                    property: p,
                    time: p.created_at,
                });
            }
        });

        // Pipeline errors
        data.errors.forEach(err => {
            result.push({
                id: `error-${err.id}`,
                type: 'error',
                severity: 'high',
                title: `Pipeline Error: ${err.node_name || 'Unknown Node'}`,
                message: err.error_message || 'An error occurred during AI processing.',
                time: err.created_at,
            });
        });

        return result.sort((a, b) => {
            const severityOrder = { high: 0, medium: 1, low: 2 };
            return severityOrder[a.severity] - severityOrder[b.severity];
        });
    }, [data]);

    if (loading) {
        return (
            <div>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 32 }}>Alerts</h1>
                {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16, marginBottom: 12 }} />)}
            </div>
        );
    }

    const highCount = alerts.filter(a => a.severity === 'high').length;
    const medCount = alerts.filter(a => a.severity === 'medium').length;
    const lowCount = alerts.filter(a => a.severity === 'low').length;

    const iconMap = {
        underpriced: <TrendingDown size={20} color="var(--color-emerald)" />,
        investor: <Target size={20} color="var(--color-cyan)" />,
        error: <XCircle size={20} color="var(--color-rose)" />,
        new: <Bell size={20} color="var(--color-amber)" />,
    };

    const borderMap = {
        underpriced: 'var(--color-emerald)',
        investor: 'var(--color-cyan)',
        error: 'var(--color-rose)',
        new: 'var(--color-amber)',
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Alerts</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{alerts.length} active alerts</p>
                </div>
                <button className="btn-secondary" onClick={refresh}><RefreshCw size={14} /></button>
            </div>

            {/* Alert Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                <div className="kpi-card rose" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <AlertTriangle size={16} color="var(--color-rose)" />
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>High Priority</span>
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-rose)', marginTop: 8 }}>{highCount}</div>
                </div>
                <div className="kpi-card amber" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Bell size={16} color="var(--color-amber)" />
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Medium</span>
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-amber)', marginTop: 8 }}>{medCount}</div>
                </div>
                <div className="kpi-card cyan" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircle2 size={16} color="var(--color-cyan)" />
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Info</span>
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-cyan)', marginTop: 8 }}>{lowCount}</div>
                </div>
            </div>

            {/* Alert List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {alerts.map((alert, i) => (
                    <div
                        key={`${alert.id}-${i}`}
                        className="glass-card animate-fade-in"
                        style={{
                            animationDelay: `${i * 40}ms`,
                            padding: 20,
                            borderLeft: `3px solid ${borderMap[alert.type]}`,
                            borderRadius: '4px 16px 16px 4px',
                        }}
                    >
                        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                            <div style={{ flexShrink: 0, marginTop: 2 }}>{iconMap[alert.type]}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                    <h3 style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.3 }}>{alert.title}</h3>
                                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)', whiteSpace: 'nowrap', marginLeft: 12 }}>
                                        {timeAgo(alert.time)}
                                    </span>
                                </div>
                                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>
                                    {alert.message}
                                </p>
                                {alert.property && (
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <span className="badge badge-info">{formatPrice(alert.property.price)}</span>
                                        <span className="badge badge-info">{alert.property.parish}</span>
                                        {alert.property.buyer_persona && (
                                            <span className="badge badge-cyan">{getPersonaIcon(alert.property.buyer_persona)} {alert.property.buyer_persona}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {alerts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
                    <CheckCircle2 size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                    <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>All clear!</p>
                    <p style={{ fontSize: 13 }}>No alerts at this time</p>
                </div>
            )}
        </div>
    );
}
