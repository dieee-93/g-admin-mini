// src/features/sales/components/SalesWithStockView.tsx (Enhanced Version)
import { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Button, 
  VStack, 
  HStack,
  Text, 
  Card,
  Dialog,
  Select,
  Input,
  createListCollection,
  Grid,
  Alert
} from '@chakra-ui/react';
import { 
  UserIcon,
  CreditCardIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckSolid
} from '@heroicons/react/24/solid';

import { ProductWithStock } from './ProductWithStock';
import { StockValidationAlert } from './StockValidationAlert';
import { CartValidationSummary, CartQuickAlert } from './CartValidationSummary';
import { fetchCustomers, processSale } from '../data/saleApi';
import { useSalesCart } from '../logic/useSalesCart';
import { toaster } from '@/shared/ui/toaster';
import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents, type OrderPlacedEvent } from '@/lib/events/RestaurantEvents';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export function SalesWithStockView() {
  // Estado del componente
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'validation' | 'details' | 'confirmation'>('validation');

  // Hook del carrito con validaciones mejoradas
  const {
    cart,
    summary,
    cartStats,
    validationResult,
    isValidating,
    canProcessSale,
    addToCart,
    updateQuantity,
    clearCart,
    validateCartStock,
    getSaleData
  } = useSalesCart({
    enableRealTimeValidation: true,
    validationDebounceMs: 800,
    enableProactiveWarnings: true,
    warningThreshold: 0.8
  });

  // Cargar clientes al inicializar
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
      toaster.create({
        title: "Error al cargar clientes",
        description: "No se pudieron cargar los clientes. Intenta recargar la página.",
        status: "error",
        duration: 5000,
      });
    }
  };

  // Collection para el select de clientes
  const customersCollection = createListCollection({
    items: [
      { value: '', label: 'Sin cliente específico' },
      ...customers.map(customer => ({
        value: customer.id,
        label: `${customer.name}${customer.phone ? ` (${customer.phone})` : ''}`
      }))
    ]
  });

  // Manejar apertura del checkout con validación previa
  const handleOpenCheckout = useCallback(async () => {
    if (!summary.hasItems) {
      toaster.create({
        title: "Carrito vacío",
        description: "Agrega productos al carrito antes de continuar",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    // Validación completa antes del checkout
    setCheckoutStep('validation');
    setShowCheckout(true);
    
    // Trigger validación inmediata
    await validateCartStock();
  }, [summary.hasItems, validateCartStock]);

  // Proceder al siguiente paso del checkout
  const handleProceedToNextStep = useCallback(() => {
    if (checkoutStep === 'validation') {
      if (!validationResult?.is_valid) {
        toaster.create({
          title: "Validación pendiente",
          description: "Espera a que se complete la validación de stock",
          status: "warning",
          duration: 3000,
        });
        return;
      }
      setCheckoutStep('details');
    } else if (checkoutStep === 'details') {
      setCheckoutStep('confirmation');
    }
  }, [checkoutStep, validationResult]);

  // Procesar la venta final
  const handleProcessSale = useCallback(async () => {
    if (!canProcessSale) {
      toaster.create({
        title: "No se puede procesar la venta",
        description: "Verifica que todos los productos tengan stock suficiente",
        status: "error",
        duration: 4000,
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Validación final antes de procesar
      const finalValidation = await validateCartStock();
      
      if (finalValidation && !finalValidation.is_valid) {
        toaster.create({
          title: "Stock insuficiente",
          description: "El stock cambió desde la última validación. Revisa tu carrito.",
          status: "error",
          duration: 5000,
        });
        setCheckoutStep('validation');
        return;
      }

      // Procesar venta
      const saleData = getSaleData(selectedCustomerId || undefined, note || undefined);
      const saleResult = await processSale(saleData);

      // Emitir evento ORDER_PLACED después del procesamiento exitoso
      const orderPlacedEvent: OrderPlacedEvent = {
        orderId: saleResult.sale_id || `sale_${Date.now()}`,
        customerId: selectedCustomerId || undefined,
        tableId: undefined, // TODO: Add table support in future
        items: cart.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
          specialInstructions: note || undefined
        })),
        totalAmount: summary.totalAmount,
        orderType: 'dine_in', // Default for POS sales
        timestamp: new Date().toISOString()
      };

      await EventBus.emit(RestaurantEvents.ORDER_PLACED, orderPlacedEvent, 'SalesModule');

      // Éxito
      toaster.create({
        title: "¡Venta procesada!",
        description: `Venta por $${summary.totalAmount.toFixed(2)} completada exitosamente`,
        status: "success",
        duration: 5000,
      });

      // Reset
      clearCart();
      setSelectedCustomerId('');
      setNote('');
      setShowCheckout(false);
      setCheckoutStep('validation');

    } catch (error) {
      console.error('Error processing sale:', error);
      toaster.create({
        title: "Error al procesar venta",
        description: error instanceof Error ? error.message : "Error inesperado",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [canProcessSale, validateCartStock, getSaleData, selectedCustomerId, note, summary.totalAmount, clearCart]);

  // Manejar sugerencia de cantidad máxima
  const handleSuggestMaxQuantity = useCallback((productId: string, maxQuantity: number) => {
    updateQuantity(productId, maxQuantity);
    toaster.create({
      title: "Cantidad ajustada",
      description: `Cantidad ajustada al máximo disponible: ${maxQuantity}`,
      status: "info",
      duration: 3000,
    });
  }, [updateQuantity]);

  return (
    <Box p="6" maxW="7xl" mx="auto">
      {/* Header */}
      <VStack gap="6" align="stretch">
        <HStack justify="space-between" align="center">
          <VStack align="start" gap="1">
            <Text fontSize="2xl" fontWeight="bold">
              Punto de Venta
            </Text>
            <Text color="gray.600">
              Gestión de ventas con validación de stock en tiempo real
            </Text>
          </VStack>
          
          <HStack gap="3">
            <Button
              variant="outline"
              colorPalette="blue"
              onClick={() => validateCartStock()}
              loading={isValidating}
              loadingText="Validando..."
              disabled={!summary.hasItems}
            >
              <ArrowPathIcon className="w-4 h-4" />
              Revalidar Stock
            </Button>
            
            <Button
              colorPalette="green"
              onClick={handleOpenCheckout}
              disabled={!summary.hasItems || isValidating}
              loading={isProcessing}
              loadingText="Procesando..."
            >
              <CreditCardIcon className="w-4 h-4" />
              Finalizar Venta ({summary.itemCount})
            </Button>
          </HStack>
        </HStack>

        {/* Alerta rápida del carrito */}
        <CartQuickAlert 
          validationResult={validationResult}
          isValidating={isValidating}
        />

        {/* Layout principal */}
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap="6">
          {/* Productos disponibles */}
          <Box>
            <VStack gap="4" align="stretch">
              <Text fontSize="lg" fontWeight="semibold">
                Productos Disponibles
              </Text>
              
              <ProductWithStock 
                onAddToCart={addToCart}
                onQuantityChange={updateQuantity}
                currentCart={cart}
                disabled={isProcessing}
              />
            </VStack>
          </Box>

          {/* Resumen del carrito */}
          <Box>
            <CartValidationSummary
              cart={cart}
              summary={summary}
              validationResult={validationResult}
              isValidating={isValidating}
              onProceedToCheckout={handleOpenCheckout}
              onValidateCart={() => validateCartStock()}
              disabled={isProcessing}
            />
          </Box>
        </Grid>
      </VStack>

      {/* Dialog de Checkout */}
      <Dialog.Root 
        open={showCheckout} 
        onOpenChange={({ open }) => !isProcessing && setShowCheckout(open)}
        size="lg"
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                {checkoutStep === 'validation' && 'Validación de Stock'}
                {checkoutStep === 'details' && 'Detalles de Venta'}
                {checkoutStep === 'confirmation' && 'Confirmar Venta'}
              </Dialog.Title>
              <Dialog.CloseTrigger disabled={isProcessing} />
            </Dialog.Header>

            <Dialog.Body>
              <VStack gap="4" align="stretch">
                {/* Paso 1: Validación */}
                {checkoutStep === 'validation' && (
                  <VStack gap="4" align="stretch">
                    <Text>
                      Verificando disponibilidad de stock para todos los productos...
                    </Text>
                    
                    <StockValidationAlert
                      validationResult={validationResult}
                      isValidating={isValidating}
                      onSuggestMaxQuantity={handleSuggestMaxQuantity}
                      onRetryValidation={() => validateCartStock()}
                      showSuggestions={true}
                    />

                    {validationResult?.is_valid && (
                      <Alert.Root status="success">
                        <Alert.Indicator />
                        <Alert.Title>Stock confirmado</Alert.Title>
                        <Alert.Description>
                          Todos los productos tienen stock disponible. Puedes continuar con la venta.
                        </Alert.Description>
                      </Alert.Root>
                    )}
                  </VStack>
                )}

                {/* Paso 2: Detalles */}
                {checkoutStep === 'details' && (
                  <VStack gap="4" align="stretch">
                    {/* Selección de cliente */}
                    <Box>
                      <Text mb="2" fontWeight="medium">Cliente</Text>
                      <Select.Root
                        collection={customersCollection}
                        value={selectedCustomerId ? [selectedCustomerId] : []}
                        onValueChange={(details) => setSelectedCustomerId(details.value[0] || '')}
                      >
                        <Select.Trigger>
                          <UserIcon className="w-4 h-4" />
                          <Select.ValueText placeholder="Seleccionar cliente (opcional)" />
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
                  </VStack>
                )}

                {/* Paso 3: Confirmación */}
                {checkoutStep === 'confirmation' && (
                  <VStack gap="4" align="stretch">
                    <Alert.Root status="info">
                      <Alert.Indicator />
                      <Alert.Title>Confirmar venta</Alert.Title>
                      <Alert.Description>
                        ¿Estás seguro de procesar esta venta? Esta acción reducirá el stock automáticamente.
                      </Alert.Description>
                    </Alert.Root>

                    {/* Resumen final */}
                    <Card.Root p="4" bg="gray.50">
                      <VStack gap="2" align="stretch">
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Total de productos:</Text>
                          <Text>{cartStats.totalItems}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontWeight="medium">Monto total:</Text>
                          <Text fontSize="lg" fontWeight="bold" color="green.600">
                            ${summary.totalAmount.toFixed(2)}
                          </Text>
                        </HStack>
                        {selectedCustomerId && (
                          <HStack justify="space-between">
                            <Text fontWeight="medium">Cliente:</Text>
                            <Text>
                              {customers.find(c => c.id === selectedCustomerId)?.name || 'N/A'}
                            </Text>
                          </HStack>
                        )}
                      </VStack>
                    </Card.Root>
                  </VStack>
                )}
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <HStack gap="3" justify="space-between" w="full">
                <Button
                  variant="outline"
                  onClick={() => setShowCheckout(false)}
                  disabled={isProcessing}
                >
                  Cancelar
                </Button>

                <HStack gap="2">
                  {checkoutStep !== 'validation' && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (checkoutStep === 'details') setCheckoutStep('validation');
                        if (checkoutStep === 'confirmation') setCheckoutStep('details');
                      }}
                      disabled={isProcessing}
                    >
                      Atrás
                    </Button>
                  )}

                  {checkoutStep !== 'confirmation' ? (
                    <Button
                      colorPalette="blue"
                      onClick={handleProceedToNextStep}
                      disabled={
                        (checkoutStep === 'validation' && (!validationResult?.is_valid || isValidating)) ||
                        isProcessing
                      }
                      loading={isValidating}
                      loadingText="Validando..."
                    >
                      {checkoutStep === 'validation' ? 'Continuar' : 'Siguiente'}
                    </Button>
                  ) : (
                    <Button
                      colorPalette="green"
                      onClick={handleProcessSale}
                      loading={isProcessing}
                      loadingText="Procesando..."
                      disabled={!canProcessSale}
                    >
                      <CheckSolid className="w-4 h-4" />
                      Procesar Venta
                    </Button>
                  )}
                </HStack>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
}