// src/components/navigation/Sidebar.tsx
// Sidebar para desktop con hover expand
// ✅ CORREGIDO: Collapsible + modules + badges sin className problems

import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Button
} from '@chakra-ui/react';
import { useNavigation } from '@/contexts/NavigationContext';

export function Sidebar() {
  const { 
    modules, 
    currentModule, 
    navigate, 
    sidebarCollapsed, 
    setSidebarCollapsed 
  } = useNavigation();

  return (
    <Box
      as="nav"
      position="fixed"
      left="0"
      top="0"
      h="100vh"
      w={sidebarCollapsed ? "60px" : "240px"}
      bg="white"
      borderRight="1px solid"
      borderColor="gray.200"
      transition="width 0.2s ease"
      zIndex={1001}
      onMouseEnter={() => setSidebarCollapsed(false)}
      onMouseLeave={() => setSidebarCollapsed(true)}
    >
      <VStack gap="0" align="stretch" h="full">
        {/* ✅ Header */}
        <Box p="4" borderBottom="1px solid" borderColor="gray.200">
          <HStack gap="3">
            <Box 
              w="8" 
              h="8" 
              bg="blue.500" 
              borderRadius="md" 
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text color="white" fontWeight="bold" fontSize="sm">G</Text>
            </Box>
            {!sidebarCollapsed && (
              <Text fontSize="lg" fontWeight="bold">G-Admin</Text>
            )}
          </HStack>
        </Box>

        {/* ✅ Navigation items - CORREGIDO: Sin template literals problemáticos */}
        <VStack gap="1" p="2" flex="1">
          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = currentModule?.id === module.id;
            
            return (
              <Button
                key={module.id}
                variant="ghost"
                size="md"
                onClick={() => navigate(module.id)}
                colorPalette={isActive ? module.color : 'gray'}
                bg={isActive ? `${module.color}.50` : 'transparent'}
                w="full"
                justifyContent="flex-start"
                position="relative"
                h="48px"
              >
                <HStack gap="3" w="full">
                  <Icon 
                    style={{ 
                      width: '20px', 
                      height: '20px',
                      color: isActive ? undefined : '#4A5568'
                    }} 
                  />
                  {!sidebarCollapsed && (
                    <VStack align="start" gap="0" flex="1">
                      <Text 
                        fontSize="sm" 
                        fontWeight={isActive ? 'semibold' : 'normal'}
                        color={isActive ? `${module.color}.700` : 'gray.700'}
                      >
                        {module.title}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {module.description}
                      </Text>
                    </VStack>
                  )}
                </HStack>

                {/* ✅ Badge */}
                {module.badge && (
                  <Box
                    position="absolute"
                    top="2px"
                    right="2px"
                    bg="red.500"
                    color="white"
                    borderRadius="full"
                    fontSize="xs"
                    fontWeight="bold"
                    minW="20px"
                    h="20px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {module.badge}
                  </Box>
                )}
              </Button>
            );
          })}
        </VStack>
      </VStack>
    </Box>
  );
}
