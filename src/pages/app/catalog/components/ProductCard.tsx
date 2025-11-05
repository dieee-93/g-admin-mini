import { Button, Badge, Stack, Text, Image } from '@/shared/ui';
import type { CatalogProduct } from '../hooks/useCatalog';

interface ProductCardProps {
  product: CatalogProduct;
  onAddToCart: (product: CatalogProduct) => void;
  isAdding?: boolean;
}

export function ProductCard({ product, onAddToCart, isAdding }: ProductCardProps) {
  const availableStock = product.online_stock ?? product.stock;
  const isOutOfStock = availableStock <= 0;
  const isLowStock = availableStock > 0 && availableStock <= 5;

  return (
    <Stack
      gap="4"
      p="4"
      borderWidth="1px"
      borderRadius="lg"
      borderColor="gray.200"
      bg="white"
      _hover={{ shadow: 'md' }}
      transition="all 0.2s"
      position="relative"
    >
      {/* Featured Badge */}
      {product.is_featured && (
        <Badge
          position="absolute"
          top="2"
          right="2"
          colorPalette="purple"
          variant="solid"
        >
          Featured
        </Badge>
      )}

      {/* Product Image */}
      <Stack aspectRatio="1" overflow="hidden" borderRadius="md" bg="gray.100">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            objectFit="cover"
            w="full"
            h="full"
          />
        ) : (
          <Stack
            justify="center"
            align="center"
            w="full"
            h="full"
            color="gray.400"
          >
            <Text fontSize="3xl">📦</Text>
          </Stack>
        )}
      </Stack>

      {/* Product Info */}
      <Stack gap="2" flex="1">
        <Text fontWeight="bold" fontSize="lg" lineClamp={2}>
          {product.name}
        </Text>

        {product.description && (
          <Text fontSize="sm" color="gray.600" lineClamp={2}>
            {product.description}
          </Text>
        )}

        {product.category_name && (
          <Badge colorPalette="gray" variant="subtle" w="fit-content">
            {product.category_name}
          </Badge>
        )}

        {/* Stock Status */}
        {isOutOfStock ? (
          <Badge colorPalette="red" variant="subtle" w="fit-content">
            Out of Stock
          </Badge>
        ) : isLowStock ? (
          <Badge colorPalette="orange" variant="subtle" w="fit-content">
            Only {availableStock} left
          </Badge>
        ) : null}
      </Stack>

      {/* Price and Action */}
      <Stack direction="row" justify="space-between" align="center">
        <Text fontSize="2xl" fontWeight="bold" color="blue.600">
          ${product.online_price.toFixed(2)}
        </Text>

        <Button
          colorPalette="blue"
          onClick={() => onAddToCart(product)}
          disabled={isOutOfStock || isAdding}
          loading={isAdding}
        >
          Add to Cart
        </Button>
      </Stack>
    </Stack>
  );
}
