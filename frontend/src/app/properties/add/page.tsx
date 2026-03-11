'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/app/lib/useData';
import { PARISHES } from '@/app/lib/types';
import {
    Plus, Search, RefreshCw, X, MapPin, Bed, Bath,
    DollarSign, ArrowLeft, Save
} from 'lucide-react';
import Link from 'next/link';

export default function AddPropertyPage() {
    const router = useRouter();
    const { postAction, refresh } = useData(10000);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        price: '',
        parish: 'St. James',
        bedrooms: '3',
        bathrooms: '2',
        image_url: ''
    });

    const handleChange = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!form.title || submitting) return;
        setSubmitting(true);
        try {
            await postAction('add_property', {
                title: form.title,
                description: form.description,
                price: parseFloat(form.price) || 0,
                parish: form.parish,
                bedrooms: parseInt(form.bedrooms) || 0,
                bathrooms: parseInt(form.bathrooms) || 0,
                image_url: form.image_url || null,
            });
            router.push('/properties');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <Link href="/properties" style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    color: 'var(--color-text-muted)',
                    fontSize: 14,
                    marginBottom: 16,
                    textDecoration: 'none'
                }}>
                    <ArrowLeft size={16} /> Back to Properties
                </Link>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Add New Property</h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
                    Enter property details to add to your portfolio
                </p>
            </div>

            {/* Form */}
            <div className="glass-card" style={{ padding: 32, maxWidth: 800 }}>
                <div style={{ display: 'grid', gap: 24 }}>
                    {/* Title */}
                    <div>
                        <label style={{ 
                            display: 'block', 
                            fontSize: 12, 
                            fontWeight: 600, 
                            color: 'var(--color-text-muted)', 
                            marginBottom: 8,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Property Title *
                        </label>
                        <input
                            className="input-field"
                            placeholder="e.g., Luxury Villa in Montego Bay"
                            value={form.title}
                            onChange={e => handleChange('title', e.target.value)}
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <label style={{ 
                            display: 'block', 
                            fontSize: 12, 
                            fontWeight: 600, 
                            color: 'var(--color-text-muted)', 
                            marginBottom: 8,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Price (USD)
                        </label>
                        <div style={{ position: 'relative' }}>
                            <DollarSign size={16} style={{ 
                                position: 'absolute', 
                                left: 14, 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                color: 'var(--color-text-muted)' 
                            }} />
                            <input
                                className="input-field"
                                type="number"
                                placeholder="0"
                                value={form.price}
                                onChange={e => handleChange('price', e.target.value)}
                                style={{ paddingLeft: 36 }}
                            />
                        </div>
                    </div>

                    {/* Parish */}
                    <div>
                        <label style={{ 
                            display: 'block', 
                            fontSize: 12, 
                            fontWeight: 600, 
                            color: 'var(--color-text-muted)', 
                            marginBottom: 8,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Parish
                        </label>
                        <select
                            className="input-field"
                            value={form.parish}
                            onChange={e => handleChange('parish', e.target.value)}
                        >
                            {PARISHES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    {/* Bedrooms & Bathrooms */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <label style={{ 
                                display: 'block', 
                                fontSize: 12, 
                                fontWeight: 600, 
                                color: 'var(--color-text-muted)', 
                                marginBottom: 8,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Bedrooms
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Bed size={16} style={{ 
                                    position: 'absolute', 
                                    left: 14, 
                                    top: '50%', 
                                    transform: 'translateY(-50%)', 
                                    color: 'var(--color-text-muted)' 
                                }} />
                                <input
                                    className="input-field"
                                    type="number"
                                    placeholder="3"
                                    value={form.bedrooms}
                                    onChange={e => handleChange('bedrooms', e.target.value)}
                                    style={{ paddingLeft: 36 }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ 
                                display: 'block', 
                                fontSize: 12, 
                                fontWeight: 600, 
                                color: 'var(--color-text-muted)', 
                                marginBottom: 8,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Bathrooms
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Bath size={16} style={{ 
                                    position: 'absolute', 
                                    left: 14, 
                                    top: '50%', 
                                    transform: 'translateY(-50%)', 
                                    color: 'var(--color-text-muted)' 
                                }} />
                                <input
                                    className="input-field"
                                    type="number"
                                    placeholder="2"
                                    value={form.bathrooms}
                                    onChange={e => handleChange('bathrooms', e.target.value)}
                                    style={{ paddingLeft: 36 }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Image URL */}
                    <div>
                        <label style={{ 
                            display: 'block', 
                            fontSize: 12, 
                            fontWeight: 600, 
                            color: 'var(--color-text-muted)', 
                            marginBottom: 8,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Image URL
                        </label>
                        <input
                            className="input-field"
                            placeholder="https://example.com/property-image.jpg"
                            value={form.image_url}
                            onChange={e => handleChange('image_url', e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label style={{ 
                            display: 'block', 
                            fontSize: 12, 
                            fontWeight: 600, 
                            color: 'var(--color-text-muted)', 
                            marginBottom: 8,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Description
                        </label>
                        <textarea
                            className="input-field"
                            placeholder="Enter property description..."
                            value={form.description}
                            onChange={e => handleChange('description', e.target.value)}
                            rows={5}
                            style={{ resize: 'vertical', minHeight: 120 }}
                        />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <button 
                            className="btn-secondary" 
                            onClick={() => router.push('/properties')}
                            style={{ flex: 1 }}
                        >
                            Cancel
                        </button>
                        <button 
                            className="btn-primary" 
                            onClick={handleSubmit}
                            disabled={!form.title || submitting}
                            style={{ flex: 1, opacity: (!form.title || submitting) ? 0.5 : 1 }}
                        >
                            <Save size={16} /> {submitting ? 'Saving...' : 'Save Property'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
