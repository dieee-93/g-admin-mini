// LazyRecipeForm.tsx - Lazy-loaded recipe form with code splitting
import { lazy, Suspense } from 'react';
import { LazyWrapper, LazyFallback } from '@/lib/performance';

// Lazy load the form components
const RecipeBasicForm = lazy(() => 
  import('./components/RecipeBasicForm').then(module => ({ default: module.RecipeBasicForm }))
);

const RecipeAISuggestions = lazy(() => 
  import('./components/RecipeAISuggestions').then(module => ({ default: module.RecipeAISuggestions }))
);

// Main form component - lazy loaded from correct path
export const LazyRecipeForm = lazy(() => 
  import('./RecipeForm/RecipeForm')
);

// Export individual lazy components
export const LazyRecipeBasicForm = ({ ...props }) => (
  <Suspense 
    fallback={
      <LazyFallback 
        moduleName="RecipeBasicForm" 
        loadingState={{ isLoading: true, stage: 'Loading form fields...' }} 
        variant="skeleton"
      />
    }
  >
    <RecipeBasicForm {...props} />
  </Suspense>
);

export const LazyRecipeAISuggestions = ({ ...props }) => (
  <Suspense 
    fallback={
      <LazyFallback 
        moduleName="RecipeAISuggestions" 
        loadingState={{ isLoading: true, stage: 'Loading AI suggestions...' }} 
        variant="detailed"
        showProgress={true}
      />
    }
  >
    <RecipeAISuggestions {...props} />
  </Suspense>
);

export default LazyRecipeForm;