import { useMemo } from 'react';
import { usePersonalizedExperience } from '@/hooks/usePersonalizedExperience';
import { 
  Section, 
  Stack, 
  Typography, 
  MetricCard,
  Badge,
  Icon
} from '@/shared/ui';
import { Progress, Flex, Box } from '@chakra-ui/react';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
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

  // Agrupar hitos por categoría
  const groupedMilestones = useMemo(() => {
    return milestones.reduce((acc, milestone) => {
      const category = milestone.category || 'Otros';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(milestone);
      return acc;
    }, {} as Record<string, typeof milestones>);
  }, [milestones]);

  const categoryOrder: (keyof typeof groupedMilestones)[] = ['Configuración Esencial', 'Primeros Pasos', 'Optimización'];

  return (
    <Section 
      variant="elevated" 
      title="Guía de Inicio Rápido"
      subtitle="Completa estos pasos para configurar tu negocio y sacarle el máximo provecho a la aplicación"
      icon={CheckCircleIcon}
    >

      <Flex align="center" mb={6}>
        <Text fontWeight="bold" color="blue.600" mr={3}>
          {completedMilestones} / {totalMilestones} completados
        </Text>
        <Progress value={progressPercent} size="sm" flex="1" borderRadius="md" />
      </Flex>

      <Stack spacing={6}>
        {categoryOrder
          .filter(category => groupedMilestones[category]) // Solo mostrar categorías que tienen hitos
          .map((category) => (
          <Box key={category}>
            <Heading as="h4" size="sm" mb={3} color="gray.700" fontWeight="semibold">
              {category}
            </Heading>
            <Stack spacing={3}>
              {groupedMilestones[category].map((milestone) =>
                milestone.isCompleted ? (
                  <Flex
                    key={milestone.id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    align="center"
                    bg="green.50"
                    opacity={0.8}
                  >
                    <Icon as={CheckCircle} color="green.500" mr={4} boxSize={5} />
                    <Box>
                      <Text fontWeight="medium" textDecoration="line-through" color="gray.500">
                        {milestone.title}
                      </Text>
                    </Box>
                  </Flex>
                ) : (
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
                          <Icon as={Circle} color="gray.300" mr={4} boxSize={5} />
                          <Box>
                            <Text fontWeight="medium" color="gray.800">{milestone.title}</Text>
                            <Text fontSize="sm" color="gray.600">{milestone.description}</Text>
                          </Box>
                        </Flex>
                        <Icon as={ArrowRight} color="blue.500" />
                      </Flex>
                    </ChakraLink>
                  </Link>
                )
              )}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Section>
  );
}

export default MilestoneTracker;
