// SystemSection.tsx - System Diagnostics and Performance Monitoring (migrated from tools)
import React from 'react';
import { Box, VStack, Text, Heading, Card, SimpleGrid, Badge, HStack, Progress } from '@chakra-ui/react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  CpuChipIcon,
  ServerIcon,
  ClockIcon,
  ShieldCheckIcon,
  WifiIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';

const SystemSection: React.FC = () => {
  // Mock system metrics
  const systemHealth = {
    overall: 'healthy',
    uptime: '7 days, 12 hours',
    performance: 87,
    memory: 65,
    storage: 42,
    network: 'stable'
  };

  const healthChecks = [
    {
      id: 'database',
      name: 'Database Connection',
      status: 'healthy',
      latency: '12ms',
      lastCheck: '2 minutes ago'
    },
    {
      id: 'api',
      name: 'API Services',
      status: 'healthy',
      latency: '45ms',
      lastCheck: '1 minute ago'
    },
    {
      id: 'storage',
      name: 'File Storage',
      status: 'warning',
      latency: '156ms',
      lastCheck: '3 minutes ago'
    },
    {
      id: 'cache',
      name: 'Cache System',
      status: 'healthy',
      latency: '8ms',
      lastCheck: '1 minute ago'
    }
  ];

  const performanceMetrics = [
    {
      name: 'CPU Usage',
      value: 34,
      status: 'good',
      unit: '%'
    },
    {
      name: 'Memory Usage',
      value: 65,
      status: 'fair',
      unit: '%'
    },
    {
      name: 'Disk Usage',
      value: 42,
      status: 'good',
      unit: '%'
    },
    {
      name: 'Network Load',
      value: 18,
      status: 'excellent',
      unit: '%'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'excellent':
      case 'good':
        return 'green';
      case 'warning':
      case 'fair':
        return 'yellow';
      case 'error':
      case 'critical':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'excellent':
      case 'good':
        return CheckCircleIcon;
      case 'warning':
      case 'fair':
        return ExclamationTriangleIcon;
      case 'error':
      case 'critical':
        return ExclamationTriangleIcon;
      default:
        return CheckCircleIcon;
    }
  };

  return (
    <VStack align="start" gap="6">
      {/* Header */}
      <Box>
        <Heading size="lg" mb="2">System Diagnostics</Heading>
        <Text color="gray.600">
          Performance monitoring and system health checks
        </Text>
      </Box>

      {/* Overall System Health */}
      <Card.Root w="full">
        <Card.Header>
          <HStack gap="3">
            <ShieldCheckIcon className="w-6 h-6 text-green-500" />
            <Text fontSize="lg" fontWeight="semibold">System Health Overview</Text>
            <Badge colorPalette="green" variant="solid">
              {systemHealth.overall}
            </Badge>
          </HStack>
        </Card.Header>
        <Card.Body>
          <SimpleGrid columns={{ base: 2, md: 4 }} gap="6">
            <VStack align="center" gap="2">
              <ClockIcon className="w-8 h-8 text-blue-500" />
              <Text fontSize="sm" color="gray.600" textAlign="center">System Uptime</Text>
              <Text fontSize="lg" fontWeight="bold" textAlign="center">{systemHealth.uptime}</Text>
            </VStack>
            
            <VStack align="center" gap="2">
              <CpuChipIcon className="w-8 h-8 text-green-500" />
              <Text fontSize="sm" color="gray.600" textAlign="center">Performance Score</Text>
              <Text fontSize="lg" fontWeight="bold" textAlign="center">{systemHealth.performance}/100</Text>
            </VStack>
            
            <VStack align="center" gap="2">
              <ServerIcon className="w-8 h-8 text-yellow-500" />
              <Text fontSize="sm" color="gray.600" textAlign="center">Memory Usage</Text>
              <Text fontSize="lg" fontWeight="bold" textAlign="center">{systemHealth.memory}%</Text>
            </VStack>
            
            <VStack align="center" gap="2">
              <WifiIcon className="w-8 h-8 text-green-500" />
              <Text fontSize="sm" color="gray.600" textAlign="center">Network Status</Text>
              <Text fontSize="lg" fontWeight="bold" textAlign="center">{systemHealth.network}</Text>
            </VStack>
          </SimpleGrid>
        </Card.Body>
      </Card.Root>

      {/* Health Checks */}
      <Card.Root w="full">
        <Card.Header>
          <Text fontSize="lg" fontWeight="semibold">Service Health Checks</Text>
        </Card.Header>
        <Card.Body>
          <VStack gap="4">
            {healthChecks.map((check) => {
              const StatusIcon = getStatusIcon(check.status);
              return (
                <Card.Root key={check.id} variant="outline" w="full">
                  <Card.Body>
                    <HStack justify="space-between">
                      <HStack gap="3">
                        <StatusIcon className={`w-6 h-6 text-${getStatusColor(check.status)}-500`} />
                        <VStack align="start" gap="1">
                          <Text fontSize="md" fontWeight="medium">{check.name}</Text>
                          <Text fontSize="sm" color="gray.600">Last check: {check.lastCheck}</Text>
                        </VStack>
                      </HStack>
                      
                      <HStack gap="4">
                        <VStack align="end" gap="1">
                          <Text fontSize="sm" color="gray.600">Latency</Text>
                          <Text fontSize="sm" fontWeight="medium">{check.latency}</Text>
                        </VStack>
                        <Badge 
                          colorPalette={getStatusColor(check.status)}
                          variant="subtle"
                        >
                          {check.status}
                        </Badge>
                      </HStack>
                    </HStack>
                  </Card.Body>
                </Card.Root>
              );
            })}
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Performance Metrics */}
      <Card.Root w="full">
        <Card.Header>
          <Text fontSize="lg" fontWeight="semibold">Performance Metrics</Text>
        </Card.Header>
        <Card.Body>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="6">
            {performanceMetrics.map((metric) => (
              <VStack key={metric.name} align="start" gap="3" w="full">
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" fontWeight="medium">{metric.name}</Text>
                  <HStack gap="2">
                    <Text fontSize="sm" fontWeight="bold">{metric.value}{metric.unit}</Text>
                    <Badge 
                      colorPalette={getStatusColor(metric.status)}
                      variant="subtle"
                      size="sm"
                    >
                      {metric.status}
                    </Badge>
                  </HStack>
                </HStack>
                <Progress.Root value={metric.value} size="sm" w="full">
                  <Progress.Track>
                    <Progress.Range bg={`${getStatusColor(metric.status)}.500`} />
                  </Progress.Track>
                </Progress.Root>
                <Text fontSize="xs" color="gray.500">
                  {metric.value < 50 ? 'Low usage' : 
                   metric.value < 80 ? 'Normal usage' : 'High usage'}
                </Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Card.Body>
      </Card.Root>

      {/* System Information */}
      <Card.Root w="full">
        <Card.Header>
          <Text fontSize="lg" fontWeight="semibold">System Information</Text>
        </Card.Header>
        <Card.Body>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
            <VStack align="start" gap="3">
              <Text fontSize="sm" fontWeight="medium">Application</Text>
              <VStack align="start" gap="1" fontSize="sm">
                <HStack justify="space-between" w="full">
                  <Text color="gray.600">Version</Text>
                  <Text>v2.1.0</Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text color="gray.600">Environment</Text>
                  <Text>Production</Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text color="gray.600">Build</Text>
                  <Text>2025.01.13</Text>
                </HStack>
              </VStack>
            </VStack>
            
            <VStack align="start" gap="3">
              <Text fontSize="sm" fontWeight="medium">Infrastructure</Text>
              <VStack align="start" gap="1" fontSize="sm">
                <HStack justify="space-between" w="full">
                  <Text color="gray.600">Database</Text>
                  <Text>PostgreSQL 15.2</Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text color="gray.600">Cache</Text>
                  <Text>Redis 7.0</Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text color="gray.600">Storage</Text>
                  <Text>SSD 120GB / 280GB</Text>
                </HStack>
              </VStack>
            </VStack>
          </SimpleGrid>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
};

export default SystemSection;