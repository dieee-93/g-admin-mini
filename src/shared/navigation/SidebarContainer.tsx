// ====================================
// SIDEBAR CONTAINER - Contenedor especializado para navegación responsiva
// ====================================

import React from 'react';
import { Box, Stack } from '@chakra-ui/react';

interface SidebarContainerProps {
  children: React.ReactNode;
  isExpanded: boolean;
  isHovering: boolean;
}

export function SidebarContainer({ 
  children, 
  isExpanded, 
  isHovering 
}: SidebarContainerProps) {
  return (
    <Box
      width={isExpanded ? "15rem" : "3rem"}
      height="100vh"

      borderRight="1px solid"
      position="fixed"
      left={0}
      top={0}
      zIndex={9999}
      transition="width 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
      overflow="hidden"
      boxShadow={isExpanded ? "2xl" : "lg"}
    >
      <Stack direction="column" gap="none" align="stretch" height="100%">
        {children}
      </Stack>
    </Box>
  );
}

// Navigation Item Container
export function NavItemContainer({ 
  children, 
  isActive, 
  isExpanded,
  onClick 
}: {
  children: React.ReactNode;
  isActive: boolean;
  isExpanded: boolean;
  onClick?: () => void;
}) {
  return (
    <Box
      as="button"
      width="100%"
      px="xs"
      py="xxs"
      minH="28px"
      borderRadius="sm"
      bg={isActive ? 'primary.500' : 'transparent'}
      color={isActive ? 'white' : 'text.secondary'}
      textAlign="left"
      cursor="pointer"
      position="relative"
      transition="all 0.12s ease"
      _hover={{
        bg: isActive ? 'primary.600' : 'bg.surface'
      }}
      _focus={{
        outline: '1px solid',
        outlineColor: 'primary.500',
        outlineOffset: '1px'
      }}
      onClick={onClick}
      _before={isActive ? {
        content: '""',
        position: 'absolute',
        left: '-4px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '3px',
        height: '16px',
        bg: 'primary.500',
        borderRadius: '0 2px 2px 0'
      } : {}}
    >
      <Stack 
        direction="row" 
        align="center" 
        gap={isExpanded ? "sm" : "none"}
        justify={isExpanded ? "flex-start" : "center"}
        width="100%"
      >
        {children}
      </Stack>
    </Box>
  );
}