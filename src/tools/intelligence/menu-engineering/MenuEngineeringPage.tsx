// MenuEngineeringPage.tsx - Strategic Menu Analysis and Optimization
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  Button,
  SimpleGrid,
  Badge,
  Tabs
} from '@chakra-ui/react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  LightBulbIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';

// Import the existing Menu Engineering components from intelligence components
// import { MenuEngineeringMatrix } from '../../components/MenuEngineeringMatrix/MenuEngineeringMatrix';
// import { MenuEngineeringAnalysis } from '../../components/MenuEngineering/MenuEngineeringAnalysis';

const MenuEngineeringPage: React.FC = () => {
  const [activeView, setActiveView] = useState('matrix');

  const analysisTools = [
    {
      id: 'profitability-matrix',
      title: 'Profitability Matrix',
      description: 'Boston Consulting Group inspired matrix for menu items',
      icon: ChartBarIcon,
      status: 'active',
      metrics: ['High Margin Stars', 'Cash Cow Plowhorses', 'Problem Children', 'Menu Dogs']
    },
    {
      id: 'popularity-analysis',
      title: 'Popularity Analysis',
      description: 'Track which items drive sales volume',
      icon: ArrowTrendingUpIcon,
      status: 'active',
      metrics: ['Sales Velocity', 'Customer Preferences', 'Seasonal Trends']
    },
    {
      id: 'margin-optimization',
      title: 'Margin Optimization',
      description: 'Identify opportunities to improve profitability',
      icon: CurrencyDollarIcon,
      status: 'active',
      metrics: ['Cost Reduction', 'Price Optimization', 'Recipe Engineering']
    },
    {
      id: 'strategic-recommendations',
      title: 'Strategic Recommendations',
      description: 'AI-powered menu strategy suggestions',
      icon: LightBulbIcon,
      status: 'development',
      metrics: ['Promote Stars', 'Engineer Puzzles', 'Retire Dogs', 'Optimize Plowhorses']
    }
  ];

  return (
    <Box p="6">
      <VStack align="start" gap="6">
        {/* Header */}
        <Box>
          <Heading size="xl" mb="2">Menu Engineering</Heading>
          <Text color="gray.600" fontSize="lg">
            Strategic menu analysis and optimization using profitability matrix methodology
          </Text>
        </Box>

        {/* Quick Metrics Cards */}
        <SimpleGrid columns={{ base: 2, md: 4 }} gap="4" w="full">
          <Card.Root>
            <Card.Body>
              <VStack align="start" gap="2">
                <HStack>
                  <StarIcon className="w-5 h-5 text-yellow-500" />
                  <Text fontSize="sm" fontWeight="medium">Stars</Text>
                </HStack>
                <Text fontSize="2xl" fontWeight="bold" color="yellow.500">8</Text>
                <Text fontSize="xs" color="gray.600">High margin, high popularity</Text>
              </VStack>
            </Card.Body>
          </Card.Root>
          
          <Card.Root>
            <Card.Body>
              <VStack align="start" gap="2">
                <HStack>
                  <CurrencyDollarIcon className="w-5 h-5 text-green-500" />
                  <Text fontSize="sm" fontWeight="medium">Plowhorses</Text>
                </HStack>
                <Text fontSize="2xl" fontWeight="bold" color="green.500">12</Text>
                <Text fontSize="xs" color="gray.600">Low margin, high popularity</Text>
              </VStack>
            </Card.Body>
          </Card.Root>
          
          <Card.Root>
            <Card.Body>
              <VStack align="start" gap="2">
                <HStack>
                  <DocumentChartBarIcon className="w-5 h-5 text-orange-500" />
                  <Text fontSize="sm" fontWeight="medium">Puzzles</Text>
                </HStack>
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">5</Text>
                <Text fontSize="xs" color="gray.600">High margin, low popularity</Text>
              </VStack>
            </Card.Body>
          </Card.Root>
          
          <Card.Root>
            <Card.Body>
              <VStack align="start" gap="2">
                <HStack>
                  <ArrowTrendingUpIcon className="w-5 h-5 text-red-500" />
                  <Text fontSize="sm" fontWeight="medium">Dogs</Text>
                </HStack>
                <Text fontSize="2xl" fontWeight="bold" color="red.500">3</Text>
                <Text fontSize="xs" color="gray.600">Low margin, low popularity</Text>
              </VStack>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>

        {/* Analysis Tools */}
        <Box w="full">
          <Text fontSize="lg" fontWeight="semibold" mb="4">Analysis Tools</Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
            {analysisTools.map((tool) => (
              <Card.Root 
                key={tool.id} 
                variant="outline"
                cursor="pointer"
                _hover={{ shadow: 'md', borderColor: 'blue.200' }}
              >
                <Card.Body>
                  <VStack align="start" gap="4">
                    <HStack justify="space-between" w="full">
                      <HStack gap="3">
                        <Box p="2" bg="blue.50" borderRadius="md">
                          <tool.icon className="w-5 h-5 text-blue-600" />
                        </Box>
                        <Text fontWeight="semibold">{tool.title}</Text>
                      </HStack>
                      <Badge 
                        colorPalette={tool.status === 'active' ? 'green' : 'yellow'}
                        size="sm"
                      >
                        {tool.status === 'active' ? 'Disponible' : 'En Desarrollo'}
                      </Badge>
                    </HStack>
                    
                    <Text fontSize="sm" color="gray.600">
                      {tool.description}
                    </Text>
                    
                    <VStack align="start" gap="1" w="full">
                      <Text fontSize="xs" fontWeight="medium" color="gray.500">
                        Métricas incluidas:
                      </Text>
                      {tool.metrics.map((metric, index) => (
                        <Text key={index} fontSize="xs" color="gray.600">
                          • {metric}
                        </Text>
                      ))}
                    </VStack>
                  </VStack>
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>
        </Box>

        {/* Main Analysis Interface */}
        <Card.Root w="full">
          <Card.Header>
            <Tabs.Root value={activeView} onValueChange={(details) => setActiveView(details.value)}>
              <Tabs.List>
                <Tabs.Trigger value="matrix">
                  <HStack gap="2">
                    <ChartBarIcon className="w-4 h-4" />
                    <Text>Profitability Matrix</Text>
                  </HStack>
                </Tabs.Trigger>
                <Tabs.Trigger value="analysis">
                  <HStack gap="2">
                    <DocumentChartBarIcon className="w-4 h-4" />
                    <Text>Strategic Analysis</Text>
                  </HStack>
                </Tabs.Trigger>
                <Tabs.Trigger value="recommendations">
                  <HStack gap="2">
                    <LightBulbIcon className="w-4 h-4" />
                    <Text>Recommendations</Text>
                  </HStack>
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="matrix" mt="4">
                <Box p="6" textAlign="center">
                  <VStack gap="4">
                    <ChartBarIcon className="w-16 h-16 text-blue-500 mx-auto" />
                    <Heading size="md">Profitability Matrix</Heading>
                    <Text color="gray.600">
                      Menu engineering matrix analysis coming soon...
                    </Text>
                  </VStack>
                </Box>
              </Tabs.Content>

              <Tabs.Content value="analysis" mt="4">
                <Box p="6" textAlign="center">
                  <VStack gap="4">
                    <DocumentChartBarIcon className="w-16 h-16 text-purple-500 mx-auto" />
                    <Heading size="md">Strategic Analysis</Heading>
                    <Text color="gray.600">
                      Menu engineering strategic analysis coming soon...
                    </Text>
                  </VStack>
                </Box>
              </Tabs.Content>

              <Tabs.Content value="recommendations" mt="4">
                <Box p="6" textAlign="center">
                  <VStack gap="4">
                    <LightBulbIcon className="w-16 h-16 text-yellow-500 mx-auto" />
                    <Heading size="md">Strategic Recommendations</Heading>
                    <Text color="gray.600">
                      AI-powered menu strategy recommendations coming soon...
                    </Text>
                    <Badge colorPalette="yellow">En Desarrollo</Badge>
                  </VStack>
                </Box>
              </Tabs.Content>
            </Tabs.Root>
          </Card.Header>
        </Card.Root>
      </VStack>
    </Box>
  );
};

export default MenuEngineeringPage;