
// src/components/layout/ResponsiveLayout.tsx
// ResponsiveLayout - Container adaptativo mobile/desktop que usa NavigationContext
// ✅ CORREGIDO: Imports limpiados + errores solucionados

import React from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { MobileLayout } from './MobileLayout';
import { DesktopLayout } from './DesktopLayout';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const { isMobile } = useNavigation();

  // ✅ Mobile-first approach - renderizar layout según breakpoint
  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  return <DesktopLayout>{children}</DesktopLayout>;
}