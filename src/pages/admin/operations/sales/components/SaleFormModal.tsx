/**
 * SaleFormModal - Complete Point of Sale Modal
 * ARCHITECTURE: Material Form Pattern (Cart/POS variation)
 * - Business logic in useSaleForm hook
 * - UI component is presentational
 * - Integrates stock validation
 * - Real-time totals calculation
 * - Payment flow management
 *
 * Features:
 * - Product selection with stock validation
 * - Visual cart with item management
 * - Real-time totals calculation
 * - Multiple payment methods
 * - Progress indicator during checkout
 */

import {
  Dialog,
  Button,
  Stack,
  Typography,
  Icon,
  Separator,
  Badge,
  Alert,
  Box,
  Flex,
  Text,
  Progress
} from '@/shared/ui';
import {
  XMarkIcon,
  TrashIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

import { ProductWithStock } from './ProductWithStock';
import { PaymentConfirmationModal } from './PaymentConfirmationModal';
import { useSaleForm } from '../hooks/useSaleForm';

interface SaleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SaleFormModal({ isOpen, onClose }: SaleFormModalProps) {
  // ========================================================================
  // USE SALE FORM HOOK (All business logic)
  // ========================================================================

  const {
    cart,
    handleAddToCart,
    handleRemoveItem,
    handleUpdateQuantity,
    handleClearCart,
    totals,
    validationState,
    isProcessing,
    showPaymentConfirmation,
    setShowPaymentConfirmation,
    handleOpenPaymentConfirmation,
    handleConfirmPayment,
    submitButtonContent,
    operationProgress,
    cartStatusBadge,
    onClose: closeModal
  } = useSaleForm({
    isOpen,
    onClose
  });


  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => !details.open && !isProcessing && closeModal()}
      size="xl"
      closeOnEscape={!isProcessing}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content
          maxW="1200px"
          maxH={{ base: "100vh", md: "90vh" }}
          w="full"
          overflowY="auto"
        >
          <Dialog.CloseTrigger />

          {/* ✅ HEADER */}
          <Dialog.Header>
            <Stack direction="row" justify="space-between" align="center" width="full">
              <Stack direction="row" gap="md" align="center">
                <Icon icon={ShoppingCartIcon} size="lg" />
                <Typography variant="heading" size="lg">
                  Nueva Venta
                </Typography>
                {cartStatusBadge}
              </Stack>
            </Stack>
          </Dialog.Header>

          {/* ✅ BODY */}
          <Dialog.Body p={{ base: "4", md: "6" }}>
            <Stack direction="column" gap="4">
              {/* Validation Summary */}
              {validationState.hasErrors && (
                <Alert.Root status="error" variant="subtle">
                  <Alert.Indicator>
                    <ExclamationTriangleIcon style={{ width: '20px', height: '20px' }} />
                  </Alert.Indicator>
                  <Alert.Title>Errores de stock</Alert.Title>
                  <Alert.Description>
                    Hay {validationState.errorCount} producto(s) con stock insuficiente
                  </Alert.Description>
                </Alert.Root>
              )}

              {validationState.hasWarnings && !validationState.hasErrors && (
                <Alert.Root status="warning" variant="subtle">
                  <Alert.Indicator>
                    <ExclamationTriangleIcon style={{ width: '20px', height: '20px' }} />
                  </Alert.Indicator>
                  <Alert.Title>Advertencias</Alert.Title>
                  <Alert.Description>
                    {validationState.warningCount} advertencia(s) detectadas
                  </Alert.Description>
                </Alert.Root>
              )}
            <Stack direction="row" gap="lg" align="start">
              {/* COLUMNA IZQUIERDA: PRODUCTOS */}
              <Stack direction="column" gap="md" flex="2" maxH="600px" overflowY="auto">
                <Typography variant="heading" size="md">
                  Productos Disponibles
                </Typography>
                <ProductWithStock
                  onAddToCart={handleAddToCart}
                  currentCart={cart}
                />
              </Stack>

              {/* COLUMNA DERECHA: CARRITO */}
              <Stack
                direction="column"
                gap="md"
                flex="1"
                borderWidth="1px"
                borderRadius="md"
                p="md"
                bg="gray.50"
                _dark={{ bg: 'gray.900' }}
                maxH="600px"
              >
                {/* Header del carrito */}
                <Stack direction="row" justify="space-between" align="center">
                  <Typography variant="heading" size="md">
                    Carrito
                  </Typography>
                  {cart.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      colorPalette="red"
                      onClick={handleClearCart}
                    >
                      <Icon icon={TrashIcon} size="sm" />
                      Vaciar
                    </Button>
                  )}
                </Stack>

                <Separator />

                {/* Items del carrito */}
                {cart.length === 0 ? (
                  <Stack direction="column" align="center" justify="center" py="xl">
                    <Icon icon={ShoppingCartIcon} size="xl" color="gray.400" />
                    <Typography variant="body" size="sm" color="text.muted" textAlign="center">
                      El carrito está vacío
                      <br />
                      Agrega productos desde la lista
                    </Typography>
                  </Stack>
                ) : (
                  <Stack direction="column" gap="sm" flex="1" overflowY="auto">
                    {cart.map((item) => (
                      <Stack
                        key={item.product_id}
                        direction="column"
                        gap="xs"
                        p="sm"
                        borderWidth="1px"
                        borderRadius="sm"
                        bg="white"
                        _dark={{ bg: 'gray.800' }}
                      >
                        <Stack direction="row" justify="space-between" align="start">
                          <Typography variant="body" size="sm" weight="bold" flex="1">
                            {item.product_name}
                          </Typography>
                          <Button
                            variant="ghost"
                            size="xs"
                            colorPalette="red"
                            onClick={() => handleRemoveItem(item.product_id)}
                          >
                            <Icon icon={XMarkIcon} size="xs" />
                          </Button>
                        </Stack>

                        <Stack direction="row" justify="space-between" align="center">
                          <Stack direction="row" gap="xs" align="center">
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <Typography variant="body" size="sm" minW="30px" textAlign="center">
                              {item.quantity}
                            </Typography>
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </Stack>

                          <Typography variant="body" size="sm">
                            ${(item.quantity * item.unit_price).toFixed(2)}
                          </Typography>
                        </Stack>

                        <Typography variant="body" size="xs" color="text.muted">
                          ${item.unit_price.toFixed(2)} c/u
                          {item.available_stock && (
                            <> • Stock: {item.available_stock}</>
                          )}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                )}

                {/* Totales */}
                {cart.length > 0 && (
                  <>
                    <Separator />

                    <Stack direction="column" gap="xs">
                      <Stack direction="row" justify="space-between">
                        <Typography variant="body" size="sm">Subtotal</Typography>
                        <Typography variant="body" size="sm">${totals.subtotal.toFixed(2)}</Typography>
                      </Stack>

                      <Stack direction="row" justify="space-between">
                        <Typography variant="body" size="sm">IVA (21%)</Typography>
                        <Typography variant="body" size="sm">${totals.taxAmount.toFixed(2)}</Typography>
                      </Stack>

                      <Separator />

                      <Stack direction="row" justify="space-between">
                        <Typography variant="heading" size="md" weight="bold">Total</Typography>
                        <Typography variant="heading" size="md" weight="bold" colorPalette="blue">
                          ${totals.total.toFixed(2)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </>
                )}
              </Stack>
            </Stack>

            {/* Operation Progress */}
            {operationProgress && (
              <Box w="full" mt="4">
                <Stack gap="2">
                  <Flex justify="space-between" align="center">
                    <Text fontSize="sm" color="text.muted">
                      {operationProgress.currentStep}
                    </Text>
                    <Text fontSize="sm" color="text.muted">
                      {operationProgress.progress}%
                    </Text>
                  </Flex>
                  <Progress.Root value={operationProgress.progress} size="sm" colorPalette="blue">
                    <Progress.Track>
                      <Progress.Range />
                    </Progress.Track>
                  </Progress.Root>
                </Stack>
              </Box>
            )}
            </Stack>
          </Dialog.Body>

          {/* ✅ FOOTER */}
          <Dialog.Footer>
            <Flex
              gap="3"
              pt="4"
              justify="space-between"
              width="full"
              borderTop="1px solid"
              borderColor="border"
            >
              <Button
                variant="outline"
                onClick={closeModal}
                disabled={isProcessing}
                height="44px"
                fontSize="md"
                px="6"
              >
                Cancelar
              </Button>

              <Flex gap="3">
                {cart.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleClearCart}
                    disabled={isProcessing}
                    colorPalette="red"
                    height="44px"
                    fontSize="md"
                    px="4"
                  >
                    <Icon icon={TrashIcon} />
                    Vaciar
                  </Button>
                )}

                <Button
                  variant="solid"
                  colorPalette={isProcessing ? "gray" : "blue"}
                  onClick={handleOpenPaymentConfirmation}
                  disabled={cart.length === 0 || isProcessing || validationState.hasErrors}
                  height="44px"
                  fontSize="md"
                  px="6"
                >
                  {submitButtonContent}
                </Button>
              </Flex>
            </Flex>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>

      {/* ✅ MODAL DE CONFIRMACIÓN DE PAGO */}
      {showPaymentConfirmation && (
        <PaymentConfirmationModal
          isOpen={showPaymentConfirmation}
          onClose={() => setShowPaymentConfirmation(false)}
          total={totals.total}
          onConfirm={handleConfirmPayment}
        />
      )}
    </Dialog.Root>
  );
}
