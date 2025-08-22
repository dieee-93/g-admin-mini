// src/components/layout/DesktopLayout.tsx  
// Layout específico para desktop (768px+)
// 🔧 CRÍTICO CORREGIDO: Full width viewport + layout positioning fix

import React from 'react';
import { Box, HStack, VStack } from '@chakra-ui/react';
import { useNavigation } from '@/contexts/NavigationContext';
import { Sidebar } from '../navigation/Sidebar';
import { Breadcrumb } from '../navigation/Breadcrumb';
import { ActionToolbar } from '../navigation/ActionToolbar';

interface DesktopLayoutProps {
  children: React.ReactNode;
}

export function DesktopLayout({ children }: DesktopLayoutProps) {
  const { sidebarCollapsed } = useNavigation();

  return (
    <Box 
      minH="100vh" 
      bg={{ base: "gray.50", _dark: "gray.900" }} 
      position="relative"
      w="100%"
      overflow="hidden"
    >
      {/* ✅ Sidebar fixed - no necesita estar en el HStack */}
      <Sidebar />

      {/* 🔧 CRÍTICO CORREGIDO: Main area con positioning absoluto para evitar conflictos */}
      <Box
        position="absolute"
        top="60px"
        left={{ base: "0", md: sidebarCollapsed ? "60px" : "280px" }}
        right="0"
        bottom="0"
        transition="left 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        overflow="auto"
        bg={{ base: "gray.50", _dark: "gray.900" }}
      >
        {/* 🔧 CRÍTICO CORREGIDO: Content area con scroll interno - sin breadcrumb duplicado */}
        <Box 
          as="main"
          flex="1"
          px={{ base: "4", md: "6" }}
          py={{ base: "4", md: "6" }}
          overflow="visible"
          w="100%"
          bg={{ base: "gray.50", _dark: "gray.900" }}
        >
          {children}
        </Box>

        {/* ✅ Action toolbar fijo en bottom */}
        <ActionToolbar />
      </Box>
    </Box>
  );
}