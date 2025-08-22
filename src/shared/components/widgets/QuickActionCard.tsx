import {
  VStack,
  Text,
  Button
} from '@chakra-ui/react';
import type { QuickActionCardProps } from '@/modules/dashboard/types/dashboard.types';

export function QuickActionCard({
  title,
  description,
  icon: Icon,
  colorPalette,
  onClick
}: QuickActionCardProps) {
  return (
    <Button
      variant="outline"
      size="md"
      onClick={onClick}
      colorPalette={colorPalette}
      h="auto"
      py="3"
      px="3"
    >
      <VStack gap="1">
        <Icon style={{ width: '20px', height: '20px' }} />
        <VStack gap="0">
          <Text fontSize="xs" fontWeight="semibold">{title}</Text>
          {description && (
            <Text fontSize="2xs" color={{ base: "gray.600", _dark: "gray.300" }} textAlign="center">
              {description}
            </Text>
          )}
        </VStack>
      </VStack>
    </Button>
  );
}