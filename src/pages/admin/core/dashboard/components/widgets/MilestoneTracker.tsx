import { useMemo } from 'react';
import { useAchievements } from '@/pages/admin/gamification/achievements/hooks/useAchievements';
import { useBusinessProfile } from '@/store/businessCapabilitiesStore';
import { 
  Section, 
  Stack, 
  Typography, 
  Badge,
  Button
} from '@/shared/ui';
import { Box, Flex, Progress, Text } from '@chakra-ui/react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export function MilestoneTracker() {
  const { profile } = useBusinessProfile();
  const { 
    progress, 
    totalMilestones, 
    completedMilestones, 
    overallProgress,
    isLoading 
  } = useAchievements('demo-user'); // Usar ID fijo por ahora

  // Filtrar solo hitos incompletos para mostrar
  const incompleteCapabilities = useMemo(() => {
    if (!progress || progress.length === 0) return [];
    return progress.filter(p => !p.isActive);
  }, [progress]);
  
  // Agrupar por categoría/dominio
  const groupedProgress = useMemo(() => {
    return incompleteCapabilities.reduce((acc, capabilityProgress) => {
      // Determinar categoría basada en el ID de capacidad
      let category = 'General';
      if (capabilityProgress.capabilityId.includes('sells_')) category = 'Ventas';
      else if (capabilityProgress.capabilityId.includes('manages_')) category = 'Operaciones';
      else if (capabilityProgress.capabilityId.includes('staff')) category = 'Personal';
      else if (capabilityProgress.capabilityId.includes('inventory')) category = 'Inventario';
      
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(capabilityProgress);
      return acc;
    }, {} as Record<string, typeof incompleteCapabilities>);
  }, [incompleteCapabilities]);

  // Si está cargando o no hay datos
  if (isLoading || !progress || progress.length === 0) {
    return (
      <Section title="Progreso de Hitos" size="md">
        <Box p={4} textAlign="center" color="gray.500">
          <Typography variant="body">Cargando progreso de hitos...</Typography>
        </Box>
      </Section>
    );
  }

  return (
    <Section title="Progreso de Hitos" size="md">
      <Stack direction="column" gap="4">
        {/* Progreso General */}
        <Box>
          <Flex justify="space-between" mb={2}>
            <Text fontSize="sm" fontWeight="medium">
              Progreso General
            </Text>
            <Text fontSize="sm" color="gray.500">
              {completedMilestones}/{totalMilestones} completados
            </Text>
          </Flex>
          <Progress.Root 
            value={overallProgress} 
            colorPalette="blue" 
            size="md"
          >
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
          <Text fontSize="xs" color="gray.500" mt={1}>
            {Math.round(overallProgress)}% completado
          </Text>
        </Box>

        {/* Categorías de Hitos */}
        {Object.entries(groupedProgress).map(([category, capabilities]) => (
          <Box key={category}>
            <Text fontSize="sm" fontWeight="semibold" mb={2}>
              {category}
            </Text>
            <Stack direction="column" gap="2">
              {capabilities.slice(0, 2).map((capabilityProgress) => (
                <Box 
                  key={capabilityProgress.capabilityId}
                  p={3} 
                  bg="gray.50" 
                  borderRadius="md"
                  borderLeft="3px solid"
                  borderLeftColor="blue.200"
                >
                  <Flex justify="space-between" align="center">
                    <Box flex={1}>
                      <Text fontSize="sm" fontWeight="medium">
                        {capabilityProgress.capabilityId.replace(/[_]/g, ' ')}
                      </Text>
                      <Text fontSize="xs" color="gray.600" mt={1}>
                        Capacidad en desarrollo
                      </Text>
                    </Box>
                    <Badge colorPalette="yellow" variant="subtle" size="sm">
                      Pendiente
                    </Badge>
                  </Flex>
                </Box>
              ))}
            </Stack>
          </Box>
        ))}

        {/* Botón para ver todos los logros */}
        <Box>
          <Link to="/admin/gamification/achievements" style={{ textDecoration: 'none' }}>
            <Button 
              variant="outline" 
              size="sm" 
              fullWidth
            >
              <Flex align="center" gap={2}>
                <Text>Ver Galaxy de Logros</Text>
                <ChevronRightIcon style={{ width: '16px', height: '16px' }} />
              </Flex>
            </Button>
          </Link>
        </Box>
      </Stack>
    </Section>
  );
}

export default MilestoneTracker;
