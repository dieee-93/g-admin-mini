import React from 'react';
import {
  Dialog,
  Button,
  Box
} from '@chakra-ui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ProductForm } from './ProductForm';
import { useProductsStore } from '@/store/productsStore';
import { supabase } from '@/lib/supabase/client';
import type { CreateProductData, UpdateProductData } from '../types';

export function ProductFormModal() {
  const { 
    isModalOpen, 
    modalMode, 
    currentProduct, 
    closeModal, 
    addProduct, 
    updateProduct,
    setError,
    setLoading 
  } = useProductsStore();

  const handleSubmit = async (data: CreateProductData | UpdateProductData & { recipe?: any; estimated_cost?: number }) => {
    try {
      setLoading(true);
      setError(null);

      if (modalMode === 'edit' && currentProduct && 'id' in data) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name: data.name,
            unit: data.unit || 'unit',
            type: data.type || 'ELABORATED',
            description: data.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id);

        if (error) throw error;

        // If recipe data exists, handle it separately
        if (data.recipe) {
          // TODO: Save recipe to recipes table and link to product
          
        }

        // Update in store
        updateProduct(data.id, {
          name: data.name,
          description: data.description || '',
          category: 'General', // TODO: handle categories
          cost: data.estimated_cost || 0,
          updated_at: new Date().toISOString()
        });

      } else {
        // Create new product
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert({
            name: data.name,
            unit: data.unit || 'unit',
            type: data.type || 'ELABORATED',
            description: data.description
          })
          .select()
          .single();

        if (error) throw error;

        // If recipe data exists, handle it separately
        if (data.recipe && newProduct) {
          // TODO: Save recipe to recipes table and link to product
          
        }

        // Add to store
        addProduct({
          name: data.name,
          description: data.description || '',
          category: 'General', // TODO: handle categories
          price: (data.estimated_cost || 0) * 2.5, // Default markup
          cost: data.estimated_cost || 0,
          margin: 60, // Will be recalculated
          prep_time: 15,
          active: true,
          popularity_score: 0,
          profitability_score: 0,
          menu_classification: 'dog',
          components: [],
          sales_count: 0,
          revenue_total: 0
        });
      }

      closeModal();
    } catch (error) {
      
      setError(error instanceof Error ? error.message : 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    closeModal();
  };

  return (
    <Dialog.Root open={isModalOpen} onOpenChange={(e) => !e.open && closeModal()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="2xl" mx={4}>
          <Dialog.Header>
            <Dialog.Title fontSize="lg" fontWeight="semibold">
              {modalMode === 'edit' ? 'Editar Producto' : 'Nuevo Producto'}
            </Dialog.Title>
            <Dialog.CloseTrigger asChild>
              <Button variant="ghost" size="sm">
                <XMarkIcon className="w-5 h-5" />
              </Button>
            </Dialog.CloseTrigger>
          </Dialog.Header>

          <Dialog.Body p={0}>
            <Box p={6}>
              <ProductForm
                product={currentProduct || undefined}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </Box>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}