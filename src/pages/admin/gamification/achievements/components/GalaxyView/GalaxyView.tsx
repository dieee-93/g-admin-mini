/**
 * GalaxyView - Vista de Galaxia Orbital para Logros de Maestría
 * 
 * Muestra los dominios como planetas orbitando una estrella central,
 * con navegación hacia ConstellationView para explorar logros específicos
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Box, VStack, Text, HStack, Button } from '@chakra-ui/react';
import { ConstellationView } from '../ConstellationView';
import { DOMAIN_METADATA } from '@/config/masteryAchievements';
import type { DomainProgressSummary, UserAchievement, MasteryAchievementDefinition } from '../../types';

interface GalaxyViewProps {
  domainProgress: DomainProgressSummary[];
  userAchievements: UserAchievement[];
  allAchievements: MasteryAchievementDefinition[];
  selectedDomain: string | null;
  onDomainSelect: (domain: string | null) => void;
}

// Helper function para iconos de dominio
const getDomainIcon = (domain: string): string => {
  const icons: Record<string, string> = {
    'inventory': '🔗',
    'materials': '📦',
    'products': '🍽️',
    'sales': '💰',
    'operations': '⚙️',
    'finance': '💳',
    'staff': '👥',
    'scheduling': '📅',
    'crm': '👤',
    'intelligence': '🧠',
    'settings': '⚙️',
    'dashboard': '📊'
  };
  return icons[domain] || '⭐';
};

// Helper function para formatear nombres de dominio
const formatDomainName = (domain: string): string => {
  const names: Record<string, string> = {
    'inventory': 'Inventario',
    'materials': 'Materiales',
    'products': 'Productos',
    'sales': 'Ventas',
    'operations': 'Operaciones',
    'finance': 'Finanzas',
    'staff': 'Personal',
    'scheduling': 'Programación',
    'crm': 'Gestión de Clientes',
    'intelligence': 'Inteligencia',
    'settings': 'Configuración',
    'dashboard': 'Panel de Control'
  };
  return names[domain] || domain.charAt(0).toUpperCase() + domain.slice(1);
};

export const GalaxyView: React.FC<GalaxyViewProps> = ({
  domainProgress,
  userAchievements,
  allAchievements,
  selectedDomain,
  onDomainSelect
}) => {
  if (selectedDomain) {
    // Vista de constelación específica
    return (
      <VStack gap="8" align="stretch">
        {/* Botón para volver a la galaxia */}
        <HStack>
          <Button
            variant="ghost"
            colorPalette="purple"
            onClick={() => onDomainSelect(null)}
          >
            ← Volver a la Galaxia
          </Button>
          <Text color="gray.400">
            Explorando la constelación: {selectedDomain}
          </Text>
        </HStack>
        
        {/* ConstellationView del dominio seleccionado */}
        <ConstellationView
          domain={selectedDomain}
          achievements={allAchievements.filter(a => a.domain === selectedDomain)}
          unlockedAchievements={new Set(userAchievements.map(ua => ua.achievement_id))}
          userAchievements={userAchievements}
          title={DOMAIN_METADATA[selectedDomain as keyof typeof DOMAIN_METADATA]?.name || formatDomainName(selectedDomain)}
          description={DOMAIN_METADATA[selectedDomain as keyof typeof DOMAIN_METADATA]?.description || `Logros del dominio ${selectedDomain}`}
          emoji={getDomainIcon(selectedDomain)}
        />
      </VStack>
    );
  }

  // Vista de galaxia principal
  return (
    <VStack gap="8" align="stretch">
      <Box textAlign="center" mb="6">
        <Text 
          fontSize="4xl" 
          fontWeight="bold" 
          bgGradient="linear(to-r, purple.400, blue.400, cyan.400)"
          bgClip="text"
          mb="4"
        >
          🌌 Tu Galaxia Personal
        </Text>
        <Text color="gray.300" fontSize="lg" maxW="2xl" mx="auto">
          Cada dominio es un sistema solar en tu galaxia de habilidades. 
          Haz clic en cualquier planeta para explorar sus constelaciones de logros.
        </Text>
      </Box>
      
      {/* Galaxia de dominios - Layout orbital */}
      <Box position="relative" height="600px" overflow="visible">
        {/* Centro de la galaxia */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          width="120px"
          height="120px"
          bgGradient="radial(purple.400, blue.600, transparent)"
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          border="3px solid"
          borderColor="purple.300"
          animation="pulse 4s ease-in-out infinite"
        >
          <Text fontSize="3xl" filter="brightness(1.5)">🌟</Text>
        </Box>
        
        {/* Dominios como planetas orbitando */}
        {domainProgress.map((domain, index) => {
          const metadata = DOMAIN_METADATA[domain.domain as keyof typeof DOMAIN_METADATA];
          const domainInfo = metadata || {
            name: formatDomainName(domain.domain),
            description: `Logros del dominio ${domain.domain}`,
            icon: getDomainIcon(domain.domain),
            color: 'purple'
          };
          
          // Distribución orbital
          const angle = (index / domainProgress.length) * 2 * Math.PI;
          const radius = 200 + (index % 3) * 40; // Diferentes órbitas
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          const completionPercentage = domain.total_achievements > 0 
            ? (domain.unlocked_achievements / domain.total_achievements) * 100 
            : 0;
          
          return (
            <motion.div
              key={domain.domain}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`
              }}
              whileHover={{ scale: 1.1, z: 10 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                rotate: {
                  duration: 20 + index * 5,
                  repeat: Infinity,
                  ease: "linear"
                },
                scale: { duration: 0.2 }
              }}
            >
              <Box
                width="100px"
                height="100px"
                bgGradient={completionPercentage > 0 
                  ? "radial(purple.400, blue.500, transparent)" 
                  : "radial(gray.600, gray.800, transparent)"
                }
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                border="2px solid"
                borderColor={completionPercentage > 0 ? "purple.300" : "gray.500"}
                position="relative"
                transition="all 0.3s ease"
                onClick={() => onDomainSelect(domain.domain)}
                _hover={{
                  borderColor: "cyan.300",
                  boxShadow: "0 0 30px rgba(139, 92, 246, 0.6)"
                }}
              >
                {/* Planeta emoji */}
                <Text fontSize="2xl" filter="brightness(1.3)">
                  {getDomainIcon(domain.domain)}
                </Text>
                
                {/* Anillo de progreso */}
                <Box
                  position="absolute"
                  top="-5px"
                  left="-5px"
                  width="110px"
                  height="110px"
                  borderRadius="full"
                  background={`conic-gradient(from 0deg, transparent ${100 - completionPercentage}%, purple.400 ${100 - completionPercentage}%)`}
                  mask="radial-gradient(circle at center, transparent 45px, black 50px)"
                  pointerEvents="none"
                />
                
                {/* Tooltip con información */}
                <Box
                  position="absolute"
                  bottom="-40px"
                  left="50%"
                  transform="translateX(-50%)"
                  bg="rgba(0, 0, 0, 0.8)"
                  color="white"
                  px="3"
                  py="1"
                  borderRadius="md"
                  fontSize="xs"
                  whiteSpace="nowrap"
                  opacity={0}
                  transition="opacity 0.3s ease"
                  _hover={{ opacity: 1 }}
                >
                  {domainInfo.name}
                  <br />
                  {domain.unlocked_achievements}/{domain.total_achievements} logros
                </Box>
              </Box>
            </motion.div>
          );
        })}
      </Box>
      
      {/* Leyenda de la galaxia */}
      <Box textAlign="center" mt="8">
        <Text color="gray.400" fontSize="sm">
          💡 <strong>Galaxia de Maestría:</strong> Cada planeta representa un dominio. 
          El brillo indica tu progreso. Haz clic para explorar las constelaciones de logros.
        </Text>
      </Box>
    </VStack>
  );
};