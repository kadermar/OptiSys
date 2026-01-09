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

    // Get procedure-level data with cost metrics
    const result = await sql`
      SELECT
        p.procedure_id,
        p.name,
        p.category,
        COUNT(wo.wo_id) as work_order_count,
        ROUND(AVG(CASE WHEN wo.compliant THEN 1.0 ELSE 0.0 END) * 100, 1) as compliance_rate,
        SUM(CASE WHEN wo.safety_incident THEN 1 ELSE 0 END) as incident_count,
        SUM(CASE WHEN wo.rework_required THEN 1 ELSE 0 END) as rework_count,
        ROUND(COALESCE(SUM(wo.downtime_hours), 0)::numeric, 1) as downtime_hours,
        ROUND(AVG(wo.quality_score)::numeric, 1) as avg_quality_score,
        ROUND(COALESCE(SUM(wo.duration_hours - 2.5), 0)::numeric, 1) as duration_variance_hours
      FROM procedures p
      LEFT JOIN work_orders wo ON p.procedure_id = wo.procedure_id
        AND wo.scheduled_date >= ${startDate}::date
        AND wo.scheduled_date <= ${endDate}::date
      GROUP BY p.procedure_id, p.name, p.category
      ORDER BY p.name
    `;

    // Calculate profit impact for each procedure
    let totalAllProcedures = 0;
    const procedures = result.rows.map((procedure) => {
      const workOrderCount = parseInt(procedure.work_order_count) || 0;
      const incidentCount = parseInt(procedure.incident_count) || 0;
      const reworkCount = parseInt(procedure.rework_count) || 0;
      const downtimeHours = parseFloat(procedure.downtime_hours) || 0;
      const avgQualityScore = parseFloat(procedure.avg_quality_score) || 7;
      const durationVarianceMinutes = (parseFloat(procedure.duration_variance_hours) || 0) * 60;
      const complianceRate = parseFloat(procedure.compliance_rate) || 0;

      // Calculate costs
      const laborCost = calculateLaborCost(reworkCount, durationVarianceMinutes);
      const materialCost = calculateMaterialCost(incidentCount, reworkCount);
      const safetyCost = calculateSafetyCost(incidentCount);
      const downtimeCost = calculateDowntimeCost(downtimeHours);
      const qualityCost = calculateQualityCost(avgQualityScore, workOrderCount);

      const totalProfitImpact = laborCost + materialCost + safetyCost + downtimeCost + qualityCost;
      totalAllProcedures += totalProfitImpact;

      return {
        procedure_id: procedure.procedure_id,
        name: procedure.name,
        category: procedure.category,
        compliance_rate: complianceRate,
        work_order_count: workOrderCount,
        incident_count: incidentCount,
        rework_count: reworkCount,
        downtime_hours: downtimeHours,
        avg_quality_score: avgQualityScore,
        laborCost: Math.round(laborCost),
        incidentCost: Math.round(safetyCost),
        materialCost: Math.round(materialCost),
        downtimeCost: Math.round(downtimeCost),
        qualityCost: Math.round(qualityCost),
        totalProfitImpact: Math.round(totalProfitImpact),
        contributionPercent: 0, // Will be calculated after totals
      };
    });

    // Calculate contribution percentages
    procedures.forEach(proc => {
      proc.contributionPercent = totalAllProcedures > 0
        ? parseFloat(((proc.totalProfitImpact / totalAllProcedures) * 100).toFixed(1))
        : 0;
    });

    // Sort by profit impact (descending)
    procedures.sort((a, b) => b.totalProfitImpact - a.totalProfitImpact);

    // Group by category for treemap
    const categoryTotals: Record<string, {
      category: string;
      totalCost: number;
      procedureCount: number;
      avgCompliance: number;
    }> = {};

    procedures.forEach(proc => {
      if (!categoryTotals[proc.category]) {
        categoryTotals[proc.category] = {
          category: proc.category,
          totalCost: 0,
          procedureCount: 0,
          avgCompliance: 0,
        };
      }
      categoryTotals[proc.category].totalCost += proc.totalProfitImpact;
      categoryTotals[proc.category].procedureCount += 1;
      categoryTotals[proc.category].avgCompliance += proc.compliance_rate;
    });

    // Calculate average compliance per category
    Object.values(categoryTotals).forEach(cat => {
      cat.avgCompliance = cat.procedureCount > 0
        ? parseFloat((cat.avgCompliance / cat.procedureCount).toFixed(1))
        : 0;
    });

    const categories = Object.values(categoryTotals).sort((a, b) => b.totalCost - a.totalCost);

    return NextResponse.json({
      procedures,
      categories,
      summary: {
        totalProcedures: procedures.length,
        totalProfitImpact: Math.round(totalAllProcedures),
        topCostProcedure: procedures[0]?.name || 'N/A',
        topCategory: categories[0]?.category || 'N/A',
        avgComplianceRate: procedures.length > 0
          ? parseFloat((procedures.reduce((sum, p) => sum + p.compliance_rate, 0) / procedures.length).toFixed(1))
          : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching procedure profit data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch procedure profit data' },
      { status: 500 }
    );
  }
}
