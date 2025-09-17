/**
 * PerformanceMonitor - Sistema de monitoreo de rendimiento en tiempo real
 * 
 * Detecta problemas de rendimiento y ajusta automáticamente las configuraciones
 * para mantener una experiencia fluida
 */

import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  animationCount: number;
  lastFrameTime: number;
  isLagging: boolean;
}

interface PerformanceConfig {
  maxAnimations: number;
  reducedEffects: boolean;
  lowQualityMode: boolean;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    animationCount: 0,
    lastFrameTime: 0,
    isLagging: false
  });

  const [config, setConfig] = useState<PerformanceConfig>({
    maxAnimations: 50,
    reducedEffects: false,
    lowQualityMode: false
  });

  const frameTimeRef = useRef<number[]>([]);
  const lastFrameRef = useRef<number>(0);
  const rafIdRef = useRef<number>(0);

  // Monitoreo de FPS
  useEffect(() => {
    const measureFPS = (timestamp: number) => {
      if (lastFrameRef.current !== 0) {
        const frameTime = timestamp - lastFrameRef.current;
        frameTimeRef.current.push(frameTime);
        
        // Mantener solo los últimos 60 frames
        if (frameTimeRef.current.length > 60) {
          frameTimeRef.current.shift();
        }
        
        // Calcular FPS promedio
        const avgFrameTime = frameTimeRef.current.reduce((sum, time) => sum + time, 0) / frameTimeRef.current.length;
        const fps = Math.round(1000 / avgFrameTime);
        
        // Detectar lag (si FPS cae por debajo de 30)
        const isLagging = fps < 30;
        
        // Obtener uso de memoria si está disponible
        const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
        
        setMetrics(prev => ({
          ...prev,
          fps,
          memoryUsage: Math.round(memoryUsage / 1048576), // Convert to MB
          lastFrameTime: frameTime,
          isLagging
        }));
        
        // Auto-optimización basada en rendimiento
        if (isLagging && !config.reducedEffects) {
          console.warn('Performance issue detected, reducing effects...');
          setConfig(prev => ({
            ...prev,
            reducedEffects: true,
            maxAnimations: 20
          }));
        } else if (!isLagging && fps > 50 && config.reducedEffects) {
          // Restaurar efectos si el rendimiento mejora
          setTimeout(() => {
            setConfig(prev => ({
              ...prev,
              reducedEffects: false,
              maxAnimations: 50
            }));
          }, 2000);
        }
      }
      
      lastFrameRef.current = timestamp;
      rafIdRef.current = requestAnimationFrame(measureFPS);
    };

    rafIdRef.current = requestAnimationFrame(measureFPS);
    
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [config.reducedEffects]);

  // Contador de animaciones activas
  const registerAnimation = () => {
    setMetrics(prev => ({
      ...prev,
      animationCount: prev.animationCount + 1
    }));
  };

  const unregisterAnimation = () => {
    setMetrics(prev => ({
      ...prev,
      animationCount: Math.max(0, prev.animationCount - 1)
    }));
  };

  // Función para obtener configuración optimizada
  const getOptimizedAnimationProps = (baseProps: any) => {
    if (config.reducedEffects) {
      return {
        ...baseProps,
        transition: {
          ...baseProps.transition,
          duration: (baseProps.transition?.duration || 0.5) * 0.5,
          ease: 'easeOut'
        }
      };
    }
    return baseProps;
  };

  return {
    metrics,
    config,
    registerAnimation,
    unregisterAnimation,
    getOptimizedAnimationProps,
    shouldReduceAnimations: config.reducedEffects || metrics.isLagging,
    shouldDisableAnimations: metrics.fps < 20
  };
};

// Componente para mostrar métricas de rendimiento (solo en desarrollo)
export const PerformanceDebugger: React.FC = () => {
  const { metrics, config } = usePerformanceMonitor();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        minWidth: '200px'
      }}
    >
      <div>FPS: {metrics.fps}</div>
      <div>Memory: {metrics.memoryUsage}MB</div>
      <div>Animations: {metrics.animationCount}</div>
      <div>Frame Time: {metrics.lastFrameTime.toFixed(1)}ms</div>
      <div style={{ color: metrics.isLagging ? 'red' : 'green' }}>
        Status: {metrics.isLagging ? 'LAGGING' : 'SMOOTH'}
      </div>
      <div>Effects: {config.reducedEffects ? 'REDUCED' : 'FULL'}</div>
    </div>
  );
};