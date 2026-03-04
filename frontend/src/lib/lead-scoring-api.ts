/**
 * Lead Scoring API Client
 * Updated to use local Next.js API routes which proxy to n8n/Flowise.
 */

import { Lead } from '@/app/lib/types';

export async function submitLead(leadData: any): Promise<Lead> {
    const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
    });

    if (!response.ok) {
        throw new Error(`Lead submission failed: ${response.statusText}`);
    }

    return await response.json();
}

export async function getLeadsList(tenantId: string, filters?: any): Promise<{ leads: Lead[] }> {
    const response = await fetch('/api/leads');
    if (!response.ok) {
        throw new Error(`Failed to fetch leads: ${response.statusText}`);
    }
    const data = await response.json();
    return { leads: data };
}
