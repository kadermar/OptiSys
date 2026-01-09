// Cost constants for profit impact calculations
// These values represent industry-standard costs and can be adjusted based on specific facility data

export const COST_CONSTANTS = {
  // Labor costs
  HOURLY_RATE: 85, // Average fully-loaded labor cost per hour
  AVG_REWORK_HOURS: 4, // Average hours spent on rework per incident

  // Safety incident costs
  INCIDENT_DIRECT_COST: 25000, // Direct cost per safety incident
  OSHA_MULTIPLIER: 4, // OSHA indirect cost multiplier (total = direct × multiplier)

  // Downtime costs
  PRODUCTION_LOSS_PER_HOUR: 1200, // Production revenue loss per hour of downtime

  // Material and equipment costs
  EQUIPMENT_DAMAGE_AVG: 2500, // Average equipment damage cost per incident
  MATERIAL_WASTE_AVG: 500, // Average material waste per rework

  // Quality impact costs
  QUALITY_CUSTOMER_IMPACT: 150, // Customer impact cost per quality point lost per work order

  // Compliance baseline costs (for comparison)
  COST_PER_NONCOMPLIANT: 17965, // Average total cost of non-compliant work order
  COST_PER_COMPLIANT: 243, // Average total cost of compliant work order
};

// Helper function to calculate labor cost
export function calculateLaborCost(reworkCount: number, durationVarianceMinutes: number): number {
  const reworkCost = reworkCount * COST_CONSTANTS.AVG_REWORK_HOURS * COST_CONSTANTS.HOURLY_RATE;
  const varianceCost = (durationVarianceMinutes / 60) * COST_CONSTANTS.HOURLY_RATE;
  return reworkCost + Math.max(0, varianceCost);
}

// Helper function to calculate material/equipment cost
export function calculateMaterialCost(incidentCount: number, reworkCount: number): number {
  const equipmentCost = incidentCount * COST_CONSTANTS.EQUIPMENT_DAMAGE_AVG;
  const materialWaste = reworkCount * COST_CONSTANTS.MATERIAL_WASTE_AVG;
  return equipmentCost + materialWaste;
}

// Helper function to calculate safety incident cost
export function calculateSafetyCost(incidentCount: number): number {
  return incidentCount * COST_CONSTANTS.INCIDENT_DIRECT_COST * COST_CONSTANTS.OSHA_MULTIPLIER;
}

// Helper function to calculate downtime cost
export function calculateDowntimeCost(downtimeHours: number): number {
  return downtimeHours * COST_CONSTANTS.PRODUCTION_LOSS_PER_HOUR;
}

// Helper function to calculate quality cost
export function calculateQualityCost(qualityScore: number, workOrderCount: number): number {
  const qualityLoss = Math.max(0, 10 - qualityScore);
  return qualityLoss * workOrderCount * COST_CONSTANTS.QUALITY_CUSTOMER_IMPACT;
}

// Calculate total profit impact
export function calculateTotalProfitImpact(params: {
  reworkCount: number;
  durationVarianceMinutes: number;
  incidentCount: number;
  downtimeHours: number;
  qualityScore: number;
  workOrderCount: number;
}): {
  labor: number;
  material: number;
  safety: number;
  downtime: number;
  quality: number;
  total: number;
} {
  const labor = calculateLaborCost(params.reworkCount, params.durationVarianceMinutes);
  const material = calculateMaterialCost(params.incidentCount, params.reworkCount);
  const safety = calculateSafetyCost(params.incidentCount);
  const downtime = calculateDowntimeCost(params.downtimeHours);
  const quality = calculateQualityCost(params.qualityScore, params.workOrderCount);

  return {
    labor,
    material,
    safety,
    downtime,
    quality,
    total: labor + material + safety + downtime + quality,
  };
}

// Calculate potential savings if compliance improves to target
export function calculatePotentialSavings(
  currentComplianceRate: number,
  targetComplianceRate: number,
  currentTotalCost: number
): number {
  const improvementFactor = (targetComplianceRate - currentComplianceRate) / 100;
  // Assume linear relationship between compliance improvement and cost reduction
  return currentTotalCost * improvementFactor * 0.7; // 70% of costs are compliance-related
}

// Format currency for display
export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

// Format large numbers for display
export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}
