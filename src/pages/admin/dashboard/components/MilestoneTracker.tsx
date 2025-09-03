import { usePersonalizedExperience } from '@/hooks/usePersonalizedExperience';
import { Box, Stack, Text, Heading, Link as ChakraLink, Icon, Flex, Progress } from '@chakra-ui/react';
import { CheckCircle, ArrowRight, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MilestoneTracker() {
  const { milestones, stats } = usePersonalizedExperience();

  // Asegurarse de que `milestones` y `stats` no son undefined
  if (!milestones || milestones.length === 0 || !stats) {
    return null; // No mostrar nada si no hay logros relevantes o stats
  }

  const { completedMilestones, totalMilestones } = stats;

  // Manejar el caso donde totalMilestones podría ser 0 para evitar división por cero
  const progressPercent = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  const pendingMilestones = milestones.filter(m => !m.isCompleted);
  const completedMilestonesList = milestones.filter(m => m.isCompleted);

  return (
    <Box p={6} bg="white" borderRadius="lg" shadow="sm" borderWidth="1px">
      <Heading as="h3" size="md" mb={1}>
        Guía de Inicio Rápido
      </Heading>
      <Text color="gray.500" mb={4}>
        Completa estos pasos para configurar tu negocio y sacarle el máximo provecho a la aplicación.
      </Text>

      <Flex align="center" mb={4}>
        <Text fontWeight="bold" color="blue.600" mr={3}>
          {completedMilestones} / {totalMilestones} completados
        </Text>
        <Progress value={progressPercent} size="sm" flex="1" borderRadius="md" />
      </Flex>

      <Stack spacing={4}>
        {pendingMilestones.map((milestone) => (
          <Link to={milestone.link} key={milestone.id} style={{ textDecoration: 'none' }}>
            <ChakraLink as="div" _hover={{ textDecoration: 'none' }}>
              <Flex
                p={4}
                borderWidth="1px"
                borderRadius="md"
                align="center"
                justify="space-between"
                _hover={{ bg: 'gray.50', shadow: 'md', transform: 'translateY(-2px)' }}
                transition="all 0.2s"
              >
                <Flex align="center">
                  <Icon as={Circle} color="gray.300" mr={4} />
                  <Box>
                    <Text fontWeight="bold">{milestone.title}</Text>
                    <Text fontSize="sm" color="gray.600">{milestone.description}</Text>
                  </Box>
                </Flex>
                <Icon as={ArrowRight} color="blue.500" />
              </Flex>
            </ChakraLink>
          </Link>
        ))}
        {completedMilestonesList.map((milestone) => (
           <Flex
              key={milestone.id}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              align="center"
              bg="green.50"
              opacity={0.7}
            >
              <Icon as={CheckCircle} color="green.500" mr={4} />
              <Box>
                <Text fontWeight="bold" textDecoration="line-through" color="gray.600">
                  {milestone.title}
                </Text>
              </Box>
            </Flex>
        ))}
      </Stack>
    </Box>
  );
}

export default MilestoneTracker;
