/**
 * QROrderConfirmation Component
 * Success screen shown after order is submitted
 * 
 * EXTRACTED FROM: QROrderPage.tsx (lines 308-363)
 */

import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Badge,
  CardWrapper,
} from '@/shared/ui';
import { Icon } from '@/shared/ui';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface QROrderConfirmationProps {
  orderNumber: string;
  tableNumber: string;
  estimatedPrepTime: number;
  onOrderMore: () => void;
}

export function QROrderConfirmation({
  orderNumber,
  tableNumber,
  estimatedPrepTime,
  onOrderMore,
}: QROrderConfirmationProps) {
  return (
    <Box p="6" textAlign="center" maxW="md" mx="auto">
      <VStack gap="6">
        <Icon icon={CheckCircleIcon} size="2xl" className="text-green-500" />

        <VStack gap="2">
          <Heading size="lg" color="green.600">Order Confirmed!</Heading>
          <Text color="gray.600">
            Your order has been sent to the kitchen
          </Text>
        </VStack>

        <CardWrapper w="full" p="4">
          <VStack gap="3">
            <HStack justify="space-between" w="full">
              <Text fontWeight="bold">Order Number:</Text>
              <Badge colorPalette="green">
                {orderNumber}
              </Badge>
            </HStack>

            <HStack justify="space-between" w="full">
              <Text fontWeight="bold">Table:</Text>
              <Text>{tableNumber}</Text>
            </HStack>

            <HStack justify="space-between" w="full">
              <Text fontWeight="bold">Estimated Time:</Text>
              <Text>{Math.ceil(estimatedPrepTime)} minutes</Text>
            </HStack>
          </VStack>
        </CardWrapper>

        <VStack gap="2" textAlign="center">
          <Text fontSize="sm" color="gray.600">
            Your order is being prepared. You'll be notified when it's ready.
          </Text>
          <Text fontSize="xs" color="gray.500">
            Need help? Please speak with your server.
          </Text>
        </VStack>

        <Button
          onClick={onOrderMore}
          variant="outline"
        >
          Order More Items
        </Button>
      </VStack>
    </Box>
  );
}
