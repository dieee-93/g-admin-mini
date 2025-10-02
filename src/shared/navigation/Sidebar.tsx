// ====================================
// src/shared/navigation/Sidebar.tsx - SISTEMA DE DISEÑO G-ADMIN MINI v2.0
// ====================================

import React, { Fragment } from 'react';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useLocation } from 'react-router-dom';
import { useNavigation } from '@/contexts/NavigationContext';
import { 
  Layout, Stack, Typography, CardWrapper, Button, Badge
} from '@/shared/ui';
import { Box } from '@chakra-ui/react';
import { Collapsible } from '@chakra-ui/react';
import { Icon, HeaderIcon } from '@/shared/ui/Icon';
import { QuickThemeToggle } from '@/shared/components/ThemeToggle';
import { SidebarContainer, NavItemContainer } from './SidebarContainer';

import { logger } from '@/lib/logging';
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

  // Handler para toggle de expansión
  const handleToggleExpansion = (moduleId: string) => {
    toggleModuleExpansion(moduleId);
  };

  // 🔧 HOVER-ONLY SIDEBAR: Always collapsed, only expands on hover
  const actualShowExpanded = isHovering;

  // Use semantic tokens for sidebar styling

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

          {/* Navigation Section - Ultra compact like GitHub */}
          <div style={{ flex: 1, padding: "8px", paddingTop: "4px", overflow: "auto" }}>
            <Stack direction="column" gap="0" align="stretch">
              {modules.map((module, index) => {
                const isActive = currentModule?.id === module.id;
                
                // Add subtle separators for better visual grouping
                const showSeparator = actualShowExpanded && (
                  module.id === 'dashboard' || 
                  module.id === 'operations' || 
                  module.id === 'fiscal'
                );

                return (
                  <Fragment key={module.id}>
                    <div 
                      style={{ position: "relative" }}
                    >
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
                                  <button
                                    key={subModule.id}
                                    style={{
                                      width: "100%",
                                      padding: "4px 8px",
                                      minHeight: "24px",
                                      borderRadius: "4px",
                                      backgroundColor: isSubModuleActive ? "var(--chakra-colors-gray-600)" : "transparent", // 🎨 Estado activo
                                      color: isSubModuleActive ? "var(--chakra-colors-gray-50)" : "var(--chakra-colors-gray-600)", // 🎨 Colores consistentes
                                      textAlign: "left",
                                      cursor: "pointer",
                                      transition: "all 0.12s ease",
                                      border: "none",
                                      outline: "none"
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!isSubModuleActive) {
                                        e.currentTarget.style.backgroundColor = "var(--chakra-colors-gray-200)";
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!isSubModuleActive) {
                                        e.currentTarget.style.backgroundColor = "transparent";
                                      }
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
                                  </button>
                                );
                              })}
                            </Stack>
                          </div>
                        </Collapsible.Content>
                      </Collapsible.Root>
                    )}
                  </div>

                  {/* Subtle separator for visual grouping */}
                  {showSeparator && (
                    <div
                      style={{
                        height: "1px",
                        backgroundColor: "var(--chakra-colors-gray-200)", // 🎨 Separador consistente
                        opacity: 0.3,
                        margin: "4px 8px"
                      }}
                    />
                  )}
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