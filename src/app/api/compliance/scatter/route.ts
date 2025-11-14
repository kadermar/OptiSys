import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Get procedure-level correlation data
    const result = await sql`
      SELECT
        p.procedure_id,
        p.name,
        p.category,
        ROUND(AVG(CASE WHEN wo.compliant THEN 1.0 ELSE 0.0 END) * 100, 1) as compliance_rate,
        COUNT(wo.wo_id) as total_work_orders,
        SUM(CASE WHEN wo.compliant AND wo.safety_incident THEN 1 ELSE 0 END) as compliant_incidents,
        SUM(CASE WHEN NOT wo.compliant AND wo.safety_incident THEN 1 ELSE 0 END) as noncompliant_incidents,
        SUM(CASE WHEN wo.compliant THEN 1 ELSE 0 END) as compliant_count,
        SUM(CASE WHEN NOT wo.compliant THEN 1 ELSE 0 END) as noncompliant_count
      FROM procedures p
      JOIN work_orders wo ON p.procedure_id = wo.procedure_id
      GROUP BY p.procedure_id, p.name, p.category
      HAVING COUNT(wo.wo_id) >= 5
      ORDER BY compliance_rate DESC
    `;

    const data = result.rows.map((row) => {
      const compliantIncidentRate = row.compliant_count > 0
        ? (Number(row.compliant_incidents) / Number(row.compliant_count)) * 100
        : 0;

      const noncompliantIncidentRate = row.noncompliant_count > 0
        ? (Number(row.noncompliant_incidents) / Number(row.noncompliant_count)) * 100
        : 0;

      // Calculate incident rate reduction (positive means reduction)
      const incidentRateReduction = noncompliantIncidentRate > 0
        ? ((noncompliantIncidentRate - compliantIncidentRate) / noncompliantIncidentRate) * 100
        : compliantIncidentRate === 0 ? 100 : 0;

      // Cost impact: difference between non-compliant and compliant costs
      const avgCostNonCompliant = 17965;
      const avgCostCompliant = 243;
      const costImpact = Number(row.noncompliant_count) * (avgCostNonCompliant - avgCostCompliant);

      return {
        procedure_id: row.procedure_id,
        name: row.name,
        category: row.category,
        compliance_rate: Number(row.compliance_rate),
        incident_rate_reduction: incidentRateReduction,
        cost_impact: costImpact,
      };
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching scatter data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch correlation data' },
      { status: 500 }
    );
  }
}
