/**
 * PRODUCT FORM PAGE
 *
 * Página completa para crear/editar productos.
 * Integra el ProductFormWizard con navegación y manejo de estado.
 *
 * Routes:
 * - /admin/products/new - Crear nuevo producto
 * - /admin/products/:id/edit - Editar producto existente
 * - /admin/products/:id/view - Ver producto (readonly)
 *
 * @design PRODUCTS_FORM_ARCHITECTURE.md
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Stack,
  Button,
  Alert,
  Skeleton,
  HStack
} from '@/shared/ui';
import { toaster } from '@/shared/ui';
import { ProductFormWizard } from './components/ProductFormWizard';
import { productFormApi } from './services/productFormApi';
import { useNavigationActions } from '@/contexts/NavigationContext';
import type { ProductFormData } from './types/productForm';

export function ProductFormPage() {
  const { navigate } = useNavigationActions();
  const { id, mode } = useParams<{ id?: string; mode?: 'edit' | 'view' }>();

  const [initialData, setInitialData] = useState<ProductFormData | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = mode === 'edit' || !!id;
  const isViewMode = mode === 'view';
  const readOnly = isViewMode;

  // Load product data if editing
  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await productFormApi.getProduct(productId);
      setInitialData(data);
    } catch (err) {
      console.error('Error loading product:', err);
      setError('Error al cargar el producto. Por favor intenta de nuevo.');
      toaster.error({
        title: 'Error',
        description: 'No se pudo cargar el producto'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: ProductFormData) => {
    try {
      if (id) {
        // Update existing product
        await productFormApi.updateProduct(id, data);

        toaster.success({
          title: 'Producto actualizado',
          description: `${data.basic_info.name} ha sido actualizado exitosamente`
        });
      } else {
        // Create new product
        const created = await productFormApi.createProduct(data);

        toaster.success({
          title: 'Producto creado',
          description: `${data.basic_info.name} ha sido creado exitosamente`
        });

        // Navigate to products list or view page
        navigate('products', `/${created.id}/view`);
        return;
      }

      // Navigate back to products list
      navigate('products');
    } catch (err) {
      console.error('Error saving product:', err);

      toaster.error({
        title: 'Error',
        description: 'No se pudo guardar el producto. Por favor intenta de nuevo.'
      });

      throw err; // Re-throw to keep wizard in loading state
    }
  };

  const handleCancel = () => {
    // Navigate back to products list
    navigate('products');
  };

  // Loading state
  if (isLoading) {
    return (
      <Container maxW="4xl" py={8}>
        <Stack gap={6}>
          <Skeleton height="60px" />
          <Skeleton height="400px" />
          <Skeleton height="60px" />
        </Stack>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxW="4xl" py={8}>
        <Alert status="error">
          <Alert.Title>Error</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert>

        <HStack mt={4}>
          <Button onClick={() => navigate('products')}>
            Volver a productos
          </Button>
          {id && (
            <Button onClick={() => loadProduct(id)}>
              Reintentar
            </Button>
          )}
        </HStack>
      </Container>
    );
  }

  return (
    <Container maxW="4xl" py={8}>
      <ProductFormWizard
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        readOnly={readOnly}
      />
    </Container>
  );
}
