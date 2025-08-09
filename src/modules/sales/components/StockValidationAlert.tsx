// components/StockValidationAlert.tsx
import { 
  Alert,
  Box,
  VStack,
  HStack,
  Text,
  Badge
} from '@chakra-ui/react';
import { type StockValidationResult } from '../hooks/useSaleStockValidation';

interface StockValidationAlertProps {
  validationResult: StockValidationResult;
  isLoading?: boolean;
}

export function StockValidationAlert({ validationResult, isLoading }: StockValidationAlertProps) {
  if (isLoading) {
    return (
      <Alert.Root status="info">
        <Alert.Indicator />
        <Alert.Title>Verificando stock...</Alert.Title>
      </Alert.Root>
    );
  }

  if (validationResult.is_valid) {
    return (
      <Alert.Root status="success">
        <Alert.Indicator />
        <Alert.Title>Stock disponible</Alert.Title>
        <Alert.Description>
          Todos los productos tienen stock suficiente para esta venta.
        </Alert.Description>
      </Alert.Root>
    );
  }

  return (
    <Box>
      <Alert.Root status="error">
        <Alert.Indicator />
        <Alert.Title>Stock insuficiente</Alert.Title>
        {validationResult.error_message && (
          <Alert.Description>
            {validationResult.error_message}
          </Alert.Description>
        )}
      </Alert.Root>

      {validationResult.insufficient_items && validationResult.insufficient_items.length > 0 && (
        <Box mt={3} p={3} bg="red.50" borderRadius="md" border="1px solid" borderColor="red.200">
          <Text fontSize="sm" fontWeight="medium" mb={2} color="red.800">
            Productos con stock insuficiente:
          </Text>
          <VStack gap="2" align="start">
            {validationResult.insufficient_items.map((item) => (
              <HStack 
                key={item.product_id} 
                justify="space-between" 
                width="full"
                p={2}
                bg="white"
                borderRadius="sm"
                border="1px solid"
                borderColor="red.300"
                gap="2"
              >
                <VStack align="start" gap="0">
                  <Text fontSize="sm" fontWeight="medium" color="red.900">
                    {item.product_name}
                  </Text>
                  <Text fontSize="xs" color="red.600">
                    Necesitas {item.required}, disponible: {item.available}
                  </Text>
                </VStack>
                <Badge colorPalette="red" size="sm">
                  Faltan {item.missing}
                </Badge>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  );
}