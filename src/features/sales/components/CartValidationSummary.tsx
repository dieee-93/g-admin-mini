// src/features/sales/components/CartValidationSummary.tsx
import { 
  Box,
  VStack, 
  HStack,
  Text, 
  Button,
  Card,
  Badge,
  Progress,
  Separator
} from '@chakra-ui/react';
import { 
  ExclamationTriangleIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckSolid,
  XCircleIcon as ErrorSolid
} from '@heroicons/react/24/solid';

interface SaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  max_available: number;
}

interface StockValidationResult {
  is_valid: boolean;
  error_message?: string;
  insufficient_items?: Array<{
    product_id: string;
    product_name: string;
    required: number;
    available: number;
    missing: number;
  }>;
}

interface CartSummary {
  itemCount: number;
  totalAmount: number;
  hasItems: boolean;
  isValid: boolean;
  validationMessage?: string;
}

interface CartValidationSummaryProps {
  cart: SaleItem[];
  summary: CartSummary;
  validationResult: StockValidationResult | null;
  isValidating: boolean;
  onProceedToCheckout?: () => void;
  onValidateCart?: () => void;
  disabled?: boolean;
}

export function CartValidationSummary({
  cart,
  summary,
  validationResult,
  isValidating,
  onProceedToCheckout,
  onValidateCart,
  disabled = false
}: CartValidationSummaryProps) {

  // Determinar el estado general del carrito
  const getCartStatus = () => {
    if (!summary.hasItems) {
      return { status: 'empty', color: 'gray', icon: ShoppingCartIcon, message: 'Carrito vacío' };
    }
    
    if (isValidating) {
      return { status: 'validating', color: 'blue', icon: ClockIcon, message: 'Validando stock...' };
    }
    
    if (!validationResult) {
      return { status: 'pending', color: 'yellow', icon: ExclamationTriangleIcon, message: 'Pendiente de validación' };
    }
    
    if (validationResult.is_valid) {
      return { status: 'valid', color: 'green', icon: CheckSolid, message: 'Listo para venta' };
    }
    
    return { status: 'invalid', color: 'red', icon: ErrorSolid, message: 'Stock insuficiente' };
  };

  const cartStatus = getCartStatus();

  // Calcular progreso de validación
  const getValidationProgress = () => {
    if (!summary.hasItems) return 0;
    if (isValidating) return 50;
    if (!validationResult) return 25;
    return validationResult.is_valid ? 100 : 75;
  };

  const validationProgress = getValidationProgress();

  return (
    <Card.Root variant="elevated" p="4">
      <VStack gap="4" align="stretch">
        {/* Header del resumen */}
        <HStack justify="space-between" align="center">
          <HStack gap="2">
            <cartStatus.icon className="w-5 h-5" />
            <Text fontWeight="bold" fontSize="lg">
              Resumen del Carrito
            </Text>
          </HStack>
          <Badge 
            colorPalette={cartStatus.color}
            size="md"
            variant={cartStatus.status === 'valid' ? 'solid' : 'outline'}
          >
            {cartStatus.message}
          </Badge>
        </HStack>

        {/* Progreso de validación */}
        <Box>
          <HStack justify="space-between" mb="1">
            <Text fontSize="sm" color="gray.600">Estado de validación</Text>
            <Text fontSize="sm" fontWeight="medium">{validationProgress}%</Text>
          </HStack>
          <Progress.Root 
            value={validationProgress} 
            colorPalette={cartStatus.color}
            size="sm"
          >
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        </Box>

        {summary.hasItems && (
          <>
            <Separator />
            
            {/* Estadísticas del carrito */}
            <VStack gap="2" align="stretch">
              <HStack justify="space-between">
                <HStack gap="2">
                  <ShoppingCartIcon className="w-4 h-4" />
                  <Text>Productos en carrito</Text>
                </HStack>
                <Badge colorPalette="blue" variant="outline">
                  {summary.itemCount}
                </Badge>
              </HStack>

              <HStack justify="space-between">
                <HStack gap="2">
                  <CurrencyDollarIcon className="w-4 h-4" />
                  <Text>Total de la venta</Text>
                </HStack>
                <Text fontWeight="bold" fontSize="lg" color="green.600">
                  ${summary.totalAmount.toFixed(2)}
                </Text>
              </HStack>
            </VStack>

            {/* Lista resumida de productos */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb="2" color="gray.700">
                Productos seleccionados:
              </Text>
              <VStack gap="1" align="stretch">
                {cart.map((item, idx) => {
                  const isStockSufficient = item.quantity <= item.max_available;
                  const statusIcon = isStockSufficient ? CheckSolid : ErrorSolid;
                  const statusColor = isStockSufficient ? 'green' : 'red';
                  
                  return (
                    <HStack key={idx} justify="space-between" p="2" bg="gray.50" borderRadius="md">
                      <HStack gap="2" flex="1">
                        <statusIcon className={`w-3 h-3 text-${statusColor}-500`} />
                        <Text fontSize="sm" noOfLines={1}>
                          {item.product_name}
                        </Text>
                      </HStack>
                      <HStack gap="2" fontSize="sm">
                        <Badge 
                          colorPalette={statusColor}
                          size="sm"
                          variant={isStockSufficient ? 'subtle' : 'solid'}
                        >
                          {item.quantity}
                        </Badge>
                        <Text color="gray.600">
                          ${(item.quantity * item.unit_price).toFixed(2)}
                        </Text>
                      </HStack>
                    </HStack>
                  );
                })}
              </VStack>
            </Box>

            <Separator />

            {/* Acciones principales */}
            <VStack gap="2" align="stretch">
              {/* Botón de validación manual */}
              {onValidateCart && (
                <Button
                  variant="outline"
                  colorPalette="blue"
                  onClick={onValidateCart}
                  loading={isValidating}
                  loadingText="Validando..."
                  disabled={disabled || !summary.hasItems}
                >
                  <ClockIcon className="w-4 h-4" />
                  Revalidar Stock
                </Button>
              )}

              {/* Botón principal de checkout */}
              {onProceedToCheckout && (
                <Button
                  colorPalette="green"
                  size="lg"
                  onClick={onProceedToCheckout}
                  disabled={
                    disabled || 
                    !summary.hasItems || 
                    isValidating || 
                    (validationResult && !validationResult.is_valid)
                  }
                  loading={isValidating}
                  loadingText="Validando..."
                >
                  {cartStatus.status === 'valid' ? (
                    <>
                      <CheckSolid className="w-4 h-4" />
                      Proceder al Checkout
                    </>
                  ) : (
                    <>
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      Validar y Continuar
                    </>
                  )}
                </Button>
              )}
            </VStack>
          </>
        )}

        {/* Mensaje cuando carrito está vacío */}
        {!summary.hasItems && (
          <Box textAlign="center" py="6">
            <ShoppingCartIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <Text color="gray.500" fontSize="sm">
              Agrega productos al carrito para continuar
            </Text>
          </Box>
        )}
      </VStack>
    </Card.Root>
  );
}

// Componente para mostrar alertas rápidas en el carrito
export function CartQuickAlert({ 
  validationResult, 
  isValidating 
}: { 
  validationResult: StockValidationResult | null;
  isValidating: boolean;
}) {
  if (isValidating) {
    return (
      <HStack gap="2" p="2" bg="blue.50" borderRadius="md">
        <ClockIcon className="w-4 h-4 animate-spin text-blue-500" />
        <Text fontSize="sm" color="blue.700">
          Verificando disponibilidad...
        </Text>
      </HStack>
    );
  }

  if (validationResult && !validationResult.is_valid) {
    return (
      <HStack gap="2" p="2" bg="red.50" borderRadius="md">
        <ErrorSolid className="w-4 h-4 text-red-500" />
        <Text fontSize="sm" color="red.700">
          Algunos productos exceden el stock disponible
        </Text>
      </HStack>
    );
  }

  if (validationResult && validationResult.is_valid) {
    return (
      <HStack gap="2" p="2" bg="green.50" borderRadius="md">
        <CheckSolid className="w-4 h-4 text-green-500" />
        <Text fontSize="sm" color="green.700">
          Stock disponible para todos los productos
        </Text>
      </HStack>
    );
  }

  return null;
}