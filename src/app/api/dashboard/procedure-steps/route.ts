import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const procedureId = searchParams.get('procedureId') || undefined;
    const startDate = searchParams.get('startDate') || '2024-01-01';
    const endDate = searchParams.get('endDate') || '2025-12-31';

    const stepAnalysis = await db.getProcedureStepAnalysis(procedureId, startDate, endDate);
    return NextResponse.json(stepAnalysis);
  } catch (error) {
    console.error('Error fetching procedure step analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch procedure step analysis' },
      { status: 500 }
    );
  }
}
