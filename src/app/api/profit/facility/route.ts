import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import {
  COST_CONSTANTS,
  calculateLaborCost,
  calculateMaterialCost,
  calculateSafetyCost,
  calculateDowntimeCost,
  calculateQualityCost,
} from '@/lib/costConstants';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || '2024-01-01';
    const endDate = searchParams.get('endDate') || '2025-12-31';

    // Get facility-level data with cost metrics
    const result = await sql`
      SELECT
        f.facility_id,
        f.name,
        f.performance_tier,
        COUNT(wo.wo_id) as work_order_count,
        ROUND(AVG(CASE WHEN wo.compliant THEN 1.0 ELSE 0.0 END) * 100, 1) as compliance_rate,
        SUM(CASE WHEN wo.safety_incident THEN 1 ELSE 0 END) as incident_count,
        SUM(CASE WHEN wo.rework_required THEN 1 ELSE 0 END) as rework_count,
        ROUND(COALESCE(SUM(wo.downtime_hours), 0)::numeric, 1) as downtime_hours,
        ROUND(AVG(wo.quality_score)::numeric, 1) as avg_quality_score,
        ROUND(COALESCE(SUM(wo.duration_hours - 2.5), 0)::numeric, 1) as duration_variance_hours
      FROM facilities f
      LEFT JOIN work_orders wo ON f.facility_id = wo.facility_id
        AND wo.scheduled_date >= ${startDate}::date
        AND wo.scheduled_date <= ${endDate}::date
      GROUP BY f.facility_id, f.name, f.performance_tier
      ORDER BY f.name
    `;

    // Calculate profit impact for each facility
    const facilities = result.rows.map((facility, index) => {
      const workOrderCount = parseInt(facility.work_order_count) || 0;
      const incidentCount = parseInt(facility.incident_count) || 0;
      const reworkCount = parseInt(facility.rework_count) || 0;
      const downtimeHours = parseFloat(facility.downtime_hours) || 0;
      const avgQualityScore = parseFloat(facility.avg_quality_score) || 7;
      const durationVarianceMinutes = (parseFloat(facility.duration_variance_hours) || 0) * 60;
      const complianceRate = parseFloat(facility.compliance_rate) || 0;

      // Calculate costs
      const laborCost = calculateLaborCost(reworkCount, durationVarianceMinutes);
      const materialCost = calculateMaterialCost(incidentCount, reworkCount);
      const safetyCost = calculateSafetyCost(incidentCount);
      const downtimeCost = calculateDowntimeCost(downtimeHours);
      const qualityCost = calculateQualityCost(avgQualityScore, workOrderCount);

      const totalProfitImpact = laborCost + materialCost + safetyCost + downtimeCost + qualityCost;

      // Calculate potential savings if compliance improves to 95%
      const targetCompliance = 95;
      const improvementFactor = Math.max(0, (targetCompliance - complianceRate) / 100);
      const potentialSavings = totalProfitImpact * improvementFactor * 0.7;

      return {
        facility_id: facility.facility_id,
        name: facility.name,
        performance_tier: facility.performance_tier,
        compliance_rate: complianceRate,
        work_order_count: workOrderCount,
        incident_count: incidentCount,
        rework_count: reworkCount,
        downtime_hours: downtimeHours,
        avg_quality_score: avgQualityScore,
        profitImpact: Math.round(totalProfitImpact),
        potentialSavings: Math.round(potentialSavings),
        costBreakdown: {
          labor: Math.round(laborCost),
          material: Math.round(materialCost),
          safety: Math.round(safetyCost),
          downtime: Math.round(downtimeCost),
          quality: Math.round(qualityCost),
        },
        rank: 0, // Will be set after sorting
      };
    });

    // Sort by profit impact (descending) and assign ranks
    facilities.sort((a, b) => b.profitImpact - a.profitImpact);
    facilities.forEach((f, index) => {
      f.rank = index + 1;
    });

    // Calculate totals for summary
    const totalProfitImpact = facilities.reduce((sum, f) => sum + f.profitImpact, 0);
    const totalPotentialSavings = facilities.reduce((sum, f) => sum + f.potentialSavings, 0);
    const avgComplianceRate = facilities.length > 0
      ? facilities.reduce((sum, f) => sum + f.compliance_rate, 0) / facilities.length
      : 0;

    return NextResponse.json({
      facilities,
      summary: {
        totalFacilities: facilities.length,
        totalProfitImpact: Math.round(totalProfitImpact),
        totalPotentialSavings: Math.round(totalPotentialSavings),
        avgComplianceRate: parseFloat(avgComplianceRate.toFixed(1)),
        topCostFacility: facilities[0]?.name || 'N/A',
        lowestCostFacility: facilities[facilities.length - 1]?.name || 'N/A',
      },
    });
  } catch (error) {
    console.error('Error fetching facility profit data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch facility profit data' },
      { status: 500 }
    );
  }
}
