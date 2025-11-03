/**
 * Products Page - Product Catalog & Menu Engineering
 *
 * SEMANTIC v3.0 - WCAG AA Compliant:
 * ✅ Skip link for keyboard navigation (WCAG 2.4.1 Level A)
 * ✅ Semantic main content wrapper with ARIA label
 * ✅ Proper section headings for screen readers
 * ✅ Nav pattern for tab navigation
 * ✅ HookPoint integration for extensibility
 * ✅ 3-Layer Architecture (Semantic → Layout → Primitives)
 *
 * FEATURES:
 * - Product catalog management
 * - Menu engineering analytics
 * - Cost analysis
 * - Module extension via HookPoints
 */

import { useState } from 'react';
import {
  ContentLayout,
  Section,
  Button,
  Tabs,
  SkipLink,
  HStack
} from '@/shared/ui';
import { CogIcon, PlusIcon } from '@heroicons/react/24/outline';
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
  // Page orchestration logic
  const { handleNewProduct, handleMenuEngineering } = useProductsPage();
  const [activeTab, setActiveTab] = useState('products');

  return (
    <>
      {/* ✅ SKIP LINK - First focusable element (WCAG 2.4.1 Level A) */}
      <SkipLink />

      {/* ✅ MAIN CONTENT - Semantic <main> with ARIA label */}
      <ContentLayout spacing="normal" mainLabel="Product Catalog Management">

        {/* ✅ HEADER SECTION - Title and actions */}
        <Section
          variant="flat"
          title="Products"
          subtitle="Menu items, pricing & analytics"
          semanticHeading="Product Catalog Dashboard"
          actions={
            <HStack gap="2">
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
            </HStack>
          }
        />

        {/* ✅ TAB NAVIGATION SECTION - Semantic nav pattern */}
        <Section
          as="nav"
          variant="elevated"
          semanticHeading="Product Management Sections"
        >
          <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value)}>
            <Tabs.List>
              <Tabs.Trigger value="products">Products</Tabs.Trigger>

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

            {/* ✅ Tab Content: Products - Main section */}
            <Tabs.Content value="products">
              <Section
                variant="flat"
                semanticHeading="Product Catalog List"
              >
                <ProductList />
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

        {/* Product Form Modal */}
        <ProductFormModal />

      </ContentLayout>
    </>
  );
}

export default ProductsPage;