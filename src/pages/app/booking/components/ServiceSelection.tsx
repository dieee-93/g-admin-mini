import { Stack, Text, Box, Grid, Image } from '@chakra-ui/react';
import { Icon, CardWrapper, Badge } from '@/shared/ui';
import { ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useServices } from '../hooks/useBooking';
import type { ServiceProduct } from '@/types/appointment';

interface ServiceSelectionProps {
  onSelect: (service: ServiceProduct) => void;
}

export function ServiceSelection({ onSelect }: ServiceSelectionProps) {
  const { data: services, isLoading, error } = useServices();

  if (isLoading) {
    return (
      <Stack gap="4">
        {[1, 2, 3].map((i) => (
          <CardWrapper key={i} variant="elevated">
            <CardWrapper.Body>
              <Stack gap="3">
                <Box height="100px" bg="gray.200" borderRadius="md" />
                <Box height="20px" bg="gray.200" borderRadius="md" width="60%" />
                <Box height="16px" bg="gray.100" borderRadius="md" width="80%" />
              </Stack>
            </CardWrapper.Body>
          </CardWrapper>
        ))}
      </Stack>
    );
  }

  if (error) {
    return (
      <CardWrapper variant="outline" borderColor="red.200">
        <CardWrapper.Body>
          <Text color="red.600">Error loading services. Please try again.</Text>
        </CardWrapper.Body>
      </CardWrapper>
    );
  }

  if (!services || services.length === 0) {
    return (
      <CardWrapper variant="outline">
        <CardWrapper.Body>
          <Text color="text.muted" textAlign="center" py="8">
            No services available for booking at the moment.
          </Text>
        </CardWrapper.Body>
      </CardWrapper>
    );
  }

  return (
    <Stack gap="4">
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb="2">
          Choose a Service
        </Text>
        <Text color="text.muted">
          Select the service you'd like to book
        </Text>
      </Box>

      <Grid
        templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
        gap="4"
      >
        {services.map((service) => (
          <CardWrapper
            key={service.id}
            variant="elevated"
            cursor="pointer"
            onClick={() => onSelect(service)}
            _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
            transition="all 0.2s"
          >
            {service.image_url && (
              <Box
                height="150px"
                overflow="hidden"
                borderTopRadius="md"
              >
                <Image
                  src={service.image_url}
                  alt={service.name}
                  width="100%"
                  height="100%"
                  objectFit="cover"
                />
              </Box>
            )}

            <CardWrapper.Body>
              <Stack gap="3">
                {/* Header */}
                <Stack gap="1">
                  <Text fontSize="lg" fontWeight="semibold" lineHeight="1.2">
                    {service.name}
                  </Text>
                  {service.category && (
                    <Badge size="sm" colorPalette="blue">
                      {service.category}
                    </Badge>
                  )}
                </Stack>

                {/* Description */}
                {service.description && (
                  <Text
                    fontSize="sm"
                    color="text.muted"
                    lineHeight="1.4"
                    noOfLines={2}
                  >
                    {service.description}
                  </Text>
                )}

                {/* Info */}
                <Stack direction="row" justify="space-between" pt="2">
                  <Stack direction="row" gap="1" align="center">
                    <Icon icon={ClockIcon} size="sm" color="text.muted" />
                    <Text fontSize="sm" color="text.muted">
                      {service.duration_minutes} min
                    </Text>
                  </Stack>

                  <Stack direction="row" gap="1" align="center">
                    <Icon icon={CurrencyDollarIcon} size="sm" color="green.600" />
                    <Text fontSize="lg" fontWeight="bold" color="green.600">
                      ${service.price.toFixed(2)}
                    </Text>
                  </Stack>
                </Stack>
              </Stack>
            </CardWrapper.Body>
          </CardWrapper>
        ))}
      </Grid>
    </Stack>
  );
}
