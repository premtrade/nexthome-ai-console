// Enhanced Error Boundary Component
// File: frontend/src/app/components/ErrorBoundary.tsx

'use client';

import React, { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log to external service (Sentry, LogRocket, etc.)
        console.error('ErrorBoundary caught:', error, errorInfo);
        
        // In production, you can send to an error tracking service
        // For now, just log to console
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '24px',
                    border: '1px solid var(--color-rose-glow)',
                    borderRadius: '12px',
                    background: 'rgba(244, 63, 94, 0.05)',
                    margin: '20px'
                }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <AlertTriangle size={24} color="var(--color-rose)" />
                        <div>
                            <h2 style={{ color: 'var(--color-rose)', marginBottom: '8px' }}>
                                Something went wrong
                            </h2>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                                The application encountered an unexpected error. Our team has been notified.
                            </p>
                            {process.env.NODE_ENV === 'development' && (
                                <details style={{ background: 'var(--color-bg-card)', padding: '12px', borderRadius: '8px', marginTop: '12px' }}>
                                    <summary style={{ cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                                        Error details (development only)
                                    </summary>
                                    <pre style={{
                                        overflow: 'auto',
                                        color: 'var(--color-rose)',
                                        fontSize: '12px',
                                        marginTop: '8px'
                                    }}>
                                        {this.state.error?.toString()}
                                    </pre>
                                </details>
                            )}
                            <button
                                onClick={() => window.location.reload()}
                                style={{
                                    marginTop: '12px',
                                    padding: '8px 16px',
                                    background: 'var(--color-rose)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Global error handler for unhandled promise rejections
export function setupGlobalErrorHandlers() {
    if (typeof window === 'undefined') return;

    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        // In production, send to error tracking service
    });

    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        // In production, send to error tracking service
    });
}
