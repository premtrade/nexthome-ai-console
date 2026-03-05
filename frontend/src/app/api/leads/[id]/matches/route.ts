import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { aiService } from '@/lib/ai-service';

/**
 * AI Property Matching for a specific Lead
 */

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Fetch lead data
        const leadRes = await query('SELECT * FROM leads WHERE id = $1', [id]);
        if (leadRes.rowCount === 0) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }
        const lead = leadRes.rows[0];

        // 2. Fetch active properties for matching
        const propertiesRes = await query(
            'SELECT id, title, description, seo_description, parish, price FROM properties WHERE status = $1',
            ['active']
        );

        // 3. Check for existing n8n matches or trigger fallback
        const existingMatchesRes = await query(
            'SELECT property_id FROM lead_property_matches WHERE lead_id = $1 ORDER BY match_score DESC',
            [id]
        );

        let matchedIds: string[] = [];

        if ((existingMatchesRes.rowCount ?? 0) > 0) {
            matchedIds = existingMatchesRes.rows.map(row => row.property_id);
        } else if (lead.matched_property_ids && lead.matched_property_ids.length > 0) {
            matchedIds = lead.matched_property_ids;
        } else {
            matchedIds = await aiService.matchPropertiesForLead(
                id,
                lead.raw_inquiry || '',
                propertiesRes.rows
            );
        }

        // 4. Update lead with matches
        const updateRes = await query(
            'UPDATE leads SET matched_property_ids = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
            [matchedIds, id]
        );

        return NextResponse.json(updateRes.rows[0]);
    } catch (error: any) {
        console.error('Lead matching failed:', error);
        return NextResponse.json({ error: 'Failed to match properties' }, { status: 500 });
    }
}
