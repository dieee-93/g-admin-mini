import React, { useState } from 'react';
import { Box, Flex, Text, Avatar, IconButton, Menu, MenuButton, MenuList, MenuItem, HStack, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Input, InputGroup, InputLeftElement, Badge, VStack, Popover, PopoverTrigger, PopoverContent, PopoverBody, Button } from '@chakra-ui/react';
import { Bell, ChevronDown, Search, Calendar } from 'lucide-react';
export const Header = () => {
  const [notifications] = useState([{
    id: '1',
    title: 'Nueva venta completada',
    time: 'Hace 2 min',
    read: false
  }, {
    id: '2',
    title: 'Stock bajo en Material XYZ',
    time: 'Hace 15 min',
    read: false
  }, {
    id: '3',
    title: 'Orden de producción lista',
    time: 'Hace 1 hora',
    read: true
  }]);
  const unreadCount = notifications.filter(n => !n.read).length;
  return <Box py={4} px={6} bg="#0a1929" borderBottom="1px solid" borderColor="whiteAlpha.100">
      <Flex justify="space-between" align="center">
        <Breadcrumb color="whiteAlpha.800" separator="/" spacing={2}>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" fontWeight="bold" color="blue.400" fontSize="md">
              G-Admin
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" color="whiteAlpha.900" fontWeight="medium">
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Text color="whiteAlpha.500" fontSize="sm">
              Centro de operaciones
            </Text>
          </BreadcrumbItem>
        </Breadcrumb>
        <HStack spacing={3}>
          <InputGroup maxW="300px" display={{
          base: 'none',
          lg: 'block'
        }}>
            <InputLeftElement pointerEvents="none">
              <Search size={16} color="rgba(255, 255, 255, 0.4)" />
            </InputLeftElement>
            <Input placeholder="Buscar... (Ctrl+K)" size="sm" bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.200" _hover={{
            borderColor: 'whiteAlpha.300'
          }} _focus={{
            borderColor: 'blue.400',
            boxShadow: '0 0 0 1px #3182ce'
          }} color="white" _placeholder={{
            color: 'whiteAlpha.500'
          }} />
          </InputGroup>
          <Menu>
            <MenuButton as={Button} size="sm" variant="ghost" leftIcon={<Calendar size={16} />} color="whiteAlpha.700" _hover={{
            bg: 'whiteAlpha.100'
          }} display={{
            base: 'none',
            md: 'flex'
          }}>
              Hoy
            </MenuButton>
            <MenuList bg="#152a47" borderColor="whiteAlpha.200">
              <MenuItem bg="#152a47" _hover={{
              bg: '#1e3a61'
            }} fontWeight="medium">
                Hoy
              </MenuItem>
              <MenuItem bg="#152a47" _hover={{
              bg: '#1e3a61'
            }} fontWeight="medium">
                Esta Semana
              </MenuItem>
              <MenuItem bg="#152a47" _hover={{
              bg: '#1e3a61'
            }} fontWeight="medium">
                Este Mes
              </MenuItem>
              <MenuItem bg="#152a47" _hover={{
              bg: '#1e3a61'
            }} fontWeight="medium">
                Este Año
              </MenuItem>
              <MenuItem bg="#152a47" _hover={{
              bg: '#1e3a61'
            }} fontWeight="medium">
                Personalizado...
              </MenuItem>
            </MenuList>
          </Menu>
          <Popover placement="bottom-end">
            <PopoverTrigger>
              <Box position="relative" cursor="pointer">
                <IconButton aria-label="Notifications" icon={<Bell size={18} />} variant="ghost" color="whiteAlpha.700" size="md" _hover={{
                bg: 'whiteAlpha.100',
                color: 'white'
              }} />
                {unreadCount > 0 && <Badge position="absolute" top="-2px" right="-2px" colorScheme="red" borderRadius="full" fontSize="xs" minW="18px" h="18px" display="flex" alignItems="center" justifyContent="center">
                    {unreadCount}
                  </Badge>}
              </Box>
            </PopoverTrigger>
            <PopoverContent bg="#152a47" borderColor="whiteAlpha.200" width="350px">
              <PopoverBody p={0}>
                <Box p={4} borderBottom="1px solid" borderColor="whiteAlpha.100">
                  <Text fontWeight="bold" color="white">
                    Notificaciones
                  </Text>
                </Box>
                <VStack spacing={0} align="stretch" maxH="400px" overflowY="auto">
                  {notifications.map(notification => <Box key={notification.id} p={4} borderBottom="1px solid" borderColor="whiteAlpha.100" bg={notification.read ? 'transparent' : 'whiteAlpha.50'} _hover={{
                  bg: 'whiteAlpha.100'
                }} cursor="pointer">
                      <Text fontSize="sm" fontWeight="medium" color="white" mb={1}>
                        {notification.title}
                      </Text>
                      <Text fontSize="xs" color="whiteAlpha.500">
                        {notification.time}
                      </Text>
                    </Box>)}
                </VStack>
                <Box p={3} borderTop="1px solid" borderColor="whiteAlpha.100">
                  <Button size="sm" variant="ghost" width="full" color="blue.400" fontWeight="medium">
                    Ver todas las notificaciones
                  </Button>
                </Box>
              </PopoverBody>
            </PopoverContent>
          </Popover>
          <Menu>
            <MenuButton>
              <HStack spacing={3}>
                <Avatar size="sm" name="Admin User" bg="blue.500" />
                <Box textAlign="left" display={{
                base: 'none',
                md: 'block'
              }}>
                  <Text fontSize="sm" fontWeight="semibold" color="whiteAlpha.900">
                    admin@example.com
                  </Text>
                  <Text fontSize="xs" color="whiteAlpha.500" fontWeight="medium">
                    SUPER_ADMIN
                  </Text>
                </Box>
                <Box color="whiteAlpha.500">
                  <ChevronDown size={16} />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList bg="#152a47" borderColor="whiteAlpha.200">
              <MenuItem bg="#152a47" _hover={{
              bg: '#1e3a61'
            }} fontWeight="medium">
                Perfil
              </MenuItem>
              <MenuItem bg="#152a47" _hover={{
              bg: '#1e3a61'
            }} fontWeight="medium">
                Configuración
              </MenuItem>
              <MenuItem bg="#152a47" _hover={{
              bg: '#1e3a61'
            }} fontWeight="medium">
                Cerrar Sesión
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>;
};