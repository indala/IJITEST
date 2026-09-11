import { NextRequest, NextResponse } from 'next/server';
import { generateItemReport } from '@/lib/sushi';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const beginDate = searchParams.get('begin_date') || undefined;
    const endDate = searchParams.get('end_date') || undefined;
    const customerId = searchParams.get('customer_id') || undefined;
    const requestorId = searchParams.get('requestor_id') || undefined;
    const itemId = searchParams.get('item_id') || undefined;

    try {

        const report = await generateItemReport({
            begin_date: beginDate,
            end_date: endDate,
            customer_id: customerId,
            requestor_id: requestorId,
            item_id: itemId,
            report_id: 'IR_A1'
        });

        return NextResponse.json(report, {
            status: 200,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Cache-Control': 'public, max-age=1800',
            }
        });
    } catch (error) {
        console.error('SUSHI IR_A1 report error:', error);
        return NextResponse.json(
            {
                Code: 1000,
                Severity: 'Fatal',
                Message: 'Service Not Available',
                Data: String(error)
            },
            { status: 500 }
        );
    }
}
