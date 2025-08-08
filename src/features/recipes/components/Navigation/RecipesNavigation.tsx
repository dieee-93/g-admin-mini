// src/features/recipes/components/Navigation/RecipesNavigation.tsx
// Navegación estandarizada para módulo de Recipes

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
  BookOpenIcon,
  ChartBarIcon,
  CogIcon,
  BeakerIcon,
  ChevronRightIcon,
  HomeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface RecipesNavigationProps {
  currentSection: string;
  currentSubSection?: string;
  onSectionChange: (section: string, subSection?: string) => void;
}

const navigationSections = {
  intelligence: {
    label: 'Recipe Intelligence',
    icon: ChartBarIcon,
    color: 'blue',
    description: 'Smart cost calculation + Menu engineering',
    subSections: {
      dashboard: { label: 'Dashboard', description: 'Overview y métricas clave' },
      costAnalysis: { label: 'Análisis de Costos', description: 'Análisis detallado de costos' },
      menuEngineering: { label: 'Menu Engineering', description: 'Optimización de rentabilidad' }
    }
  },
  builder: {
    label: 'Quick Builder',
    icon: BeakerIcon,
    color: 'purple',
    description: 'AI-powered recipe creation'
  },
  classic: {
    label: 'Gestión de Recetas',
    icon: BookOpenIcon,
    color: 'green',
    description: 'Traditional recipe management'
  },
  calculator: {
    label: 'Calculadora de Costos',
    icon: CurrencyDollarIcon,
    color: 'orange',
    description: 'Real-time cost calculation tools'
  }
};

export function RecipesNavigation({ 
  currentSection, 
  currentSubSection, 
  onSectionChange 
}: RecipesNavigationProps) {
  const currentSectionData = navigationSections[currentSection];
  
  return (
    <VStack gap={4} align="stretch">
      {/* Breadcrumb */}
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link onClick={() => onSectionChange('intelligence')}>
              <HomeIcon className="w-4 h-4" />
              Recipes
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
            {React.createElement(currentSectionData?.icon || BookOpenIcon, {
              className: "w-8 h-8",
              style: { color: `var(--chakra-colors-${currentSectionData?.color}-500)` }
            })}
            <VStack align="start" gap={1}>
              <HStack>
                <Text fontSize="xl" fontWeight="bold">
                  {currentSectionData?.label}
                </Text>
                {currentSection === 'intelligence' && (
                  <Badge colorPalette="green" variant="subtle">
                    v3.0
                  </Badge>
                )}
                {currentSection === 'builder' && (
                  <Badge colorPalette="purple" variant="subtle">
                    AI
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
