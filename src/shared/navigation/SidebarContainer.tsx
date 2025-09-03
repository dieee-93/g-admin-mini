// ====================================
// SIDEBAR CONTAINER - Contenedor especializado para navegación responsiva
// ====================================

import React from 'react';
import { Stack } from '@/shared/ui';
import { Box } from '@chakra-ui/react';

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
      bg="bg.surface"
      borderRight="1px solid"
      borderColor="border.default"
      position="fixed"
      left="0"
      top="0"
      zIndex="9999"
      transition="width 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
      overflow="hidden"
      boxShadow={isExpanded ? "2xl" : "lg"}
    >
      <Stack direction="column" gap="0" align="stretch" height="100%">
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
    <button
      style={{
        width: "100%",
        padding: "4px 8px", // xs padding
        minHeight: "28px",
        borderRadius: "4px", // sm
        backgroundColor: isActive ? "var(--chakra-colors-gray-600)" : "transparent", // 🎨 Estado activo
        color: isActive ? "var(--chakra-colors-gray-50)" : "var(--chakra-colors-gray-600)", // 🎨 Colores consistentes
        textAlign: "left",
        cursor: "pointer",
        position: "relative",
        transition: "all 0.12s ease",
        border: "none",
        outline: "none"
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = "var(--chakra-colors-gray-200)"; // 🎨 Hover consistente
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = "transparent";
        }
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = "1px solid var(--chakra-colors-gray-500)";
        e.currentTarget.style.outlineOffset = "1px";
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = "none";
      }}
      onClick={onClick}
    >
      {/* Indicador de estado activo */}
      {isActive && (
        <div 
          style={{
            position: "absolute",
            left: "-4px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "3px",
            height: "16px",
            backgroundColor: "var(--chakra-colors-gray-600)", // 🎨 Indicador activo
            borderRadius: "0 2px 2px 0"
          }}
        />
      )}
      
      <Stack 
        direction="row" 
        align="center" 
        gap={isExpanded ? "4" : "0"}
        justify={isExpanded ? "flex-start" : "center"}
        style={{ width: "100%" }}
      >
        {children}
      </Stack>
    </button>
  );
}