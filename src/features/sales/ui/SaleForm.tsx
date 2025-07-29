// src/features/sales/ui/SaleForm.tsx - VERSIÓN COMPLETA CON COLLECTION OBLIGATORIA
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
import { useState, useMemo } from 'react';
import { useSaleOperations, useSalesData } from '../logic/useSales'; 
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { type CreateSaleData, type SaleFormItem, type SaleValidation } from '../types';

interface FormErrors {
  items?: string;
  customer_id?: string;
  general?: string;
}

export function SaleForm() {
  const { createSale, validateStock, loading: operationLoading } = useSaleOperations();
  const { customers, products, loading: dataLoading } = useSalesData();
  const { handleError, handleSuccess, handleWarning } = useErrorHandler();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [validationResult, setValidationResult] = useState<SaleValidation | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  
  const [form, setForm] = useState({
    customer_id: '',
    note: '',
  });

  const [saleItems, setSaleItems] = useState<SaleFormItem[]>([
    { product_id: '', quantity: '', unit_price: '' }
  ]);

  // ✅ CORRECTO - Collections dinámicas con useMemo
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

  if (dataLoading) {
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // ✅ CORRECTO - Handler para Select de cliente
  const handleCustomerSelectChange = (details: { value: string[] }) => {
    setForm(prev => ({ ...prev, customer_id: details.value[0] || '' }));
    
    if (errors.customer_id) {
      setErrors(prev => ({ ...prev, customer_id: undefined }));
    }
  };

  // ✅ CORRECTO - Handler para Select de productos
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
    setShowValidation(false);
    setValidationResult(null);
    if (errors.items) {
      setErrors(prev => ({ ...prev, items: undefined }));
    }
  };

  const handleValidateStock = async () => {
    if (!validateForm()) {
      return;
    }

    const validItems = saleItems
      .filter(item => item.product_id && item.quantity && parseFloat(item.quantity) > 0)
      .map(item => ({
        product_id: item.product_id,
        quantity: parseFloat(item.quantity)
      }));

    try {
      const result = await validateStock(validItems);
      setValidationResult(result);
      setShowValidation(true);
      
      if (result.is_valid) {
        handleSuccess('Stock validado correctamente. La venta se puede procesar.');
      } else {
        handleWarning('Hay problemas de stock. Revise los detalles.');
      }
    } catch (error) {
      handleError(error, 'Error validando stock');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Validar stock antes de procesar
    if (!validationResult?.is_valid) {
      handleWarning('Debe validar el stock antes de procesar la venta');
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

      const saleData: CreateSaleData = {
        customer_id: form.customer_id || undefined,
        note: form.note.trim() || undefined,
        items: validItems
      };

      const result = await createSale(saleData);
      
      if (result.success) {
        handleSuccess(result.message);
        
        // Resetear formulario
        setForm({ customer_id: '', note: '' });
        setSaleItems([{ product_id: '', quantity: '', unit_price: '' }]);
        setValidationResult(null);
        setShowValidation(false);
      } else {
        handleError(result.message);
      }
      
    } catch (error) {
      handleError(error, 'Error al procesar la venta');
    } finally {
      setIsSubmitting(false);
    }
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
          
          {selectedCustomer && (
            <Box mt={2} p={2} bg="teal.50" borderRadius="md">
              <Text fontSize="sm" color="teal.700">
                Cliente seleccionado: {selectedCustomer.name}
                {selectedCustomer.email && ` • ${selectedCustomer.email}`}
              </Text>
            </Box>
          )}
        </Box>

        {/* Separador */}
        <Box height="1px" bg="gray.200" />

        {/* Items de Venta */}
        <Box>
          <HStack justify="space-between" mb={3}>
            <Text fontSize="sm" fontWeight="medium" color="gray.700">
              Productos
            </Text>
            <Badge colorScheme="teal" variant="subtle">
              {saleItems.filter(item => item.product_id && item.quantity && item.unit_price).length} productos
            </Badge>
          </HStack>
          
          {errors.items && (
            <Text color="red.500" fontSize="sm" mb={3}>
              {errors.items}
            </Text>
          )}

          <VStack gap="3">
            {saleItems.map((item, index) => {
              const selectedProduct = products.find(p => p.id === item.product_id);
              const itemTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
              
              return (
                <Box key={index} p={3} borderWidth="1px" borderRadius="md" width="100%">
                  <Grid templateColumns="2fr 1fr 1fr auto auto" gap="3" alignItems="center">
                    <Box>
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
                            {productsCollection.items.map((product) => (
                              <Select.Item key={product.value} item={product}>
                                <Select.ItemText>{product.label}</Select.ItemText>
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Select.Root>
                      {selectedProduct && (
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          Disponible: {selectedProduct.availability || 0} {selectedProduct.unit || ''}
                          {selectedProduct.type && selectedProduct.type !== 'ELABORATED' && (
                            <Text as="span" ml={2} color="blue.500">• {selectedProduct.type}</Text>
                          )}
                        </Text>
                      )}
                    </Box>
                    
                    <Input
                      placeholder="Cantidad"
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.quantity}
                      onChange={(e) => handleItemQuantityChange(index, e.target.value)}
                    />
                    
                    <Input
                      placeholder="Precio unitario"
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => handleItemPriceChange(index, e.target.value)}
                    />
                    
                    <Text fontSize="sm" fontWeight="medium" minWidth="80px">
                      {itemTotal > 0 ? formatCurrency(itemTotal) : '-'}
                    </Text>
                    
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => removeItem(index)}
                      disabled={saleItems.length === 1}
                    >
                      ✕
                    </Button>
                  </Grid>
                </Box>
              );
            })}
            
            <Button
              size="sm"
              variant="outline"
              colorScheme="teal"
              onClick={addItem}
              alignSelf="flex-start"
            >
              + Agregar producto
            </Button>
          </VStack>
        </Box>

        {/* Total */}
        {total > 0 && (
          <Box p={4} bg="teal.50" borderRadius="md" borderWidth="1px" borderColor="teal.200">
            <HStack justify="space-between" align="center">
              <Text fontSize="lg" fontWeight="medium" color="teal.700">
                Total de la venta:
              </Text>
              <Text fontSize="xl" fontWeight="bold" color="teal.600">
                {formatCurrency(total)}
              </Text>
            </HStack>
          </Box>
        )}

        {/* Validación de Stock */}
        {showValidation && validationResult && (
          <Box borderWidth="1px" borderRadius="md" p={4} bg={validationResult.is_valid ? "green.50" : "red.50"}>
            <VStack gap="3" align="stretch">
              <Text fontWeight="bold" color={validationResult.is_valid ? "green.700" : "red.700"}>
                {validationResult.is_valid ? "✅ Stock Validado" : "❌ Problemas de Stock"}
              </Text>
              
              <Alert.Root status={validationResult.is_valid ? 'success' : 'error'}>
                <Alert.Indicator />
                <Alert.Description>
                  {validationResult.is_valid 
                    ? 'Todos los productos tienen stock suficiente'
                    : validationResult.error_message || 'Hay productos sin stock suficiente'
                  }
                </Alert.Description>
              </Alert.Root>

              {!validationResult.is_valid && validationResult.insufficient_items && validationResult.insufficient_items.length > 0 && (
                <Box>
                  <Text fontWeight="medium" mb={2} color="red.700">
                    Productos con stock insuficiente:
                  </Text>
                  <VStack gap="2" align="stretch">
                    {validationResult.insufficient_items.map((item, index) => (
                      <Box key={index} p={2} bg="red.100" borderRadius="md">
                        <Text fontSize="sm" color="red.800">
                          <strong>{item.product_name}</strong>: Solicitado {item.requested}, Disponible {item.available}
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}
            </VStack>
          </Box>
        )}

        {/* Nota adicional */}
        <Box>
          <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
            Nota (opcional)
          </Text>
          <Textarea
            placeholder="Observaciones sobre la venta..."
            name="note"
            value={form.note}
            onChange={handleChange}
            rows={3}
            resize="vertical"
          />
        </Box>

        {/* Separador */}
        <Box height="1px" bg="gray.200" />

        {/* Botones de acción */}
        <VStack gap="3" align="stretch">
          {/* Validar Stock */}
          <Button 
            colorScheme="blue"
            variant="outline"
            onClick={handleValidateStock}
            loading={operationLoading}
            loadingText="Validando..."
            disabled={!validateForm() || operationLoading}
          >
            🔍 Validar Stock
          </Button>

          {/* Procesar Venta */}
          <Button 
            colorScheme="teal"
            size="lg"
            onClick={handleSubmit}
            loading={isSubmitting}
            loadingText="Procesando venta..."
            disabled={!validationResult?.is_valid || isSubmitting}
          >
            {validationResult?.is_valid ? '✅ Procesar Venta' : '💰 Procesar Venta (validar primero)'}
          </Button>

          {/* Información adicional */}
          {total > 0 && (
            <Box p={3} bg="gray.50" borderRadius="md" textAlign="center">
              <Text fontSize="sm" color="gray.600">
                {saleItems.filter(item => item.product_id && item.quantity && item.unit_price).length} productos • 
                Total: {formatCurrency(total)}
                {form.customer_id && selectedCustomer && ` • Cliente: ${selectedCustomer.name}`}
              </Text>
            </Box>
          )}
        </VStack>
      </VStack>
    </Box>
  );
}