// LazyCrossModuleAnalytics.tsx - Lazy-loaded analytics with code splitting
import { lazy, Suspense } from 'react';
import { LazyWrapper, LazyFallback } from '@/lib/performance';

// Lazy load the sub-components
const CorrelationsView = lazy(() => 
  import('./components/CorrelationsView').then(module => ({ default: module.CorrelationsView }))
);

const BottlenecksView = lazy(() => 
  import('./components/BottlenecksView').then(module => ({ default: module.BottlenecksView }))
);

// Main analytics component
export const LazyCrossModuleAnalytics = lazy(() => 
  import('./CrossModuleAnalytics').then(module => ({ 
    default: ({ ...props }) => {
      const OriginalComponent = module.CrossModuleAnalytics;
      return (
        <LazyWrapper 
          moduleName="CrossModuleAnalytics"
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
export const LazyCorrelationsView = ({ ...props }) => (
  <Suspense 
    fallback={
      <LazyFallback 
        moduleName="CorrelationsView" 
        loadingState={{ isLoading: true, stage: 'Loading correlations analysis...' }} 
        variant="detailed"
        showProgress={true}
      />
    }
  >
    <CorrelationsView {...props} />
  </Suspense>
);

export const LazyBottlenecksView = ({ ...props }) => (
  <Suspense 
    fallback={
      <LazyFallback 
        moduleName="BottlenecksView" 
        loadingState={{ isLoading: true, stage: 'Loading bottlenecks analysis...' }} 
        variant="detailed"
        showProgress={true}
      />
    }
  >
    <BottlenecksView {...props} />
  </Suspense>
);

export default LazyCrossModuleAnalytics;