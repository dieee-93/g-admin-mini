import React from 'react';
import { Box, SimpleGrid, Button, Icon, Text, VStack } from '@chakra-ui/react';
import { ShoppingCart, Package, Users, FileText, Calendar, Truck, DollarSign, Settings } from 'lucide-react';
interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  path: string;
  requiredPermission?: string;
}
const defaultActions: QuickAction[] = [{
  id: 'new-sale',
  label: 'Nueva Venta',
  icon: ShoppingCart,
  color: 'green',
  path: '/admin/operations/sales'
}, {
  id: 'new-order',
  label: 'Nueva Orden',
  icon: FileText,
  color: 'blue',
  path: '/admin/supply-chain/production'
}, {
  id: 'new-customer',
  label: 'Nuevo Cliente',
  icon: Users,
  color: 'purple',
  path: '/admin/customer/customers'
}, {
  id: 'new-product',
  label: 'Nuevo Producto',
  icon: Package,
  color: 'orange',
  path: '/admin/supply-chain/products'
}, {
  id: 'schedule',
  label: 'Programar',
  icon: Calendar,
  color: 'pink',
  path: '/admin/resources/scheduling'
}, {
  id: 'delivery',
  label: 'Envío',
  icon: Truck,
  color: 'cyan',
  path: '/admin/operations/delivery'
}, {
  id: 'invoice',
  label: 'Factura',
  icon: DollarSign,
  color: 'teal',
  path: '/admin/finance/billing'
}, {
  id: 'settings',
  label: 'Configurar',
  icon: Settings,
  color: 'gray',
  path: '/admin/core/settings'
}];
interface QuickActionsWidgetProps {
  actions?: QuickAction[];
  onActionClick?: (action: QuickAction) => void;
}
export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({
  actions = defaultActions,
  onActionClick
}) => {
  const handleClick = (action: QuickAction) => {
    if (onActionClick) {
      onActionClick(action);
    } else {
      window.location.href = action.path;
    }
  };
  return <Box>
      <Text fontSize="sm" fontWeight="bold" color="whiteAlpha.600" mb={4} letterSpacing="wider">
        ACCIONES RÁPIDAS
      </Text>
      <SimpleGrid columns={{
      base: 2,
      md: 4,
      lg: 4
    }} spacing={4}>
        {actions.map(action => <Button key={action.id} onClick={() => handleClick(action)} colorScheme={action.color} variant="solid" height="auto" py={6} px={4} borderRadius="xl" transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" _hover={{
        transform: 'translateY(-4px) scale(1.05)',
        boxShadow: `0 8px 20px rgba(0, 0, 0, 0.4)`
      }} _active={{
        transform: 'translateY(-2px) scale(1.02)'
      }}>
            <VStack spacing={3}>
              <Icon as={action.icon} boxSize={8} />
              <Text fontSize="sm" fontWeight="semibold">
                {action.label}
              </Text>
            </VStack>
          </Button>)}
      </SimpleGrid>
    </Box>;
};