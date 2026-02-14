/**
 * CosmicBackground - Efectos de fondo cósmico optimizados
 * 
 * Versión optimizada que reduce significativamente las animaciones
 * manteniendo la experiencia visual espacial
 */

import React from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Box } from '@/shared/ui';

export const CosmicBackground: React.FC = () => {
  // Solo 20 estrellas para mejorar rendimiento
  const stars = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 2 + 1,
    color: i % 3 === 0 ? '#60A5FA' : i % 3 === 1 ? '#A78BFA' : '#F472B6'
  }));

  return (
    <LazyMotion features={domAnimation}>
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

      {/* Estrellas optimizadas - Usando CSS puro para animaciones simples */}
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
            sx={{
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite alternate`,
              '@keyframes twinkle': {
                '0%': { opacity: 0.3 },
                '100%': { opacity: 1 }
              }
            }}
          />
        ))}
      </Box>

      {/* Nebulosa sutil sin animación compleja */}
      <Box
        position="fixed"
        top="20%"
        left="10%"
        width="300px"
        height="300px"
        borderRadius="50%"
        background="radial-gradient(circle, rgba(139, 92, 246, 0.1), transparent)"
        filter="blur(40px)"
        zIndex={-2}
      />

      <Box
        position="fixed"
        top="60%"
        right="20%"
        width="400px"
        height="400px"
        borderRadius="50%"
        background="radial-gradient(circle, rgba(59, 130, 246, 0.08), transparent)"
        filter="blur(50px)"
        zIndex={-2}
      />

      {/* Efecto de brillo sutil */}
      <m.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.05), transparent 70%)',
          zIndex: -1
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </LazyMotion>
  );
};