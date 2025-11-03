
// src/components/layout/ResponsiveLayout.tsx
// ResponsiveLayout - Container adaptativo mobile/desktop que usa NavigationContext
// ✅ CORREGIDO: Imports limpiados + errores solucionados

import React, { useRef } from 'react';
import { Box } from '@chakra-ui/react';
import { useNavigationLayout } from '@/contexts/NavigationContext';
import { Header } from '../navigation/Header';
import { MobileLayout } from './MobileLayout';
import { DesktopLayout } from './DesktopLayout';
import { logger } from '@/lib/logging';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const { isMobile } = useNavigationLayout();

  // 🐛 PERFORMANCE DEBUG: Track renders to detect re-render issues
  const renderCountRef = useRef(0);
  renderCountRef.current++;
  logger.debug('ResponsiveLayout', `🔵 RENDER #${renderCountRef.current}`);

  // Track breakpoint changes (CRITICAL - triggers layout shifts)
  const prevIsMobileRef = useRef(isMobile);
  if (prevIsMobileRef.current !== isMobile) {
    logger.info('ResponsiveLayout', '📱 Breakpoint changed', {
      prev: prevIsMobileRef.current ? 'mobile' : 'desktop',
      new: isMobile ? 'mobile' : 'desktop',
      renderCount: renderCountRef.current
    });
    prevIsMobileRef.current = isMobile;
  }

  // Alert on excessive renders
  if (renderCountRef.current > 20) {
    logger.error('ResponsiveLayout', '🔴 EXCESSIVE RENDERS DETECTED!', {
      count: renderCountRef.current,
      isMobile
    });
  }

  return (
    <Box w="100%" bg="bg.canvas">
      {/* ✅ Header universal - aparece en ambos layouts */}
      <Header />

      {/* ✅ Layout específico sin header duplicado */}
      {isMobile ? (
        <MobileLayout>{children}</MobileLayout>
      ) : (
        <DesktopLayout>{children}</DesktopLayout>
      )}
    </Box>
  );
}