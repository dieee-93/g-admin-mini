// src/features/customers/components/CustomerNavigation.tsx
// Navegación estandarizada para módulo de Customers

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
  UsersIcon,
  ChartBarIcon,
  DocumentTextIcon,
  PlusIcon,
  ChevronRightIcon,
  HomeIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

interface CustomerNavigationProps {
  currentSection: string;
  currentSubSection?: string;
  onSectionChange: (section: string, subSection?: string) => void;
}

const navigationSections = {
  management: {
    label: 'Gestión de Clientes',
    icon: UsersIcon,
    color: 'pink',
    description: 'Agregar, editar y gestionar clientes'
  },
  analytics: {
    label: 'Análisis de Clientes',
    icon: ChartBarIcon,
    color: 'blue',
    description: 'RFM, segmentación y analytics',
    subSections: {
      rfm: { label: 'Análisis RFM', description: 'Recency, Frequency, Monetary analysis' },
      segments: { label: 'Segmentación', description: 'Grupos y comportamiento' },
      churn: { label: 'Riesgo de Abandono', description: 'Identificar clientes en riesgo' }
    }
  },
  orders: {
    label: 'Historial de Pedidos',
    icon: DocumentTextIcon,
    color: 'green',
    description: 'Historial de compras y pedidos por cliente'
  },
  loyalty: {
    label: 'Programa de Lealtad',
    icon: CreditCardIcon,
    color: 'purple',
    description: 'Gestión de puntos y recompensas'
  }
};

export function CustomerNavigation({ 
  currentSection, 
  currentSubSection, 
  onSectionChange 
}: CustomerNavigationProps) {
  const currentSectionData = navigationSections[currentSection];
  
  return (
    <VStack gap={4} align="stretch">
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link onClick={() => onSectionChange('management')}>
              <HomeIcon className="w-4 h-4" />
              Clientes
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

      <Card.Root>
        <Card.Body>
          <HStack gap={4}>
            {React.createElement(currentSectionData?.icon || UsersIcon, {
              className: "w-8 h-8",
              style: { color: `var(--chakra-colors-${currentSectionData?.color}-500)` }
            })}
            <VStack align="start" gap={1}>
              <HStack>
                <Text fontSize="xl" fontWeight="bold">
                  {currentSectionData?.label}
                </Text>
                {currentSection === 'analytics' && (
                  <Badge colorPalette="blue" variant="subtle">
                    RFM
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
