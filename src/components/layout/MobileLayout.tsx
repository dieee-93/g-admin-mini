// src/components/layout/MobileLayout.tsx
// Layout específico para mobile (320px-767px)
// 🔧 CRÍTICO CORREGIDO: Bottom nav SIEMPRE fija + Z-index consistente + Scroll behavior

import React from 'react';
import { Box } from '@chakra-ui/react';
import { Header } from '../navigation/Header';
import { BottomNavigation } from '../navigation/BottomNavigation';
import { FloatingActionButton } from '../navigation/FloatingActionButton';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <Box 
      w="100%"
      h="100vh" 
      bg="gray.50"
      position="relative"
      overflow="hidden" // 🔧 CORREGIDO: Prevenir overflow del container
    >
      {/* ✅ Header fijo - Z-index más alto */}
      <Header />
      
      {/* 🔧 CRÍTICO CORREGIDO: Main content con scroll interno controlado */}
      <Box 
        as="main"
        position="absolute"
        top="60px"    // Altura del header
        left="0"
        right="0"
        bottom="0"    // 🔧 CORREGIDO: bottom=0 porque nav es fixed ahora
        overflow="auto"
        px="4"
        py="4"
        pb="90px"     // 🔧 NUEVO: Padding bottom para que contenido no se oculte
        bg="gray.50"
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