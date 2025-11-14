import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: procedureId } = await params;

    // Fetch procedure details
    const procedureResult = await sql`
      SELECT *
      FROM procedures
      WHERE procedure_id = ${procedureId}
    `;

    if (procedureResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Procedure not found' },
        { status: 404 }
      );
    }

    // Fetch procedure steps
    const stepsResult = await sql`
      SELECT *
      FROM procedure_steps
      WHERE procedure_id = ${procedureId}
      ORDER BY step_number ASC
    `;

    const procedure = {
      ...procedureResult.rows[0],
      steps: stepsResult.rows,
    };

    return NextResponse.json(procedure);
  } catch (error) {
    console.error('Error fetching procedure details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch procedure details' },
      { status: 500 }
    );
  }
}
