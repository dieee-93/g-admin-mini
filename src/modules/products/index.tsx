// G-Admin Products Module v2.0 - Product Intelligence System with Menu Engineering
import React, { useState } from "react";
import { Box, VStack, HStack, Button, Text, Badge, Tabs } from "@chakra-ui/react";
import { ProductForm } from "./ui/ProductForm";
import { ProductList } from "./ui/ProductList";
import { ComponentManager } from "./ui/ComponentManager";
import { MenuEngineeringMatrix } from "./analytics/MenuEngineeringMatrix";
import { useProducts } from "./logic/useProducts";
import type { ProductWithIntelligence } from "./types";
import type { MenuEngineeringData, StrategyRecommendation } from "./types/menuEngineering";

type ProductView = "list" | "create" | "edit" | "components" | "matrix";

export default function ProductsModule() {
  const [activeView, setActiveView] = useState<ProductView>("list");
  const [selectedProduct, setSelectedProduct] = useState<ProductWithIntelligence | null>(null);
  const { products, loading, error, addProduct, editProduct, removeProduct } = useProducts();

  const handleCreateProduct = async (productData: any) => {
    await addProduct(productData);
    setActiveView("list");
  };

  const handleEditProduct = async (productData: any) => {
    await editProduct(productData);
    setActiveView("list");
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm("¿Confirma eliminar este producto?")) {
      await removeProduct(productId);
    }
  };

  const handleEditClick = (product: ProductWithIntelligence) => {
    setSelectedProduct(product);
    setActiveView("edit");
  };

  const handleManageComponents = (product: ProductWithIntelligence) => {
    setSelectedProduct(product);
    setActiveView("components");
  };

  const handleCancelForm = () => {
    setSelectedProduct(null);
    setActiveView("list");
  };

  const handleProductSelect = (product: MenuEngineeringData) => {
    // Find the corresponding product in our products list
    const fullProduct = products.find(p => p.id === product.productId);
    if (fullProduct) {
      setSelectedProduct(fullProduct);
      setActiveView("edit");
    }
  };

  const handleStrategySelect = (recommendation: StrategyRecommendation) => {
    // Handle strategy implementation
    console.log("Strategy selected:", recommendation);
    // You could implement strategy tracking/execution here
  };

  return (
    <Box>
      <VStack gap={6} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" mb={2}>
            G-Admin Product Intelligence System
          </Text>
          <Text fontSize="sm" color="gray.600">
            Gestión inteligente de productos con análisis Menu Engineering
          </Text>
        </Box>

        {/* Tab Navigation */}
        <Tabs.Root defaultValue="products" variant="enclosed">
          <Tabs.List>
            <Tabs.Trigger value="products">Gestión de Productos</Tabs.Trigger>
            <Tabs.Trigger value="matrix">Menu Engineering Matrix</Tabs.Trigger>
          </Tabs.List>
          
          {/* Products Management Tab */}
          <Tabs.Content value="products">
              <VStack gap={6} align="stretch">
                {/* Navigation buttons for product management */}
                {activeView === "list" && (
                  <HStack justify="center" gap={3} wrap="wrap">
                    <Button
                      colorPalette="blue"
                      onClick={() => setActiveView("create")}
                    >
                      + Nuevo Producto
                    </Button>
                  </HStack>
                )}

                {(activeView === "create" || activeView === "edit" || activeView === "components") && (
                  <HStack justify="center">
                    <Button
                      variant="ghost"
                      onClick={handleCancelForm}
                    >
                      ← Volver a Lista
                    </Button>
                  </HStack>
                )}

                {/* Product management views */}
                {activeView === "list" && (
                  <ProductList
                    products={products}
                    loading={loading}
                    error={error}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteProduct}
                    onManageComponents={handleManageComponents}
                  />
                )}

                {activeView === "create" && (
                  <ProductForm
                    onSubmit={handleCreateProduct}
                    onCancel={handleCancelForm}
                    loading={loading}
                  />
                )}

                {activeView === "edit" && selectedProduct && (
                  <ProductForm
                    product={selectedProduct}
                    onSubmit={handleEditProduct}
                    onCancel={handleCancelForm}
                    loading={loading}
                  />
                )}

                {activeView === "components" && selectedProduct && (
                  <ComponentManager
                    product={selectedProduct}
                    onClose={handleCancelForm}
                  />
                )}

                {/* Features showcase for products tab */}
                {activeView === "list" && (
                  <Box>
                    <Text fontSize="md" fontWeight="semibold" mb={3} color="gray.700">
                      Product Intelligence Features
                    </Text>
                    <HStack gap={4} wrap="wrap" justify="center">
                      <Badge colorPalette="green" size="sm">✓ Real-time Cost Calculation</Badge>
                      <Badge colorPalette="green" size="sm">✓ Availability Tracking</Badge>
                      <Badge colorPalette="green" size="sm">✓ Component Management</Badge>
                      <Badge colorPalette="green" size="sm">✓ Production Status</Badge>
                    </HStack>
                  </Box>
                )}
              </VStack>
          </Tabs.Content>

          {/* Menu Engineering Matrix Tab */}
          <Tabs.Content value="matrix">
            <VStack gap={6} align="stretch">
              <Box>
                <Text fontSize="lg" fontWeight="semibold" mb={2} color="gray.700">
                  Menu Engineering Matrix - Strategic Analysis
                </Text>
                <Text fontSize="sm" color="gray.600" mb={4}>
                  Análisis de profitabilidad y popularidad para optimización estratégica del menú
                </Text>
                
                <HStack gap={4} wrap="wrap" justify="center" mb={4}>
                  <Badge colorPalette="green" size="sm">✓ Menu Engineering Matrix</Badge>
                  <Badge colorPalette="green" size="sm">✓ Strategic Recommendations</Badge>
                  <Badge colorPalette="green" size="sm">✓ Performance Analytics</Badge>
                  <Badge colorPalette="green" size="sm">✓ Four Quadrants Analysis</Badge>
                </HStack>
              </Box>

              <MenuEngineeringMatrix
                onProductSelect={handleProductSelect}
                onStrategySelect={handleStrategySelect}
                refreshInterval={30}
              />
            </VStack>
          </Tabs.Content>
        </Tabs.Root>
      </VStack>
    </Box>
  );
}
