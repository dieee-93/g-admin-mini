import { lazy } from 'react';

export const LazyProcurementPage = lazy(() => 
  import('./ProcurementPage').then(module => ({ 
    default: module.default 
  }))
);

export default LazyProcurementPage;