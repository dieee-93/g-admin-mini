/**
 * CosmicBackground - Efectos de fondo cósmico ultra-optimizados
 * 
 * Versión que combina CSS animations nativas con minimal Framer Motion
 * para máximo rendimiento
 */

import React from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { Box } from '@/shared/ui';

export const CosmicBackground: React.FC = () => {
  // Solo 15 estrellas para rendimiento óptimo
  const stars = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 2 + 1,
    color: i % 3 === 0 ? '#60A5FA' : i % 3 === 1 ? '#A78BFA' : '#F472B6',
    duration: 2 + Math.random() * 3
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

      {/* Estrellas ultra-optimizadas - Solo CSS animations */}
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
            willChange="opacity"
            css={{
              animation: `twinkle-${star.id} ${star.duration}s ease-in-out infinite alternate`,
              [`@keyframes twinkle-${star.id}`]: {
                '0%': { opacity: 0.3, transform: 'scale(1)' },
                '50%': { opacity: 1, transform: 'scale(1.1)' },
                '100%': { opacity: 0.6, transform: 'scale(1)' }
              }
            }}
          />
        ))}
      </Box>

      {/* Nebulosas estáticas optimizadas */}
      <Box
        position="fixed"
        top="20%"
        left="10%"
        width="250px"
        height="250px"
        borderRadius="50%"
        background="radial-gradient(circle, rgba(139, 92, 246, 0.08), transparent)"
        filter="blur(30px)"
        zIndex={-2}
        willChange="opacity"
        css={{
          animation: 'nebula-pulse 8s ease-in-out infinite',
          '@keyframes nebula-pulse': {
            '0%, 100%': { opacity: 0.4 },
            '50%': { opacity: 0.7 }
          }
        }}
      />

      <Box
        position="fixed"
        top="60%"
        right="20%"
        width="300px"
        height="300px"
        borderRadius="50%"
        background="radial-gradient(circle, rgba(59, 130, 246, 0.06), transparent)"
        filter="blur(40px)"
        zIndex={-2}
        willChange="opacity"
        css={{
          animation: 'nebula-pulse-2 10s ease-in-out infinite',
          '@keyframes nebula-pulse-2': {
            '0%, 100%': { opacity: 0.3 },
            '50%': { opacity: 0.6 }
          }
        }}
      />

      {/* Solo un efecto Framer Motion muy simple */}
      <m.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.03), transparent 70%)',
          zIndex: -1,
          willChange: 'opacity'
        }}
        animate={{
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </LazyMotion>
  );
};