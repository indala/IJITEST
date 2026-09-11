import { NextResponse } from 'next/server';
import { getSushiStatus } from '@/lib/sushi';

export async function GET() {
    try {
        const status = await getSushiStatus();
        return NextResponse.json(status, {
            status: 200,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Cache-Control': 'public, max-age=3600',
            }
        });
    } catch (error) {
        console.error('SUSHI status error:', error);
        return NextResponse.json(
            {
                Code: 1000,
                Severity: 'Fatal',
                Message: 'Service Not Available',
                Data: String(error)
            },
            { status: 503 }
        );
    }
}
