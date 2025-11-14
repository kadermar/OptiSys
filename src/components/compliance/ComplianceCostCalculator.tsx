'use client';

import { useState } from 'react';

export function ComplianceCostCalculator() {
  const [workOrders, setWorkOrders] = useState(588);
  const [currentCompliance, setCurrentCompliance] = useState(88.6);
  const [targetCompliance, setTargetCompliance] = useState(95);

  // Calculate based on actual data
  const avgCostNonCompliant = 17965;
  const avgCostCompliant = 243;

  const currentNonCompliant = Math.round(workOrders * (1 - currentCompliance/100));
  const targetNonCompliant = Math.round(workOrders * (1 - targetCompliance/100));

  const currentCost = (currentNonCompliant * avgCostNonCompliant) +
                      ((workOrders - currentNonCompliant) * avgCostCompliant);
  const targetCost = (targetNonCompliant * avgCostNonCompliant) +
                     ((workOrders - targetNonCompliant) * avgCostCompliant);

  const savings = currentCost - targetCost;
  const savingsPercent = (savings / currentCost) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4 border-[#ff0000]">
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1c2b40] flex items-center gap-2">
          <span className="w-2 h-8 bg-[#ff0000] rounded"></span>
          Compliance ROI Calculator
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Adjust the sliders to see potential savings for your operations
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Input: Work Orders */}
        <div>
          <label className="font-semibold mb-2 block text-gray-700">
            Annual Work Orders: <span className="text-blue-600 text-xl">{workOrders}</span>
          </label>
          <input
            type="range"
            value={workOrders}
            onChange={(e) => setWorkOrders(Number(e.target.value))}
            min={100}
            max={2000}
            step={10}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ff0000]"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>100</span>
            <span>2,000</span>
          </div>
        </div>

        {/* Input: Current Compliance */}
        <div>
          <label className="font-semibold mb-2 block text-gray-700">
            Current Compliance Rate: <span className="text-orange-600 text-xl">{currentCompliance.toFixed(1)}%</span>
          </label>
          <input
            type="range"
            value={currentCompliance}
            onChange={(e) => setCurrentCompliance(Number(e.target.value))}
            min={50}
            max={100}
            step={0.1}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Input: Target Compliance */}
        <div>
          <label className="font-semibold mb-2 block text-gray-700">
            Target Compliance Rate: <span className="text-green-600 text-xl">{targetCompliance.toFixed(1)}%</span>
          </label>
          <input
            type="range"
            value={targetCompliance}
            onChange={(e) => setTargetCompliance(Number(e.target.value))}
            min={currentCompliance}
            max={100}
            step={0.1}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{currentCompliance.toFixed(1)}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Results */}
        <div className="border-t-2 pt-6 space-y-4">
          <h3 className="font-bold text-xl text-[#1c2b40]">Results:</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Current Annual Cost</div>
              <div className="text-3xl font-bold text-orange-600">
                ${(currentCost / 1000000).toFixed(2)}M
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {currentNonCompliant} non-compliant work orders
              </div>
            </div>

            <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Target Annual Cost</div>
              <div className="text-3xl font-bold text-green-600">
                ${(targetCost / 1000000).toFixed(2)}M
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {targetNonCompliant} non-compliant work orders
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#ff0000] text-white rounded-lg text-center">
            <div className="text-sm mb-2 font-semibold tracking-wide">ANNUAL SAVINGS</div>
            <div className="text-5xl font-bold mb-2">
              ${(savings / 1000000).toFixed(2)}M
            </div>
            <div className="text-lg">
              {savingsPercent.toFixed(1)}% cost reduction
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Work orders improved:</span>
              <span className="font-bold text-[#1c2b40]">{currentNonCompliant - targetNonCompliant}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Incidents prevented (est.):</span>
              <span className="font-bold text-green-600">
                {Math.round((currentNonCompliant - targetNonCompliant) * 0.209)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">ROI on compliance investment:</span>
              <span className="font-bold text-blue-600">
                {(savings / (savings * 0.15)).toFixed(1)}:1
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Cost per non-compliant WO:</span>
              <span className="font-bold text-red-600">${avgCostNonCompliant.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Cost per compliant WO:</span>
              <span className="font-bold text-green-600">${avgCostCompliant.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
