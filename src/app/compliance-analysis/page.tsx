'use client';

import { useEffect, useState } from 'react';
import { SplitScreenComparison } from '@/components/compliance/SplitScreenComparison';
import { CorrelationScatterPlot } from '@/components/compliance/CorrelationScatterPlot';
import { ComplianceCostCalculator } from '@/components/compliance/ComplianceCostCalculator';

export default function ComplianceAnalysisPage() {
  const [splitScreenData, setSplitScreenData] = useState<any>(null);
  const [scatterData, setScatterData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [splitRes, scatterRes] = await Promise.all([
          fetch('/api/compliance/split-screen'),
          fetch('/api/compliance/scatter'),
        ]);

        if (splitRes.ok) {
          setSplitScreenData(await splitRes.json());
        }

        if (scatterRes.ok) {
          setScatterData(await scatterRes.json());
        }
      } catch (error) {
        console.error('Error fetching compliance data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff0000]"></div>
          <p className="mt-4 text-[#1c2b40]">Loading compliance analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1c2b40]">Compliance Analysis</h1>
            <p className="text-sm text-gray-600 mt-1">
              Ultimate compliance vs results visualization - Proving the correlation with maximum impact
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Visualization 1: Split Screen Comparison */}
        {splitScreenData && (
          <section>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-[#1c2b40] flex items-center gap-2">
                <span className="w-2 h-6 bg-[#ff0000] rounded"></span>
                Visual Comparison
              </h2>
              <p className="text-sm text-gray-600 mt-1 ml-4">
                Direct comparison of compliant vs non-compliant work outcomes
              </p>
            </div>
            <SplitScreenComparison data={splitScreenData} />
          </section>
        )}

        {/* Visualization 2: Scatter Plot */}
        {scatterData.length > 0 && (
          <section>
            <CorrelationScatterPlot data={scatterData} />
          </section>
        )}

        {/* Visualization 3: Cost Calculator */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[#1c2b40] flex items-center gap-2">
              <span className="w-2 h-6 bg-[#ff0000] rounded"></span>
              ROI Calculator
            </h2>
            <p className="text-sm text-gray-600 mt-1 ml-4">
              Calculate potential savings based on compliance improvement
            </p>
          </div>
          <ComplianceCostCalculator />
        </section>
      </main>
    </div>
  );
}
