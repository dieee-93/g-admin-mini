// ====================================
// src/components/navigation/Header.tsx - ICONOS CORREGIDOS
// ====================================

import React, { useState } from 'react';
import { 
  Box, 
  HStack, 
  Text, 
  Button,
  Badge,
  Dialog,
  VStack,
  Menu,
  Avatar,
  Portal
} from '@chakra-ui/react';
import { 
  BellIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '@/contexts/NavigationContext';
import { Icon } from '@/shared/ui/Icon';
import { useAuth } from '@/contexts/AuthContext';
import { ConnectionStatus } from '@/lib/offline/OfflineMonitor';

export function Header() {
  const navigate = useNavigate();
  const { currentModule, modules, sidebarCollapsed } = useNavigation();
  const { user, signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const totalBadges = modules.reduce((total, module) => total + (module.badge || 0), 0);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigation is handled by the signOut function
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };
  
  const getHeaderTitle = () => {
    if (currentModule) {
      return currentModule.title;
    }
    return 'G-Admin';
  };

  return (
    <Box
      as="header"
      position="fixed"
      top="0"
      right="0"
      left={{ base: "0", md: sidebarCollapsed ? "60px" : "280px" }}
      bg={{ base: "white", _dark: "gray.800" }}
      borderBottom="1px solid"
      borderColor={{ base: "gray.200", _dark: "gray.700" }}
      px={{ base: "6", md: "6" }}
      py="3"
      h="60px"
      zIndex={1002}
      shadow="sm"
      transition="left 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      w={{ base: "100%", md: "auto" }}
    >
      <HStack justify="space-between" align="center" h="full">
        <HStack gap="2" align="center">
          {/* Breadcrumb contextual inteligente */}
          <HStack gap={{ base: "1", md: "2" }} align="center" flexWrap="wrap">
            <Text 
              fontSize="sm" 
              fontWeight="medium" 
              color={{ base: "gray.600", _dark: "gray.300" }}
              cursor="pointer"
              _hover={{ color: { base: "blue.600", _dark: "blue.400" } }}
              transition="color 0.2s ease"
              onClick={() => navigate('/dashboard')}
              display={{ base: "none", sm: "block" }}
            >
              G-Admin
            </Text>
            <Text 
              color={{ base: "gray.400", _dark: "gray.500" }} 
              fontSize="sm"
              display={{ base: "none", sm: "block" }}
            >/</Text>
            <Text 
              fontSize="sm" 
              fontWeight="semibold" 
              color={{ base: "gray.800", _dark: "gray.100" }}
            >
              {getHeaderTitle()}
            </Text>
            {currentModule && (
              <>
                <Text 
                  color={{ base: "gray.400", _dark: "gray.500" }} 
                  fontSize="sm"
                  display={{ base: "none", md: "block" }}
                >·</Text>
                <Text 
                  fontSize="xs" 
                  color={{ base: "gray.500", _dark: "gray.400" }}
                  fontStyle="italic"
                  display={{ base: "none", md: "block" }}
                  noOfLines={1}
                  maxW={{ base: "150px", lg: "300px" }}
                >
                  {currentModule.description}
                </Text>
              </>
            )}
          </HStack>
        </HStack>

        <HStack gap="2">
          {/* ✅ Connection Status integrado */}
          <ConnectionStatus />

          {/* ✅ CORREGIDO: Notifications con Icon component */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(true)}
            position="relative"
            borderRadius="lg"
          >
            <Icon icon={BellIcon} size="md" />
            
            {totalBadges > 0 && (
              <Badge
                position="absolute"
                top="-2px"
                right="-2px"
                bg="red.500"
                color="white"
                borderRadius="full"
                fontSize="xs"
                minW="18px"
                h="18px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="2px solid white"
              >
                {totalBadges > 99 ? '99+' : totalBadges}
              </Badge>
            )}
          </Button>


          {/* User Menu */}
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button variant="ghost" size="sm" p="2" borderRadius="lg">
                <HStack gap="2">
                  <Avatar.Root size="sm">
                    <Avatar.Fallback name={user?.full_name || user?.email || 'Usuario'} />
                  </Avatar.Root>
                  <VStack align="start" gap="0" display={{ base: 'none', md: 'flex' }}>
                    <Text fontSize="xs" fontWeight="medium" lineHeight="1" color={{ base: "gray.700", _dark: "gray.200" }}>
                      {user?.full_name || user?.email || 'Usuario'}
                    </Text>
                    <Text fontSize="xs" color={{ base: "gray.500", _dark: "gray.400" }} lineHeight="1">
                      {user?.role || 'Usuario'}
                    </Text>
                  </VStack>
                </HStack>
              </Button>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  <Menu.Item 
                    value="profile" 
                    onClick={() => navigate('/settings/profile')}
                  >
                    <Icon icon={UserIcon} size="sm" />
                    <Text>Perfil</Text>
                  </Menu.Item>
                  <Menu.Item 
                    value="settings"
                    onClick={() => navigate('/settings')}
                  >
                    <Icon icon={Cog6ToothIcon} size="sm" />
                    <Text>Configuración</Text>
                  </Menu.Item>
                  <Menu.Separator />
                  <Menu.Item 
                    value="logout" 
                    color="red.500"
                    onClick={handleSignOut}
                  >
                    <Icon icon={ArrowRightOnRectangleIcon} size="sm" />
                    <Text>Cerrar Sesión</Text>
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </HStack>
      </HStack>

      {/* ✅ Notifications Dialog */}
      <Dialog.Root 
        open={showNotifications} 
        onOpenChange={(details: { open: boolean }) => setShowNotifications(details.open)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Notificaciones</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <VStack align="start" gap="3">
                {modules
                  .filter(module => module.badge && module.badge > 0)
                  .map(module => (
                    <HStack key={module.id} gap="3" w="full">
                      <Box 
                        w="8" 
                        h="8" 
                        bg={`${module.color}.100`} 
                        borderRadius="md"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        {/* ✅ CORREGIDO: Icon component en lugar de createElement */}
                        <Icon icon={module.icon} size="sm" />
                      </Box>
                      <VStack align="start" gap="0" flex="1">
                        <Text fontSize="sm" fontWeight="semibold">
                          {module.title}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {module.badge} {module.badge === 1 ? 'alerta' : 'alertas'} pendiente{module.badge > 1 ? 's' : ''}
                        </Text>
                      </VStack>
                      <Badge colorPalette={module.color} size="sm">
                        {module.badge}
                      </Badge>
                    </HStack>
                  ))
                }
                
                {totalBadges === 0 && (
                  <Text fontSize="sm" color="gray.500" textAlign="center" w="full">
                    No hay notificaciones pendientes
                  </Text>
                )}
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <Button variant="outline">Cerrar</Button>
              </Dialog.CloseTrigger>
            </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </Box>
  );
}