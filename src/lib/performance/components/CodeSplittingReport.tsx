// CodeSplittingReport.tsx - Performance monitoring for code splitting
import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Text, //TODO: REPLACE WITH TYPOGRAPHY
  Button,
  Badge,
  SimpleGrid,
  Progress,
  Box,
  Alert,
  Tabs,
  Table,
  Skeleton
} from '@chakra-ui/react';
import { Icon, CardWrapper } from '@/shared/ui';
import {
  ChartBarIcon,
  ClockIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { CodeSplittingMonitor } from '../codeSplitting';

interface CodeSplittingReportProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function CodeSplittingReport({ 
  autoRefresh = true, 
  refreshInterval = 5000 
}: CodeSplittingReportProps) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const refreshReport = () => {
    setLoading(true);
    try {
      const newReport = CodeSplittingMonitor.getPerformanceReport();
      setReport(newReport);
    } catch (error) {
      console.error('Failed to generate code splitting report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshReport();
    
    if (autoRefresh) {
      const interval = setInterval(refreshReport, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  if (loading && !report) {
    return (
      <CardWrapper>
        <CardWrapper.Body p={6}>
          <VStack gap={4}>
            <Skeleton height="40px" width="300px" />
            <SimpleGrid columns={3} gap={4} w="full">
              <Skeleton height="80px" />
              <Skeleton height="80px" />
              <Skeleton height="80px" />
            </SimpleGrid>
            <Skeleton height="200px" width="100%" />
          </VStack>
        </CardWrapper.Body>
      </CardWrapper>
    );
  }

  const getLoadTimeColor = (time: number) => {
    if (time < 1000) return 'green';
    if (time < 2000) return 'yellow';
    if (time < 3000) return 'orange';
    return 'red';
  };

  const getChunkSizeColor = (size: number) => {
    const sizeKB = size / 1024;
    if (sizeKB < 25) return 'green';
    if (sizeKB < 50) return 'yellow';
    if (sizeKB < 100) return 'orange';
    return 'red';
  };

  const formatSize = (bytes: number) => {
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <CardWrapper>
      <CardWrapper.Header>
        <HStack justify="space-between">
          <HStack gap={2}>
            <Icon icon={ChartBarIcon} size="lg" color="blue.500" />
            <Text fontSize="lg" fontWeight="bold">Code Splitting Performance</Text>
          </HStack>
          <HStack gap={2}>
            {autoRefresh && (
              <Badge colorPalette="green" variant="subtle">
                Auto-refresh
              </Badge>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={refreshReport}
              loading={loading}
            >
              <Icon icon={ArrowPathIcon} size="sm" />
              Refresh
            </Button>
          </HStack>
        </HStack>
      </CardWrapper.Header>

      <CardWrapper.Body>
        <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value)}>
          <Tabs.List>
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="loadtimes">Load Times</Tabs.Trigger>
            <Tabs.Trigger value="chunks">Chunk Sizes</Tabs.Trigger>
            <Tabs.Trigger value="recommendations">Recommendations</Tabs.Trigger>
          </Tabs.List>

          <Box mt={6}>
            {/* Overview Tab */}
            <Tabs.Content value="overview">
              <VStack gap={6} align="stretch">
                {/* Key Metrics */}
                <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                  <CardWrapper variant="subtle">
                    <CardWrapper.Body p={4} textAlign="center">
                      <Icon icon={ClockIcon} size="xl" color="blue.500" />
                      <Text fontSize="sm" color="gray.600" mt={2}>Avg Load Time</Text>
                      <Text fontSize="xl" fontWeight="bold">
                        {report?.averageLoadTimes && Object.keys(report.averageLoadTimes).length > 0
                          ? `${Math.round(
                              Object.values(report.averageLoadTimes)
                                .reduce((sum: number, time: number) => sum + time, 0) / 
                              Object.keys(report.averageLoadTimes).length
                            )}ms`
                          : 'N/A'
                        }
                      </Text>
                    </CardWrapper.Body>
                  </CardWrapper>

                  <CardWrapper variant="subtle">
                    <CardWrapper.Body p={4} textAlign="center">
                      <Icon icon={CubeIcon} size="xl" color="green.500" />
                      <Text fontSize="sm" color="gray.600" mt={2}>Total Chunks</Text>
                      <Text fontSize="xl" fontWeight="bold">
                        {Object.keys(report?.chunkSizes || {}).length}
                      </Text>
                    </CardWrapper.Body>
                  </CardWrapper>

                  <CardWrapper variant="subtle">
                    <CardWrapper.Body p={4} textAlign="center">
                      <Icon icon={ChartBarIcon} size="xl" color="purple.500" />
                      <Text fontSize="sm" color="gray.600" mt={2}>Components</Text>
                      <Text fontSize="xl" fontWeight="bold">
                        {Object.keys(report?.loadTimes || {}).length}
                      </Text>
                    </CardWrapper.Body>
                  </CardWrapper>

                  <CardWrapper variant="subtle">
                    <CardWrapper.Body p={4} textAlign="center">
                      {report?.recommendations?.length > 0 ? (
                        <Icon icon={ExclamationTriangleIcon} size="xl" color="orange.500" />
                      ) : (
                        <Icon icon={CheckCircleIcon} size="xl" color="green.500" />
                      )}
                      <Text fontSize="sm" color="gray.600" mt={2}>Issues</Text>
                      <Text fontSize="xl" fontWeight="bold" color={
                        report?.recommendations?.length > 0 ? 'orange.600' : 'green.600'
                      }>
                        {report?.recommendations?.length || 0}
                      </Text>
                    </CardWrapper.Body>
                  </CardWrapper>
                </SimpleGrid>

                {/* Performance Summary */}
                {report?.recommendations?.length > 0 && (
                  <Alert.Root status="warning">
                    <Alert.Indicator>
                      <Icon icon={ExclamationTriangleIcon} size="lg" />
                    </Alert.Indicator>
                    <Alert.Title>Performance Issues Detected</Alert.Title>
                    <Alert.Description>
                      {report.recommendations.length} optimization opportunities found. 
                      Check the Recommendations tab for details.
                    </Alert.Description>
                  </Alert.Root>
                )}
              </VStack>
            </Tabs.Content>

            {/* Load Times Tab */}
            <Tabs.Content value="loadtimes">
              <VStack gap={4} align="stretch">
                {Object.entries(report?.averageLoadTimes || {}).map(([component, avgTime]: [string, any]) => {
                  const color = getLoadTimeColor(avgTime);
                  const times = report?.loadTimes?.[component] || [];
                  
                  return (
                    <CardWrapper key={component} variant="outline">
                      <CardWrapper.Body p={4}>
                        <HStack justify="space-between" align="center">
                          <VStack align="start" gap={1}>
                            <Text fontWeight="medium">{component}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {times.length} load{times.length !== 1 ? 's' : ''} recorded
                            </Text>
                          </VStack>
                          
                          <VStack align="end" gap={1}>
                            <Text fontSize="lg" fontWeight="bold" color={`${color}.600`}>
                              {Math.round(avgTime)}ms
                            </Text>
                            <Badge colorPalette={color} size="sm">
                              {avgTime < 1000 ? 'Fast' : avgTime < 2000 ? 'Good' : avgTime < 3000 ? 'Slow' : 'Very Slow'}
                            </Badge>
                          </VStack>
                        </HStack>
                        
                        {avgTime > 0 && (
                          <Box mt={3}>
                            <Progress 
                              value={Math.min((avgTime / 5000) * 100, 100)} 
                              colorPalette={color}
                              size="sm"
                            />
                          </Box>
                        )}
                      </CardWrapper.Body>
                    </CardWrapper>
                  );
                })}
              </VStack>
            </Tabs.Content>

            {/* Chunk Sizes Tab */}
            <Tabs.Content value="chunks">
              <VStack gap={4} align="stretch">
                {Object.entries(report?.chunkSizes || {}).map(([chunkName, size]: [string, any]) => {
                  const color = getChunkSizeColor(size);
                  
                  return (
                    <CardWrapper key={chunkName} variant="outline">
                      <CardWrapper.Body p={4}>
                        <HStack justify="space-between" align="center">
                          <Text fontWeight="medium">{chunkName}</Text>
                          
                          <VStack align="end" gap={1}>
                            <Text fontSize="lg" fontWeight="bold" color={`${color}.600`}>
                              {formatSize(size)}
                            </Text>
                            <Badge colorPalette={color} size="sm">
                              {size < 25 * 1024 ? 'Small' : 
                               size < 50 * 1024 ? 'Medium' : 
                               size < 100 * 1024 ? 'Large' : 'Very Large'}
                            </Badge>
                          </VStack>
                        </HStack>
                        
                        <Box mt={3}>
                          <Progress 
                            value={Math.min((size / (200 * 1024)) * 100, 100)} 
                            colorPalette={color}
                            size="sm"
                          />
                        </Box>
                      </CardWrapper.Body>
                    </CardWrapper>
                  );
                })}
              </VStack>
            </Tabs.Content>

            {/* Recommendations Tab */}
            <Tabs.Content value="recommendations">
              <VStack gap={4} align="stretch">
                {report?.recommendations?.length > 0 ? (
                  report.recommendations.map((recommendation: string, index: number) => (
                    <Alert.Root key={index} status="warning">
                      <Alert.Indicator>
                        <Icon icon={ExclamationTriangleIcon} size="lg" />
                      </Alert.Indicator>
                      <Alert.Description>{recommendation}</Alert.Description>
                    </Alert.Root>
                  ))
                ) : (
                  <Alert.Root status="success">
                    <Alert.Indicator>
                      <Icon icon={CheckCircleIcon} size="lg" />
                    </Alert.Indicator>
                    <Alert.Title>All Good!</Alert.Title>
                    <Alert.Description>
                      No performance issues detected with your code splitting configuration.
                    </Alert.Description>
                  </Alert.Root>
                )}
              </VStack>
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </CardWrapper.Body>
    </CardWrapper>
  );
}

export default CodeSplittingReport;