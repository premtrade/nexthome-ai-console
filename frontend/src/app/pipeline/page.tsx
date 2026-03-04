'use client';

import { useData } from '@/app/lib/useData';
import { timeAgo } from '@/app/lib/types';
import {
    CheckCircle2, XCircle, Clock, Activity, Zap,
    Database, Brain, BarChart3, RefreshCw, ArrowRight
} from 'lucide-react';

const pipelineSteps = [
    { name: 'Poll DB', icon: Database, desc: 'Query unprocessed' },
    { name: 'Normalize', icon: Zap, desc: 'Clean & validate' },
    { name: 'SEO Gen', icon: Brain, desc: 'Flowise / Groq' },
    { name: 'Persona', icon: Brain, desc: 'Flowise / Groq' },
    { name: 'Rank', icon: BarChart3, desc: 'Market analysis' },
    { name: 'Update', icon: Database, desc: 'Save to DB' },
];

export default function PipelinePage() {
    const { data, loading, refresh } = useData(5000);

    if (loading || !data) {
        return (
            <div>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 32 }}>AI Pipeline</h1>
                <div className="skeleton" style={{ height: 140, borderRadius: 16, marginBottom: 20 }} />
                <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
            </div>
        );
    }

    const { execStats, recentExecs } = data;
    const successCount = parseInt(execStats.find(e => e.status === 'success')?.count || '0');
    const errorCount = parseInt(execStats.find(e => e.status === 'error')?.count || '0');
    const crashedCount = parseInt(execStats.find(e => e.status === 'crashed')?.count || '0');
    const runningCount = parseInt(execStats.find(e => e.status === 'running')?.count || '0');
    const totalExecs = successCount + errorCount + crashedCount;

    const latestExec = recentExecs[0];
    const isLive = latestExec?.status === 'running';
    const latestStatus = latestExec?.status || 'unknown';

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>AI Pipeline</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Real-time workflow monitoring & execution history</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="pulse-dot" style={{
                            background: isLive ? 'var(--color-emerald)' : latestStatus === 'success' ? 'var(--color-emerald)' : 'var(--color-amber)',
                            boxShadow: isLive ? '0 0 12px var(--color-emerald)' : 'none'
                        }} />
                        <span style={{ fontSize: 14, fontWeight: 600, color: isLive ? 'var(--color-emerald)' : 'var(--color-text-secondary)' }}>
                            {isLive ? 'Processing...' : 'Idle'}
                        </span>
                    </div>
                    <button className="btn-secondary" onClick={refresh}><RefreshCw size={14} /></button>
                </div>
            </div>

            {/* Pipeline Visualization */}
            <div className="glass-card" style={{ padding: 32, marginBottom: 28 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 24 }}>Pipeline Flow</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, overflowX: 'auto', padding: '8px 0' }}>
                    {pipelineSteps.map((step, i) => (
                        <div key={step.name} style={{ display: 'flex', alignItems: 'center' }}>
                            <div className={`pipeline-node ${isLive ? 'running' : 'success'}`} style={{ minWidth: 110 }}>
                                <step.icon size={20} color={isLive ? 'var(--color-amber)' : 'var(--color-emerald)'} />
                                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{step.name}</div>
                                <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{step.desc}</div>
                            </div>
                            {i < pipelineSteps.length - 1 && (
                                <div style={{ padding: '0 4px' }}>
                                    <ArrowRight size={16} color="var(--color-border-light)" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                <div className="kpi-card emerald">
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Successful</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-emerald)' }}>{successCount}</div>
                </div>
                <div className="kpi-card rose">
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Failed</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-rose)' }}>{errorCount}</div>
                </div>
                <div className="kpi-card amber">
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Running</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-amber)' }}>{runningCount}</div>
                </div>
                <div className="kpi-card cyan">
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Success Rate</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--color-cyan)' }}>
                        {totalExecs > 0 ? ((successCount / totalExecs) * 100).toFixed(0) : 0}%
                    </div>
                </div>
            </div>

            {/* Execution Log */}
            <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Execution History</h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Status</th>
                            <th>Started</th>
                            <th>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentExecs.map((ex, i) => {
                            const started = new Date(ex.startedAt);
                            const stopped = ex.stoppedAt ? new Date(ex.stoppedAt) : null;
                            const duration = stopped ? ((stopped.getTime() - started.getTime()) / 1000).toFixed(1) : '—';
                            return (
                                <tr key={ex.id} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text-primary)' }}>#{ex.id}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {ex.status === 'success' ? (
                                                <><CheckCircle2 size={14} color="var(--color-emerald)" /><span className="badge badge-success">Success</span></>
                                            ) : ex.status === 'running' ? (
                                                <><Clock size={14} color="var(--color-amber)" /><span className="badge badge-warning">Running</span></>
                                            ) : ex.status === 'crashed' ? (
                                                <><XCircle size={14} color="var(--color-rose)" /><span className="badge badge-error">Crashed</span></>
                                            ) : (
                                                <><XCircle size={14} color="var(--color-rose)" /><span className="badge badge-error">Error</span></>
                                            )}
                                        </div>
                                    </td>
                                    <td>{timeAgo(ex.startedAt)}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{duration !== '—' ? `${duration}s` : '—'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
