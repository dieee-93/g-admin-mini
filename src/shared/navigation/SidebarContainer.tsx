// ====================================
// SIDEBAR CONTAINER - Contenedor especializado para navegación responsiva
// ====================================

import React, { memo } from 'react';
import { Stack, Box } from '@/shared/ui';

interface SidebarContainerProps {
  children: React.ReactNode;
  isExpanded: boolean;
  isHovering: boolean;
}

// ⚡ PERFORMANCE: Memoize to prevent re-renders when props don't change
export const SidebarContainer = memo(function SidebarContainer({
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
});

// ⚡ PERFORMANCE: Memoize NavItemContainer too
export const NavItemContainer = memo(function NavItemContainer({
  children,
  isActive,
  isExpanded,
  onClick,
  ...rest
}: {
  children: React.ReactNode;
  isActive: boolean;
  isExpanded: boolean;
  onClick?: () => void;
} & React.ComponentProps<typeof Box>) {
  return (
    <Box
      as="button"
      width="100%"
      padding="8px 8px"
      minHeight="44px"
      borderRadius="8px"
      bg={isActive ? "bg.emphasized" : "transparent"}
      color={isActive ? "fg.inverted" : "fg.muted"}
      textAlign="left"
      cursor="pointer"
      position="relative"
      transition="all 0.12s ease"
      border="none"
      outline="none"
      _hover={{
        bg: isActive ? "bg.emphasized" : "bg.subtle"
      }}
      _focus={{
        outline: "1px solid",
        outlineColor: "border.emphasized",
        outlineOffset: "1px"
      }}
      onClick={onClick}
      {...rest}
    >
      {/* Indicador de estado activo */}
      {isActive && (
        <Box
          position="absolute"
          left="-4px"
          top="50%"
          transform="translateY(-50%)"
          width="3px"
          height="16px"
          bg="bg.emphasized"
          borderRadius="0 2px 2px 0"
        />
      )}

      <Stack
        direction="row"
        align="center"
        gap={isExpanded ? "4" : "0"}
        justify={isExpanded ? "start" : "center"}
        width="100%"
      >
        {children}
      </Stack>
    </Box>
  );
});