import { useEffect } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { PlusIcon, CogIcon } from '@heroicons/react/24/outline';
import { useProductsStore } from '@/store/productsStore';
import { productsService } from '../services/productsService';

import { logger } from '@/lib/logging';
export function useProductsPage() {
  const { setQuickActions } = useNavigation();

  // Get state directly from the Zustand store
  const { products, isLoading, error } = useProductsStore();

  // Load products on mount using the service
  useEffect(() => {
    productsService.loadProducts();
  }, []);

  // Set up quick actions for the products page
  useEffect(() => {
    const quickActions = [
      {
        id: 'new-product',
        label: 'Nuevo Producto',
        icon: PlusIcon,
        action: () => handleNewProduct(),
        color: 'purple' as const
      },
      {
        id: 'menu-analysis',
        label: 'Análisis de Menú',
        icon: CogIcon,
        action: () => handleMenuAnalysis(),
        color: 'blue' as const
      }
    ];
    setQuickActions(quickActions);

    // Cleanup on unmount
    return () => setQuickActions([]);
  }, [setQuickActions]);

  // Action handlers
  // These will eventually call methods on the productsService
  const handleNewProduct = () => {
    logger.info('App', 'New product action triggered');
    // Example: productsService.openNewProductModal();
  };

  const handleMenuAnalysis = () => {
    logger.info('App', 'Menu analysis action triggered');
    // This could toggle a state in the store, managed by the service
  };

  const handleMenuEngineering = () => {
    logger.info('App', 'Navigate to menu engineering internally');
  };

  return {
    // State
    products,
    isLoading,
    error,

    // Action handlers
    handleNewProduct,
    handleMenuAnalysis,
    handleMenuEngineering
  };
}