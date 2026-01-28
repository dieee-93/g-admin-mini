import { Box, Heading, Text, VStack } from '@/shared/ui';

export function ShippingPlaceholder() {
  return (
    <Box p={8}>
      <VStack spacing={4} align="flex-start">
        <Heading size="lg">Envíos por Correo - En Desarrollo</Heading>
        <Text>
          Este módulo gestionará envíos por servicios externos:
        </Text>
        <VStack align="flex-start" pl={4}>
          <Text>• Integración con correos (Correo Argentino, OCA, Andreani)</Text>
          <Text>• Fletes y camiones para productos grandes</Text>
          <Text>• Tracking de envíos</Text>
          <Text>• Cálculo de costos de envío</Text>
          <Text>• Generación de etiquetas</Text>
        </VStack>
      </VStack>
    </Box>
  );
}
