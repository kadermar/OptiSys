'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTourSafe } from './TourProvider';

interface TourTooltipProps {
  step: number;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  onSelect?: () => void;
  showArrow?: boolean;
}

export function TourTooltip({
  step,
  title,
  description,
  position = 'top',
  children,
  onSelect,
  showArrow = true,
}: TourTooltipProps) {
  const tour = useTourSafe();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const isActive = tour?.isActive && tour?.currentStep === step;

  useEffect(() => {
    if (isActive) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setIsVisible(true);
        // Scroll element into view
        containerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isActive]);

  const getTooltipPosition = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-3';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-3';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-3';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-3';
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-3';
    }
  };

  const getArrowPosition = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 -translate-x-1/2 border-t-[#1c2b40]';
      case 'bottom':
        return 'bottom-full left-1/2 -translate-x-1/2 border-b-[#1c2b40]';
      case 'left':
        return 'left-full top-1/2 -translate-y-1/2 border-l-[#1c2b40]';
      case 'right':
        return 'right-full top-1/2 -translate-y-1/2 border-r-[#1c2b40]';
      default:
        return 'top-full left-1/2 -translate-x-1/2 border-t-[#1c2b40]';
    }
  };

  const handleClick = () => {
    if (isActive && onSelect) {
      onSelect();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${isActive ? 'z-40' : ''}`}
      onClick={handleClick}
    >
      {/* Spotlight overlay */}
      <AnimatePresence>
        {isActive && isVisible && (
          <>
            {/* Pulse ring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 -m-2 rounded-lg pointer-events-none"
            >
              <div className="absolute inset-0 rounded-lg border-2 border-[#ff0000] animate-pulse" />
              <motion.div
                className="absolute inset-0 rounded-lg border-2 border-[#ff0000]"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>

            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, y: position === 'bottom' ? -10 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: position === 'bottom' ? -10 : 10 }}
              className={`absolute ${getTooltipPosition()} w-64 z-50 pointer-events-none`}
            >
              <div className="bg-[#1c2b40] rounded-lg shadow-xl border border-[#ff0000]/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[#ff0000] flex items-center justify-center text-xs font-bold text-white">
                    {step}
                  </div>
                  <h4 className="font-bold text-white text-sm">{title}</h4>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed">{description}</p>
                {onSelect && (
                  <p className="text-[#ff0000] text-xs mt-2 font-medium">Click to select</p>
                )}
              </div>

              {/* Arrow */}
              {showArrow && (
                <div
                  className={`absolute ${getArrowPosition()} w-0 h-0 border-8 border-transparent`}
                />
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Original content */}
      <div className={isActive ? 'relative z-30' : ''}>
        {children}
      </div>
    </div>
  );
}

// Simpler inline tooltip for smaller elements
export function TourHighlight({
  step,
  children,
  className = '',
}: {
  step: number;
  children: React.ReactNode;
  className?: string;
}) {
  const tour = useTourSafe();
  const isActive = tour?.isActive && tour?.currentStep === step;

  return (
    <div
      className={`relative ${className} ${
        isActive
          ? 'ring-2 ring-[#ff0000] ring-offset-2 ring-offset-transparent rounded-lg animate-pulse'
          : ''
      }`}
    >
      {children}
    </div>
  );
}
