// src/components/common/UnderDevelopmentPage.tsx
import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  Button,  
} from '@chakra-ui/react';

interface UnderDevelopmentPageProps {
  onBack: () => void;
}

// Icono simple de construcción usando SVG
const ConstructionIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 21H5a1 1 0 0 1-1-1v-9H1l10.327-9.388a1 1 0 0 1 1.346 0L23 11h-3v9a1 1 0 0 1-1 1zM6 19h12V9.157L12 3.702 6 9.157V19z"/>
    <path d="M8 15h2v2H8v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"/>
  </svg>
);

export default function UnderDevelopmentPage({ onBack }: UnderDevelopmentPageProps) {
  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="60vh"
      p={8}
    >
      <VStack spacing={6} textAlign="center" maxWidth="400px">
        <Box color="orange.400">
          <ConstructionIcon />
        </Box>
        
        <VStack spacing={3}>
          <Heading size="lg" color="gray.700">
            🚧 En Desarrollo
          </Heading>
          
          <Text color="gray.600" fontSize="md" lineHeight="1.6">
            Este módulo está en construcción. Próximamente estará disponible 
            con todas las funcionalidades necesarias para tu negocio.
          </Text>
        </VStack>
        
        <VStack spacing={3}>
          <Button 
            colorScheme="blue" 
            size="md"
            onClick={onBack}
          >
            ← Volver al Dashboard
          </Button>
          
          <Text fontSize="sm" color="gray.500">
            ¿Tienes sugerencias? ¡Nos encantaría escucharlas!
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
}