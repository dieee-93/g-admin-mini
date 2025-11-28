/**
 * Analytics Components - Lazy Loaded
 * 
 * Performance Optimization: Analytics components are lazy-loaded
 * to reduce initial bundle size and improve page load performance.
 */

import { lazy, Suspense } from 'react';
import { Spinner, Center, Stack, Typography } from '@/shared/ui';

// Lazy load heavy analytics component
const ProductAnalyticsEnhanced = lazy(() => 
  import('./ProductAnalytics').then(module => ({
    default: module.ProductAnalyticsEnhanced
  }))
);

// Loading fallback component
function AnalyticsLoading() {
  return (
    <Center py="20">
      <Stack align="center" gap="4">
        <Spinner size="lg" />
        <Typography variant="body" color="fg.muted">
          Loading analytics...
        </Typography>
      </Stack>
    </Center>
  );
}

// Wrapped component with Suspense boundary
export function ProductAnalytics() {
  return (
    <Suspense fallback={<AnalyticsLoading />}>
      <ProductAnalyticsEnhanced />
    </Suspense>
  );
}

export { ProductAnalyticsEnhanced };
