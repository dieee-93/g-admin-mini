// src/features/sales/components/SalesWithStockView.tsx (Enhanced Version)
import { useState, useEffect, useCallback } from 'react';
import { 
  Stack, 
  Button, 
  Typography, 
  CardWrapper ,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalClose,
  SelectField,
  InputField,
  Grid,
  Alert,
  createListCollection
} from '@/shared/ui';
import { notify } from '@/lib/notifications';
import {
  CreditCardIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckSolid
} from '@heroicons/react/24/solid';

import { ProductWithStock } from './ProductWithStock';
import { StockValidationAlert } from './StockValidationAlert';
import { CartValidationSummary, CartQuickAlert } from './CartValidationSummary';
import { fetchCustomers } from '../services/saleApi';
import { useSalesCart } from '../hooks/useSalesCart';
import { useSalesStore } from '@/store/salesStore';
import { supabase } from '@/lib/supabase/client';

import { logger } from '@/lib/logging';
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

  // Zustand Store
  const { selectedTableId, setSelectedTableId } = useSalesStore(state => ({
    selectedTableId: state.selectedTableId,
    setSelectedTableId: state.setSelectedTableId,
  }));

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
      logger.error('SalesStore', 'Error loading customers:', error);
      notify.error({
        title: "Error al cargar clientes",
        description: "No se pudieron cargar los clientes. Intenta recargar la página.",
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
      notify.warning({
        title: "Carrito vacío",
        description: "Agrega productos al carrito antes de continuar",
      });
      return;
    }

    if (!selectedTableId) {
      notify.warning({
        title: "No hay mesa seleccionada",
        description: "Por favor, selecciona una mesa para la venta.",
      });
      return;
    }

    // Validación completa antes del checkout
    setCheckoutStep('validation');
    setShowCheckout(true);
    
    // Trigger validación inmediata
    await validateCartStock();
  }, [summary.hasItems, validateCartStock, selectedTableId]);

  // Proceder al siguiente paso del checkout
  const handleProceedToNextStep = useCallback(() => {
    if (checkoutStep === 'validation') {
      if (validationResult && !validationResult.is_valid) {
        notify.warning({
          title: "Hay problemas con el stock",
          description: "Revisa los productos en el carrito antes de continuar.",
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
      notify.error({
        title: "No se puede procesar la venta",
        description: "Verifica que todos los productos tengan stock suficiente.",
      });
      return;
    }

    if (!selectedTableId) {
      notify.error({
        title: "Error Crítico: No hay mesa seleccionada",
        description: "La venta no puede ser procesada sin una mesa.",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const saleData = getSaleData(selectedCustomerId || undefined, note || undefined);

      const { error } = await supabase.rpc('pos_process_sale_with_order', {
        p_table_id: selectedTableId,
        p_customer_id: saleData.customer_id,
        p_items: saleData.items,
        p_note: saleData.note
      });

      if (error) {
        throw new Error(error.message);
      }

      // Éxito
      notify.success({
        title: "¡Venta procesada!",
        description: `Venta por $${summary.totalAmount.toFixed(2)} completada exitosamente`,
      });

      // Reset
      clearCart();
      setSelectedCustomerId('');
      setNote('');
      setSelectedTableId(null); // Limpiar la mesa seleccionada
      setShowCheckout(false);
      setCheckoutStep('validation');

    } catch (error) {
      logger.error('SalesStore', 'Error processing sale:', error);
      notify.error({
        title: "Error al procesar venta",
        description: error instanceof Error ? error.message : "Error inesperado",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [
    canProcessSale,
    getSaleData,
    selectedCustomerId,
    note,
    summary.totalAmount,
    clearCart,
    selectedTableId,
    setSelectedTableId
  ]);

  return (
    <Stack direction="column" gap="lg" p="lg" maxW="7xl" mx="auto">
      {/* Header */}
      <Stack direction="column" gap="lg" align="stretch">
        <Stack direction="row" justify="space-between" align="center">
          <Stack direction="column" align="start" gap="xs">
            <Typography variant="heading" size="xl" weight="bold">
              Punto de Venta
            </Typography>
            <Typography variant="body" size="md" color="text.muted">
              Gestión de ventas con validación de stock en tiempo real
            </Typography>
          </Stack>
          
          <Stack direction="row" gap="md">
            <Button
              variant="outline"
              colorPalette="blue"
              onClick={() => validateCartStock()}
              loading={isValidating}
              disabled={!summary.hasItems}
            >
              <ArrowPathIcon className="w-4 h-4" />
              Revalidar Stock
            </Button>
            
            <Button
              colorPalette="green"
              onClick={handleOpenCheckout}
              disabled={!summary.hasItems || isValidating || !selectedTableId}
              loading={isProcessing}
            >
              <CreditCardIcon className="w-4 h-4" />
              Finalizar Venta ({summary.itemCount})
            </Button>
          </Stack>
        </Stack>

        {!selectedTableId && (
          <Alert status='warning'>
            <Alert.Title>No hay mesa seleccionada</Alert.Title>
            <Alert.Description>
              Por favor, selecciona una mesa para poder iniciar una venta.
            </Alert.Description>
          </Alert>
        )}

        {/* Alerta rápida del carrito */}
        <CartQuickAlert 
          validationResult={validationResult}
          isValidating={isValidating}
        />

        {/* Layout principal */}
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap="lg">
          {/* Productos disponibles */}
          <Stack direction="column" gap="md" align="stretch">
            <Typography variant="heading" size="lg" weight="semibold">
              Productos Disponibles
            </Typography>
            
            <ProductWithStock 
              onAddToCart={addToCart}
              onQuantityChange={updateQuantity}
              currentCart={cart}
              disabled={isProcessing || !selectedTableId}
            />
          </Stack>

          {/* Resumen del carrito */}
          <Stack direction="column">
            <CartValidationSummary
              cart={cart}
              summary={summary}
              validationResult={validationResult}
              isValidating={isValidating}
              onProceedToCheckout={handleOpenCheckout}
              onValidateCart={() => validateCartStock()}
              disabled={isProcessing || !selectedTableId}
            />
          </Stack>
        </Grid>
      </Stack>

      {/* Modal de Checkout */}
      <Modal 
        isOpen={showCheckout} 
        onClose={() => !isProcessing && setShowCheckout(false)}
        size="lg"
      >
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {checkoutStep === 'validation' && 'Validación de Stock'}
              {checkoutStep === 'details' && 'Detalles de Venta'}
              {checkoutStep === 'confirmation' && 'Confirmar Venta'}
            </ModalTitle>
            <ModalClose />
          </ModalHeader>

          <ModalBody>
              <Stack direction="column" gap="md" align="stretch">
                {/* Paso 1: Validación */}
                {checkoutStep === 'validation' && (
                  <Stack direction="column" gap="md" align="stretch">
                    <Typography variant="body" size="md">
                      Verificando disponibilidad de stock para todos los productos...
                    </Typography>
                    
                    {validationResult && (
                      <StockValidationAlert
                        validationResult={validationResult}
                        isLoading={isValidating}
                      />
                    )}

                    {validationResult?.is_valid && (
                      <Alert status="success">
                        <CheckSolid className="w-4 h-4" />
                        <Alert.Title>Stock confirmado</Alert.Title>
                        <Alert.Description>
                          Todos los productos tienen stock disponible. Puedes continuar con la venta.
                        </Alert.Description>
                      </Alert>
                    )}
                  </Stack>
                )}

                {/* Paso 2: Detalles */}
                {checkoutStep === 'details' && (
                  <Stack direction="column" gap="md" align="stretch">
                    {/* Selección de cliente */}
                    <Stack direction="column" gap="xs">
                      <Typography variant="body" size="md" weight="medium">Cliente</Typography>
                      <SelectField
                        collection={customersCollection}
                        value={selectedCustomerId ? [selectedCustomerId] : []}
                        onValueChange={(details) => setSelectedCustomerId(details.value[0] || '')}
                        placeholder="Seleccionar cliente (opcional)"
                      />
                    </Stack>

                    {/* Nota */}
                    <Stack direction="column" gap="xs">
                      <Typography variant="body" size="md" weight="medium">Nota (Opcional)</Typography>
                      <InputField
                        placeholder="Nota adicional para la venta..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </Stack>
                  </Stack>
                )}

                {/* Paso 3: Confirmación */}
                {checkoutStep === 'confirmation' && (
                  <Stack direction="column" gap="md" align="stretch">
                    <Alert status="info">
                      <Alert.Title>Confirmar venta</Alert.Title>
                      <Alert.Description>
                        ¿Estás seguro de procesar esta venta? Esta acción reducirá el stock automáticamente.
                      </Alert.Description>
                    </Alert>

                    {/* Resumen final */}
                    <CardWrapper padding="md">
                      <Stack direction="column" gap="sm" align="stretch">
                        <Stack direction="row" justify="space-between">
                          <Typography variant="body" size="md" weight="medium">Total de productos:</Typography>
                          <Typography variant="body" size="md">{cartStats.totalItems}</Typography>
                        </Stack>
                        <Stack direction="row" justify="space-between">
                          <Typography variant="body" size="md" weight="medium">Monto total:</Typography>
                          <Typography variant="body" size="lg" weight="bold" >
                            ${summary.totalAmount.toFixed(2)}
                          </Typography>
                        </Stack>
                        {selectedCustomerId && (
                          <Stack direction="row" justify="space-between">
                            <Typography variant="body" size="md" weight="medium">Cliente:</Typography>
                            <Typography variant="body" size="md">
                              {customers.find(c => c.id === selectedCustomerId)?.name || 'N/A'}
                            </Typography>
                          </Stack>
                        )}
                         {selectedTableId && (
                          <Stack direction="row" justify="space-between">
                            <Typography variant="body" size="md" weight="medium">Mesa:</Typography>
                            <Typography variant="body" size="md">
                              {selectedTableId}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                    </CardWrapper >
                  </Stack>
                )}
              </Stack>
            </ModalBody>

            <ModalFooter>
              <Stack direction="row" gap="md" justify="space-between" w="full">
                <Button
                  variant="outline"
                  onClick={() => setShowCheckout(false)}
                  disabled={isProcessing}
                >
                  Cancelar
                </Button>

                <Stack direction="row" gap="sm">
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
                    >
                      {checkoutStep === 'validation' ? 'Continuar' : 'Siguiente'}
                    </Button>
                  ) : (
                    <Button
                      colorPalette="green"
                      onClick={handleProcessSale}
                      loading={isProcessing}
                      disabled={!canProcessSale}
                    >
                      <CheckSolid className="w-4 h-4" />
                      Procesar Venta
                    </Button>
                  )}
                </Stack>
              </Stack>
            </ModalFooter>
          </ModalContent>
        </Modal>
    </Stack>
  );
}