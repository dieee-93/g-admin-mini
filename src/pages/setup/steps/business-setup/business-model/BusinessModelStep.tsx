import React from 'react';
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
              {/* Core Capabilities Section */}
              <CapabilitySelector
                capabilities={businessModel.capabilities}
                expandedCards={businessModel.expandedCards}
                onToggleMain={businessModel.toggleMainCapability}
                onToggleSub={businessModel.toggleSubCapability}
                onToggleCard={businessModel.toggleCard}
              />

              {/* Channels & Structure Section */}
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
          archetype={businessModel.archetype}
          operationalProfile={businessModel.operationalProfile}
          insightMessage={businessModel.insightMessage}
          capabilities={businessModel.capabilities}
          businessStructure={businessModel.businessStructure}
          completedMilestones={[]}
        />
      </GridItem>
    </Grid>
  );
}