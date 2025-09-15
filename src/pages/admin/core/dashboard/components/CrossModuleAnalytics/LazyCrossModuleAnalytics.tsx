// LazyCrossModuleAnalytics.tsx - Lazy-loaded cross-module analytics with code splitting
import { lazy } from 'react';
import { LazyWrapper } from '@/lib/performance';

export const LazyCrossModuleAnalytics = lazy(() =>
  import('./CrossModuleAnalytics').then(module => ({
    default: ({ ...props }) => {
      const OriginalComponent = module.CrossModuleAnalytics;
      return (
        <LazyWrapper
          moduleName="CrossModuleAnalytics"
          fallbackVariant="skeleton"
          showProgress={true}
        >
          <OriginalComponent {...props} />
        </LazyWrapper>
      );
    }
  }))
);

export default LazyCrossModuleAnalytics;
