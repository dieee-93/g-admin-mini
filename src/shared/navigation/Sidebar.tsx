// ====================================
// src/shared/navigation/Sidebar.tsx - SISTEMA DE DISEÑO G-ADMIN MINI v2.0
// ====================================

import React, { Fragment } from 'react';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNavigation } from '@/contexts/NavigationContext';
import { 
  Layout, Stack, Typography, CardWrapper, Button, Badge 
} from '@/shared/ui';
import { Icon, HeaderIcon } from '@/shared/ui/Icon';
import { QuickThemeToggle } from '@/shared/components/ThemeToggle';
import { Collapsible, Box } from '@chakra-ui/react';
import { SidebarContainer, NavItemContainer } from './SidebarContainer';

export function Sidebar() {
  const location = useLocation();
  const reactNavigate = useNavigate();
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
    console.log('Toggling expansion for:', moduleId);
    toggleModuleExpansion(moduleId);
  };

  // 🔧 HOVER-ONLY SIDEBAR: Always collapsed, only expands on hover
  const actualShowExpanded = isHovering;
  
  // Debug logs
  React.useEffect(() => {
    console.log('🔍 Hover-Only Sidebar:', { isHovering, actualShowExpanded });
  }, [isHovering, actualShowExpanded]);

  // Use semantic tokens for sidebar styling

  return (
    <Box
        onMouseEnter={() => {
          setIsHovering(true);
          window.dispatchEvent(new CustomEvent('sidebarHover', { detail: { isHovering: true } }));
        }}
        onMouseLeave={() => {
          setIsHovering(false);
          window.dispatchEvent(new CustomEvent('sidebarHover', { detail: { isHovering: false } }));
        }}
      >
        <SidebarContainer isExpanded={actualShowExpanded} isHovering={isHovering}>
          
          {/* Header Section - Ultra minimal like GitHub - Perfect alignment */}
          <Box 
            height="60px"
            display="flex"
            alignItems="center"
            px={actualShowExpanded ? "sm" : "xs"}
            borderBottom="1px solid" 
          
            flexShrink={0}
          >
            <Stack direction="row" align="center" justify="space-between">
              <Stack direction="row" align="center" gap="xs">
                <Box 
                  width="20px"
                  height="20px"
                  borderRadius="sm"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <Typography 
                    variant="heading" 
                    level={5}
                    weight="bold"
                    fontSize="xs"
                  >
                    G
                  </Typography>
                </Box>
                
                {actualShowExpanded && (
                  <Typography variant="body" weight="medium" size="sm">
                    G-Admin
                  </Typography>
                )}
              </Stack>

{/* Toggle button removed - hover-only sidebar */}
            </Stack>
          </Box>

          {/* Navigation Section - Ultra compact like GitHub */}
          <Box flex={1} padding="xs" paddingTop="xxs" overflow="auto">
            <Stack direction="column" gap="1px" align="stretch">
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
                    <Box 
                      position="relative"
                    >
                    {/* Main Module Button - Compact like GitHub */}
                    <Stack direction="row" align="stretch" gap="xxs">
                      <NavItemContainer
                        isActive={isActive}
                        isExpanded={actualShowExpanded}
                        onClick={() => navigateToModule(module.id)}
                      >
                        <Box
                          width={actualShowExpanded ? "18px" : "20px"}
                          height={actualShowExpanded ? "18px" : "20px"}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          flexShrink={0}
                        >
                          <Icon 
                            icon={module.icon}
                            size={actualShowExpanded ? "sm" : "md"}
                            {...(isActive && { color: 'white' })}
                            flexShrink={0}
                          />
                        </Box>
                        
                        {actualShowExpanded && (
                          <Typography 
                            variant="body"
                            weight={isActive ? 'medium' : 'normal'}
{...isActive && { color: 'white' }}
                            textAlign="start"
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
                      <Box
                        position="absolute"
                        top="2px"
                        right={module.isExpandable && actualShowExpanded ? "20px" : "2px"}
                        zIndex={10}
                      >
                        <Badge 
                          variant="solid" 
                          colorPalette="error"
                          size="xs"
                          borderRadius="full"
                          minWidth="10px"
                          height="10px"
                          fontSize="8px"
                          fontWeight="medium"
                        >
                          {module.badge}
                        </Badge>
                      </Box>
                    )}

                    {/* Sub-modules Collapsible Section - Ultra minimal */}
                    {module.isExpandable && actualShowExpanded && module.subModules && (
                      <Collapsible.Root open={module.isExpanded}>
                        <Collapsible.Content>
                          <Box 
                            mt="xxs" 
                            ml="sm" 
                            pl="sm"
                          >
                            <Stack direction="column" gap="1px" align="stretch">
                              {module.subModules.map((subModule) => {
                                const isSubModuleActive = location.pathname === subModule.path;
                                
                                return (
                                  <Box
                                    key={subModule.id}
                                    as="button"
                                    width="100%"
                                    px="xs"
                                    py="xxs"
                                    minH="24px"
                                    borderRadius="sm"
                                    {...(isSubModuleActive && { bg: 'gray.600' })}
                                    {...(isSubModuleActive && { color: 'white' })}
                                    textAlign="left"
                                    cursor="pointer"
                                    transition="all 0.12s ease"
                                    _hover={{
                                      bg: isSubModuleActive ? 'gray.600' : undefined
                                    }}
                                    onClick={() => reactNavigate(subModule.path)}
                                  >
                                    <Stack direction="row" align="center" gap="xs" width="100%">
                                      <Icon 
                                        icon={subModule.icon}
                                        size="xs"
                                        {...(isSubModuleActive && { color: 'white' })}
                                        flexShrink={0}
                                      />
                                      <Typography 
                                        variant="caption"
                                        weight={isSubModuleActive ? 'medium' : 'normal'}
                                        {...(isSubModuleActive && { color: 'white' })}
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
                          </Box>
                        </Collapsible.Content>
                      </Collapsible.Root>
                    )}
                  </Box>

                  {/* Subtle separator for visual grouping */}
                  {showSeparator && (
                    <Box
                      height="1px"
                      opacity={0.3}
                      mx="xs"
                      my="xxs"
                    />
                  )}
                  </Fragment>
                );
              })}
            </Stack>
          </Box>

          {/* Theme Toggle Footer - Ultra minimal */}
          <Box 
            mt="auto" 
            p="xs"
          >
            <Stack direction="row" justify={actualShowExpanded ? "flex-end" : "center"}>
              <QuickThemeToggle />
            </Stack>
          </Box>
          
        </SidebarContainer>
    </Box>
  );
}