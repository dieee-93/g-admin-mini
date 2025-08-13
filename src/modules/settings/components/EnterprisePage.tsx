// EnterprisePage.tsx - Enterprise Management Tools
import React from 'react';
import { Box, VStack, Text, Heading, Card, SimpleGrid, Badge, HStack } from '@chakra-ui/react';
import { 
  BuildingOfficeIcon,
  GlobeAltIcon,
  UsersIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const EnterprisePage: React.FC = () => {
  return (
    <Box p="6">
      <VStack align="start" gap="6">
        <Box>
          <Heading size="xl" mb="2">Enterprise Management</Heading>
          <Text color="gray.600">
            Multi-location and enterprise-level features
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="4" w="full">
          <Card.Root>
            <Card.Body>
              <HStack gap="3">
                <BuildingOfficeIcon className="w-8 h-8 text-blue-500" />
                <VStack align="start" gap="1">
                  <Text fontWeight="semibold">Locations</Text>
                  <Badge colorPalette="blue">5 Active</Badge>
                </VStack>
              </HStack>
            </Card.Body>
          </Card.Root>
          
          <Card.Root>
            <Card.Body>
              <HStack gap="3">
                <UsersIcon className="w-8 h-8 text-green-500" />
                <VStack align="start" gap="1">
                  <Text fontWeight="semibold">Franchise</Text>
                  <Badge colorPalette="green">3 Partners</Badge>
                </VStack>
              </HStack>
            </Card.Body>
          </Card.Root>
          
          <Card.Root>
            <Card.Body>
              <HStack gap="3">
                <GlobeAltIcon className="w-8 h-8 text-purple-500" />
                <VStack align="start" gap="1">
                  <Text fontWeight="semibold">Regions</Text>
                  <Badge colorPalette="purple">2 Zones</Badge>
                </VStack>
              </HStack>
            </Card.Body>
          </Card.Root>
          
          <Card.Root>
            <Card.Body>
              <HStack gap="3">
                <ChartBarIcon className="w-8 h-8 text-orange-500" />
                <VStack align="start" gap="1">
                  <Text fontWeight="semibold">Analytics</Text>
                  <Badge colorPalette="orange">Consolidated</Badge>
                </VStack>
              </HStack>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap="6" w="full">
          <Card.Root>
            <Card.Header>
              <Text fontWeight="semibold">Multi-Location Features</Text>
            </Card.Header>
            <Card.Body>
              <VStack align="start" gap="3">
                <Text fontSize="sm">🏢 Location Management</Text>
                <Text fontSize="sm">📊 Consolidated Reporting</Text>
                <Text fontSize="sm">👥 Cross-Location Staff</Text>
                <Text fontSize="sm">📦 Centralized Inventory</Text>
                <Text fontSize="sm">💰 Unified Pricing</Text>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Text fontWeight="semibold">Franchise Management</Text>
            </Card.Header>
            <Card.Body>
              <VStack align="start" gap="3">
                <Text fontSize="sm">🤝 Partner Onboarding</Text>
                <Text fontSize="sm">📈 Performance Monitoring</Text>
                <Text fontSize="sm">💼 Brand Compliance</Text>
                <Text fontSize="sm">📋 Standards Enforcement</Text>
                <Text fontSize="sm">💡 Best Practice Sharing</Text>
              </VStack>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>

        <Card.Root w="full">
          <Card.Header>
            <Heading size="md">Enterprise Analytics</Heading>
          </Card.Header>
          <Card.Body>
            <Text color="gray.600" mb="4">
              Comprehensive analytics across all locations and franchise partners
            </Text>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
              <VStack align="start" gap="2">
                <Text fontWeight="medium">Performance Metrics</Text>
                <Text fontSize="sm" color="gray.600">Cross-location KPIs</Text>
              </VStack>
              <VStack align="start" gap="2">
                <Text fontWeight="medium">Benchmarking</Text>
                <Text fontSize="sm" color="gray.600">Location comparisons</Text>
              </VStack>
              <VStack align="start" gap="2">
                <Text fontWeight="medium">Forecasting</Text>
                <Text fontSize="sm" color="gray.600">Enterprise predictions</Text>
              </VStack>
            </SimpleGrid>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
};

export default EnterprisePage;
export { EnterprisePage };