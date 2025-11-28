
// src/components/layout/ResponsiveLayout.tsx
// ResponsiveLayout - Container adaptativo mobile/desktop que usa NavigationContext
// ✅ CORREGIDO: Imports limpiados + errores solucionados
// ⚡ PERFORMANCE: Context Isolation Pattern - separa consumo de context

import React, { useRef, memo } from 'react';
import { Box } from '@chakra-ui/react';
import { useNavigationLayout } from '@/contexts/NavigationContext';
import { Header } from '../navigation/Header';
import { MobileLayout } from './MobileLayout';
import { DesktopLayout } from './DesktopLayout';
import { logger } from '@/lib/logging';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  headerActions?: React.ReactNode; // NEW PROP
}

// ⚡ PERFORMANCE FIX: Componente pequeño que consume NavigationLayoutContext
// Solo este componente se re-renderiza cuando el context cambia
function LayoutSelector({ children }: { children: React.ReactNode }) {
  const { isMobile } = useNavigationLayout();

  return isMobile ? (
    <MobileLayout>{children}</MobileLayout>
  ) : (
    <DesktopLayout>{children}</DesktopLayout>
  );
}

// ⚡ PERFORMANCE: Memoized wrapper - NO consume context, solo recibe children
// Por lo tanto NO se re-renderiza cuando NavigationLayoutContext cambia
export const ResponsiveLayout = memo(function ResponsiveLayout({ children, headerActions }: ResponsiveLayoutProps) { // Use new prop
  // 🐛 PERFORMANCE DEBUG: Track renders to detect re-render issues
  const renderCountRef = useRef(0);
  renderCountRef.current++;
  logger.debug('ResponsiveLayout', `🔵 RENDER #${renderCountRef.current}`);

  // Alert on excessive renders
  if (renderCountRef.current > 20) {
    logger.error('ResponsiveLayout', '🔴 EXCESSIVE RENDERS DETECTED!', {
      count: renderCountRef.current
    });
  }

  return (
    <Box w="100%" bg="bg.canvas">
      {/* ✅ Header universal - aparece en ambos layouts */}
      <Header actions={headerActions} /> {/* Pass new prop to Header */}

      {/* ⚡ PERFORMANCE: LayoutSelector consume context, pero children están aislados */}
      <LayoutSelector>{children}</LayoutSelector>
    </Box>
  );
});