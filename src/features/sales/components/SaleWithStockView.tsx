// src/features/sales/components/SalesWithStockView.tsx
import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  VStack, 
  HStack,
  Text, 
  Card,
  Separator,
  Dialog,
  Select,
  Input,
  createListCollection
} from '@chakra-ui/react';
import { 
  ShoppingCartIcon,
  UserIcon,
  CreditCardIcon,
  TrashIcon,
  PlusIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

import { ProductWithStock } from './ProductWithStock';
import { fetchCustomers, processSale } from '../data/saleApi';
import { useSaleStockValidation } from '@/hooks/useSaleStockValidation';
import { toaster } from '@/components/ui/toaster';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface SaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  max_available: number;
}

interface SaleData {
  customer_id?: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
  note?: string;
}

export function SalesWithStockView() {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const { validateStock, validationResult, isValidating } = useSaleStockValidation();

  // Cargar clientes
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  // Validar carrito cuando cambia
  useEffect(() => {
    if (cart.length > 0) {
      const items = cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }));
      validateStock(items);
    }
  }, [cart, validateStock]);

  const customersCollection = createListCollection({
    items: [
      { value: '', label: 'Sin cliente específico' },
      ...customers.map(customer => ({
        value: customer.id,
        label: `${customer.name}${customer.phone ? ` (${customer.phone})` : ''}`
      }))
    ]
  });

  const handleAddToCart = (item: SaleItem) => {
    // Verificar si el producto ya está en el carrito
    const existingIndex = cart.findIndex(cartItem => cartItem.product_id === item.product_id);
    
    if (existingIndex >= 0) {
      // Actualizar cantidad si ya existe
      const updatedCart = [...cart];
      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],
        quantity: updatedCart[existingIndex].quantity + item.quantity,
        unit_price: item.unit_price // Actualizar precio
      };
      setCart(updatedCart);
    } else {
      // Agregar nuevo item
      setCart(prev => [...prev, item]);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  const handleUpdateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    setCart(prev => prev.map(item => 
      item.product_id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const handleUpdateCartPrice = (productId: string, newPrice: number) => {
    setCart(prev => prev.map(item => 
      item.product_id === productId 
        ? { ...item, unit_price: newPrice }
        : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
  };

  const handleProcessSale = async () => {
    if (cart.length === 0) {
      toaster.create({
        title: "Carrito vacío",
        description: "Agrega productos antes de procesar la venta",
        status: "warning",
      });
      return;
    }

    // Validación final de stock
    if (validationResult && !validationResult.is_valid) {
      toaster.create({
        title: "Stock insuficiente",
        description: "Algunos productos no tienen stock suficiente",
        status: "error",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const saleData: SaleData = {
        customer_id: selectedCustomerId || undefined,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        })),
        note: note || undefined
      };

      const result = await processSale(saleData);

      if (result.success) {
        toaster.create({
          title: "¡Venta procesada!",
          description: `Venta #${result.sale_id} procesada exitosamente`,
          status: "success",
        });

        // Limpiar formulario
        setCart([]);
        setSelectedCustomerId('');
        setNote('');
        setShowCheckout(false);
      } else {
        throw new Error(result.message || 'Error al procesar la venta');
      }

    } catch (error) {
      console.error('Error processing sale:', error);
      toaster.create({
        title: "Error al procesar venta",
        description: error instanceof Error ? error.message : "Error inesperado",
        status: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box>
      <VStack gap="6" align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack gap="1" align="start">
            <Text fontSize="2xl" fontWeight="bold">
              💰 Ventas con Stock en Tiempo Real
            </Text>
            <Text color="gray.600">
              Información de stock integrada para prevenir sobreventa
            </Text>
          </VStack>

          {cart.length > 0 && (
            <Button
              colorPalette="green"
              size="lg"
              onClick={() => setShowCheckout(true)}
              disabled={isValidating}
            >
              <ShoppingCartIcon className="w-5 h-5" />
              Ver Carrito ({cart.length})
            </Button>
          )}
        </HStack>

        <Separator />

        {/* Carrito resumen (si hay items) */}
        {cart.length > 0 && (
          <Card.Root variant="filled" colorPalette="blue">
            <Card.Body>
              <VStack gap="3" align="stretch">
                <HStack justify="space-between" align="center">
                  <Text fontWeight="bold">
                    🛒 Carrito ({cart.length} productos)
                  </Text>
                  <Text fontSize="xl" fontWeight="bold" color="blue.600">
                    Total: ${calculateTotal().toFixed(2)}
                  </Text>
                </HStack>

                <HStack gap="2" wrap="wrap">
                  {cart.map((item, idx) => (
                    <Box 
                      key={idx}
                      bg="white" 
                      px="3" 
                      py="2" 
                      borderRadius="md" 
                      fontSize="sm"
                    >
                      {item.quantity}x {item.product_name} @ ${item.unit_price}
                    </Box>
                  ))}
                </HStack>

                {validationResult && !validationResult.is_valid && (
                  <Text color="red.600" fontSize="sm" fontWeight="medium">
                    ⚠️ {validationResult.error_message}
                  </Text>
                )}
              </VStack>
            </Card.Body>
          </Card.Root>
        )}

        {/* Componente principal de productos con stock */}
        <ProductWithStock
          onAddToCart={handleAddToCart}
          currentCart={cart}
          disabled={isProcessing}
        />
      </VStack>

      {/* Dialog de Checkout */}
      <Dialog.Root open={showCheckout} onOpenChange={(e) => setShowCheckout(e.open)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="2xl">
            <Dialog.Header>
              <Dialog.Title>
                <CreditCardIcon className="w-5 h-5 inline mr-2" />
                Finalizar Venta
              </Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            
            <Dialog.Body>
              <VStack gap="4" align="stretch">
                {/* Resumen de productos */}
                <Box>
                  <Text mb="3" fontWeight="medium">Productos</Text>
                  <VStack gap="2" align="stretch">
                    {cart.map((item, idx) => (
                      <HStack key={idx} justify="space-between" p="3" bg="gray.50" borderRadius="md">
                        <VStack gap="1" align="start">
                          <Text fontWeight="medium">{item.product_name}</Text>
                          <Text fontSize="sm" color="gray.600">
                            Máximo disponible: {item.max_available}
                          </Text>
                        </VStack>
                        
                        <HStack gap="2">
                          <Input
                            type="number"
                            min="1"
                            max={item.max_available}
                            value={item.quantity}
                            onChange={(e) => handleUpdateCartQuantity(item.product_id, parseInt(e.target.value) || 0)}
                            w="80px"
                            size="sm"
                          />
                          <Text fontSize="sm">×</Text>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => handleUpdateCartPrice(item.product_id, parseFloat(e.target.value) || 0)}
                            w="100px"
                            size="sm"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            colorPalette="red"
                            onClick={() => handleRemoveFromCart(item.product_id)}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </HStack>
                        
                        <Text fontWeight="bold">
                          ${(item.quantity * item.unit_price).toFixed(2)}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>

                <Separator />

                {/* Cliente */}
                <Box>
                  <Text mb="2" fontWeight="medium">Cliente (Opcional)</Text>
                  <Select.Root 
                    collection={customersCollection}
                    value={selectedCustomerId ? [selectedCustomerId] : []}
                    onValueChange={(details) => setSelectedCustomerId(details.value[0] || '')}
                  >
                    <Select.Trigger>
                      <UserIcon className="w-4 h-4" />
                      <Select.ValueText placeholder="Seleccionar cliente" />
                    </Select.Trigger>
                    <Select.Content>
                      {customersCollection.items.map((customer) => (
                        <Select.Item key={customer.value} item={customer}>
                          {customer.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Box>

                {/* Nota */}
                <Box>
                  <Text mb="2" fontWeight="medium">Nota (Opcional)</Text>
                  <Input
                    placeholder="Nota adicional para la venta..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </Box>

                {/* Validación de stock */}
                {validationResult && !validationResult.is_valid && (
                  <Box p="3" bg="red.50" borderRadius="md" borderLeft="4px solid" borderColor="red.500">
                    <Text color="red.700" fontWeight="medium" mb="1">
                      Stock Insuficiente
                    </Text>
                    <Text color="red.600" fontSize="sm">
                      {validationResult.error_message}
                    </Text>
                    {validationResult.insufficient_items && (
                      <VStack gap="1" mt="2" align="start">
                        {validationResult.insufficient_items.map((item, idx) => (
                          <Text key={idx} fontSize="sm" color="red.600">
                            • {item.product_name}: necesitas {item.required}, disponible {item.available}
                          </Text>
                        ))}
                      </VStack>
                    )}
                  </Box>
                )}

                {/* Total */}
                <HStack justify="space-between" p="4" bg="blue.50" borderRadius="md">
                  <Text fontSize="lg" fontWeight="bold">Total de la Venta:</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                    ${calculateTotal().toFixed(2)}
                  </Text>
                </HStack>
              </VStack>
            </Dialog.Body>
            
            <Dialog.Footer>
              <HStack gap="3">
                <Button
                  variant="outline"
                  onClick={() => setShowCheckout(false)}
                  disabled={isProcessing}
                >
                  Cancelar
                </Button>
                <Button
                  colorPalette="green"
                  onClick={handleProcessSale}
                  loading={isProcessing}
                  disabled={
                    cart.length === 0 || 
                    (validationResult && !validationResult.is_valid) ||
                    isValidating
                  }
                >
                  <CreditCardIcon className="w-4 h-4" />
                  Procesar Venta (${calculateTotal().toFixed(2)})
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
}