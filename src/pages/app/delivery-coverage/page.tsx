/**
 * Delivery Coverage Page
 * 
 * Public page for customers to check delivery coverage and validate addresses
 */

import { useState } from 'react';
import { ContentLayout, Section, Stack, Text, Tabs, Spinner, Alert } from '@/shared/ui';
import { DeliveryCoverageMap, DeliveryChecker } from './components';
import { usePublicDeliveryZones } from '@/modules/delivery/hooks/useDeliveryZones';
import { useLocation } from '@/contexts/LocationContext';

export default function DeliveryCoveragePage() {
  const { isMultiLocationMode, selectedLocation } = useLocation();
  const [activeTab, setActiveTab] = useState('map');

  // Fetch public zones - filter by selected location if multi-location
  const { zones, loading, error } = usePublicDeliveryZones(
    isMultiLocationMode ? selectedLocation?.id : undefined
  );

  return (
    <ContentLayout spacing="normal" mainLabel="Delivery Coverage">
      {/* Header */}
      <Section variant="flat">
        <Stack gap="2">
          <Stack direction="row" align="center" gap="2">
            <span style={{ fontSize: '2rem' }}>🚚</span>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
              Cobertura de Delivery
            </h1>
          </Stack>
          <p style={{ color: 'var(--chakra-colors-gray-600)' }}>
            Verifica si realizamos entregas en tu zona y conoce los costos de envío
          </p>
        </Stack>
      </Section>

      {/* Error State */}
      {error && (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Stack gap="1">
            <Alert.Title>Error al cargar zonas de cobertura</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Stack>
        </Alert.Root>
      )}

      {/* Loading State */}
      {loading && (
        <Stack py="20" align="center" justify="center">
          <Spinner size="xl" colorPalette="blue" />
          <Text color="gray.600">Cargando zonas de cobertura...</Text>
        </Stack>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <Section variant="elevated">
          <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value)}>
            <Tabs.List>
              <Tabs.Trigger value="map">
                🗺️ Ver Mapa
              </Tabs.Trigger>
              <Tabs.Trigger value="check">
                ✅ Verificar Dirección
              </Tabs.Trigger>
            </Tabs.List>

            {/* Map Tab */}
            <Tabs.Content value="map">
              <Stack gap="md" py="md">
                {zones.length === 0 ? (
                  <Alert.Root status="info">
                    <Alert.Indicator />
                    <Stack gap="1">
                      <Alert.Title>Sin zonas configuradas</Alert.Title>
                      <Alert.Description>
                        Actualmente no hay zonas de delivery configuradas.
                        Vuelve pronto para ver nuestras áreas de cobertura.
                      </Alert.Description>
                    </Stack>
                  </Alert.Root>
                ) : (
                  <>
                    <Text fontSize="sm" color="gray.600">
                      Haz clic en las áreas coloreadas para ver información detallada de cada zona
                    </Text>
                    <DeliveryCoverageMap
                      zones={zones}
                      height="600px"
                      showLegend={true}
                    />
                  </>
                )}
              </Stack>
            </Tabs.Content>

            {/* Address Checker Tab */}
            <Tabs.Content value="check">
              <Stack gap="md" py="md">
                <DeliveryChecker
                  locationId={isMultiLocationMode ? selectedLocation?.id : undefined}
                />

                {/* Additional Info */}
                <Section variant="flat">
                  <Stack gap="sm">
                    <Text fontWeight="semibold" fontSize="md">
                      ¿Cómo funciona el delivery?
                    </Text>
                    <Stack gap="xs" fontSize="sm" color="gray.700">
                      <Text>
                        <strong>1. Verificá tu dirección:</strong> Ingresá tu dirección para confirmar que realizamos entregas en tu zona.
                      </Text>
                      <Text>
                        <strong>2. Revisá los costos:</strong> Cada zona tiene un costo de envío y tiempo estimado específico.
                      </Text>
                      <Text>
                        <strong>3. Realizá tu pedido:</strong> Si estás en nuestra zona de cobertura, podés proceder con tu compra.
                      </Text>
                    </Stack>
                  </Stack>
                </Section>
              </Stack>
            </Tabs.Content>
          </Tabs.Root>
        </Section>
      )}
    </ContentLayout>
  );
}
