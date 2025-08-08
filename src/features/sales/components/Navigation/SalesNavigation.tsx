// src/features/sales/components/Navigation/SalesNavigation.tsx
// Navegación estandarizada para módulo de Sales

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
  CreditCardIcon,
  TableCellsIcon,
  ChartBarIcon,
  QrCodeIcon,
  ClipboardDocumentListIcon,
  ChevronRightIcon,
  HomeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface SalesNavigationProps {
  currentSection: string;
  currentSubSection?: string;
  onSectionChange: (section: string, subSection?: string) => void;
}

const navigationSections = {
  pos: {
    label: 'Point of Sale',
    icon: CreditCardIcon,
    color: 'blue',
    description: 'Process sales with stock validation'
  },
  tables: {
    label: 'Table Management',
    icon: TableCellsIcon,
    color: 'green',
    description: 'Visual floor plan and table management'
  },
  kitchen: {
    label: 'Kitchen Display',
    icon: ClipboardDocumentListIcon,
    color: 'orange',
    description: 'Real-time kitchen order management'
  },
  qr: {
    label: 'QR Ordering',
    icon: QrCodeIcon,
    color: 'purple',
    description: 'Generate QR codes for tableside ordering'
  },
  analytics: {
    label: 'Sales Intelligence',
    icon: ChartBarIcon,
    color: 'teal',
    description: 'Advanced analytics and business insights',
    subSections: {
      dashboard: { label: 'Dashboard', description: 'Overview and key metrics' },
      reports: { label: 'Reportes', description: 'Detailed sales reports' },
      trends: { label: 'Tendencias', description: 'Sales trends and forecasting' }
    }
  }
};

export function SalesNavigation({ 
  currentSection, 
  currentSubSection, 
  onSectionChange 
}: SalesNavigationProps) {
  const currentSectionData = navigationSections[currentSection];
  
  return (
    <VStack gap={4} align="stretch">
      {/* Breadcrumb */}
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link onClick={() => onSectionChange('pos')}>
              <HomeIcon className="w-4 h-4" />
              POS System
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
            {React.createElement(currentSectionData?.icon || CreditCardIcon, {
              className: "w-8 h-8",
              style: { color: `var(--chakra-colors-${currentSectionData?.color}-500)` }
            })}
            <VStack align="start" gap={1}>
              <HStack>
                <Text fontSize="xl" fontWeight="bold">
                  {currentSectionData?.label}
                </Text>
                {currentSection === 'pos' && (
                  <Badge colorPalette="green" variant="subtle">
                    Live
                  </Badge>
                )}
                {currentSection === 'analytics' && (
                  <Badge colorPalette="teal" variant="subtle">
                    v3.0
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
