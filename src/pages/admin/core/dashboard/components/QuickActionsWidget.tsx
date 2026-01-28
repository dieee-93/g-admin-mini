/**
 * QuickActionsWidget - Acciones rápidas del dashboard
 *
 * DISEÑO COPIADO DE: newdashboard/src/components/dashboard/QuickActionsWidget.tsx
 * ADAPTADO A: G-Admin Mini design system
 *
 * Grid de botones de acciones rápidas con:
 * - 8 acciones predefinidas
 * - Navegación integrada con NavigationContext
 * - Animaciones suaves en hover
 * - Colores por categoría
 * - Responsive: 2 cols (mobile) → 4 cols (desktop)
 *
 * @example
 * <QuickActionsWidget />
 *
 * @example
 * // Con acciones custom
 * <QuickActionsWidget
 *   actions={customActions}
 *   onActionClick={(action) => console.log(action)}
 * />
 */

import React from 'react';
import { Box, Stack, Typography, Button, Icon, SimpleGrid } from '@/shared/ui';
import {
  ShoppingCartIcon,
  CubeIcon,
  UsersIcon,
  DocumentTextIcon,
  CalendarIcon,
  TruckIcon,
  BanknotesIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useNavigationActions } from '@/contexts/NavigationContext';

// ===============================
// TYPES
// ===============================

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  path: string;
  requiredPermission?: string;
}

// ===============================
// DEFAULT ACTIONS
// ===============================

const defaultActions: QuickAction[] = [
  {
    id: 'new-sale',
    label: 'Nueva Venta',
    icon: ShoppingCartIcon,
    color: 'green',
    path: '/admin/operations/sales'
  },
  {
    id: 'new-order',
    label: 'Nueva Orden',
    icon: DocumentTextIcon,
    color: 'blue',
    path: '/admin/supply-chain/production'
  },
  {
    id: 'new-customer',
    label: 'Nuevo Cliente',
    icon: UsersIcon,
    color: 'purple',
    path: '/admin/core/crm/customers'
  },
  {
    id: 'new-product',
    label: 'Nuevo Producto',
    icon: CubeIcon,
    color: 'orange',
    path: '/admin/supply-chain/products'
  },
  {
    id: 'schedule',
    label: 'Programar',
    icon: CalendarIcon,
    color: 'pink',
    path: '/admin/resources/scheduling'
  },
  {
    id: 'delivery',
    label: 'Envío',
    icon: TruckIcon,
    color: 'cyan',
    path: '/admin/operations/fulfillment/delivery'
  },
  {
    id: 'invoice',
    label: 'Factura',
    icon: BanknotesIcon,
    color: 'teal',
    path: '/admin/finance/billing'
  },
  {
    id: 'settings',
    label: 'Configurar',
    icon: Cog6ToothIcon,
    color: 'gray',
    path: '/admin/core/settings'
  }
];

// ===============================
// PROPS
// ===============================

export interface QuickActionsWidgetProps {
  /** Acciones custom (opcional, usa defaults si no se provee) */
  actions?: QuickAction[];

  /** Handler custom de click (opcional, usa navigate si no se provee) */
  onActionClick?: (action: QuickAction) => void;
}

// ===============================
// COMPONENT
// ===============================

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({
  actions = defaultActions,
  onActionClick
}) => {
  const { navigate } = useNavigationActions();

  const handleClick = (action: QuickAction) => {
    if (onActionClick) {
      onActionClick(action);
    } else {
      // Navegar usando NavigationContext
      // Extraer moduleId del path
      const pathParts = action.path.split('/').filter(Boolean);
      const moduleId = pathParts[pathParts.length - 1];
      navigate(moduleId);
    }
  };

  return (
    <Box>
      <Typography
        variant="body"
        size="sm"
        weight="bold"
        color="fg.subtle"
        mb={4}
        letterSpacing="wider"
      >
        ACCIONES RÁPIDAS
      </Typography>

      <SimpleGrid
        columns={{
          base: 2,
          md: 4,
          lg: 4
        }}
        gap={4}
      >
        {actions.map(action => (
          <Button
            key={action.id}
            onClick={() => handleClick(action)}
            colorPalette={action.color}
            variant="solid"
            height="auto"
            py={6}
            px={4}
            borderRadius="xl"
            transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
            _hover={{
              transform: 'translateY(-4px) scale(1.05)',
              boxShadow: 'lg'
            }}
            _active={{
              transform: 'translateY(-2px) scale(1.02)'
            }}
          >
            <Stack direction="column" gap={3} align="center">
              <Icon as={action.icon} boxSize={8} />
              <Typography variant="body" size="sm" weight="semibold">
                {action.label}
              </Typography>
            </Stack>
          </Button>
        ))}
      </SimpleGrid>
    </Box>
  );
};
