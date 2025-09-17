/**
 * Galaxia de Habilidades - Versión Simplificada
 * 
 * Componente básico que funciona sin dependencias complejas
 * para recuperar la funcionalidad previa a la migración
 */

import React, { useState } from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Grid,
  Badge,
  Icon,
  Heading,
  ButtonGroup,
  IconButton,
  Card,
  CardBody,
  Progress
} from '@chakra-ui/react';
import {
  StarIcon,
  TrophyIcon,
  CheckCircleIcon as TargetIcon,
  BoltIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Mock data simple para testing
const mockAchievements = [
  {
    id: '1',
    title: 'Primer Login',
    description: 'Realiza tu primer acceso al sistema',
    category: 'onboarding',
    points: 100,
    unlocked: true,
    progress: 100
  },
  {
    id: '2',
    title: 'Explorador de Módulos',
    description: 'Visita 3 módulos diferentes',
    category: 'exploration',
    points: 200,
    unlocked: false,
    progress: 66
  },
  {
    id: '3',
    title: 'Maestro de Datos',
    description: 'Completa 10 registros',
    category: 'data',
    points: 300,
    unlocked: false,
    progress: 30
  },
  {
    id: '4',
    title: 'Analista Avanzado',
    description: 'Genera tu primer reporte',
    category: 'analytics',
    points: 250,
    unlocked: false,
    progress: 0
  },
  {
    id: '5',
    title: 'Colaborador Estrella',
    description: 'Invita a 5 usuarios al equipo',
    category: 'collaboration',
    points: 500,
    unlocked: false,
    progress: 20
  },
  {
    id: '6',
    title: 'Configurador Pro',
    description: 'Personaliza 5 configuraciones',
    category: 'customization',
    points: 350,
    unlocked: false,
    progress: 80
  }
];

const SimpleCosmicBackground: React.FC = () => {
  const stars = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 2 + 1,
    color: i % 3 === 0 ? '#60A5FA' : i % 3 === 1 ? '#A78BFA' : '#F472B6'
  }));

  return (
    <>
      {/* Gradiente base del espacio */}
      <Box
        position="fixed"
        top={0}
        left={0}
        width="100vw"
        height="100vh"
        bgGradient="radial(circle at 30% 80%, purple.800, transparent 60%), radial(circle at 70% 20%, blue.800, transparent 60%), linear(to-br, gray.900, purple.900, blue.900)"
        zIndex={-3}
      />

      {/* Estrellas simples */}
      <Box
        position="fixed"
        top={0}
        left={0}
        width="100vw"
        height="100vh"
        zIndex={-2}
      >
        {stars.map((star) => (
          <Box
            key={star.id}
            position="absolute"
            left={`${star.left}%`}
            top={`${star.top}%`}
            width={`${star.size}px`}
            height={`${star.size}px`}
            backgroundColor={star.color}
            borderRadius="50%"
            boxShadow={`0 0 ${star.size * 4}px ${star.color}`}
            opacity={0.8}
            css={{
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite alternate`,
              '@keyframes twinkle': {
                '0%': { opacity: 0.3 },
                '100%': { opacity: 1 }
              }
            }}
          />
        ))}
      </Box>
    </>
  );
};

export default function GalaxiaHabilidadesPageSimple() {
  const [viewMode, setViewMode] = useState<'grid' | 'galaxy'>('grid');
  
  const achievements = mockAchievements;
  const totalAchievements = achievements.length;
  const completedAchievements = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);
  const inProgressCount = achievements.filter(a => !a.unlocked && a.progress > 0).length;

  const handleViewModeSwitch = (mode: 'grid' | 'galaxy') => {
    setViewMode(mode);
  };

  return (
    <LazyMotion features={domAnimation}>
      <Box 
        position="relative" 
        minHeight="100vh" 
        bg="rgba(15, 23, 42, 0.9)"
        overflow="hidden"
      >
        <SimpleCosmicBackground />
        
        <Container maxW="7xl" py={8} position="relative" zIndex={3}>
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <Box
              bg="linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)"
              backdropFilter="blur(12px)"
              border="1px solid rgba(255, 255, 255, 0.1)"
              borderRadius="20px"
              p={6}
              mb={8}
              boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
            >
              <VStack spacing={4}>
                <HStack spacing={3}>
                  <Icon as={StarIcon} boxSize={8} color="purple.400" />
                  <Heading 
                    size="xl" 
                    bgGradient="linear(to-r, purple.400, pink.400)"
                    bgClip="text"
                    fontWeight="bold"
                  >
                    🌌 Galaxia de Habilidades
                  </Heading>
                </HStack>
                <Text color="gray.300" fontSize="lg" textAlign="center">
                  Explora tu universo de logros empresariales. Cada habilidad desbloqueada es una estrella en tu constelación del éxito.
                </Text>
                
                <ButtonGroup size="md" colorScheme="purple" variant="outline">
                  <IconButton
                    aria-label="Vista Galaxia"
                    icon={<Icon as={BoltIcon} />}
                    onClick={() => handleViewModeSwitch('galaxy')}
                    colorPalette={viewMode === 'galaxy' ? 'purple' : 'gray'}
                    bg={viewMode === 'galaxy' ? 'purple.600' : 'transparent'}
                    _hover={{ bg: 'purple.500', transform: 'scale(1.05)' }}
                    transition="all 0.2s"
                  />
                  <IconButton
                    aria-label="Vista Cuadrícula"
                    icon={<Icon as={ArrowPathIcon} />}
                    onClick={() => handleViewModeSwitch('grid')}
                    colorPalette={viewMode === 'grid' ? 'purple' : 'gray'}
                    bg={viewMode === 'grid' ? 'purple.600' : 'transparent'}
                    _hover={{ bg: 'purple.500', transform: 'scale(1.05)' }}
                    transition="all 0.2s"
                  />
                </ButtonGroup>
              </VStack>
            </Box>

            {/* Estadísticas */}
            <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={6} mb={8}>
              <Card
                bg="linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)"
                backdropFilter="blur(12px)"
                border="1px solid rgba(255, 255, 255, 0.1)"
              >
                <CardBody p={6}>
                  <VStack spacing={2}>
                    <HStack spacing={3}>
                      <Icon as={TrophyIcon} boxSize={6} color="blue.400" />
                      <Text fontSize="sm" color="gray.300" fontWeight="medium">
                        Total Logros
                      </Text>
                    </HStack>
                    <Text fontSize="3xl" fontWeight="bold" color="white">
                      {totalAchievements}
                    </Text>
                    <Text fontSize="sm" color="blue.300">
                      En toda la galaxia
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card
                bg="linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)"
                backdropFilter="blur(12px)"
                border="1px solid rgba(255, 255, 255, 0.1)"
              >
                <CardBody p={6}>
                  <VStack spacing={2}>
                    <HStack spacing={3}>
                      <Icon as={TargetIcon} boxSize={6} color="green.400" />
                      <Text fontSize="sm" color="gray.300" fontWeight="medium">
                        Completados
                      </Text>
                    </HStack>
                    <Text fontSize="3xl" fontWeight="bold" color="white">
                      {completedAchievements}
                    </Text>
                    <Text fontSize="sm" color="green.300">
                      {Math.round((completedAchievements / totalAchievements) * 100)}% completo
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card
                bg="linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(239, 68, 68, 0.1) 100%)"
                backdropFilter="blur(12px)"
                border="1px solid rgba(255, 255, 255, 0.1)"
              >
                <CardBody p={6}>
                  <VStack spacing={2}>
                    <HStack spacing={3}>
                      <Icon as={BoltIcon} boxSize={6} color="yellow.400" />
                      <Text fontSize="sm" color="gray.300" fontWeight="medium">
                        En Progreso
                      </Text>
                    </HStack>
                    <Text fontSize="3xl" fontWeight="bold" color="white">
                      {inProgressCount}
                    </Text>
                    <Text fontSize="sm" color="yellow.300">
                      Activos ahora
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card
                bg="linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)"
                backdropFilter="blur(12px)"
                border="1px solid rgba(255, 255, 255, 0.1)"
              >
                <CardBody p={6}>
                  <VStack spacing={2}>
                    <HStack spacing={3}>
                      <Icon as={StarIcon} boxSize={6} color="purple.400" />
                      <Text fontSize="sm" color="gray.300" fontWeight="medium">
                        Puntos XP
                      </Text>
                    </HStack>
                    <Text fontSize="3xl" fontWeight="bold" color="white">
                      {totalPoints.toLocaleString()}
                    </Text>
                    <Text fontSize="sm" color="purple.300">
                      Experiencia total
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </Grid>

            {/* Lista de Logros */}
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
              {achievements.map((achievement) => (
                <m.div
                  key={achievement.id}
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    bg={achievement.unlocked 
                      ? "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)"
                      : "linear-gradient(135deg, rgba(71, 85, 105, 0.1) 0%, rgba(100, 116, 139, 0.1) 100%)"
                    }
                    backdropFilter="blur(12px)"
                    border="1px solid rgba(255, 255, 255, 0.1)"
                    h="full"
                  >
                    <CardBody p={6}>
                      <VStack spacing={4} align="start">
                        <HStack justify="space-between" w="full">
                          <Icon 
                            as={achievement.unlocked ? TrophyIcon : StarIcon} 
                            boxSize={8} 
                            color={achievement.unlocked ? "green.400" : "gray.400"} 
                          />
                          <Badge
                            colorScheme={achievement.unlocked ? "green" : "gray"}
                            variant="subtle"
                          >
                            {achievement.points} XP
                          </Badge>
                        </HStack>
                        
                        <VStack spacing={2} align="start" w="full">
                          <Text 
                            fontSize="lg" 
                            fontWeight="bold" 
                            color={achievement.unlocked ? "white" : "gray.300"}
                          >
                            {achievement.title}
                          </Text>
                          <Text fontSize="sm" color="gray.400">
                            {achievement.description}
                          </Text>
                        </VStack>

                        <Box w="full">
                          <HStack justify="space-between" mb={2}>
                            <Text fontSize="xs" color="gray.400">
                              Progreso
                            </Text>
                            <Text fontSize="xs" color="gray.400">
                              {achievement.progress}%
                            </Text>
                          </HStack>
                          <Progress 
                            value={achievement.progress} 
                            colorScheme={achievement.unlocked ? "green" : "purple"}
                            size="sm"
                            borderRadius="full"
                          />
                        </Box>
                      </VStack>
                    </CardBody>
                  </Card>
                </m.div>
              ))}
            </Grid>
          </m.div>
        </Container>
      </Box>
    </LazyMotion>
  );
}