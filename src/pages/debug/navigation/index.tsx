/**
 * Navigation Debugger - Debug navigation state, routes, and modules
 * Provides insights into module visibility, routing, and navigation context
 */

import React, { useState } from 'react';
import {
  ContentLayout,
  Section,
  Stack,
  Typography,
  Badge,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  InputField,
  Box,
  CardWrapper
} from '@/shared/ui';
import { useNavigationState, useNavigationLayout, useNavigationActions } from '@/contexts/NavigationContext';
import { useCapabilities } from '@/store/capabilityStore';
import { useLocation, useNavigate } from 'react-router-dom';

type NavTab = 'current-route' | 'modules' | 'capabilities' | 'routing-tree';

export default function NavigationDebugPage() {
  const [activeTab, setActiveTab] = useState<NavTab>('current-route');
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ Use specialized hooks for debugging
  const navState = useNavigationState();
  const navLayout = useNavigationLayout();
  const navActions = useNavigationActions();
  const capabilities = useCapabilities();
  const location = useLocation();
  const navigate = useNavigate();

  // Combine for easier access in debug view
  const navigation = { ...navState, ...navLayout, ...navActions };

  const tabs = [
    { id: 'current-route' as NavTab, label: 'Current Route', icon: '📍' },
    { id: 'modules' as NavTab, label: 'Modules', icon: '📦' },
    { id: 'capabilities' as NavTab, label: 'Navigation Caps', icon: '🎯' },
    { id: 'routing-tree' as NavTab, label: 'Route Tree', icon: '🌳' }
  ];

  // Generate dynamic routes from navigation modules + static routes
  const staticRoutes = [
    { path: '/', name: 'Landing Page', protected: false, role: 'public', source: 'static' },
    { path: '/admin', name: 'Admin Portal', protected: false, role: 'public', source: 'static' },
    { path: '/login', name: 'Customer Login', protected: false, role: 'public', source: 'static' },
    { path: '/admin/login', name: 'Admin Login', protected: false, role: 'public', source: 'static' },
    { path: '/setup', name: 'Setup Wizard', protected: false, role: 'setup', source: 'static' },
    { path: '/debug', name: 'Debug Dashboard', protected: true, role: 'super_admin', source: 'static' },
    { path: '/debug/capabilities', name: 'Capabilities Debug', protected: true, role: 'super_admin', source: 'static' },
    { path: '/debug/theme', name: 'Theme Debug', protected: true, role: 'super_admin', source: 'static' },
    { path: '/debug/stores', name: 'Store Inspector', protected: true, role: 'super_admin', source: 'static' },
    { path: '/debug/api', name: 'API Inspector', protected: true, role: 'super_admin', source: 'static' },
    { path: '/debug/slots', name: 'Slots Debug', protected: true, role: 'super_admin', source: 'static' },
    { path: '/debug/components', name: 'Components Debug', protected: true, role: 'super_admin', source: 'static' },
    { path: '/debug/performance', name: 'Performance Monitor', protected: true, role: 'super_admin', source: 'static' },
    { path: '/debug/navigation', name: 'Navigation Debug', protected: true, role: 'super_admin', source: 'static' }
  ];

  // Dynamic routes from navigation modules
  const dynamicRoutes = navigation.modules.map(module => ({
    path: module.path,
    name: module.title || module.label || module.id,
    protected: true,
    role: 'admin',
    module: module.id,
    source: 'dynamic',
    visible: module.visible,
    icon: module.icon?.name || 'unknown'
  }));

  // All routes combined
  const allRoutes = [...staticRoutes, ...dynamicRoutes];

  const filteredModules = navigation.modules.filter(module =>
    (module.label?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (module.id?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const filteredRoutes = allRoutes.filter(route =>
    (route.path?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (route.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const getCurrentRouteInfo = () => {
    const currentRoute = allRoutes.find(route => route.path === location.pathname);
    return currentRoute || {
      path: location.pathname,
      name: 'Unknown Route',
      protected: false,
      role: 'unknown'
    };
  };

  const currentRoute = getCurrentRouteInfo();

  const getModuleStatusColor = (moduleId: string) => {
    const isVisible = navigation.modules.some(m => m.id === moduleId);
    const hasCapability = capabilities.hasModule && capabilities.hasModule(moduleId);

    if (isVisible && hasCapability) return 'green';
    if (isVisible) return 'yellow';
    return 'red';
  };

  const getModuleStatusText = (moduleId: string) => {
    const isVisible = navigation.modules.some(m => m.id === moduleId);
    const hasCapability = capabilities.hasModule && capabilities.hasModule(moduleId);

    if (isVisible && hasCapability) return 'ACTIVE';
    if (isVisible) return 'VISIBLE';
    if (hasCapability) return 'HAS_CAP';
    return 'HIDDEN';
  };

  return (
    <ContentLayout spacing="normal">
      <Section variant="flat" title="🧭 Navigation Debugger">
        <Stack spacing="md">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <InputField
              placeholder="Search modules and routes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="sm"
              style={{ maxWidth: '300px' }}
            />
            <Stack direction="row" spacing="sm">
              <Badge colorPalette="blue">
                {navigation.modules.length} modules visible
              </Badge>
              <Badge colorPalette="purple">
                Current: {location.pathname}
              </Badge>
            </Stack>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as NavTab)}
            variant="line"
            colorPalette="blue"
          >
            <TabsList>
              {tabs.map(tab => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                >
                  <span style={{ marginRight: '8px' }}>{tab.icon}</span>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

              <TabsContent value="current-route" padding="md" style={{ marginTop: '20px' }}>
                <Stack spacing="md">
                  <Typography variant="subtitle">Current Route Information</Typography>

                  <CardWrapper variant="elevated">
                    <CardWrapper.Header>
                      <Typography variant="subtitle">Route Details</Typography>
                    </CardWrapper.Header>
                    <CardWrapper.Body>
                      <Stack spacing="sm">
                        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '8px', alignItems: 'center' }}>
                          <Typography variant="body" style={{ fontWeight: 'bold' }}>Path:</Typography>
                          <Typography variant="body" style={{ fontFamily: 'monospace' }}>{location.pathname}</Typography>

                          <Typography variant="body" style={{ fontWeight: 'bold' }}>Name:</Typography>
                          <Typography variant="body">{currentRoute.name}</Typography>

                          <Typography variant="body" style={{ fontWeight: 'bold' }}>Protected:</Typography>
                          <Badge colorPalette={currentRoute.protected ? 'red' : 'green'}>
                            {currentRoute.protected ? 'YES' : 'NO'}
                          </Badge>

                          <Typography variant="body" style={{ fontWeight: 'bold' }}>Role:</Typography>
                          <Badge colorPalette="blue">{currentRoute.role}</Badge>

                          {currentRoute.module && (
                            <>
                              <Typography variant="body" style={{ fontWeight: 'bold' }}>Module:</Typography>
                              <Badge colorPalette="purple">{currentRoute.module}</Badge>
                            </>
                          )}

                          <Typography variant="body" style={{ fontWeight: 'bold' }}>Search:</Typography>
                          <Typography variant="body" style={{ fontFamily: 'monospace' }}>{location.search || 'None'}</Typography>

                          <Typography variant="body" style={{ fontWeight: 'bold' }}>Hash:</Typography>
                          <Typography variant="body" style={{ fontFamily: 'monospace' }}>{location.hash || 'None'}</Typography>
                        </div>
                      </Stack>
                    </CardWrapper.Body>
                  </CardWrapper>

                  <CardWrapper variant="elevated">
                    <CardWrapper.Header>
                      <Typography variant="subtitle">Navigation State</Typography>
                    </CardWrapper.Header>
                    <CardWrapper.Body>
                      <Stack spacing="sm">
                        <div>
                          <Typography variant="body" style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                            Location State:
                          </Typography>
                          <Box
                            as="pre"
                            bg="gray.100"
                            p="2"
                            borderRadius="sm"
                            fontSize="xs"
                            fontFamily="mono"
                            overflow="auto"
                            maxHeight="200px"
                            whiteSpace="pre"
                            wordBreak="break-word"
                          >
                            {JSON.stringify(location.state, null, 2) || 'null'}
                          </Box>
                        </div>
                      </Stack>
                    </CardWrapper.Body>
                  </CardWrapper>
                </Stack>
              </TabsContent>

              <TabsContent value="modules" padding="md" style={{ marginTop: '20px' }}>
                <Stack spacing="md">
                  <Typography variant="subtitle">Available Modules ({filteredModules.length})</Typography>

                  {filteredModules.map(module => (
                    <CardWrapper key={module.id} variant="elevated">
                      <CardWrapper.Header>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Stack direction="row" spacing="sm" align="center">
                            {module.icon && React.createElement(module.icon, { className: 'w-5 h-5' })}
                            <div>
                              <Typography variant="body" style={{ fontWeight: 'bold' }}>
                                {module.label}
                              </Typography>
                              <Typography variant="body" style={{ fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>
                                {module.id}
                              </Typography>
                            </div>
                          </Stack>
                          <Stack direction="row" spacing="xs">
                            <Badge colorPalette={getModuleStatusColor(module.id)}>
                              {getModuleStatusText(module.id)}
                            </Badge>
                            <Button
                              size="xs"
                              onClick={() => navigate(module.href)}
                              disabled={!module.href}
                            >
                              Navigate
                            </Button>
                          </Stack>
                        </div>
                      </CardWrapper.Header>
                      <CardWrapper.Body>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '12px' }}>
                          <Typography variant="body" style={{ fontWeight: 'bold' }}>Href:</Typography>
                          <Typography variant="body" style={{ fontFamily: 'monospace' }}>{module.href}</Typography>

                          <Typography variant="body" style={{ fontWeight: 'bold' }}>Order:</Typography>
                          <Typography variant="body">{module.order}</Typography>

                          <Typography variant="body" style={{ fontWeight: 'bold' }}>Visible:</Typography>
                          <Badge colorPalette={module.visible ? 'green' : 'red'} size="sm">
                            {module.visible ? 'YES' : 'NO'}
                          </Badge>
                        </div>
                      </CardWrapper.Body>
                    </CardWrapper>
                  ))}
                </Stack>
              </TabsContent>

              <TabsContent value="capabilities" padding="md" style={{ marginTop: '20px' }}>
                <Stack spacing="md">
                  <Typography variant="subtitle">Navigation Capabilities</Typography>

                  <CardWrapper variant="elevated">
                    <CardWrapper.Header>
                      <Typography variant="subtitle">Capability System Status</Typography>
                    </CardWrapper.Header>
                    <CardWrapper.Body>
                      <Stack spacing="sm">
                        <div>
                          <Typography variant="body" style={{ fontWeight: 'bold' }}>
                            Active Capabilities: {capabilities.activeCapabilities ? capabilities.activeCapabilities.length : 0}
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="body" style={{ fontWeight: 'bold' }}>
                            Resolved Capabilities: {capabilities.resolvedCapabilities ? capabilities.resolvedCapabilities.length : 0}
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="body" style={{ fontWeight: 'bold' }}>
                            Business Model: {capabilities.businessModel || 'Not set'}
                          </Typography>
                        </div>
                        <div>
                          <Typography variant="body" style={{ fontWeight: 'bold' }}>
                            Enabled Modules: {capabilities.enabledModules ? capabilities.enabledModules.length : 0}
                          </Typography>
                        </div>
                      </Stack>
                    </CardWrapper.Body>
                  </CardWrapper>

                  <CardWrapper variant="elevated">
                    <CardWrapper.Header>
                      <Typography variant="subtitle">Module Capability Check</Typography>
                    </CardWrapper.Header>
                    <CardWrapper.Body>
                      <Typography variant="body" style={{ fontSize: '12px', marginBottom: '8px' }}>
                        Testing hasModule function for each visible module:
                      </Typography>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                        {navigation.modules.map(module => (
                          <div key={module.id} style={{
                            padding: '8px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '4px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <Typography variant="body" style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                              {module.id}
                            </Typography>
                            <Badge
                              colorPalette={capabilities.hasModule && capabilities.hasModule(module.id) ? 'green' : 'red'}
                              size="sm"
                            >
                              {capabilities.hasModule && capabilities.hasModule(module.id) ? 'HAS' : 'NO'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardWrapper.Body>
                  </CardWrapper>
                </Stack>
              </TabsContent>

              <TabsContent value="routing-tree" padding="md" style={{ marginTop: '20px' }}>
                <Stack spacing="md">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <Typography variant="subtitle">Application Route Tree</Typography>
                    <Badge colorPalette="blue" size="lg">
                      Total: {filteredRoutes.length}
                    </Badge>
                    <Badge colorPalette="green" size="md">
                      Dynamic: {filteredRoutes.filter(r => r.source === 'dynamic').length}
                    </Badge>
                    <Badge colorPalette="gray" size="md">
                      Static: {filteredRoutes.filter(r => r.source === 'static').length}
                    </Badge>
                    <Badge colorPalette="orange" size="md">
                      Hidden: {filteredRoutes.filter(r => r.visible === false).length}
                    </Badge>
                  </div>

                  {filteredRoutes.map(route => (
                    <CardWrapper key={route.path} variant="elevated" style={{
                      borderLeft: route.path === location.pathname ? '4px solid #3b82f6' : '4px solid transparent'
                    }}>
                      <CardWrapper.Header>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Stack direction="row" spacing="sm" align="center">
                            <Typography variant="body" style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                              {route.path}
                            </Typography>
                            <Typography variant="body" style={{ color: '#666' }}>
                              {route.name}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing="xs">
                            <Badge colorPalette={route.source === 'dynamic' ? 'green' : 'gray'} size="sm">
                              {route.source === 'dynamic' ? 'DYNAMIC' : 'STATIC'}
                            </Badge>
                            <Badge colorPalette={route.protected ? 'red' : 'green'} size="sm">
                              {route.protected ? 'Protected' : 'Public'}
                            </Badge>
                            <Badge colorPalette="blue" size="sm">
                              {route.role}
                            </Badge>
                            {route.module && (
                              <Badge colorPalette="purple" size="sm">
                                {route.module}
                              </Badge>
                            )}
                            {route.visible !== undefined && (
                              <Badge colorPalette={route.visible ? 'green' : 'orange'} size="sm">
                                {route.visible ? 'VISIBLE' : 'HIDDEN'}
                              </Badge>
                            )}
                            {route.path === location.pathname && (
                              <Badge colorPalette="green" size="sm">CURRENT</Badge>
                            )}
                            <Button
                              size="xs"
                              onClick={() => navigate(route.path)}
                              disabled={route.path === location.pathname}
                            >
                              Go
                            </Button>
                          </Stack>
                        </div>
                      </CardWrapper.Header>
                    </CardWrapper>
                  ))}
                </Stack>
              </TabsContent>
          </Tabs>
        </Stack>
      </Section>
    </ContentLayout>
  );
}