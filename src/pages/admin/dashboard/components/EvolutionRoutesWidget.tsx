import React from 'react';
import { Box, Stack, Heading, Text, SimpleGrid, Card, CardBody, HStack, Circle, Button, Spinner, Center } from '@chakra-ui/react';
import { useEvolutionRoutes } from '@/hooks/useEvolutionRoutes';
import { ArrowRightIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

const planetIcons: { [key: string]: string } = {
  'E-commerce Asincrónico': '🛒',
  'Canal Digital Sincrónico': '🌐',
  'Enfoque B2B': '🤝',
  'Multi-Sucursal': '🏬',
  'Móvil / Nómada': '🚚',
};

export const EvolutionRoutesWidget = () => {
  const { suggestedRoutes, isLoading } = useEvolutionRoutes();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Center bg="gray.50" borderRadius="xl" p={6} boxShadow="md" h="200px">
        <Spinner />
      </Center>
    );
  }

  if (suggestedRoutes.length === 0) {
    return null; // Don't render the widget if there are no suggestions
  }

  return (
    <Box bg="gray.50" borderRadius="xl" p={6} boxShadow="md">
      <Stack gap={4}>
        <Stack gap={1}>
            <Heading size="md" fontWeight="semibold">Rutas de Evolución</Heading>
            <Text fontSize="sm" color="gray.600">
            Desbloquea nuevas capacidades para tu negocio. Te sugerimos los siguientes pasos:
            </Text>
        </Stack>
        <SimpleGrid columns={{ base: 1, md: suggestedRoutes.length }} gap={5}>
          {suggestedRoutes.map(({ planetName, milestone }) => (
            <Card
              key={milestone.id}
              bg="white"
              shadow="sm"
              borderWidth="1px"
              borderColor="gray.200"
              _hover={{ shadow: 'md', borderColor: 'blue.200' }}
              transition="all 0.2s"
            >
              <CardBody>
                <Stack gap={4} h="100%">
                  <HStack>
                    <Circle bg="blue.100" color="blue.600" size="40px">
                      <Text fontSize="xl">{planetIcons[planetName] || '🚀'}</Text>
                    </Circle>
                    <Box>
                      <Heading size="sm">{milestone.title}</Heading>
                      <Text fontSize="xs" color="gray.500">Desbloquea: {planetName}</Text>
                    </Box>
                  </HStack>
                  <Text fontSize="sm" color="gray.700" flex="1">{milestone.description}</Text>
                  <Button
                    size="sm"
                    variant="solid"
                    colorScheme="blue"
                    rightIcon={<ArrowRightIcon boxSize={3} />}
                    onClick={() => navigate(milestone.link)}
                  >
                    Comenzar
                  </Button>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Box>
  );
};
