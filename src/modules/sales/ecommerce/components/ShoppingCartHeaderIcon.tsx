import React, { memo } from 'react';
import { Box } from '@chakra-ui/react';
import { useNavigate as useRouterNavigate } from 'react-router-dom';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/modules/sales/ecommerce/hooks/useCart';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';

export const ShoppingCartHeaderIcon = memo(function ShoppingCartHeaderIcon() {
  const { user } = useAuth();
  const routerNavigate = useRouterNavigate();

  // Session storage helper for guest carts
  const getGuestSessionId = () => {
    let sessionId = sessionStorage.getItem('guest_session_id');
    if (!sessionId) {
      sessionId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('guest_session_id', sessionId);
    }
    return sessionId;
  };

  // Get cart for customer users (not admin)
  // This ensures the hook is only active for customers
  const isCustomer = user?.role === 'customer';
  const { itemCount } = useCart({
    customerId: isCustomer ? user?.id : undefined,
    sessionId: isCustomer && !user ? getGuestSessionId() : undefined,
    autoLoad: isCustomer, // Only autoload for customers
  });

  // Render nothing if the user is not a customer
  if (!isCustomer) {
    return null;
  }

  return (
    <Box position="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => routerNavigate('/app/cart')}
        aria-label="Ver carrito de compras"
      >
        <Icon icon={ShoppingCartIcon} size="md" />
      </Button>

      {itemCount > 0 && (
        <Box
          position="absolute"
          top="-2px"
          right="-2px"
          bg="red.500"
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
          borderColor="bg.surface"
          aria-hidden="true"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </Box>
      )}
    </Box>
  );
});
