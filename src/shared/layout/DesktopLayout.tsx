// src/components/layout/DesktopLayout.tsx
// Layout específico para desktop (768px+)
// 🔧 CRÍTICO CORREGIDO: Full width viewport + layout positioning fix
// ⚡ PERFORMANCE: No consume context para evitar re-renders innecesarios

import React, { memo } from 'react';
import { Box, HStack, VStack } from '@chakra-ui/react';
import { Sidebar } from '../navigation/Sidebar';
import { Breadcrumb } from '../navigation/Breadcrumb';
import { ActionToolbar } from '../navigation/ActionToolbar';

interface DesktopLayoutProps {
  children: React.ReactNode;
}

// ⚡ PERFORMANCE: Memoized - NO consume NavigationLayoutContext
// Por lo tanto NO se re-renderiza cuando el context cambia (solo cuando children cambian)
export const DesktopLayout = memo(function DesktopLayout({ children }: DesktopLayoutProps) {
  return (
    <>
      {/* ✅ Sidebar FUERA del flujo del documento */}
      <Sidebar />

      {/* Main content area */}
      <Box
        minH="100vh"
        mt="60px"
        ml={{ base: "0", md: "3rem" }}
        bg="bg.canvas"
        color="text.primary"
      >
        {/* 🔧 CRÍTICO CORREGIDO: Content area con scroll interno - sin breadcrumb duplicado */}
        <Box
          as="main"
          flex="1"
          px={{ base: "4", md: "6" }}
          py={{ base: "4", md: "6" }}
          overflow="visible"
          w="100%"

          color="text.primary"
        >
          {children}
        </Box>

        {/* ✅ Action toolbar fijo en bottom */}
        <ActionToolbar />
      </Box>
    </>
  );
});