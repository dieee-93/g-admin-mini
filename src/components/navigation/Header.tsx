// src/components/navigation/Header.tsx
// Header móvil con alertas y configuración
// ✅ CORREGIDO: Usando Heroicons + convenciones Chakra UI v3.23 correctas

import { useState } from 'react';
import { 
  Box, 
  HStack, 
  Text, 
  Button,
  Badge,
  Dialog
} from '@chakra-ui/react';
import { 
  BellIcon, 
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';

export function Header() {
  const { currentModule } = useNavigation();
  const [showNotifications, setShowNotifications] = useState(false);

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
      zIndex={1000}
      shadow="sm"
    >
      <HStack justify="space-between" align="center" h="full">
        {/* ✅ App title + current module */}
        <HStack gap="3">
          <Text fontSize="xl" fontWeight="bold" color="gray.800">
            G-Admin
          </Text>
          {currentModule && (
            <Text fontSize="sm" color="gray.600">
              {currentModule.title}
            </Text>
          )}
        </HStack>

        {/* ✅ Actions */}
        <HStack gap="2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(true)}
            position="relative"
          >
            <BellIcon style={{ width: '20px', height: '20px' }} />
            <Badge
              position="absolute"
              top="-1"
              right="-1"
              colorPalette="red"
              size="sm"
              borderRadius="full"
            >
              3
            </Badge>
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="sm">
            <Cog6ToothIcon style={{ width: '20px', height: '20px' }} />
          </Button>
        </HStack>
      </HStack>

      {/* ✅ Notifications Dialog usando Dialog v3.23 */}
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
              <Text>Stock bajo en 3 items</Text>
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