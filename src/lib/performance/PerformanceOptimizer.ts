/**
 * PerformanceOptimizer - Detecta capacidades del dispositivo y optimiza animaciones
 * 
 * Sistema inteligente que adapta las animaciones según el rendimiento del dispositivo
 */

export interface PerformanceConfig {
  reducedMotion: boolean;
  lowEndDevice: boolean;
  slowConnection: boolean;
  animationQuality: 'high' | 'medium' | 'low';
}

export const getPerformanceConfig = (): PerformanceConfig => {
  if (typeof window === 'undefined') {
    return {
      reducedMotion: false,
      lowEndDevice: false,
      slowConnection: false,
      animationQuality: 'medium'
    };
  }

  // Detectar preferencias de movimiento reducido
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Detectar dispositivos de bajo rendimiento basado en hardware
  const lowEndDevice = (() => {
    const { deviceMemory, hardwareConcurrency } = navigator as any;
    
    // Si tenemos menos de 4GB RAM o menos de 4 cores, consideramos bajo rendimiento
    if (deviceMemory && deviceMemory < 4) return true;
    if (hardwareConcurrency && hardwareConcurrency < 4) return true;
    
    // Detectar por user agent si es móvil de gama baja
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mobile') && (
      userAgent.includes('android 4') ||
      userAgent.includes('android 5') ||
      userAgent.includes('iphone os 12') ||
      userAgent.includes('iphone os 13')
    )) {
      return true;
    }
    
    return false;
  })();

  // Detectar conexión lenta
  const slowConnection = (() => {
    const connection = (navigator as any).connection;
    if (!connection) return false;
    
    return connection.effectiveType === 'slow-2g' || 
           connection.effectiveType === '2g' ||
           connection.effectiveType === '3g' ||
           connection.saveData === true;
  })();

  // Determinar calidad de animación
  let animationQuality: 'high' | 'medium' | 'low' = 'high';
  
  if (reducedMotion || lowEndDevice || slowConnection) {
    animationQuality = 'low';
  } else if (lowEndDevice || slowConnection) {
    animationQuality = 'medium';
  }

  return {
    reducedMotion,
    lowEndDevice,
    slowConnection,
    animationQuality
  };
};

// Hook para usar configuración de rendimiento
import { useState, useEffect } from 'react';

export const usePerformanceConfig = () => {
  const [config, setConfig] = useState<PerformanceConfig>(() => getPerformanceConfig());

  useEffect(() => {
    // Escuchar cambios en preferencias de movimiento
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setConfig(getPerformanceConfig());
    
    mediaQuery.addEventListener('change', handleChange);
    
    // Escuchar cambios en conexión
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', handleChange);
    }

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      if (connection) {
        connection.removeEventListener('change', handleChange);
      }
    };
  }, []);

  return config;
};