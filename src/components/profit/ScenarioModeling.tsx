'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { COST_CONSTANTS, formatCurrency } from '@/lib/costConstants';

interface BreakdownData {
  totalProfitImpact: number;
  complianceRate: number;
  workOrderCount: number;
}

interface ScenarioModelingProps {
  currentData: BreakdownData | null;
}

interface Scenario {
  id: string;
  name: string;
  targetCompliance: number;
  workOrderVolume: number;
  laborCostPerHour: number;
  implementationCost: number;
  implementationMonths: number;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export function ScenarioModeling({ currentData }: ScenarioModelingProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<Scenario>({
    id: 'active',
    name: 'New Scenario',
    targetCompliance: 95,
    workOrderVolume: currentData?.workOrderCount || 1000,
    laborCostPerHour: COST_CONSTANTS.HOURLY_RATE,
    implementationCost: 50000,
    implementationMonths: 6,
  });

  if (!currentData) return null;

  // Calculate scenario results
  const calculateScenarioResults = (scenario: Scenario) => {
    const currentCompliance = currentData.complianceRate;
    const complianceImprovement = Math.max(0, scenario.targetCompliance - currentCompliance);
    const improvementFactor = complianceImprovement / 100;

    // Estimate cost reduction based on compliance improvement
    const potentialAnnualSavings = currentData.totalProfitImpact * improvementFactor * 0.7;

    // Calculate ROI
    const roi = scenario.implementationCost > 0
      ? ((potentialAnnualSavings - scenario.implementationCost) / scenario.implementationCost) * 100
      : 0;

    // Calculate payback period in months
    const monthlyReduction = potentialAnnualSavings / 12;
    const paybackMonths = monthlyReduction > 0
      ? Math.ceil(scenario.implementationCost / monthlyReduction)
      : Infinity;

    // Projected new annual cost
    const projectedAnnualCost = currentData.totalProfitImpact - potentialAnnualSavings;

    // NPV calculation (3 year horizon, 10% discount rate)
    const discountRate = 0.10;
    let npv = -scenario.implementationCost;
    for (let year = 1; year <= 3; year++) {
      npv += potentialAnnualSavings / Math.pow(1 + discountRate, year);
    }

    return {
      complianceImprovement,
      potentialAnnualSavings,
      roi,
      paybackMonths,
      projectedAnnualCost,
      npv,
    };
  };

  const activeResults = useMemo(
    () => calculateScenarioResults(activeScenario),
    [activeScenario, currentData]
  );

  const saveScenario = () => {
    const newScenario = {
      ...activeScenario,
      id: `scenario-${Date.now()}`,
      name: `Scenario ${scenarios.length + 1}`,
    };
    setScenarios([...scenarios, newScenario]);
  };

  const removeScenario = (id: string) => {
    setScenarios(scenarios.filter(s => s.id !== id));
  };

  return (
    <motion.div variants={fadeInUp} className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#1c2b40]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1c2b40] flex items-center gap-2">
            <span className="w-2 h-6 bg-[#ff0000] rounded"></span>
            Scenario Modeling
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Model different compliance improvement scenarios and calculate ROI
          </p>
        </div>
        <button
          onClick={saveScenario}
          className="px-4 py-2 bg-[#1c2b40] text-white rounded-lg text-sm font-medium hover:bg-[#2d3e54] transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save Scenario
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Sliders */}
        <div className="space-y-6">
          <h3 className="text-sm font-semibold text-gray-600">Scenario Parameters</h3>

          {/* Target Compliance */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Target Compliance Rate</label>
              <span className="text-sm font-bold text-[#1c2b40]">{activeScenario.targetCompliance}%</span>
            </div>
            <input
              type="range"
              min={Math.ceil(currentData.complianceRate)}
              max={100}
              value={activeScenario.targetCompliance}
              onChange={(e) => setActiveScenario({
                ...activeScenario,
                targetCompliance: parseInt(e.target.value),
              })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1c2b40]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Current: {currentData.complianceRate}%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Work Order Volume */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Annual Work Order Volume</label>
              <span className="text-sm font-bold text-[#1c2b40]">{activeScenario.workOrderVolume.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={100}
              max={5000}
              step={100}
              value={activeScenario.workOrderVolume}
              onChange={(e) => setActiveScenario({
                ...activeScenario,
                workOrderVolume: parseInt(e.target.value),
              })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1c2b40]"
            />
          </div>

          {/* Labor Cost */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Labor Cost per Hour</label>
              <span className="text-sm font-bold text-[#1c2b40]">${activeScenario.laborCostPerHour}/hr</span>
            </div>
            <input
              type="range"
              min={50}
              max={150}
              step={5}
              value={activeScenario.laborCostPerHour}
              onChange={(e) => setActiveScenario({
                ...activeScenario,
                laborCostPerHour: parseInt(e.target.value),
              })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1c2b40]"
            />
          </div>

          {/* Implementation Cost */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Implementation Cost</label>
              <span className="text-sm font-bold text-[#1c2b40]">{formatCurrency(activeScenario.implementationCost)}</span>
            </div>
            <input
              type="range"
              min={10000}
              max={500000}
              step={10000}
              value={activeScenario.implementationCost}
              onChange={(e) => setActiveScenario({
                ...activeScenario,
                implementationCost: parseInt(e.target.value),
              })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1c2b40]"
            />
          </div>

          {/* Implementation Timeline */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Implementation Timeline</label>
              <span className="text-sm font-bold text-[#1c2b40]">{activeScenario.implementationMonths} months</span>
            </div>
            <input
              type="range"
              min={1}
              max={24}
              value={activeScenario.implementationMonths}
              onChange={(e) => setActiveScenario({
                ...activeScenario,
                implementationMonths: parseInt(e.target.value),
              })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1c2b40]"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <h3 className="text-sm font-semibold text-gray-600">Projected Results</h3>

          {/* Comparison Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 rounded-xl p-4 border border-red-100">
              <p className="text-xs text-red-600 font-medium mb-1">Current State</p>
              <p className="text-2xl font-bold text-red-700">{formatCurrency(currentData.totalProfitImpact)}</p>
              <p className="text-xs text-red-600 mt-1">{currentData.complianceRate}% compliant</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <p className="text-xs text-green-600 font-medium mb-1">Target State</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(activeResults.projectedAnnualCost)}</p>
              <p className="text-xs text-green-600 mt-1">{activeScenario.targetCompliance}% compliant</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-1">Annual Savings</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(activeResults.potentialAnnualSavings)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-1">ROI</p>
              <p className={`text-xl font-bold ${activeResults.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {activeResults.roi >= 0 ? '+' : ''}{activeResults.roi.toFixed(0)}%
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-1">Payback Period</p>
              <p className="text-xl font-bold text-[#1c2b40]">
                {activeResults.paybackMonths === Infinity ? 'N/A' : `${activeResults.paybackMonths} mo`}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-1">3-Year NPV</p>
              <p className={`text-xl font-bold ${activeResults.npv >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(activeResults.npv)}
              </p>
            </div>
          </div>

          {/* Progress Visualization */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-gray-500 font-medium mb-3">Compliance Improvement</p>
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="absolute left-0 h-full bg-red-400"
                style={{ width: `${currentData.complianceRate}%` }}
              />
              <div
                className="absolute h-full bg-green-500 transition-all duration-300"
                style={{
                  left: `${currentData.complianceRate}%`,
                  width: `${activeResults.complianceImprovement}%`,
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span className="text-red-600">Current: {currentData.complianceRate}%</span>
              <span className="text-green-600">+{activeResults.complianceImprovement.toFixed(1)}%</span>
              <span className="text-gray-600">Target: {activeScenario.targetCompliance}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Scenarios */}
      {scenarios.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">Saved Scenarios</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((scenario) => {
              const results = calculateScenarioResults(scenario);
              return (
                <motion.div
                  key={scenario.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200 relative"
                >
                  <button
                    onClick={() => removeScenario(scenario.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <p className="font-semibold text-[#1c2b40] mb-2">{scenario.name}</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Target:</span>
                      <span className="font-medium">{scenario.targetCompliance}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Investment:</span>
                      <span className="font-medium">{formatCurrency(scenario.implementationCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Annual Savings:</span>
                      <span className="font-medium text-green-600">{formatCurrency(results.potentialAnnualSavings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">ROI:</span>
                      <span className={`font-medium ${results.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {results.roi.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveScenario({ ...scenario, id: 'active' })}
                    className="mt-3 w-full text-xs text-[#1c2b40] font-medium hover:underline"
                  >
                    Load Scenario
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
