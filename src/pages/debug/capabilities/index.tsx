/**
 * Capabilities Debug Page v4.0 - Management Panel
 * 
 * Panel de control para gestionar Business Capabilities e Infrastructure.
 * Conectado con CapabilityStore v4.0 (Atomic System)
 */

import React, { useState } from 'react';
import {
  ContentLayout,
  Section,
  Box,
  Text,
  Stack,
  Button,
  Badge,
  Grid,
  Heading,
  CardWrapper,
  Separator
} from '@/shared/ui';
import { useCapabilityStore } from '@/store/capabilityStore';
import { useShallow } from 'zustand/react/shallow';
import { 
  BUSINESS_CAPABILITIES_REGISTRY,
  INFRASTRUCTURE_REGISTRY,
  type BusinessCapabilityId,
  type InfrastructureId
} from '@/config/BusinessModelRegistry';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { logger } from '@/lib/logging';

export default function CapabilitiesDebugPage() {
  const profile = useCapabilityStore(state => state.profile);
  const toggleCapability = useCapabilityStore(state => state.toggleCapability);
  const setInfrastructure = useCapabilityStore(state => state.setInfrastructure);
  const activeFeatures = useCapabilityStore(state => state.features.activeFeatures);
  // ⚡ PERFORMANCE: useShallow prevents re-renders when array content is same but reference changes
  const activeModules = useCapabilityStore(useShallow(state => state.getActiveModules()));
  const loadFromDB = useCapabilityStore(state => state.loadFromDB);
  const saveToDB = useCapabilityStore(state => state.saveToDB);

  const [expandedCapability, setExpandedCapability] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const selectedCapabilities = profile?.selectedCapabilities || [];
  const selectedInfrastructure = profile?.selectedInfrastructure || [];

  const handleToggleCapability = (capId: BusinessCapabilityId) => {
    toggleCapability(capId);
  };

  const handleToggleInfrastructure = (infraId: InfrastructureId) => {
    setInfrastructure(infraId);
  };

  const getCategoryColor = (type: string): 'blue' | 'gray' | 'purple' | 'green' | 'orange' | 'cyan' | 'pink' | 'red' | 'teal' | 'yellow' => {
    const colors: Record<string, 'blue' | 'gray' | 'purple' | 'green' | 'orange' | 'cyan' | 'pink' | 'red' | 'teal' | 'yellow'> = {
      fulfillment: 'blue',
      production: 'purple',
      service_mode: 'green',
      special_operation: 'orange',
      infrastructure: 'cyan'
    };
    return colors[type] || 'gray';
  };

  return (
    <ContentLayout spacing="normal">
      {/* Header */}
      <Section variant="flat">
        <Stack gap="4">
          <Box>
            <Heading size="xl">🎯 Capabilities System Debugger v4.0</Heading>
            <Text color="fg.muted" mt="2">
              Gestiona Business Capabilities e Infrastructure. Los cambios se guardan automáticamente.
            </Text>
          </Box>

          {/* System Stats */}
          <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap="4">
            <CardWrapper>
              <CardWrapper.Body>
                <Text fontSize="sm" color="fg.muted">Capabilities Activas</Text>
                <Text fontSize="2xl" fontWeight="bold">{selectedCapabilities.length}</Text>
              </CardWrapper.Body>
            </CardWrapper>
            
            <CardWrapper>
              <CardWrapper.Body>
                <Text fontSize="sm" color="fg.muted">Features Activas</Text>
                <Text fontSize="2xl" fontWeight="bold">{activeFeatures.length}</Text>
              </CardWrapper.Body>
            </CardWrapper>

            <CardWrapper>
              <CardWrapper.Body>
                <Text fontSize="sm" color="fg.muted">Módulos Activos</Text>
                <Text fontSize="2xl" fontWeight="bold">{activeModules.length}</Text>
              </CardWrapper.Body>
            </CardWrapper>

            <CardWrapper>
              <CardWrapper.Body>
                <Text fontSize="sm" color="fg.muted">Infrastructure</Text>
                <Text fontSize="2xl" fontWeight="bold">{selectedInfrastructure.length}</Text>
              </CardWrapper.Body>
            </CardWrapper>
          </Grid>
        </Stack>
      </Section>

      {/* Business Capabilities Section */}
      <Section variant="elevated" title="🏪 Business Capabilities">
        <Stack gap="3">
          <Text color="fg.muted" fontSize="sm">
            Las capabilities definen QUÉ hace tu negocio. Cada una activa múltiples features automáticamente.
          </Text>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="4">
            {Object.values(BUSINESS_CAPABILITIES_REGISTRY).map((capability) => {
              const isActive = selectedCapabilities.includes(capability.id);
              const isExpanded = expandedCapability === capability.id;

              return (
                <CardWrapper 
                  key={capability.id}
                  borderColor={isActive ? 'colorPalette.500' : 'border'}
                  borderWidth={isActive ? '2px' : '1px'}
                  colorPalette={getCategoryColor(capability.type)}
                >
                  <CardWrapper.Body>
                    <Stack gap="3">
                      {/* Header */}
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box flex="1">
                          <Box display="flex" alignItems="center" gap="2" mb="1">
                            <Text fontSize="2xl">{capability.icon}</Text>
                            <Text fontWeight="bold">{capability.name}</Text>
                          </Box>
                          <Text fontSize="sm" color="fg.muted">
                            {capability.description}
                          </Text>
                        </Box>

                        <Button
                          size="sm"
                          colorPalette={isActive ? 'green' : 'gray'}
                          onClick={() => handleToggleCapability(capability.id)}
                        >
                          {isActive ? <CheckIcon width={16} /> : <XMarkIcon width={16} />}
                        </Button>
                      </Box>

                      {/* Category Badge */}
                      <Box>
                        <Badge colorPalette={getCategoryColor(capability.type)}>
                          {capability.type.replace('_', ' ')}
                        </Badge>
                      </Box>

                      {/* Features Count */}
                      <Box>
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => setExpandedCapability(isExpanded ? null : capability.id)}
                        >
                          {isExpanded ? '▼' : '▶'} {capability.activatesFeatures.length} features
                        </Button>

                        {isExpanded && (
                          <Box mt="2" p="3" bg="bg.muted" borderRadius="md">
                            <Stack gap="1">
                              {capability.activatesFeatures.map((featureId) => (
                                <Text key={featureId} fontSize="xs" fontFamily="mono">
                                  • {featureId}
                                </Text>
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </Box>

                      {/* Blocking Requirements */}
                      {capability.blockingRequirements && capability.blockingRequirements.length > 0 && (
                        <Box>
                          <Text fontSize="xs" color="orange.500" fontWeight="bold">
                            ⚠️ Requiere: {capability.blockingRequirements.join(', ')}
                          </Text>
                        </Box>
                      )}
                    </Stack>
                  </CardWrapper.Body>
                </CardWrapper>
              );
            })}
          </Grid>
        </Stack>
      </Section>

      <Separator />

      {/* Infrastructure Section */}
      <Section variant="elevated" title="🏗️ Infrastructure">
        <Stack gap="3">
          <Text color="fg.muted" fontSize="sm">
            La infraestructura define DÓNDE opera tu negocio (locales físicos, online, móvil).
          </Text>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap="4">
            {Object.values(INFRASTRUCTURE_REGISTRY).map((infra) => {
              const isActive = selectedInfrastructure.includes(infra.id);

              return (
                <CardWrapper 
                  key={infra.id}
                  borderColor={isActive ? 'blue.500' : 'border'}
                  borderWidth={isActive ? '2px' : '1px'}
                  colorPalette="blue"
                >
                  <CardWrapper.Body>
                    <Stack gap="3">
                      {/* Header */}
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box flex="1">
                          <Box display="flex" alignItems="center" gap="2" mb="1">
                            <Text fontSize="2xl">{infra.icon}</Text>
                            <Text fontWeight="bold">{infra.name}</Text>
                          </Box>
                          <Text fontSize="sm" color="fg.muted">
                            {infra.description}
                          </Text>
                        </Box>

                        <Button
                          size="sm"
                          colorPalette={isActive ? 'green' : 'gray'}
                          onClick={() => handleToggleInfrastructure(infra.id)}
                        >
                          {isActive ? <CheckIcon width={16} /> : <XMarkIcon width={16} />}
                        </Button>
                      </Box>

                      {/* Conflicts */}
                      {infra.conflicts && infra.conflicts.length > 0 && (
                        <Box>
                          <Text fontSize="xs" color="red.500">
                            ⚠️ Conflictos: {infra.conflicts.join(', ')}
                          </Text>
                        </Box>
                      )}

                      {/* Features */}
                      {infra.activatesFeatures.length > 0 && (
                        <Box>
                          <Text fontSize="xs" color="fg.muted">
                            +{infra.activatesFeatures.length} features adicionales
                          </Text>
                        </Box>
                      )}
                    </Stack>
                  </CardWrapper.Body>
                </CardWrapper>
              );
            })}
          </Grid>
        </Stack>
      </Section>

      <Separator />

      {/* Active Features Summary with Analysis */}
      <Section variant="elevated" title="✨ Features Activas & Análisis">
        <Stack gap="3">
          <Text color="fg.muted" fontSize="sm">
            Features activadas automáticamente por las capabilities seleccionadas:
          </Text>

          {activeFeatures.length === 0 ? (
            <Box p="6" textAlign="center" bg="bg.muted" borderRadius="md">
              <Text color="fg.muted">
                No hay features activas. Selecciona algunas capabilities arriba.
              </Text>
            </Box>
          ) : (
            <>
              <Box p="4" bg="bg.muted" borderRadius="md" maxH="400px" overflowY="auto">
                <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap="2">
                  {activeFeatures.map((featureId) => (
                    <Badge key={featureId} size="sm" colorPalette="blue">
                      {featureId}
                    </Badge>
                  ))}
                </Grid>
              </Box>

              {/* Feature Origin Analysis */}
              <CardWrapper variant="elevated">
                <CardWrapper.Header>
                  <Heading size="sm">🔬 Análisis de Origen de Features</Heading>
                </CardWrapper.Header>
                <CardWrapper.Body>
                  <Stack gap="3">
                    <Text fontSize="sm" color="fg.muted">
                      Muestra qué capability activó cada feature (útil para detectar duplicados)
                    </Text>

                    {(() => {
                      // Build feature origin map
                      const featureOrigins = new Map<string, string[]>();

                      selectedCapabilities.forEach(capId => {
                        const cap = Object.values(BUSINESS_CAPABILITIES_REGISTRY).find(c => c.id === capId);
                        if (cap) {
                          cap.activatesFeatures.forEach((featureId: string) => {
                            if (!featureOrigins.has(featureId)) {
                              featureOrigins.set(featureId, []);
                            }
                            featureOrigins.get(featureId)!.push(cap.name);
                          });
                        }
                      });

                      selectedInfrastructure.forEach(infraId => {
                        const infra = Object.values(INFRASTRUCTURE_REGISTRY).find(i => i.id === infraId);
                        if (infra) {
                          infra.activatesFeatures.forEach((featureId: string) => {
                            if (!featureOrigins.has(featureId)) {
                              featureOrigins.set(featureId, []);
                            }
                            featureOrigins.get(featureId)!.push(infra.name);
                          });
                        }
                      });

                      // Separate features by origin count
                      const duplicatedFeatures = Array.from(featureOrigins.entries())
                        .filter(([_, origins]) => origins.length > 1)
                        .sort((a, b) => b[1].length - a[1].length);

                      const uniqueFeatures = Array.from(featureOrigins.entries())
                        .filter(([_, origins]) => origins.length === 1);

                      return (
                        <Stack gap="4">
                          {duplicatedFeatures.length > 0 && (
                            <Box>
                              <Text fontWeight="bold" fontSize="sm" mb="2">
                                🔄 Features Compartidas ({duplicatedFeatures.length}):
                              </Text>
                              <Text fontSize="xs" color="fg.muted" mb="2">
                                Estas features son activadas por múltiples capabilities (se auto-deduplicán con Set)
                              </Text>
                              <Stack gap="2">
                                {duplicatedFeatures.slice(0, 10).map(([featureId, origins]) => (
                                  <Box key={featureId} p="2" bg="whiteAlpha.100" borderRadius="md" borderLeft="3px solid" borderColor="orange.500">
                                    <Text fontSize="xs" fontFamily="mono" fontWeight="bold">
                                      {featureId}
                                    </Text>
                                    <Text fontSize="xs" color="fg.muted" mt="1">
                                      ← {origins.join(' + ')}
                                    </Text>
                                  </Box>
                                ))}
                                {duplicatedFeatures.length > 10 && (
                                  <Text fontSize="xs" color="fg.muted">
                                    ... y {duplicatedFeatures.length - 10} más
                                  </Text>
                                )}
                              </Stack>
                            </Box>
                          )}

                          <Box>
                            <Text fontWeight="bold" fontSize="sm" mb="2">
                              ✅ Features Únicas ({uniqueFeatures.length}):
                            </Text>
                            <Text fontSize="xs" color="fg.muted" mb="2">
                              Activadas por una sola capability
                            </Text>
                            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="2">
                              {uniqueFeatures.slice(0, 20).map(([featureId, origins]) => (
                                <Box key={featureId} p="2" bg="whiteAlpha.100" borderRadius="md">
                                  <Text fontSize="xs" fontFamily="mono">
                                    {featureId}
                                  </Text>
                                  <Text fontSize="xs" color="fg.muted">
                                    ← {origins[0]}
                                  </Text>
                                </Box>
                              ))}
                            </Grid>
                            {uniqueFeatures.length > 20 && (
                              <Text fontSize="xs" color="fg.muted" mt="2">
                                ... y {uniqueFeatures.length - 20} más
                              </Text>
                            )}
                          </Box>
                        </Stack>
                      );
                    })()}
                  </Stack>
                </CardWrapper.Body>
              </CardWrapper>
            </>
          )}
        </Stack>
      </Section>

      {/* Active Modules Summary */}
      <Section variant="elevated" title="📦 Módulos Activos">
        <Stack gap="3">
          <Text color="fg.muted" fontSize="sm">
            Módulos de navegación habilitados:
          </Text>

          {activeModules.length === 0 ? (
            <Box p="6" textAlign="center" bg="bg.muted" borderRadius="md">
              <Text color="fg.muted">
                No hay módulos activos.
              </Text>
            </Box>
          ) : (
            <Box p="4" bg="bg.muted" borderRadius="md">
              <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap="2">
                {activeModules.map((moduleId) => (
                  <Badge key={moduleId} size="sm" colorPalette="green">
                    {moduleId}
                  </Badge>
                ))}
              </Grid>
            </Box>
          )}
        </Stack>
      </Section>

      {/* Persistence Debug Section */}
      <Section variant="elevated" title="💾 Persistencia & Sincronización">
        <Stack gap="4">
          <Text color="fg.muted" fontSize="sm">
            Debug de persistencia entre localStorage (Zustand) y Supabase.
          </Text>

          {/* Sync Status */}
          <CardWrapper>
            <CardWrapper.Body>
              <Stack gap="3">
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Text fontWeight="bold">Estado de Sincronización</Text>
                    <Text fontSize="sm" color="fg.muted">
                      {syncStatus === 'idle' && 'Listo para sincronizar'}
                      {syncStatus === 'loading' && 'Sincronizando...'}
                      {syncStatus === 'success' && `Última sync: ${lastSyncTime || 'Hace un momento'}`}
                      {syncStatus === 'error' && 'Error en sincronización'}
                    </Text>
                  </Box>
                  <Badge colorPalette={
                    syncStatus === 'success' ? 'green' : 
                    syncStatus === 'error' ? 'red' : 
                    syncStatus === 'loading' ? 'blue' : 'gray'
                  }>
                    {syncStatus}
                  </Badge>
                </Box>

                <Separator />

                {/* Actions */}
                <Box display="flex" gap="3">
                  <Button
                    size="sm"
                    colorPalette="blue"
                    loading={syncStatus === 'loading'}
                    onClick={async () => {
                      setSyncStatus('loading');
                      try {
                        const loaded = await loadFromDB();
                        setSyncStatus('success');
                        setLastSyncTime(new Date().toLocaleTimeString());
                        logger.info('CapabilitySystem', 'Loaded from DB', { loaded });
                      } catch (error) {
                        setSyncStatus('error');
                        logger.error('CapabilitySystem', 'Load error', { error });
                      }
                    }}
                  >
                    🔄 Cargar desde DB
                  </Button>

                  <Button
                    size="sm"
                    colorPalette="green"
                    loading={syncStatus === 'loading'}
                    onClick={async () => {
                      setSyncStatus('loading');
                      try {
                        await saveToDB();
                        setSyncStatus('success');
                        setLastSyncTime(new Date().toLocaleTimeString());
                        logger.info('CapabilitySystem', 'Saved to DB');
                      } catch (error) {
                        setSyncStatus('error');
                        logger.error('CapabilitySystem', 'Save error', { error });
                      }
                    }}
                  >
                    💾 Guardar en DB
                  </Button>

                  <Button
                    size="sm"
                    colorPalette="purple"
                    onClick={() => {
                      const stored = localStorage.getItem('capability-store-v4');
                      const parsed = stored ? JSON.parse(stored) : null;
                      logger.info('CapabilitySystem', 'localStorage data', { parsed });
                      logger.info('CapabilitySystem', 'Current store state', {
                        capabilities: selectedCapabilities,
                        infrastructure: selectedInfrastructure
                      });
                      
                      // Show in UI
                      alert(`LocalStorage:\n${JSON.stringify(parsed?.state?.profile?.selectedCapabilities || [], null, 2)}\n\nCurrent State:\n${JSON.stringify(selectedCapabilities, null, 2)}`);
                    }}
                  >
                    🔍 Ver localStorage
                  </Button>

                  <Button
                    size="sm"
                    colorPalette="orange"
                    onClick={() => {
                      // Force save current state to localStorage
                      const currentState = useCapabilityStore.getState();
                      localStorage.setItem('capability-store-v4', JSON.stringify({
                        state: currentState,
                        version: 4
                      }));
                      logger.info('CapabilitySystem', 'Force saved to localStorage', { 
                        selectedCapabilities: currentState.profile?.selectedCapabilities 
                      });
                      alert('✅ Estado actual guardado forzosamente en localStorage');
                    }}
                  >
                    🔧 Forzar guardado local
                  </Button>
                </Box>
              </Stack>
            </CardWrapper.Body>
          </CardWrapper>

          {/* Current State Preview */}
          <CardWrapper>
            <CardWrapper.Body>
              <Stack gap="3">
                <Text fontWeight="bold">Estado Actual en Memoria</Text>
                <Box p="4" bg="bg.muted" borderRadius="md" fontSize="sm" fontFamily="mono">
                  <Text>Business Name: {profile?.businessName || 'Not set'}</Text>
                  <Text>Capabilities: {selectedCapabilities.length} seleccionadas</Text>
                  <Text>Infrastructure: {selectedInfrastructure.join(', ') || 'None'}</Text>
                  <Text>Setup Completed: {profile?.setupCompleted ? 'Yes' : 'No'}</Text>
                  <Text>Active Modules: {activeModules.length}</Text>
                </Box>
              </Stack>
            </CardWrapper.Body>
          </CardWrapper>
        </Stack>
      </Section>
    </ContentLayout>
  );
}