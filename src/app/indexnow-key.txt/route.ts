import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env['INDEXNOW_KEY'];
  
  if (!key) {
    return new NextResponse('IndexNow key not configured', { status: 500 });
  }
  
  return new NextResponse(key, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
