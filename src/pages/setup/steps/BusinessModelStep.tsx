/**
 * BUSINESS MODEL STEP - v6.0 REORGANIZED
 *
 * Nuevo diseño de 4 secciones:
 * 1. ¿Qué ofreces? (Business Model)
 * 2. ¿Cómo entregas? (Fulfillment Methods)
 * 3. ¿Dónde operás? (Infrastructure)
 * 4. Potenciá tu negocio (Add-ons)
 *
 * Auto-activación de Production y Scheduling según selección.
 *
 * @version 6.0.0 - Reorganized Capability Taxonomy
 */

import React from 'react';
import { ContentLayout, Section, Stack, Button, Badge, Heading, Text } from '@/shared/ui';
import {
  useBusinessProfile,
  useToggleCapability,
  useInitializeProfile,
  useCompleteSetup,
  useUpdateProfile
} from '@/lib/capabilities';
import { useNavigationActions } from '@/contexts/NavigationContext';
import { toggleInfrastructure as toggleInfraHelper } from '@/lib/capabilities';
import {
  getAllCapabilities,
  getAllInfrastructures
} from '@/config/BusinessModelRegistry';
import type { BusinessCapabilityId, InfrastructureId } from '@/config/BusinessModelRegistry';

// ============================================
// NUEVA TAXONOMÍA DE CAPABILITIES
// ============================================

// Sección 1: ¿Qué ofreces? (Core Business Model)
const BUSINESS_MODELS: BusinessCapabilityId[] = [
  'physical_products',           // 🍕 Productos físicos (auto-activa production)
  'professional_services',       // 👨‍⚕️ Servicios profesionales (auto-activa scheduling)
  'asset_rental',                // 🔑 Alquiler de activos
  'membership_subscriptions',    // 💳 Membresías y suscripciones
  'digital_products'             // 💾 Productos digitales
];

// Sección 2: ¿Cómo entregas? (Fulfillment Methods)
const FULFILLMENT_METHODS: BusinessCapabilityId[] = [
  'onsite_service',              // En mi local
  'pickup_orders',               // Retiro en local
  'delivery_shipping'            // Envío a domicilio
  // ❌ ELIMINADO: 'appointment_based' (se auto-activa con services/rentals/memberships)
];

// Sección 3: ¿Dónde operás? (Infrastructure)
// Nota: fixed_location y multi_location serán capabilities nuevas
// Por ahora usamos las infrastructure existentes
const INFRASTRUCTURE_OPTIONS: InfrastructureId[] = [
  'single_location',             // 🏪 Local fijo (multi_location se muestra anidado)
  'mobile_business'              // 🚚 Operaciones móviles
  // ❌ ELIMINADO: 'online_only' (redundante)
  // ❌ multi_location se muestra como sub-opción de single_location
];

// Sección 4: Potenciá tu negocio (Add-ons)
const ADD_ONS: BusinessCapabilityId[] = [
  'async_operations',                // 🛒 E-commerce (será renombrado a ecommerce_store)
  'corporate_sales'              // 🏢 Ventas B2B
];

export default function BusinessModelStep() {
  const { navigate } = useNavigationActions();
  
  // TanStack Query hooks (v5 migration)
  const { profile, isLoading } = useBusinessProfile();
  const { toggleCapability } = useToggleCapability();
  const { initializeProfile } = useInitializeProfile();
  const { completeSetup } = useCompleteSetup();
  const { updateProfile } = useUpdateProfile();

  // Obtener capabilities completas del registry
  const ALL_CAPABILITIES = getAllCapabilities();
  const ALL_INFRASTRUCTURE = getAllInfrastructures();

  // Initialize profile if not exists
  React.useEffect(() => {
    if (!profile && !isLoading) {
      initializeProfile({
        businessName: 'Mi Negocio',
        businessType: 'retail',
        email: '',
        phone: '',
        country: 'Argentina',
        currency: 'ARS',
        selectedCapabilities: [],
        selectedInfrastructure: [],
        setupCompleted: false,
        isFirstTimeInDashboard: false,
        onboardingStep: 0
      });
    }
  }, [profile, isLoading, initializeProfile]);

  const handleCapabilityToggle = (capabilityId: BusinessCapabilityId) => {
    toggleCapability(capabilityId);
  };

  const handleInfraToggle = (infraId: InfrastructureId) => {
    if (!profile) return;

    // Use helper function to toggle infrastructure
    const newInfra = toggleInfraHelper(
      profile.selectedInfrastructure || [],
      infraId
    );

    // Update profile with new infrastructure
    updateProfile({
      selectedInfrastructure: newInfra
    });
  };

  const handleContinue = () => {
    completeSetup();
    navigate('dashboard');
  };

  const isCapabilitySelected = (id: BusinessCapabilityId) => profile?.selectedCapabilities.includes(id) ?? false;
  const isInfraSelected = (id: InfrastructureId) => profile?.selectedInfrastructure.includes(id) ?? false;

  const selectedCapabilities = profile?.selectedCapabilities || [];
  const selectedInfra = profile?.selectedInfrastructure || [];

  // Helper para obtener capability info
  const getCapabilityInfo = (id: BusinessCapabilityId) => {
    return ALL_CAPABILITIES.find(c => c.id === id);
  };

  // Helper para obtener infrastructure info
  const getInfraInfo = (id: InfrastructureId) => {
    return ALL_INFRASTRUCTURE.find(i => i.id === id);
  };

  return (
    <ContentLayout spacing="normal">
      <Stack gap="8">
        {/* Header */}
        <Section variant="flat">
          <Stack gap="3">
            <Heading size="2xl">
              🎯 Configurá tu modelo de negocio
            </Heading>
            <Text color="fg.muted" fontSize="lg">
              Seleccioná las opciones que mejor describan tu negocio. Podés combinar varias.
            </Text>
          </Stack>
        </Section>

        {/* ============================================ */}
        {/* SECCIÓN 1: ¿QUÉ OFRECES? */}
        {/* ============================================ */}
        <Section variant="elevated">
          <Stack gap="4">
            <Stack gap="2">
              <Heading size="lg">
                1️⃣ ¿Qué ofrece tu negocio?
              </Heading>
              <Text color="fg.muted" fontSize="sm">
                Seleccioná todas las opciones que apliquen
              </Text>
            </Stack>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {BUSINESS_MODELS.map((capId) => {
                const capability = getCapabilityInfo(capId);
                if (!capability) return null;

                const isSelected = isCapabilitySelected(capId);

                return (
                  <div
                    key={capId}
                    onClick={() => handleCapabilityToggle(capId)}
                    style={{
                      padding: '20px',
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      borderColor: isSelected ? '#3182ce' : '#e2e8f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#ebf8ff' : 'white',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                  >
                    <Stack gap="2">
                      <div style={{ fontSize: '32px' }}>{capability.icon}</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2d3748' }}>
                        {capability.name}
                      </div>
                      <div style={{ fontSize: '14px', color: '#718096' }}>
                        {capability.description}
                      </div>
                      {isSelected && (
                        <Badge colorPalette="blue" size="sm" style={{ width: 'fit-content' }}>
                          ✓ Seleccionado
                        </Badge>
                      )}
                    </Stack>
                  </div>
                );
              })}
            </div>
          </Stack>
        </Section>

        {/* ============================================ */}
        {/* SECCIÓN 2: ¿CÓMO ENTREGAS? */}
        {/* ============================================ */}
        <Section variant="elevated">
          <Stack gap="4">
            <Stack gap="2">
              <Heading size="lg">
                2️⃣ ¿Cómo entregas o prestás tu oferta?
              </Heading>
              <Text color="fg.muted" fontSize="sm">
                Seleccioná todos los métodos que uses
              </Text>
            </Stack>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '16px'
            }}>
              {FULFILLMENT_METHODS.map((capId) => {
                const capability = getCapabilityInfo(capId);
                if (!capability) return null;

                const isSelected = isCapabilitySelected(capId);

                return (
                  <div
                    key={capId}
                    onClick={() => handleCapabilityToggle(capId)}
                    style={{
                      padding: '20px',
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      borderColor: isSelected ? '#38a169' : '#e2e8f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#f0fff4' : 'white',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Stack gap="2">
                      <div style={{ fontSize: '32px' }}>{capability.icon}</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2d3748' }}>
                        {capability.name}
                      </div>
                      <div style={{ fontSize: '14px', color: '#718096' }}>
                        {capability.description}
                      </div>
                      {isSelected && (
                        <Badge colorPalette="green" size="sm" style={{ width: 'fit-content' }}>
                          ✓ Seleccionado
                        </Badge>
                      )}
                    </Stack>
                  </div>
                );
              })}
            </div>
          </Stack>
        </Section>

        {/* ============================================ */}
        {/* SECCIÓN 3: ¿DÓNDE OPERÁS? */}
        {/* ============================================ */}
        <Section variant="elevated">
          <Stack gap="4">
            <Stack gap="2">
              <Heading size="lg">
                3️⃣ ¿Dónde operás?
              </Heading>
              <Text color="fg.muted" fontSize="sm">
                Infraestructura física de tu negocio
              </Text>
            </Stack>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '16px'
            }}>
              {INFRASTRUCTURE_OPTIONS.map((infraId) => {
                const infra = getInfraInfo(infraId);
                if (!infra) return null;

                const isSelected = isInfraSelected(infraId);

                return (
                  <div
                    key={infraId}
                    onClick={() => handleInfraToggle(infraId)}
                    style={{
                      padding: '20px',
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      borderColor: isSelected ? '#805ad5' : '#e2e8f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#faf5ff' : 'white',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Stack gap="2">
                      <div style={{ fontSize: '32px' }}>{infra.icon}</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2d3748' }}>
                        {infra.name}
                      </div>
                      <div style={{ fontSize: '14px', color: '#718096' }}>
                        {infra.description}
                      </div>
                      {isSelected && (
                        <Badge colorPalette="purple" size="sm" style={{ width: 'fit-content' }}>
                          ✓ Seleccionado
                        </Badge>
                      )}
                    </Stack>
                  </div>
                );
              })}
            </div>

            {/* Sub-option: Multi-location (solo si single_location está seleccionado) */}
            {isInfraSelected('single_location') && (
              <div style={{
                marginLeft: '24px',
                marginTop: '8px',
                paddingLeft: '24px',
                borderLeft: '3px solid #cbd5e0'
              }}>
                <div
                  onClick={() => handleInfraToggle('multi_location')}
                  style={{
                    padding: '16px',
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    borderColor: isInfraSelected('multi_location') ? '#805ad5' : '#e2e8f0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: isInfraSelected('multi_location') ? '#faf5ff' : 'white',
                    transition: 'all 0.2s',
                    maxWidth: '400px'
                  }}
                >
                  <Stack gap="2">
                    <div style={{ fontSize: '24px' }}>🏢</div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#2d3748' }}>
                      Tengo múltiples locales
                    </div>
                    <div style={{ fontSize: '13px', color: '#718096' }}>
                      Cadena, franquicia o sucursales
                    </div>
                    {isInfraSelected('multi_location') && (
                      <Badge colorPalette="purple" size="sm" style={{ width: 'fit-content' }}>
                        ✓ Seleccionado
                      </Badge>
                    )}
                  </Stack>
                </div>
              </div>
            )}
          </Stack>
        </Section>

        {/* ============================================ */}
        {/* SECCIÓN 4: POTENCIÁ TU NEGOCIO */}
        {/* ============================================ */}
        <Section variant="elevated">
          <Stack gap="4">
            <Stack gap="2">
              <Heading size="lg">
                4️⃣ Potenciá tu negocio
              </Heading>
              <Text color="fg.muted" fontSize="sm">
                Canales y capacidades adicionales (opcional)
              </Text>
            </Stack>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '16px'
            }}>
              {ADD_ONS.map((capId) => {
                const capability = getCapabilityInfo(capId);
                if (!capability) return null;

                const isSelected = isCapabilitySelected(capId);

                return (
                  <div
                    key={capId}
                    onClick={() => handleCapabilityToggle(capId)}
                    style={{
                      padding: '20px',
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      borderColor: isSelected ? '#d69e2e' : '#e2e8f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#fefcbf' : 'white',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Stack gap="2">
                      <div style={{ fontSize: '32px' }}>{capability.icon}</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2d3748' }}>
                        {capability.name}
                      </div>
                      <div style={{ fontSize: '14px', color: '#718096' }}>
                        {capability.description}
                      </div>
                      {isSelected && (
                        <Badge colorPalette="yellow" size="sm" style={{ width: 'fit-content' }}>
                          ✓ Seleccionado
                        </Badge>
                      )}
                    </Stack>
                  </div>
                );
              })}
            </div>
          </Stack>
        </Section>

        {/* ============================================ */}
        {/* RESUMEN Y CONTINUAR */}
        {/* ============================================ */}
        <Section variant="flat">
          <Stack gap="4">
            <div style={{
              padding: '20px',
              backgroundColor: '#edf2f7',
              borderRadius: '8px',
              borderLeft: '4px solid #3182ce'
            }}>
              <Stack gap="3">
                <Heading size="sm" color="fg.emphasized">
                  📋 Resumen de tu configuración
                </Heading>

                <div style={{ fontSize: '14px', color: '#4a5568' }}>
                  <strong>{selectedCapabilities.length}</strong> capacidad{selectedCapabilities.length !== 1 ? 'es' : ''} seleccionada{selectedCapabilities.length !== 1 ? 's' : ''}
                </div>

                <div style={{ fontSize: '14px', color: '#4a5568' }}>
                  <strong>Infraestructura:</strong> {selectedInfra.map((id: InfrastructureId) => getInfraInfo(id)?.name).join(', ')}
                </div>

                {selectedCapabilities.length > 0 && (
                  <div style={{
                    fontSize: '13px',
                    color: '#718096',
                    marginTop: '8px',
                    fontStyle: 'italic',
                    padding: '12px',
                    backgroundColor: '#e6fffa',
                    borderRadius: '6px'
                  }}>
                    ✨ El sistema activará automáticamente:
                    <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
                      <li>Production (si vendés productos físicos)</li>
                      <li>Scheduling (si ofrecés servicios o alquileres)</li>
                      <li>Y todas las funcionalidades necesarias para tus capacidades</li>
                    </ul>
                  </div>
                )}
              </Stack>
            </div>

            <Button
              size="lg"
              colorPalette="blue"
              onClick={handleContinue}
              disabled={selectedCapabilities.length === 0}
              style={{ marginTop: '16px' }}
            >
              Continuar al Dashboard →
            </Button>

            {selectedCapabilities.length === 0 && (
              <Text color="fg.error" textAlign="center" fontSize="sm">
                ⚠️ Seleccioná al menos una capacidad para continuar
              </Text>
            )}
          </Stack>
        </Section>
      </Stack>
    </ContentLayout>
  );
}
