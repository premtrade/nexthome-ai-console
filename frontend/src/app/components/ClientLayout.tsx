'use client';

import { useState, useEffect, useCallback } from "react";
import { Menu, Sparkles, Search, Bell, User, AlertCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { ToastContainer } from "./Toast";
import { ErrorBoundary } from "./ErrorBoundary";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar on route change
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    // Handle keyboard escape to close sidebar
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isSidebarOpen) {
                setIsSidebarOpen(false);
            }
        };

        if (isSidebarOpen) {
            document.addEventListener('keydown', handleKeyDown);
            // Prevent scroll when sidebar is open on mobile
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isSidebarOpen]);

    const getPageTitle = () => {
        const titles: Record<string, string> = {
            '/': 'Dashboard',
            '/properties': 'Properties',
            '/pipeline': 'Pipeline',
            '/search': 'Search',
            '/market': 'Market Intelligence',
            '/alerts': 'Alerts',
            '/settings': 'Settings'
        };
        return titles[pathname] || 'NextHome';
    };

    const handleSidebarToggle = useCallback(() => {
        setIsSidebarOpen(prev => !prev);
    }, []);

    const handleSidebarClose = useCallback(() => {
        setIsSidebarOpen(false);
    }, []);

    return (
        <>
            {/* Toast Notifications */}
            <ToastContainer />

            {/* Desktop Header */}
            <header className="app-header">
                <div className="header-left">
                    <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', flex: '0 0 auto' }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 10,
                            background: 'linear-gradient(135deg, var(--color-accent), var(--color-cyan))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)'
                        }}>
                            <Sparkles size={22} color="#fff" />
                        </div>
                        <span className="header-title" style={{ fontSize: 18, fontWeight: 700 }}>NextHome</span>
                    </Link>
                    <span style={{ color: 'var(--color-border)', fontSize: 20, margin: '0 12px', flex: '0 0 auto' }}>|</span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: 14, flex: '1 1 auto', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getPageTitle()}</span>
                </div>

                <div className="header-right">
                    <div className="quick-search">
                        <Search size={16} />
                        <input type="text" placeholder="Quick search... (Ctrl+K)" aria-label="Quick search" />
                    </div>
                    <Link href="/alerts" className="btn-secondary" style={{ padding: '10px', position: 'relative' }} aria-label="Notifications" title="Notifications">
                        <Bell size={18} />
                        <span className="notification-indicator"></span>
                    </Link>
                    <Link href="/settings" className="btn-secondary" style={{ padding: '10px' }} aria-label="User profile" title="Profile">
                        <User size={18} />
                    </Link>
                </div>
            </header>

            {/* Mobile Header */}
            <header className="mobile-header">
                <button
                    className="hamburger"
                    onClick={handleSidebarToggle}
                    aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                    aria-expanded={isSidebarOpen}
                    style={{
                        minWidth: '44px',
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-text-primary)',
                        padding: '8px',
                        transition: 'all 0.2s ease',
                        borderRadius: '8px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'none';
                    }}
                >
                    <Menu size={26} />
                </button>

                <Link href="/" style={{
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flex: 1,
                    justifyContent: 'center'
                }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: 'linear-gradient(135deg, var(--color-accent), var(--color-cyan))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)'
                    }}>
                        <Sparkles size={20} color="#fff" />
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>NextHome</span>
                </Link>

                {/* Mobile Icons */}
                <div style={{ display: 'flex', gap: '4px' }}>
                    <Link
                        href="/alerts"
                        className="hamburger"
                        style={{
                            minWidth: '44px',
                            minHeight: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-text-secondary)',
                            padding: '8px',
                            transition: 'all 0.2s ease',
                            borderRadius: '8px',
                            position: 'relative'
                        }}
                        aria-label="Notifications"
                        title="Notifications"
                    >
                        <Bell size={22} />
                        <span className="notification-indicator"></span>
                    </Link>
                    <Link
                        href="/settings"
                        className="hamburger"
                        style={{
                            minWidth: '44px',
                            minHeight: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-text-secondary)',
                            padding: '8px',
                            transition: 'all 0.2s ease',
                            borderRadius: '8px'
                        }}
                        aria-label="Profile"
                        title="Profile"
                    >
                        <User size={22} />
                    </Link>
                </div>
            </header>

            {/* Sidebar Overlay */}
            <div
                className={`mobile-overlay ${isSidebarOpen ? 'visible' : ''}`}
                onClick={handleSidebarClose}
                role="presentation"
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 45,
                    display: isSidebarOpen ? 'block' : 'none',
                    opacity: isSidebarOpen ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: isSidebarOpen ? 'auto' : 'none'
                }}
            />

            <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />

            <ErrorBoundary>
                <main className="main-content">
                    {children}
                </main>
            </ErrorBoundary>

            <style jsx>{`
                @media (max-width: 768px) {
                    :global(body) {
                        overflow: ${isSidebarOpen ? 'hidden' : 'auto'};
                    }
                }
            `}</style>
        </>
    );
}
