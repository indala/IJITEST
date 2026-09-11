import { NextResponse } from 'next/server';
import { getSushiReports } from '@/lib/sushi';

export async function GET() {
    try {
        const reports = getSushiReports();
        return NextResponse.json(reports, {
            status: 200,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Cache-Control': 'public, max-age=86400',
            }
        });
    } catch (error) {
        console.error('SUSHI reports error:', error);
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
