export interface Property {
    id: string;
    tenant_id: string;
    title: string;
    description: string;
    price: string;
    parish: string;
    bedrooms: string;
    bathrooms: string;
    lot_size: string;
    status: string;
    image_url: string;
    ai_processed: string | boolean;
    seo_description: string;
    meta_title: string;
    meta_description: string;
    buyer_persona: string;
    competitiveness: string;
    created_at: string;
    updated_at: string;
}

export interface Lead {
    id: string;
    tenant_id: string;
    name: string;
    email: string;
    phone: string;
    raw_inquiry: string;
    ai_score: number;
    ai_assessment: any;
    matched_property_ids: string[];
    status: string;
    created_at: string;
    updated_at: string;
}

export interface ExecStat {
    status: string;
    count: string;
}

export interface Execution {
    id: string;
    status: string;
    startedAt: string;
    stoppedAt: string;
}

export interface AIError {
    id: string;
    workflow_id: string;
    node_name: string;
    property_id: string;
    tenant_id: string;
    error_message: string;
    created_at: string;
}

export interface DashboardData {
    properties: Property[];
    execStats: ExecStat[];
    recentExecs: Execution[];
    errors: AIError[];
}

export const PARISHES = [
    'Christ Church', 'St. Andrew', 'St. George', 'St. James',
    'St. John', 'St. Joseph', 'St. Lucy', 'St. Michael',
    'St. Peter', 'St. Philip', 'St. Thomas'
];

export function formatPrice(price: string | number): string {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return '$0';
    if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
}

export function timeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export function getCompBadgeClass(comp: string): string {
    if (!comp) return 'badge-info';
    const l = comp.toLowerCase();
    if (l === 'underpriced') return 'badge-success';
    if (l === 'overpriced') return 'badge-error';
    return 'badge-warning';
}

export function getPersonaIcon(persona: string): string {
    if (!persona) return '👤';
    const l = persona.toLowerCase();
    if (l.includes('luxury')) return '💎';
    if (l.includes('investor')) return '📈';
    if (l.includes('first')) return '🏡';
    if (l.includes('retiree') || l.includes('retire')) return '🌴';
    return '👤';
}
