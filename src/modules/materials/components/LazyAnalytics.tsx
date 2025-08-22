import { lazy, Suspense } from 'react';
import { Box, Spinner, VStack, Text } from '@chakra-ui/react';

// Lazy load analytics components
const ABCAnalysisPage = lazy(() => import('./ABCAnalysisPage'));
const ABCAnalysisSection = lazy(() => import('./analytics/ABCAnalysisSection'));

// Loading fallback for analytics
const AnalyticsLoadingFallback = () => (
  <Box p={6}>
    <VStack gap={4} align="center">
      <Spinner size="lg" color="blue.500" />
      <VStack gap={1}>
        <Text fontSize="lg" fontWeight="semibold" color="gray.700">
          Cargando Analytics
        </Text>
        <Text fontSize="sm" color="gray.500">
          Preparando análisis de datos...
        </Text>
      </VStack>
    </VStack>
  </Box>
);

/**
 * Lazy-loaded ABC Analysis Page
 */
export const LazyABCAnalysisPage = () => (
  <Suspense fallback={<AnalyticsLoadingFallback />}>
    <ABCAnalysisPage />
  </Suspense>
);

/**
 * Lazy-loaded ABC Analysis Section
 */
export const LazyABCAnalysisSection = () => (
  <Suspense fallback={<AnalyticsLoadingFallback />}>
    <ABCAnalysisSection />
  </Suspense>
);

export default {
  LazyABCAnalysisPage,
  LazyABCAnalysisSection
};