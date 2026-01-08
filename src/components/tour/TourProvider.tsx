'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { tourSteps, TOTAL_STEPS } from './tourSteps';
import { TourOverlay } from './TourOverlay';

interface TourContextType {
  isActive: boolean;
  currentStep: number;
  selectedProcedureId: string | null;
  selectedProcedureName: string | null;
  completedWorkOrderId: string | null;
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  setSelectedProcedure: (id: string, name: string) => void;
  setCompletedWorkOrder: (id: string) => void;
  getCurrentStepInfo: () => typeof tourSteps[0] | null;
}

const TourContext = createContext<TourContextType | null>(null);

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}

// Safe hook that returns null if not in provider
export function useTourSafe() {
  return useContext(TourContext);
}

interface TourProviderProps {
  children: React.ReactNode;
}

export function TourProvider({ children }: TourProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProcedureId, setSelectedProcedureId] = useState<string | null>(null);
  const [selectedProcedureName, setSelectedProcedureName] = useState<string | null>(null);
  const [completedWorkOrderId, setCompletedWorkOrderId] = useState<string | null>(null);

  // Load tour state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('optisys-tour-state');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.isActive) {
          setIsActive(state.isActive);
          setCurrentStep(state.currentStep || 1);
          setSelectedProcedureId(state.selectedProcedureId || null);
          setSelectedProcedureName(state.selectedProcedureName || null);
          setCompletedWorkOrderId(state.completedWorkOrderId || null);
        }
      } catch (e) {
        console.error('Error loading tour state:', e);
      }
    }
  }, []);

  // Save tour state to localStorage when it changes
  useEffect(() => {
    if (isActive) {
      localStorage.setItem('optisys-tour-state', JSON.stringify({
        isActive,
        currentStep,
        selectedProcedureId,
        selectedProcedureName,
        completedWorkOrderId,
      }));
    } else {
      localStorage.removeItem('optisys-tour-state');
    }
  }, [isActive, currentStep, selectedProcedureId, selectedProcedureName, completedWorkOrderId]);

  const getCurrentStepInfo = useCallback(() => {
    return tourSteps.find(step => step.id === currentStep) || null;
  }, [currentStep]);

  const navigateToStep = useCallback((step: number) => {
    const stepInfo = tourSteps.find(s => s.id === step);
    if (stepInfo) {
      let targetPath = stepInfo.page;

      // Add procedure ID to relevant pages
      if (selectedProcedureId && (step === 3 || step === 7)) {
        targetPath = `/procedures?selected=${selectedProcedureId}`;
      }

      // Go to work orders tab for step 5
      if (step === 5) {
        targetPath = '/knowledge-base?tab=workorders';
      }

      if (pathname !== targetPath.split('?')[0]) {
        router.push(targetPath);
      }
    }
  }, [pathname, router, selectedProcedureId]);

  const startTour = useCallback(() => {
    setIsActive(true);
    setCurrentStep(1);
    setSelectedProcedureId(null);
    setSelectedProcedureName(null);
    setCompletedWorkOrderId(null);
    router.push('/knowledge-base');
  }, [router]);

  const endTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(1);
    localStorage.removeItem('optisys-tour-state');
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      navigateToStep(newStep);
    } else {
      endTour();
    }
  }, [currentStep, navigateToStep, endTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      navigateToStep(newStep);
    }
  }, [currentStep, navigateToStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= TOTAL_STEPS) {
      setCurrentStep(step);
      navigateToStep(step);
    }
  }, [navigateToStep]);

  const setSelectedProcedure = useCallback((id: string, name: string) => {
    setSelectedProcedureId(id);
    setSelectedProcedureName(name);
  }, []);

  const setCompletedWorkOrder = useCallback((id: string) => {
    setCompletedWorkOrderId(id);
  }, []);

  const value: TourContextType = {
    isActive,
    currentStep,
    selectedProcedureId,
    selectedProcedureName,
    completedWorkOrderId,
    startTour,
    endTour,
    nextStep,
    prevStep,
    goToStep,
    setSelectedProcedure,
    setCompletedWorkOrder,
    getCurrentStepInfo,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
      {isActive && <TourOverlay />}
    </TourContext.Provider>
  );
}
