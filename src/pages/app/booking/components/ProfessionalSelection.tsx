import { Stack, Text, Box, Avatar, Grid, Button, CardWrapper, Badge } from '@/shared/ui';
import { useProfessionalsForService } from '../hooks/useBooking';
import type { ProfessionalProfile } from '@/types/appointment';

interface ProfessionalSelectionProps {
  serviceId: string;
  onSelect: (professional: ProfessionalProfile) => void;
  onSkip?: () => void;
}

export function ProfessionalSelection({
  serviceId,
  onSelect,
  onSkip,
}: ProfessionalSelectionProps) {
  const { data: professionals, isLoading, error } = useProfessionalsForService(serviceId);

  if (isLoading) {
    return (
      <Stack gap="4">
        {[1, 2, 3].map((i) => (
          <CardWrapper key={i} variant="elevated">
            <CardWrapper.Body>
              <Stack direction="row" gap="4" align="center">
                <Box width="60px" height="60px" bg="gray.200" borderRadius="full" />
                <Stack flex="1" gap="2">
                  <Box height="20px" bg="gray.200" borderRadius="md" width="40%" />
                  <Box height="16px" bg="gray.100" borderRadius="md" width="60%" />
                </Stack>
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
          <Text color="red.600">Error loading professionals. Please try again.</Text>
        </CardWrapper.Body>
      </CardWrapper>
    );
  }

  if (!professionals || professionals.length === 0) {
    return (
      <CardWrapper variant="outline">
        <CardWrapper.Body>
          <Stack gap="4" align="center" py="8">
            <Text color="text.muted" textAlign="center">
              No professionals available for this service.
            </Text>
            {onSkip && (
              <Button onClick={onSkip} colorPalette="blue">
                Continue with Any Available Professional
              </Button>
            )}
          </Stack>
        </CardWrapper.Body>
      </CardWrapper>
    );
  }

  return (
    <Stack gap="4">
      <Box>
        <Text fontSize="2xl" fontWeight="bold" mb="2">
          Choose a Professional
        </Text>
        <Text color="text.muted">
          Select who you'd like to book with
        </Text>
      </Box>

      <Grid
        templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
        gap="4"
      >
        {professionals.map((professional) => (
          <CardWrapper
            key={professional.id}
            variant="elevated"
            cursor="pointer"
            onClick={() => onSelect(professional)}
            _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
            transition="all 0.2s"
          >
            <CardWrapper.Body>
              <Stack direction="row" gap="4" align="center">
                <Avatar
                  src={professional.avatar_url}
                  name={professional.name || `${professional.first_name} ${professional.last_name}`}
                  size="lg"
                />

                <Stack flex="1" gap="2">
                  <Stack gap="1">
                    <Text fontSize="lg" fontWeight="semibold">
                      {professional.name || `${professional.first_name} ${professional.last_name}`}
                    </Text>
                    <Text fontSize="sm" color="text.muted">
                      {professional.position}
                    </Text>
                  </Stack>

                  {professional.certifications && professional.certifications.length > 0 && (
                    <Stack direction="row" gap="2" flexWrap="wrap">
                      {professional.certifications.slice(0, 2).map((cert, idx) => (
                        <Badge key={idx} size="sm" colorPalette="green">
                          {cert}
                        </Badge>
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Stack>
            </CardWrapper.Body>
          </CardWrapper>
        ))}
      </Grid>

      {onSkip && (
        <Box pt="4" textAlign="center">
          <Button onClick={onSkip} variant="ghost" colorPalette="gray">
            I don't have a preference - Show all available times
          </Button>
        </Box>
      )}
    </Stack>
  );
}
