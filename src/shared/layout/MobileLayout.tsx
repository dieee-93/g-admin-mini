// src/components/layout/MobileLayout.tsx
// Layout específico para mobile (320px-767px)
// 🔧 CRÍTICO CORREGIDO: Bottom nav SIEMPRE fija + Z-index consistente + Scroll behavior

import React from 'react';
import { Box } from '@chakra-ui/react';
import { BottomNavigation } from '../navigation/BottomNavigation';
import { FloatingActionButton } from '../navigation/FloatingActionButton';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <Box 
      w="100%"
      minH="100vh"
      maxH="100vh"
      bg="bg.canvas"
      color="text.primary"
      position="relative"
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      {/* 🔧 CRÍTICO CORREGIDO: Main content con flex y scroll controlado */}
      <Box 
        as="main"
        flex="1"
        position="relative"
        mt="60px"
        overflow="auto"
        px="4"
        py="4"
        pb="90px"
        bg="bg.surface"
        color="text.primary"
        w="100%"
      >
        {children}
      </Box>

      {/* ✅ FAB para acción principal - Z-index intermedio */}
      <FloatingActionButton />

      {/* 🔧 CRÍTICO CORREGIDO: Bottom navigation SIEMPRE fija */}
      <BottomNavigation />
    </Box>
  );
}