import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { aiService } from '@/lib/ai-service';

/**
 * Handle GET and POST for Leads
 */

export async function GET() {
    try {
        const result = await query(
            'SELECT * FROM leads ORDER BY created_at DESC LIMIT 50'
        );
        return NextResponse.json(result.rows);
    } catch (error: any) {
        console.error('Failed to fetch leads:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, raw_inquiry, tenant_id } = body;

        if (!name || !tenant_id) {
            return NextResponse.json({ error: 'Name and tenant_id are required' }, { status: 400 });
        }

        // 1. Process with AI (Score and match properties)
        const aiResult = await aiService.scoreLead({ name, email, phone, raw_inquiry, tenant_id });

        if (aiResult.handledByN8n) {
            // n8n workflow handled the database insertions (lead, matches, tasks)
            return NextResponse.json({
                success: true,
                ...aiResult.lead
            });
        }

        // 2. Save to database manually if n8n fallback was used
        const result = await query(
            `INSERT INTO leads (
                tenant_id, name, email, phone, raw_inquiry, 
                ai_score, ai_assessment, matched_property_ids, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
            RETURNING *`,
            [
                tenant_id, name, email, phone, raw_inquiry,
                aiResult.ai_score, aiResult.ai_assessment,
                aiResult.matched_property_ids, 'new'
            ]
        );

        return NextResponse.json(result.rows[0]);
    } catch (error: any) {
        console.error('Failed to create lead:', error);
        return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
    }
}
