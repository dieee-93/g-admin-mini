// src/features/products/logic/useProducts.ts
// Business Logic Layer - Products Intelligence

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  fetchProductsWithIntelligence,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchProductComponents,
  addProductComponent,
  removeProductComponent
} from "../data/productApi";
import {
  type ProductWithIntelligence,
  type CreateProductData,
  type UpdateProductData,
  type ProductComponent,
  type AddComponentData,
  type ProductFilter,
  type ProductSort
} from "../types";

export function useProducts() {
  const [products, setProducts] = useState<ProductWithIntelligence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProductsWithIntelligence();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading products");
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addProduct = useCallback(async (productData: CreateProductData) => {
    try {
      setError(null);
      const newProduct = await createProduct(productData);
      await loadProducts(); // Reload to get intelligence data
      return newProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating product");
      throw err;
    }
  }, [loadProducts]);

  const editProduct = useCallback(async (productData: UpdateProductData) => {
    try {
      setError(null);
      const updatedProduct = await updateProduct(productData);
      await loadProducts(); // Reload to get updated intelligence data
      return updatedProduct;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating product");
      throw err;
    }
  }, [loadProducts]);

  const removeProduct = useCallback(async (id: string) => {
    try {
      setError(null);
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting product");
      throw err;
    }
  }, []);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    loadProducts,
    addProduct,
    editProduct,
    removeProduct
  };
}
