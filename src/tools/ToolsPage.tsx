// ToolsPage.tsx - Comprehensive Tools Hub for G-Admin Mini
// 3-Tier Architecture: Intelligence + Operational + Admin

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Card,
  SimpleGrid,
  Tabs,
  Heading,
  Icon as ChakraIcon
} from '@chakra-ui/react';
import {
  ChartBarIcon,
  CogIcon,
  WrenchScrewdriverIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  CpuChipIcon,
  BuildingOfficeIcon,
  CommandLineIcon,
  DocumentChartBarIcon,
  Cog8ToothIcon
} from '@heroicons/react/24/outline';

// Tools organized by architectural tiers
const TOOLS_STRUCTURE = {
  intelligence: {
    title: '🧠 Intelligence',
    description: 'AI-powered analysis and optimization tools',
    color: 'orange',
    tools: [
      {
        id: 'recipes',
        title: 'Recipe Intelligence',
        description: 'AI recipe optimization and cost analysis',
        icon: LightBulbIcon,
        path: '/tools/intelligence/recipes',
        status: 'active',
        features: ['Cost Optimization', 'Ingredient Substitution', 'Yield Analysis']
      },
      {
        id: 'menu-engineering',
        title: 'Menu Engineering',
        description: 'Strategic menu analysis and optimization',
        icon: ChartBarIcon,
        path: '/tools/intelligence/menu-engineering',
        status: 'active',
        features: ['Profitability Matrix', 'Strategy Recommendations', 'Demand Analysis']
      },
      {
        id: 'business-analytics',
        title: 'Business Analytics', 
        description: 'Cross-module analytics and insights',
        icon: DocumentChartBarIcon,
        path: '/tools/intelligence/analytics',
        status: 'active',
        features: ['Executive Dashboard', 'Cross-Module Analytics', 'Custom Reports']
      },
      {
        id: 'predictive-analytics',
        title: 'Predictive Analytics',
        description: 'ML-powered forecasting and predictions',
        icon: CpuChipIcon,
        path: '/tools/intelligence/predictive',
        status: 'active',
        features: ['Demand Forecasting', 'Seasonal Trends', 'Risk Analysis']
      },
      {
        id: 'abc-analysis',
        title: 'ABC Analysis',
        description: 'Advanced inventory classification using Pareto principle',
        icon: BuildingOfficeIcon,
        path: '/tools/intelligence/abc-analysis',
        status: 'active',
        features: ['Pareto Classification', 'Strategic Recommendations', 'Revenue Analysis']
      }
    ]
  },
  operational: {
    title: '🔧 Operational',
    description: 'System monitoring and operational tools',
    color: 'blue',
    tools: [
      {
        id: 'diagnostics',
        title: 'System Diagnostics',
        description: 'Performance monitoring and health checks',
        icon: WrenchScrewdriverIcon,
        path: '/tools/operational/diagnostics',
        status: 'active',
        features: ['Performance Monitoring', 'Health Checks', 'Error Tracking']
      },
      {
        id: 'reporting',
        title: 'Advanced Reporting',
        description: 'Custom reports and data visualization',
        icon: DocumentChartBarIcon,
        path: '/tools/operational/reporting',
        status: 'active',
        features: ['Custom Reports', 'Data Export', 'Automated Insights']
      },
      {
        id: 'maintenance',
        title: 'Maintenance Tools',
        description: 'Database maintenance and optimization',
        icon: Cog8ToothIcon,
        path: '/tools/operational/maintenance',
        status: 'development',
        features: ['DB Optimization', 'Cache Management', 'Data Cleanup']
      }
    ]
  },
  admin: {
    title: '⚙️ Admin',
    description: 'Enterprise management and integrations',
    color: 'purple',
    tools: [
      {
        id: 'enterprise',
        title: 'Enterprise Management',
        description: 'Multi-location and enterprise features',
        icon: BuildingOfficeIcon,
        path: '/tools/admin/enterprise',
        status: 'active',
        features: ['Multi-Location', 'Franchise Management', 'Corporate Analytics']
      },
      {
        id: 'integrations',
        title: 'API Integrations',
        description: 'Third-party integrations and APIs',
        icon: CommandLineIcon,
        path: '/tools/admin/integrations',
        status: 'active',
        features: ['API Management', 'Webhooks', 'External Services']
      },
      {
        id: 'automation',
        title: 'Process Automation',
        description: 'Workflow automation and triggers',
        icon: RocketLaunchIcon,
        path: '/tools/admin/automation',
        status: 'development',
        features: ['Workflow Builder', 'Automated Tasks', 'Event Triggers']
      }
    ]
  }
};

// Tool card component
function ToolCard({ tool, tierColor }: { tool: any, tierColor: string }) {
  const navigate = useNavigate();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'development': return 'yellow';
      case 'deprecated': return 'red';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Disponible';
      case 'development': return 'En Desarrollo';
      case 'deprecated': return 'Depreciado';
      default: return 'Desconocido';
    }
  };

  return (
    <Card.Root 
      variant="outline" 
      cursor="pointer" 
      transition="all 0.2s"
      _hover={{ 
        shadow: 'md', 
        borderColor: `${tierColor}.200`,
        transform: 'translateY(-2px)'
      }}
      onClick={() => tool.status === 'active' && navigate(tool.path)}
      opacity={tool.status === 'development' ? 0.8 : 1}
    >
      <Card.Header pb="3">
        <HStack justify="space-between" align="start">
          <HStack gap="3">
            <Box
              p="2"
              bg={`${tierColor}.50`}
              borderRadius="md"
              color={`${tierColor}.600`}
            >
              <tool.icon className="w-5 h-5" />
            </Box>
            <VStack align="start" gap="1">
              <Text fontWeight="semibold" fontSize="md">
                {tool.title}
              </Text>
              <Badge 
                colorPalette={getStatusColor(tool.status)}
                size="sm"
              >
                {getStatusLabel(tool.status)}
              </Badge>
            </VStack>
          </HStack>
        </HStack>
      </Card.Header>
      
      <Card.Body pt="0">
        <VStack align="start" gap="3">
          <Text fontSize="sm" color="gray.600" lineHeight="1.4">
            {tool.description}
          </Text>
          
          <VStack align="start" gap="1" w="full">
            <Text fontSize="xs" fontWeight="medium" color="gray.500">
              Características:
            </Text>
            {tool.features.map((feature: string, index: number) => (
              <Text key={index} fontSize="xs" color="gray.600">
                • {feature}
              </Text>
            ))}
          </VStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}

// Main Tools Page Component
export function ToolsPage() {
  const [selectedTier, setSelectedTier] = useState('intelligence');

  return (
    <Box p="6">
      <VStack align="start" gap="6">
        {/* Header */}
        <Box>
          <Heading size="xl" mb="2">Tools & Intelligence</Heading>
          <Text color="gray.600" fontSize="lg">
            Herramientas de inteligencia, diagnósticos y administración empresarial
          </Text>
        </Box>

        {/* Tier Navigation */}
        <Tabs.Root value={selectedTier} onValueChange={(details) => setSelectedTier(details.value)} w="full">
          <Tabs.List>
            {Object.entries(TOOLS_STRUCTURE).map(([key, tier]) => (
              <Tabs.Trigger key={key} value={key}>
                <HStack gap="2">
                  <Text>{tier.title}</Text>
                  <Badge colorPalette={tier.color} size="sm">
                    {tier.tools.filter(t => t.status === 'active').length}
                  </Badge>
                </HStack>
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {Object.entries(TOOLS_STRUCTURE).map(([key, tier]) => (
            <Tabs.Content key={key} value={key}>
              <VStack align="start" gap="6" mt="6">
                {/* Tier Description */}
                <Box>
                  <Text fontSize="lg" fontWeight="medium" mb="2">
                    {tier.title}
                  </Text>
                  <Text color="gray.600">
                    {tier.description}
                  </Text>
                </Box>

                {/* Tools Grid */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="6" w="full">
                  {tier.tools.map((tool) => (
                    <ToolCard 
                      key={tool.id} 
                      tool={tool} 
                      tierColor={tier.color}
                    />
                  ))}
                </SimpleGrid>
              </VStack>
            </Tabs.Content>
          ))}
        </Tabs.Root>

        {/* Quick Stats */}
        <Card.Root w="full" variant="subtle">
          <Card.Body>
            <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
              <VStack>
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                  {TOOLS_STRUCTURE.intelligence.tools.filter(t => t.status === 'active').length}
                </Text>
                <Text fontSize="sm" color="gray.600">Intelligence Tools</Text>
              </VStack>
              <VStack>
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {TOOLS_STRUCTURE.operational.tools.filter(t => t.status === 'active').length}
                </Text>
                <Text fontSize="sm" color="gray.600">Operational Tools</Text>
              </VStack>
              <VStack>
                <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                  {TOOLS_STRUCTURE.admin.tools.filter(t => t.status === 'active').length}
                </Text>
                <Text fontSize="sm" color="gray.600">Admin Tools</Text>
              </VStack>
              <VStack>
                <Text fontSize="2xl" fontWeight="bold" color="yellow.500">
                  {Object.values(TOOLS_STRUCTURE).reduce((acc, tier) => 
                    acc + tier.tools.filter(t => t.status === 'development').length, 0
                  )}
                </Text>
                <Text fontSize="sm" color="gray.600">En Desarrollo</Text>
              </VStack>
            </SimpleGrid>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
}

export default ToolsPage;