// LazyOfflineMaterialsPage.tsx - Lazy-loaded materials page with code splitting
import { lazy, Suspense } from 'react';
import { LazyWrapper, LazyFallback } from '@/lib/performance';

// Lazy load the main component and sub-components
const OfflineMaterialsPageHeader = lazy(() => 
  import('./OfflineMaterialsPageHeader').then(module => ({ default: module.OfflineMaterialsPageHeader }))
);

const OfflineMaterialsStats = lazy(() => 
  import('./OfflineMaterialsStats').then(module => ({ default: module.OfflineMaterialsStats }))
);

const MaterialsInventoryGrid = lazy(() => 
  import('./MaterialsInventoryGrid').then(module => ({ default: module.MaterialsInventoryGrid }))
);

// Main page component - will be loaded synchronously as entry point
export const LazyOfflineMaterialsPage = lazy(() => 
  import('./OfflineMaterialsPage').then(module => ({ 
    default: ({ ...props }) => {
      const OriginalComponent = module.OfflineMaterialsPage;
      return (
        <LazyWrapper 
          moduleName="OfflineMaterialsPage"
          fallbackVariant="skeleton"
          showProgress={true}
        >
          <OriginalComponent {...props} />
        </LazyWrapper>
      );
    }
  }))
);

// Export individual lazy components for granular loading
export const LazyMaterialsHeader = ({ ...props }) => (
  <Suspense fallback={<LazyFallback moduleName="MaterialsHeader" loadingState={{ isLoading: true }} variant="skeleton" />}>
    <OfflineMaterialsPageHeader {...props} />
  </Suspense>
);

export const LazyMaterialsStats = ({ ...props }) => (
  <Suspense fallback={<LazyFallback moduleName="MaterialsStats" loadingState={{ isLoading: true }} variant="skeleton" />}>
    <OfflineMaterialsStats {...props} />
  </Suspense>
);

export const LazyMaterialsGrid = ({ ...props }) => (
  <Suspense fallback={<LazyFallback moduleName="MaterialsGrid" loadingState={{ isLoading: true }} variant="skeleton" />}>
    <MaterialsInventoryGrid {...props} />
  </Suspense>
);

export default LazyOfflineMaterialsPage;