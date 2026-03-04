'use client';

import { useEffect, useState } from 'react';
import { getLeadsList } from '@/lib/lead-scoring-api';
import styles from '@/styles/leads-dashboard.module.css';
import { Lead, formatPrice } from '@/app/lib/types';
import { Mail, Phone, MapPin, TrendingUp, Calendar, Eye, Send, MoreHorizontal, Sparkles, X } from 'lucide-react';

export default function LeadsPage() {
    const tenantId = 'default-tenant'; // Mocking tenant_id for now
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [matching, setMatching] = useState<string | null>(null);
    const [selectedMatches, setSelectedMatches] = useState<{ lead: Lead, properties: any[] } | null>(null);
    const [filter, setFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
    const [sortBy, setSortBy] = useState<'score' | 'date' | 'name'>('score');

    useEffect(() => {
        fetchLeads();
    }, [tenantId, filter]);

    const fetchLeads = async () => {
        setLoading(true);
        setError(null);
        try {
            // Our new API route supports GET /api/leads
            const response = await fetch('/api/leads');
            if (!response.ok) throw new Error('Failed to fetch leads');
            const data = await response.json();

            let filtered = data;
            if (filter !== 'ALL') {
                filtered = data.filter((l: Lead) => {
                    const priority = l.ai_score >= 80 ? 'HIGH' : l.ai_score >= 50 ? 'MEDIUM' : 'LOW';
                    return priority === filter;
                });
            }

            setLeads(filtered);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch leads');
        } finally {
            setLoading(false);
        }
    };

    const handleMatch = async (lead: Lead) => {
        setMatching(lead.id);
        try {
            const res = await fetch(`/api/leads/${lead.id}/matches`, { method: 'POST' });
            if (!res.ok) throw new Error('Matching failed');
            const updatedLead = await res.json();

            // Fetch the actual property details for the matched IDs
            const propsRes = await fetch('/api/data');
            const allData = await propsRes.json();
            const matchedProps = allData.properties.filter((p: any) => updatedLead.matched_property_ids.includes(p.id));

            setSelectedMatches({ lead: updatedLead, properties: matchedProps });
            fetchLeads(); // Refresh list to show updated match status/ids if needed
        } catch (err) {
            alert('AI Matching failed. Check connection.');
        } finally {
            setMatching(null);
        }
    };

    const getPriorityColor = (score: number) => {
        if (score >= 80) return 'var(--color-rose)';
        if (score >= 50) return 'var(--color-amber)';
        return 'var(--color-accent)';
    };

    const getPriorityLabel = (score: number) => {
        if (score >= 80) return 'HIGH';
        if (score >= 50) return 'MEDIUM';
        return 'LOW';
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>💼 Leads Dashboard</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>AI-powered lead scoring and property matching</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
                        <button
                            key={p}
                            onClick={() => setFilter(p as any)}
                            className={filter === p ? 'btn-primary' : 'btn-secondary'}
                            style={{ padding: '8px 16px', fontSize: '13px' }}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)', padding: '6px 12px' }}
                    >
                        <option value="score">Score (High to Low)</option>
                        <option value="date">Most Recent</option>
                        <option value="name">Name (A-Z)</option>
                    </select>
                </div>
            </div>

            {error && (
                <div style={{ padding: '16px', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--color-rose)', borderRadius: '12px', color: 'var(--color-rose)', marginBottom: '24px' }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center' }}>
                    <div className="shimmer" style={{ width: '40px', height: '40px', borderRadius: '50%', margin: '0 auto 16px' }}></div>
                    <p>Analyzing leads...</p>
                </div>
            ) : leads.length === 0 ? (
                <div style={{ padding: '80px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                    <h3 style={{ marginBottom: '8px' }}>No leads found</h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>Wait for AI to process new inquiries.</p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                                <th style={{ padding: '12px', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '13px' }}>LEAD</th>
                                <th style={{ padding: '12px', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '13px' }}>CONTACT</th>
                                <th style={{ padding: '12px', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '13px' }}>AI SCORE</th>
                                <th style={{ padding: '12px', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '13px' }}>PRIORITY</th>
                                <th style={{ padding: '12px', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '13px' }}>STATUS</th>
                                <th style={{ padding: '12px', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '13px' }}>ADDED</th>
                                <th style={{ padding: '12px', textAlign: 'right' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map(lead => {
                                const priority = getPriorityLabel(lead.ai_score);
                                return (
                                    <tr key={lead.id} className="table-row-hover" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '16px 12px' }}>
                                            <div style={{ fontWeight: 600 }}>{lead.name}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                                {lead.raw_inquiry ? (lead.raw_inquiry.length > 40 ? lead.raw_inquiry.substring(0, 40) + '...' : lead.raw_inquiry) : 'No inquiry data'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <Mail size={14} style={{ opacity: 0.6 }} />
                                                <span style={{ fontSize: '13px' }}>{lead.email}</span>
                                            </div>
                                            {lead.phone && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Phone size={14} style={{ opacity: 0.6 }} />
                                                    <span style={{ fontSize: '13px' }}>{lead.phone}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px 12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${lead.ai_score}%`, height: '100%', background: getPriorityColor(lead.ai_score) }}></div>
                                                </div>
                                                <span style={{ fontWeight: 700 }}>{lead.ai_score}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 12px' }}>
                                            <span className={`badge ${priority === 'HIGH' ? 'badge-error' : priority === 'MEDIUM' ? 'badge-warning' : 'badge-info'}`}>
                                                {priority}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 12px' }}>
                                            <span style={{ fontSize: '13px', textTransform: 'capitalize' }}>{lead.status || 'New'}</span>
                                        </td>
                                        <td style={{ padding: '16px 12px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                                            {formatDate(lead.created_at)}
                                        </td>
                                        <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button
                                                    className="btn-primary"
                                                    style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                    onClick={() => handleMatch(lead)}
                                                    disabled={matching === lead.id}
                                                >
                                                    <Sparkles size={14} /> {matching === lead.id ? 'Matching...' : 'Match Properties'}
                                                </button>
                                                <button className="btn-secondary" style={{ padding: '8px' }} title="View Details"><Eye size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Match Modal */}
            {selectedMatches && (
                <>
                    <div className="detail-panel-overlay" onClick={() => setSelectedMatches(null)} />
                    <div className="detail-panel animate-slide-in" style={{ width: '500px' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Property Matches for {selectedMatches.lead.name}</h2>
                            <button onClick={() => setSelectedMatches(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div style={{ padding: '12px', background: 'var(--color-accent-glow)', borderRadius: '12px', fontSize: '13px', color: 'var(--color-accent-light)', marginBottom: '24px' }}>
                                Our AI found {selectedMatches.properties.length} properties that match this lead's inquiry: <i>"{selectedMatches.lead.raw_inquiry}"</i>
                            </div>

                            {selectedMatches.properties.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No strong matches found yet. Try enriching more properties!</p>
                            ) : (
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    {selectedMatches.properties.map(p => (
                                        <div key={p.id} className="glass-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <div style={{ fontWeight: 700 }}>{p.title}</div>
                                                <div style={{ color: 'var(--color-accent-light)', fontWeight: 800 }}>{formatPrice(p.price)}</div>
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', gap: '8px' }}>
                                                <MapPin size={10} /> {p.parish} • {p.bedrooms} beds
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button className="btn-primary" style={{ width: '100%', marginTop: '32px', padding: '14px' }} onClick={() => setSelectedMatches(null)}>
                                Send Recommendations via WhatsApp
                            </button>
                        </div>
                    </div>
                </>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '32px' }}>
                <div className="glass-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Total Leads</div>
                    <div style={{ fontSize: '24px', fontWeight: 700 }}>{leads.length}</div>
                </div>
                <div className="glass-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>High Priority</div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-rose)' }}>
                        {leads.filter(l => l.ai_score >= 80).length}
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.03)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Avg AI Score</div>
                    <div style={{ fontSize: '24px', fontWeight: 700 }}>
                        {leads.length > 0 ? Math.round(leads.reduce((s, l) => s + l.ai_score, 0) / leads.length) : 0}
                    </div>
                </div>
            </div>
        </div>
    );
}
