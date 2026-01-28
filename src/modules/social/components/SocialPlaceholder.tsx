import { Box, Heading, Text, VStack } from '@/shared/ui';

export function SocialPlaceholder() {
  return (
    <Box p={8}>
      <VStack spacing={4} align="flex-start">
        <Heading size="lg">Redes Sociales - En Desarrollo</Heading>
        <Text>
          Este módulo gestionará integraciones sociales:
        </Text>
        <VStack align="flex-start" pl={4}>
          <Text>• Facebook/Instagram: Posts, stories, catalog sync</Text>
          <Text>• WhatsApp Business: Mensajería, catálogo</Text>
          <Text>• Google My Business: Reviews, información</Text>
          <Text>• Publicación programada</Text>
          <Text>• Analytics de redes sociales</Text>
        </VStack>
      </VStack>
    </Box>
  );
}
