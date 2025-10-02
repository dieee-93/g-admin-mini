/**
 * UNIFIED CAPABILITY SETUP - Setup wizard simplificado
 *
 * REEMPLAZA COMPLETAMENTE:
 * - BusinessModelStep.tsx (lógica compleja)
 * - useBusinessCapabilities.ts (hook confuso)
 * - CapabilitySelector.tsx (componentes complejos)
 * - Todo el setup/steps/business-setup/business-model/ folder
 *
 * SIMPLIFICA: Una página, lógica clara, UX directa
 */

import React, { useState } from 'react';
import {
  ContentLayout,
  Section,
  Stack,
  Typography,
  Button,
  Alert,
  SimpleGrid,
  Box,
  Badge,
  Switch,
  InputField,
  SelectField
} from '@/shared/ui';
import { useCapabilityStore, useCapabilities } from '@/store/capabilityStore';
import type { CapabilityId } from '@/lib/capabilities/types/UnifiedCapabilities';
import {
  CAPABILITY_DEFINITIONS,
  getActivityCapabilities,
  getInfrastructureCapabilities
} from '@/lib/capabilities/config/CapabilityDefinitions';

// ============================================
// SETUP COMPONENT
// ============================================

export default function UnifiedCapabilitySetup() {
  const {
    profile,
    activeCapabilities,
    visibleModules,
    toggleCapability,
    setBusinessStructure,
    completeSetup
  } = useCapabilities();

  const [businessInfo, setBusinessInfo] = useState({
    businessName: profile?.businessName ?? '',
    businessType: profile?.businessType ?? '',
    email: profile?.email ?? '',
    phone: profile?.phone ?? ''
  });

  const initializeProfile = useCapabilityStore(state => state.initializeProfile);

  // Initialize profile si no existe
  React.useEffect(() => {
    if (!profile) {
      initializeProfile({
        businessName: '',
        businessType: '',
        email: '',
        phone: ''
      });
    }
  }, [profile, initializeProfile]);

  const handleBusinessInfoChange = (field: string, value: string) => {
    setBusinessInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Update profile with business info
    initializeProfile({
      ...businessInfo,
      activeCapabilities: activeCapabilities
    });

    // Complete setup
    completeSetup();

    // Navigate to dashboard
    window.location.href = '/admin/dashboard';
  };

  const canSubmit = businessInfo.businessName.trim() !== '' && activeCapabilities.length > 0;

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <ContentLayout spacing="normal">
      <Section variant="flat" title="🎯 Configuración de Capacidades">
        <Stack spacing="lg">
          {/* Business Info */}
          <Section variant="elevated" title="Información del Negocio">
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="md">
              <InputField
                label="Nombre del negocio"
                value={businessInfo.businessName}
                onChange={(e) => handleBusinessInfoChange('businessName', e.target.value)}
                placeholder="Mi Negocio"
                required
              />
              <SelectField
                label="Tipo de negocio"
                value={businessInfo.businessType}
                onChange={(e) => handleBusinessInfoChange('businessType', e.target.value)}
              >
                <option value="">Seleccionar...</option>
                <option value="restaurant">Restaurant</option>
                <option value="retail">Retail</option>
                <option value="services">Servicios</option>
                <option value="ecommerce">E-commerce</option>
                <option value="other">Otro</option>
              </SelectField>
              <InputField
                label="Email"
                type="email"
                value={businessInfo.email}
                onChange={(e) => handleBusinessInfoChange('email', e.target.value)}
                placeholder="contacto@minegocio.com"
              />
              <InputField
                label="Teléfono"
                value={businessInfo.phone}
                onChange={(e) => handleBusinessInfoChange('phone', e.target.value)}
                placeholder="+54 11 1234-5678"
              />
            </SimpleGrid>
          </Section>

          {/* Infrastructure Setup */}
          <Section variant="elevated" title="🏗️ Estructura del Negocio">
            <Stack spacing="md">
              <Typography variant="body" fontSize="sm" color="gray.600">
                ¿Cómo opera tu negocio?
              </Typography>
              <SimpleGrid columns={{ base: 1, md: 3 }} gap="md">
                <StructureOption
                  id="single_location"
                  title="Local Único"
                  description="Opera desde una ubicación fija"
                  icon="🏪"
                  selected={activeCapabilities.includes('single_location')}
                  onSelect={() => setBusinessStructure('single_location')}
                />
                <StructureOption
                  id="multi_location"
                  title="Múltiples Locales"
                  description="Cadena o franquicia"
                  icon="🏢"
                  selected={activeCapabilities.includes('multi_location')}
                  onSelect={() => setBusinessStructure('multi_location')}
                />
                <StructureOption
                  id="mobile_business"
                  title="Negocio Móvil"
                  description="Food truck, servicios a domicilio"
                  icon="🚐"
                  selected={activeCapabilities.includes('mobile_business')}
                  onSelect={() => setBusinessStructure('mobile_business')}
                />
              </SimpleGrid>
            </Stack>
          </Section>

          {/* Activity Capabilities */}
          <Section variant="elevated" title="💼 Actividades del Negocio">
            <Stack spacing="md">
              <Typography variant="body" fontSize="sm" color="gray.600">
                Selecciona las actividades principales de tu negocio
              </Typography>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="md">
                {getActivityCapabilities().map(capability => (
                  <CapabilityOption
                    key={capability.id}
                    capability={capability}
                    selected={activeCapabilities.includes(capability.id)}
                    onToggle={() => toggleCapability(capability.id)}
                  />
                ))}
              </SimpleGrid>
            </Stack>
          </Section>

          {/* Infrastructure Capabilities */}
          <Section variant="elevated" title="🌐 Características Adicionales">
            <Stack spacing="md">
              <Typography variant="body" fontSize="sm" color="gray.600">
                Funcionalidades especiales de tu negocio
              </Typography>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="md">
                {getInfrastructureCapabilities()
                  .filter(cap => !['single_location', 'multi_location', 'mobile_business'].includes(cap.id))
                  .map(capability => (
                    <CapabilityOption
                      key={capability.id}
                      capability={capability}
                      selected={activeCapabilities.includes(capability.id)}
                      onToggle={() => toggleCapability(capability.id)}
                    />
                  ))}
              </SimpleGrid>
            </Stack>
          </Section>

          {/* Preview */}
          {activeCapabilities.length > 0 && (
            <Section variant="elevated" title="📋 Vista Previa">
              <Stack spacing="md">
                <div>
                  <Typography variant="body" fontWeight="medium" marginBottom="2">
                    Capabilities Activas ({activeCapabilities.length})
                  </Typography>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {activeCapabilities.map(capId => (
                      <Badge key={capId} colorPalette="blue" size="sm">
                        {CAPABILITY_DEFINITIONS[capId]?.name ?? capId}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Typography variant="body" fontWeight="medium" marginBottom="2">
                    Módulos Disponibles ({visibleModules.length})
                  </Typography>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {visibleModules.map(moduleId => (
                      <Badge key={moduleId} colorPalette="green" size="sm">
                        {moduleId}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Stack>
            </Section>
          )}

          {/* Submit */}
          <Stack spacing="md">
            {!canSubmit && (
              <Alert status="warning" title="Información Requerida">
                Completa el nombre del negocio y selecciona al menos una actividad para continuar
              </Alert>
            )}

            <Button
              colorPalette="blue"
              size="lg"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              Completar Configuración 🚀
            </Button>
          </Stack>
        </Stack>
      </Section>
    </ContentLayout>
  );
}

// ============================================
// CAPABILITY OPTION COMPONENT
// ============================================

function CapabilityOption({
  capability,
  selected,
  onToggle
}: {
  capability: any;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <Box
      padding="md"
      border="1px solid"
      borderColor={selected ? "blue.400" : "gray.300"}
      borderRadius="md"
      bg={selected ? "blue.50" : "gray.50"}
      cursor="pointer"
      onClick={onToggle}
      _hover={{
        borderColor: selected ? "blue.500" : "gray.400",
        bg: selected ? "blue.100" : "gray.100"
      }}
    >
      <Stack spacing="sm">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>{capability.icon}</span>
            <Typography variant="body" fontWeight="medium">
              {capability.name}
            </Typography>
          </div>
          <Switch checked={selected} onChange={onToggle} size="sm" />
        </div>
        <Typography variant="body" fontSize="sm" color="gray.600">
          {capability.description}
        </Typography>
      </Stack>
    </Box>
  );
}

// ============================================
// STRUCTURE OPTION COMPONENT
// ============================================

function StructureOption({
  id,
  title,
  description,
  icon,
  selected,
  onSelect
}: {
  id: string;
  title: string;
  description: string;
  icon: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Box
      padding="md"
      border="2px solid"
      borderColor={selected ? "blue.400" : "gray.300"}
      borderRadius="md"
      bg={selected ? "blue.50" : "white"}
      cursor="pointer"
      onClick={onSelect}
      textAlign="center"
      _hover={{
        borderColor: selected ? "blue.500" : "gray.400",
        bg: selected ? "blue.100" : "gray.50"
      }}
    >
      <Stack spacing="sm">
        <div style={{ fontSize: '32px' }}>{icon}</div>
        <Typography variant="body" fontWeight="medium">
          {title}
        </Typography>
        <Typography variant="body" fontSize="sm" color="gray.600">
          {description}
        </Typography>
      </Stack>
    </Box>
  );
}