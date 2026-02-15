// ====================================
// src/components/navigation/Header.tsx - MIGRADO AL DESIGN SYSTEM
// ====================================

import React, { useState, memo } from 'react';
import { 
  Menu,
  Avatar,
  Portal,
  Box,
  Icon,
  Typography,
  Stack,
  Button
} from '@/shared/ui';
import { 
  Cog6ToothIcon,
  ArrowRightEndOnRectangleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useNavigationState, useNavigationActions, useNavigationLayout } from '@/contexts/NavigationContext';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logging';

interface HeaderProps {
  actions?: React.ReactNode;
}

// ⚡ PERFORMANCE: Memoize Header to prevent unnecessary re-renders
export const Header = memo(function Header({ actions }: HeaderProps) {
  const navState = useNavigationState();
  const navActions = useNavigationActions();
  const { sidebarCollapsed } = useNavigationLayout(); // GET sidebarCollapsed from context
  const { currentModule, modules } = navState;
  const { navigate } = navActions;
  const { user, signOut } = useAuth();
  
  // REMOVED: isSidebarHovered state and useEffect
  // const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  // React.useEffect(() => { /* ... */ }, []);

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
    return 'Dashboard'; // Changed from 'G-Admin' to avoid redundancy
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
            opacity={sidebarCollapsed ? 1 : 0.3} // Use !sidebarCollapsed to reverse logic
            transform={sidebarCollapsed ? 'translateX(0px)' : 'translateX(8px)'} // Use !sidebarCollapsed to reverse logic
            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
          >
            <Typography
              variant="body"
              size="sm"
              fontWeight="medium"
              color="fg.muted"
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
              color="fg.subtle"
              display={{ base: 'none', sm: 'block' }}
            >/</Typography>
            <Typography
              variant="body"
              size="sm"
              fontWeight="semibold"
              color="fg.default"
            >
              {getHeaderTitle()}
            </Typography>
            {currentModule && (
              <>
                <Typography
                  variant="body"
                  size="sm"
                  color="fg.subtle"
                  display={{ base: 'none', md: 'block' }}
                >·</Typography>
                <Typography
                  variant="body"
                  size="xs"
                  color="fg.muted"
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

        <Stack direction="row" align="center" gap="4">
          {actions}

          {/* User Menu */}
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button variant="ghost" size="sm">
                <Stack direction="row" gap="4">
                  <Avatar 
                    size="sm" 
                    name={(user as any)?.email || 'Usuario'} 
                  />
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


    </Box>
  );
});