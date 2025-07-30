// src/features/sales/ui/SaleForm.tsx - VERSIÓN CORREGIDA Y ROBUSTA
import {
  Box, 
  Button, 
  Input, 
  VStack, 
  HStack,
  Textarea, 
  Heading,
  Grid,
  Text,
  Badge,
  Select,
  createListCollection,
  Alert,
  Skeleton
} from '@chakra-ui/react';
import { useState, useMemo, useEffect } from 'react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { supabase } from '@/lib/supabase';
import { type CreateSaleData, type SaleFormItem, type Customer, type Product } from '../types';

interface FormErrors {
  items?: string;
  customer_id?: string;
  general?: string;
}

export function SaleForm() {
  const { handleError, handleSuccess, handleWarning } = useErrorHandler();
  
  // Estados principales
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    customer_id: '',
    note: '',
  });

  const [saleItems, setSaleItems] = useState<SaleFormItem[]>([
    { product_id: '', quantity: '', unit_price: '' }
  ]);

  // Cargar datos al inicializar
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Cargar customers y products de forma simple
      const [customersResult, productsResult] = await Promise.allSettled([
        loadCustomers(),
        loadProducts()
      ]);

      if (customersResult.status === 'rejected') {
        console.error('Error loading customers:', customersResult.reason);
        handleWarning('No se pudieron cargar los clientes');
      }

      if (productsResult.status === 'rejected') {
        console.error('Error loading products:', productsResult.reason);
        handleWarning('No se pudieron cargar los productos');
      }
    } catch (error) {
      handleError(error, 'Error cargando datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone, email')
        .order('name', { ascending: true });
      
      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
      throw error;
    }
  };

  const loadProducts = async () => {
    try {
      // Intentar con la función de Supabase primero
      const { data: functionData, error: functionError } = await supabase
        .rpc('get_products_with_availability');
      
      if (!functionError && functionData) {
        setProducts(functionData);
        return;
      }

      // Fallback: cargar productos básicos
      console.warn('Función get_products_with_availability no disponible, usando fallback');
      const { data: basicProducts, error: basicError } = await supabase
        .from('products')
        .select('id, name, description, created_at')
        .order('created_at', { ascending: false });
      
      if (basicError) throw basicError;
      
      // Mapear a estructura esperada
      const mappedProducts = (basicProducts || []).map(product => ({
        ...product,
        unit: 'und', // Valor por defecto
        type: 'product', // Valor por defecto
        cost: 0,
        availability: 1, // Asumimos disponible
        components_count: 0
      }));
      
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
      throw error;
    }
  };

  // ✅ Collections para los Select components
  const customersCollection = useMemo(() => {
    return createListCollection({
      items: [
        { label: 'Sin cliente', value: '' },
        ...customers.map(customer => ({
          label: `${customer.name}${customer.phone ? ` (${customer.phone})` : ''}`,
          value: customer.id,
        }))
      ],
    });
  }, [customers]);

  const productsCollection = useMemo(() => {
    const availableProducts = products.filter(product => (product.availability || 0) > 0);
    return createListCollection({
      items: availableProducts.map(product => ({
        label: `${product.name}${product.unit ? ` (${product.unit})` : ''} - Disponible: ${product.availability || 0}`,
        value: product.id,
      })),
    });
  }, [products]);

  // Loading state
  if (loading) {
    return (
      <Box borderWidth="1px" rounded="md" p={6} mb={6} bg="white">
        <VStack gap="4">
          <Skeleton height="6" width="200px" />
          <Skeleton height="10" width="100%" />
          <Skeleton height="10" width="100%" />
        </VStack>
      </Box>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const validItems = saleItems.filter(item => 
      item.product_id && 
      item.quantity && 
      parseFloat(item.quantity) > 0 &&
      item.unit_price &&
      parseFloat(item.unit_price) > 0
    );

    if (validItems.length === 0) {
      newErrors.items = 'Debe agregar al menos un producto válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // ✅ Handler para Select de cliente
  const handleCustomerSelectChange = (details: { value: string[] }) => {
    setForm(prev => ({ ...prev, customer_id: details.value[0] || '' }));
    
    if (errors.customer_id) {
      setErrors(prev => ({ ...prev, customer_id: undefined }));
    }
  };

  // ✅ Handler para Select de productos
  const handleProductSelectChange = (index: number, details: { value: string[] }) => {
    const newItems = [...saleItems];
    const productId = details.value[0] || '';
    newItems[index] = { ...newItems[index], product_id: productId };
    
    // Auto-completar precio si el producto tiene costo
    if (productId) {
      const product = products.find(p => p.id === productId);
      if (product?.cost && !newItems[index].unit_price) {
        newItems[index].unit_price = product.cost.toString();
      }
    }
    
    setSaleItems(newItems);
    clearValidation();
  };

  const handleItemQuantityChange = (index: number, value: string) => {
    const newItems = [...saleItems];
    newItems[index] = { ...newItems[index], quantity: value };
    setSaleItems(newItems);
    clearValidation();
  };

  const handleItemPriceChange = (index: number, value: string) => {
    const newItems = [...saleItems];
    newItems[index] = { ...newItems[index], unit_price: value };
    setSaleItems(newItems);
    clearValidation();
  };

  const addItem = () => {
    setSaleItems([...saleItems, { product_id: '', quantity: '', unit_price: '' }]);
  };

  const removeItem = (index: number) => {
    if (saleItems.length > 1) {
      setSaleItems(saleItems.filter((_, i) => i !== index));
      clearValidation();
    }
  };

  const clearValidation = () => {
    if (errors.items) {
      setErrors(prev => ({ ...prev, items: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const validItems = saleItems
        .filter(item => item.product_id && item.quantity && item.unit_price)
        .map(item => ({
          product_id: item.product_id,
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unit_price)
        }));

      const total = validItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

      // Intentar usar la función de Supabase para procesar la venta
      const { data: result, error } = await supabase
        .rpc('process_sale', {
          customer_id: form.customer_id || null,
          items_array: JSON.stringify(validItems),
          total: total,
          note: form.note.trim() || null
        });

      if (error) {
        // Si la función RPC falla, usar método manual
        console.warn('RPC process_sale falló, usando método manual:', error);
        await processSaleManual(validItems, total);
      } else {
        handleSuccess(result?.message || 'Venta procesada correctamente');
      }
      
      // Resetear formulario
      setForm({ customer_id: '', note: '' });
      setSaleItems([{ product_id: '', quantity: '', unit_price: '' }]);
      
    } catch (error) {
      handleError(error, 'Error al procesar la venta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const processSaleManual = async (validItems: any[], total: number) => {
    // Crear la venta manualmente
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert([{
        customer_id: form.customer_id || null,
        total: total,
        note: form.note.trim() || null
      }])
      .select()
      .single();

    if (saleError) throw saleError;

    // Crear los items de venta
    const saleItemsData = validItems.map(item => ({
      sale_id: sale.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price
    }));

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItemsData);

    if (itemsError) throw itemsError;

    handleSuccess('Venta procesada correctamente (método manual)');
  };

  const calculateTotal = (): number => {
    return saleItems.reduce((total, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      return total + (quantity * price);
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const total = calculateTotal();
  const selectedCustomer = customers.find(c => c.id === form.customer_id);

  return (
    <Box borderWidth="1px" rounded="md" p={6} mb={6} bg="white">
      <Heading size="md" mb={6} color="teal.600">
        💰 Nueva Venta
      </Heading>
      
      <VStack gap="6" align="stretch">
        {/* Información del Cliente */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={3}>
            Cliente
          </Text>
          <Select.Root 
            collection={customersCollection}
            value={form.customer_id ? [form.customer_id] : []}
            onValueChange={handleCustomerSelectChange}
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Seleccionar cliente (opcional)" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                {customersCollection.items.map((item) => (
                  <Select.Item key={item.value} item={item}>
                    <Select.ItemText>{item.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
        </Box>

        {/* Productos a Vender */}
        <Box>
          <HStack justify="space-between" align="center" mb={3}>
            <Text fontSize="sm" fontWeight="medium" color="gray.700">
              Productos
            </Text>
            <Button size="sm" onClick={addItem} colorScheme="teal" variant="outline">
              + Agregar Item
            </Button>
          </HStack>

          <VStack gap="3" align="stretch">
            {saleItems.map((item, index) => (
              <Grid key={index} templateColumns="2fr 1fr 1fr auto" gap={3} align="center">
                <Select.Root 
                  collection={productsCollection}
                  value={item.product_id ? [item.product_id] : []}
                  onValueChange={(details) => handleProductSelectChange(index, details)}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Seleccionar producto" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Select.Positioner>
                    <Select.Content>
                      {productsCollection.items.map((productItem) => (
                        <Select.Item key={productItem.value} item={productItem}>
                          <Select.ItemText>{productItem.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Select.Root>

                <Input
                  placeholder="Cantidad"
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.quantity}
                  onChange={(e) => handleItemQuantityChange(index, e.target.value)}
                />

                <Input
                  placeholder="Precio Unit."
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.unit_price}
                  onChange={(e) => handleItemPriceChange(index, e.target.value)}
                />

                <Button
                  size="sm"
                  colorScheme="red"
                  variant="ghost"
                  onClick={() => removeItem(index)}
                  disabled={saleItems.length === 1}
                >
                  🗑️
                </Button>
              </Grid>
            ))}
          </VStack>

          {errors.items && (
            <Text color="red.500" fontSize="sm" mt={2}>
              {errors.items}
            </Text>
          )}
        </Box>

        {/* Resumen */}
        <Box borderWidth="1px" borderRadius="md" p={4} bg="gray.50">
          <HStack justify="space-between">
            <Text fontWeight="medium">Total:</Text>
            <Text fontSize="xl" fontWeight="bold" color="teal.600">
              {formatCurrency(total)}
            </Text>
          </HStack>
          {selectedCustomer && (
            <Text fontSize="sm" color="gray.600" mt={1}>
              Cliente: {selectedCustomer.name}
            </Text>
          )}
        </Box>

        {/* Nota */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
            Nota (opcional)
          </Text>
          <Textarea
            name="note"
            placeholder="Observaciones sobre la venta..."
            value={form.note}
            onChange={handleTextareaChange}
            rows={3}
          />
        </Box>

        {/* Botones */}
        <HStack gap="3" justify="flex-end">
          <Button
            colorScheme="teal"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={total <= 0}
          >
            {isSubmitting ? 'Procesando...' : 'Procesar Venta'}
          </Button>
        </HStack>

        {/* Advertencias */}
        {products.length === 0 && (
          <Alert.Root status="warning">
            <Alert.Indicator />
            <Alert.Description>
              No hay productos disponibles. Debe crear productos antes de realizar ventas.
            </Alert.Description>
          </Alert.Root>
        )}
      </VStack>
    </Box>
  );
}