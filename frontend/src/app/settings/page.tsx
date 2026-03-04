'use client';

import { useState } from 'react';
import {
    Settings as SettingsIcon, Database, Cpu, Globe,
    Key, Bell, Clock, Save, ExternalLink, CheckCircle2
} from 'lucide-react';

export default function SettingsPage() {
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Settings</h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Configure your NextHome Intelligence Console</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Pipeline Config */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Cpu size={18} color="var(--color-accent-light)" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 15, fontWeight: 700 }}>AI Pipeline</h3>
                            <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Workflow configuration</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4, display: 'block' }}>POLLING INTERVAL</label>
                            <select className="input-field" defaultValue="120">
                                <option value="60">Every 1 minute</option>
                                <option value="120">Every 2 minutes</option>
                                <option value="300">Every 5 minutes</option>
                                <option value="600">Every 10 minutes</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4, display: 'block' }}>BATCH SIZE</label>
                            <select className="input-field" defaultValue="1">
                                <option value="1">1 property per cycle</option>
                                <option value="5">5 properties per cycle</option>
                                <option value="10">10 properties per cycle</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4, display: 'block' }}>LLM MODEL</label>
                            <input className="input-field" defaultValue="mixtral-8x7b-32768" readOnly style={{ opacity: 0.7 }} />
                        </div>
                    </div>
                </div>

                {/* Database */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-emerald-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Database size={18} color="var(--color-emerald)" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Database</h3>
                            <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>PostgreSQL connection</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4, display: 'block' }}>HOST</label>
                            <input className="input-field" defaultValue="localhost:5432" readOnly style={{ opacity: 0.7 }} />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4, display: 'block' }}>DATABASE</label>
                            <input className="input-field" defaultValue="saas_db" readOnly style={{ opacity: 0.7 }} />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4, display: 'block' }}>STATUS</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-emerald)', boxShadow: '0 0 8px var(--color-emerald)' }} />
                                <span style={{ fontSize: 13, color: 'var(--color-emerald)' }}>Connected</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Services */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-cyan-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Globe size={18} color="var(--color-cyan)" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Services</h3>
                            <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Connected services</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { name: 'n8n Workflow Engine', url: process.env.NEXT_PUBLIC_N8N_URL || 'http://localhost:5678', status: 'active' },
                            { name: 'Flowise AI', url: process.env.NEXT_PUBLIC_FLOWISE_URL || 'http://localhost:3000', status: 'active' },
                            { name: 'Qdrant Vector DB', url: process.env.NEXT_PUBLIC_QDRANT_URL || 'http://localhost:6333', status: 'active' },
                            { name: 'PostgreSQL', url: process.env.DATABASE_URL ? 'Connected to Cloud' : 'localhost:5432', status: 'active' },
                        ].map(svc => (
                            <div key={svc.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--color-bg-primary)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{svc.name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{svc.url}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-emerald)' }} />
                                    <span style={{ fontSize: 11, color: 'var(--color-emerald)' }}>Active</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* API Keys */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-amber-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Key size={18} color="var(--color-amber)" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 15, fontWeight: 700 }}>API Keys</h3>
                            <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>External service credentials</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4, display: 'block' }}>GROQ API KEY</label>
                            <input className="input-field" type="password" defaultValue="gsk_••••••••••••••••••" />
                        </div>
                        <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4, display: 'block' }}>HUGGING FACE TOKEN</label>
                            <input className="input-field" type="password" defaultValue="hf_••••••••••••••••••" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Save */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <button className="btn-primary" onClick={handleSave} style={{ minWidth: 160, justifyContent: 'center' }}>
                    {saved ? <><CheckCircle2 size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
                </button>
            </div>
        </div>
    );
}
