// src/features/products/ui/ProductListOnly.tsx
// Gestión de productos sin sub-pestañas

import React, { useState } from "react";
import { Box, VStack, HStack, Button, Text, Badge } from "@chakra-ui/react";
import { ProductForm } from "./ProductForm";
import { ProductList } from "./ProductList";
import { ComponentManager } from "./ComponentManager";
import { useProducts } from "../logic/useProducts";
import type { ProductWithIntelligence } from "../types";

type ProductView = "list" | "create" | "edit" | "components";

export function ProductListOnly() {
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

  return (
    <Box>
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

        {/* Features showcase for products */}
        {activeView === "list" && (
          <Box>
            <Text fontSize="md" fontWeight="semibold" mb={3} color="gray.700">
              Product Management Features
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
    </Box>
  );
}