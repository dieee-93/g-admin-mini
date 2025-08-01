// features/sales/ui/SaleForm.tsx
// ✅ CORREGIDO: Heroicons + Chakra v3.23 + Select collections
import  { useState, useEffect, useMemo } from 'react';
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
import { 
  PlusIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';
import { toaster } from '../../../components/ui/toaster';
import { useSaleStockValidation, type SaleItem } from '../../../hooks/useSaleStockValidation';
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

  // ✅ CORREGIDO: Collections para Select v3.23
  const customersCollection = useMemo(() => {
    return createListCollection({
      items: [
        { label: 'Sin cliente específico', value: '' },
        ...customers.map(customer => ({
          label: customer.name,
          value: customer.id,
        }))
      ],
    });
  }, [customers]);

  const productsCollection = useMemo(() => {
    return createListCollection({
      items: [
        { label: 'Seleccionar producto', value: '' },
        ...products.map(product => ({
          label: product.name,
          value: product.id,
        }))
      ],
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
      // Cargar productos
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (productsError) throw productsError;

      // Cargar clientes  
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (customersError) throw customersError;

      setProducts(productsData || []);
      setCustomers(customersData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toaster.create({
        title: "Error al cargar datos",
        description: "No se pudieron cargar los productos y clientes",
        type: "error",
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
    const updatedItems = [...saleItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Auto-set price based on product
    if (field === 'product_id' && value) {
      const product = products.find(p => p.id === value);
      if (product) {
        updatedItems[index].unit_price = product.unit_price;
      }
    }
    
    setSaleItems(updatedItems);
  };

  const handleSubmit = async () => {
    if (!isValid) {
      toaster.create({
        title: "Stock insuficiente",
        description: "Revisa las alertas de stock antes de procesar la venta",
        type: "error",
      });
      return;
    }

    const validItems = saleItems.filter(item => 
      item.product_id && item.quantity > 0 && item.unit_price > 0
    );

    if (validItems.length === 0) {
      toaster.create({
        title: "Venta vacía",
        description: "Agrega al menos un producto para procesar la venta",
        type: "warning",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const total = validItems.reduce((sum, item) => 
        sum + (item.quantity * item.unit_price), 0
      );

      // Crear venta
      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert({
          customer_id: selectedCustomer || null,
          total,
          note: note || null
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Crear items de venta
      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(
          validItems.map(item => ({
            sale_id: saleData.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price
          }))
        );

      if (itemsError) throw itemsError;

      toaster.create({
        title: "Venta procesada",
        description: `Venta #${saleData.id.slice(0, 8)} por $${total} procesada exitosamente`,
        status: "success",
      });

      // Reset form
      setSaleItems([{ product_id: '', quantity: 1, unit_price: 0 }]);
      setSelectedCustomer('');
      setNote('');
      clearValidation();

    } catch (error) {
      console.error('Error processing sale:', error);
      toaster.create({
        title: "Error al procesar venta",
        description: "Ocurrió un error al procesar la venta. Intenta nuevamente.",
        status: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = saleItems.reduce((sum, item) => 
    sum + (item.quantity * item.unit_price), 0
  );

  return (
    <Card.Root>
      <Card.Header>
        <Text fontSize="xl" fontWeight="bold">Nueva Venta</Text>
      </Card.Header>
      
      <Card.Body>
        <VStack gap="6" align="stretch">
          {/* Cliente */}
          <Box>
            <Text mb="2" fontWeight="medium">Cliente</Text>
            <Select.Root 
              collection={customersCollection}
              value={selectedCustomer ? [selectedCustomer] : []}
              onValueChange={(details) => setSelectedCustomer(details.value[0] || '')}
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Seleccionar cliente" />
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

          {/* Items de venta */}
          <VStack gap="4" align="stretch">
            <HStack justify="space-between">
              <Text fontWeight="medium">Productos</Text>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addSaleItem}
              >
                <PlusIcon style={{ width: '16px', height: '16px' }} />
                Agregar
              </Button>
            </HStack>

            {saleItems.map((item, index) => (
              <Card.Root key={index} variant="outline">
                <Card.Body>
                  <HStack gap="4" align="end">
                    {/* Producto */}
                    <Box flex="2">
                      <Text mb="2" fontSize="sm">Producto</Text>
                      <Select.Root 
                        collection={productsCollection}
                        value={item.product_id ? [item.product_id] : []}
                        onValueChange={(details) => 
                          updateSaleItem(index, 'product_id', details.value[0] || '')
                        }
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

                    {/* Cantidad */}
                    <Box flex="1">
                      <Text mb="2" fontSize="sm">Cantidad</Text>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => 
                          updateSaleItem(index, 'quantity', parseInt(e.target.value) || 1)
                        }
                      />
                    </Box>

                    {/* Precio */}
                    <Box flex="1">
                      <Text mb="2" fontSize="sm">Precio Unit.</Text>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => 
                          updateSaleItem(index, 'unit_price', parseFloat(e.target.value) || 0)
                        }
                      />
                    </Box>

                    {/* Total del item */}
                    <Box flex="1">
                      <Text mb="2" fontSize="sm">Total</Text>
                      <Text fontWeight="bold">
                        ${(item.quantity * item.unit_price).toFixed(2)}
                      </Text>
                    </Box>

                    {/* Eliminar */}
                    <IconButton
                      variant="ghost"
                      colorPalette="red"
                      onClick={() => removeSaleItem(index)}
                      disabled={saleItems.length === 1}
                      aria-label="Eliminar item"
                    >
                      <TrashIcon style={{ width: '16px', height: '16px' }} />
                    </IconButton>
                  </HStack>
                </Card.Body>
              </Card.Root>
            ))}
          </VStack>

          {/* Validación de stock */}
          {hasValidation && (
            <StockValidationAlert validationResult={validationResult} />
          )}

          {/* Notas */}
          <Box>
            <Text mb="2" fontWeight="medium">Notas (opcional)</Text>
            <Input
              placeholder="Notas adicionales sobre la venta"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Box>

          {/* Total y acciones */}
          <HStack justify="space-between" pt="4" borderTop="1px solid" borderColor="gray.200">
            <Text fontSize="xl" fontWeight="bold">
              Total: ${total.toFixed(2)}
            </Text>

            <HStack gap="3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSaleItems([{ product_id: '', quantity: 1, unit_price: 0 }]);
                  setSelectedCustomer('');
                  setNote('');
                  clearValidation();
                }}
              >
                Limpiar
              </Button>
              
              <Button 
                colorPalette="green"
                onClick={handleSubmit}
                loading={isSubmitting}
                loadingText="Procesando..."
                disabled={!isValid || total === 0}
              >
                Procesar Venta
              </Button>
            </HStack>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}