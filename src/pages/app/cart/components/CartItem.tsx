import { Stack, Text, Button, Image, IconButton } from '@/shared/ui';
import type { CartItem as CartItemType } from '@/modules/sales/ecommerce/services/cartService';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  isUpdating?: boolean;
}

export function CartItem({ item, onUpdateQuantity, onRemove, isUpdating }: CartItemProps) {
  const handleIncrement = () => {
    onUpdateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  const itemTotal = item.price * item.quantity;

  return (
    <Stack
      direction="row"
      gap="4"
      p="4"
      borderWidth="1px"
      borderRadius="lg"
      borderColor="gray.200"
      bg="white"
      align="center"
    >
      {/* Product Image */}
      <Stack
        w="20"
        h="20"
        flexShrink="0"
        overflow="hidden"
        borderRadius="md"
        bg="gray.100"
      >
        {item.product_image_url ? (
          <Image
            src={item.product_image_url}
            alt={item.product_name}
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
            <Text fontSize="2xl">📦</Text>
          </Stack>
        )}
      </Stack>

      {/* Product Info */}
      <Stack flex="1" gap="2">
        <Text fontWeight="bold" fontSize="lg">
          {item.product_name}
        </Text>
        <Text color="gray.600">
          ${item.price.toFixed(2)} each
        </Text>
      </Stack>

      {/* Quantity Controls */}
      <Stack direction="row" gap="2" align="center">
        <Button
          size="sm"
          variant="outline"
          onClick={handleDecrement}
          disabled={isUpdating || item.quantity <= 1}
        >
          -
        </Button>
        <Text
          minW="12"
          textAlign="center"
          fontWeight="medium"
          fontSize="lg"
        >
          {item.quantity}
        </Text>
        <Button
          size="sm"
          variant="outline"
          onClick={handleIncrement}
          disabled={isUpdating}
        >
          +
        </Button>
      </Stack>

      {/* Item Total */}
      <Text fontWeight="bold" fontSize="lg" minW="24" textAlign="right">
        ${itemTotal.toFixed(2)}
      </Text>

      {/* Remove Button */}
      <IconButton
        aria-label="Remove item"
        variant="ghost"
        colorPalette="red"
        onClick={() => onRemove(item.id)}
        disabled={isUpdating}
      >
        🗑️
      </IconButton>
    </Stack>
  );
}
