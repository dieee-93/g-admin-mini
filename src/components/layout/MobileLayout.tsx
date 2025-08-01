// src/components/layout/MobileLayout.tsx
// Layout específico para mobile (320px-767px)
// ✅ CORREGIDO: Bottom navigation + FAB + Header según arquitectura v2.0

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
      minH="100vh" 
      bg="gray.50"
      position="relative"
      pb="80px" // Padding para bottom navigation (thumb zone)
    >
      {/* ✅ Header fijo */}
      <Header />
      
      {/* ✅ Main content con scroll */}
      <Box 
        as="main"
        pt="60px" // Space for fixed header
        px="4"
        py="4"
        minH="calc(100vh - 140px)" // Full height minus header and bottom nav
        overflow="auto"
      >
        {children}
      </Box>

      {/* ✅ FAB para acción principal */}
      <FloatingActionButton />

      {/* ✅ Bottom navigation fijo (thumb zone) */}
      <BottomNavigation />
    </Box>
  );
}