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
    'Kingston', 'St. Andrew', 'St. Catherine', 'St. James', 'St. Thomas',
    'Portland', 'St. Mary', 'St. Ann', 'Manchester', 'Clarendon',
    'St. Elizabeth', 'Westmoreland', 'Hanover', 'Trelawny'
];

// Parish coordinates for Jamaica map
export const PARISH_COORDS: Record<string, { lat: number; lng: number }> = {
    'Kingston': { lat: 17.9714, lng: -76.7936 },
    'St. Andrew': { lat: 18.0103, lng: -76.7928 },
    'St. Catherine': { lat: 18.0793, lng: -77.0242 },
    'St. James': { lat: 18.4678, lng: -77.8937 },
    'St. Thomas': { lat: 17.8719, lng: -76.4302 },
    'Portland': { lat: 18.0903, lng: -76.5219 },
    'St. Mary': { lat: 18.2417, lng: -76.8914 },
    'St. Ann': { lat: 18.4119, lng: -77.1036 },
    'Manchester': { lat: 18.0425, lng: -77.5372 },
    'Clarendon': { lat: 17.9558, lng: -77.2414 },
    'St. Elizabeth': { lat: 18.0478, lng: -77.7897 },
    'Westmoreland': { lat: 18.2669, lng: -78.1597 },
    'Hanover': { lat: 18.4056, lng: -78.1394 },
    'Trelawny': { lat: 18.2908, lng: -77.7658 },
};

// Currency conversion rate (approximate - should be updated from API in production)
const JMD_TO_USD = 0.0063; // 1 JMD ≈ 0.0063 USD
const USD_TO_JMD = 158.50; // 1 USD ≈ 158.50 JMD

export type Currency = 'USD' | 'JMD';

export function formatPrice(price: string | number, currency: Currency = 'USD'): string {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return currency === 'JMD' ? 'J$0' : '$0';
    
    if (currency === 'JMD') {
        const jmd = num * USD_TO_JMD;
        if (jmd >= 1_000_000) return `J${(jmd / 1_000_000).toFixed(1)}M`;
        if (jmd >= 1_000) return `J${(jmd / 1_000).toFixed(0)}K`;
        return `J${jmd.toFixed(0)}`;
    }
    
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
    return `${num.toFixed(0)}`;
}

export function formatFullPrice(price: string | number, currency: Currency = 'USD'): string {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return currency === 'JMD' ? 'J$0' : '$0';
    
    if (currency === 'JMD') {
        const jmd = num * USD_TO_JMD;
        return new Intl.NumberFormat('en-JM', { style: 'currency', currency: 'JMD', maximumFractionDigits: 0 }).format(jmd);
    }
    
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
}

// Jamaican property tax and transfer cost calculator
export function calculateAcquisitionCosts(price: number): {
    stampDuty: number;
    legalFees: number;
    registrationFees: number;
    total: number;
    breakdown: { name: string; amount: number; percentage: number }[];
} {
    const jmdPrice = price * USD_TO_JMD;
    
    // Stamp Duty (based on Jamaican rates)
    // 6% for properties under J$5,000,000, 7% for J$5M-10M, 8% above J$10M
    let stampDutyRate = 0.06;
    if (jmdPrice > 10_000_000) stampDutyRate = 0.08;
    else if (jmdPrice > 5_000_000) stampDutyRate = 0.07;
    const stampDuty = jmdPrice * stampDutyRate;
    
    // Legal fees (typically 2-3% + GCT)
    const legalFeeRate = jmdPrice > 50_000_000 ? 0.015 : jmdPrice > 10_000_000 ? 0.02 : 0.025;
    const legalFees = jmdPrice * legalFeeRate * 1.15; // Including GCT (15%)
    
    // Registration fees (approximately 0.5%)
    const registrationFees = jmdPrice * 0.005;
    
    const total = stampDuty + legalFees + registrationFees;
    
    return {
        stampDuty,
        legalFees,
        registrationFees,
        total,
        breakdown: [
            { name: 'Stamp Duty', amount: stampDuty, percentage: stampDutyRate * 100 },
            { name: 'Legal Fees (incl. GCT)', amount: legalFees, percentage: legalFeeRate * 115 },
            { name: 'Registration', amount: registrationFees, percentage: 0.5 },
        ]
    };
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
