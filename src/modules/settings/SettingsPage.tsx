// Settings Page - Unified dashboard without nested tabs
import React, { useEffect } from 'react';
import {
  Box,
  Card,
  Heading,
  Text,
  VStack,
  Grid,
  SimpleGrid
} from '@chakra-ui/react';
import { 
  BuildingOfficeIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon,
  CogIcon
} from '@heroicons/react/24/outline';
// import { Icon } from '@/shared/ui/Icon'; // Temporalmente comentado para evitar errores
import { useNavigation } from '@/contexts/NavigationContext';

// Components
import { SettingsHeader } from './components/SettingsHeader';
import { BusinessProfileSection } from './components/sections/BusinessProfileSection';
import { TaxConfigurationSection } from './components/sections/TaxConfigurationSection';
import { UserPermissionsSection } from './components/sections/UserPermissionsSection';
import { IntegrationsSection } from './components/sections/IntegrationsSection';

export default function SettingsPage() {
  const { setQuickActions } = useNavigation();

  useEffect(() => {
    setQuickActions([
      {
        id: 'save-settings',
        label: 'Guardar Configuración',
        icon: CogIcon,
        action: () => console.log('Save settings'),
        color: 'blue'
      }
    ]);
  }, [setQuickActions]);

  return (
  <Box p={{ base: 2, md: 6 }} pb={{ base: '90px', md: 6 }} maxW="container.xl" mx="auto">
      <SettingsHeader />

      {/* Settings Dashboard - No nested tabs */}
      <VStack gap={6} mt={6} align="stretch">
        {/* Settings Overview Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
          <Card.Root>
            <Card.Body>
              <VStack align="start" gap={2}>
                <BuildingOfficeIcon style={{ width: '24px', height: '24px', color: 'var(--chakra-colors-blue-600)' }} />
                <Heading size="sm">Perfil Empresarial</Heading>
                <Text fontSize="sm" color="gray.600">
                  Información de la empresa
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body>
              <VStack align="start" gap={2}>
                <CurrencyDollarIcon style={{ width: '24px', height: '24px', color: 'var(--chakra-colors-green-600)' }} />
                <Heading size="sm">Configuración Fiscal</Heading>
                <Text fontSize="sm" color="gray.600">
                  AFIP y configuraciones impositivas
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body>
              <VStack align="start" gap={2}>
                <UserGroupIcon style={{ width: '24px', height: '24px', color: 'var(--chakra-colors-purple-600)' }} />
                <Heading size="sm">Permisos de Usuario</Heading>
                <Text fontSize="sm" color="gray.600">
                  Control de acceso y roles
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Body>
              <VStack align="start" gap={2}>
                <CogIcon style={{ width: '24px', height: '24px', color: 'var(--chakra-colors-orange-600)' }} />
                <Heading size="sm">Integraciones</Heading>
                <Text fontSize="sm" color="gray.600">
                  Servicios externos y APIs
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>

        {/* All sections displayed together */}
        <Grid templateColumns={{ base: "1fr", xl: "1fr 1fr" }} gap={6}>
          <Card.Root>
            <Card.Header>
              <Heading size="md">Perfil Empresarial</Heading>
            </Card.Header>
            <Card.Body>
              <BusinessProfileSection />
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Heading size="md">Configuración Fiscal</Heading>
            </Card.Header>
            <Card.Body>
              <TaxConfigurationSection />
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Heading size="md">Permisos de Usuario</Heading>
            </Card.Header>
            <Card.Body>
              <UserPermissionsSection />
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Heading size="md">Integraciones</Heading>
            </Card.Header>
            <Card.Body>
              <IntegrationsSection />
            </Card.Body>
          </Card.Root>
        </Grid>
      </VStack>
    </Box>
  );
}
