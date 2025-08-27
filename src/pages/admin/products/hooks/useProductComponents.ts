// src/features/products/logic/useProductComponents.ts
// Hook for managing product components

import { useState, useEffect, useCallback } from "react";
import {
  fetchProductComponents,
  addProductComponent,
  removeProductComponent
} from "../data/productApi";
import { type ProductComponent, type AddComponentData } from "../types";

export function useProductComponents(productId: string) {
  const [components, setComponents] = useState<ProductComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComponents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProductComponents(productId);
      setComponents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading components");
      console.error("Error loading components:", err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const addComponent = useCallback(async (componentData: AddComponentData) => {
    try {
      setError(null);
      const newComponent = await addProductComponent(componentData);
      setComponents(prev => [...prev, newComponent]);
      return newComponent;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error adding component");
      throw err;
    }
  }, []);

  const removeComponent = useCallback(async (componentId: string) => {
    try {
      setError(null);
      await removeProductComponent(componentId);
      setComponents(prev => prev.filter(c => c.id !== componentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error removing component");
      throw err;
    }
  }, []);

  // Load components on mount
  useEffect(() => {
    if (productId) {
      loadComponents();
    }
  }, [productId, loadComponents]);

  return {
    components,
    loading,
    error,
    loadComponents,
    addComponent,
    removeComponent
  };
}