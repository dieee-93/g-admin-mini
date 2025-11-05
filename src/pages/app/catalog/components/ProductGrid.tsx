import { Stack, Text } from '@/shared/ui';
import { ProductCard } from './ProductCard';
import type { CatalogProduct } from '../hooks/useCatalog';

interface ProductGridProps {
  products: CatalogProduct[];
  onAddToCart: (product: CatalogProduct) => void;
  addingProductId?: string | null;
}

export function ProductGrid({ products, onAddToCart, addingProductId }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <Stack
        py="20"
        align="center"
        justify="center"
        gap="4"
        color="gray.500"
      >
        <Text fontSize="5xl">🛒</Text>
        <Text fontSize="xl" fontWeight="medium">
          No products found
        </Text>
        <Text fontSize="sm">
          Try adjusting your search or filters
        </Text>
      </Stack>
    );
  }

  return (
    <Stack
      gridTemplateColumns={{
        base: '1fr',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
        lg: 'repeat(4, 1fr)',
      }}
      gap="6"
      display="grid"
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          isAdding={addingProductId === product.id}
        />
      ))}
    </Stack>
  );
}
