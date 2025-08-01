// src/components/navigation/BottomNavigation.tsx
// Navegación inferior para mobile (thumb zone)
// ✅ CORREGIDO: 5 módulos principales + badges según arquitectura v2.0

import { Box, HStack, VStack, Text, Button } from '@chakra-ui/react';
import { useNavigation } from '@/contexts/NavigationContext';

export function BottomNavigation() {
  const { modules, currentModule, navigate } = useNavigation();

  return (
    <Box
      as="nav"
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      bg="white"
      borderTop="1px solid"
      borderColor="gray.200"
      px="2"
      py="2"
      h="70px"
      zIndex={1000}
      shadow="lg"
    >
      <HStack justify="space-around" align="center" h="full">
        {modules.map((module) => {
          const Icon = module.icon;
          const isActive = currentModule?.id === module.id;
          
          return (
            <Button
              key={module.id}
              variant="ghost"
              size="sm"
              onClick={() => navigate(module.id)}
              colorPalette={isActive ? module.color : 'gray'}
              bg={isActive ? `${module.color}.50` : 'transparent'}
              minW="60px"
              h="54px"
              position="relative"
            >
              <VStack gap="1">
                {/* ✅ CORREGIDO: Iconos sin className template literals */}
                <Icon 
                  style={{ 
                    width: '20px', 
                    height: '20px',
                    color: isActive ? undefined : '#6B7280' 
                  }} 
                />
                <Text 
                  fontSize="xs" 
                  color={isActive ? `${module.color}.600` : 'gray.500'}
                  fontWeight={isActive ? 'semibold' : 'normal'}
                >
                  {module.title}
                </Text>
              </VStack>

              {/* ✅ Badge para alertas/notificaciones */}
              {module.badge && (
                <Box
                  position="absolute"
                  top="4px"
                  right="4px"
                  bg="red.500"
                  color="white"
                  borderRadius="full"
                  fontSize="xs"
                  fontWeight="bold"
                  minW="18px"
                  h="18px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  border="2px solid white"
                >
                  {module.badge}
                </Box>
              )}
            </Button>
          );
        })}
      </HStack>
    </Box>
  );
}