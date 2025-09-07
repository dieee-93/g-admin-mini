// PerformanceDashboard.tsx - Comprehensive performance monitoring dashboard
// Provides real-time insights into application performance metrics

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  SimpleGrid,
  Progress,
  Badge,
  Tabs,
  Separator,
  Alert
} from '@chakra-ui/react';
import {
  ChartBarIcon,
  CpuChipIcon,
  ClockIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { CardWrapper, Button, Icon } from '@/shared/ui';

// Performance utilities
import { lazyLoadingManager, getPerformanceMetrics } from '../LazyLoadingManager';
import { bundleOptimizer, analyzeBundleSize, getChunkLoadStats } from '../BundleOptimizer';
import { usePerformance } from '../RuntimeOptimizations';

interface PerformanceTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const performanceTabs: PerformanceTab[] = [
  { id: 'overview', label: 'Overview', icon: ChartBarIcon },
  { id: 'lazy-loading', label: 'Lazy Loading', icon: BoltIcon },
  { id: 'bundle', label: 'Bundle Analysis', icon: CpuChipIcon },
  { id: 'runtime', label: 'Runtime', icon: ClockIcon }
];

export function PerformanceDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Performance data
  const [lazyLoadingMetrics, setLazyLoadingMetrics] = useState(getPerformanceMetrics());
  const [bundleAnalysis, setBundleAnalysis] = useState<any>(null);
  const [chunkStats, setChunkStats] = useState(getChunkLoadStats());
  const [runtimeMetrics, setRuntimeMetrics] = useState(bundleOptimizer.monitorRuntimePerformance());

  const performance = usePerformance();

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshData();
      }, 5000);
      setRefreshInterval(interval);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [autoRefresh]);

  const refreshData = async () => {
    setLazyLoadingMetrics(getPerformanceMetrics());
    setChunkStats(getChunkLoadStats());
    setRuntimeMetrics(bundleOptimizer.monitorRuntimePerformance());
    
    try {
      const bundleData = await analyzeBundleSize();
      setBundleAnalysis(bundleData);
    } catch (error) {
      console.warn('Bundle analysis failed:', error);
    }
  };

  // Performance score calculation
  const performanceScore = useMemo(() => {
    let score = 100;
    
    // Lazy loading performance
    if (lazyLoadingMetrics.averageLoadTime > 2000) score -= 20;
    if (lazyLoadingMetrics.errorRate > 0.1) score -= 30;
    if (lazyLoadingMetrics.cacheHitRate < 0.8) score -= 15;
    
    // Runtime performance
    if (runtimeMetrics.memoryUsage > 50 * 1024 * 1024) score -= 15; // >50MB
    if (runtimeMetrics.renderTime > 3000) score -= 20; // >3s
    
    return Math.max(0, score);
  }, [lazyLoadingMetrics, runtimeMetrics]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'green';
    if (score >= 70) return 'yellow';
    if (score >= 50) return 'orange';
    return 'red';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      performanceScore,
      lazyLoadingMetrics,
      bundleAnalysis,
      chunkStats,
      runtimeMetrics,
      componentStats: performance.metrics
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <CardWrapper maxW="6xl" mx="auto" p="6">
      <VStack gap="6" align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack align="start" gap="1">
            <Text fontSize="2xl" fontWeight="bold">
              Performance Dashboard
            </Text>
            <Text color="gray.600" fontSize="sm">
              Real-time application performance monitoring
            </Text>
          </VStack>

          <HStack gap="3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <Icon icon={ArrowPathIcon} size="sm" />
              {autoRefresh ? 'Auto ON' : 'Auto OFF'}
            </Button>
            
            <Button
              variant="outline" 
              size="sm"
              onClick={refreshData}
            >
              <Icon icon={ArrowPathIcon} size="sm" />
              Refresh
            </Button>

            <Button
              colorScheme="blue"
              size="sm" 
              onClick={exportReport}
            >
              <Icon icon={DocumentArrowDownIcon} size="sm" />
              Export Report
            </Button>
          </HStack>
        </HStack>

        {/* Performance Score Overview */}
        <CardWrapper p="4" bg="bg.canvas">
          <HStack justify="space-between" align="center">
            <VStack align="start" gap="1">
              <Text fontSize="lg" fontWeight="semibold">
                Performance Score
              </Text>
              <Text fontSize="sm" color="gray.600">
                Overall application performance health
              </Text>
            </VStack>

            <VStack align="end" gap="2">
              <Text 
                fontSize="3xl" 
                fontWeight="bold" 
                color={`${getScoreColor(performanceScore)}.500`}
              >
                {performanceScore}
              </Text>
              <Badge 
                colorPalette={getScoreColor(performanceScore)}
                size="sm"
              >
                {performanceScore >= 85 ? 'Excellent' : 
                 performanceScore >= 70 ? 'Good' : 
                 performanceScore >= 50 ? 'Fair' : 'Poor'}
              </Badge>
            </VStack>
          </HStack>
          
          <Progress.Root 
            value={performanceScore} 
            colorPalette={getScoreColor(performanceScore)}
            size="lg"
            mt="4"
          >
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        </CardWrapper>

        {/* Tabs */}
        <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value)}>
          <Tabs.List>
            {performanceTabs.map(tab => (
              <Tabs.Trigger key={tab.id} value={tab.id}>
                <HStack gap="2">
                  <Icon icon={tab.icon} size="sm" />
                  <Text>{tab.label}</Text>
                </HStack>
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {/* Overview Tab */}
          <Tabs.Content value="overview">
            <VStack gap="6" align="stretch" mt="4">
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="4">
                <CardWrapper p="4" textAlign="center">
                  <VStack gap="2">
                    <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                      {lazyLoadingMetrics.loadedModules}/{lazyLoadingMetrics.totalModules}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Modules Loaded
                    </Text>
                  </VStack>
                </CardWrapper>

                <CardWrapper p="4" textAlign="center">
                  <VStack gap="2">
                    <Text fontSize="2xl" fontWeight="bold" color="green.500">
                      {formatTime(lazyLoadingMetrics.averageLoadTime)}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Avg Load Time
                    </Text>
                  </VStack>
                </CardWrapper>

                <CardWrapper p="4" textAlign="center">
                  <VStack gap="2">
                    <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                      {formatBytes(runtimeMetrics.memoryUsage)}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Memory Usage
                    </Text>
                  </VStack>
                </CardWrapper>

                <CardWrapper p="4" textAlign="center">
                  <VStack gap="2">
                    <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                      {Math.round(lazyLoadingMetrics.cacheHitRate * 100)}%
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Cache Hit Rate
                    </Text>
                  </VStack>
                </CardWrapper>
              </SimpleGrid>

              {/* Performance Alerts */}
              {runtimeMetrics.recommendations.length > 0 && (
                <Alert.Root status="warning">
                  <Alert.Indicator>
                    <Icon icon={ExclamationTriangleIcon} size="lg" />
                  </Alert.Indicator>
                  <Alert.Title>Performance Recommendations</Alert.Title>
                  <Alert.Description>
                    <VStack align="start" gap="1" mt="2">
                      {runtimeMetrics.recommendations.map((rec, index) => (
                        <Text key={index} fontSize="sm">• {rec}</Text>
                      ))}
                    </VStack>
                  </Alert.Description>
                </Alert.Root>
              )}
            </VStack>
          </Tabs.Content>

          {/* Lazy Loading Tab */}
          <Tabs.Content value="lazy-loading">
            <VStack gap="4" align="stretch" mt="4">
              <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
                <CardWrapper p="4">
                  <VStack align="start" gap="3">
                    <Text fontWeight="semibold">Load Performance</Text>
                    <VStack align="start" gap="2" w="full">
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm">Average Load Time</Text>
                        <Text fontSize="sm" fontWeight="semibold">
                          {formatTime(lazyLoadingMetrics.averageLoadTime)}
                        </Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm">Cache Hit Rate</Text>
                        <Text fontSize="sm" fontWeight="semibold">
                          {Math.round(lazyLoadingMetrics.cacheHitRate * 100)}%
                        </Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm">Error Rate</Text>
                        <Text fontSize="sm" fontWeight="semibold" color="red.500">
                          {Math.round(lazyLoadingMetrics.errorRate * 100)}%
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </CardWrapper>

                <CardWrapper p="4">
                  <VStack align="start" gap="3">
                    <Text fontWeight="semibold">Module Status</Text>
                    <VStack align="start" gap="2" w="full">
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm">Total Modules</Text>
                        <Badge colorPalette="blue">
                          {lazyLoadingMetrics.totalModules}
                        </Badge>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm">Loaded</Text>
                        <Badge colorPalette="green">
                          {lazyLoadingMetrics.loadedModules}
                        </Badge>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm">Pending</Text>
                        <Badge colorPalette="orange">
                          {lazyLoadingMetrics.totalModules - lazyLoadingMetrics.loadedModules}
                        </Badge>
                      </HStack>
                    </VStack>
                  </VStack>
                </CardWrapper>

                <CardWrapper p="4">
                  <VStack align="start" gap="3">
                    <Text fontWeight="semibold">Bundle Size</Text>
                    <VStack align="start" gap="2" w="full">
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm">Total Size</Text>
                        <Text fontSize="sm" fontWeight="semibold">
                          {formatBytes(lazyLoadingMetrics.totalChunkSize)}
                        </Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <Text fontSize="sm">Chunks</Text>
                        <Text fontSize="sm" fontWeight="semibold">
                          {chunkStats.length}
                        </Text>
                      </HStack>
                    </VStack>
                  </VStack>
                </CardWrapper>
              </SimpleGrid>

              {/* Recent Loading Stats */}
              <CardWrapper p="4">
                <VStack align="stretch" gap="3">
                  <Text fontWeight="semibold">Recent Loading Activity</Text>
                  <Box maxH="300px" overflowY="auto">
                    <VStack gap="2" align="stretch">
                      {lazyLoadingManager.getLoadingStats().slice(-10).map((stat, index) => (
                        <HStack key={index} justify="space-between" p="2" bg="bg.canvas" borderRadius="md">
                          <Text fontSize="sm" fontWeight="medium">
                            {stat.module}
                          </Text>
                          <HStack gap="3">
                            <Text fontSize="xs" color="gray.600">
                              {formatTime(stat.loadTime)}
                            </Text>
                            <Badge 
                              colorPalette={stat.success ? 'green' : 'red'}
                              size="xs"
                            >
                              {stat.success ? 'Success' : 'Failed'}
                            </Badge>
                          </HStack>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                </VStack>
              </CardWrapper>
            </VStack>
          </Tabs.Content>

          {/* Bundle Analysis Tab */}
          <Tabs.Content value="bundle">
            <VStack gap="4" align="stretch" mt="4">
              {bundleAnalysis ? (
                <>
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                    <CardWrapper p="4">
                      <VStack align="start" gap="3">
                        <Text fontWeight="semibold">Bundle Overview</Text>
                        <VStack align="start" gap="2" w="full">
                          <HStack justify="space-between" w="full">
                            <Text fontSize="sm">Total Size</Text>
                            <Text fontSize="sm" fontWeight="semibold">
                              {formatBytes(bundleAnalysis.totalSize)}
                            </Text>
                          </HStack>
                          <HStack justify="space-between" w="full">
                            <Text fontSize="sm">Gzipped Size</Text>
                            <Text fontSize="sm" fontWeight="semibold">
                              {formatBytes(bundleAnalysis.gzippedSize)}
                            </Text>
                          </HStack>
                          <HStack justify="space-between" w="full">
                            <Text fontSize="sm">Modules</Text>
                            <Text fontSize="sm" fontWeight="semibold">
                              {bundleAnalysis.moduleCount}
                            </Text>
                          </HStack>
                        </VStack>
                      </VStack>
                    </CardWrapper>

                    <CardWrapper p="4">
                      <VStack align="start" gap="3">
                        <Text fontWeight="semibold">Optimization Status</Text>
                        <VStack align="start" gap="2" w="full">
                          <HStack justify="space-between" w="full">
                            <Text fontSize="sm">Tree Shaking</Text>
                            <Badge colorPalette={bundleAnalysis.optimization.treeshaking ? 'green' : 'red'}>
                              {bundleAnalysis.optimization.treeshaking ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </HStack>
                          <HStack justify="space-between" w="full">
                            <Text fontSize="sm">Minification</Text>
                            <Badge colorPalette={bundleAnalysis.optimization.minification ? 'green' : 'red'}>
                              {bundleAnalysis.optimization.minification ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </HStack>
                          <HStack justify="space-between" w="full">
                            <Text fontSize="sm">Code Splitting</Text>
                            <Badge colorPalette={bundleAnalysis.optimization.codeSplitting ? 'green' : 'red'}>
                              {bundleAnalysis.optimization.codeSplitting ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </HStack>
                        </VStack>
                      </VStack>
                    </CardWrapper>
                  </SimpleGrid>

                  {/* Largest Modules */}
                  {bundleAnalysis.largestModules.length > 0 && (
                    <CardWrapper p="4">
                      <VStack align="stretch" gap="3">
                        <Text fontWeight="semibold">Largest Modules</Text>
                        <VStack gap="2" align="stretch">
                          {bundleAnalysis.largestModules.slice(0, 5).map((module: any, index: number) => (
                            <HStack key={index} justify="space-between" p="2" bg="bg.canvas" borderRadius="md">
                              <Text fontSize="sm" fontWeight="medium">
                                {module.name}
                              </Text>
                              <HStack gap="3">
                                <Text fontSize="xs" color="gray.600">
                                  {formatBytes(module.size)}
                                </Text>
                                <Text fontSize="xs" color="gray.600">
                                  ({module.percentage.toFixed(1)}%)
                                </Text>
                              </HStack>
                            </HStack>
                          ))}
                        </VStack>
                      </VStack>
                    </CardWrapper>
                  )}

                  {/* Recommendations */}
                  {bundleAnalysis.recommendations.length > 0 && (
                    <CardWrapper p="4">
                      <VStack align="stretch" gap="3">
                        <Text fontWeight="semibold">Optimization Recommendations</Text>
                        <VStack gap="1" align="stretch">
                          {bundleAnalysis.recommendations.map((rec: string, index: number) => (
                            <Text key={index} fontSize="sm" color="gray.700">
                              • {rec}
                            </Text>
                          ))}
                        </VStack>
                      </VStack>
                    </CardWrapper>
                  )}
                </>
              ) : (
                <Alert.Root status="info">
                  <Alert.Indicator />
                  <Alert.Title>Bundle Analysis Loading</Alert.Title>
                  <Alert.Description>
                    Bundle analysis data is being collected. Refresh to see results.
                  </Alert.Description>
                </Alert.Root>
              )}
            </VStack>
          </Tabs.Content>

          {/* Runtime Tab */}
          <Tabs.Content value="runtime">
            <VStack gap="4" align="stretch" mt="4">
              <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
                <CardWrapper p="4" textAlign="center">
                  <VStack gap="2">
                    <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                      {performance.metrics.renderCount}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Total Renders
                    </Text>
                  </VStack>
                </CardWrapper>

                <CardWrapper p="4" textAlign="center">
                  <VStack gap="2">
                    <Text fontSize="2xl" fontWeight="bold" color="green.500">
                      {formatTime(performance.metrics.averageRenderTime)}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Avg Render Time
                    </Text>
                  </VStack>
                </CardWrapper>

                <CardWrapper p="4" textAlign="center">
                  <VStack gap="2">
                    <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                      {formatBytes(performance.metrics.memoryUsage)}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Memory Usage
                    </Text>
                  </VStack>
                </CardWrapper>
              </SimpleGrid>

              {/* Memory Usage Alert */}
              {runtimeMetrics.memoryUsage > 50 * 1024 * 1024 && (
                <Alert.Root status="warning">
                  <Alert.Indicator>
                    <Icon icon={ExclamationTriangleIcon} size="lg" />
                  </Alert.Indicator>
                  <Alert.Title>High Memory Usage</Alert.Title>
                  <Alert.Description>
                    Current memory usage ({formatBytes(runtimeMetrics.memoryUsage)}) is above recommended threshold. 
                    Consider implementing memory optimization strategies.
                  </Alert.Description>
                </Alert.Root>
              )}
            </VStack>
          </Tabs.Content>
        </Tabs.Root>
      </VStack>
    </CardWrapper>
  );
}

export default PerformanceDashboard;