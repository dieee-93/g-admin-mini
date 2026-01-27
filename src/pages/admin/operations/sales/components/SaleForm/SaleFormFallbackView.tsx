import {
  Stack,
  Alert,
  Typography,
  Button,
  Box,
  Flex,
  Text,
  Progress,
  Icon,
  Separator,
} from '@/shared/ui';
import {
  ExclamationTriangleIcon,
  TrashIcon,
  ShoppingCartIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { HookPoint } from '@/lib/modules';
import { ProductWithStock } from '../ProductWithStock';

interface SaleFormFallbackViewProps {
  validationState: {
    hasErrors: boolean;
    errorCount: number;
    hasWarnings: boolean;
    warningCount: number;
  };
  cart: any[]; // Ideally typed
  totals: {
    subtotal: number;
    taxAmount: number;
    total: number;
  };
  selectedProduct: any;
  operationProgress?: {
    currentStep: string;
    progress: number;
  } | null;
  onAddToCart: (product: any) => void;
  onRemoveItem: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClearCart: () => void;
  onFlowComplete: (data: any) => void;
}

export function SaleFormFallbackView({
  validationState,
  cart,
  totals,
  selectedProduct,
  operationProgress,
  onAddToCart,
  onRemoveItem,
  onUpdateQuantity,
  onClearCart,
  onFlowComplete
}: SaleFormFallbackViewProps) {
  return (
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
        {/* COLUMNA IZQUIERDA: PRODUCTOS + FLOW */}
        <Stack direction="column" gap="md" flex="2" maxH="600px" overflowY="auto">
          <Typography variant="heading" size="md">
            Productos Disponibles
          </Typography>
          <ProductWithStock
            onAddToCart={onAddToCart}
            currentCart={cart}
          />

          {/* 🎯 HOOK POINT: Product-specific flow (SERVICE, RENTAL, etc.) */}
          {/* Active modules inject their flow components automatically */}
          {selectedProduct && (
            <Stack direction="column" gap="md" mt="md" p="md" borderWidth="1px" borderRadius="md" bg="bg.subtle">
              <Typography variant="heading" size="sm">
                Configurar: {selectedProduct.name}
              </Typography>
              <HookPoint
                name="sales.pos.product_flow"
                data={{
                  selectedProduct,
                  productType: selectedProduct.product_type,
                  onFlowComplete: onFlowComplete,
                  cart
                }}
                direction="column"
                gap="md"
                fallback={
                  <Stack direction="column" gap="sm" align="center" p="md">
                    <Text fontSize="sm" color="text.muted" textAlign="center">
                      No hay configuración adicional necesaria
                    </Text>
                    <Button
                      size="sm"
                      onClick={() => onFlowComplete({})}
                      colorPalette="blue"
                    >
                      Agregar al Carrito
                    </Button>
                  </Stack>
                }
              />
            </Stack>
          )}
        </Stack>

        {/* COLUMNA DERECHA: CARRITO */}
        <Stack
          direction="column"
          gap="4"
          flex="1"
          borderWidth="1px"
          borderRadius="xl"
          borderColor="border.default"
          p="6"
          bg="bg.muted"
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
                onClick={onClearCart}
              >
                <Icon icon={TrashIcon} size="sm" />
                Vaciar
              </Button>
            )}
          </Stack>

          <Separator />

          {/* Items del carrito */}
          {cart.length === 0 ? (
            <Stack direction="column" align="center" justify="center" py="12" gap="3">
              <Icon icon={ShoppingCartIcon} size="2xl" color="text.muted" />
              <Typography variant="body" size="sm" color="text.muted" textAlign="center">
                El carrito está vacío
                <br />
                Agrega productos desde la lista
              </Typography>
            </Stack>
          ) : (
            <Stack direction="column" gap="2" flex="1" overflowY="auto">
              {cart.map((item) => (
                <Stack
                  key={item.product_id}
                  direction="column"
                  gap="2"
                  p="4"
                  borderWidth="1px"
                  borderRadius="lg"
                  borderColor="border.default"
                  bg="bg.surface"
                >
                  <Stack direction="row" justify="space-between" align="start">
                    <Typography variant="body" size="sm" weight="bold" flex="1">
                      {item.product_name}
                    </Typography>
                    <Button
                      variant="ghost"
                      size="xs"
                      colorPalette="red"
                      onClick={() => onRemoveItem(item.product_id)}
                    >
                      <Icon icon={XMarkIcon} size="xs" />
                    </Button>
                  </Stack>

                  <Stack direction="row" justify="space-between" align="center">
                    <Stack direction="row" gap="2" align="center">
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <Typography variant="body" size="sm" minW="30px" textAlign="center">
                        {item.quantity}
                      </Typography>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
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

              <Stack direction="column" gap="2">
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
                  <Typography variant="heading" size="md" fontWeight="bold">Total</Typography>
                  <Typography variant="heading" size="md" fontWeight="bold" colorPalette="blue">
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
  );
}
