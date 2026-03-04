'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

let toastListeners: ((toast: Toast) => void)[] = [];

export function showToast(message: string, type: ToastType = 'info') {
    const toast: Toast = {
        id: Math.random().toString(36).substring(7),
        message,
        type
    };
    toastListeners.forEach(listener => listener(toast));
}

export function ToastContainer() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        const listener = (toast: Toast) => {
            setToasts(prev => [...prev, toast]);
            // Auto-remove after 4 seconds
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== toast.id));
            }, 4000);
        };
        toastListeners.push(listener);
        return () => {
            toastListeners = toastListeners.filter(l => l !== listener);
        };
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success': return <CheckCircle size={18} />;
            case 'error': return <AlertCircle size={18} />;
            default: return <Info size={18} />;
        }
    };

    const getStyles = (type: ToastType) => {
        switch (type) {
            case 'success': return 'toast-success';
            case 'error': return 'toast-error';
            default: return 'toast-info';
        }
    };

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div key={toast.id} className={`toast ${getStyles(toast.type)}`}>
                    <span className="toast-icon">{getIcon(toast.type)}</span>
                    <span className="toast-message">{toast.message}</span>
                    <button className="toast-close" onClick={() => removeToast(toast.id)}>
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
}
