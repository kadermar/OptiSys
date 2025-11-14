import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || '2024-01-01';
    const endDate = searchParams.get('endDate') || '2025-12-31';

    const facilities = await db.getFacilityPerformance(startDate, endDate);
    return NextResponse.json(facilities);
  } catch (error) {
    console.error('Error fetching facility performance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch facility performance' },
      { status: 500 }
    );
  }
}
