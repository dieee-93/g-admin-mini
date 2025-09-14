import {
  ContentLayout,
  PageHeader,
  Section,
  Grid,
  Button
} from '@/shared/ui';
import { CogIcon, PlusIcon } from '@heroicons/react/24/outline';

// Import components and hooks using barrel exports
import {
  ProductList,
  ProductFormModal,
  MenuEngineeringMatrix,
  CostAnalysisTab
} from './components';
import { useProductsPage } from './hooks';

export function ProductsPage() {
  // Page orchestration logic
  const { handleNewProduct, handleMenuEngineering } = useProductsPage();

  return (
    <ContentLayout spacing="normal">
      <PageHeader
        title="Products"
        subtitle="Menu items, pricing & analytics"
        actions={
          <>
            <Button
              variant="outline"
              colorPalette="blue"
              onClick={handleMenuEngineering}
              size="md"
            >
              <CogIcon className="w-4 h-4" />
              Menu Engineering
            </Button>
            <Button
              colorPalette="purple"
              onClick={handleNewProduct}
              size="md"
            >
              <PlusIcon className="w-4 h-4" />
              New Product
            </Button>
          </>
        }
      />

      {/* Product Management Section */}
      <Section variant="elevated" title="Product Management">
        <ProductList />
      </Section>

      {/* Menu Engineering Section */}
      <Section variant="elevated" title="Menu Engineering">
        <MenuEngineeringMatrix />
      </Section>

      {/* Cost Analysis Section */}
      <Section variant="elevated" title="Cost Analysis">
        <CostAnalysisTab />
      </Section>

      {/* Product Form Modal */}
      <ProductFormModal />
    </ContentLayout>
  );
}

export default ProductsPage;