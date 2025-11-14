import { sql } from '@vercel/postgres';

export const db = {
  // Get dashboard summary statistics
  async getDashboardSummary(startDate = '2024-01-01', endDate = '2024-12-31') {
    const result = await sql`
      SELECT
        COUNT(*) as total_work_orders,
        SUM(CASE WHEN compliant THEN 1 ELSE 0 END) as compliant_count,
        ROUND(AVG(CASE WHEN compliant THEN 1.0 ELSE 0.0 END) * 100, 1) as compliance_rate,
        SUM(CASE WHEN compliant AND safety_incident THEN 1 ELSE 0 END) as compliant_incidents,
        SUM(CASE WHEN NOT compliant AND safety_incident THEN 1 ELSE 0 END) as noncompliant_incidents
      FROM work_orders
      WHERE scheduled_date >= ${startDate}::date
        AND scheduled_date <= ${endDate}::date
    `;
    return result.rows[0];
  },

  // Get procedure performance data
  async getProcedurePerformance(startDate = '2024-01-01', endDate = '2024-12-31') {
    const result = await sql`
      SELECT
        p.procedure_id,
        p.name,
        p.category,
        p.target_metric,
        COUNT(wo.wo_id) as total_work_orders,
        SUM(CASE WHEN wo.compliant THEN 1 ELSE 0 END) as compliant_count,
        ROUND(AVG(CASE WHEN wo.compliant THEN 1.0 ELSE 0.0 END) * 100, 1) as compliance_rate,
        SUM(CASE WHEN wo.compliant AND wo.safety_incident THEN 1 ELSE 0 END) as compliant_incidents,
        SUM(CASE WHEN NOT wo.compliant AND wo.safety_incident THEN 1 ELSE 0 END) as noncompliant_incidents,
        SUM(CASE WHEN wo.safety_incident THEN 1 ELSE 0 END) as incident_count,
        ROUND(AVG(CASE WHEN wo.safety_incident THEN 1.0 ELSE 0.0 END) * 100, 1) as incident_rate,
        ROUND(AVG(wo.quality_score), 1) as avg_quality_score,
        ROUND(AVG(CASE WHEN wo.compliant THEN wo.quality_score ELSE NULL END), 1) as avg_quality_compliant,
        ROUND(AVG(CASE WHEN NOT wo.compliant THEN wo.quality_score ELSE NULL END), 1) as avg_quality_noncompliant,
        ROUND(AVG(wo.duration_hours), 1) as avg_duration,
        ROUND(AVG(CASE WHEN wo.compliant THEN wo.duration_hours ELSE NULL END), 1) as avg_duration_compliant,
        ROUND(AVG(CASE WHEN NOT wo.compliant THEN wo.duration_hours ELSE NULL END), 1) as avg_duration_noncompliant,
        ROUND(AVG(wo.downtime_hours), 1) as avg_downtime,
        SUM(CASE WHEN wo.rework_required THEN 1 ELSE 0 END) as rework_count,
        ROUND(AVG(CASE WHEN wo.rework_required THEN 1.0 ELSE 0.0 END) * 100, 1) as rework_rate
      FROM procedures p
      LEFT JOIN work_orders wo ON p.procedure_id = wo.procedure_id
      WHERE wo.scheduled_date >= ${startDate}::date
        AND wo.scheduled_date <= ${endDate}::date
      GROUP BY p.procedure_id, p.name, p.category, p.target_metric
      ORDER BY p.procedure_id
    `;
    return result.rows;
  },

  // Get correlation data for scatter plot
  async getCorrelationData(startDate = '2024-01-01', endDate = '2024-12-31') {
    const result = await sql`
      SELECT
        p.procedure_id,
        p.name,
        p.category,
        ROUND(CAST(AVG(CASE WHEN wo.compliant THEN 1.0 ELSE 0.0 END) * 100 AS NUMERIC), 1) as compliance_rate,
        COUNT(wo.wo_id) as work_order_count,
        -- Calculate KPI improvement (lower incidents = positive improvement)
        CASE
          WHEN SUM(CASE WHEN NOT wo.compliant AND wo.safety_incident THEN 1 ELSE 0 END) > 0 THEN
            ROUND(CAST((1 - (CAST(SUM(CASE WHEN wo.compliant AND wo.safety_incident THEN 1 ELSE 0 END) AS FLOAT) /
                        NULLIF(SUM(CASE WHEN NOT wo.compliant AND wo.safety_incident THEN 1 ELSE 0 END), 0))) * 100 AS NUMERIC), 1)
          ELSE 100.0
        END as kpi_improvement
      FROM procedures p
      LEFT JOIN work_orders wo ON p.procedure_id = wo.procedure_id
      WHERE wo.scheduled_date >= ${startDate}::date
        AND wo.scheduled_date <= ${endDate}::date
      GROUP BY p.procedure_id, p.name, p.category
      HAVING COUNT(wo.wo_id) > 0
    `;
    return result.rows;
  },

  // Get facility performance comparison
  async getFacilityPerformance(startDate = '2024-01-01', endDate = '2024-12-31') {
    const result = await sql`
      SELECT
        f.facility_id,
        f.name,
        f.performance_tier,
        COUNT(wo.wo_id) as work_order_count,
        ROUND(AVG(CASE WHEN wo.compliant THEN 1.0 ELSE 0.0 END) * 100, 1) as compliance_rate,
        SUM(CASE WHEN wo.safety_incident THEN 1 ELSE 0 END) as total_incidents
      FROM facilities f
      LEFT JOIN work_orders wo ON f.facility_id = wo.facility_id
      WHERE wo.scheduled_date >= ${startDate}::date
        AND wo.scheduled_date <= ${endDate}::date
      GROUP BY f.facility_id, f.name, f.performance_tier
      ORDER BY compliance_rate DESC
    `;
    return result.rows;
  },

  // Get procedure step-level analysis
  async getProcedureStepAnalysis(procedureId?: string, startDate = '2024-01-01', endDate = '2024-12-31') {
    if (procedureId) {
      const result = await sql`
        SELECT
          ps.step_id,
          ps.procedure_id,
          p.name as procedure_name,
          ps.step_number,
          ps.step_name,
          ps.criticality,
          ps.typical_duration_minutes,
          ps.verification_required,

          -- Total work orders for this procedure in date range
          COUNT(DISTINCT wo.wo_id) as total_work_orders,

          -- Checkpoint completions
          COALESCE(COUNT(cc.checkpoint_id), 0) as checkpoint_count,
          COALESCE(SUM(CASE WHEN cc.completed THEN 1 ELSE 0 END), 0) as completed_count,
          COALESCE(ROUND(CAST(AVG(CASE WHEN cc.completed THEN 1.0 ELSE 0.0 END) * 100 AS NUMERIC), 1), 0) as completion_rate,

          -- Deviations
          COALESCE(SUM(CASE WHEN cc.deviation_noted THEN 1 ELSE 0 END), 0) as deviation_count,
          COALESCE(ROUND(CAST(AVG(CASE WHEN cc.deviation_noted THEN 1.0 ELSE 0.0 END) * 100 AS NUMERIC), 1), 0) as deviation_rate,

          -- Quality
          COALESCE(SUM(CASE WHEN NOT cc.meets_spec THEN 1 ELSE 0 END), 0) as quality_issue_count,
          COALESCE(ROUND(CAST(AVG(CASE WHEN cc.meets_spec THEN 1.0 ELSE 0.0 END) * 100 AS NUMERIC), 1), 0) as quality_rate,

          -- Duration analysis
          COALESCE(ROUND(CAST(AVG(cc.duration_minutes) AS NUMERIC), 1), ps.typical_duration_minutes) as avg_duration_minutes,
          COALESCE(ROUND(CAST(AVG(cc.duration_minutes) - ps.typical_duration_minutes AS NUMERIC), 1), 0) as duration_variance

        FROM procedure_steps ps
        INNER JOIN procedures p ON ps.procedure_id = p.procedure_id
        LEFT JOIN compliance_checkpoints cc ON ps.step_id = cc.step_id
        LEFT JOIN work_orders wo ON cc.wo_id = wo.wo_id
          AND wo.scheduled_date >= ${startDate}::date
          AND wo.scheduled_date <= ${endDate}::date
        WHERE ps.procedure_id = ${procedureId}
        GROUP BY ps.step_id, ps.procedure_id, p.name, ps.step_number, ps.step_name,
                 ps.criticality, ps.typical_duration_minutes, ps.verification_required
        ORDER BY ps.procedure_id, ps.step_number
      `;
      return result.rows;
    } else {
      const result = await sql`
        SELECT
          ps.step_id,
          ps.procedure_id,
          p.name as procedure_name,
          ps.step_number,
          ps.step_name,
          ps.criticality,
          ps.typical_duration_minutes,
          ps.verification_required,

          -- Total work orders for this procedure in date range
          COUNT(DISTINCT wo.wo_id) as total_work_orders,

          -- Checkpoint completions
          COALESCE(COUNT(cc.checkpoint_id), 0) as checkpoint_count,
          COALESCE(SUM(CASE WHEN cc.completed THEN 1 ELSE 0 END), 0) as completed_count,
          COALESCE(ROUND(CAST(AVG(CASE WHEN cc.completed THEN 1.0 ELSE 0.0 END) * 100 AS NUMERIC), 1), 0) as completion_rate,

          -- Deviations
          COALESCE(SUM(CASE WHEN cc.deviation_noted THEN 1 ELSE 0 END), 0) as deviation_count,
          COALESCE(ROUND(CAST(AVG(CASE WHEN cc.deviation_noted THEN 1.0 ELSE 0.0 END) * 100 AS NUMERIC), 1), 0) as deviation_rate,

          -- Quality
          COALESCE(SUM(CASE WHEN NOT cc.meets_spec THEN 1 ELSE 0 END), 0) as quality_issue_count,
          COALESCE(ROUND(CAST(AVG(CASE WHEN cc.meets_spec THEN 1.0 ELSE 0.0 END) * 100 AS NUMERIC), 1), 0) as quality_rate,

          -- Duration analysis
          COALESCE(ROUND(CAST(AVG(cc.duration_minutes) AS NUMERIC), 1), ps.typical_duration_minutes) as avg_duration_minutes,
          COALESCE(ROUND(CAST(AVG(cc.duration_minutes) - ps.typical_duration_minutes AS NUMERIC), 1), 0) as duration_variance

        FROM procedure_steps ps
        INNER JOIN procedures p ON ps.procedure_id = p.procedure_id
        LEFT JOIN compliance_checkpoints cc ON ps.step_id = cc.step_id
        LEFT JOIN work_orders wo ON cc.wo_id = wo.wo_id
          AND wo.scheduled_date >= ${startDate}::date
          AND wo.scheduled_date <= ${endDate}::date
        GROUP BY ps.step_id, ps.procedure_id, p.name, ps.step_number, ps.step_name,
                 ps.criticality, ps.typical_duration_minutes, ps.verification_required
        ORDER BY ps.procedure_id, ps.step_number
      `;
      return result.rows;
    }
  },

  // Get predictive analytics with risk scoring
  async getPredictiveAnalytics(startDate = '2024-01-01', endDate = '2024-12-31') {
    const result = await sql`
      WITH procedure_metrics AS (
        SELECT
          p.procedure_id,
          p.name,
          p.category,
          COUNT(wo.wo_id) as total_work_orders,
          ROUND(CAST(AVG(CASE WHEN wo.compliant THEN 1.0 ELSE 0.0 END) * 100 AS NUMERIC), 1) as compliance_rate,
          ROUND(CAST(AVG(CASE WHEN wo.safety_incident THEN 1.0 ELSE 0.0 END) * 100 AS NUMERIC), 1) as incident_rate,
          ROUND(CAST(AVG(wo.quality_score) AS NUMERIC), 1) as avg_quality_score,
          ROUND(CAST(AVG(wo.duration_hours) AS NUMERIC), 1) as avg_duration,
          SUM(CASE WHEN wo.rework_required THEN 1 ELSE 0 END) as rework_count,
          SUM(CASE WHEN wo.equipment_trip THEN 1 ELSE 0 END) as equipment_trip_count
        FROM procedures p
        LEFT JOIN work_orders wo ON p.procedure_id = wo.procedure_id
        WHERE wo.scheduled_date >= ${startDate}::date
          AND wo.scheduled_date <= ${endDate}::date
        GROUP BY p.procedure_id, p.name, p.category
        HAVING COUNT(wo.wo_id) > 0
      ),
      risk_calculations AS (
        SELECT
          *,
          -- Risk score calculation (0-100, higher is riskier)
          -- Based on: low compliance, high incidents, low quality, high rework
          ROUND(CAST(
            (100 - compliance_rate) * 0.4 +  -- 40% weight on non-compliance
            incident_rate * 0.3 +              -- 30% weight on incidents
            (10 - COALESCE(avg_quality_score, 5)) * 5 * 0.2 +  -- 20% weight on quality
            (CAST(rework_count AS FLOAT) / NULLIF(total_work_orders, 0)) * 100 * 0.1  -- 10% weight on rework
          AS NUMERIC), 1) as risk_score
        FROM procedure_metrics
      )
      SELECT
        procedure_id,
        name,
        category,
        total_work_orders,
        compliance_rate,
        incident_rate,
        avg_quality_score,
        avg_duration,
        rework_count,
        equipment_trip_count,
        risk_score,
        -- Risk category
        CASE
          WHEN risk_score >= 70 THEN 'Critical'
          WHEN risk_score >= 50 THEN 'High'
          WHEN risk_score >= 30 THEN 'Medium'
          ELSE 'Low'
        END as risk_category,
        -- Trend indicators (comparing first half vs second half of period)
        CASE
          WHEN risk_score >= 70 THEN 'Immediate action required'
          WHEN risk_score >= 50 THEN 'Enhanced monitoring needed'
          WHEN risk_score >= 30 THEN 'Standard monitoring'
          ELSE 'Good performance'
        END as recommendation
      FROM risk_calculations
      ORDER BY risk_score DESC, total_work_orders DESC
    `;
    return result.rows;
  },
};
