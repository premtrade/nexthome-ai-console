'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DashboardData } from './types';
import { showToast } from '../components/Toast';

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface UseDataReturn extends DashboardData {
    pagination: PaginationInfo | null;
}

export function useData(refreshInterval = 10000, includeStats = false) {
    const [data, setData] = useState<UseDataReturn | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(20);

    const fetchData = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const res = await fetch(`/api/data?page=${page}&limit=${limit}${includeStats ? '&stats=true' : ''}`);
            if (!res.ok) throw new Error('Fetch failed');
            const json = await res.json();
            setData(json);
            setError(null);
        } catch (e) {
            setError((e as Error).message);
            showToast('Failed to load data', 'error');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [page, limit, includeStats]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, refreshInterval);
        return () => clearInterval(interval);
    }, [fetchData, refreshInterval]);

    const postAction = async (action: string, actionData: Record<string, unknown>) => {
        try {
            const res = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, data: actionData }),
            });
            if (!res.ok) throw new Error('Action failed');
            await fetchData();

            // Show success toast based on action
            const messages: Record<string, string> = {
                add_property: 'Property added successfully',
                edit_property: 'Property updated successfully',
                reprocess: 'Property queued for reprocessing',
                delete_property: 'Property deleted'
            };
            showToast(messages[action] || 'Action completed', 'success');
            return true;
        } catch {
            showToast('Action failed', 'error');
            return false;
        }
    };

    const goToPage = (newPage: number) => {
        if (data?.pagination) {
            if (newPage >= 1 && newPage <= data.pagination.totalPages) {
                setPage(newPage);
            }
        }
    };

    return {
        data,
        loading,
        isRefreshing,
        error,
        refresh: fetchData,
        postAction,
        pagination: data?.pagination || null,
        page,
        goToPage
    };
}
