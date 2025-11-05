import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ContentLayout,
  Section,
  Stack,
  Text,
  Button,
  Alert,
  Spinner,
} from '@/shared/ui';
import { CartItem, CartSummary } from './components';
import { useCart } from '@/modules/sales/ecommerce/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';

// Session storage helper for guest carts
const getGuestSessionId = () => {
  let sessionId = sessionStorage.getItem('guest_session_id');
  if (!sessionId) {
    sessionId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('guest_session_id', sessionId);
  }
  return sessionId;
};

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  const {
    cart,
    updateItem,
    removeItem,
    itemCount,
    loading,
    error,
  } = useCart({
    customerId: user?.id,
    sessionId: user ? undefined : getGuestSessionId(),
    autoLoad: true,
  });

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      setUpdatingItemId(itemId);
      await updateItem(itemId, { quantity });
    } catch (err) {
      console.error('Error updating quantity:', err);
      alert('Failed to update quantity. Please try again.');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      setUpdatingItemId(itemId);
      await removeItem(itemId);
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Failed to remove item. Please try again.');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      // Redirect to login, then back to checkout
      navigate('/login?redirect=/app/checkout');
      return;
    }
    navigate('/app/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/app/catalog');
  };

  // Loading state
  if (loading) {
    return (
      <ContentLayout spacing="normal">
        <Stack py="20" align="center" justify="center">
          <Spinner size="xl" colorPalette="blue" />
        </Stack>
      </ContentLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <ContentLayout spacing="normal">
        <Alert.Root status="error">
          <Alert.Icon />
          <Stack gap="1">
            <Alert.Title>Error loading cart</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Stack>
        </Alert.Root>
      </ContentLayout>
    );
  }

  // Empty cart state
  if (!cart || cart.items.length === 0) {
    return (
      <ContentLayout spacing="normal">
        <Section variant="flat">
          <Stack py="20" align="center" justify="center" gap="4">
            <Text fontSize="5xl">🛒</Text>
            <Text fontSize="2xl" fontWeight="bold">
              Your cart is empty
            </Text>
            <Text color="gray.600">
              Add some products to your cart to get started
            </Text>
            <Button
              colorPalette="blue"
              size="lg"
              onClick={handleContinueShopping}
            >
              Continue Shopping
            </Button>
          </Stack>
        </Section>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout spacing="normal">
      {/* Header */}
      <Section variant="flat">
        <Stack direction="row" justify="space-between" align="center">
          <Stack gap="1">
            <Stack direction="row" align="center" gap="2">
              <span style={{ fontSize: '2rem' }}>🛒</span>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
                Shopping Cart
              </h1>
            </Stack>
            <p style={{ color: 'var(--chakra-colors-gray-600)' }}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </Stack>

          <Button variant="ghost" onClick={handleContinueShopping}>
            ← Continue Shopping
          </Button>
        </Stack>
      </Section>

      {/* Cart Content */}
      <Stack
        direction={{ base: 'column', lg: 'row' }}
        gap="6"
        align="flex-start"
      >
        {/* Cart Items */}
        <Stack flex="1" gap="4" w="full">
          {cart.items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemoveItem}
              isUpdating={updatingItemId === item.id}
            />
          ))}
        </Stack>

        {/* Cart Summary */}
        <Stack w={{ base: 'full', lg: '96' }}>
          <CartSummary
            subtotal={cart.subtotal}
            tax={cart.tax}
            total={cart.total}
            onCheckout={handleCheckout}
            itemCount={itemCount}
          />
        </Stack>
      </Stack>

      {/* Guest checkout notice */}
      {!user && (
        <Alert.Root status="info">
          <Alert.Icon />
          <Stack gap="1">
            <Alert.Title>Login required for checkout</Alert.Title>
            <Alert.Description>
              You'll need to log in or create an account to complete your order.
            </Alert.Description>
          </Stack>
        </Alert.Root>
      )}
    </ContentLayout>
  );
}
