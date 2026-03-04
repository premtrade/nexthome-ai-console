'use client';

import { useState } from 'react';
import styles from '@/styles/lead-form.module.css';

interface LeadFormProps {
    tenantId: string;
    onSuccess?: (lead: any) => void;
}

export function LeadForm({ tenantId, onSuccess }: LeadFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        raw_inquiry: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, tenant_id: tenantId }),
            });

            if (!response.ok) throw new Error('Failed to submit inquiry');
            const result = await response.json();

            setSubmitted(true);
            onSuccess?.(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✔️</div>
                <h2 style={{ marginBottom: '8px' }}>Inquiry Received</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>Our AI is scoring your request and matching you with top properties. We will be in touch shortly!</p>
                <button
                    onClick={() => setSubmitted(false)}
                    className="btn-secondary"
                    style={{ marginTop: '24px' }}
                >
                    Submit Another Inquiry
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '32px', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '8px', fontSize: '20px', fontWeight: 800 }}>Property Inquiry</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>Tell us what you're looking for.</p>

            {error && (
                <div style={{ padding: '12px', background: 'rgba(244, 63, 94, 0.1)', color: 'var(--color-rose)', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'grid', gap: '20px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Full Name</label>
                    <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        style={{ width: '100%', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '10px', color: 'var(--color-text-primary)', padding: '12px' }}
                        placeholder="John Doe"
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Email</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            style={{ width: '100%', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '10px', color: 'var(--color-text-primary)', padding: '12px' }}
                            placeholder="john@example.com"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Phone (Optional)</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            style={{ width: '100%', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '10px', color: 'var(--color-text-primary)', padding: '12px' }}
                            placeholder="+1 (246) ..."
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>What are you looking for?</label>
                    <textarea
                        name="raw_inquiry"
                        required
                        rows={4}
                        value={formData.raw_inquiry}
                        onChange={handleChange}
                        style={{ width: '100%', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '10px', color: 'var(--color-text-primary)', padding: '12px', resize: 'vertical' }}
                        placeholder="E.g. A 3-bedroom villa in St. James, close to beach, budget around $800k..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                    style={{ width: '100%', padding: '14px', marginTop: '8px' }}
                >
                    {loading ? 'Processing...' : 'Submit to AI Agent'}
                </button>
            </div>
        </form>
    );
}
