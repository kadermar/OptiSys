import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Get compliant vs non-compliant metrics
    const result = await sql`
      SELECT
        compliant,
        COUNT(*) as work_orders,
        SUM(CASE WHEN safety_incident THEN 1 ELSE 0 END) as incidents,
        ROUND(AVG(CASE WHEN safety_incident THEN 1.0 ELSE 0.0 END) * 100, 1) as incident_rate,
        ROUND(AVG(quality_score), 1) as avg_quality,
        SUM(CASE WHEN rework_required THEN 1 ELSE 0 END) as rework_count,
        ROUND(AVG(CASE WHEN rework_required THEN 1.0 ELSE 0.0 END) * 100, 1) as rework_rate,
        ROUND(AVG(downtime_hours), 2) as avg_downtime
      FROM work_orders
      GROUP BY compliant
      ORDER BY compliant DESC
    `;

    const compliantData = result.rows.find(r => r.compliant === true);
    const nonCompliantData = result.rows.find(r => r.compliant === false);

    if (!compliantData || !nonCompliantData) {
      return NextResponse.json({ error: 'Insufficient data' }, { status: 404 });
    }

    const totalWorkOrders = Number(compliantData.work_orders) + Number(nonCompliantData.work_orders);
    const compliantCount = Number(compliantData.work_orders);
    const nonCompliantCount = Number(nonCompliantData.work_orders);

    // Calculate multipliers
    const incidentMultiplier = Number(nonCompliantData.incident_rate) / Number(compliantData.incident_rate);
    const qualityDifference = ((Number(compliantData.avg_quality) - Number(nonCompliantData.avg_quality)) / Number(nonCompliantData.avg_quality)) * 100;
    const reworkMultiplier = Number(nonCompliantData.rework_rate) / Number(compliantData.rework_rate);
    const downtimeMultiplier = Number(nonCompliantData.avg_downtime) / Number(compliantData.avg_downtime);

    // Cost calculations
    const avgCostNonCompliant = 17965;
    const avgCostCompliant = 243;
    const nonCompliantTotalCost = nonCompliantCount * avgCostNonCompliant;
    const compliantTotalCost = compliantCount * avgCostCompliant;

    const data = {
      totalWorkOrders,
      nonCompliantCount,
      compliantCount,
      nonCompliantPercent: (nonCompliantCount / totalWorkOrders) * 100,
      compliantPercent: (compliantCount / totalWorkOrders) * 100,
      metrics: [
        {
          label: "Safety Incidents",
          nonCompliant: {
            value: `${nonCompliantData.incidents} incidents`,
            description: `${nonCompliantData.incident_rate}% incident rate (1 in ${Math.round(100 / Number(nonCompliantData.incident_rate))} has incident)`,
            visualValue: 100,
          },
          compliant: {
            value: `${compliantData.incidents} incidents`,
            description: `${compliantData.incident_rate}% incident rate (1 in ${Math.round(100 / Number(compliantData.incident_rate))} has incident)`,
            visualValue: (Number(compliantData.incident_rate) / Number(nonCompliantData.incident_rate)) * 100,
          },
          multiplier: `${incidentMultiplier.toFixed(1)}x higher risk with non-compliance`
        },
        {
          label: "Quality Score (1-10 scale)",
          nonCompliant: {
            value: `${nonCompliantData.avg_quality} avg`,
            description: `${qualityDifference.toFixed(1)}% worse - Below acceptable`,
            visualValue: Number(nonCompliantData.avg_quality) * 10,
          },
          compliant: {
            value: `${compliantData.avg_quality} avg`,
            description: "Excellent quality",
            visualValue: Number(compliantData.avg_quality) * 10,
          },
          multiplier: `${qualityDifference.toFixed(0)}% quality improvement with compliance`
        },
        {
          label: "Rework Required",
          nonCompliant: {
            value: `${nonCompliantData.rework_rate}%`,
            description: `$${Math.round(nonCompliantTotalCost * (Number(nonCompliantData.rework_rate)/100) / 1000)}K cost - Unacceptable rework rate`,
            visualValue: 100,
          },
          compliant: {
            value: `${compliantData.rework_rate}%`,
            description: `$${Math.round(compliantTotalCost * (Number(compliantData.rework_rate)/100) / 1000)}K cost - Minimal rework`,
            visualValue: (Number(compliantData.rework_rate) / Number(nonCompliantData.rework_rate)) * 100,
          },
          multiplier: `${reworkMultiplier.toFixed(1)}x higher rework cost with non-compliance`
        },
        {
          label: "Equipment Downtime (hours)",
          nonCompliant: {
            value: `${nonCompliantData.avg_downtime} hrs`,
            description: `${((downtimeMultiplier - 1) * 100).toFixed(0)}% more downtime`,
            visualValue: 100,
          },
          compliant: {
            value: `${compliantData.avg_downtime} hrs`,
            description: "Minimal disruption",
            visualValue: (Number(compliantData.avg_downtime) / Number(nonCompliantData.avg_downtime)) * 100,
          },
          multiplier: `${downtimeMultiplier.toFixed(1)}x more downtime without compliance`
        },
        {
          label: "Annual Cost Impact",
          nonCompliant: {
            value: `$${(nonCompliantTotalCost / 1000000).toFixed(1)}M`,
            description: `$${avgCostNonCompliant.toLocaleString()} per non-compliant work order`,
            visualValue: 100,
          },
          compliant: {
            value: `$${(compliantTotalCost / 1000).toFixed(0)}K`,
            description: `$${avgCostCompliant} per compliant work order`,
            visualValue: (compliantTotalCost / nonCompliantTotalCost) * 100,
          },
          multiplier: `SAVINGS OPPORTUNITY: $${((nonCompliantTotalCost - compliantTotalCost) / 1000).toFixed(0)}K annually`
        }
      ]
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching split screen data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compliance data' },
      { status: 500 }
    );
  }
}
