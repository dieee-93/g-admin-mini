import { lazy, Suspense } from 'react';
import { Box, Spinner, VStack, Text } from '@/shared/ui';

// Lazy load analytics components
// ABCAnalysisPage component doesn't exist - removing broken import
const ABCAnalysisSection = lazy(() => import('./Analytics/ABCAnalysisSection'));

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

// LazyABCAnalysisPage removed - ABCAnalysisPage component doesn't exist

/**
 * Lazy-loaded ABC Analysis Section
 */
export const LazyABCAnalysisSection = () => (
  <Suspense fallback={<AnalyticsLoadingFallback />}>
    <ABCAnalysisSection />
  </Suspense>
);

export default {
  LazyABCAnalysisSection
};