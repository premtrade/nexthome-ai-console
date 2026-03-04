'use client';

import { LeadForm } from '@/app/components/LeadForm';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function InquiryPage() {
    return (
        <div className="animate-fade-in" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <Link href="/" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--color-text-muted)',
                    textDecoration: 'none',
                    fontSize: '14px',
                    marginBottom: '24px'
                }}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: 'linear-gradient(135deg, var(--color-accent), var(--color-cyan))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
                    }}>
                        <Sparkles size={24} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: '32px', fontWeight: 800 }}>AI Concierge</h1>
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '16px' }}>
                    Speak with our intelligent agent to find your next property in the Caribbean.
                </p>
            </div>

            <div className="glass-card" style={{ padding: '8px', borderRadius: '24px', background: 'rgba(255,255,255,0.03)' }}>
                <LeadForm tenantId="00000000-0000-0000-0000-000000000000" />
            </div>

            <p style={{ textAlign: 'center', marginTop: '40px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                Powered by NextHome AI — Property Intelligence for a Modern Market.
            </p>
        </div>
    );
}
