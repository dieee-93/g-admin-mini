import React from 'react';
import { Box, VStack, Icon, Tooltip, Divider } from '@chakra-ui/react';
import { Home, BarChart2, Users, Package, FileText, Settings, HelpCircle, Bell, Layers, ShoppingCart } from 'lucide-react';
export const Sidebar = () => {
  const iconSize = 20;
  const SidebarIcon = ({
    icon,
    label
  }: {
    icon: React.ReactElement;
    label: string;
  }) => <Tooltip label={label} placement="right" hasArrow>
      <Box p={3} color="whiteAlpha.800" borderRadius="md" _hover={{
      bg: 'whiteAlpha.100',
      color: 'white'
    }} cursor="pointer">
        {icon}
      </Box>
    </Tooltip>;
  return <Box w="60px" bg="#0a1929" borderRight="1px solid" borderColor="whiteAlpha.100" py={4}>
      <VStack spacing={2} align="center">
        <Box p={2} mb={4}>
          <Icon as={Layers} color="blue.400" boxSize={6} />
        </Box>
        <SidebarIcon icon={<Icon as={Home} boxSize={iconSize} />} label="Dashboard" />
        <SidebarIcon icon={<Icon as={BarChart2} boxSize={iconSize} />} label="Estadísticas" />
        <SidebarIcon icon={<Icon as={Users} boxSize={iconSize} />} label="Usuarios" />
        <SidebarIcon icon={<Icon as={Package} boxSize={iconSize} />} label="Productos" />
        <SidebarIcon icon={<Icon as={ShoppingCart} boxSize={iconSize} />} label="Ventas" />
        <SidebarIcon icon={<Icon as={FileText} boxSize={iconSize} />} label="Reportes" />
        <Divider my={4} borderColor="whiteAlpha.200" />
        <SidebarIcon icon={<Icon as={Bell} boxSize={iconSize} />} label="Notificaciones" />
        <SidebarIcon icon={<Icon as={Settings} boxSize={iconSize} />} label="Configuración" />
        <SidebarIcon icon={<Icon as={HelpCircle} boxSize={iconSize} />} label="Ayuda" />
      </VStack>
    </Box>;
};