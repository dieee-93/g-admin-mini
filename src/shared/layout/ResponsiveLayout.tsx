
// src/components/layout/ResponsiveLayout.tsx
// ResponsiveLayout - Container adaptativo mobile/desktop que usa NavigationContext
// ✅ CORREGIDO: Imports limpiados + errores solucionados

import React from 'react';
import { Box } from '@chakra-ui/react';
import { useNavigation } from '@/contexts/NavigationContext';
import { Header } from '../navigation/Header';
import { MobileLayout } from './MobileLayout';
import { DesktopLayout } from './DesktopLayout';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const { isMobile } = useNavigation();

  return (
    <Box w="100%" minH="100vh" >
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