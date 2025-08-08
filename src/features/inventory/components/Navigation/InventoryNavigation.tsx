// src/features/inventory/components/Navigation/InventoryNavigation.tsx
// Navegación estandarizada para módulo de Inventory

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Breadcrumb,
  Card
} from '@chakra-ui/react';
import {
  CubeIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentIcon,
  PlusIcon,
  ChevronRightIcon,
  HomeIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';

interface InventoryNavigationProps {
  currentSection: string;
  currentSubSection?: string;
  onSectionChange: (section: string, subSection?: string) => void;
  alertsCount?: number;
}

const navigationSections = {
  items: {
    label: 'Gestión de Items',
    icon: CubeIcon,
    color: 'blue',
    description: 'Gestión moderna de items con nuevo modelo de tipos'
  },
  stock: {
    label: 'Control de Stock',
    icon: ScaleIcon,
    color: 'green',
    description: 'Ajustes de stock y movimientos',
    subSections: {
      adjustments: { label: 'Ajustes', description: 'Ajustar cantidades de stock' },
      movements: { label: 'Movimientos', description: 'Historial de cambios' },
      transfers: { label: 'Transferencias', description: 'Transferencias entre ubicaciones' }
    }
  },
  alerts: {
    label: 'Alertas de Stock',
    icon: ExclamationTriangleIcon,
    color: 'red',
    description: 'Monitoreo de stock crítico y bajo'
  },
  reports: {
    label: 'Reportes',
    icon: ClipboardDocumentIcon,
    color: 'purple',
    description: 'Reportes y análisis de inventario',
    subSections: {
      valuation: { label: 'Valorización', description: 'Valor total del inventario' },
      turnover: { label: 'Rotación', description: 'Análisis de rotación de stock' },
      forecast: { label: 'Previsiones', description: 'Predicción de demanda' }
    }
  }
};

export function InventoryNavigation({ 
  currentSection, 
  currentSubSection, 
  onSectionChange,
  alertsCount = 0
}: InventoryNavigationProps) {
  const currentSectionData = navigationSections[currentSection];
  
  return (
    <VStack gap={4} align="stretch">
      {/* Breadcrumb */}
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link onClick={() => onSectionChange('items')}>
              <HomeIcon className="w-4 h-4" />
              Inventario
            </Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator>
            <ChevronRightIcon className="w-3 h-3" />
          </Breadcrumb.Separator>
          <Breadcrumb.Item>
            <Breadcrumb.CurrentPage>
              {currentSectionData?.label}
            </Breadcrumb.CurrentPage>
          </Breadcrumb.Item>
          {currentSubSection && (
            <>
              <Breadcrumb.Separator>
                <ChevronRightIcon className="w-3 h-3" />
              </Breadcrumb.Separator>
              <Breadcrumb.Item>
                <Breadcrumb.CurrentPage>
                  {currentSectionData.subSections?.[currentSubSection]?.label}
                </Breadcrumb.CurrentPage>
              </Breadcrumb.Item>
            </>
          )}
        </Breadcrumb.List>
      </Breadcrumb.Root>

      {/* Section Header */}
      <Card.Root>
        <Card.Body>
          <HStack gap={4}>
            {React.createElement(currentSectionData?.icon || CubeIcon, {
              className: "w-8 h-8",
              style: { color: `var(--chakra-colors-${currentSectionData?.color}-500)` }
            })}
            <VStack align="start" gap={1}>
              <HStack>
                <Text fontSize="xl" fontWeight="bold">
                  {currentSectionData?.label}
                </Text>
                {currentSection === 'items' && (
                  <Badge colorPalette="blue" variant="subtle">
                    Tipos Modernos
                  </Badge>
                )}
                {currentSection === 'alerts' && alertsCount > 0 && (
                  <Badge colorPalette="red" variant="solid">
                    {alertsCount}
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
EOF < /dev/null
