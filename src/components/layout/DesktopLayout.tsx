// src/components/layout/DesktopLayout.tsx  
// Layout específico para desktop (768px+)
// ✅ CORREGIDO: Sidebar + Breadcrumb + Toolbar según arquitectura v2.0

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
    <HStack gap="0" minH="100vh" bg="gray.50" align="stretch">
      {/* ✅ Sidebar collapsible */}
      <Sidebar />

      {/* ✅ Main area - CORREGIDO: margin left sin template literals */}
      <VStack 
        flex="1" 
        align="stretch" 
        gap="0"
        ml={sidebarCollapsed ? "60px" : "240px"}
        transition="margin-left 0.2s ease"
      >
        {/* ✅ Breadcrumb navigation */}
        <Box 
          bg="white" 
          borderBottom="1px solid" 
          borderColor="gray.200"
          px="6" 
          py="3"
        >
          <Breadcrumb />
        </Box>

        {/* ✅ Content area */}
        <Box 
          as="main"
          flex="1"
          overflow="auto"
          position="relative"
        >
          {children}
        </Box>

        {/* ✅ Action toolbar fijo en bottom */}
        <ActionToolbar />
      </VStack>
    </HStack>
  );
}