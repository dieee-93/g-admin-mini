/**
 * Products Page - Product Catalog & Menu Engineering
 *
 * SEMANTIC v3.0 - WCAG AA Compliant + SESSION_5 Requirements
 * ✅ Skip link for keyboard navigation (WCAG 2.4.1 Level A)
 * ✅ Semantic main content wrapper with ARIA label
 * ✅ Proper section headings for screen readers
 * ✅ Nav pattern for tab navigation
 * ✅ HookPoint integration for extensibility
 * ✅ 3-Layer Architecture (Semantic → Layout → Primitives)
 * ✅ Dynamic ProductFormModal with flexible ProductConfig
 * ✅ Enhanced ProductList with filters
 * ✅ Metrics visualization
 *
 * FEATURES:
 * - 11 product categories support
 * - Flexible ProductConfig system
 * - Dynamic form sections
 * - Rich product visualization
 * - Menu engineering analytics
 * - Cost analysis
 * - Module extension via HookPoints
 */

import {
  ContentLayout,
  Section,
  Button,
  Tabs,
  SkipLink,
  HStack,
  Stack,
  Badge,
  Alert
} from '@/shared/ui';
import { PlusIcon, ChartBarIcon, CogIcon } from '@heroicons/react/24/outline';
import { HookPoint } from '@/lib/modules';

// Import components and hooks using barrel exports
import {
  ProductList,
  ProductFormModal
} from './components';
import { useProductsPage } from './hooks';

// Note: MenuEngineeringMatrix and CostAnalysisTab moved to products-analytics sub-module
// They will be injected via HookPoints if analytics features are active

export function ProductsPage() {
  // ✅ PAGE ORCHESTRATION - All logic delegated to hook
  const {
    pageState,
    metrics,
    loading,
    error,
    activeTab,
    setActiveTab,
    actions,
    filteredProducts,
  } = useProductsPage();

  return (
    <>
      {/* ✅ SKIP LINK - First focusable element (WCAG 2.4.1 Level A) */}
      <SkipLink />

      {/* ✅ MAIN CONTENT - Semantic <main> with ARIA label */}
      <ContentLayout spacing="normal" mainLabel="Product Catalog Management">

        {/* ✅ ERROR SECTION - Show errors if any */}
        {error && (
          <Section variant="flat">
            <Alert status="error" title="Error">
              {error}
            </Alert>
          </Section>
        )}

        {/* ✅ HEADER SECTION - Title, subtitle and actions */}
        <Section
          variant="flat"
          title="Products"
          subtitle="Catalog, recipes & pricing"
          semanticHeading="Product Catalog Dashboard"
          actions={
            <HStack gap="2">
              <Button
                variant="outline"
                colorPalette="blue"
                onClick={actions.handleMenuEngineering}
                size="md"
              >
                <ChartBarIcon className="w-4 h-4" />
                Menu Engineering
              </Button>
              <Button
                variant="outline"
                colorPalette="green"
                onClick={actions.handleCostAnalysis}
                size="md"
              >
                <CogIcon className="w-4 h-4" />
                Cost Analysis
              </Button>
              <Button
                colorPalette="purple"
                onClick={actions.handleNewProduct}
                size="md"
              >
                <PlusIcon className="w-4 h-4" />
                New Product
              </Button>
            </HStack>
          }
        />

        {/* ✅ METRICS SECTION - Quick overview */}
        <Section
          as="aside"
          variant="flat"
          semanticHeading="Product Metrics Overview"
        >
          <HStack gap="4" flexWrap="wrap">
            <Stack gap="1" minW="150px">
              <span className="text-sm text-gray-600">Total Products</span>
              <span className="text-2xl font-semibold text-purple-600">{metrics.totalProducts}</span>
            </Stack>

            <Stack gap="1" minW="150px">
              <span className="text-sm text-gray-600">Categories</span>
              <span className="text-2xl font-semibold text-blue-600">{metrics.totalCategories}</span>
            </Stack>

            <Stack gap="1" minW="150px">
              <span className="text-sm text-gray-600">With Recipes</span>
              <span className="text-2xl font-semibold text-green-600">{metrics.productsWithRecipes}</span>
            </Stack>

            <Stack gap="1" minW="150px">
              <span className="text-sm text-gray-600">Services</span>
              <span className="text-2xl font-semibold text-orange-600">{metrics.serviceProducts}</span>
            </Stack>

            <Stack gap="1" minW="150px">
              <span className="text-sm text-gray-600">Digital</span>
              <span className="text-2xl font-semibold text-cyan-600">{metrics.digitalProducts}</span>
            </Stack>
          </HStack>
        </Section>

        {/* ✅ TAB NAVIGATION SECTION - Semantic nav pattern */}
        <Section
          as="nav"
          variant="elevated"
          semanticHeading="Product Management Sections"
        >
          <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as typeof activeTab)}>
            <Tabs.List>
              <Tabs.Trigger value="products">
                Products
                {filteredProducts.length > 0 && (
                  <Badge colorPalette="purple" ml="2" size="sm">
                    {filteredProducts.length}
                  </Badge>
                )}
              </Tabs.Trigger>

              {/* 🎯 HOOK POINT: Analytics tabs injected by products-analytics sub-module */}
              {/* Includes: Menu Engineering, Cost Analysis (if features active) */}
              <HookPoint
                name="products.analytics_tabs"
                data={{ activeTab, setActiveTab }}
                direction="row"
                gap="0"
                fallback={null}
              />

              {/* 🎯 HOOK POINT: Other modules can inject additional tabs */}
              <HookPoint
                name="products.tabs"
                data={{ activeTab, setActiveTab }}
                direction="row"
                gap="0"
                fallback={null}
              />
            </Tabs.List>

            {/* ✅ Tab Content: Products - Main section with ProductList */}
            <Tabs.Content value="products">
              <Section
                variant="flat"
                semanticHeading="Product Catalog List"
              >
                <ProductList
                  products={filteredProducts}
                  loading={loading}
                  filters={pageState.selectedFilters}
                  onFilterChange={actions.handleFilterChange}
                  onClearFilters={actions.handleClearFilters}
                  onEdit={actions.handleEditProduct}
                  onDelete={actions.handleDeleteProduct}
                  onViewDetails={actions.handleViewDetails}
                  onTogglePublish={actions.handleTogglePublish}
                />
              </Section>
            </Tabs.Content>

            {/* 🎯 HOOK POINT: Analytics tab content injected by products-analytics sub-module */}
            {/* Includes: Menu Engineering, Cost Analysis content (if features active) */}
            <HookPoint
              name="products.analytics_content"
              data={{ activeTab, setActiveTab }}
              direction="column"
              gap="4"
              fallback={null}
            />

            {/* 🎯 HOOK POINT: Other modules can inject additional tab content */}
            <HookPoint
              name="products.tab_content"
              data={{ activeTab, setActiveTab }}
              direction="column"
              gap="4"
              fallback={null}
            />
          </Tabs.Root>
        </Section>

        {/* 🪟 PRODUCT FORM MODAL - Dynamic sections based on category */}
        {pageState.isFormOpen && (
          <ProductFormModal
            isOpen={pageState.isFormOpen}
            mode={pageState.formMode}
            product={pageState.selectedProduct}
            onClose={actions.handleCloseForm}
            // onSave will be implemented when we integrate with the service
          />
        )}

        {/* 🎯 HOOK POINT: Other modules can inject additional page sections */}
        <HookPoint
          name="products.page_sections"
          data={{ products: filteredProducts }}
          direction="column"
          gap="4"
          fallback={null}
        />

      </ContentLayout>
    </>
  );
}

export default ProductsPage;