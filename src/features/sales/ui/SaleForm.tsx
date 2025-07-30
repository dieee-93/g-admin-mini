// features/sales/ui/SaleForm.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  VStack,
  HStack,
  Button,
  Select,
  Input,
  Box,
  Card,
  Text,
  IconButton,
  createListCollection
} from '@chakra-ui/react';
import { Plus, Trash2 } from 'lucide-react';
import { toaster } from '../../../components/ui/toaster';
import { useSaleStockValidation, SaleItem } from '../../../hooks/useSaleStockValidation';
import { StockValidationAlert } from '../../../components/StockValidationAlert';
import { supabase } from '../../../lib/supabase';

interface Product {
  id: string;
  name: string;
  unit_price: number;
}

interface SaleFormData {
  customer_id?: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
  note?: string;
}

export function SaleForm() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [saleItems, setSaleItems] = useState<SaleFormData['items']>([
    { product_id: '', quantity: 1, unit_price: 0 }
  ]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    validateStock,
    clearValidation,
    isValidating,
    validationResult,
    hasValidation,
    isValid
  } = useSaleStockValidation();
  


  // Crear collections para los selects
  const customersCollection = useMemo(() => {
    return createListCollection({
      items: customers.map(customer => ({
        label: customer.name,
        value: customer.id,
      })),
    });
  }, [customers]);

  const productsCollection = useMemo(() => {
    return createListCollection({
      items: products.map(product => ({
        label: product.name,
        value: product.id,
      })),
    });
  }, [products]);

  // Cargar productos y clientes
  useEffect(() => {
    loadInitialData();
  }, []);

  // Validar stock cuando cambian los items
  useEffect(() => {
    const validItems = saleItems.filter(item => 
      item.product_id && item.quantity > 0
    );
    
    if (validItems.length > 0) {
      const saleItemsForValidation: SaleItem[] = validItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }));
      
      // Debounce la validación
      const timeoutId = setTimeout(() => {
        validateStock(saleItemsForValidation);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else {
      clearValidation();
    }
  }, [saleItems, validateStock, clearValidation]);

  const loadInitialData = async () => {
    try {
      const [productsResponse, customersResponse] = await Promise.all([
        supabase.from('products').select('id, name, unit_price'),
        supabase.from('customers').select('id, name')
      ]);

      if (productsResponse.data) setProducts(productsResponse.data);
      if (customersResponse.data) setCustomers(customersResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toaster.create({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        status: 'error'
      });
    }
  };

  const addSaleItem = () => {
    setSaleItems([...saleItems, { product_id: '', quantity: 1, unit_price: 0 }]);
  };

  const removeSaleItem = (index: number) => {
    if (saleItems.length > 1) {
      setSaleItems(saleItems.filter((_, i) => i !== index));
    }
  };

  const updateSaleItem = (index: number, field: keyof SaleFormData['items'][0], value: any) => {
    const updated = [...saleItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-completar precio cuando se selecciona producto
    if (field === 'product_id') {
      const product = products.find(p => p.id === value);
      if (product) {
        updated[index].unit_price = product.unit_price;
      }
    }
    
    setSaleItems(updated);
  };

  const calculateTotal = () => {
    return saleItems.reduce((total, item) => 
      total + (item.quantity * item.unit_price), 0
    );
  };

  const handleSubmit = async () => {
    // Validación final antes de procesar
    const validItems = saleItems.filter(item => 
      item.product_id && item.quantity > 0
    );

    if (validItems.length === 0) {
      toaster.create({
        title: 'Error',
        description: 'Agrega al menos un producto a la venta',
        status: 'error'
      });
      return;
    }

    // Validar stock una vez más antes de procesar
    const finalValidation = await validateStock(
      validItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }))
    );

    if (!finalValidation.is_valid) {
      toaster.create({
        title: 'Stock insuficiente',
        description: 'Verifica el stock antes de continuar',
        status: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.rpc('process_sale', {
        customer_id: selectedCustomer || null,
        items_array: validItems,
        total: calculateTotal(),
        note: note || null
      });

      if (error) throw error;

      toaster.create({
        title: 'Venta procesada',
        description: `Venta #${data.sale_id} creada exitosamente`,
        status: 'success'
      });

      // Reset form
      setSaleItems([{ product_id: '', quantity: 1, unit_price: 0 }]);
      setSelectedCustomer('');
      setNote('');
      clearValidation();
      
    } catch (error) {
      console.error('Error processing sale:', error);
      toaster.create({
        title: 'Error',
        description: 'No se pudo procesar la venta',
        status: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = hasValidation && isValid && !isValidating && !isSubmitting;

  return (
    <Card.Root p={6}>
      <VStack gap="6" align="stretch">
        <Text fontSize="xl" fontWeight="bold">Nueva Venta</Text>

        {/* Cliente */}
        <Box width="100%">
          <Text fontSize="sm" fontWeight="medium" mb={2}>Cliente (opcional)</Text>
          <Select.Root 
            collection={customersCollection}
            value={selectedCustomer ? [selectedCustomer] : []}
            onValueChange={(details) => setSelectedCustomer(details.value[0] || '')}
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Sin cliente específico" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                {customersCollection.items.map((customer) => (
                  <Select.Item key={customer.value} item={customer}>
                    <Select.ItemText>{customer.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
        </Box>

        {/* Items de venta */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" mb={3}>Productos</Text>
          <VStack gap="3">
            {saleItems.map((item, index) => (
              <HStack key={index} gap="3" width="full">
                <Box flex={2}>
                  <Select.Root
                    collection={productsCollection}
                    value={item.product_id ? [item.product_id] : []}
                    onValueChange={(details) => updateSaleItem(index, 'product_id', details.value[0] || '')}
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
                        {productsCollection.items.map((product) => (
                          <Select.Item key={product.value} item={product}>
                            <Select.ItemText>{product.label}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Select.Root>
                </Box>
                
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateSaleItem(index, 'quantity', parseInt(e.target.value) || 0)}
                  placeholder="Cant."
                  min={1}
                  width="80px"
                />
                
                <Input
                  type="number"
                  value={item.unit_price}
                  onChange={(e) => updateSaleItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  placeholder="Precio"
                  width="100px"
                  step={0.01}
                />
                
                <IconButton
                  onClick={() => removeSaleItem(index)}
                  variant="ghost"
                  colorPalette="red"
                  size="sm"
                  disabled={saleItems.length === 1}
                >
                  <Trash2 size={16} />
                </IconButton>
              </HStack>
            ))}
            
            <Button
              onClick={addSaleItem}
              variant="outline"
              size="sm"
            >
              <Plus size={16} />
              Agregar producto
            </Button>
          </VStack>
        </Box>

        {/* Validación de Stock */}
        {(hasValidation || isValidating) && (
          <StockValidationAlert 
            validationResult={validationResult!}
            isLoading={isValidating}
          />
        )}

        {/* Nota */}
        <Box width="100%">
          <Text fontSize="sm" fontWeight="medium" mb={2}>Nota (opcional)</Text>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Observaciones de la venta"
          />
        </Box>

        {/* Total y Submit */}
        <HStack justify="space-between" pt={4} borderTop="1px solid" borderColor="gray.200" gap="4">
          <Text fontSize="lg" fontWeight="bold">
            Total: ${calculateTotal().toFixed(2)}
          </Text>
          
          <Button
            colorPalette="blue"
            onClick={handleSubmit}
            disabled={!canSubmit}
            loading={isSubmitting}
            loadingText="Procesando..."
          >
            {!hasValidation ? 'Validando...' : 'Procesar Venta'}
          </Button>
        </HStack>
      </VStack>
    </Card.Root>
  );
}