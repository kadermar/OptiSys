'use client';

import { useState } from 'react';

interface DateRangePickerProps {
  onDateRangeChange: (startDate: string, endDate: string) => void;
}

export function DateRangePicker({ onDateRangeChange }: DateRangePickerProps) {
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-09-30');
  const [isOpen, setIsOpen] = useState(false);

  const presets = [
    { label: 'Q1 2024', start: '2024-01-01', end: '2024-03-31' },
    { label: 'Q2 2024', start: '2024-04-01', end: '2024-06-30' },
    { label: 'Q3 2024', start: '2024-07-01', end: '2024-09-30' },
    { label: 'Q1-Q3 2024', start: '2024-01-01', end: '2024-09-30' },
    { label: '2024 YTD', start: '2024-01-01', end: new Date().toISOString().split('T')[0] },
  ];

  const handleApply = () => {
    onDateRangeChange(startDate, endDate);
    setIsOpen(false);
  };

  const handlePreset = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    onDateRangeChange(start, end);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="hidden sm:inline">Date Range</span>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 p-4">
            <h3 className="text-sm font-semibold mb-3 dark:text-white">Select Date Range</h3>

            {/* Quick Presets */}
            <div className="mb-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Quick Select:</p>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePreset(preset.start, preset.end)}
                    className="px-3 py-2 text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition-colors dark:text-gray-300"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Inputs */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Apply
              </button>
            </div>

            {/* Current Selection Display */}
            <div className="mt-3 pt-3 border-t dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Selected: <span className="font-medium dark:text-white">{startDate}</span> to <span className="font-medium dark:text-white">{endDate}</span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
