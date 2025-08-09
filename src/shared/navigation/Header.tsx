// ====================================
// src/components/navigation/Header.tsx - ICONOS CORREGIDOS
// ====================================

import  { useState } from 'react';
import { 
  Box, 
  HStack, 
  Text, 
  Button,
  Badge,
  Dialog,
  VStack
} from '@chakra-ui/react';
import { 
  BellIcon, 
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';
import { Icon } from '@/shared/ui/Icon';

export function Header() {
  const { currentModule, modules } = useNavigation();
  const [showNotifications, setShowNotifications] = useState(false);

  const totalBadges = modules.reduce((total, module) => total + (module.badge || 0), 0);
  
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
      left="0"
      right="0"
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      px="4"
      py="3"
      h="60px"
      zIndex={1001}
      shadow="sm"
    >
      <HStack justify="space-between" align="center" h="full">
        <HStack gap="3" align="center">
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
          
          <VStack align="start" gap="0">
            <Text fontSize="lg" fontWeight="semibold" color="gray.800" lineHeight="1">
              {getHeaderTitle()}
            </Text>
            {currentModule && (
              <Text fontSize="xs" color="gray.500" lineHeight="1">
                {currentModule.description}
              </Text>
            )}
          </VStack>
        </HStack>

        <HStack gap="2">
          {/* ✅ CORREGIDO: Notifications con Icon component */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(true)}
            position="relative"
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

          {/* ✅ CORREGIDO: Settings con Icon component */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => console.log('Show settings')}
          >
            <Icon icon={Cog6ToothIcon} size="md" />
          </Button>
        </HStack>
      </HStack>

      {/* ✅ Notifications Dialog */}
      <Dialog.Root 
        open={showNotifications} 
        onOpenChange={(e) => setShowNotifications(e.open)}
      >
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
      </Dialog.Root>
    </Box>
  );
}