// src/components/dashboard/ModuleCard.tsx
import { 
  Box, 
  Text, 
  VStack, 
  HStack, 
  Badge,
  Button 
} from '@chakra-ui/react';
import { type ModuleCardProps } from '@/types/ui';

export function ModuleCard({ 
  title, 
  description, 
  icon, 
  stats, 
  color = "blue", 
  disabled = false, 
  onNavigate 
}: ModuleCardProps) {
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={6}
      bg="white"
      shadow="sm"
      cursor={disabled ? "not-allowed" : "pointer"}
      opacity={disabled ? 0.6 : 1}
      transition="all 0.2s"
      _hover={!disabled ? {
        shadow: "md",
        transform: "translateY(-2px)",
        borderColor: `${color}.300`
      } : {}}
      onClick={!disabled ? onNavigate : undefined}
    >
      <VStack align="start" spacing={4}>
        {/* Header con icono y título */}
        <HStack spacing={3}>
          <Text fontSize="2xl" role="img" aria-label={title}>
            {icon}
          </Text>
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold" fontSize="lg" color="gray.800">
              {title}
            </Text>
            {disabled && (
              <Badge colorScheme="gray" size="sm">
                Próximamente
              </Badge>
            )}
          </VStack>
        </HStack>

        {/* Descripción */}
        <Text fontSize="sm" color="gray.600" lineHeight="1.5">
          {description}
        </Text>

        {/* Estadísticas si las hay */}
        {stats && (
          <Box 
            p={3} 
            bg={`${color}.50`} 
            borderRadius="md" 
            width="100%"
          >
            <Text fontSize="sm" color="gray.600">
              {stats.label}
            </Text>
            <Text 
              fontSize="xl" 
              fontWeight="bold" 
              color={`${color}.600`}
            >
              {stats.value}
            </Text>
          </Box>
        )}

        {/* Botón de acción */}
        <Button
          size="sm"
          colorScheme={color}
          variant={disabled ? "ghost" : "solid"}
          width="100%"
          isDisabled={disabled}
          onClick={!disabled ? (e) => {
            e.stopPropagation();
            onNavigate();
          } : undefined}
        >
          {disabled ? "Próximamente" : "Abrir módulo"}
        </Button>
      </VStack>
    </Box>
  );
}