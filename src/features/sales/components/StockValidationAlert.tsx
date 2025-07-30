// src/features/sales/components/StockValidationAlert.tsx
import { 
  Alert,
  VStack, 
  HStack,
  Text, 
  Button,
  Box,
  Badge
} from '@chakra-ui/react';
import { 
  ArrowPathIcon
} from '@heroicons/react/24/solid';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface InsufficientItem {
  product_id: string;
  product_name: string;
  required: number;
  available: number;
  missing: number;
}

interface StockValidationResult {
  is_valid: boolean;
  error_message?: string;
  insufficient_items?: InsufficientItem[];
}

interface StockValidationAlertProps {
  validationResult: StockValidationResult | null;
  isValidating: boolean;
  onSuggestMaxQuantity?: (productId: string, maxQuantity: number) => void;
  onRetryValidation?: () => void;
  showSuggestions?: boolean;
}

export function StockValidationAlert({
  validationResult,
  isValidating,
  onSuggestMaxQuantity,
  onRetryValidation,
  showSuggestions = true
}: StockValidationAlertProps) {
  
  // Estado de validación
  if (isValidating) {
    return (
      <Alert.Root status="info">
        <HStack gap="2">
          <ArrowPathIcon className="w-4 h-4 animate-spin" />
          <Alert.Title>Validando stock...</Alert.Title>
        </HStack>
      </Alert.Root>
    );
  }

  // Sin validación realizada aún
  if (!validationResult) {
    return null;
  }

  // Stock válido - Mensaje de éxito
  if (validationResult.is_valid) {
    return (
      <Alert.Root status="success">
        <Alert.Indicator />
        <VStack align="start" gap="1">
          <Alert.Title>Stock disponible</Alert.Title>
          <Alert.Description>
            Todos los productos tienen stock suficiente para la venta
          </Alert.Description>
        </VStack>
      </Alert.Root>
    );
  }

  // Stock insuficiente - Mensaje de error con detalles
  return (
    <Alert.Root status="error">
      <Alert.Indicator />
      <VStack align="start" gap="3" flex="1">
        <VStack align="start" gap="1">
          <Alert.Title>Stock insuficiente</Alert.Title>
          <Alert.Description>
            {validationResult.error_message || 'Algunos productos no tienen stock suficiente'}
          </Alert.Description>
        </VStack>

        {/* Lista detallada de productos con stock insuficiente */}
        {validationResult.insufficient_items && validationResult.insufficient_items.length > 0 && (
          <VStack align="start" gap="2" w="full">
            <Text fontSize="sm" fontWeight="medium" color="red.700">
              Productos afectados:
            </Text>
            <VStack align="start" gap="2" w="full">
              {validationResult.insufficient_items.map((item, idx) => (
                <Box 
                  key={idx} 
                  p="3" 
                  bg="red.50" 
                  borderRadius="md" 
                  borderLeft="3px solid" 
                  borderColor="red.400"
                  w="full"
                >
                  <VStack align="start" gap="1">
                    <HStack justify="space-between" w="full">
                      <Text fontWeight="medium" color="red.800">
                        {item.product_name}
                      </Text>
                      <Badge colorPalette="red" size="sm">
                        Faltan {item.missing}
                      </Badge>
                    </HStack>
                    
                    <HStack gap="4" fontSize="sm" color="red.700">
                      <Text>Necesitas: <strong>{item.required}</strong></Text>
                      <Text>Disponible: <strong>{item.available}</strong></Text>
                    </HStack>

                    {/* Sugerencia de cantidad máxima */}
                    {showSuggestions && onSuggestMaxQuantity && item.available > 0 && (
                      <HStack mt="2">
                        <Button
                          size="sm"
                          variant="outline"
                          colorPalette="red"
                          onClick={() => onSuggestMaxQuantity(item.product_id, item.available)}
                        >
                          <CheckCircleIcon className="w-3 h-3" />
                          Usar máximo disponible ({item.available})
                        </Button>
                      </HStack>
                    )}
                  </VStack>
                </Box>
              ))}
            </VStack>
          </VStack>
        )}

        {/* Acciones de recuperación */}
        <HStack mt="2" gap="2">
          {onRetryValidation && (
            <Button
              size="sm"
              variant="outline"
              colorPalette="red"
              onClick={onRetryValidation}
            >
              <ArrowPathIcon className="w-3 h-3" />
              Revalidar stock
            </Button>
          )}
        </HStack>
      </VStack>
    </Alert.Root>
  );
}

// Hook para determinar el estado visual del stock
export function useStockStatus(availableQuantity: number, requestedQuantity: number) {
  if (requestedQuantity === 0) {
    return { status: 'neutral', color: 'gray', icon: CheckCircleIcon };
  }
  
  if (availableQuantity >= requestedQuantity) {
    return { status: 'success', color: 'green', icon: CheckCircleIcon };
  }
  
  if (availableQuantity > 0) {
    return { status: 'warning', color: 'yellow', icon: ExclamationTriangleIcon };
  }
  
  return { status: 'error', color: 'red', icon: XCircleIcon };
}