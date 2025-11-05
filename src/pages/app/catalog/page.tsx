import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ContentLayout,
  Section,
  Stack,
  Input,
  Button,
  Badge,
  Alert,
  Spinner,
} from '@/shared/ui';
import { ProductGrid } from './components';
import { useCatalog } from './hooks/useCatalog';
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

export default function CatalogPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  // Get catalog products
  const { products, loading, error, refetch } = useCatalog({
    searchTerm: debouncedSearch,
    autoLoad: true,
  });

  // Get cart
  const {
    cart,
    addItem,
    itemCount,
    loading: cartLoading,
  } = useCart({
    customerId: user?.id,
    sessionId: user ? undefined : getGuestSessionId(),
    autoLoad: true,
  });

  // Debounce search
  useMemo(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleAddToCart = async (product: any) => {
    try {
      setAddingProductId(product.id);

      if (!cart) {
        throw new Error('Cart not initialized');
      }

      await addItem({
        product_id: product.id,
        quantity: 1,
        price: product.online_price,
        product_name: product.name,
        product_image_url: product.image_url,
      });
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setAddingProductId(null);
    }
  };

  const handleGoToCart = () => {
    navigate('/app/cart');
  };

  return (
    <ContentLayout spacing="normal">
      {/* Header with Cart Indicator */}
      <Section variant="flat">
        <Stack direction="row" justify="space-between" align="center" gap="4">
          <Stack gap="1">
            <Stack direction="row" align="center" gap="2">
              <span style={{ fontSize: '2rem' }}>🛒</span>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>
                Product Catalog
              </h1>
            </Stack>
            <p style={{ color: 'var(--chakra-colors-gray-600)' }}>
              Browse our products and add them to your cart
            </p>
          </Stack>

          {/* Cart Button with Badge */}
          <Button
            colorPalette="blue"
            variant="outline"
            onClick={handleGoToCart}
            position="relative"
          >
            View Cart
            {itemCount > 0 && (
              <Badge
                position="absolute"
                top="-2"
                right="-2"
                colorPalette="red"
                variant="solid"
                borderRadius="full"
                minW="5"
                h="5"
                fontSize="xs"
              >
                {itemCount}
              </Badge>
            )}
          </Button>
        </Stack>
      </Section>

      {/* Search Bar */}
      <Section variant="elevated">
        <Stack gap="4">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="lg"
          />
        </Stack>
      </Section>

      {/* Error State */}
      {error && (
        <Alert.Root status="error">
          <Alert.Icon />
          <Stack gap="1">
            <Alert.Title>Error loading products</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Stack>
        </Alert.Root>
      )}

      {/* Loading State */}
      {loading && (
        <Stack py="20" align="center" justify="center">
          <Spinner size="xl" colorPalette="blue" />
        </Stack>
      )}

      {/* Product Grid */}
      {!loading && !error && (
        <Section variant="flat">
          <ProductGrid
            products={products}
            onAddToCart={handleAddToCart}
            addingProductId={addingProductId}
          />
        </Section>
      )}
    </ContentLayout>
  );
}
