// LazyWrapper.tsx - Advanced Lazy Loading Components with Suspense
// Provides intelligent loading states and error boundaries for lazy components

import React, { Suspense, type ComponentType, type ErrorInfo, type ReactNode } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
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

import { lazyLoadingManager } from '../LazyLoadingManager';

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
      <Card.Root maxW="500px" mx="auto" mt="8">
        <Card.Body p="6" textAlign="center">
          <VStack gap="4">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500" />
            
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
                  colorScheme="blue"
                  onClick={onRetry}
                  size="sm"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
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
        </Card.Body>
      </Card.Root>
    );
  }

  // Detailed loading state
  return (
    <Card.Root maxW="500px" mx="auto" mt="8">
      <Card.Body p="6">
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
                    <ClockIcon className="w-3 h-3" />
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
                <WifiIcon className="w-4 h-4" />
              </Alert.Indicator>
              <Alert.Title>Performance Mode</Alert.Title>
              <Alert.Description>
                Module is being loaded on-demand for optimal performance
              </Alert.Description>
            </Alert.Root>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}

// Error boundary for lazy components
export class LazyErrorBoundary extends React.Component<
  { children: ReactNode; moduleName: string; onRetry?: () => void },
  ErrorBoundaryState
> {
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: any) {
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
    console.error(`Lazy loading error in ${this.props.moduleName}:`, error, errorInfo);
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
    const updateLoadingProgress = () => {
      const metrics = lazyLoadingManager.getPerformanceMetrics();
      const moduleStats = lazyLoadingManager.getLoadingStats()
        .filter(stat => stat.module === moduleName);

      if (moduleStats.length > 0) {
        const latestStat = moduleStats[moduleStats.length - 1];
        
        if (latestStat.success) {
          setLoadingState({
            isLoading: false,
            progress: 100,
            stage: 'Loaded'
          });
        } else {
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
      setMetrics(lazyLoadingManager.getPerformanceMetrics());
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
      <Card.Root>
        <Card.Body p="4">
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
            <VStack gap="2" align="stretch" pt="4" borderTop="1px solid" borderColor="gray.200">
              <Text fontSize="sm" fontWeight="medium">Recent Loading Stats</Text>
              <Box maxH="200px" overflowY="auto">
                {lazyLoadingManager.getLoadingStats().slice(-10).map((stat, index) => (
                  <HStack key={index} justify="space-between" fontSize="xs" py="1">
                    <Text>{stat.module}</Text>
                    <HStack gap="2">
                      <Badge colorScheme={stat.success ? 'green' : 'red'} size="xs">
                        {stat.loadTime}ms
                      </Badge>
                      {stat.success ? (
                        <CheckCircleIcon className="w-3 h-3 text-green-500" />
                      ) : (
                        <ExclamationTriangleIcon className="w-3 h-3 text-red-500" />
                      )}
                    </HStack>
                  </HStack>
                ))}
              </Box>
            </VStack>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
    </Box>
  );
}

export default LazyWrapper;