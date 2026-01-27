/**
 * Fulfillment Page - Order Fulfillment Operations - v6.0 Magic Patterns
 * 
 * Main page for managing delivery, pickup, and onsite fulfillment operations
 */

import { useState } from 'react';
import {
  Box,
  Tabs,
  Icon,
  Alert,
  Stack,
  Flex,
  Text,
  SimpleGrid
} from '@/shared/ui';
import { TruckIcon, ShoppingBagIcon, HomeIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

import { PoliciesTab } from './tabs/policies';

export default function FulfillmentPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'policies'>('overview');

  return (
    <Box position="relative" minH="100vh" bg="bg.canvas" overflow="hidden">
      {/* Decorative Background Blobs */}
      <Box
        position="absolute"
        top="-10%"
        right="-5%"
        width="500px"
        height="500px"
        bg="purple.50"
        borderRadius="full"
        opacity="0.4"
        filter="blur(80px)"
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-10%"
        left="-5%"
        width="400px"
        height="400px"
        bg="blue.50"
        borderRadius="full"
        opacity="0.4"
        filter="blur(80px)"
        pointerEvents="none"
      />

      <Box position="relative" zIndex="1" p={{ base: "6", md: "8" }}>

      <Stack gap="8" w="100%">
        {/* Header */}
        <Flex justify="space-between" align="center" flexWrap="wrap" gap="4">
          <Flex align="center" gap="3">
            <Box
              p="3"
              bg="linear-gradient(135deg, var(--chakra-colors-purple-400), var(--chakra-colors-purple-600))"
              borderRadius="xl"
              shadow="lg"
            >
              🚚
            </Box>
            <Box as="h1" fontSize="2xl" fontWeight="bold">
              Gestión de Fulfillment
            </Box>
          </Flex>
        </Flex>

        {/* Main Tabs */}
        <Box bg="bg.surface" p="6" borderRadius="2xl" shadow="xl">
          <Tabs.Root
            defaultValue="overview"
            value={activeTab}
            onValueChange={(details) => setActiveTab(details.value as typeof activeTab)}
            variant="enclosed"
            size="lg"
          >
            <Tabs.List>
              <Tabs.Trigger value="overview">
                <Icon icon={TruckIcon} size="sm" />
                Fulfillment
              </Tabs.Trigger>
              <Tabs.Trigger value="policies">
                <Icon icon={Cog6ToothIcon} size="sm" />
                Políticas
              </Tabs.Trigger>
              <Tabs.Indicator />
            </Tabs.List>

            {/* Overview Tab */}
            <Tabs.Content value="overview">
              <Box pt="6">
                <Stack gap="6">
                  <Alert status="info" title="Módulo en Construcción">
                    El módulo de gestión de fulfillment está en desarrollo. Por ahora puedes configurar las políticas en la pestaña "Políticas".
                  </Alert>
                  
                  <SimpleGrid columns={{ base: 1, md: 3 }} gap="6">
                    {/* Delivery Card */}
                    <Box
                      position="relative"
                      overflow="hidden"
                      bg="bg.surface"
                      p="6"
                      borderRadius="xl"
                      shadow="md"
                      transition="all 0.2s"
                      _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                    >
                      <Box
                        position="absolute"
                        top="0"
                        left="0"
                        right="0"
                        h="3px"
                        bg="linear-gradient(90deg, var(--chakra-colors-purple-400) 0%, var(--chakra-colors-purple-600) 100%)"
                      />
                      <Stack gap="3" align="center" textAlign="center">
                        <Box p="3" bg="purple.500/10" borderRadius="lg">
                          <Icon icon={TruckIcon} size="lg" color="purple.600" />
                        </Box>
                        <Text fontSize="lg" fontWeight="bold">
                          Delivery
                        </Text>
                        <Text fontSize="sm" color="text.muted">
                          Entregas a domicilio
                        </Text>
                      </Stack>
                    </Box>

                    {/* Pickup Card */}
                    <Box
                      position="relative"
                      overflow="hidden"
                      bg="bg.surface"
                      p="6"
                      borderRadius="xl"
                      shadow="md"
                      transition="all 0.2s"
                      _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                    >
                      <Box
                        position="absolute"
                        top="0"
                        left="0"
                        right="0"
                        h="3px"
                        bg="linear-gradient(90deg, var(--chakra-colors-blue-400) 0%, var(--chakra-colors-blue-600) 100%)"
                      />
                      <Stack gap="3" align="center" textAlign="center">
                        <Box p="3" bg="blue.500/10" borderRadius="lg">
                          <Icon icon={ShoppingBagIcon} size="lg" color="blue.600" />
                        </Box>
                        <Text fontSize="lg" fontWeight="bold">
                          Pickup
                        </Text>
                        <Text fontSize="sm" color="text.muted">
                          Retiro en local
                        </Text>
                      </Stack>
                    </Box>

                    {/* Onsite Card */}
                    <Box
                      position="relative"
                      overflow="hidden"
                      bg="bg.surface"
                      p="6"
                      borderRadius="xl"
                      shadow="md"
                      transition="all 0.2s"
                      _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                    >
                      <Box
                        position="absolute"
                        top="0"
                        left="0"
                        right="0"
                        h="3px"
                        bg="linear-gradient(90deg, var(--chakra-colors-green-400) 0%, var(--chakra-colors-green-600) 100%)"
                      />
                      <Stack gap="3" align="center" textAlign="center">
                        <Box p="3" bg="green.500/10" borderRadius="lg">
                          <Icon icon={HomeIcon} size="lg" color="green.600" />
                        </Box>
                        <Text fontSize="lg" fontWeight="bold">
                          Onsite
                        </Text>
                        <Text fontSize="sm" color="text.muted">
                          Consumo en sitio
                        </Text>
                      </Stack>
                    </Box>
                  </SimpleGrid>
                </Stack>
              </Box>
            </Tabs.Content>

            {/* Policies Tab */}
            <Tabs.Content value="policies">
              <Box pt="6">
                <PoliciesTab />
              </Box>
            </Tabs.Content>
          </Tabs.Root>
        </Box>
      </Stack>
      </Box>
    </Box>
  );
}
