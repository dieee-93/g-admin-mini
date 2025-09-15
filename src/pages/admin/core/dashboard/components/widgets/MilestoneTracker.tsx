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
import { Box, Flex, Progress } from '@chakra-ui/react';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { Link } from '@/shared/navigation/Link';

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
      <Stack gap="6">

        <MetricCard
          title="Progreso de Configuración"
          value={`${completedMilestones} / ${totalMilestones}`}
          subtitle="pasos completados"
          icon={CheckCircleIcon}
          colorPalette="blue"
          badge={{
            value: `${Math.round(progressPercent)}%`,
            colorPalette: progressPercent >= 75 ? "green" : progressPercent >= 50 ? "orange" : "blue"
          }}
        />
        
        <Stack gap="2">
          <Progress.Root 
            value={progressPercent} 
            size="md" 
            colorPalette={progressPercent >= 75 ? "green" : "blue"}
          >
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
          <Typography variant="body" size="sm" color="fg.muted" textAlign="center">
            {progressPercent >= 100 
              ? "¡Configuración completa! Tu negocio está listo para operar."
              : `${Math.round(progressPercent)}% completado - ${totalMilestones - completedMilestones} pasos restantes`
            }
          </Typography>
        </Stack>

        <Stack gap="6">
        {categoryOrder
          .filter(category => groupedMilestones[category]) // Solo mostrar categorías que tienen hitos
          .map((category) => (
          <Box key={category}>
            <Typography variant="heading" size="md" weight="semibold" color="fg.default" mb={3}>
              {category}
            </Typography>
            <Stack gap={3}>
              {groupedMilestones[category].map((milestone) =>
                milestone.isCompleted ? (
                  <Box
                    key={milestone.id}
                    p={4}
                    bg="green.50"
                    borderLeft="4px solid"
                    borderColor="green.400"
                    borderRadius="md"
                    opacity={0.8}
                  >
                    <Flex align="center" gap={3}>
                      <Icon icon={CheckCircleIcon} color="green.500" size="md" />
                      <Box flex="1">
                        <Typography 
                          variant="body" 
                          size="md" 
                          weight="medium" 
                          color="green.700"
                          textDecoration="line-through"
                        >
                          {milestone.title}
                        </Typography>
                      </Box>
                      <Badge colorPalette="green" variant="subtle">
                        Completado
                      </Badge>
                    </Flex>
                  </Box>
                ) : (
                  <Link moduleId={milestone.moduleId} subPath={milestone.subPath} query={milestone.query} key={milestone.id} style={{ textDecoration: 'none' }}>
                    <Box
                      p={4}
                      bg="blue.50"
                      borderLeft="4px solid"
                      borderColor="blue.400"
                      borderRadius="md"
                      _hover={{ 
                        bg: 'blue.100', 
                        transform: 'translateY(-2px)',
                        shadow: 'md'
                      }}
                      transition="all 0.2s ease"
                      cursor="pointer"
                    >
                      <Flex justify="space-between" align="center">
                        <Flex align="center" gap={3}>
                          <Icon icon={EllipsisHorizontalIcon} color="blue.500" size="md" />
                          <Box>
                            <Typography variant="body" size="md" weight="semibold" color="fg.default">
                              {milestone.title}
                            </Typography>
                            <Typography variant="body" size="sm" color="fg.muted">
                              {milestone.description}
                            </Typography>
                          </Box>
                        </Flex>
                        <Flex align="center" gap={2}>
                          <Badge colorPalette="blue" variant="outline">
                            Pendiente
                          </Badge>
                          <Icon icon={ArrowRightIcon} color="blue.500" size="sm" />
                        </Flex>
                      </Flex>
                    </Box>
                  </Link>
                )
              )}
            </Stack>
          </Box>
        ))}
        </Stack>
      </Stack>
    </Section>
  );
}

export default MilestoneTracker;
