import { Box, Heading, Text, VStack } from '@/shared/ui';

export function CampaignsPlaceholder() {
  return (
    <Box p={8}>
      <VStack spacing={4} align="flex-start">
        <Heading size="lg">Campañas - En Desarrollo</Heading>
        <Text>
          Este módulo gestionará promociones y campañas:
        </Text>
        <VStack align="flex-start" pl={4}>
          <Text>• Descuentos y cupones</Text>
          <Text>• Promociones 2x1, 3x2</Text>
          <Text>• Combos especiales</Text>
          <Text>• Reglas de aplicación (productos, clientes, fechas)</Text>
          <Text>• Tracking de uso y performance</Text>
        </VStack>
      </VStack>
    </Box>
  );
}
