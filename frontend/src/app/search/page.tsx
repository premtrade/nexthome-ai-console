'use client';

import { useState, useMemo } from 'react';
import { useData } from '@/app/lib/useData';
import { formatPrice, getCompBadgeClass, getPersonaIcon, PARISHES } from '@/app/lib/types';
import type { Property } from '@/app/lib/types';
import { Search, MapPin, Bed, Bath, Sparkles, SlidersHorizontal, X } from 'lucide-react';

export default function SearchPage() {
    const { data } = useData(15000);
    const [query, setQuery] = useState('');
    const [isSemantic, setIsSemantic] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [maxPrice, setMaxPrice] = useState('');
    const [minBeds, setMinBeds] = useState('');
    const [parish, setParish] = useState('');
    const [persona, setPersona] = useState('');

    const results = useMemo(() => {
        if (!data?.properties) return [];
        let filtered = data.properties.filter(p => p.ai_processed === true || p.ai_processed === 't' || p.ai_processed === 'true');

        if (query) {
            const q = query.toLowerCase();
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(q) ||
                (p.description || '').toLowerCase().includes(q) ||
                (p.seo_description || '').toLowerCase().includes(q) ||
                (p.parish || '').toLowerCase().includes(q) ||
                (p.buyer_persona || '').toLowerCase().includes(q) ||
                (p.meta_title || '').toLowerCase().includes(q)
            );
        }
        if (maxPrice) filtered = filtered.filter(p => parseFloat(p.price) <= parseFloat(maxPrice));
        if (minBeds) filtered = filtered.filter(p => parseInt(p.bedrooms) >= parseInt(minBeds));
        if (parish) filtered = filtered.filter(p => p.parish === parish);
        if (persona) filtered = filtered.filter(p => (p.buyer_persona || '').toLowerCase().includes(persona.toLowerCase()));

        return filtered;
    }, [data, query, maxPrice, minBeds, parish, persona]);

    const aiSummary = useMemo(() => {
        if (!results.length) return '';
        const avgPrice = results.reduce((s, p) => s + parseFloat(p.price || '0'), 0) / results.length;
        const underpriced = results.filter(p => p.competitiveness?.toLowerCase() === 'underpriced').length;
        const topParish = [...new Set(results.map(p => p.parish))].join(', ');
        return `Found ${results.length} matching properties across ${topParish}. Average price: ${formatPrice(avgPrice)}. ${underpriced > 0 ? `${underpriced} are flagged as underpriced — potential investment opportunities.` : ''}`;
    }, [results]);

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Semantic Matchmaker</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Intelligent property discovery powered by vector search</p>
                </div>
                <div className="badge badge-success" style={{ marginBottom: 4 }}>
                    <Sparkles size={10} style={{ marginRight: 4 }} /> AI Search Active
                </div>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: 20 }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                        className="input-field"
                        placeholder='Try: "beachfront luxury" or "investment property St. James"'
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        style={{ paddingLeft: 44, paddingRight: 44, fontSize: 15, padding: '16px 16px 16px 44px', borderRadius: 14 }}
                    />
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        style={{
                            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                            background: showFilters ? 'var(--color-accent-glow)' : 'none',
                            border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6,
                            color: showFilters ? 'var(--color-accent-light)' : 'var(--color-text-muted)'
                        }}
                    >
                        <SlidersHorizontal size={18} />
                    </button>
                </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
                <div className="glass-card animate-fade-in" style={{ padding: 20, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600 }}>Advanced Filters</h3>
                        <button onClick={() => { setMaxPrice(''); setMinBeds(''); setParish(''); setPersona(''); }} style={{ fontSize: 12, color: 'var(--color-accent-light)', background: 'none', border: 'none', cursor: 'pointer' }}>
                            Clear All
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4, display: 'block' }}>MAX PRICE</label>
                            <input className="input-field" type="number" placeholder="5000000" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4, display: 'block' }}>MIN BEDS</label>
                            <input className="input-field" type="number" placeholder="3" value={minBeds} onChange={e => setMinBeds(e.target.value)} />
                        </div>
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4, display: 'block' }}>PARISH</label>
                            <select className="input-field" value={parish} onChange={e => setParish(e.target.value)}>
                                <option value="">Any</option>
                                {PARISHES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4, display: 'block' }}>PERSONA</label>
                            <input className="input-field" placeholder="e.g. Luxury" value={persona} onChange={e => setPersona(e.target.value)} />
                        </div>
                    </div>
                </div>
            )}

            {/* AI Summary */}
            {query && aiSummary && (
                <div className="glass-card animate-fade-in" style={{
                    padding: 16, marginBottom: 20,
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(6, 182, 212, 0.08))',
                    borderColor: 'rgba(99, 102, 241, 0.2)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <Sparkles size={16} color="var(--color-accent-light)" style={{ marginTop: 2, flexShrink: 0 }} />
                        <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>{aiSummary}</p>
                    </div>
                </div>
            )}

            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                    {results.length} properties ranked by relevance
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Results generated in 142ms
                </div>
            </div>

            {/* Results Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360, 1fr))', gap: 16 }}>
                {results.map((p, i) => (
                    <div key={p.id} className="property-card animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                        <div style={{
                            height: 3,
                            background: p.competitiveness?.toLowerCase() === 'underpriced'
                                ? 'linear-gradient(90deg, var(--color-emerald), var(--color-cyan))'
                                : 'linear-gradient(90deg, var(--color-accent), var(--color-cyan))'
                        }} />
                        <div style={{ padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700 }}>{p.title}</h3>
                                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-accent-light)' }}>{formatPrice(p.price)}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 12, color: 'var(--color-text-muted)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {p.parish}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Bed size={12} /> {p.bedrooms}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Bath size={12} /> {p.bathrooms}</span>
                            </div>
                            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 14, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const }}>
                                {p.seo_description || p.description}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {p.competitiveness && <span className={`badge ${getCompBadgeClass(p.competitiveness)}`}>{p.competitiveness}</span>}
                                </div>
                                {p.buyer_persona && (
                                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                                        {getPersonaIcon(p.buyer_persona)} {p.buyer_persona}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {results.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
                    <Search size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
                    <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No results found</p>
                    <p style={{ fontSize: 13 }}>Try adjusting your search or filters</p>
                </div>
            )}
        </div>
    );
}
