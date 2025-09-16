/**
 * Galaxia de Habilidades - Página Principal de Logros
 * 
 * Visualización completa del sistema de logros usando la metáfora de una galaxia
 * donde cada dominio es una constelación y cada logro es una estrella.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Grid,
  Card,
  CardBody,
  Badge,
  Progress,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Spacer
} from '@chakra-ui/react';
import {
  FiStar,
  FiAward,
  FiTrendingUp,
  FiTarget,
  FiZap,
  FiRefreshCw,
  FiFilter
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { AchievementCard } from './components/AchievementCard';
import { ConstellationView } from './components/ConstellationView';
import { AchievementsEngine } from '../services/AchievementsEngine';
import { DOMAIN_METADATA } from '@/config/masteryAchievements';
import type { 
  MasteryAchievementDefinition, 
  UserAchievement, 
  DomainProgressSummary 
} from '../types';

// Componentes que crearemos
import { ConstellationView } from '../components/ConstellationView';
import { AchievementCard } from '../components/AchievementCard';
import { ProgressStats } from '../components/ProgressStats';

interface GalaxiaHabilidadesState {
  allAchievements: MasteryAchievementDefinition[];
  userAchievements: UserAchievement[];
  domainProgress: DomainProgressSummary[];
  isLoading: boolean;
  error: string | null;
  selectedDomain: string | null;
  viewMode: 'galaxy' | 'list';
}

export default function GalaxiaHabilidadesPage() {
  const { user } = useAuth();
  const [state, setState] = useState<GalaxiaHabilidadesState>({
    allAchievements: [],
    userAchievements: [],
    domainProgress: [],
    isLoading: true,
    error: null,
    selectedDomain: null,
    viewMode: 'galaxy'
  });

  // Colores del tema
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, gray.900, purple.900, blue.900)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  /**
   * Carga inicial de datos
   */
  useEffect(() => {
    if (user?.id) {
      loadAchievementData();
    }
  }, [user?.id]);

  /**
   * Carga todos los datos de logros
   */
  const loadAchievementData = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const engine = AchievementsEngine.getInstance();
      await engine.initialize(user!.id);

      // Cargar datos en paralelo
      const [userAchievements, domainProgress] = await Promise.all([
        engine.getUserMasteryAchievements(),
        engine.getDomainProgressSummary()
      ]);

      // TODO: Cargar todas las definiciones de logros desde la base de datos
      // Por ahora usaremos una lista vacía, se debe implementar un método en el engine
      const allAchievements: MasteryAchievementDefinition[] = [];

      setState(prev => ({
        ...prev,
        userAchievements,
        domainProgress,
        allAchievements,
        isLoading: false
      }));

    } catch (error) {
      console.error('[GalaxiaHabilidades] Error cargando datos:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error desconocido',
        isLoading: false
      }));
    }
  };

  /**
   * Filtra logros por dominio seleccionado
   */
  const getFilteredAchievements = () => {
    if (!state.selectedDomain) {
      return state.allAchievements;
    }
    return state.allAchievements.filter(achievement => achievement.domain === state.selectedDomain);
  };

  /**
   * Calcula estadísticas generales
   */
  const calculateOverallStats = () => {
    const totalAchievements = state.domainProgress.reduce((sum, domain) => sum + domain.total_achievements, 0);
    const unlockedAchievements = state.domainProgress.reduce((sum, domain) => sum + domain.unlocked_achievements, 0);
    const totalPoints = state.domainProgress.reduce((sum, domain) => sum + domain.total_points, 0);
    const overallProgress = totalAchievements > 0 ? Math.round((unlockedAchievements / totalAchievements) * 100) : 0;

    return {
      totalAchievements,
      unlockedAchievements,
      totalPoints,
      overallProgress
    };
  };

  const stats = calculateOverallStats();

  // Estado de carga
  if (state.isLoading) {
    return (
      <Container maxW="7xl" py={8}>
        <VStack gap={8}>
          <Box textAlign="center">
            <Text fontSize="3xl" fontWeight="bold" mb={4}>
              🌌 Galaxia de Habilidades
            </Text>
            <Text color="gray.600" mb={8}>
              Explorando tus logros y progreso...
            </Text>
          </Box>
          
          <Flex justify="center" align="center" minH="200px">
            <VStack gap={4}>
              <Spinner size="xl" color="blue.500" thickness="4px" />
              <Text color="gray.600">Cargando tu galaxia personal...</Text>
            </VStack>
          </Flex>
        </VStack>
      </Container>
    );
  }

  // Estado de error
  if (state.error) {
    return (
      <Container maxW="7xl" py={8}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <Box>
            <AlertTitle>Error cargando logros</AlertTitle>
            <AlertDescription>
              {state.error}
            </AlertDescription>
          </Box>
          <Spacer />
          <Button leftIcon={<FiRefreshCw />} onClick={loadAchievementData}>
            Reintentar
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW="7xl" py={8}>
        <VStack gap={8} align="stretch">
          
          {/* Header de la página */}
          <Box textAlign="center">
            <Text fontSize="4xl" fontWeight="bold" mb={2}>
              🌌 Galaxia de Habilidades
            </Text>
            <Text fontSize="lg" color="gray.600" mb={6}>
              Tu mapa personal de logros y maestría en el sistema
            </Text>
            
            {/* Estadísticas principales */}
            <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4} mb={6}>
              <Stat textAlign="center" bg={cardBg} p={4} borderRadius="lg" border="1px" borderColor={borderColor}>
                <StatLabel>Logros Desbloqueados</StatLabel>
                <StatNumber>{stats.unlockedAchievements}</StatNumber>
                <StatHelpText>de {stats.totalAchievements} disponibles</StatHelpText>
              </Stat>
              
              <Stat textAlign="center" bg={cardBg} p={4} borderRadius="lg" border="1px" borderColor={borderColor}>
                <StatLabel>Progreso Total</StatLabel>
                <StatNumber>{stats.overallProgress}%</StatNumber>
                <StatHelpText>
                  <StatArrow type={stats.overallProgress > 50 ? 'increase' : 'decrease'} />
                  completado
                </StatHelpText>
              </Stat>
              
              <Stat textAlign="center" bg={cardBg} p={4} borderRadius="lg" border="1px" borderColor={borderColor}>
                <StatLabel>Puntos Ganados</StatLabel>
                <StatNumber>{stats.totalPoints}</StatNumber>
                <StatHelpText>
                  <Icon as={FiStar} color="yellow.400" />
                  puntos maestría
                </StatHelpText>
              </Stat>
              
              <Stat textAlign="center" bg={cardBg} p={4} borderRadius="lg" border="1px" borderColor={borderColor}>
                <StatLabel>Dominios Activos</StatLabel>
                <StatNumber>{state.domainProgress.filter(d => d.unlocked_achievements > 0).length}</StatNumber>
                <StatHelpText>de {state.domainProgress.length} dominios</StatHelpText>
              </Stat>
            </Grid>
          </Box>

          {/* Controles de vista */}
          <HStack justify="space-between" wrap="wrap" gap={4}>
            <HStack gap={2}>
              <Button
                leftIcon={<FiTarget />}
                variant={state.viewMode === 'galaxy' ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={() => setState(prev => ({ ...prev, viewMode: 'galaxy' }))}
              >
                Vista Galaxia
              </Button>
              <Button
                leftIcon={<FiFilter />}
                variant={state.viewMode === 'list' ? 'solid' : 'outline'}
                colorScheme="blue"
                onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
              >
                Vista Lista
              </Button>
            </HStack>
            
            <Button
              leftIcon={<FiRefreshCw />}
              variant="ghost"
              onClick={loadAchievementData}
            >
              Actualizar
            </Button>
          </HStack>

          {/* Contenido principal */}
          {state.viewMode === 'galaxy' ? (
            /* Vista Galaxia - Constelaciones por dominio */
            <VStack gap={6} align="stretch">
              <Text fontSize="2xl" fontWeight="semibold" textAlign="center">
                🌟 Constelaciones de Maestría
              </Text>
              
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
                {Object.entries(DOMAIN_METADATA).map(([domainId, metadata]) => {
                  const domainData = state.domainProgress.find(d => d.domain === domainId);
                  const progress = domainData?.progress_percentage || 0;
                  const unlockedCount = domainData?.unlocked_achievements || 0;
                  const totalCount = domainData?.total_achievements || 0;
                  
                  return (
                    <Card
                      key={domainId}
                      bg={cardBg}
                      border="1px"
                      borderColor={borderColor}
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                      onClick={() => setState(prev => ({ 
                        ...prev, 
                        selectedDomain: domainId, 
                        viewMode: 'list' 
                      }))}
                    >
                      <CardBody>
                        <VStack gap={4}>
                          <HStack gap={3}>
                            <Icon as={FiAward} boxSize={6} color={`${metadata.color}.500`} />
                            <VStack align="start" gap={1}>
                              <Text fontWeight="bold" fontSize="lg">
                                {metadata.name}
                              </Text>
                              <Text fontSize="sm" color="gray.600" noOfLines={2}>
                                {metadata.description}
                              </Text>
                            </VStack>
                          </HStack>
                          
                          <Box w="full">
                            <HStack justify="space-between" mb={2}>
                              <Text fontSize="sm" fontWeight="medium">
                                {unlockedCount} de {totalCount} logros
                              </Text>
                              <Badge colorScheme={metadata.color}>
                                {progress}%
                              </Badge>
                            </HStack>
                            
                            <Progress 
                              value={progress} 
                              colorScheme={metadata.color}
                              borderRadius="full"
                              height="8px"
                            />
                          </Box>
                          
                          {unlockedCount > 0 && (
                            <HStack gap={2}>
                              <Icon as={FiStar} color="yellow.400" />
                              <Text fontSize="sm" color="gray.600">
                                {domainData?.total_points || 0} puntos ganados
                              </Text>
                            </HStack>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  );
                })}
              </Grid>
            </VStack>
          ) : (
            /* Vista Lista - Logros detallados */
            <VStack gap={6} align="stretch">
              <Tabs variant="enclosed">
                <TabList>
                  <Tab onClick={() => setState(prev => ({ ...prev, selectedDomain: null }))}>
                    Todos los Dominios
                  </Tab>
                  {Object.entries(DOMAIN_METADATA).map(([domainId, metadata]) => (
                    <Tab
                      key={domainId}
                      onClick={() => setState(prev => ({ ...prev, selectedDomain: domainId }))}
                    >
                      {metadata.name}
                    </Tab>
                  ))}
                </TabList>
                
                <TabPanels>
                  <TabPanel>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
                      {getFilteredAchievements().map(achievement => {
                        const isUnlocked = state.userAchievements.some(
                          ua => ua.achievement_id === achievement.id
                        );
                        
                        return (
                          <AchievementCard
                            key={achievement.id}
                            achievement={achievement}
                            isUnlocked={isUnlocked}
                            unlockedAt={
                              state.userAchievements.find(ua => ua.achievement_id === achievement.id)?.unlocked_at
                            }
                          />
                        );
                      })}
                    </Grid>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </VStack>
          )}

          {/* Footer motivacional */}
          <Card bg="blue.50" borderColor="blue.200" border="1px">
            <CardBody>
              <HStack gap={4} justify="center">
                <Icon as={FiZap} color="blue.500" boxSize={6} />
                <VStack align="center" gap={1}>
                  <Text fontWeight="bold" color="blue.700">
                    ¡Sigue desbloqueando logros!
                  </Text>
                  <Text fontSize="sm" color="blue.600" textAlign="center">
                    Cada acción en el sistema puede llevarte más cerca de tu próximo logro de maestría.
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
}

export { GalaxiaHabilidadesPage };