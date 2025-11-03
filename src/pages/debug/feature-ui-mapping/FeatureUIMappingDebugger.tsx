/**
 * FEATURE-TO-UI MAPPING DEBUGGER
 *
 * Herramienta de debug para validar que los componentes UI respondan
 * correctamente a los cambios de features/capabilities.
 *
 * PROPÓSITO:
 * - Detectar componentes que ignoran capabilities
 * - Validar mapeos feature → UI element
 * - Facilitar testing de combinaciones de capabilities
 *
 * USO: /debug/feature-ui-mapping
 */

import React, { useState } from 'react';
import {
  ContentLayout,
  Section,
  Stack,
  Badge,
  Alert,
  SimpleGrid,
  Box
} from '@/shared/ui';
import { useCapabilities } from '@/store/capabilityStore';
import { useLocation } from '@/contexts/LocationContext';

// ============================================
// MAPPING DEFINITIONS
// ============================================

/**
 * Define todos los componentes UI que dependen de capabilities
 *
 * FORMATO:
 * {
 *   componentName: string,
 *   requiredInfrastructure?: InfrastructureId[],
 *   requiredActivities?: BusinessActivityId[],
 *   requiredFeatures?: FeatureId[],
 *   checkVisibility: () => boolean, // Función que verifica si está visible
 *   location: string // Dónde encontrar el componente (para debugging)
 * }
 */
interface UIComponentMapping {
  id: string;
  name: string;
  type: 'infrastructure' | 'activity' | 'feature';
  requiredCapabilities: string[];
  checkVisibility: () => boolean;
  location: string;
  expectedVisible: boolean;
}

export function FeatureUIMappingDebugger() {
  const {
    profile,
    activeFeatures,
    visibleModules
  } = useCapabilities();

  const { isMultiLocationMode, locations } = useLocation() || {
    isMultiLocationMode: false,
    locations: []
  };

  const [filter, setFilter] = useState<'all' | 'mismatched' | 'correct'>('all');

  // ============================================
  // COMPONENT MAPPINGS
  // ============================================

  const componentMappings: UIComponentMapping[] = [
    // Infrastructure-based components
    {
      id: 'location-selector',
      name: 'Location Selector (Sidebar)',
      type: 'infrastructure',
      requiredCapabilities: ['multi_location'],
      checkVisibility: () => isMultiLocationMode,
      location: 'Sidebar.tsx → LocationContext',
      get expectedVisible() {
        return profile?.selectedInfrastructure?.includes('multi_location') && locations.length > 1;
      }
    },

    // Activity-based components
    {
      id: 'delivery-module',
      name: 'Delivery Module',
      type: 'activity',
      requiredCapabilities: ['delivery_shipping'],
      checkVisibility: () => visibleModules.includes('delivery'),
      location: 'Navigation sidebar',
      get expectedVisible() {
        return profile?.selectedActivities?.includes('delivery_shipping') || false;
      }
    },

    {
      id: 'floor-module',
      name: 'Floor Management (Tables)',
      type: 'activity',
      requiredCapabilities: ['onsite_service'],
      checkVisibility: () => visibleModules.includes('floor'),
      location: 'Navigation sidebar',
      get expectedVisible() {
        return profile?.selectedActivities?.includes('onsite_service') || false;
      }
    },

    {
      id: 'kitchen-module',
      name: 'Kitchen Display',
      type: 'activity',
      requiredCapabilities: ['production_workflow'],
      checkVisibility: () => visibleModules.includes('kitchen'),
      location: 'Navigation sidebar',
      get expectedVisible() {
        return profile?.selectedActivities?.includes('production_workflow') || false;
      }
    },

    // Feature-based components
    {
      id: 'sales-module',
      name: 'Sales/POS Module',
      type: 'feature',
      requiredCapabilities: ['sales_order_management'],
      checkVisibility: () => visibleModules.includes('sales'),
      location: 'Navigation sidebar',
      get expectedVisible() {
        return activeFeatures.includes('sales_order_management');
      }
    },

    {
      id: 'staff-module',
      name: 'Staff/HR Module',
      type: 'feature',
      requiredCapabilities: ['staff_employee_management'],
      checkVisibility: () => visibleModules.includes('staff'),
      location: 'Navigation sidebar',
      get expectedVisible() {
        return activeFeatures.includes('staff_employee_management');
      }
    },

    {
      id: 'scheduling-module',
      name: 'Scheduling Module',
      type: 'feature',
      requiredCapabilities: ['staff_shift_management'],
      checkVisibility: () => visibleModules.includes('scheduling'),
      location: 'Navigation sidebar',
      get expectedVisible() {
        return activeFeatures.includes('staff_shift_management');
      }
    }
  ];

  // ============================================
  // ANALYSIS
  // ============================================

  const analysis = componentMappings.map(mapping => {
    const actualVisible = mapping.checkVisibility();
    const expectedVisible = mapping.expectedVisible;
    const isCorrect = actualVisible === expectedVisible;

    return {
      ...mapping,
      actualVisible,
      expectedVisible,
      isCorrect,
      status: isCorrect ? 'correct' : 'mismatch'
    };
  });

  const filteredAnalysis = analysis.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'mismatched') return !item.isCorrect;
    if (filter === 'correct') return item.isCorrect;
    return true;
  });

  const totalComponents = analysis.length;
  const correctMappings = analysis.filter(a => a.isCorrect).length;
  const mismatchedMappings = analysis.filter(a => !a.isCorrect).length;
  const healthScore = Math.round((correctMappings / totalComponents) * 100);

  // ============================================
  // RENDER
  // ============================================

  return (
    <ContentLayout spacing="normal">
      <Section variant="flat" title="Feature-to-UI Mapping Debugger">
        <Stack direction="column" gap="4">
          {/* Header */}
          <Box>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              🔍 Feature-to-UI Mapping Validator
            </h2>
            <p style={{ color: 'gray.600' }}>
              Verifica que todos los componentes UI respondan correctamente a cambios de capabilities
            </p>
          </Box>

          {/* Health Score */}
          <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
            <Box p="4" bg="blue.50" borderRadius="md" borderWidth="1px" borderColor="blue.200">
              <div style={{ fontSize: '0.75rem', color: '#1E40AF', fontWeight: '600' }}>
                Total Components
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1D4ED8' }}>
                {totalComponents}
              </div>
            </Box>

            <Box p="4" bg="green.50" borderRadius="md" borderWidth="1px" borderColor="green.200">
              <div style={{ fontSize: '0.75rem', color: '#065F46', fontWeight: '600' }}>
                Correct Mappings
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#047857' }}>
                {correctMappings}
              </div>
            </Box>

            <Box p="4" bg={mismatchedMappings > 0 ? 'red.50' : 'gray.50'} borderRadius="md" borderWidth="1px" borderColor={mismatchedMappings > 0 ? 'red.200' : 'gray.200'}>
              <div style={{ fontSize: '0.75rem', color: mismatchedMappings > 0 ? '#991B1B' : '#4B5563', fontWeight: '600' }}>
                Mismatched
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: mismatchedMappings > 0 ? '#DC2626' : '#6B7280' }}>
                {mismatchedMappings}
              </div>
            </Box>
          </SimpleGrid>

          {/* Health Alert */}
          {healthScore < 100 && (
            <Alert.Root status="warning">
              <Alert.Indicator />
              <Alert.Title>
                ⚠️ Mapping Issues Detected ({healthScore}% health)
              </Alert.Title>
              <Alert.Description>
                {mismatchedMappings} component(s) are not responding correctly to capability changes.
                Review the mismatched items below.
              </Alert.Description>
            </Alert.Root>
          )}

          {healthScore === 100 && (
            <Alert.Root status="success">
              <Alert.Indicator />
              <Alert.Title>
                ✅ All Mappings Correct (100% health)
              </Alert.Title>
              <Alert.Description>
                All UI components are correctly synchronized with capabilities!
              </Alert.Description>
            </Alert.Root>
          )}

          {/* Filter */}
          <Stack direction="row" gap="2">
            <Badge
              size="lg"
              colorPalette={filter === 'all' ? 'blue' : 'gray'}
              cursor="pointer"
              onClick={() => setFilter('all')}
            >
              All ({totalComponents})
            </Badge>
            <Badge
              size="lg"
              colorPalette={filter === 'correct' ? 'green' : 'gray'}
              cursor="pointer"
              onClick={() => setFilter('correct')}
            >
              Correct ({correctMappings})
            </Badge>
            <Badge
              size="lg"
              colorPalette={filter === 'mismatched' ? 'red' : 'gray'}
              cursor="pointer"
              onClick={() => setFilter('mismatched')}
            >
              Mismatched ({mismatchedMappings})
            </Badge>
          </Stack>

          {/* Results Table */}
          <Box overflowX="auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                    Component
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                    Type
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>
                    Required
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>
                    Expected
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>
                    Actual
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAnalysis.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid #F3F4F6',
                      backgroundColor: item.isCorrect ? '#F0FDF4' : '#FEF2F2'
                    }}
                  >
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '500' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{item.location}</div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Badge size="sm" colorPalette={
                        item.type === 'infrastructure' ? 'purple' :
                        item.type === 'activity' ? 'blue' : 'green'
                      }>
                        {item.type}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px', fontSize: '0.875rem' }}>
                      {item.requiredCapabilities.join(', ')}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <Badge size="sm" colorPalette={item.expectedVisible ? 'green' : 'gray'}>
                        {item.expectedVisible ? 'Visible' : 'Hidden'}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <Badge size="sm" colorPalette={item.actualVisible ? 'green' : 'gray'}>
                        {item.actualVisible ? 'Visible' : 'Hidden'}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {item.isCorrect ? (
                        <Badge size="sm" colorPalette="green">✓ OK</Badge>
                      ) : (
                        <Badge size="sm" colorPalette="red">✗ MISMATCH</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>

          {/* Instructions */}
          <Alert.Root status="info">
            <Alert.Indicator />
            <Alert.Title>💡 How to Use</Alert.Title>
            <Alert.Description>
              <ol style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                <li>Go to <strong>/debug/capabilities</strong> and toggle capabilities ON/OFF</li>
                <li>Come back here and check if "Actual" matches "Expected"</li>
                <li>If there's a mismatch, the component is not reading from CapabilityStore correctly</li>
                <li>Fix by making the component subscribe to the correct capability/feature</li>
              </ol>
            </Alert.Description>
          </Alert.Root>
        </Stack>
      </Section>
    </ContentLayout>
  );
}

export default FeatureUIMappingDebugger;
