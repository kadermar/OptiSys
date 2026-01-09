import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { COST_CONSTANTS } from '@/lib/costConstants';

// Simple linear regression for projection
function linearRegression(data: { x: number; y: number }[]): { slope: number; intercept: number } {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0 };

  const sumX = data.reduce((sum, d) => sum + d.x, 0);
  const sumY = data.reduce((sum, d) => sum + d.y, 0);
  const sumXY = data.reduce((sum, d) => sum + d.x * d.y, 0);
  const sumX2 = data.reduce((sum, d) => sum + d.x * d.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return {
    slope: isNaN(slope) ? 0 : slope,
    intercept: isNaN(intercept) ? 0 : intercept,
  };
}

// Calculate standard deviation for confidence intervals
function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((sum, d) => sum + d, 0) / values.length);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || '2024-01-01';
    const endDate = searchParams.get('endDate') || '2025-12-31';
    const projectionMonths = parseInt(searchParams.get('projectionMonths') || '6');

    // Get monthly historical data
    const result = await sql`
      SELECT
        TO_CHAR(DATE_TRUNC('month', scheduled_date), 'YYYY-MM') as month,
        DATE_TRUNC('month', scheduled_date) as month_date,
        COUNT(*) as work_order_count,
        ROUND(AVG(CASE WHEN compliant THEN 1.0 ELSE 0.0 END) * 100, 1) as compliance_rate,
        SUM(CASE WHEN safety_incident THEN 1 ELSE 0 END) as incident_count,
        SUM(CASE WHEN rework_required THEN 1 ELSE 0 END) as rework_count,
        ROUND(COALESCE(SUM(downtime_hours), 0)::numeric, 1) as downtime_hours,
        ROUND(AVG(quality_score)::numeric, 1) as avg_quality_score
      FROM work_orders
      WHERE scheduled_date >= ${startDate}::date
        AND scheduled_date <= ${endDate}::date
      GROUP BY DATE_TRUNC('month', scheduled_date)
      ORDER BY DATE_TRUNC('month', scheduled_date)
    `;

    // Calculate total cost for each month
    const historical = result.rows.map((row, index) => {
      const reworkCount = parseInt(row.rework_count) || 0;
      const incidentCount = parseInt(row.incident_count) || 0;
      const downtimeHours = parseFloat(row.downtime_hours) || 0;
      const avgQualityScore = parseFloat(row.avg_quality_score) || 7;
      const workOrderCount = parseInt(row.work_order_count) || 0;

      // Calculate monthly cost
      const laborCost = reworkCount * COST_CONSTANTS.AVG_REWORK_HOURS * COST_CONSTANTS.HOURLY_RATE;
      const safetyCost = incidentCount * COST_CONSTANTS.INCIDENT_DIRECT_COST * COST_CONSTANTS.OSHA_MULTIPLIER;
      const materialCost = incidentCount * COST_CONSTANTS.EQUIPMENT_DAMAGE_AVG + reworkCount * COST_CONSTANTS.MATERIAL_WASTE_AVG;
      const downtimeCost = downtimeHours * COST_CONSTANTS.PRODUCTION_LOSS_PER_HOUR;
      const qualityLoss = Math.max(0, 10 - avgQualityScore);
      const qualityCost = qualityLoss * workOrderCount * COST_CONSTANTS.QUALITY_CUSTOMER_IMPACT;

      const totalCost = laborCost + safetyCost + materialCost + downtimeCost + qualityCost;

      return {
        month: row.month,
        monthDate: row.month_date,
        totalCost: Math.round(totalCost),
        complianceRate: parseFloat(row.compliance_rate) || 0,
        incidentCount: incidentCount,
        reworkCount: reworkCount,
        downtimeHours: downtimeHours,
        workOrderCount: workOrderCount,
        isProjection: false,
        index: index,
      };
    });

    // Prepare data for regression
    const costData = historical.map((h, i) => ({ x: i, y: h.totalCost }));
    const complianceData = historical.map((h, i) => ({ x: i, y: h.complianceRate }));
    const incidentData = historical.map((h, i) => ({ x: i, y: h.incidentCount }));

    // Calculate linear regressions
    const costRegression = linearRegression(costData);
    const complianceRegression = linearRegression(complianceData);
    const incidentRegression = linearRegression(incidentData);

    // Calculate standard deviation for confidence intervals
    const costStdDev = standardDeviation(historical.map(h => h.totalCost));

    // Generate projections
    const projected = [];
    const lastMonth = historical.length > 0 ? new Date(historical[historical.length - 1].monthDate) : new Date();

    for (let i = 1; i <= projectionMonths; i++) {
      const projectionIndex = historical.length + i - 1;
      const projectedDate = new Date(lastMonth);
      projectedDate.setMonth(projectedDate.getMonth() + i);

      const projectedCost = Math.max(0, costRegression.intercept + costRegression.slope * projectionIndex);
      const projectedCompliance = Math.min(100, Math.max(0, complianceRegression.intercept + complianceRegression.slope * projectionIndex));
      const projectedIncidents = Math.max(0, Math.round(incidentRegression.intercept + incidentRegression.slope * projectionIndex));

      // Confidence interval widens as we project further
      const confidenceMultiplier = 1 + (i * 0.15); // 15% wider confidence per month
      const confidenceRange = costStdDev * confidenceMultiplier;

      projected.push({
        month: projectedDate.toISOString().slice(0, 7),
        totalCost: Math.round(projectedCost),
        complianceRate: parseFloat(projectedCompliance.toFixed(1)),
        incidentCount: projectedIncidents,
        confidenceMin: Math.round(Math.max(0, projectedCost - confidenceRange)),
        confidenceMax: Math.round(projectedCost + confidenceRange),
        isProjection: true,
      });
    }

    // Calculate trend analysis
    const recentMonths = historical.slice(-3);
    const olderMonths = historical.slice(-6, -3);

    let costTrend = 'stable';
    let complianceTrend = 'stable';

    if (recentMonths.length > 0 && olderMonths.length > 0) {
      const recentAvgCost = recentMonths.reduce((sum, h) => sum + h.totalCost, 0) / recentMonths.length;
      const olderAvgCost = olderMonths.reduce((sum, h) => sum + h.totalCost, 0) / olderMonths.length;

      const recentAvgCompliance = recentMonths.reduce((sum, h) => sum + h.complianceRate, 0) / recentMonths.length;
      const olderAvgCompliance = olderMonths.reduce((sum, h) => sum + h.complianceRate, 0) / olderMonths.length;

      if (recentAvgCost > olderAvgCost * 1.05) costTrend = 'increasing';
      else if (recentAvgCost < olderAvgCost * 0.95) costTrend = 'decreasing';

      if (recentAvgCompliance > olderAvgCompliance * 1.02) complianceTrend = 'improving';
      else if (recentAvgCompliance < olderAvgCompliance * 0.98) complianceTrend = 'declining';
    }

    // Summary statistics
    const totalHistoricalCost = historical.reduce((sum, h) => sum + h.totalCost, 0);
    const totalProjectedCost = projected.reduce((sum, p) => sum + p.totalCost, 0);
    const avgMonthlyCost = historical.length > 0 ? totalHistoricalCost / historical.length : 0;

    return NextResponse.json({
      historical,
      projected,
      analysis: {
        costTrend,
        complianceTrend,
        costSlope: parseFloat(costRegression.slope.toFixed(2)),
        complianceSlope: parseFloat(complianceRegression.slope.toFixed(2)),
        totalHistoricalCost: Math.round(totalHistoricalCost),
        totalProjectedCost: Math.round(totalProjectedCost),
        avgMonthlyCost: Math.round(avgMonthlyCost),
        projectedSavingsAt95Compliance: historical.length > 0
          ? Math.round(totalProjectedCost * ((95 - historical[historical.length - 1].complianceRate) / 100) * 0.7)
          : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching profit trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profit trends' },
      { status: 500 }
    );
  }
}
