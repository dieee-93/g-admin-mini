// LazyExecutiveDashboard.tsx - Lazy-loaded executive dashboard with code splitting
import { lazy, Suspense } from 'react';
import { LazyWrapper, LazyFallback } from '@/lib/performance';

// Lazy load the KPI grid component
const ExecutiveKPIGrid = lazy(() => 
  import('./components/ExecutiveKPIGrid').then(module => ({ default: module.ExecutiveKPIGrid }))
);

// Main dashboard component
export const LazyExecutiveDashboard = lazy(() => 
  import('./ExecutiveDashboard').then(module => ({ 
    default: ({ ...props }) => {
      const OriginalComponent = module.ExecutiveDashboard;
      return (
        <LazyWrapper 
          moduleName="ExecutiveDashboard"
          fallbackVariant="detailed"
          showProgress={true}
          showDetails={true}
        >
          <OriginalComponent {...props} />
        </LazyWrapper>
      );
    }
  }))
);

// Export individual lazy components
export const LazyExecutiveKPIGrid = ({ ...props }) => (
  <Suspense 
    fallback={
      <LazyFallback 
        moduleName="ExecutiveKPIGrid" 
        loadingState={{ isLoading: true, stage: 'Loading KPI metrics...' }} 
        variant="detailed"
        showProgress={true}
      />
    }
  >
    <ExecutiveKPIGrid {...props} />
  </Suspense>
);

export default LazyExecutiveDashboard;