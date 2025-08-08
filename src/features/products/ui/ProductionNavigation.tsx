// src/features/products/ui/ProductionNavigation.tsx
// Navegación mejorada para módulo de Producción

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Card
} from '@chakra-ui/react';
import {
  DocumentTextIcon,
  CogIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';

interface ProductionNavigationProps {
  currentSection: string;
  currentSubSection?: string;
  onSectionChange: (section: string, subSection?: string) => void;
}

const navigationSections: { [key: string]: any } = {
  products: {
    label: 'Productos',
    icon: DocumentTextIcon,
    color: 'purple',
    description: 'Gestión de productos y componentes'
  },
  production: {
    label: 'Producción Activa',
    icon: CogIcon,
    color: 'green',
    description: 'Monitoreo de producciones en curso'
  },
  costs: {
    label: 'Análisis de Costos',
    icon: CurrencyDollarIcon,
    color: 'blue',
    description: 'Calculadora y análisis de costos',
    subSections: {
      calculator: { label: 'Calculadora', description: 'Calcular costos de producción' },
      analysis: { label: 'Análisis', description: 'Reportes y tendencias' },
      scenarios: { label: 'Escenarios', description: 'Simulaciones de precios' }
    }
  },
  planning: {
    label: 'Planificación',
    icon: ClockIcon,
    color: 'orange',
    description: 'Planificación de producción y calendario'
  }
};

export function ProductionNavigation({ 
  currentSection, 
  currentSubSection, 
  onSectionChange 
}: ProductionNavigationProps) {
  const currentSectionData = navigationSections[currentSection];
  
  return (
    <VStack gap={4} align="stretch">
      {/* Breadcrumb usando el componente existente */}
      <Breadcrumb />

      {/* Section Header */}
      <Card.Root>
        <Card.Body>
          <HStack gap={4}>
            {React.createElement(currentSectionData?.icon || DocumentTextIcon, {
              className: "w-8 h-8",
              style: { color: `var(--chakra-colors-${currentSectionData?.color}-500)` }
            })}
            <VStack align="start" gap={1}>
              <HStack>
                <Text fontSize="xl" fontWeight="bold">
                  {currentSectionData?.label}
                </Text>
                {currentSection === 'products' && (
                  <Badge colorPalette="purple" variant="subtle">
                    Nuevo
                  </Badge>
                )}
              </HStack>
              <Text color="gray.600" fontSize="sm">
                {currentSubSection 
                  ? currentSectionData.subSections?.[currentSubSection]?.description
                  : currentSectionData?.description
                }
              </Text>
            </VStack>
          </HStack>
        </Card.Body>
      </Card.Root>

      {/* Sub-navigation para secciones con subsecciones */}
      {currentSectionData?.subSections && (
        <HStack gap={2} wrap="wrap">
          {Object.entries(currentSectionData.subSections).map(([key, subSection]) => (
            <Button
              key={key}
              size="sm"
              variant={currentSubSection === key ? "solid" : "ghost"}
              colorPalette={currentSectionData.color}
              onClick={() => onSectionChange(currentSection, key)}
            >
              {subSection.label}
            </Button>
          ))}
        </HStack>
      )}
    </VStack>
  );
}