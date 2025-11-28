/**
 * PerformanceMonitor - Sistema de gestión de preferencias de rendimiento
 * 
 * Simplificado: Ya no monitorea FPS activamente para evitar re-renders innecesarios.
 * Mantiene la funcionalidad de reducir animaciones basada en preferencias del usuario.
 */

import { useState, useEffect } from 'react';

interface PerformanceConfig {
  maxAnimations: number;
  reducedEffects: boolean;
  lowQualityMode: boolean;
}

export const usePerformanceMonitor = () => {
  // Estado simplificado: solo configuración, sin métricas en tiempo real
  const [config, setConfig] = useState<PerformanceConfig>({
    maxAnimations: 50,
    reducedEffects: false,
    lowQualityMode: false
  });

  // Detectar preferencia del sistema para movimiento reducido
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setConfig(prev => ({
        ...prev,
        reducedEffects: e.matches,
        maxAnimations: e.matches ? 0 : 50
      }));
    };

    // Configuración inicial
    handleChange(mediaQuery);

    // Escuchar cambios
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Contador de animaciones (opcional, mantenido por compatibilidad de API)
  const registerAnimation = () => { };
  const unregisterAnimation = () => { };

  // Función para obtener configuración optimizada
  const getOptimizedAnimationProps = (baseProps: any) => {
    if (config.reducedEffects) {
      return {
        ...baseProps,
        transition: {
          ...baseProps.transition,
          duration: 0, // Desactivar animaciones si se prefiere movimiento reducido
          animate: undefined // Opcional: desactivar animación completamente
        }
      };
    }
    return baseProps;
  };

  return {
    metrics: { fps: 60, isLagging: false, memoryUsage: 0 }, // Mock estático para compatibilidad
    config,
    registerAnimation,
    unregisterAnimation,
    getOptimizedAnimationProps,
    shouldReduceAnimations: config.reducedEffects,
    shouldDisableAnimations: config.reducedEffects
  };
};

// Componente Debugger eliminado (ya no es necesario)
export const PerformanceDebugger: React.FC = () => {
  return null;
};