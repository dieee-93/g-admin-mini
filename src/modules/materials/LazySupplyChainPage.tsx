import { lazy } from 'react';

export const LazySupplyChainPage = lazy(() => 
  import('./SupplyChainPage').then(module => ({ 
    default: module.default 
  }))
);

export default LazySupplyChainPage;