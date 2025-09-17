/**
 * Galaxia de Habilidades - Página Principal Optimizada
 * 
 * Página orquestadora que utiliza componentes modulares y hook centralizado
 * para mostrar el sistema de logros con metáfora de galaxia espacial.
 * Optimizada para mejor rendimiento con LazyMotion y animaciones eficientes.
 */

import React, { useEffect, useState } from 'react';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Grid,
  Badge,
  Icon,
  Stat,
  Spinner,
  Flex,
  Heading,
  Switch,
  ButtonGroup,
  IconButton
} from '@chakra-ui/react';
import { Button, Alert, AlertDescription } from '@/shared/ui';
import {
  StarIcon,
  TrophyIcon,
  CheckCircleIcon as TargetIcon,
  BoltIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Importaciones modulares
import { useAchievementsPage } from './hooks';
import {
  CosmicBackground,
  GalaxyView,
  GridView,
  FoundationalProgress
} from './components';
import { usePerformanceMonitor, PerformanceDebugger } from '@/lib/performance/PerformanceMonitor';

export default function GalaxiaHabilidadesPage() {
  // Detectar preferencias de movimiento reducido para optimizar rendimiento
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Monitor de rendimiento
  const { shouldReduceAnimations, shouldDisableAnimations, getOptimizedAnimationProps } = usePerformanceMonitor();

  // Hook orquestador con toda la lógica
  const {
    state,
    stats,
    loadAchievementData,
    setAchievementMode,
    setViewMode,
    setSelectedDomain,
    isLoading,
    error
  } = useAchievementsPage();

  // Estado para efectos interactivos (optimizado)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseMoving, setIsMouseMoving] = useState(false);

  // Optimización de efectos de cursor basada en preferencias y rendimiento
  useEffect(() => {
    if (prefersReducedMotion || shouldReduceAnimations) return; // Skip mouse tracking si hay problemas de rendimiento
    
    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsMouseMoving(true);
      
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsMouseMoving(false), 150);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [prefersReducedMotion, shouldReduceAnimations]);

  // Estilos del tema cósmico mejorados
  const backgroundGradient = "linear(to-br, gray.900, purple.900, blue.900)";
  const cardBg = 'rgba(255, 255, 255, 0.08)';
  const cardBorder = 'rgba(255, 255, 255, 0.15)';
  const cardGlow = '0 4px 20px rgba(139, 92, 246, 0.2)';
  const glowColor = 'rgba(139, 92, 246, 0.5)';

  // Variantes de animación optimizadas dinámicamente
  const shouldAnimate = !prefersReducedMotion && !shouldDisableAnimations;
  const animationDuration = shouldReduceAnimations ? 0.2 : 0.5;
  
  const containerVariants = getOptimizedAnimationProps({
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldAnimate ? (shouldReduceAnimations ? 0.05 : 0.1) : 0
      }
    }
  });

  const itemVariants = getOptimizedAnimationProps({
    hidden: { opacity: 0, y: shouldAnimate ? 20 : 0 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: animationDuration } 
    }
  });

  const statsCardVariants = getOptimizedAnimationProps({
    hidden: { 
      opacity: 0, 
      scale: shouldAnimate ? 0.9 : 1, 
      y: shouldAnimate ? 20 : 0 
    },
    show: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        duration: animationDuration,
        type: shouldReduceAnimations ? "tween" as const : "spring" as const,
        stiffness: 100
      }
    },
    hover: { 
      scale: shouldAnimate ? 1.08 : 1,
      y: shouldAnimate ? -8 : 0,
      rotateY: shouldAnimate ? 5 : 0,
      transition: { 
        duration: 0.3,
        type: "spring" as const,
        stiffness: 300
      }
    }
  });

  // Función para renderizar el contenido principal
  const renderContent = () => {
    if (isLoading) {
      return (
        <VStack gap={8} py={20}>
          <Spinner size="xl" colorPalette="blue" />
          <Text color="gray.400" fontSize="lg">
            Cargando tu galaxia de habilidades...
          </Text>
        </VStack>
      );
    }

    if (error) {
      return (
        <VStack gap={6} py={20}>
          <Alert status="error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={loadAchievementData} colorPalette="blue">
            Reintentar
          </Button>
        </VStack>
      );
    }

    return (
      <LazyMotion features={domAnimation}>
        <m.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
        {/* Header de la Galaxia */}
        <m.div variants={itemVariants}>
          <VStack gap={6} textAlign="center" mb={12}>
            
            <m.div
              animate={{
                textShadow: [
                  "0 0 20px rgba(139, 92, 246, 0.5)",
                  "0 0 40px rgba(59, 130, 246, 0.8)",
                  "0 0 60px rgba(139, 92, 246, 0.5)",
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Text 
                fontSize="4xl" 
                fontWeight="bold" 
                color="white"
                textAlign="center"
                mb={4}
                bgGradient="linear(to-r, white, cyan.200, white)"
                bgClip="text"
              >
                🌌 Galaxia de Habilidades
              </Text>
            </m.div>
            
            <Text 
              fontSize="lg" 
              color="gray.200" 
              maxW="3xl" 
              textAlign="center"
              lineHeight="1.6"
            >
              Explora tu universo de logros empresariales. Cada habilidad desbloqueada 
              es una estrella en tu constelación del éxito.
            </Text>
          </VStack>
        </m.div>

        {/* Estadísticas dinámicas */}
        <m.div variants={itemVariants}>
          <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={6} mb={12}>
            {/* Total Achievements */}
            <m.div variants={statsCardVariants} whileHover="hover">
              <Box
                p={6}
                bg={cardBg} 
                borderRadius="xl"
                border="2px solid"
                borderColor={cardBorder}
                textAlign="center"
                boxShadow={cardGlow}
                position="relative"
                bgGradient="linear(135deg, rgba(139, 92, 246, 0.1), transparent, rgba(59, 130, 246, 0.1))"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: "absolute",
                  top: "-2px",
                  left: "-2px",
                  right: "-2px", 
                  bottom: "-2px",
                  background: "linear-gradient(45deg, rgba(139, 92, 246, 0.5), rgba(59, 130, 246, 0.5), rgba(139, 92, 246, 0.5))",
                  borderRadius: "xl",
                  zIndex: -1,
                  filter: "blur(3px)"
                }}
              >
                <Stat.Root>
                  <VStack gap={2}>
                    <Icon as={StarIcon} boxSize={8} color="blue.400" />
                    <Stat.ValueText color="white" fontSize="2xl" fontWeight="bold">
                      {stats.total.allAchievements}
                    </Stat.ValueText>
                    <Stat.HelpText color="gray.400" fontSize="xs">
                      {state.achievementMode === 'foundational' ? 'HITOS TOTALES' : 'LOGROS TOTALES'}
                    </Stat.HelpText>
                  </VStack>
                </Stat.Root>
              </Box>
            </m.div>

            {/* Unlocked Achievements */}
            <m.div variants={statsCardVariants} whileHover="hover">
              <Box
                p={6}
                bg={cardBg} 
                borderRadius="xl"
                border="2px solid"
                borderColor={cardBorder}
                textAlign="center"
                boxShadow={cardGlow}
                bgGradient="linear(135deg, rgba(255, 193, 7, 0.1), transparent, rgba(255, 152, 0, 0.1))"
              >
                <Stat.Root>
                  <VStack gap={2}>
                    <Icon as={TrophyIcon} boxSize={8} color="yellow.400" />
                    <Stat.ValueText color="white" fontSize="2xl" fontWeight="bold">
                      {stats.total.unlockedAchievements}
                    </Stat.ValueText>
                    <Stat.HelpText color="gray.400" fontSize="xs">
                      {state.achievementMode === 'foundational' ? 'HITOS COMPLETADOS' : 'LOGROS DESBLOQUEADOS'}
                    </Stat.HelpText>
                  </VStack>
                </Stat.Root>
              </Box>
            </m.div>

            {/* Completion Percentage */}
            <m.div variants={statsCardVariants} whileHover="hover">
              <Box
                p={6}
                bg={cardBg} 
                borderRadius="xl"
                border="2px solid"
                borderColor={cardBorder}
                textAlign="center"
                boxShadow={cardGlow}
                bgGradient="linear(135deg, rgba(34, 197, 94, 0.1), transparent, rgba(21, 128, 61, 0.1))"
              >
                <Stat.Root>
                  <VStack gap={2}>
                    <Icon as={TargetIcon} boxSize={8} color="green.400" />
                    <Stat.ValueText color="white" fontSize="2xl" fontWeight="bold">
                      {stats.total.completionPercentage}%
                    </Stat.ValueText>
                    <Stat.HelpText color="gray.400" fontSize="xs">
                      PROGRESO GLOBAL
                    </Stat.HelpText>
                  </VStack>
                </Stat.Root>
              </Box>
            </m.div>

            {/* Active Domains/Capabilities */}
            <m.div variants={statsCardVariants} whileHover="hover">
              <Box
                p={6}
                bg={cardBg} 
                borderRadius="xl"
                border="2px solid"
                borderColor={cardBorder}
                textAlign="center"
                boxShadow={cardGlow}
                bgGradient="linear(135deg, rgba(168, 85, 247, 0.1), transparent, rgba(147, 51, 234, 0.1))"
              >
                <Stat.Root>
                  <VStack gap={2}>
                    <Badge size="lg" colorPalette="purple" variant="solid">
                      {state.achievementMode === 'foundational' 
                        ? (stats.modeSpecific?.completedMilestones || 0)
                        : state.domainProgress.filter((d: any) => d.unlocked_achievements > 0).length
                      }
                    </Badge>
                    <Stat.ValueText color="white" fontSize="2xl" fontWeight="bold">
                      {state.achievementMode === 'foundational' 
                        ? (stats.modeSpecific?.completedMilestones || 0)
                        : state.domainProgress.filter((d: any) => d.unlocked_achievements > 0).length
                      }
                    </Stat.ValueText>
                    <Stat.HelpText color="gray.400" fontSize="xs">
                      {state.achievementMode === 'foundational' 
                        ? `de ${stats.modeSpecific?.totalMilestones || 0} hitos`
                        : `de ${state.domainProgress.length} dominios`
                      }
                    </Stat.HelpText>
                  </VStack>
                </Stat.Root>
              </Box>
            </m.div>
          </Grid>
        </m.div>

        {/* Navegación entre tipos de logros */}
        <HStack justify="space-between" wrap="wrap" gap={6} mb={8}>
          <HStack gap={3}>
            <Text fontSize="lg" color="gray.300" fontWeight="medium">
              🌌 Explora tu Galaxia de Habilidades:
            </Text>
            <Button
              variant={state.achievementMode === 'foundational' ? 'solid' : 'outline'}
              colorPalette="blue"
              size="lg"
              onClick={() => setAchievementMode('foundational')}
            >
              <BoltIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />
              ⚡ Hitos Fundacionales
            </Button>
            <Button
              variant={state.achievementMode === 'mastery' ? 'solid' : 'outline'}
              colorPalette="yellow"
              size="lg"
              onClick={() => setAchievementMode('mastery')}
            >
              <TrophyIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />
              🏆 Logros de Maestría
            </Button>
          </HStack>
          
          <HStack gap={3}>
            <Button
              variant="ghost"
              size="lg"
              onClick={loadAchievementData}
            >
              <ArrowPathIcon style={{ width: '20px', height: '20px', marginRight: '8px' }} />
              Actualizar
            </Button>
            
            {/* Selector de vista solo para mastery */}
            {state.achievementMode === 'mastery' && (
              <HStack gap={2}>
                <Text fontSize="sm" color="gray.400">Vista:</Text>
                <Button
                  variant={state.viewMode === 'galaxy' ? 'solid' : 'outline'}
                  colorPalette="purple"
                  size="sm"
                  onClick={() => setViewMode('galaxy')}
                >
                  🌌 Galaxia
                </Button>
                <Button
                  variant={state.viewMode === 'grid' ? 'solid' : 'outline'}
                  colorPalette="purple"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  📋 Grid
                </Button>
              </HStack>
            )}
          </HStack>
        </HStack>

        {/* Contenido principal - Visualización que cambia según el modo */}
        <VStack gap={8} align="stretch">
          <Box textAlign="center" position="relative">
            {/* Efecto de nebulosa de fondo */}
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              width="600px"
              height="300px"
              bgGradient={state.achievementMode === 'foundational' 
                ? "radial(blue.500, cyan.400, transparent)"
                : "radial(yellow.500, orange.400, transparent)"
              }
              opacity={0.2}
              filter="blur(80px)"
              zIndex={0}
            />
            
            <VStack gap={3} position="relative" zIndex={1}>
              <Text 
                fontSize="3xl" 
                fontWeight="bold" 
                color="white"
                textShadow="0 0 20px rgba(139, 92, 246, 0.8)"
              >
                {state.achievementMode === 'foundational' 
                  ? "⚡ Activación de Capacidades" 
                  : "🏆 Constelaciones de Maestría"
                }
              </Text>
              <Text fontSize="lg" color="gray.300">
                {state.achievementMode === 'foundational' 
                  ? "Convierte tus capacidades latentes en activas completando hitos específicos"
                  : "Cada dominio es una constelación llena de logros esperando ser descubiertos"
                }
              </Text>
            </VStack>
          </Box>
          
          {/* Botones de toggle de vista - Solo en modo mastery */}
          {state.achievementMode === 'mastery' && (
            <HStack justify="center" gap={4}>
              <Button
                onClick={() => setViewMode('galaxy')}
                variant={state.viewMode === 'galaxy' ? 'solid' : 'outline'}
                colorPalette="purple"
                size="lg"
              >
                🌌 Vista Galaxia
              </Button>
              
              <Button
                onClick={() => setViewMode('grid')}
                variant={state.viewMode === 'grid' ? 'solid' : 'outline'}
                colorPalette="blue"
                size="lg"
              >
                📊 Vista Grid
              </Button>
            </HStack>
          )}
          
          {/* Renderizado condicional según el modo */}
          <AnimatePresence mode="wait">
            {state.achievementMode === 'foundational' ? (
              <m.div
                key="foundational"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <FoundationalProgress
                  foundationalProgress={state.foundationalProgress}
                  cardBg={cardBg}
                  cardBorder={cardBorder}
                />
              </m.div>
            ) : (
              <m.div
                key="mastery"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {state.viewMode === 'galaxy' ? (
                  <GalaxyView
                    domainProgress={state.domainProgress}
                    userAchievements={state.userAchievements}
                    allAchievements={state.allAchievements}
                    selectedDomain={state.selectedDomain}
                    onDomainSelect={setSelectedDomain}
                  />
                ) : (
                  <GridView
                    domainProgress={state.domainProgress}
                    onDomainSelect={setSelectedDomain}
                    cardBg={cardBg}
                    cardBorder={cardBorder}
                    glowColor={glowColor}
                  />
                )}
              </m.div>
            )}
          </AnimatePresence>
        </VStack>
      </m.div>
      </LazyMotion>
    );
  };

  return (
    <Box
      minHeight="100vh"
      width="100vw"
      position="relative"
      overflow="hidden"
      background={backgroundGradient}
    >
      {/* Efectos de fondo cósmico */}
      <CosmicBackground />
      
      {/* Partículas que siguen el cursor - Solo si no hay preferencias de movimiento reducido ni problemas de rendimiento */}
      {!prefersReducedMotion && !shouldReduceAnimations && isMouseMoving && (
        <m.div
          style={{
            position: 'fixed',
            left: mousePosition.x - 2,
            top: mousePosition.y - 2,
            width: '4px',
            height: '4px',
            backgroundColor: 'rgba(139, 92, 246, 0.8)',
            borderRadius: '50%',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.6)',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
          animate={{
            scale: [1, 2, 0],
            opacity: [1, 0.6, 0],
          }}
          transition={{
            duration: 0.6,
            ease: "easeOut"
          }}
        />
      )}
      
      <Container maxW="8xl" position="relative" zIndex={2} py={8}>
        <VStack gap={8} align="stretch">
          {renderContent()}
        </VStack>
      </Container>
      
      {/* Debug de rendimiento (solo en desarrollo) */}
      <PerformanceDebugger />
    </Box>
  );
}
