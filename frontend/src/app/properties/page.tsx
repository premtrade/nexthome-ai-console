'use client';

import { useState } from 'react';
import { useData } from '@/app/lib/useData';
import { formatPrice, timeAgo, getCompBadgeClass, getPersonaIcon, PARISHES } from '@/app/lib/types';
import type { Property } from '@/app/lib/types';
import {
    Plus, Search, RefreshCw, X, MapPin, Bed, Bath,
    DollarSign, Sparkles, RotateCcw, Trash2, Eye, ChevronDown, Edit2
} from 'lucide-react';

export default function PropertiesPage() {
    const { data, loading, postAction, refresh, pagination, page, goToPage } = useData(10000);
    const [search, setSearch] = useState('');
    const [filterParish, setFilterParish] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selected, setSelected] = useState<Property | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [enriching, setEnriching] = useState<string | null>(null);
    const [addForm, setAddForm] = useState({ title: '', description: '', price: '', parish: 'St. James', bedrooms: '3', bathrooms: '2' });
    const [editForm, setEditForm] = useState({ id: '', title: '', description: '', price: '', parish: '', bedrooms: '', bathrooms: '' });
    const [tab, setTab] = useState<'seo' | 'persona' | 'market'>('seo');

    if (loading || !data) {
        return (
            <div>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 32 }}>Properties</h1>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ height: 240, borderRadius: 16 }} />)}
                </div>
            </div>
        );
    }

    const filtered = data.properties.filter(p => {
        if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.parish.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterParish && p.parish !== filterParish) return false;
        if (filterStatus === 'processed' && !isProcessed(p)) return false;
        if (filterStatus === 'pending' && isProcessed(p)) return false;
        return true;
    });

    const handleAdd = async () => {
        if (!addForm.title) return;
        await postAction('add_property', {
            title: addForm.title,
            description: addForm.description,
            price: parseFloat(addForm.price) || 0,
            parish: addForm.parish,
            bedrooms: parseInt(addForm.bedrooms) || 0,
            bathrooms: parseInt(addForm.bathrooms) || 0,
        });
        setShowAdd(false);
        setAddForm({ title: '', description: '', price: '', parish: 'St. James', bedrooms: '3', bathrooms: '2' });
    };

    const handleEdit = async () => {
        if (!editForm.title || !editForm.id) return;
        await postAction('edit_property', {
            id: editForm.id,
            title: editForm.title,
            description: editForm.description,
            price: parseFloat(editForm.price) || 0,
            parish: editForm.parish,
            bedrooms: parseInt(editForm.bedrooms) || 0,
            bathrooms: parseInt(editForm.bathrooms) || 0,
        });
        setShowEdit(false);
        // Update selected if needed
        if (selected?.id === editForm.id) {
            setSelected({ ...selected, ...editForm, price: parseFloat(editForm.price) || 0, bedrooms: parseInt(editForm.bedrooms) || 0, bathrooms: parseInt(editForm.bathrooms) || 0 } as any);
        }
    };

    const handleReprocess = async (id: string) => {
        await postAction('reprocess', { id });
        setSelected(null);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this property?')) {
            await postAction('delete_property', { id });
            setSelected(null);
        }
    };

    const handleEnrich = async (id: string) => {
        setEnriching(id);
        const success = await postAction('enrich', { id });
        setEnriching(null);
        if (success && selected?.id === id) {
            // Close and reopen to refresh selected data if needed, 
            // but useData interval will refresh it anyway.
            setSelected(null);
        }
    };

    const isProcessed = (p: Property) => p.ai_processed === true || p.ai_processed === 't' || p.ai_processed === 'true';

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Properties</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
                        {filtered.length} properties · {data.properties.filter(p => isProcessed(p)).length} AI processed
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn-secondary" onClick={refresh}><RefreshCw size={14} /></button>
                    <button className="btn-primary" onClick={() => setShowAdd(true)}>
                        <Plus size={16} /> Add Property
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input className="input-field" placeholder="Search properties..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
                </div>
                <select className="input-field" style={{ width: 180 }} value={filterParish} onChange={e => setFilterParish(e.target.value)}>
                    <option value="">All Parishes</option>
                    {PARISHES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select className="input-field" style={{ width: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="processed">AI Processed</option>
                    <option value="pending">Pending</option>
                </select>
            </div>

            {/* Property Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340, 1fr))', gap: 20 }}>
                {filtered.map((p, i) => (
                    <div key={p.id} className="property-card animate-fade-in" style={{ animationDelay: `${i * 50}ms`, cursor: 'pointer' }} onClick={() => setSelected(p)}>
                        {/* Color Bar */}
                        <div style={{
                            height: 4,
                            background: isProcessed(p)
                                ? 'linear-gradient(90deg, var(--color-emerald), var(--color-cyan))'
                                : 'linear-gradient(90deg, var(--color-amber), var(--color-rose))',
                        }} />
                        <div style={{ padding: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{p.title}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-muted)', fontSize: 13 }}>
                                        <MapPin size={12} /> {p.parish || 'Unknown'}
                                    </div>
                                </div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-accent-light)' }}>
                                    {formatPrice(p.price)}
                                </div>
                            </div>

                            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: 16, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                                {p.description || 'No description available'}
                            </p>

                            <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 13, color: 'var(--color-text-muted)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Bed size={14} /> {p.bedrooms} beds</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Bath size={14} /> {p.bathrooms} baths</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {isProcessed(p) ? (
                                        <span className="badge badge-success"><Sparkles size={10} /> AI Ready</span>
                                    ) : (
                                        <span className="badge badge-warning">
                                            {enriching === p.id ? '✨ Processing...' : '⏳ Pending'}
                                        </span>
                                    )}
                                    {p.competitiveness && (
                                        <span className={`badge ${getCompBadgeClass(p.competitiveness)}`}>
                                            {p.competitiveness}
                                        </span>
                                    )}
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

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="pagination">
                    <button onClick={() => goToPage(1)} disabled={page === 1}>««</button>
                    <button onClick={() => goToPage(page - 1)} disabled={page === 1}>«</button>
                    <span className="pagination-info">
                        Page {page} of {pagination.totalPages} ({pagination.total} total)
                    </span>
                    <button onClick={() => goToPage(page + 1)} disabled={page === pagination.totalPages}>»</button>
                    <button onClick={() => goToPage(pagination.totalPages)} disabled={page === pagination.totalPages}>»»</button>
                </div>
            )}

            {/* Detail Panel */}
            {selected && (
                <>
                    <div className="detail-panel-overlay" onClick={() => setSelected(null)} />
                    <div className="detail-panel animate-slide-in">
                        <div style={{ padding: 24, borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700 }}>{selected.title}</h2>
                            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: 24 }}>
                            {/* Property Info */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                                <div style={{ padding: 12, background: 'var(--color-bg-primary)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>PRICE</div>
                                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-accent-light)' }}>{formatPrice(selected.price)}</div>
                                </div>
                                <div style={{ padding: 12, background: 'var(--color-bg-primary)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>PARISH</div>
                                    <div style={{ fontSize: 16, fontWeight: 600 }}>{selected.parish || 'N/A'}</div>
                                </div>
                                <div style={{ padding: 12, background: 'var(--color-bg-primary)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>BEDROOMS / BATHS</div>
                                    <div style={{ fontSize: 16, fontWeight: 600 }}>{selected.bedrooms} / {selected.bathrooms}</div>
                                </div>
                                <div style={{ padding: 12, background: 'var(--color-bg-primary)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
                                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>STATUS</div>
                                    <div>{isProcessed(selected) ? <span className="badge badge-success">✓ Processed</span> : <span className="badge badge-warning">⏳ Pending</span>}</div>
                                </div>
                            </div>

                            {/* Description */}
                            <div style={{ marginBottom: 24 }}>
                                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Description</div>
                                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{selected.description || 'No description'}</p>
                            </div>

                            {/* AI Content Tabs */}
                            {isProcessed(selected) && (
                                <>
                                    <div className="tab-bar" style={{ marginBottom: 20 }}>
                                        <button className={`tab-item ${tab === 'seo' ? 'active' : ''}`} onClick={() => setTab('seo')}>SEO Content</button>
                                        <button className={`tab-item ${tab === 'persona' ? 'active' : ''}`} onClick={() => setTab('persona')}>Buyer Persona</button>
                                        <button className={`tab-item ${tab === 'market' ? 'active' : ''}`} onClick={() => setTab('market')}>Market Position</button>
                                    </div>

                                    {tab === 'seo' && (
                                        <div className="animate-fade-in">
                                            <div style={{ marginBottom: 16 }}>
                                                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6, fontWeight: 600 }}>META TITLE</div>
                                                <div style={{ padding: 12, background: 'var(--color-bg-primary)', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 14 }}>
                                                    {selected.meta_title || 'N/A'}
                                                </div>
                                            </div>
                                            <div style={{ marginBottom: 16 }}>
                                                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6, fontWeight: 600 }}>META DESCRIPTION</div>
                                                <div style={{ padding: 12, background: 'var(--color-bg-primary)', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 13, lineHeight: 1.5 }}>
                                                    {selected.meta_description || 'N/A'}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6, fontWeight: 600 }}>SEO DESCRIPTION</div>
                                                <div style={{ padding: 12, background: 'var(--color-bg-primary)', borderRadius: 8, border: '1px solid var(--color-border)', fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
                                                    {selected.seo_description || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {tab === 'persona' && (
                                        <div className="animate-fade-in" style={{ textAlign: 'center', padding: '20px 0' }}>
                                            <div style={{ fontSize: 48, marginBottom: 12 }}>{getPersonaIcon(selected.buyer_persona)}</div>
                                            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{selected.buyer_persona || 'Unknown'}</div>
                                            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Primary buyer persona classification</div>
                                        </div>
                                    )}

                                    {tab === 'market' && (
                                        <div className="animate-fade-in" style={{ textAlign: 'center', padding: '20px 0' }}>
                                            <div style={{
                                                display: 'inline-block', padding: '8px 24px', borderRadius: 20, fontSize: 18, fontWeight: 700,
                                                background: selected.competitiveness?.toLowerCase() === 'underpriced' ? 'var(--color-emerald-glow)' : selected.competitiveness?.toLowerCase() === 'overpriced' ? 'var(--color-rose-glow)' : 'var(--color-amber-glow)',
                                                color: selected.competitiveness?.toLowerCase() === 'underpriced' ? 'var(--color-emerald)' : selected.competitiveness?.toLowerCase() === 'overpriced' ? 'var(--color-rose)' : 'var(--color-amber)',
                                            }}>
                                                {selected.competitiveness || 'Not Assessed'}
                                            </div>
                                            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 12 }}>Competitiveness vs. similar properties in {selected.parish}</div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 10, marginTop: 24, borderTop: '1px solid var(--color-border)', paddingTop: 20 }}>
                                <button
                                    className="btn-primary"
                                    onClick={() => handleEnrich(selected.id)}
                                    style={{ flex: 1.5 }}
                                    disabled={enriching === selected.id}
                                >
                                    <Sparkles size={14} /> {enriching === selected.id ? 'Enriching...' : 'Enrich with AI'}
                                </button>
                                <button className="btn-secondary" onClick={() => {
                                    setEditForm({
                                        id: selected.id,
                                        title: selected.title,
                                        description: selected.description || '',
                                        price: selected.price.toString(),
                                        parish: selected.parish || 'St. James',
                                        bedrooms: selected.bedrooms.toString(),
                                        bathrooms: selected.bathrooms.toString()
                                    });
                                    setShowEdit(true);
                                }} style={{ flex: 1 }}>
                                    <Edit2 size={14} /> Edit
                                </button>
                                <button className="btn-secondary" onClick={() => handleReprocess(selected.id)} style={{ flex: 1 }}>
                                    <RotateCcw size={14} /> Clear AI
                                </button>
                                <button className="btn-secondary" onClick={() => handleDelete(selected.id)} style={{ color: 'var(--color-rose)' }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Add Property Modal */}
            {showAdd && (
                <>
                    <div className="detail-panel-overlay" onClick={() => setShowAdd(false)} />
                    <div className="detail-panel animate-slide-in">
                        <div style={{ padding: 24, borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Add New Property</h2>
                            <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6, display: 'block' }}>Title *</label>
                                <input className="input-field" placeholder="e.g. Oceanfront Villa" value={addForm.title} onChange={e => setAddForm({ ...addForm, title: e.target.value })} />
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block' }}>Description</label>
                                    <span style={{ fontSize: 10, color: addForm.description.length > 500 ? 'var(--color-rose)' : 'var(--color-text-muted)' }}>
                                        {addForm.description.length} / 1000
                                    </span>
                                </div>
                                <textarea
                                    className="input-field"
                                    rows={6}
                                    placeholder="Describe the property's unique features, view, and atmosphere..."
                                    value={addForm.description}
                                    onChange={e => setAddForm({ ...addForm, description: e.target.value.slice(0, 1000) })}
                                    style={{ resize: 'vertical', minHeight: '120px', lineHeight: '1.5', padding: '12px' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6, display: 'block' }}>Price ($)</label>
                                    <input className="input-field" type="number" placeholder="2500000" value={addForm.price} onChange={e => setAddForm({ ...addForm, price: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6, display: 'block' }}>Parish</label>
                                    <select className="input-field" value={addForm.parish} onChange={e => setAddForm({ ...addForm, parish: e.target.value })}>
                                        {PARISHES.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6, display: 'block' }}>Bedrooms</label>
                                    <input className="input-field" type="number" value={addForm.bedrooms} onChange={e => setAddForm({ ...addForm, bedrooms: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6, display: 'block' }}>Bathrooms</label>
                                    <input className="input-field" type="number" value={addForm.bathrooms} onChange={e => setAddForm({ ...addForm, bathrooms: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ padding: 12, background: 'var(--color-accent-glow)', borderRadius: 10, fontSize: 13, color: 'var(--color-accent-light)' }}>
                                <Sparkles size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                                AI will automatically generate SEO content, classify buyer persona, and assess market competitiveness within ~2 minutes.
                            </div>
                            <button className="btn-primary" onClick={handleAdd} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                                <Plus size={16} /> Add Property
                            </button>
                        </div>
                    </div>
                </>
            )}
            {/* Edit Property Modal */}
            {showEdit && (
                <>
                    <div className="detail-panel-overlay" onClick={() => setShowEdit(false)} />
                    <div className="detail-panel animate-slide-in">
                        <div style={{ padding: 24, borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Edit Property</h2>
                            <button onClick={() => setShowEdit(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6, display: 'block' }}>Title *</label>
                                <input className="input-field" placeholder="e.g. Oceanfront Villa" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block' }}>Description</label>
                                    <span style={{ fontSize: 10, color: editForm.description.length > 500 ? 'var(--color-rose)' : 'var(--color-text-muted)' }}>
                                        {editForm.description.length} / 1000
                                    </span>
                                </div>
                                <textarea
                                    className="input-field"
                                    rows={6}
                                    placeholder="Describe the property..."
                                    value={editForm.description}
                                    onChange={e => setEditForm({ ...editForm, description: e.target.value.slice(0, 1000) })}
                                    style={{ resize: 'vertical', minHeight: '120px', lineHeight: '1.5', padding: '12px' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6, display: 'block' }}>Price ($)</label>
                                    <input className="input-field" type="number" placeholder="2500000" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6, display: 'block' }}>Parish</label>
                                    <select className="input-field" value={editForm.parish} onChange={e => setEditForm({ ...editForm, parish: e.target.value })}>
                                        {PARISHES.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6, display: 'block' }}>Bedrooms</label>
                                    <input className="input-field" type="number" value={editForm.bedrooms} onChange={e => setEditForm({ ...editForm, bedrooms: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6, display: 'block' }}>Bathrooms</label>
                                    <input className="input-field" type="number" value={editForm.bathrooms} onChange={e => setEditForm({ ...editForm, bathrooms: e.target.value })} />
                                </div>
                            </div>
                            <button className="btn-primary" onClick={handleEdit} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                                <RefreshCw size={16} /> Update Property
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
