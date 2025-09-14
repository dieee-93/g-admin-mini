import React from 'react';
import { 
  Modal,
  ModalContent,
  ModalHeader, 
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalClose
} from '@/shared/ui';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Icon } from '@/shared/ui/Icon';
// import { ProductForm } from './ProductForm'; // TODO: Fix ProductForm export
import { useProductsStore } from '@/store/productsStore';
import { useBusinessCapabilities } from '@/store/businessCapabilitiesStore'; // Import for milestones
import { supabase } from '@/lib/supabase/client';
import { 
  FinancialCalculations, 
  QuickCalculations 
} from '@/business-logic/shared/FinancialCalculations';
import type { CreateProductData, UpdateProductData } from '../types';

export function ProductFormModal() {
  // NOTA: Este componente necesita que el store useProductsStore tenga las propiedades:
  // isModalOpen, modalMode, currentProduct, closeModal
  // Estas propiedades están ausentes del store actual y necesitan ser añadidas
  const { 
    // isModalOpen, 
    // modalMode, 
    // currentProduct, 
    // closeModal, 
    addProduct, 
    updateProduct,
    setError,
    setLoading 
  } = useProductsStore();
  const { completeMilestone } = useBusinessCapabilities();

  // Estados temporales hasta que se arregle el store
  const [isModalOpen] = React.useState(false);
  const [modalMode] = React.useState<'create' | 'edit'>('create');
  const [currentProduct] = React.useState(null);
  const closeModal = () => {
    // TODO: Implementar cuando se arregle el store
  };

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
        if ('recipe' in data && data.recipe) {
          // TODO: Save recipe to recipes table and link to product
          
        }

        // Update in store with centralized calculations
        const estimatedCost = ('estimated_cost' in data ? data.estimated_cost : 0) || 0;
        updateProduct(data.id, {
          name: data.name,
          description: data.description || '',
          category: 'General', // TODO: handle categories
          cost: estimatedCost,
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

        // Milestone Completion Logic
        // After a new product is successfully created, we check its type
        // and complete the corresponding milestone.
        switch (data.type) {
          case 'ELABORATED':
          case 'SUPPLY': // Assuming 'SUPPLY' is a standard physical product as well
            completeMilestone('create-first-product-local');
            break;
          case 'DIGITAL':
            completeMilestone('create-digital-product');
            break;
          // Add other product types for other milestones as needed
        }

        // If recipe data exists, handle it separately
        if ('recipe' in data && data.recipe && newProduct) {
          // TODO: Save recipe to recipes table and link to product
          
        }

        // Add to store with centralized financial calculations
        const estimatedCost = ('estimated_cost' in data ? data.estimated_cost : 0) || 0;
        const recommendedPrice = QuickCalculations.sellingPriceFromMarkup(estimatedCost, 150); // 2.5x markup = 150% markup
        const profitMargin = QuickCalculations.profitMargin(recommendedPrice, estimatedCost);
        const profitabilityAnalysis = FinancialCalculations.analyzeProfitability(
          recommendedPrice, 
          estimatedCost, 
          0 // no operating expenses for basic analysis
        );

        addProduct({
          name: data.name,
          description: data.description || '',
          category: 'General', // TODO: handle categories
          price: recommendedPrice,
          cost: estimatedCost,
          margin: profitMargin, // Calculated with precision
          prep_time: 15,
          active: true,
          popularity_score: 0,
          profitability_score: profitabilityAnalysis.return_on_cost,
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
    <Modal isOpen={isModalOpen} onClose={closeModal}>
      <ModalContent className="max-w-2xl mx-4">
        <ModalHeader>
          <ModalTitle className="text-lg font-semibold">
            {modalMode === 'edit' ? 'Editar Producto' : 'Nuevo Producto'}
          </ModalTitle>
          <ModalClose>
            <button className="p-1 hover:bg-accent rounded-md transition-colors">
              <Icon icon={XMarkIcon} size="md" />
            </button>
          </ModalClose>
        </ModalHeader>

        <ModalBody className="p-0">
          <div className="p-6">
            {/* NOTA: ProductForm necesita ser corregido para exportar correctamente */}
            {/* <ProductForm
                product={currentProduct || undefined}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              /> */}
            <div className="text-center text-muted-foreground py-8">
              ProductForm component needs to be properly exported
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}