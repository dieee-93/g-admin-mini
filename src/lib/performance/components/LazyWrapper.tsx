// LazyWrapper.tsx - Advanced Lazy Loading Components with Suspense
// Provides intelligent loading states and error boundaries for lazy components

import React, { Suspense, type ComponentType, type ErrorInfo, type ReactNode } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Progress,
  Alert,
  Spinner,
  Badge,
  Skeleton,
  SimpleGrid
} from '@chakra-ui/react';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  WifiIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { CardWrapper, Icon } from '@/shared/ui';
import { lazyLoadingManager } from '../LazyLoadingManager';

import { logger } from '@/lib/logging';
// Loading state types
interface LoadingState {
  isLoading: boolean;
  progress?: number;
  stage?: string;
  estimatedTime?: number;
  error?: Error;
}

// Fallback component props
interface LazyFallbackProps {
  moduleName: string;
  loadingState: LoadingState;
  onRetry?: () => void;
  showProgress?: boolean;
  showDetails?: boolean;
  variant?: 'minimal' | 'detailed' | 'skeleton';
}

// Error boundary state
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

// Smart loading fallback component
export function LazyFallback({
  moduleName,
  loadingState,
  onRetry,
  showProgress = true,
  showDetails = false,
  variant = 'detailed'
}: LazyFallbackProps) {
  const { isLoading, progress, stage, estimatedTime, error } = loadingState;

  // Minimal loading indicator
  if (variant === 'minimal') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
        <Spinner size="lg" color="blue.500" />
      </Box>
    );
  }

  // Skeleton loading
  if (variant === 'skeleton') {
    return (
      <VStack gap="4" p="6" align="stretch">
        <HStack justify="space-between">
          <Skeleton height="32px" width="200px" />
          <Skeleton height="24px" width="80px" />
        </HStack>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height="120px" borderRadius="md" />
          ))}
        </SimpleGrid>
        <Skeleton height="60px" borderRadius="md" />
      </VStack>
    );
  }

  // Error state
  if (error) {
    return (
      <CardWrapper maxW="500px" mx="auto" mt="8">
        <CardWrapper.Body p="6" textAlign="center">
          <VStack gap="4">
            <Icon icon={ExclamationTriangleIcon} size="xl" color="red.500" />
            
            <VStack gap="2">
              <Text fontSize="lg" fontWeight="semibold" color="red.600">
                Failed to Load Module
              </Text>
              <Text fontSize="sm" color="gray.600">
                {moduleName} couldn't be loaded
              </Text>
              {showDetails && (
                <Text fontSize="xs" color="gray.500" fontFamily="mono">
                  {error.message}
                </Text>
              )}
            </VStack>

            <HStack gap="3">
              {onRetry && (
                <Button
                  colorPalette="blue"
                  onClick={onRetry}
                  size="sm"
                >
                  <Icon icon={ArrowPathIcon} size="sm" />
                  Retry
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                size="sm"
              >
                Reload Page
              </Button>
            </HStack>
          </VStack>
        </CardWrapper.Body>
      </CardWrapper>
    );
  }

  // Detailed loading state
  return (
    <CardWrapper maxW="500px" mx="auto" mt="8">
      <CardWrapper.Body p="6">
        <VStack gap="4" align="stretch">
          {/* Loading header */}
          <HStack justify="center" gap="3">
            <Spinner size="md" color="blue.500" />
            <VStack align="start" gap="0">
              <Text fontWeight="semibold">Loading {moduleName}</Text>
              {stage && (
                <Text fontSize="sm" color="gray.600">
                  {stage}
                </Text>
              )}
            </VStack>
          </HStack>

          {/* Progress bar */}
          {showProgress && progress !== undefined && (
            <VStack gap="2" align="stretch">
              <Progress.Root 
                value={progress} 
                size="sm" 
                colorPalette="blue"
              >
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
              <HStack justify="space-between" fontSize="xs" color="gray.600">
                <Text>{Math.round(progress)}% complete</Text>
                {estimatedTime && (
                  <HStack gap="1">
                    <Icon icon={ClockIcon} size="xs" />
                    <Text>{estimatedTime}s remaining</Text>
                  </HStack>
                )}
              </HStack>
            </VStack>
          )}

          {/* Performance info */}
          {showDetails && (
            <Alert.Root status="info" size="sm">
              <Alert.Indicator>
                <Icon icon={WifiIcon} size="sm" />
              </Alert.Indicator>
              <Alert.Title>Performance Mode</Alert.Title>
              <Alert.Description>
                Module is being loaded on-demand for optimal performance
              </Alert.Description>
            </Alert.Root>
          )}
        </VStack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}

// Error boundary for lazy components
export class LazyErrorBoundary extends React.Component<
  { children: ReactNode; moduleName: string; onRetry?: () => void },
  ErrorBoundaryState
> {
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: unknown) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to monitoring service
    logger.error('Performance', `Lazy loading error in ${this.props.moduleName}:`, {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  componentWillUnmount() {
    // Clear any pending retry timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
  }

  handleRetry = () => {
    const { onRetry } = this.props;
    const { retryCount } = this.state;

    // Limit retry attempts
    if (retryCount >= 3) {
      return;
    }

    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      retryCount: retryCount + 1
    });

    // Call external retry handler
    if (onRetry) {
      onRetry();
    }

    // Auto-retry with exponential backoff for network errors
    if (this.state.error?.message.includes('Loading chunk')) {
      const timeout = setTimeout(() => {
        window.location.reload();
      }, Math.pow(2, retryCount) * 1000);
      
      this.retryTimeouts.push(timeout);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <LazyFallback
          moduleName={this.props.moduleName}
          loadingState={{
            isLoading: false,
            error: this.state.error
          }}
          onRetry={this.state.retryCount < 3 ? this.handleRetry : undefined}
          showDetails={true}
        />
      );
    }

    return this.props.children;
  }
}

// Wrapper component that combines Suspense and Error Boundary
interface LazyWrapperProps {
  children: ReactNode;
  moduleName: string;
  fallbackVariant?: 'minimal' | 'detailed' | 'skeleton';
  showProgress?: boolean;
  showDetails?: boolean;
  onLoadingStateChange?: (state: LoadingState) => void;
}

export function LazyWrapper({
  children,
  moduleName,
  fallbackVariant = 'detailed',
  showProgress = true,
  showDetails = false,
  onLoadingStateChange
}: LazyWrapperProps) {
  const [loadingState, setLoadingState] = React.useState<LoadingState>({
    isLoading: true,
    stage: 'Initializing...'
  });

  // Update loading state based on performance metrics
  React.useEffect(() => {
    let hasCompleted = false;
    
    const updateLoadingProgress = () => {
      if (hasCompleted) return;
      
      const moduleStats = lazyLoadingManager.getLoadingStats()
        .filter(stat => stat.module === moduleName);

      if (moduleStats.length > 0) {
        const latestStat = moduleStats[moduleStats.length - 1];
        
        if (latestStat.success) {
          hasCompleted = true;
          setLoadingState({
            isLoading: false,
            progress: 100,
            stage: 'Loaded'
          });
        } else if (latestStat.error) {
          hasCompleted = true;
          setLoadingState({
            isLoading: false,
            error: new Error(latestStat.error || 'Load failed')
          });
        }
      }
    };

    const interval = setInterval(updateLoadingProgress, 100);
    
    // Simulate loading progress for better UX
    let progress = 0;
    const progressInterval = setInterval(() => {
      if (hasCompleted) return;
      
      progress += Math.random() * 15;
      if (progress < 90) {
        setLoadingState(prev => ({
          ...prev,
          progress: Math.min(progress, 90),
          stage: progress < 30 ? 'Loading...' : 
                 progress < 60 ? 'Processing...' : 
                 'Almost ready...'
        }));
      }
    }, 200);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, [moduleName]);

  // Notify parent of loading state changes
  React.useEffect(() => {
    if (onLoadingStateChange) {
      onLoadingStateChange(loadingState);
    }
  }, [loadingState, onLoadingStateChange]);

  const fallbackComponent = (
    <LazyFallback
      moduleName={moduleName}
      loadingState={loadingState}
      showProgress={showProgress}
      showDetails={showDetails}
      variant={fallbackVariant}
    />
  );

  return (
    <LazyErrorBoundary moduleName={moduleName}>
      <Suspense fallback={fallbackComponent}>
        {children}
      </Suspense>
    </LazyErrorBoundary>
  );
}

// Hook for lazy component loading state
export function useLazyLoadingState(moduleName: string) {
  const [state, setState] = React.useState<LoadingState>({
    isLoading: false
  });

  React.useEffect(() => {
    const stats = lazyLoadingManager.getLoadingStats()
      .filter(stat => stat.module === moduleName);

    if (stats.length > 0) {
      const latestStat = stats[stats.length - 1];
      setState({
        isLoading: false,
        error: latestStat.success ? undefined : new Error(latestStat.error)
      });
    }
  }, [moduleName]);

  const retry = React.useCallback(() => {
    setState({ isLoading: true });
    // Force module reload
    lazyLoadingManager.preloadModule(moduleName, 'high')
      .catch(error => setState({ isLoading: false, error }));
  }, [moduleName]);

  return {
    ...state,
    retry
  };
}

// Performance monitoring component
export function LazyLoadingMonitor() {
  const [metrics, setMetrics] = React.useState(lazyLoadingManager.getPerformanceMetrics());
  const [showDetails, setShowDetails] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const newMetrics = lazyLoadingManager.getPerformanceMetrics();
      setMetrics(prevMetrics => {
        // Solo actualizar si realmente cambió para evitar re-renders innecesarios
        if (JSON.stringify(newMetrics) !== JSON.stringify(prevMetrics)) {
          return newMetrics;
        }
        return prevMetrics;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      position="fixed"
      bottom="4"
      right="4"
      zIndex={9999}
      maxW="320px"
      shadow="lg"
    >
      <CardWrapper>
        <CardWrapper.Body p="4">
        <VStack gap="4" align="stretch">
          <HStack justify="space-between" align="center">
            <Text fontWeight="semibold">Lazy Loading Performance</Text>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          </HStack>

          <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
            <VStack align="center">
              <Text fontSize="lg" fontWeight="bold" color="blue.600">
                {metrics.loadedModules}/{metrics.totalModules}
              </Text>
              <Text fontSize="xs" color="gray.600" textAlign="center">
                Modules Loaded
              </Text>
            </VStack>

            <VStack align="center">
              <Text fontSize="lg" fontWeight="bold" color="green.600">
                {Math.round(metrics.averageLoadTime)}ms
              </Text>
              <Text fontSize="xs" color="gray.600" textAlign="center">
                Avg Load Time
              </Text>
            </VStack>

            <VStack align="center">
              <Text fontSize="lg" fontWeight="bold" color="purple.600">
                {Math.round(metrics.cacheHitRate * 100)}%
              </Text>
              <Text fontSize="xs" color="gray.600" textAlign="center">
                Cache Hit Rate
              </Text>
            </VStack>

            <VStack align="center">
              <Text fontSize="lg" fontWeight="bold" color={
                metrics.errorRate > 0.1 ? "red.600" : "gray.600"
              }>
                {Math.round(metrics.errorRate * 100)}%
              </Text>
              <Text fontSize="xs" color="gray.600" textAlign="center">
                Error Rate
              </Text>
            </VStack>
          </SimpleGrid>

          {showDetails && (
            <VStack gap="2" align="stretch" pt="4" borderTop="1px solid" borderColor="border.default">
              <Text fontSize="sm" fontWeight="medium">Module Loading Status</Text>
              <Box maxH="200px" overflowY="auto">
                {(() => {
                  // Get unique modules and their latest stats
                  const allStats = lazyLoadingManager.getLoadingStats();
                  const uniqueModules = new Map<string, typeof allStats[0]>();
                  
                  // Keep only the latest stat for each module
                  allStats.forEach(stat => {
                    const existing = uniqueModules.get(stat.module);
                    if (!existing || stat.timestamp > existing.timestamp) {
                      uniqueModules.set(stat.module, stat);
                    }
                  });
                  
                  return Array.from(uniqueModules.values())
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, 10)
                    .map((stat, index) => (
                      <HStack key={`${stat.module}-${stat.timestamp}`} justify="space-between" fontSize="xs" py="1">
                        <Text>{stat.module}</Text>
                        <HStack gap="2">
                          <Badge colorPalette={stat.success ? 'green' : 'red'} size="xs">
                            {stat.loadTime}ms
                          </Badge>
                          {stat.success ? (
                            <Icon icon={CheckCircleIcon} size="xs" color="green.500" />
                          ) : (
                            <Icon icon={ExclamationTriangleIcon} size="xs" color="red.500" />
                          )}
                        </HStack>
                      </HStack>
                    ));
                })()}
              </Box>
            </VStack>
          )}
        </VStack>
      </CardWrapper.Body>
    </CardWrapper>
    </Box>
  );
}

export default LazyWrapper;