/**
 * MarginCalculatorWidget - Dashboard Widget wrapper
 *
 * Provides Markup vs Margin calculator as a dashboard widget
 * Helps users understand the critical difference between markup and margin
 */

import React from 'react';
import { MarginCalculator } from '@/components/calculators/MarginCalculator';

export const MarginCalculatorWidget: React.FC = () => {
  return <MarginCalculator />;
};
