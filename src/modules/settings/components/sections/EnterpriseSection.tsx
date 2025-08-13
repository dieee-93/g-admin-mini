// EnterpriseSection.tsx - Enterprise Management Tools (migrated from tools)
import React from 'react';
import { Box, VStack, Text, Heading, Card, SimpleGrid, Badge, HStack, Button } from '@chakra-ui/react';
import { 
  BuildingOfficeIcon,
  GlobeAltIcon,
  UsersIcon,
  ChartBarIcon,
  MapPinIcon,
  CogIcon,
  UserGroupIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const EnterpriseSection: React.FC = () => {
  // Mock enterprise data
  const locations = [
    {
      id: 'main',
      name: 'Restaurant Main - Downtown',
      address: 'Av. Corrientes 1234, CABA',
      status: 'active',
      revenue: '$45,230',
      orders: 234,
      staff: 12
    },
    {
      id: 'branch1',
      name: 'Restaurant Norte - Palermo',
      address: 'Thames 567, Palermo',
      status: 'active',
      revenue: '$32,180',
      orders: 187,
      staff: 8
    },
    {
      id: 'branch2',
      name: 'Restaurant Sur - San Telmo',
      address: 'Defensa 890, San Telmo',
      status: 'active',
      revenue: '$28,950',
      orders: 156,
      staff: 7
    },
    {
      id: 'new',
      name: 'Restaurant Oeste - Caballito',
      address: 'Rivadavia 2345, Caballito',
      status: 'opening',
      revenue: '$0',
      orders: 0,
      staff: 4
    }
  ];

  const franchiseMetrics = [
    {
      name: 'Total Locations',
      value: '4',
      status: 'active',
      change: '+1'
    },
    {
      name: 'Combined Revenue',
      value: '$106,360',
      status: 'up',
      change: '+8.2%'
    },
    {
      name: 'Total Staff',
      value: '31',
      status: 'stable',
      change: '+3'
    },
    {
      name: 'Market Coverage',
      value: '4 Zones',
      status: 'good',
      change: '+25%'
    }
  ];

  const managementTools = [
    {
      id: 'multi_reporting',
      name: 'Multi-Location Reporting',
      description: 'Consolidated reports across all locations',
      icon: ChartBarIcon,
      status: 'active'
    },
    {
      id: 'staff_management',
      name: 'Centralized Staff Management',
      description: 'Manage staff across all locations',
      icon: UserGroupIcon,
      status: 'active'
    },
    {
      id: 'inventory_sync',
      name: 'Inventory Synchronization',
      description: 'Real-time inventory across locations',
      icon: CogIcon,
      status: 'development'
    },
    {
      id: 'financial_consolidation',
      name: 'Financial Consolidation',
      description: 'Unified financial reporting and analysis',
      icon: CurrencyDollarIcon,
      status: 'active'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'opening': return 'blue';
      case 'maintenance': return 'yellow';
      case 'closed': return 'red';
      case 'up': return 'green';
      case 'down': return 'red';
      case 'stable': return 'gray';
      case 'good': return 'green';
      case 'development': return 'yellow';
      default: return 'gray';
    }
  };

  return (
    <VStack align="start" gap="6">
      {/* Header */}
      <Box>
        <Heading size="lg" mb="2">Enterprise Management</Heading>
        <Text color="gray.600">
          Multi-location and enterprise-level features
        </Text>
      </Box>

      {/* Enterprise Overview */}
      <Card.Root w="full">
        <Card.Header>
          <HStack gap="3">
            <BuildingOfficeIcon className="w-6 h-6 text-blue-500" />
            <Text fontSize="lg" fontWeight="semibold">Enterprise Overview</Text>
          </HStack>
        </Card.Header>
        <Card.Body>
          <SimpleGrid columns={{ base: 2, md: 4 }} gap="6">
            {franchiseMetrics.map((metric) => (
              <VStack key={metric.name} align="center" gap="2">
                <Text fontSize="sm" color="gray.600" textAlign="center">{metric.name}</Text>
                <Text fontSize="2xl" fontWeight="bold">{metric.value}</Text>
                <Badge 
                  colorPalette={getStatusColor(metric.status)}
                  variant="subtle"
                  size="sm"
                >
                  {metric.change}
                </Badge>
              </VStack>
            ))}
          </SimpleGrid>
        </Card.Body>
      </Card.Root>

      {/* Locations Management */}
      <Card.Root w="full">
        <Card.Header>
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="semibold">Locations</Text>
            <Button size="sm" colorPalette="blue" leftIcon={<BuildingOfficeIcon className="w-4 h-4" />}>
              Add Location
            </Button>
          </HStack>
        </Card.Header>
        <Card.Body>
          <VStack gap="4">
            {locations.map((location) => (
              <Card.Root key={location.id} variant="outline" w="full">
                <Card.Body>
                  <HStack justify="space-between">
                    <HStack gap="4">
                      <BuildingOfficeIcon className="w-8 h-8 text-blue-500" />
                      <VStack align="start" gap="1">
                        <Text fontSize="lg" fontWeight="semibold">{location.name}</Text>
                        <HStack gap="1">
                          <MapPinIcon className="w-3 h-3 text-gray-500" />
                          <Text fontSize="sm" color="gray.600">{location.address}</Text>
                        </HStack>
                      </VStack>
                    </HStack>
                    
                    <HStack gap="6">
                      <VStack align="center" gap="1">
                        <Text fontSize="sm" color="gray.600">Revenue</Text>
                        <Text fontSize="lg" fontWeight="bold">{location.revenue}</Text>
                      </VStack>
                      
                      <VStack align="center" gap="1">
                        <Text fontSize="sm" color="gray.600">Orders</Text>
                        <Text fontSize="lg" fontWeight="bold">{location.orders}</Text>
                      </VStack>
                      
                      <VStack align="center" gap="1">
                        <Text fontSize="sm" color="gray.600">Staff</Text>
                        <Text fontSize="lg" fontWeight="bold">{location.staff}</Text>
                      </VStack>
                      
                      <VStack align="center" gap="2">
                        <Badge 
                          colorPalette={getStatusColor(location.status)}
                          variant="solid"
                        >
                          {location.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Manage
                        </Button>
                      </VStack>
                    </HStack>
                  </HStack>
                </Card.Body>
              </Card.Root>
            ))}
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Management Tools */}
      <Card.Root w="full">
        <Card.Header>
          <Text fontSize="lg" fontWeight="semibold">Enterprise Tools</Text>
        </Card.Header>
        <Card.Body>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
            {managementTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card.Root key={tool.id} variant="outline">
                  <Card.Body>
                    <VStack align="start" gap="4">
                      <HStack justify="space-between" w="full">
                        <Icon className="w-8 h-8 text-blue-500" />
                        <Badge 
                          colorPalette={getStatusColor(tool.status)}
                          variant="subtle"
                        >
                          {tool.status}
                        </Badge>
                      </HStack>
                      
                      <VStack align="start" gap="2">
                        <Text fontSize="lg" fontWeight="semibold">{tool.name}</Text>
                        <Text fontSize="sm" color="gray.600">{tool.description}</Text>
                      </VStack>
                      
                      <Button 
                        size="sm" 
                        colorPalette="blue" 
                        variant="outline" 
                        w="full"
                        disabled={tool.status !== 'active'}
                      >
                        {tool.status === 'active' ? 'Configure' : 
                         tool.status === 'development' ? 'Coming Soon' : 'Setup'}
                      </Button>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              );
            })}
          </SimpleGrid>
        </Card.Body>
      </Card.Root>

      {/* Franchise Configuration */}
      <Card.Root w="full">
        <Card.Header>
          <Text fontSize="lg" fontWeight="semibold">Franchise Configuration</Text>
        </Card.Header>
        <Card.Body>
          <VStack align="start" gap="4">
            <Text fontSize="sm" color="gray.700">
              Configure enterprise-wide settings, policies, and operational standards across all locations.
            </Text>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} gap="4" w="full">
              <Button variant="outline" colorPalette="blue">
                Brand Standards
              </Button>
              <Button variant="outline" colorPalette="green">
                Operational Policies
              </Button>
              <Button variant="outline" colorPalette="purple">
                Financial Controls
              </Button>
              <Button variant="outline" colorPalette="orange">
                Staff Policies
              </Button>
              <Button variant="outline" colorPalette="teal">
                Menu Standards
              </Button>
              <Button variant="outline" colorPalette="red">
                Quality Controls
              </Button>
            </SimpleGrid>
          </VStack>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
};

export default EnterpriseSection;