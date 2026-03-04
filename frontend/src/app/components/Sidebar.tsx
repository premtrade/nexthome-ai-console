'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Building2, Users, Cpu, Search,
    TrendingUp, Bell, Settings, Sparkles, X, ChevronRight, LogOut
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';

const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/properties', label: 'Properties', icon: Building2 },
    { href: '/leads', label: 'Leads', icon: Users },
    { href: '/pipeline', label: 'AI Pipeline', icon: Cpu },
    { href: '/search', label: 'Smart Search', icon: Search },
    { href: '/market', label: 'Market Intel', icon: TrendingUp },
    { href: '/alerts', label: 'Alerts', icon: Bell },
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/inquiry', label: 'Inquiry Form', icon: Sparkles },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile window
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close sidebar when clicking a link on mobile with smooth delay
    const handleLinkClick = (e: React.MouseEvent) => {
        if (isMobile && onClose) {
            // Prevent immediate close to allow animation
            e.preventDefault();
            const href = (e.currentTarget as HTMLAnchorElement).href;

            // Close sidebar with animation
            setTimeout(() => {
                onClose();
            }, 100);

            // Navigate after slight delay
            setTimeout(() => {
                window.location.href = href;
            }, 200);
        }
    };

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            {/* Logo Section */}
            <div style={{
                padding: '24px 20px 32px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: '80px'
            }}>
                <Link href="/" onClick={handleLinkClick} style={{
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flex: 1
                }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: 'linear-gradient(135deg, var(--color-accent), var(--color-cyan))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                        flexShrink: 0
                    }}>
                        <Sparkles size={22} color="#fff" />
                    </div>
                    <div className="logo-text">
                        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
                            NextHome
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 500, color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            Intelligence
                        </div>
                    </div>
                </Link>

                {/* Mobile Close Button - Better Tap Target */}
                <button
                    onClick={onClose}
                    className="mobile-sidebar-close"
                    aria-label="Close sidebar"
                    style={{
                        display: 'none',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        color: 'var(--color-text-secondary)',
                        minWidth: '44px',
                        minHeight: '44px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                        e.currentTarget.style.background = 'none';
                    }}
                >
                    <X size={24} />
                </button>
            </div>

            {/* Navigation */}
            <nav style={{ padding: '12px 0', flex: 1, overflowY: 'auto' }}>
                <div style={{ padding: '8px 20px', marginBottom: 12 }}>
                    <span className="nav-label" style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Navigation
                    </span>
                </div>
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            onClick={handleLinkClick}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '14px 20px', // Improved touch target (min 44px)
                                margin: '3px 12px',
                                borderRadius: '10px',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: isActive ? 'var(--color-accent-light)' : 'var(--color-text-secondary)',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                background: isActive ? 'var(--color-accent-glow)' : 'transparent',
                                textDecoration: 'none',
                                position: 'relative',
                                fontFamily: 'var(--font-sans)'
                            }}
                            onMouseEnter={(e) => {
                                const el = e.currentTarget;
                                if (!isActive) {
                                    el.style.background = 'rgba(99, 102, 241, 0.08)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                const el = e.currentTarget;
                                if (!isActive) {
                                    el.style.background = 'transparent';
                                }
                            }}
                        >
                            <item.icon size={20} style={{ flexShrink: 0 }} />
                            <span style={{ flex: 1 }}>{item.label}</span>
                            {isActive && (
                                <ChevronRight size={16} style={{ opacity: 0.6 }} />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Status & Sign Out */}

            {/* Footer Status & Sign Out */}
            <div style={{
                padding: '16px 20px',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    minHeight: '24px'
                }}>
                    <div style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: 'var(--color-emerald)',
                        boxShadow: '0 0 8px var(--color-emerald)',
                        flexShrink: 0,
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }} />
                    <span style={{
                        fontSize: 13,
                        color: 'var(--color-text-muted)',
                        fontWeight: 500
                    }}>
                        Pipeline Ready
                    </span>
                </div>

                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-rose)',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: '8px 0',
                        transition: 'opacity 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                </button>
            </div>

            <style jsx>{`
                @media (max-width: 768px) {
                    .mobile-sidebar-close { 
                        display: flex !important; 
                    }
                    
                    .logo-text {
                        display: none;
                    }
                    
                    /* Expand nav items on mobile for better touch targets */
                    nav {
                        padding: 8px 0;
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }

                /* Smooth sidebar slide animation */
                :global(.sidebar) {
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                                opacity 0.3s ease;
                }

                :global(.sidebar.open) {
                    transform: translateX(0);
                    opacity: 1;
                }

                /* Ensure scrollable on mobile */
                @media (max-width: 768px) {
                    nav {
                        max-height: calc(100vh - 200px);
                        overflow-y: auto;
                    }
                }
            `}</style>
        </aside>
    );
}
