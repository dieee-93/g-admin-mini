// src/features/products/ui/CostAnalysisModule.tsx
// Módulo de Análisis de Costos - USANDO NUEVO DESIGN SYSTEM COMPONENT

import React from 'react';
import { CostAnalysisTab } from './CostAnalysisTab';

interface CostAnalysisModuleProps {
  activeSubSection?: string;
  onSubSectionChange?: (subSection: string) => void;
}

export function CostAnalysisModule({ 
  activeSubSection = 'calculator',
  onSubSectionChange 
}: CostAnalysisModuleProps) {
  
  return <CostAnalysisTab />;
}