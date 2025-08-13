// ReportingPage.tsx - Advanced Reporting Tools
import React from 'react';
import { Box, VStack, Text, Heading, Card, SimpleGrid, Button, HStack } from '@chakra-ui/react';
import { 
  DocumentChartBarIcon,
  TableCellsIcon,
  ChartBarIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const ReportingPage: React.FC = () => {
  return (
    <Box p="6">
      <VStack align="start" gap="6">
        <Box>
          <Heading size="xl" mb="2">Advanced Reporting</Heading>
          <Text color="gray.600">
            Custom reports and data visualization tools
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap="6" w="full">
          <Card.Root>
            <Card.Header>
              <HStack gap="3">
                <DocumentChartBarIcon className="w-6 h-6 text-blue-500" />
                <Text fontWeight="semibold">Sales Reports</Text>
              </HStack>
            </Card.Header>
            <Card.Body>
              <VStack align="start" gap="3">
                <Text fontSize="sm" color="gray.600">
                  Comprehensive sales analytics and performance reports
                </Text>
                <Button size="sm" variant="outline">
                  Generate Report
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <HStack gap="3">
                <TableCellsIcon className="w-6 h-6 text-green-500" />
                <Text fontWeight="semibold">Inventory Reports</Text>
              </HStack>
            </Card.Header>
            <Card.Body>
              <VStack align="start" gap="3">
                <Text fontSize="sm" color="gray.600">
                  Stock levels, movements, and inventory analytics
                </Text>
                <Button size="sm" variant="outline">
                  Generate Report
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <HStack gap="3">
                <ChartBarIcon className="w-6 h-6 text-purple-500" />
                <Text fontWeight="semibold">Financial Reports</Text>
              </HStack>
            </Card.Header>
            <Card.Body>
              <VStack align="start" gap="3">
                <Text fontSize="sm" color="gray.600">
                  P&L, balance sheets, and financial analytics
                </Text>
                <Button size="sm" variant="outline">
                  Generate Report
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <HStack gap="3">
                <CalendarDaysIcon className="w-6 h-6 text-orange-500" />
                <Text fontWeight="semibold">Custom Reports</Text>
              </HStack>
            </Card.Header>
            <Card.Body>
              <VStack align="start" gap="3">
                <Text fontSize="sm" color="gray.600">
                  Build custom reports with flexible parameters
                </Text>
                <Button size="sm" variant="outline">
                  Report Builder
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>

        <Card.Root w="full">
          <Card.Header>
            <Heading size="md">Reporting Features</Heading>
          </Card.Header>
          <Card.Body>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
              <VStack align="start" gap="2">
                <Text fontWeight="medium">Available Features:</Text>
                <Text fontSize="sm">📊 Data Visualization</Text>
                <Text fontSize="sm">📅 Scheduled Reports</Text>
                <Text fontSize="sm">📤 Export to PDF/Excel</Text>
                <Text fontSize="sm">📧 Email Delivery</Text>
              </VStack>
              <VStack align="start" gap="2">
                <Text fontWeight="medium">Coming Soon:</Text>
                <Text fontSize="sm">🤖 AI-Generated Insights</Text>
                <Text fontSize="sm">📈 Predictive Analytics</Text>
                <Text fontSize="sm">🔄 Real-time Dashboards</Text>
                <Text fontSize="sm">🎯 Custom KPI Tracking</Text>
              </VStack>
            </SimpleGrid>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
};

export default ReportingPage;
export { ReportingPage };