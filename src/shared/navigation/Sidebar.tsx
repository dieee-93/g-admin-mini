// ====================================
// src/shared/navigation/Sidebar.tsx - DISEÑO VISUAL OPTIMIZADO
// ====================================

import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Button,
  Collapsible,
  Separator
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNavigation } from '@/contexts/NavigationContext';
import { Icon } from '@/shared/ui/Icon';
import { QuickThemeToggle } from '@/shared/components/ThemeToggle';

export function Sidebar() {
  const location = useLocation();
  const reactNavigate = useNavigate();
  const { 
    modules, 
    currentModule, 
    navigate, 
    sidebarCollapsed, 
    setSidebarCollapsed,
    toggleModuleExpansion,
    isMobile 
  } = useNavigation();

  return (
    <Box
      as="nav"
      position="fixed"
      left="0"
      top="0"
      h="100vh"
      w={sidebarCollapsed ? "60px" : "280px"}
      bg={{ base: "white", _dark: "gray.900" }}
      borderRight="1px solid"
      borderColor={{ base: "gray.200", _dark: "gray.700" }}
      boxShadow="lg"
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      zIndex={1001}
      display={{ base: "none", md: "block" }}
      style={{
        backdropFilter: 'blur(8px)'
      }}
      onMouseEnter={() => !isMobile && setSidebarCollapsed(false)}
      onMouseLeave={() => !isMobile && setSidebarCollapsed(true)}
    >
      <VStack gap="0" align="stretch" h="full">
        {/* ✅ Header Optimizado - Misma altura que header principal (60px) */}
        <Box 
          h="60px" 
          px="4" 
          borderBottom="1px solid" 
          borderColor={{ base: "gray.200", _dark: "gray.700" }}
          display="flex"
          alignItems="center"
        >
          <HStack gap="3" align="center" w="full">
            <Box 
              w="9" 
              h="9" 
              bg="linear-gradient(135deg, #3182CE 0%, #2C5282 100%)" 
              borderRadius="lg" 
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="sm"
              flexShrink={0}
            >
              <Text color="white" fontWeight="bold" fontSize="md" lineHeight="1">G</Text>
            </Box>
            {!sidebarCollapsed && (
              <VStack align="start" gap="0" spacing="0">
                <Text fontSize="lg" fontWeight="bold" color={{ base: "gray.800", _dark: "gray.100" }} lineHeight="1.2">
                  G-Admin
                </Text>
                <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }} lineHeight="1.2">
                  Mini Dashboard
                </Text>
              </VStack>
            )}
          </HStack>
        </Box>

        {/* ✅ Navigation items - OPTIMIZED EXPANDABLE NAVIGATION */}
        <VStack gap="1" p="3" flex="1" align="stretch">
          {modules.map((module) => {
            const isActive = currentModule?.id === module.id;
            
            return (
              <Box key={module.id} w="full">
                {/* Main Module Button */}
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    if (module.isExpandable && !sidebarCollapsed) {
                      toggleModuleExpansion(module.id);
                    } else {
                      navigate(module.id);
                    }
                  }}
                  colorPalette={isActive ? module.color : 'gray'}
                  bg={isActive ? `${module.color}.50` : 'transparent'}
                  _hover={{
                    bg: isActive ? `${module.color}.100` : { base: 'gray.100', _dark: 'gray.700' },
                    transform: 'translateX(2px)',
                    transition: 'all 0.2s ease'
                  }}
                  _focus={{
                    outline: '2px solid',
                    outlineColor: `${module.color}.500`,
                    outlineOffset: '2px'
                  }}
                  w="full"
                  justifyContent="flex-start"
                  position="relative"
                  h="52px"
                  borderRadius="lg"
                  mb="1"
                  aria-expanded={module.isExpandable ? module.isExpanded : undefined}
                  aria-label={`${module.title} - ${module.description}`}
                >
                  <HStack gap="3" w="full" align="center">
                    <Box 
                      flexShrink={0}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      w="6"
                      h="6"
                    >
                      <Icon 
                        icon={module.icon}
                        size="md"
                        color={isActive ? `${module.color}.600` : 'gray.500'}
                      />
                    </Box>
                    
                    {!sidebarCollapsed && (
                      <VStack align="start" gap="0" flex="1" spacing="0">
                        <Text 
                          fontSize="sm" 
                          fontWeight={isActive ? 'semibold' : 'medium'}
                          color={isActive ? `${module.color}.700` : { base: 'gray.700', _dark: 'gray.200' }}
                          lineHeight="1.2"
                        >
                          {module.title}
                        </Text>
                        <Text 
                          fontSize="xs" 
                          color={isActive ? `${module.color}.500` : { base: 'gray.500', _dark: 'gray.400' }}
                          lineHeight="1.2"
                          noOfLines={1}
                        >
                          {module.description}
                        </Text>
                      </VStack>
                    )}

                    {/* Expansion arrow for expandable modules */}
                    {module.isExpandable && !sidebarCollapsed && (
                      <Box
                        flexShrink={0}
                        transform={module.isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}
                        transition="transform 0.25s ease"
                        color={isActive ? `${module.color}.600` : 'gray.400'}
                      >
                        <ChevronDownIcon style={{ width: '16px', height: '16px' }} />
                      </Box>
                    )}
                  </HStack>

                  {/* Badge */}
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

                {/* Sub-modules with smooth collapse animation */}
                <Collapsible.Root open={module.isExpandable && module.isExpanded && !sidebarCollapsed}>
                  <Collapsible.Content>
                    {module.subModules && (
                    <Box mt="2" mb="1">
                      <Separator borderColor={`${module.color}.200`} mb="2" />
                      <VStack gap="1" pl="6" pr="2" align="stretch">
                        {module.subModules.map((subModule) => {
                          const isSubModuleActive = location.pathname === subModule.path;
                          
                          return (
                            <Button
                              key={subModule.id}
                              variant="ghost"
                              size="sm"
                              onClick={() => reactNavigate(subModule.path)}
                              w="full"
                              justifyContent="flex-start"
                              h="40px"
                              bg={isSubModuleActive ? `${module.color}.50` : 'transparent'}
                              borderLeft={isSubModuleActive ? '3px solid' : '3px solid transparent'}
                              borderLeftColor={isSubModuleActive ? `${module.color}.500` : 'transparent'}
                              borderRadius="md"
                              pl="3"
                              _hover={{
                                bg: isSubModuleActive ? `${module.color}.100` : { base: 'gray.50', _dark: 'gray.800' },
                                borderLeftColor: `${module.color}.300`,
                                transform: 'translateX(2px)',
                                transition: 'all 0.2s ease'
                              }}
                              _focus={{
                                outline: '2px solid',
                                outlineColor: `${module.color}.400`,
                                outlineOffset: '1px'
                              }}
                              aria-label={`${subModule.title} - ${subModule.description}`}
                            >
                              <HStack gap="3" w="full" align="center">
                                <Box 
                                  flexShrink={0}
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  w="4"
                                  h="4"
                                >
                                  <Icon 
                                    icon={subModule.icon}
                                    size="sm"
                                    color={isSubModuleActive ? `${module.color}.600` : 'gray.400'}
                                  />
                                </Box>
                                <VStack align="start" gap="0" flex="1" spacing="0">
                                  <Text 
                                    fontSize="xs" 
                                    fontWeight={isSubModuleActive ? 'medium' : 'normal'}
                                    color={isSubModuleActive ? `${module.color}.700` : { base: 'gray.600', _dark: 'gray.300' }}
                                    lineHeight="1.2"
                                  >
                                    {subModule.title}
                                  </Text>
                                  {subModule.description && (
                                    <Text 
                                      fontSize="2xs" 
                                      color={isSubModuleActive ? `${module.color}.500` : { base: 'gray.400', _dark: 'gray.500' }}
                                      lineHeight="1.1"
                                      noOfLines={1}
                                    >
                                      {subModule.description}
                                    </Text>
                                  )}
                                </VStack>
                              </HStack>
                            </Button>
                          );
                        })}
                      </VStack>
                    </Box>
                    )}
                  </Collapsible.Content>
                </Collapsible.Root>
              </Box>
            );
          })}
        </VStack>

        {/* Theme Toggle Footer */}
        <Box mt="auto" p="4" borderTop="1px solid" borderColor={{ base: "gray.200", _dark: "gray.700" }}>
          {!sidebarCollapsed ? (
            <HStack justify="space-between" align="center">
              <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }} fontWeight="medium">
                Tema
              </Text>
              <QuickThemeToggle />
            </HStack>
          ) : (
            <Box display="flex" justifyContent="center">
              <QuickThemeToggle />
            </Box>
          )}
        </Box>
      </VStack>
    </Box>
  );
}