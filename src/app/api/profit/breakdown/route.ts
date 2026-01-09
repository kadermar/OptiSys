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

    // Get aggregated data for cost calculations
    const result = await sql`
      SELECT
        COUNT(*) as total_work_orders,
        SUM(CASE WHEN compliant THEN 1 ELSE 0 END) as compliant_count,
        ROUND(AVG(CASE WHEN compliant THEN 1.0 ELSE 0.0 END) * 100, 1) as compliance_rate,
        SUM(CASE WHEN safety_incident THEN 1 ELSE 0 END) as incident_count,
        SUM(CASE WHEN rework_required THEN 1 ELSE 0 END) as rework_count,
        ROUND(COALESCE(SUM(downtime_hours), 0)::numeric, 1) as total_downtime_hours,
        ROUND(AVG(quality_score)::numeric, 1) as avg_quality_score,
        ROUND(COALESCE(SUM(duration_hours), 0)::numeric, 1) as total_duration_hours,
        -- Calculate duration variance (actual - expected based on procedures)
        ROUND(COALESCE(SUM(duration_hours - 2.5), 0)::numeric, 1) as total_duration_variance_hours
      FROM work_orders
      WHERE scheduled_date >= ${startDate}::date
        AND scheduled_date <= ${endDate}::date
    `;

    const data = result.rows[0];

    const totalWorkOrders = parseInt(data.total_work_orders) || 0;
    const complianceRate = parseFloat(data.compliance_rate) || 0;
    const incidentCount = parseInt(data.incident_count) || 0;
    const reworkCount = parseInt(data.rework_count) || 0;
    const downtimeHours = parseFloat(data.total_downtime_hours) || 0;
    const avgQualityScore = parseFloat(data.avg_quality_score) || 7;
    const durationVarianceMinutes = (parseFloat(data.total_duration_variance_hours) || 0) * 60;

    // Calculate costs by category
    const laborCost = calculateLaborCost(reworkCount, durationVarianceMinutes);
    const materialCost = calculateMaterialCost(incidentCount, reworkCount);
    const safetyCost = calculateSafetyCost(incidentCount);
    const downtimeCost = calculateDowntimeCost(downtimeHours);
    const qualityCost = calculateQualityCost(avgQualityScore, totalWorkOrders);

    const totalCost = laborCost + materialCost + safetyCost + downtimeCost + qualityCost;

    // Calculate potential savings if compliance improves to 95%
    const targetCompliance = 95;
    const improvementFactor = Math.max(0, (targetCompliance - complianceRate) / 100);
    const potentialSavings = totalCost * improvementFactor * 0.7;

    // Calculate month-over-month trend
    const trendResult = await sql`
      WITH monthly_data AS (
        SELECT
          DATE_TRUNC('month', scheduled_date) as month,
          SUM(CASE WHEN rework_required THEN 1 ELSE 0 END) as rework_count,
          SUM(CASE WHEN safety_incident THEN 1 ELSE 0 END) as incident_count,
          COALESCE(SUM(downtime_hours), 0) as downtime_hours
        FROM work_orders
        WHERE scheduled_date >= ${startDate}::date
          AND scheduled_date <= ${endDate}::date
        GROUP BY DATE_TRUNC('month', scheduled_date)
        ORDER BY month DESC
        LIMIT 2
      )
      SELECT * FROM monthly_data
    `;

    let momTrend = 0;
    if (trendResult.rows.length >= 2) {
      const currentMonth = trendResult.rows[0];
      const previousMonth = trendResult.rows[1];

      const currentCost =
        (parseInt(currentMonth.rework_count) * COST_CONSTANTS.AVG_REWORK_HOURS * COST_CONSTANTS.HOURLY_RATE) +
        (parseInt(currentMonth.incident_count) * COST_CONSTANTS.INCIDENT_DIRECT_COST) +
        (parseFloat(currentMonth.downtime_hours) * COST_CONSTANTS.PRODUCTION_LOSS_PER_HOUR);

      const previousCost =
        (parseInt(previousMonth.rework_count) * COST_CONSTANTS.AVG_REWORK_HOURS * COST_CONSTANTS.HOURLY_RATE) +
        (parseInt(previousMonth.incident_count) * COST_CONSTANTS.INCIDENT_DIRECT_COST) +
        (parseFloat(previousMonth.downtime_hours) * COST_CONSTANTS.PRODUCTION_LOSS_PER_HOUR);

      if (previousCost > 0) {
        momTrend = ((currentCost - previousCost) / previousCost) * 100;
      }
    }

    return NextResponse.json({
      totalProfitImpact: Math.round(totalCost),
      potentialSavings: Math.round(potentialSavings),
      monthOverMonthTrend: parseFloat(momTrend.toFixed(1)),
      categories: {
        labor: {
          total: Math.round(laborCost),
          percentOfTotal: totalCost > 0 ? parseFloat(((laborCost / totalCost) * 100).toFixed(1)) : 0,
          details: {
            reworkCount,
            reworkCost: reworkCount * COST_CONSTANTS.AVG_REWORK_HOURS * COST_CONSTANTS.HOURLY_RATE,
            varianceCost: Math.max(0, (durationVarianceMinutes / 60) * COST_CONSTANTS.HOURLY_RATE),
          },
        },
        material: {
          total: Math.round(materialCost),
          percentOfTotal: totalCost > 0 ? parseFloat(((materialCost / totalCost) * 100).toFixed(1)) : 0,
          details: {
            equipmentDamageCost: incidentCount * COST_CONSTANTS.EQUIPMENT_DAMAGE_AVG,
            materialWasteCost: reworkCount * COST_CONSTANTS.MATERIAL_WASTE_AVG,
          },
        },
        safety: {
          total: Math.round(safetyCost),
          percentOfTotal: totalCost > 0 ? parseFloat(((safetyCost / totalCost) * 100).toFixed(1)) : 0,
          details: {
            incidentCount,
            directCostPerIncident: COST_CONSTANTS.INCIDENT_DIRECT_COST,
            oshaMultiplier: COST_CONSTANTS.OSHA_MULTIPLIER,
          },
        },
        downtime: {
          total: Math.round(downtimeCost),
          percentOfTotal: totalCost > 0 ? parseFloat(((downtimeCost / totalCost) * 100).toFixed(1)) : 0,
          details: {
            totalHours: downtimeHours,
            costPerHour: COST_CONSTANTS.PRODUCTION_LOSS_PER_HOUR,
          },
        },
        quality: {
          total: Math.round(qualityCost),
          percentOfTotal: totalCost > 0 ? parseFloat(((qualityCost / totalCost) * 100).toFixed(1)) : 0,
          details: {
            avgQualityScore,
            qualityLoss: Math.max(0, 10 - avgQualityScore),
            workOrderCount: totalWorkOrders,
          },
        },
      },
      complianceRate,
      workOrderCount: totalWorkOrders,
      targetCompliance,
    });
  } catch (error) {
    console.error('Error fetching profit breakdown:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profit breakdown' },
      { status: 500 }
    );
  }
}
