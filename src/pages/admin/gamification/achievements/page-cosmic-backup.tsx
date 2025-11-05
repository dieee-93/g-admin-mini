/**
 * Galaxia de Habilidades - Versión Simplificada
 * 
 * Componente básico que funciona sin dependencias complejas
 * para recuperar la funcionalidad previa a la migración
 */

import React, { useState } from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import {
  Progress, ButtonGroup, IconButton, Badge, Box, Container, VStack, HStack, Grid, Heading,
  Text
} from '@chakra-ui/react';
import { CardWrapper, Typography } from '@/shared/ui';
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
        
        <Container maxW="7xl" py="8" position="relative" zIndex={3}>
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
              p="6"
              mb="8"
              boxShadow="0 8px 32px rgba(0, 0, 0, 0.3)"
            >
              <VStack gap="4">
                <HStack gap="3">
                  <StarIcon width={32} height={32} color="rgb(196 181 253)" />
                  <Heading 
                    size="xl" 
                    bgGradient="linear(to-r, purple.400, pink.400)"
                    bgClip="text"
                    fontWeight="bold"
                  >
                    🌌 Galaxia de Habilidades
                  </Heading>
                </HStack>
                <Typography variant="body" size="lg" color="gray.300" textAlign="center">
                  Explora tu universo de logros empresariales. Cada habilidad desbloqueada es una estrella en tu constelación del éxito.
                </Typography>
                
                <ButtonGroup size="md" colorPalette="purple" variant="outline">
                  <IconButton
                    aria-label="Vista Galaxia"
                    onClick={() => handleViewModeSwitch('galaxy')}
                    colorPalette={viewMode === 'galaxy' ? 'purple' : 'gray'}
                    bg={viewMode === 'galaxy' ? 'purple.600' : 'transparent'}
                    _hover={{ bg: 'purple.500', transform: 'scale(1.05)' }}
                    transition="all 0.2s"
                  >
                    <BoltIcon width={20} height={20} />
                  </IconButton>
                  <IconButton
                    aria-label="Vista Cuadrícula"
                    onClick={() => handleViewModeSwitch('grid')}
                    colorPalette={viewMode === 'grid' ? 'purple' : 'gray'}
                    bg={viewMode === 'grid' ? 'purple.600' : 'transparent'}
                    _hover={{ bg: 'purple.500', transform: 'scale(1.05)' }}
                    transition="all 0.2s"
                  >
                    <ArrowPathIcon width={20} height={20} />
                  </IconButton>
                </ButtonGroup>
              </VStack>
            </Box>

            {/* Estadísticas */}
            <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap="6" mb="8">
              <CardWrapper
                bg="linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)"
                backdropFilter="blur(12px)"
                border="1px solid rgba(255, 255, 255, 0.1)"
              >
                <CardWrapper.Body p="6">
                  <VStack gap="2">
                    <HStack gap="3">
                      <TrophyIcon width={24} height={24} color="rgb(96 165 250)" />
                      <Typography variant="body" fontSize="sm" color="gray.300" fontWeight="medium">
                        Total Logros
                      </Typography>
                    </HStack>
                    <Typography variant="body" fontSize="3xl" fontWeight="bold" color="white">
                      {totalAchievements}
                    </Typography>
                    <Typography variant="body" fontSize="sm" color="blue.300">
                      En toda la galaxia
                    </Typography>
                  </VStack>
                </CardWrapper.Body>
              </CardWrapper>

              <CardWrapper
                bg="linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)"
                backdropFilter="blur(12px)"
                border="1px solid rgba(255, 255, 255, 0.1)"
              >
                <CardWrapper.Body p="6">
                  <VStack gap="2">
                    <HStack gap="3">
                      <TargetIcon width={24} height={24} color="rgb(74 222 128)" />
                      <Typography variant="body" fontSize="sm" color="gray.300" fontWeight="medium">
                        Completados
                      </Typography>
                    </HStack>
                    <Typography variant="body" fontSize="3xl" fontWeight="bold" color="white">
                      {completedAchievements}
                    </Typography>
                    <Typography variant="body" fontSize="sm" color="green.300">
                      {Math.round((completedAchievements / totalAchievements) * 100)}% completo
                    </Typography>
                  </VStack>
                </CardWrapper.Body>
              </CardWrapper>

              <CardWrapper
                bg="linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(239, 68, 68, 0.1) 100%)"
                backdropFilter="blur(12px)"
                border="1px solid rgba(255, 255, 255, 0.1)"
              >
                <CardWrapper.Body p="6">
                  <VStack gap="2">
                    <HStack gap="3">
                      <BoltIcon width={24} height={24} color="rgb(250 204 21)" />
                      <Typography variant="body" fontSize="sm" color="gray.300" fontWeight="medium">
                        En Progreso
                      </Typography>
                    </HStack>
                    <Typography variant="body" fontSize="3xl" fontWeight="bold" color="white">
                      {inProgressCount}
                    </Typography>
                    <Typography variant="body" fontSize="sm" color="yellow.300">
                      Activos ahora
                    </Typography>
                  </VStack>
                </CardWrapper.Body>
              </CardWrapper>

              <CardWrapper
                bg="linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)"
                backdropFilter="blur(12px)"
                border="1px solid rgba(255, 255, 255, 0.1)"
              >
                <CardWrapper.Body p="6">
                  <VStack gap="2">
                    <HStack gap="3">
                      <StarIcon width={24} height={24} color="rgb(196 181 253)" />
                      <Typography variant="body" fontSize="sm" color="gray.300" fontWeight="medium">
                        Puntos XP
                      </Typography>
                    </HStack>
                    <Typography variant="body" fontSize="3xl" fontWeight="bold" color="white">
                      {totalPoints.toLocaleString()}
                    </Typography>
                    <Typography variant="body" fontSize="sm" color="purple.300">
                      Experiencia total
                    </Typography>
                  </VStack>
                </CardWrapper.Body>
              </CardWrapper>
            </Grid>

            {/* Lista de Logros */}
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap="6">
              {achievements.map((achievement) => (
                <m.div
                  key={achievement.id}
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardWrapper
                    bg={achievement.unlocked 
                      ? "linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)"
                      : "linear-gradient(135deg, rgba(71, 85, 105, 0.1) 0%, rgba(100, 116, 139, 0.1) 100%)"
                    }
                    backdropFilter="blur(12px)"
                    border="1px solid rgba(255, 255, 255, 0.1)"
                    h="full"
                  >
                    <CardWrapper.Body p="6">
                      <VStack gap="4" align="start">
                        <HStack justify="space-between" w="full">
                          <Icon 
                            as={achievement.unlocked ? TrophyIcon : StarIcon} 
                            size="xl" 
                            color={achievement.unlocked ? "green.400" : "gray.400"} 
                          />
                          <Badge
                            colorPalette={achievement.unlocked ? "green" : "gray"}
                            variant="subtle"
                          >
                            {achievement.points} XP
                          </Badge>
                        </HStack>
                        
                        <VStack gap="2" align="start" w="full">
                          <Typography variant="body" 
                            fontSize="lg" 
                            fontWeight="bold" 
                            color={achievement.unlocked ? "white" : "gray.300"}
                          >
                            {achievement.title}
                          </Typography>
                          <Typography variant="body" fontSize="sm" color="gray.400">
                            {achievement.description}
                          </Typography>
                        </VStack>

                        <Box w="full">
                          <HStack justify="space-between" mb="2">
                            <Typography variant="body" fontSize="xs" color="gray.400">
                              Progreso
                            </Typography>
                            <Typography variant="body" fontSize="xs" color="gray.400">
                              {achievement.progress}%
                            </Typography>
                          </HStack>
                          <Progress 
                            value={achievement.progress} 
                            colorPalette={achievement.unlocked ? "green" : "purple"}
                            size="sm"
                            borderRadius="full"
                          />
                        </Box>
                      </VStack>
                    </CardWrapper.Body>
                  </CardWrapper>
                </m.div>
              ))}
            </Grid>
          </m.div>
        </Container>
      </Box>
    </LazyMotion>
  );
}
