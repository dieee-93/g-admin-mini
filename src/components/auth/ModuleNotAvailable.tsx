import { Box, Heading, Text, Button, VStack, Icon } from '@/shared/ui';
import { LockClosedIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface ModuleNotAvailableProps {
  moduleName: string;
  message?: string;
  action?: string;
}

export function ModuleNotAvailable({
  moduleName,
  message = 'This module is not included in your current plan.',
  action = 'Contact your administrator to enable this feature.',
}: ModuleNotAvailableProps) {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="60vh"
      padding={8}
    >
      <VStack gap={6} maxWidth="500px" textAlign="center">
        <Icon asChild fontSize="6xl" color="gray.400">
          <LockClosedIcon />
        </Icon>

        <Heading size="2xl" color="gray.700">
          Module Not Available
        </Heading>

        <Text fontSize="lg" color="gray.600">
          {message}
        </Text>

        <Text fontSize="md" color="gray.500">
          Module: <strong>{moduleName}</strong>
        </Text>

        <Text fontSize="sm" color="gray.500">
          {action}
        </Text>

        <Button
          colorPalette="blue"
          onClick={() => navigate('/admin/dashboard')}
        >
          Return to Dashboard
        </Button>
      </VStack>
    </Box>
  );
}
