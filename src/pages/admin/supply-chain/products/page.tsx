import {
  ContentLayout,
  PageHeader,
  Section,
  Button
} from '@/shared/ui';
import { CogIcon, PlusIcon } from '@heroicons/react/24/outline';
import { CapabilityGate } from '@/lib/capabilities/components/CapabilityGate';

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
            <CapabilityGate requires="can_view_menu_engineering">
              <Button
                variant="outline"
                colorPalette="blue"
                onClick={handleMenuEngineering}
                size="md"
              >
                <CogIcon className="w-4 h-4" />
                Menu Engineering
              </Button>
            </CapabilityGate>
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

      {/* Menu Engineering Section - Now conditional */}
      <CapabilityGate requires="can_view_menu_engineering">
        <Section variant="elevated" title="Menu Engineering">
          <MenuEngineeringMatrix />
        </Section>
      </CapabilityGate>

      {/* Cost Analysis Section - Now conditional */}
      <CapabilityGate requires="can_view_cost_analysis">
        <Section variant="elevated" title="Cost Analysis">
          <CostAnalysisTab />
        </Section>
      </CapabilityGate>

      {/* Product Form Modal */}
      <ProductFormModal />
    </ContentLayout>
  );
}

export default ProductsPage;