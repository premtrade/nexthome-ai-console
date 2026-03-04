import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { aiService } from '@/lib/ai-service';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;

        // Get total count for pagination
        const countResult = await query(
            `SELECT COUNT(*) as total FROM properties`
        );
        const total = parseInt(countResult.rows[0]?.total || '0');

        // Get paginated properties
        const propertiesResult = await query(
            `SELECT id, tenant_id, title, description, price, parish, bedrooms, bathrooms, lot_size, status, ai_processed, seo_description, meta_title, meta_description, buyer_persona, competitiveness, created_at, updated_at FROM properties ORDER BY updated_at DESC LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        // Get execution stats  
        const execStatsResult = await query(
            `SELECT status, COUNT(*) as count FROM execution_entity GROUP BY status`
        );

        // Get recent executions
        const recentExecsResult = await query(
            `SELECT id, status, "startedAt", "stoppedAt" FROM execution_entity ORDER BY "startedAt" DESC LIMIT 20`
        );

        // Get AI errors
        const errorsResult = await query(
            `SELECT * FROM ai_errors ORDER BY created_at DESC LIMIT 20`
        );

        return NextResponse.json({
            properties: propertiesResult.rows,
            execStats: execStatsResult.rows,
            recentExecs: recentExecsResult.rows,
            errors: errorsResult.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('DB Error:', error);
        return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, data } = body;

        if (action === 'add_property') {
            const { title, description, price, parish, bedrooms, bathrooms } = data;

            // Sanitize inputs for SQL safety
            const cleanTitle = (title || 'New Property').trim();
            const cleanDesc = (description || '').trim();
            const cleanParish = (parish || 'St. James').trim();
            const numPrice = parseFloat(price as string) || 0;
            const numBeds = parseInt(bedrooms as string) || 0;
            const numBaths = parseInt(bathrooms as string) || 0;

            const sql = `INSERT INTO properties (tenant_id, title, description, price, parish, bedrooms, bathrooms, status, ai_processed) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
            const params = ['00000000-0000-0000-0000-000000000001', cleanTitle, cleanDesc, numPrice, cleanParish, numBeds, numBaths, 'active', false];

            await query(sql, params);
            return NextResponse.json({ success: true });
        }

        if (action === 'reprocess') {
            await query(
                `UPDATE properties SET ai_processed = false, seo_description = NULL, meta_title = NULL, meta_description = NULL, buyer_persona = NULL, competitiveness = NULL WHERE id = $1`,
                [data.id]
            );
            return NextResponse.json({ success: true });
        }

        if (action === 'delete_property') {
            await query(`DELETE FROM properties WHERE id = $1`, [data.id]);
            return NextResponse.json({ success: true });
        }

        if (action === 'enrich') {
            const id = data.id;
            const propertyRes = await query('SELECT * FROM properties WHERE id = $1', [id]);
            if (propertyRes.rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

            const enrichResult = await aiService.enrichProperty(id, propertyRes.rows[0]);
            await query(
                `UPDATE properties SET seo_description = $1, meta_title = $2, meta_description = $3, buyer_persona = $4, competitiveness = $5, ai_processed = true, updated_at = NOW() WHERE id = $6`,
                [enrichResult.seo_description, enrichResult.meta_title, enrichResult.meta_description, enrichResult.buyer_persona, enrichResult.competitiveness, id]
            );
            return NextResponse.json({ success: true });
        }

        if (action === 'analyze_market') {
            const propertiesRes = await query('SELECT * FROM properties WHERE status = $1', ['active']);
            const opportunities = await aiService.detectArbitrageOpportunities(propertiesRes.rows);

            // Apply the results to the database (Update competitiveness)
            for (const opp of opportunities) {
                const badge = opp.delta_percent > 15 ? 'Underpriced' : 'Fair';
                await query(
                    'UPDATE properties SET competitiveness = $1, updated_at = NOW() WHERE id = $2',
                    [badge, opp.property_id]
                );
            }

            return NextResponse.json({ success: true, count: opportunities.length });
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    } catch (error) {
        console.error('POST Error:', error);
        return NextResponse.json({ error: 'Action failed' }, { status: 500 });
    }
}
