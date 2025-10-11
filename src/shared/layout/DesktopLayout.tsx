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
  const [sidebarHovered, setSidebarHovered] = React.useState(false);

  return (
    <Box 
      minH="100vh" 
      bg="bg.canvas"
      color="text.primary"
      position="relative"
      w="100%"
      overflow="hidden"
    >
      {/* ✅ Sidebar fixed - no necesita estar en el HStack */}
      <Sidebar />

      {/* 🔧 OVERLAY SIDEBAR: Main area with responsive left margin to avoid sidebar overlap */}
      <Box
        position="absolute"
        top="60px"
        left={{ base: "0", md: "3rem" }}
        right="0"
        bottom="0"
        overflow="auto"
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
    </Box>
  );
}