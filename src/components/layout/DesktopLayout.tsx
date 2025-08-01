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
    <Box minH="100vh" bg="gray.50" position="relative">
      {/* ✅ Sidebar fixed - no necesita estar en el HStack */}
      <Sidebar />

      {/* 🔧 CRÍTICO CORREGIDO: Main area SIN margin-left, con padding-left dinámico */}
      <Box
        pl={sidebarCollapsed ? "60px" : "240px"}
        transition="padding-left 0.2s ease"
        minH="100vh"
      >
        <VStack 
          align="stretch" 
          gap="0"
          minH="100vh"
        >
          {/* ✅ Breadcrumb navigation */}
          <Box 
            bg="white" 
            borderBottom="1px solid" 
            borderColor="gray.200"
            px="6" 
            py="3"
            position="sticky"
            top="0"
            zIndex={100}
          >
            <Breadcrumb />
          </Box>

          {/* 🔧 CRÍTICO CORREGIDO: Content area usa flex="1" para ocupar espacio restante */}
          <Box 
            as="main"
            flex="1"
            px="6"
            py="6"
            overflow="auto"
            w="100%"
          >
            {children}
          </Box>

          {/* ✅ Action toolbar fijo en bottom */}
          <ActionToolbar />
        </VStack>
      </Box>
    </Box>
  );
}