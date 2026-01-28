import { Box, Heading, Text, VStack } from '@/shared/ui';

export function StorefrontPlaceholder() {
  return (
    <Box p={8}>
      <VStack spacing={4} align="flex-start">
        <Heading size="lg">Tienda - En Desarrollo</Heading>
        <Text>
          Este módulo está en desarrollo. Permitirá configurar:
        </Text>
        <VStack align="flex-start" pl={4}>
          <Text>• Diseño y branding de tienda</Text>
          <Text>• Menú digital y catálogo visible al cliente</Text>
          <Text>• Configuración de tienda online (si ecommerce activo)</Text>
          <Text>• Menú QR para mesas (si onsite activo)</Text>
        </VStack>
      </VStack>
    </Box>
  );
}
