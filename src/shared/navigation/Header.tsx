// ====================================
// src/components/navigation/Header.tsx - MIGRADO AL DESIGN SYSTEM
// ====================================

import React, { useState } from 'react';
import { 
  Dialog,
  Menu,
  Avatar,
  Portal,
  Box
} from '@chakra-ui/react';
import { 
  BellIcon, 
  Cog6ToothIcon,
  ArrowRightEndOnRectangleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';
import { Icon } from '@/shared/ui/Icon';
import { Typography } from '@/shared/ui/Typography';
import { Stack } from '@/shared/ui/Stack';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { ConnectionStatus } from '@/lib/offline/OfflineMonitor';

import { logger } from '@/lib/logging';
export function Header() {
  const { currentModule, modules, navigate } = useNavigation();
  const { user, signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Listen for sidebar hover state
  React.useEffect(() => {
    const handleSidebarHover = (event: CustomEvent) => {
      setIsSidebarHovered(event.detail.isHovering);
    };
    
    window.addEventListener('sidebarHover', handleSidebarHover as EventListener);
    return () => window.removeEventListener('sidebarHover', handleSidebarHover as EventListener);
  }, []);

  const totalBadges = modules.reduce((total, module) => total + (module.badge || 0), 0);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigation is handled by the signOut function
    } catch (error) {
      logger.error('App', 'Error during sign out:', error);
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
      top={0}
      right={0}
      left="3rem"
      bg="bg.surface"
      borderBottom="1px solid"
      borderColor="border.default"
      px="6"
      py="3"
      height="60px"
      zIndex={1000}
      boxShadow="sm"
      width="auto"
      transition="opacity 0.2s ease"
      _hover={{
        opacity: 0.95
      }}
    >
      <Stack direction="row" justify="space-between" align="center" height="100%">
        <Stack direction="row" align="center" gap="4">
          {/* Breadcrumb contextual inteligente - fades when sidebar expands */}
          <Stack 
            direction="row" 
            align="center" 
            gap="4"
            opacity={isSidebarHovered ? 0.3 : 1}
            transform={isSidebarHovered ? 'translateX(8px)' : 'translateX(0px)'}
            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
          >
            <Typography 
              variant="body"
              size="sm" 
              fontWeight="medium" 
              color="text.secondary"
              cursor="pointer"
              transition="color 0.2s ease"
              display={{ base: 'none', sm: 'block' }}
              onClick={() => navigate('dashboard')}
            >
              G-Admin
            </Typography>
            <Typography 
              variant="body"
              size="sm"
              color="text.muted"
              display={{ base: 'none', sm: 'block' }}
            >/</Typography>
            <Typography 
              variant="body"
              size="sm" 
              fontWeight="semibold" 
              color="text.primary"
            >
              {getHeaderTitle()}
            </Typography>
            {currentModule && (
              <>
                <Typography 
                  variant="body"
                  size="sm"
                  color="text.muted"
                  display={{ base: 'none', md: 'block' }}
                >·</Typography>
                <Typography 
                  variant="body"
                  size="xs" 
                  color="text.secondary"
                  fontStyle="italic"
                  display={{ base: 'none', md: 'block' }}
                  maxWidth={{ base: '150px', lg: '300px' }}
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                >
                  {currentModule.description}
                </Typography>
              </>
            )}
          </Stack>
        </Stack>

        <Stack direction="row" gap="4">
          {/* ✅ Connection Status integrado */}
          <ConnectionStatus />

          {/* ✅ Notifications con design system */}
          <Box position="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(true)}
            >
              <Icon icon={BellIcon} size="md" />
            </Button>
            
            {totalBadges > 0 && (
              <Box
                position="absolute"
                top="-2px"
                right="-2px"
                color="white"
                borderRadius="full"
                fontSize="xs"
                fontWeight="bold"
                minWidth="18px"
                height="18px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="2px solid"
              >
                {totalBadges > 99 ? '99+' : totalBadges}
              </Box>
            )}
          </Box>

          {/* User Menu */}
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button variant="ghost" size="sm">
                <Stack direction="row" gap="4">
                  <Avatar.Root size="sm">
                    <Avatar.Fallback name={(user as any)?.email || 'Usuario'} />
                  </Avatar.Root>
                  <Box 
                    display={{ base: 'none', md: 'flex' }}
                    flexDirection="column"
                    gap="none"
                  >
                    <Typography variant="body" size="xs" fontWeight="medium" color="text.primary">
                      {(user as any)?.email || 'Usuario'}
                    </Typography>
                    <Typography variant="body" size="xs" color="text.secondary">
                      {user?.role || 'Usuario'}
                    </Typography>
                  </Box>
                </Stack>
              </Button>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  <Menu.Item 
                    value="profile" 
                    onClick={() => navigate('settings', '/profile')}
                  >
                    <Icon icon={UserIcon} size="sm" />
                    <Typography variant="body" size="sm">Perfil</Typography>
                  </Menu.Item>
                  <Menu.Item 
                    value="settings"
                    onClick={() => navigate('settings')}
                  >
                    <Icon icon={Cog6ToothIcon} size="sm" />
                    <Typography variant="body" size="sm">Configuración</Typography>
                  </Menu.Item>
                  <Menu.Separator />
                  <Menu.Item 
                    value="logout" 
                    onClick={handleSignOut}
                  >
                    <Icon icon={ArrowRightEndOnRectangleIcon} size="sm" color="error.500" />
                    <Typography variant="body" size="sm" color="error">Cerrar Sesión</Typography>
                  </Menu.Item>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </Stack>
      </Stack>

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
              <Stack gap="md" align="start">
                {modules
                  .filter(module => module.badge && module.badge > 0)
                  .map(module => (
                    <Stack key={module.id} direction="row" gap="md" align="center" width="100%">
                      <Box 
                        width="32px"
                        height="32px"
                        borderRadius="md"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon icon={module.icon} size="sm" />
                      </Box>
                      <Box flex="1">
                        <Stack direction="column" gap="none">
                          <Typography variant="body" size="sm" fontWeight="semibold">
                            {module.title}
                          </Typography>
                          <Typography variant="body" size="xs" color="text.secondary">
                            {module.badge || 0} {(module.badge || 0) === 1 ? 'alerta' : 'alertas'} pendiente{(module.badge || 0) > 1 ? 's' : ''}
                          </Typography>
                        </Stack>
                      </Box>
                      <Badge colorPalette="green" size="sm">
                        {module.badge}
                      </Badge>
                    </Stack>
                  ))
                }
                
                {totalBadges === 0 && (
                  <Typography variant="body" size="sm" color="text.muted" textAlign="center" width="100%">
                    No hay notificaciones pendientes
                  </Typography>
                )}
              </Stack>
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