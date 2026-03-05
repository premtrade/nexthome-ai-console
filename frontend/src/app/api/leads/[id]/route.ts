import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * Handle individual Lead operations
 */

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await query('DELETE FROM leads WHERE id = $1', [id]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to delete lead:', error);
        return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
    }
}
