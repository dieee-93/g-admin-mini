// ====================================
// src/shared/navigation/Sidebar.tsx - SISTEMA DE DISEÑO G-ADMIN MINI v2.0
// ====================================

import React, { Fragment, useMemo } from 'react';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useLocation } from 'react-router-dom';
import { useNavigation } from '@/contexts/NavigationContext';
import { useModuleNavigationByDomain } from '@/lib/modules/useModuleNavigation';
import {
  Layout, Stack, Typography, CardWrapper, Button, Badge, Box, Collapsible
} from '@/shared/ui';
import { Icon, HeaderIcon } from '@/shared/ui/Icon';
import { QuickThemeToggle } from '@/shared/components/ThemeToggle';
import { SidebarContainer, NavItemContainer } from './SidebarContainer';

import { logger } from '@/lib/logging';

// Domain labels for navigation grouping
const DOMAIN_LABELS: Record<string, string> = {
  'core': 'Core',
  'supply-chain': 'Supply Chain',
  'operations': 'Operations',
  'finance': 'Finance',
  'resources': 'Resources',
  'advanced': 'Advanced',
  'debug': 'Debug'
};

export function Sidebar() {
  const location = useLocation();
  const [isHovering, setIsHovering] = React.useState(false);
  const {
    modules,
    currentModule,
    navigate,
    navigateToModule,
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleModuleExpansion,
    isMobile
  } = useNavigation();

  // Get modules grouped by domain
  const modulesByDomain = useModuleNavigationByDomain();

  // Handler para toggle de expansión
  const handleToggleExpansion = (moduleId: string) => {
    toggleModuleExpansion(moduleId);
  };

  // 🔧 HOVER-ONLY SIDEBAR: Always collapsed, only expands on hover
  const actualShowExpanded = isHovering;

  // Merge with module state from NavigationContext for expansion and badges
  const modulesWithState = useMemo(() => {
    const allModules = Object.values(modulesByDomain).flat();
    return allModules.map(module => {
      // Find matching module in context modules to get state
      const contextModule = modules.find(m => m.id === module.id);
      return {
        ...module,
        isExpanded: contextModule?.isExpanded ?? module.isExpanded,
        badge: contextModule?.badge ?? module.badge
      };
    });
  }, [modulesByDomain, modules]);

  // Group back by domain with state
  const modulesWithStateByDomain = useMemo(() => {
    const grouped: Record<string, typeof modulesWithState> = {
      core: [],
      'supply-chain': [],
      operations: [],
      finance: [],
      resources: [],
      advanced: [],
      debug: []
    };

    modulesWithState.forEach(module => {
      const domain = module.domain || 'core';
      if (grouped[domain]) {
        grouped[domain].push(module);
      }
    });

    return grouped;
  }, [modulesWithState]);

  // Domain order for rendering
  const domainOrder: Array<keyof typeof modulesByDomain> = [
    'core',
    'supply-chain',
    'operations',
    'finance',
    'resources',
    'advanced',
    'debug'
  ];

  // Render a single module (extracted for reusability)
  const renderModule = (module: typeof modulesWithState[0]) => {
    const isActive = currentModule?.id === module.id;

    return (
      <div key={module.id} style={{ position: "relative" }}>
        {/* Main Module Button - Compact like GitHub */}
        <Stack direction="row" align="stretch" gap="1">
          <NavItemContainer
            isActive={isActive}
            isExpanded={actualShowExpanded}
            onClick={() => navigateToModule(module.id)}
          >
            <div
              style={{
                width: actualShowExpanded ? "18px" : "20px",
                height: actualShowExpanded ? "18px" : "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <Icon
                icon={module.icon}
                size={actualShowExpanded ? "sm" : "md"}
                color={isActive ? 'white' : undefined}
              />
            </div>

            {actualShowExpanded && (
              <Typography
                variant="body"
                weight={isActive ? 'medium' : 'normal'}
                color={isActive ? 'white' : undefined}
                textAlign="right"
                size="sm"
                lineHeight="1.2"
                noWrap
                flex={1}
                minWidth="0"
              >
                {module.title}
              </Typography>
            )}
          </NavItemContainer>

          {/* Expansion Toggle Button - Ultra subtle like GitHub */}
          {module.isExpandable && actualShowExpanded && (
            <Button
              variant="ghost"
              size="xs"
              width="16px"
              height="16px"
              minWidth="16px"
              onClick={() => handleToggleExpansion(module.id)}
              borderRadius="xs"
              opacity={0.4}
              p="0"
              transition="opacity 0.15s ease"
              _hover={{
                opacity: 0.8
              }}
            >
              <Icon
                icon={ChevronDownIcon}
                size="xs"
                transform={module.isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}
                transition="transform 0.15s ease"
              />
            </Button>
          )}
        </Stack>

        {/* Module Badge - Ultra minimal positioning */}
        {module.badge && (
          <div
            style={{
              position: "absolute",
              top: "2px",
              right: module.isExpandable && actualShowExpanded ? "20px" : "2px",
              zIndex: 10
            }}
          >
            <Badge
              variant="solid"
              colorPalette="red"
              size="xs"
              style={{
                borderRadius: "50%",
                minWidth: "10px",
                height: "10px",
                fontSize: "8px",
                fontWeight: "500"
              }}
            >
              {module.badge}
            </Badge>
          </div>
        )}

        {/* Sub-modules Collapsible Section - Ultra minimal */}
        {module.isExpandable && actualShowExpanded && module.subModules && (
          <Collapsible.Root open={module.isExpanded}>
            <Collapsible.Content>
              <div
                style={{
                  marginTop: "4px",
                  marginLeft: "12px",
                  paddingLeft: "12px"
                }}
              >
                <Stack direction="column" gap="0" align="stretch">
                  {module.subModules.map((subModule) => {
                    const isSubModuleActive = location.pathname === subModule.path;

                    return (
                      <Box
                        as="button"
                        key={subModule.id}
                        width="100%"
                        padding="4px 8px"
                        minHeight="24px"
                        borderRadius="4px"
                        bg={isSubModuleActive ? "bg.emphasized" : "transparent"}
                        color={isSubModuleActive ? "fg.inverted" : "fg.muted"}
                        textAlign="left"
                        cursor="pointer"
                        transition="all 0.12s ease"
                        border="none"
                        outline="none"
                        _hover={{
                          bg: isSubModuleActive ? "bg.emphasized" : "bg.subtle"
                        }}
                        onClick={() => navigate(module.id, subModule.path.replace(module.path, ''))}
                      >
                        <Stack direction="row" align="center" gap="2" width="100%">
                          <Icon
                            icon={subModule.icon}
                            size="xs"
                            color={isSubModuleActive ? 'white' : undefined}
                          />
                          <Typography
                            variant="caption"
                            weight={isSubModuleActive ? 'medium' : 'normal'}
                            color={isSubModuleActive ? 'white' : undefined}
                            textAlign="start"
                            size="xs"
                            noWrap
                          >
                            {subModule.title}
                          </Typography>
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              </div>
            </Collapsible.Content>
          </Collapsible.Root>
        )}
      </div>
    );
  };

  return (
    <Box
        position="relative"
        height="100vh"
        width={actualShowExpanded ? "15rem" : "3rem"}
        onMouseEnter={() => {
          logger.info('App', '🎯 Sidebar hover ENTER'); // Debug
          setIsHovering(true);
          window.dispatchEvent(new CustomEvent('sidebarHover', { detail: { isHovering: true } }));
        }}
        onMouseLeave={() => {
          logger.info('App', '🎯 Sidebar hover LEAVE'); // Debug
          setIsHovering(false);
          window.dispatchEvent(new CustomEvent('sidebarHover', { detail: { isHovering: false } }));
        }}
      >
        <SidebarContainer isExpanded={actualShowExpanded} isHovering={isHovering}>
          
          {/* Header Section - Ultra minimal like GitHub - Perfect alignment */}
          <div 
            style={{
              height: "60px",
              display: "flex",
              alignItems: "center",
              padding: actualShowExpanded ? "0 12px" : "0 8px", // 🎨 Border consistente
              flexShrink: 0
            }}
          >
            <Stack direction="row" align="center" justify="space-between">
              <Stack direction="row" align="center" gap="2">
                <div 
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  <Typography 
                    variant="heading" 
                    level={5}
                    weight="bold"
                    fontSize="xs"
                  >
                    G
                  </Typography>
                </div>
                
                {actualShowExpanded && (
                  <Typography variant="body" weight="medium" size="sm">
                    G-Admin
                  </Typography>
                )}
              </Stack>

{/* Toggle button removed - hover-only sidebar */}
            </Stack>
          </div>

          {/* Navigation Section - Grouped by Domain */}
          <div style={{ flex: 1, padding: "8px", paddingTop: "4px", overflow: "auto" }}>
            <Stack direction="column" gap="2" align="stretch">
              {domainOrder.map((domain, domainIndex) => {
                const domainModules = modulesWithStateByDomain[domain];

                // Skip empty domains
                if (!domainModules || domainModules.length === 0) return null;

                return (
                  <Fragment key={domain}>
                    {/* Domain separator (except before first domain) */}
                    {domainIndex > 0 && actualShowExpanded && (
                      <Box
                        height="1px"
                        bg="border.default"
                        opacity={0.3}
                        margin="8px 4px 4px 4px"
                      />
                    )}

                    {/* Domain label (only when expanded) */}
                    {actualShowExpanded && (
                      <Box paddingX="8px" paddingY="4px">
                        <Typography
                          variant="caption"
                          size="xs"
                          weight="semibold"
                          color="fg.subtle"
                          textTransform="uppercase"
                          letterSpacing="wide"
                        >
                          {DOMAIN_LABELS[domain]}
                        </Typography>
                      </Box>
                    )}

                    {/* Domain modules */}
                    <Stack direction="column" gap="0" align="stretch">
                      {domainModules.map(module => renderModule(module))}
                    </Stack>
                  </Fragment>
                );
              })}
            </Stack>
          </div>

          {/* Theme Toggle Footer - Ultra minimal */}
          <div 
            style={{
              marginTop: "auto",
              padding: "8px"
            }}
          >
            <Stack direction="row" justify={actualShowExpanded ? "flex-end" : "center"}>
              <QuickThemeToggle />
            </Stack>
          </div>
          
        </SidebarContainer>
    </Box>
  );
}