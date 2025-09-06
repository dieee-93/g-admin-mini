import React, { useState } from 'react';
import {
  Grid,
  GridItem,
  Box,
  Stack,
  Heading,
  Text,
  HStack,
  Button,
  Flex,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  BoltIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  BuildingOfficeIcon,
  HomeIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  CubeIcon,
  UsersIcon,
  CalendarIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { CapabilitySelector } from './components/CapabilitySelector';
import { BusinessPreviewPanel } from './components/BusinessPreviewPanel';
import { ChannelOption } from './components/ChannelOption';
import { StructureOption } from './components/StructureOption';
import { useBusinessCapabilities } from './hooks/useBusinessCapabilities';
import { BusinessModelData } from './config/businessCapabilities'

interface BusinessModelStepProps {
  onComplete: (data: BusinessModelData) => void;
  onBack: () => void;
}

export function BusinessModelStep({
  onComplete,
  onBack,
}: BusinessModelStepProps) {
  const businessModel = useBusinessCapabilities();
  const [selectedCompetencies, setSelectedCompetencies] = useState({
    products: false,
    services: false,
    events: false,
    recurrence: false,
  });

  const handleCompetencyChange = (competency: keyof typeof selectedCompetencies) => {
    const isSelected = !selectedCompetencies[competency];
    setSelectedCompetencies(prev => ({ ...prev, [competency]: isSelected }));

    // This is a key part of the logic: when a competency is toggled,
    // we also toggle the corresponding "main capability" in the hook.
    // The hook's internal logic will then handle resetting sub-capabilities if it's being turned off.
    const competencyToCapabilityMap: Record<keyof typeof selectedCompetencies, keyof import('./config/businessCapabilities').BusinessCapabilities> = {
      products: 'sells_products',
      services: 'sells_services',
      events: 'manages_events',
      recurrence: 'manages_recurrence',
    };

    const mainCapability = competencyToCapabilityMap[competency];

    // We only want to toggle it if the state is not already aligned
    if (businessModel.capabilities[mainCapability] !== isSelected) {
      businessModel.toggleMainCapability(mainCapability);
    }
  };

  const handleSubmit = () => {
    console.log('🔥 handleSubmit called!');
    console.log('🔥 canSubmit:', businessModel.canSubmit);
    console.log('🔥 capabilities:', businessModel.capabilities);
    
    if (!businessModel.canSubmit) {
      console.log('❌ Cannot submit - validation failed');
      return;
    }
    
    const finalData = businessModel.getBusinessModelData();
    console.log('✅ Business model defined:', finalData);
    onComplete(finalData);
  };

  return (
    <Grid
      templateColumns={{
        base: '1fr',
        lg: '3fr 1.2fr',
      }}
      gap={{
        base: 6,
        lg: 8,
      }}
      width="100%"
    >
      {/* LEFT COLUMN: INTERACTIVE CONFIGURATION */}
      <GridItem>
        <Box bg="gray.50" borderRadius="xl" boxShadow="md" overflow="hidden">
          {/* Header Section */}
          <Box
            p={6}
            borderBottom="1px solid"
            borderColor="gray.100"
          >
            <Stack gap={1}>
              <Heading size="md" fontWeight="semibold">
                Modelo de Negocio
              </Heading>
              <Text color="gray.600" fontSize="sm">
                Define las capacidades principales de tu negocio y cómo quieres operar.
              </Text>
            </Stack>
          </Box>

          {/* Main Form Section */}
          <Box p={6}>
            <Stack gap={8}>
              {/* Phase 1: Core Competencies */}
              <Stack gap={4}>
                <Stack gap={1}>
                  <Text fontWeight="medium" fontSize="md" display="flex" alignItems="center">
                    <BoltIcon width={16} height={16} color="gray.600" style={{ marginRight: 8 }} />
                    ¿Cuáles son las competencias clave de tu negocio?
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Activa las grandes áreas de tu negocio. Esto nos ayudará a configurar la plataforma para ti.
                  </Text>
                </Stack>
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <CompetencyButton
                    icon={<CubeIcon width={20} height={20} />}
                    title="Venta de Productos"
                    isSelected={selectedCompetencies.products}
                    onClick={() => handleCompetencyChange('products')}
                  />
                  <CompetencyButton
                    icon={<UsersIcon width={20} height={20} />}
                    title="Venta de Servicios"
                    isSelected={selectedCompetencies.services}
                    onClick={() => handleCompetencyChange('services')}
                  />
                  <CompetencyButton
                    icon={<CalendarIcon width={20} height={20} />}
                    title="Gestión de Eventos"
                    isSelected={selectedCompetencies.events}
                    onClick={() => handleCompetencyChange('events')}
                  />
                  <CompetencyButton
                    icon={<ArrowPathIcon width={20} height={20} />}
                    title="Gestión de Recurrencia"
                    isSelected={selectedCompetencies.recurrence}
                    onClick={() => handleCompetencyChange('recurrence')}
                  />
                </SimpleGrid>
              </Stack>

              {/* Phase 2: Detailed Capabilities */}
              <CapabilitySelector
                capabilities={businessModel.capabilities}
                expandedCards={businessModel.expandedCards}
                selectedCompetencies={selectedCompetencies}
                onToggleMain={businessModel.toggleMainCapability}
                onToggleSub={businessModel.toggleSubCapability}
                onToggleCard={businessModel.toggleCard}
              />

              {/* Phase 3: Operational Profile */}
              <Stack gap={4}>
                <Stack gap={1}>
                  <Text
                    fontWeight="medium"
                    fontSize="md"
                    display="flex"
                    alignItems="center"
                  >
                    <ChartBarIcon width={16} height={16} color="gray.600" style={{ marginRight: 8 }} />
                    Canales y estructura
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Define cómo interactúas con tus clientes y cómo está organizado tu negocio
                  </Text>
                </Stack>

                {/* Channels */}
                <SimpleGrid
                  columns={{
                    base: 1,
                    md: 2,
                  }}
                  gap={4}
                >
                  <ChannelOption
                    icon={<ShoppingCartIcon width={18} height={18} />}
                    title="Tienda Online"
                    description="Ventas a través de internet"
                    isChecked={businessModel.capabilities.has_online_store}
                    onChange={() => businessModel.toggleSubCapability('has_online_store')}
                  />
                  <ChannelOption
                    icon={<BuildingOfficeIcon width={18} height={18} />}
                    title="Enfoque B2B"
                    description="Ventas a otras empresas"
                    isChecked={businessModel.capabilities.is_b2b_focused}
                    onChange={() => businessModel.toggleSubCapability('is_b2b_focused')}
                  />
                </SimpleGrid>

                {/* Business Structure */}
                <Stack gap={3} mt={2}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.600">
                    Estructura del negocio
                  </Text>
                  <SimpleGrid
                    columns={{
                      base: 1,
                      md: 3,
                    }}
                    gap={4}
                  >
                    <StructureOption
                      icon={<HomeIcon width={18} height={18} />}
                      title="Local único"
                      description="Una ubicación física"
                      isSelected={businessModel.businessStructure === 'single_location'}
                      onClick={() => businessModel.setBusinessStructure('single_location')}
                    />
                    <StructureOption
                      icon={<BuildingStorefrontIcon width={18} height={18} />}
                      title="Múltiples locales"
                      description="Sucursales o franquicias"
                      isSelected={businessModel.businessStructure === 'multi_location'}
                      onClick={() => businessModel.setBusinessStructure('multi_location')}
                    />
                    <StructureOption
                      icon={<TruckIcon width={18} height={18} />}
                      title="Negocio móvil"
                      description="Sin ubicación fija"
                      isSelected={businessModel.businessStructure === 'mobile'}
                      onClick={() => businessModel.setBusinessStructure('mobile')}
                    />
                  </SimpleGrid>
                </Stack>
              </Stack>
            </Stack>
          </Box>

          {/* Footer with Navigation */}
          <Box
            p={6}
            borderTop="1px solid"
            borderColor="gray.100"
          >
            <Flex justify="space-between" align="center">
              <Box
                as="button"
                px={4}
                py={2}
                borderRadius="md"
                border="1px solid"
                borderColor="gray.200"
                bg="gray.50"
                color="gray.800"
                fontWeight="medium"
                fontSize="sm"
                _hover={{ bg: 'gray.100' }}
                onClick={onBack}
                display="flex"
                alignItems="center"
              >
                <ChevronUpIcon width={16} height={16} style={{ marginRight: 4 }} />
                Volver
              </Box>
              <Button
                px={6}
                py={2}
                borderRadius="md"
                bg={businessModel.canSubmit ? 'gray.800' : 'gray.400'}
                color="gray.50"
                fontWeight="medium"
                fontSize="sm"
                _hover={{
                  bg: businessModel.canSubmit ? 'gray.900' : 'gray.400',
                  transform: businessModel.canSubmit ? 'translateY(-1px)' : 'none',
                }}
                transition="all 0.2s"
                onClick={handleSubmit}
                disabled={!businessModel.canSubmit}
                cursor={businessModel.canSubmit ? 'pointer' : 'not-allowed'}
                display="flex"
                alignItems="center"
              >
                Continuar
                <ChevronDownIcon width={16} height={16} style={{ marginLeft: 4 }} />
              </Button>
            </Flex>
          </Box>
        </Box>
      </GridItem>

      {/* RIGHT COLUMN: PREVIEW & INSIGHTS */}
      <GridItem>
        <BusinessPreviewPanel
          archetypes={businessModel.archetypes}
          operationalProfile={businessModel.operationalProfile}
          insightMessage={businessModel.insightMessage}
          completedMilestones={[]}
        />
      </GridItem>
    </Grid>
  );
}

// A local component for the competency buttons to keep this file self-contained.
const CompetencyButton = ({ icon, title, isSelected, onClick }) => (
  <Box
    as="button"
    p={5}
    bg={isSelected ? 'gray.800' : 'gray.100'}
    color={isSelected ? 'gray.50' : 'gray.800'}
    borderRadius="lg"
    boxShadow={isSelected ? 'lg' : 'sm'}
    border="1px solid"
    borderColor={isSelected ? 'gray.800' : 'gray.200'}
    onClick={onClick}
    transition="all 0.2s ease-in-out"
    _hover={{
      transform: 'translateY(-2px)',
      boxShadow: 'md',
    }}
  >
    <HStack gap={4}>
      <Circle bg={isSelected ? 'yellow.400' : 'gray.200'} size="40px" color="gray.800">
        {icon}
      </Circle>
      <Text fontWeight="semibold" fontSize="md">
        {title}
      </Text>
    </HStack>
  </Box>
);