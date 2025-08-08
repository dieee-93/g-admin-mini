// src/features/products/ui/CostAnalysisModule.tsx
// Módulo de Análisis de Costos refactorizado sin tabs anidados

import React, { useState } from 'react';
import {
  Box,
  VStack
} from '@chakra-ui/react';

// Importar los componentes individuales
import { CostCalculator } from './costs/CostCalculator';
import { CostAnalysisReports } from './costs/CostAnalysisReports';
import { PricingScenarios } from './costs/PricingScenarios';

interface CostAnalysisModuleProps {
  activeSubSection?: string;
  onSubSectionChange?: (subSection: string) => void;
}

export function CostAnalysisModule({ 
  activeSubSection = 'calculator',
  onSubSectionChange 
}: CostAnalysisModuleProps) {
  const [calculations, setCalculations] = useState([]);

  const renderContent = () => {
    switch (activeSubSection) {
      case 'calculator':
        return (
          <CostCalculator 
            calculations={calculations}
            onCalculationComplete={(newCalc) => setCalculations(prev => [newCalc, ...prev])}
          />
        );
      case 'analysis':
        return <CostAnalysisReports calculations={calculations} />;
      case 'scenarios':
        return <PricingScenarios calculations={calculations} />;
      default:
        return <CostCalculator calculations={calculations} onCalculationComplete={(newCalc) => setCalculations(prev => [newCalc, ...prev])} />;
    }
  };

  return (
    <VStack gap={6} align="stretch">
      {renderContent()}
    </VStack>
  );
}