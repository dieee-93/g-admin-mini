// LazyExecutiveDashboard.tsx - Lazy-loaded executive dashboard with code splitting
import { lazy } from 'react';
import { LazyWrapper } from '@/lib/performance';

export const LazyExecutiveDashboard = lazy(() =>
  import('./index.tsx').then(module => ({
    default: ({ ...props }) => {
      const OriginalComponent = module.ExecutiveDashboard;
      return (
        <LazyWrapper
          moduleName="ExecutiveDashboard"
          fallbackVariant="skeleton"
          showProgress={true}
        >
          <OriginalComponent {...props} />
        </LazyWrapper>
      );
    }
  }))
);

export default LazyExecutiveDashboard;
