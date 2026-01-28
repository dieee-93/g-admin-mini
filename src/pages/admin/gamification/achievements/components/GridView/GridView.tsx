/**
 * GridView - Vista tradicional en grilla para Logros de Maestría
 * 
 * Muestra los dominios en tarjetas organizadas en una grilla,
 * con información detallada de progreso y estadísticas
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  SimpleGrid,
  Badge,
  Icon
} from '@chakra-ui/react';
import { DOMAIN_METADATA } from '@/config/masteryAchievements';
import type { DomainProgressSummary } from '../../types';

import { logger } from '@/lib/logging';
interface GridViewProps {
  domainProgress: DomainProgressSummary[];
  onDomainSelect: (domain: string) => void;
  cardBg: string;
  cardBorder: string;
  glowColor: string;
}

// Helper functions
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

export const GridView: React.FC<GridViewProps> = ({
  domainProgress,
  onDomainSelect,
  cardBg,
  cardBorder,
  glowColor
}) => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="8">
      {/* Debug: Mostrar información del estado */}
      {domainProgress.length === 0 && (
        <Box p="8" bg="red.900" color="white" borderRadius="xl" gridColumn="1 / -1">
          <VStack gap="2">
            <Text fontSize="xl" fontWeight="bold">🔍 DEBUG: Sin datos de dominios</Text>
            <Text fontSize="sm">domainProgress.length: {domainProgress.length}</Text>
          </VStack>
        </Box>
      )}
      
      {domainProgress.map((domain) => {
        const metadata = DOMAIN_METADATA[domain.domain as keyof typeof DOMAIN_METADATA];
        
        // Debug individual domain
        logger.info('CapabilitySystem', `🔍 Domain: ${domain.domain}`, { domain, metadata });
        
        // Si no hay metadata, usar valores por defecto
        const domainInfo = metadata || {
          name: formatDomainName(domain.domain),
          description: `Logros del dominio ${domain.domain}`,
          icon: getDomainIcon(domain.domain),
          color: 'purple'
        };
        
        return (
          <Box
            key={domain.domain}
            p="8"
            bg={cardBg}
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="2xl"
            position="relative"
            cursor="pointer"
            transition="all 0.4s ease"
            _hover={{
              transform: "translateY(-8px) scale(1.02)",
              boxShadow: `0 20px 40px rgba(139, 92, 246, 0.3)`,
              borderColor: glowColor,
              bg: "rgba(255, 255, 255, 0.08)"
            }}
            onClick={() => onDomainSelect(domain.domain)}
          >
            {/* Efecto de partículas flotantes */}
            <Box
              position="absolute"
              top={2}
              right={2}
              width="60px"
              height="60px"
              bgGradient="radial(purple.400, transparent)"
              borderRadius="full"
              opacity={0.3}
              filter="blur(20px)"
              animation="pulse 3s ease-in-out infinite"
            />
            
            <VStack gap="6" align="center">
              {/* Ícono de constelación */}
              <Box position="relative">
                <Box
                  p="4"
                  bg="rgba(139, 92, 246, 0.2)"
                  borderRadius="2xl"
                  border="1px solid"
                  borderColor="purple.400"
                  backdropFilter="blur(10px)"
                >
                  <Text fontSize="4xl" role="img" aria-label={domainInfo.name}>
                    {getDomainIcon(domain.domain)}
                  </Text>
                </Box>
              </Box>
              
              {/* Información del dominio */}
              <VStack gap="3" textAlign="center">
                <Text 
                  fontSize="xl" 
                  fontWeight="bold" 
                  color="white"
                  textShadow="0 0 10px rgba(255, 255, 255, 0.3)"
                >
                  {metadata.name}
                </Text>
                
                <HStack justify="center" gap="4">
                  <VStack gap="1">
                    <Text fontSize="2xl" fontWeight="bold" color="purple.300">
                      {domain.total_achievements}
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      LOGROS
                    </Text>
                  </VStack>
                  
                  <Box width="1px" height="40px" bg="gray.600" />
                  
                  <VStack gap="1">
                    <Text fontSize="2xl" fontWeight="bold" color="cyan.300">
                      {domain.unlocked_achievements}
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      DESBLOQUEADOS
                    </Text>
                  </VStack>
                </HStack>
                
                {/* Barra de progreso cósmica */}
                <Box width="100%" position="relative">
                  <Box
                    height="8px"
                    bg="rgba(255, 255, 255, 0.1)"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <Box
                      height="100%"
                      width={`${domain.total_achievements > 0 ? (domain.unlocked_achievements / domain.total_achievements) * 100 : 0}%`}
                      bgGradient="linear(to-r, purple.500, cyan.400)"
                      borderRadius="full"
                      position="relative"
                    />
                  </Box>
                  
                  <Text fontSize="xs" color="gray.400" mt="2" textAlign="center">
                    {domain.total_achievements > 0 ? Math.round((domain.unlocked_achievements / domain.total_achievements) * 100) : 0}% completado
                  </Text>
                </Box>
              </VStack>
            </VStack>
          </Box>
        );
      })}
    </SimpleGrid>
  );
};