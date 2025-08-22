import {
  VStack,
  Text,
  Button,
  Alert
} from '@chakra-ui/react';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import type { AlertCardProps } from '@/modules/dashboard/types/dashboard.types';

export function AlertCard({
  title,
  description,
  status,
  actionLabel,
  onAction,
  showAlert = true
}: AlertCardProps) {
  if (!showAlert) return null;

  return (
    <Alert.Root 
      status={status}
      variant="surface"
    >
      <Alert.Indicator />
      <VStack align="start" gap="2" flex="1">
        <Alert.Title>
          {title}
        </Alert.Title>
        <Alert.Description>
          <Text>{description}</Text>
        </Alert.Description>
        {actionLabel && onAction && (
          <Button
            size="sm"
            variant="outline"
            colorPalette={status === 'error' ? 'red' : status === 'warning' ? 'orange' : 'blue'}
            onClick={onAction}
          >
            <ArrowRightIcon style={{ width: '16px', height: '16px', marginRight: '6px' }} />
            {actionLabel}
          </Button>
        )}
      </VStack>
    </Alert.Root>
  );
}