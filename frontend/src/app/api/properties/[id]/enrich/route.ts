import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { aiService } from '@/lib/ai-service';

/**
 * AI Enrichment for a specific property
 */

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Fetch property current state
        const propertyRes = await query('SELECT * FROM properties WHERE id = $1', [id]);
        if (propertyRes.rowCount === 0) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }

        const property = propertyRes.rows[0];

        // 2. Fetch enrichment from AI Service
        const enrichResult = await aiService.enrichProperty(id, property);

        // 3. Update database
        const updateRes = await query(
            `UPDATE properties 
             SET seo_description = $1, 
                 meta_title = $2, 
                 meta_description = $3, 
                 buyer_persona = $4, 
                 competitiveness = $5,
                 ai_processed = true,
                 updated_at = NOW()
             WHERE id = $6
             RETURNING *`,
            [
                enrichResult.seo_description,
                enrichResult.meta_title,
                enrichResult.meta_description,
                enrichResult.buyer_persona,
                enrichResult.competitiveness,
                id
            ]
        );

        return NextResponse.json(updateRes.rows[0]);
    } catch (error: any) {
        console.error('AI Enrichment failed:', error);
        return NextResponse.json({ error: 'Failed to enrich property' }, { status: 500 });
    }
}
