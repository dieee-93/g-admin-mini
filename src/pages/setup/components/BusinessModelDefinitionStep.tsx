import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Box,
  VStack,
  HStack,
  Text,
  Stack,
  Badge,
  Flex,
  Heading,
  Collapsible,
  Grid,
  GridItem,
  SimpleGrid,
  Circle,
  Tag,
  TagLabel,
} from '@chakra-ui/react'
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  ChartBarIcon,
  CubeIcon,
  ClockIcon,
  CalendarIcon,
  ArrowPathIcon,
  ShoppingCartIcon,
  BuildingOfficeIcon,
  HomeIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  ComputerDesktopIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import { Typography, Button } from '@/shared/ui'

// Business capabilities interface (same as original)
interface BusinessCapabilitiesNew {
  // Main capability flags
  sells_products: boolean
  sells_services: boolean
  manages_events: boolean
  manages_recurrence: boolean
  // Products
  sells_products_for_onsite_consumption: boolean
  sells_products_for_pickup: boolean
  sells_products_with_delivery: boolean
  sells_digital_products: boolean
  // Services
  sells_services_by_appointment: boolean
  sells_services_by_class: boolean
  sells_space_by_reservation: boolean
  // Events
  manages_offsite_catering: boolean
  hosts_private_events: boolean
  // Recurrence/Assets
  manages_rentals: boolean
  manages_memberships: boolean
  manages_subscriptions: boolean
  // Channels and Structure
  has_online_store: boolean
  is_b2b_focused: boolean
}

type BusinessStructure = 'single_location' | 'multi_location' | 'mobile'

interface BusinessModelDefinitionStepProps {
  onComplete: (data: any) => void
  onBack: () => void
}

export function BusinessModelDefinitionStep({
  onComplete,
  onBack,
}: BusinessModelDefinitionStepProps) {
  // State for capabilities
  const [capabilities, setCapabilities] = useState<BusinessCapabilitiesNew>({
    sells_products: false,
    sells_services: false,
    manages_events: false,
    manages_recurrence: false,
    sells_products_for_onsite_consumption: false,
    sells_products_for_pickup: false,
    sells_products_with_delivery: false,
    sells_digital_products: false,
    sells_services_by_appointment: false,
    sells_services_by_class: false,
    sells_space_by_reservation: false,
    manages_offsite_catering: false,
    hosts_private_events: false,
    manages_rentals: false,
    manages_memberships: false,
    manages_subscriptions: false,
    has_online_store: false,
    is_b2b_focused: false,
  })

  const [businessStructure, setBusinessStructure] =
    useState<BusinessStructure>('single_location')

  // States to control the expansion of each card
  const [expandedCards, setExpandedCards] = useState({
    products: false,
    services: false,
    events: false,
    assets: false,
  })

  // Detect screen size
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1200)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleCard = (cardName: keyof typeof expandedCards) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardName]: !prev[cardName],
    }))
  }

  const handleSubmit = () => {
    const finalData = {
      ...capabilities,
      business_structure: businessStructure,
      operationalTier: calculateOperationalTier(
        capabilities,
        businessStructure,
      ),
    }
    console.log('Business model defined:', finalData)
    onComplete(finalData)
  }

  const toggleMainCapability = (key: keyof BusinessCapabilitiesNew) => {
    setCapabilities((prev) => {
      const newValue = !prev[key]
      const newCapabilities = {
        ...prev,
        [key]: newValue,
      }
      // If a main capability is deactivated, also deactivate its sub-options
      if (!newValue) {
        if (key === 'sells_products') {
          newCapabilities.sells_products_for_onsite_consumption = false
          newCapabilities.sells_products_for_pickup = false
          newCapabilities.sells_products_with_delivery = false
          newCapabilities.sells_digital_products = false
        } else if (key === 'sells_services') {
          newCapabilities.sells_services_by_appointment = false
          newCapabilities.sells_services_by_class = false
          newCapabilities.sells_space_by_reservation = false
        } else if (key === 'manages_events') {
          newCapabilities.manages_offsite_catering = false
          newCapabilities.hosts_private_events = false
        } else if (key === 'manages_recurrence') {
          newCapabilities.manages_rentals = false
          newCapabilities.manages_memberships = false
          newCapabilities.manages_subscriptions = false
        }
      }
      return newCapabilities
    })
  }

  const toggleSubCapability = (key: keyof BusinessCapabilitiesNew) => {
    setCapabilities((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const canSubmit = () => {
    // At least one main capability must be selected
    return (
      capabilities.sells_products ||
      capabilities.sells_services ||
      capabilities.manages_events ||
      capabilities.manages_recurrence
    )
  }

  const currentTier = calculateOperationalTier(capabilities, businessStructure)

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
              <Stack gap={4}>
                <Stack gap={1}>
                  <Text
                    fontWeight="medium"
                    fontSize="md"
                    display="flex"
                    alignItems="center"
                  >
                    <BoltIcon width={16} height={16} color="gray.600" style={{ marginRight: 8 }} />
                    Actividades principales
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Selecciona las actividades principales de tu negocio
                  </Text>
                </Stack>

                {/* Core Capabilities Grid */}
                <SimpleGrid
                  columns={{
                    base: 1,
                    md: 2,
                  }}
                  gap={4}
                >
                  <CapabilityCard
                    icon={<CubeIcon width={20} height={20} />}
                    title="Productos"
                    description="Venta de ítems físicos o digitales"
                    isSelected={capabilities.sells_products}
                    isExpanded={expandedCards.products}
                    onSelect={() => {
                      toggleMainCapability('sells_products')
                      if (!capabilities.sells_products && !expandedCards.products) {
                        toggleCard('products')
                      }
                    }}
                    onToggle={() => toggleCard('products')}
                  >
                    <SimpleGrid
                      columns={{
                        base: 1,
                        sm: 2,
                      }}
                      gap={3}
                    >
                      <SubCapabilityOption
                        label="Consumo en local"
                        isChecked={capabilities.sells_products_for_onsite_consumption}
                        onChange={() =>
                          toggleSubCapability('sells_products_for_onsite_consumption')
                        }
                      />
                      <SubCapabilityOption
                        label="Retiro en tienda"
                        isChecked={capabilities.sells_products_for_pickup}
                        onChange={() =>
                          toggleSubCapability('sells_products_for_pickup')
                        }
                      />
                      <SubCapabilityOption
                        label="Envío a domicilio"
                        isChecked={capabilities.sells_products_with_delivery}
                        onChange={() =>
                          toggleSubCapability('sells_products_with_delivery')
                        }
                      />
                      <SubCapabilityOption
                        label="Productos digitales"
                        isChecked={capabilities.sells_digital_products}
                        onChange={() =>
                          toggleSubCapability('sells_digital_products')
                        }
                      />
                    </SimpleGrid>
                  </CapabilityCard>

                  <CapabilityCard
                    icon={<ClockIcon width={20} height={20} />}
                    title="Servicios"
                    description="Tiempo, citas o reservas"
                    isSelected={capabilities.sells_services}
                    isExpanded={expandedCards.services}
                    onSelect={() => {
                      toggleMainCapability('sells_services')
                      if (!capabilities.sells_services && !expandedCards.services) {
                        toggleCard('services')
                      }
                    }}
                    onToggle={() => toggleCard('services')}
                  >
                    <SimpleGrid
                      columns={{
                        base: 1,
                        sm: 2,
                      }}
                      gap={3}
                    >
                      <SubCapabilityOption
                        label="Turnos/Citas"
                        isChecked={capabilities.sells_services_by_appointment}
                        onChange={() =>
                          toggleSubCapability('sells_services_by_appointment')
                        }
                      />
                      <SubCapabilityOption
                        label="Clases grupales"
                        isChecked={capabilities.sells_services_by_class}
                        onChange={() =>
                          toggleSubCapability('sells_services_by_class')
                        }
                      />
                      <SubCapabilityOption
                        label="Reserva de espacios"
                        isChecked={capabilities.sells_space_by_reservation}
                        onChange={() =>
                          toggleSubCapability('sells_space_by_reservation')
                        }
                      />
                    </SimpleGrid>
                  </CapabilityCard>

                  <CapabilityCard
                    icon={<CalendarIcon width={20} height={20} />}
                    title="Eventos"
                    description="Catering y celebraciones"
                    isSelected={capabilities.manages_events}
                    isExpanded={expandedCards.events}
                    onSelect={() => {
                      toggleMainCapability('manages_events')
                      if (!capabilities.manages_events && !expandedCards.events) {
                        toggleCard('events')
                      }
                    }}
                    onToggle={() => toggleCard('events')}
                  >
                    <SimpleGrid
                      columns={{
                        base: 1,
                        sm: 2,
                      }}
                      gap={3}
                    >
                      <SubCapabilityOption
                        label="Catering externo"
                        isChecked={capabilities.manages_offsite_catering}
                        onChange={() =>
                          toggleSubCapability('manages_offsite_catering')
                        }
                      />
                      <SubCapabilityOption
                        label="Eventos en local"
                        isChecked={capabilities.hosts_private_events}
                        onChange={() =>
                          toggleSubCapability('hosts_private_events')
                        }
                      />
                    </SimpleGrid>
                  </CapabilityCard>

                  <CapabilityCard
                    icon={<ArrowPathIcon width={20} height={20} />}
                    title="Recurrencia"
                    description="Membresías y suscripciones"
                    isSelected={capabilities.manages_recurrence}
                    isExpanded={expandedCards.assets}
                    onSelect={() => {
                      toggleMainCapability('manages_recurrence')
                      if (!capabilities.manages_recurrence && !expandedCards.assets) {
                        toggleCard('assets')
                      }
                    }}
                    onToggle={() => toggleCard('assets')}
                  >
                    <SimpleGrid
                      columns={{
                        base: 1,
                        sm: 2,
                      }}
                      gap={3}
                    >
                      <SubCapabilityOption
                        label="Alquiler de ítems"
                        isChecked={capabilities.manages_rentals}
                        onChange={() => toggleSubCapability('manages_rentals')}
                      />
                      <SubCapabilityOption
                        label="Membresías"
                        isChecked={capabilities.manages_memberships}
                        onChange={() =>
                          toggleSubCapability('manages_memberships')
                        }
                      />
                      <SubCapabilityOption
                        label="Suscripciones"
                        isChecked={capabilities.manages_subscriptions}
                        onChange={() =>
                          toggleSubCapability('manages_subscriptions')
                        }
                      />
                    </SimpleGrid>
                  </CapabilityCard>
                </SimpleGrid>
              </Stack>

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
                    isChecked={capabilities.has_online_store}
                    onChange={() => toggleSubCapability('has_online_store')}
                  />
                  <ChannelOption
                    icon={<BuildingOfficeIcon width={18} height={18} />}
                    title="Enfoque B2B"
                    description="Ventas a otras empresas"
                    isChecked={capabilities.is_b2b_focused}
                    onChange={() => toggleSubCapability('is_b2b_focused')}
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
                      isSelected={businessStructure === 'single_location'}
                      onClick={() => setBusinessStructure('single_location')}
                    />
                    <StructureOption
                      icon={<BuildingStorefrontIcon width={18} height={18} />}
                      title="Múltiples locales"
                      description="Sucursales o franquicias"
                      isSelected={businessStructure === 'multi_location'}
                      onClick={() => setBusinessStructure('multi_location')}
                    />
                    <StructureOption
                      icon={<TruckIcon width={18} height={18} />}
                      title="Negocio móvil"
                      description="Sin ubicación fija"
                      isSelected={businessStructure === 'mobile'}
                      onClick={() => setBusinessStructure('mobile')}
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
              <Box
                as="button"
                px={6}
                py={2}
                borderRadius="md"
                bg={canSubmit() ? 'gray.800' : 'gray.400'}
                color="gray.50"
                fontWeight="medium"
                fontSize="sm"
                _hover={{
                  bg: canSubmit() ? 'gray.900' : 'gray.400',
                  transform: canSubmit() ? 'translateY(-1px)' : 'none',
                }}
                transition="all 0.2s"
                onClick={handleSubmit}
                disabled={!canSubmit()}
                display="flex"
                alignItems="center"
              >
                Continuar
                <ChevronDownIcon width={16} height={16} style={{ marginLeft: 4 }} />
              </Box>
            </Flex>
          </Box>
        </Box>
      </GridItem>

      {/* RIGHT COLUMN: BUSINESS INTELLIGENCE PANEL */}
      <GridItem>
        <BusinessIntelligencePanel
          capabilities={capabilities}
          businessStructure={businessStructure}
          currentTier={currentTier}
        />
      </GridItem>
    </Grid>
  )
}

// Capability Card Component (adapted to G-Admin theming)
function CapabilityCard({
  icon,
  title,
  description,
  isSelected,
  isExpanded,
  onSelect,
  onToggle,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  isSelected: boolean
  isExpanded: boolean
  onSelect: () => void
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <Box>
      <Box
        borderWidth="1px"
        borderColor={isSelected ? 'gray.400' : 'gray.200'}
        borderRadius="lg"
        bg={isSelected ? 'gray.100' : 'transparent'}
        transition="all 0.2s"
        _hover={{
          borderColor: isSelected ? 'gray.400' : 'gray.300',
          bg: isSelected ? 'gray.200' : 'gray.100',
          transform: 'translateY(-1px)',
          boxShadow: 'sm',
        }}
        overflow="hidden"
      >
        <Flex
          p={4}
          align="center"
          justify="space-between"
          onClick={onSelect}
          cursor="pointer"
        >
          <HStack gap={3}>
            <Circle
              size="36px"
              bg={isSelected ? 'gray.700' : 'gray.100'}
              color={isSelected ? 'gray.50' : 'gray.600'}
            >
              {icon}
            </Circle>
            <Stack gap={0}>
              <Text fontWeight="medium" fontSize="sm">
                {title}
              </Text>
              <Text fontSize="xs" color="gray.600">
                {description}
              </Text>
            </Stack>
          </HStack>
          <HStack>
            {isSelected && <CheckIcon width={16} height={16} color="gray.600" />}
            {isExpanded ? (
              <ChevronUpIcon
                width={16}
                height={16}
                color="gray.500"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggle()
                }}
                style={{ cursor: 'pointer' }}
              />
            ) : (
              <ChevronDownIcon
                width={16}
                height={16}
                color="gray.500"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggle()
                }}
                style={{ cursor: 'pointer' }}
              />
            )}
          </HStack>
        </Flex>
      </Box>
      <Collapsible.Root open={isExpanded && isSelected}>
        <Collapsible.Content>
          <Box
            mt={2}
            p={4}
            bg="gray.100"
            borderRadius="md"
            borderWidth="1px"
            borderColor="gray.300"
          >
            {children}
          </Box>
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  )
}

// Sub-capability Option Component
function SubCapabilityOption({
  label,
  isChecked,
  onChange,
}: {
  label: string
  isChecked: boolean
  onChange: () => void
}) {
  return (
    <HStack
      gap={3}
      onClick={onChange}
      cursor="pointer"
      p={2}
      borderRadius="md"
      _hover={{ bg: 'gray.200' }}
    >
      <Flex
        w="16px"
        h="16px"
        borderRadius="sm"
        border="2px solid"
        borderColor={isChecked ? 'gray.700' : 'gray.300'}
        bg={isChecked ? 'gray.700' : 'transparent'}
        align="center"
        justify="center"
      >
        {isChecked && <CheckIcon width={10} height={10} color="gray.50" />}
      </Flex>
      <Text fontSize="sm">{label}</Text>
    </HStack>
  )
}

// Channel Option Component
function ChannelOption({
  icon,
  title,
  description,
  isChecked,
  onChange,
}: {
  icon: React.ReactNode
  title: string
  description: string
  isChecked: boolean
  onChange: () => void
}) {
  return (
    <Flex
      p={4}
      borderWidth="1px"
      borderColor={isChecked ? 'gray.400' : 'gray.200'}
      borderRadius="lg"
      bg={isChecked ? 'gray.100' : 'transparent'}
      align="center"
      justify="space-between"
      cursor="pointer"
      onClick={onChange}
      transition="all 0.2s"
      _hover={{
        borderColor: isChecked ? 'gray.400' : 'gray.300',
        transform: 'translateY(-1px)',
        boxShadow: 'sm',
      }}
    >
      <HStack gap={3}>
        <Circle
          size="32px"
          bg={isChecked ? 'gray.700' : 'gray.100'}
          color={isChecked ? 'gray.50' : 'gray.600'}
        >
          {icon}
        </Circle>
        <Stack gap={0}>
          <Text fontWeight="medium" fontSize="sm">
            {title}
          </Text>
          <Text fontSize="xs" color="gray.600">
            {description}
          </Text>
        </Stack>
      </HStack>
      <Box
        w="20px"
        h="20px"
        borderRadius="full"
        borderWidth="2px"
        borderColor={isChecked ? 'gray.700' : 'gray.300'}
        p="2px"
      >
        {isChecked && (
          <Box w="100%" h="100%" borderRadius="full" bg="gray.700" />
        )}
      </Box>
    </Flex>
  )
}

// Structure Option Component
function StructureOption({
  icon,
  title,
  description,
  isSelected,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <Flex
      direction="column"
      p={4}
      borderWidth="1px"
      borderColor={isSelected ? 'gray.400' : 'gray.200'}
      borderRadius="lg"
      bg={isSelected ? 'gray.100' : 'transparent'}
      align="center"
      justify="center"
      textAlign="center"
      cursor="pointer"
      onClick={onClick}
      transition="all 0.2s"
      _hover={{
        borderColor: isSelected ? 'gray.400' : 'gray.300',
        transform: 'translateY(-1px)',
        boxShadow: 'sm',
      }}
      height="100%"
      minH="100px"
    >
      <Circle
        size="40px"
        bg={isSelected ? 'gray.700' : 'gray.100'}
        color={isSelected ? 'gray.50' : 'gray.600'}
        mb={2}
      >
        {icon}
      </Circle>
      <Text fontWeight="medium" fontSize="sm" mb={1}>
        {title}
      </Text>
      <Text fontSize="xs" color="gray.600">
        {description}
      </Text>
    </Flex>
  )
}

// Business Intelligence Panel (simplified for now, will be enhanced)
function BusinessIntelligencePanel({
  capabilities,
  businessStructure,
  currentTier,
}: {
  capabilities: BusinessCapabilitiesNew
  businessStructure: BusinessStructure
  currentTier: string
}) {
  const tierData = getTierData(currentTier)
  const businessSummary = getBusinessSummary(capabilities, businessStructure)
  const insightMessage = getInsightMessage(capabilities, businessStructure)
  const selectedMainCapabilities = getSelectedMainCapabilities()
  const complexityScore = calculateComplexityScore(capabilities, businessStructure)

  function getSelectedMainCapabilities(): string[] {
    const selected = []
    if (capabilities.sells_products) selected.push('📦 Productos')
    if (capabilities.sells_services) selected.push('⏰ Servicios')
    if (capabilities.manages_events) selected.push('🎉 Eventos')
    if (capabilities.manages_recurrence) selected.push('🔄 Activos')
    if (capabilities.has_online_store) selected.push('🛒 Online')
    if (capabilities.is_b2b_focused) selected.push('🏢 B2B')
    return selected
  }

  return (
    <Stack gap={4} position="sticky" top="20px">
      {/* Main Tier Card */}
      <Box bg="gray.50" borderRadius="xl" overflow="hidden" boxShadow="md">
        {/* Header */}
        <Box bg={tierData.headerGradient} p={4} position="relative" overflow="hidden">
          {/* Animated background pattern */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            opacity="0.1"
            bgImage={`url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`}
          />
          <Flex justify="space-between" align="center">
            <Text color="gray.50" fontSize="sm" fontWeight="medium">
              Clasificación de Negocio
            </Text>
            <Tag.Root size="sm" variant="subtle" colorPalette="blue">
              <Tag.StartElement>
                <ArrowTrendingUpIcon width="10px" height="10px" />
              </Tag.StartElement>
              <Tag.Label fontSize="xs">
                Complejidad {complexityScore}/10
              </Tag.Label>
            </Tag.Root>
          </Flex>
        </Box>

        {/* Tier Information */}
        <Box p={5} textAlign="center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <VStack gap={4}>
                <Circle
                  size="60px"
                  bg={tierData.iconBg}
                  color={tierData.iconColor}
                  fontSize="2xl"
                >
                  {tierData.icon}
                </Circle>
                <Stack gap={1}>
                  <Heading size="md" fontWeight="semibold" color={tierData.titleColor}>
                    {tierData.title}
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    {tierData.description}
                  </Text>
                </Stack>
                {/* Features Tags */}
                <Flex wrap="wrap" justify="center" gap={2}>
                  {tierData.features.map((feature, index) => (
                    <Tag.Root
                      key={index}
                      size="sm"
                      borderRadius="full"
                      variant="subtle"
                      colorPalette={tierData.colorScheme}
                    >
                      <Tag.Label fontSize="xs">{feature}</Tag.Label>
                    </Tag.Root>
                  ))}
                </Flex>
              </VStack>
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>

      {/* Selected Capabilities Quick View */}
      {selectedMainCapabilities.length > 0 && (
        <Box bg="gray.50" borderRadius="xl" overflow="hidden" boxShadow="md" p={4}>
          <Text fontWeight="medium" fontSize="sm" mb={3} color="gray.700">
            Capacidades Seleccionadas
          </Text>
          <Flex wrap="wrap" gap={2}>
            {selectedMainCapabilities.map((capability, index) => (
              <Badge
                key={index}
                variant="subtle"
                colorPalette="gray"
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="md"
              >
                {capability}
              </Badge>
            ))}
          </Flex>
        </Box>
      )}

      {/* Business Summary */}
      {businessSummary.length > 0 && (
        <Box bg="gray.50" borderRadius="xl" overflow="hidden" boxShadow="md">
          <Box p={4} borderBottom="1px solid" borderColor="gray.200">
            <HStack>
              <InformationCircleIcon width={16} height={16} color="gray.600" />
              <Text fontWeight="medium" fontSize="sm">
                Resumen de tu Negocio
              </Text>
            </HStack>
          </Box>
          <Box p={4}>
            <Stack gap={3}>
              {businessSummary.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <HStack align="flex-start" gap={3}>
                    <Circle
                      size="24px"
                      bg="gray.100"
                      color="gray.600"
                    >
                      <Text fontSize="xs" fontWeight="bold">
                        {index + 1}
                      </Text>
                    </Circle>
                    <Text fontSize="sm">{item}</Text>
                  </HStack>
                </motion.div>
              ))}
            </Stack>
          </Box>
        </Box>
      )}

      {/* Business Insight */}
      {insightMessage && (
        <Box bg="gray.50" borderRadius="xl" overflow="hidden" boxShadow="md" p={4}>
          <HStack gap={3} align="flex-start">
            <Circle size="36px" bg="gray.200" color="gray.600">
              <ComputerDesktopIcon width={16} height={16} />
            </Circle>
            <Stack gap={1}>
              <Text fontWeight="medium" fontSize="sm">
                Insight de Negocio
              </Text>
              <Text fontSize="sm" color="gray.600">
                {insightMessage}
              </Text>
            </Stack>
          </HStack>
        </Box>
      )}

      {/* Help Box - Only shown when needed */}
      {!canSubmit(capabilities) && (
        <Box
          bg="gray.100"
          borderRadius="xl"
          p={4}
          borderWidth="1px"
          borderColor="gray.200"
        >
          <HStack gap={3} align="flex-start">
            <Circle size="32px" bg="gray.200" color="gray.600">
              <InformationCircleIcon width={16} height={16} />
            </Circle>
            <Stack gap={1}>
              <Text fontWeight="medium" fontSize="sm" color="gray.700">
                Para continuar
              </Text>
              <Text fontSize="sm" color="gray.600">
                Selecciona al menos una actividad principal para tu negocio.
              </Text>
            </Stack>
          </HStack>
        </Box>
      )}
    </Stack>
  )
}

// Helper functions (same as original, adapted for G-Admin theming)
function getTierData(tier: string) {
  const tiers = {
    'Base Operativa': {
      title: 'Base Operativa',
      description: 'Negocio con una actividad principal bien definida',
      icon: '🌱',
      iconBg: 'gray.100',
      iconColor: 'gray.700',
      titleColor: 'gray.700',
      headerGradient: 'gray.700',
      colorScheme: 'green',
      features: ['Flujo simple', 'Gestión básica', 'Reportes esenciales'],
    },
    'Estructura Funcional': {
      title: 'Estructura Funcional',
      description: 'Negocio con múltiples canales o actividades',
      icon: '🏗️',
      iconBg: 'gray.100',
      iconColor: 'gray.700',
      titleColor: 'gray.700',
      headerGradient: 'gray.700',
      colorScheme: 'blue',
      features: ['Multi-canal', 'Dashboard avanzado', 'Integraciones básicas'],
    },
    'Negocio Integrado': {
      title: 'Negocio Integrado',
      description: 'Operación compleja con varias líneas de negocio',
      icon: '🏢',
      iconBg: 'gray.100',
      iconColor: 'gray.700',
      titleColor: 'gray.700',
      headerGradient: 'gray.700',
      colorScheme: 'purple',
      features: ['Multi-línea', 'Automatizaciones', 'Analytics avanzado'],
    },
    'Negocio Digital': {
      title: 'Negocio Digital',
      description: 'Enfoque digital con productos/servicios online',
      icon: '💻',
      iconBg: 'gray.100',
      iconColor: 'gray.700',
      titleColor: 'gray.700',
      headerGradient: 'gray.700',
      colorScheme: 'cyan',
      features: ['E-commerce', 'Suscripciones', 'Automatización total'],
    },
    'Centro de Experiencias': {
      title: 'Centro de Experiencias',
      description: 'Negocio centrado en eventos y experiencias',
      icon: '🎭',
      iconBg: 'gray.100',
      iconColor: 'gray.700',
      titleColor: 'gray.700',
      headerGradient: 'gray.700',
      colorScheme: 'orange',
      features: ['Gestión de eventos', 'Reservas', 'Experiencia de cliente'],
    },
    'Sistema Consolidado': {
      title: 'Sistema Consolidado',
      description: 'Operación empresarial de máxima complejidad',
      icon: '🏭',
      iconBg: 'gray.100',
      iconColor: 'gray.700',
      titleColor: 'gray.700',
      headerGradient: 'gray.700',
      colorScheme: 'red',
      features: ['Multi-sucursal', 'Enterprise', 'Business Intelligence'],
    },
    'Sin Configurar': {
      title: 'Sin Configurar',
      description: 'Selecciona tus actividades para ver tu clasificación',
      icon: '⚙️',
      iconBg: 'gray.100',
      iconColor: 'gray.600',
      titleColor: 'gray.600',
      headerGradient: 'gray.600',
      colorScheme: 'gray',
      features: ['Pendiente', 'Configuración inicial'],
    },
  }
  return tiers[tier] || tiers['Sin Configurar']
}

// Rest of helper functions remain the same...
function getBusinessSummary(
  capabilities: BusinessCapabilitiesNew,
  businessStructure: BusinessStructure,
): string[] {
  const summary = []
  
  if (capabilities.sells_products) {
    const productTypes = []
    if (capabilities.sells_products_for_onsite_consumption) productTypes.push('consumo en local')
    if (capabilities.sells_products_for_pickup) productTypes.push('retiro en tienda')
    if (capabilities.sells_products_with_delivery) productTypes.push('delivery')
    if (capabilities.sells_digital_products) productTypes.push('digitales')
    
    if (productTypes.length > 0) {
      summary.push(`Venta de productos ${productTypes.join(', ')}.`)
    } else {
      summary.push('Venta de productos.')
    }
  }

  if (capabilities.sells_services) {
    const serviceTypes = []
    if (capabilities.sells_services_by_appointment) serviceTypes.push('citas/turnos')
    if (capabilities.sells_services_by_class) serviceTypes.push('clases grupales')
    if (capabilities.sells_space_by_reservation) serviceTypes.push('reserva de espacios')
    
    if (serviceTypes.length > 0) {
      summary.push(`Servicios con ${serviceTypes.join(', ')}.`)
    } else {
      summary.push('Prestación de servicios.')
    }
  }

  if (capabilities.manages_events) {
    const eventTypes = []
    if (capabilities.manages_offsite_catering) eventTypes.push('catering externo')
    if (capabilities.hosts_private_events) eventTypes.push('eventos en local')
    
    if (eventTypes.length > 0) {
      summary.push(`Organización de ${eventTypes.join(' y ')}.`)
    } else {
      summary.push('Gestión de eventos.')
    }
  }

  if (capabilities.manages_recurrence) {
    const recurrenceTypes = []
    if (capabilities.manages_rentals) recurrenceTypes.push('alquileres')
    if (capabilities.manages_memberships) recurrenceTypes.push('membresías')
    if (capabilities.manages_subscriptions) recurrenceTypes.push('suscripciones')
    
    if (recurrenceTypes.length > 0) {
      summary.push(`Gestión de ${recurrenceTypes.join(', ')}.`)
    } else {
      summary.push('Gestión de activos recurrentes.')
    }
  }

  const channelsAndStructure = []
  if (capabilities.has_online_store) channelsAndStructure.push('tienda online')
  if (capabilities.is_b2b_focused) channelsAndStructure.push('enfoque B2B')

  const structureText = {
    single_location: 'local único',
    multi_location: 'múltiples locales',
    mobile: 'negocio móvil',
  }

  if (channelsAndStructure.length > 0) {
    summary.push(
      `Operación con ${channelsAndStructure.join(' y ')} en ${structureText[businessStructure]}.`,
    )
  } else {
    summary.push(`Operación en ${structureText[businessStructure]}.`)
  }

  return summary
}

function calculateComplexityScore(
  capabilities: BusinessCapabilitiesNew,
  businessStructure: BusinessStructure,
): number {
  let score = 0
  
  const mainCapabilities = [
    capabilities.sells_products,
    capabilities.sells_services,
    capabilities.manages_events,
    capabilities.manages_recurrence,
  ].filter(Boolean).length

  const subCapabilities = [
    capabilities.sells_products_for_onsite_consumption,
    capabilities.sells_products_for_pickup,
    capabilities.sells_products_with_delivery,
    capabilities.sells_digital_products,
    capabilities.sells_services_by_appointment,
    capabilities.sells_services_by_class,
    capabilities.sells_space_by_reservation,
    capabilities.manages_offsite_catering,
    capabilities.hosts_private_events,
    capabilities.manages_rentals,
    capabilities.manages_memberships,
    capabilities.manages_subscriptions,
  ].filter(Boolean).length

  score += mainCapabilities * 1.5
  score += subCapabilities * 0.5

  if (capabilities.has_online_store) score += 1
  if (capabilities.is_b2b_focused) score += 1

  if (businessStructure === 'multi_location') score += 2
  else if (businessStructure === 'mobile') score += 1

  score = Math.min(Math.max(Math.round(score), 1), 10)
  return score
}

function calculateOperationalTier(
  capabilities: BusinessCapabilitiesNew,
  businessStructure: BusinessStructure,
): string {
  if (
    businessStructure === 'multi_location' ||
    capabilities.manages_rentals ||
    capabilities.manages_memberships ||
    capabilities.manages_subscriptions ||
    getMainOffersCount(capabilities) >= 4 ||
    (getMainOffersCount(capabilities) >= 3 && capabilities.has_online_store)
  ) {
    return 'Sistema Consolidado'
  }

  if (
    capabilities.has_online_store &&
    (capabilities.sells_digital_products || capabilities.manages_subscriptions) &&
    getMainOffersCount(capabilities) <= 2
  ) {
    return 'Negocio Digital'
  }

  if (capabilities.hosts_private_events && capabilities.sells_services_by_class) {
    return 'Centro de Experiencias'
  }

  if (getMainOffersCount(capabilities) === 3) {
    return 'Negocio Integrado'
  }

  if (
    getMainOffersCount(capabilities) === 2 ||
    (getMainOffersCount(capabilities) === 1 && capabilities.has_online_store)
  ) {
    return 'Estructura Funcional'
  }

  if (getMainOffersCount(capabilities) === 1) {
    return 'Base Operativa'
  }

  return 'Sin Configurar'
}

function getMainOffersCount(capabilities: BusinessCapabilitiesNew): number {
  const mainOffers = [
    capabilities.sells_products_for_onsite_consumption,
    capabilities.sells_products_for_pickup,
    capabilities.sells_products_with_delivery,
    capabilities.sells_digital_products,
    capabilities.sells_services_by_appointment,
    capabilities.sells_services_by_class,
    capabilities.sells_space_by_reservation,
    capabilities.manages_offsite_catering,
    capabilities.hosts_private_events,
    capabilities.manages_rentals,
    capabilities.manages_memberships,
    capabilities.manages_subscriptions,
  ]
  return mainOffers.filter(Boolean).length
}

function getInsightMessage(
  capabilities: BusinessCapabilitiesNew,
  businessStructure: BusinessStructure,
): string | null {
  // Memberships/Subscriptions
  if (capabilities.manages_memberships || capabilities.manages_subscriptions) {
    return 'Tu modelo de ingresos recurrentes permite una mayor previsibilidad financiera y relaciones duraderas con clientes.'
  }
  // Multiple locations
  if (businessStructure === 'multi_location') {
    return 'La gestión multi-sucursal requiere sistemas robustos de inventario y reportes centralizados que facilitaremos para ti.'
  }
  // Online + Digital
  if (capabilities.has_online_store && capabilities.sells_digital_products) {
    return 'Tu negocio digital tiene potencial para escalar globalmente con costos operativos reducidos y procesos automatizados.'
  }
  // Events + Services
  if (
    capabilities.hosts_private_events &&
    capabilities.sells_services_by_class
  ) {
    return 'La combinación de eventos y servicios te permite maximizar el uso de tus espacios y crear experiencias completas.'
  }
  // B2B
  if (capabilities.is_b2b_focused) {
    return 'El enfoque B2B suele resultar en tickets promedio más altos y relaciones de cliente más estables y duraderas.'
  }
  // Products + Online
  if (capabilities.sells_products && capabilities.has_online_store) {
    return 'La omnicanalidad te permite capturar ventas tanto presenciales como online, ampliando tu alcance de mercado.'
  }
  // Multiple main capabilities
  const mainCapabilitiesCount = [
    capabilities.sells_products,
    capabilities.sells_services,
    capabilities.manages_events,
    capabilities.manages_recurrence,
  ].filter(Boolean).length
  if (mainCapabilitiesCount >= 3) {
    return 'Tu modelo de negocio diversificado te protege contra fluctuaciones de mercado y crea múltiples fuentes de ingreso.'
  }
  if (mainCapabilitiesCount === 2) {
    return 'La combinación de dos líneas de negocio te permite crear ofertas complementarias y aumentar el valor por cliente.'
  }
  return null
}

function canSubmit(capabilities: BusinessCapabilitiesNew): boolean {
  return (
    capabilities.sells_products ||
    capabilities.sells_services ||
    capabilities.manages_events ||
    capabilities.manages_recurrence
  )
}