/**
 * DEBUG PAGE - Development & Diagnostic Tools
 *
 * SUPER_ADMIN only - Development and debugging tools
 *
 * Features:
 * - EventBus activity monitor
 * - Module Registry inspector
 * - Performance metrics
 * - Store state debugger
 * - Console helper integration
 * - Theme/token inspector
 *
 * @security SUPER_ADMIN only
 * @environment Development mode only
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Tabs,
  Badge,
  Alert,
} from '@/shared/ui';
import { useAuth } from '@/contexts/AuthContext';
import { ContentLayout } from '@/components/layouts/ContentLayout';
import { logger } from '@/lib/logging';

// Lazy load debug components
import { StoreDebugger } from '@/components/debug/StoreDebugger';
import { TokenTest } from '@/components/debug/TokenTest';
import { PerformanceDashboard } from '@/lib/performance/components/PerformanceDashboard';

// Tool tabs
const DEBUG_TOOLS = [
  { id: 'overview', label: 'Overview', icon: '🏠' },
  { id: 'performance', label: 'Performance', icon: '⚡' },
  { id: 'stores', label: 'Stores', icon: '📦' },
  { id: 'theme', label: 'Theme/Tokens', icon: '🎨' },
  { id: 'console', label: 'Console Helper', icon: '🖥️' },
] as const;

export function DebugPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Security check: SUPER_ADMIN only
  if (user?.role !== 'SUPER_ADMIN') {
    logger.warn('App', '⚠️ Unauthorized access to debug tools blocked', { role: user?.role });
    navigate('/admin/dashboard');
    return null;
  }

  // Hide in production
  if (import.meta.env.PROD) {
    logger.warn('App', '⚠️ Debug tools disabled in production');
    navigate('/admin/dashboard');
    return null;
  }

  logger.debug('App', '🐛 Debug page loaded', { user: user?.email, activeTab });

  return (
    <ContentLayout
      title="Debug Tools"
      subtitle="Development & Diagnostic Tools (SUPER_ADMIN Only)"
    >
      <VStack gap={6} align="stretch">
        {/* Security Notice */}
        <Alert.Root status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Development Mode Only</Alert.Title>
            <Alert.Description>
              These tools are only available in development mode and for SUPER_ADMIN users.
              Never expose sensitive data (passwords, tokens, API keys).
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>

        {/* Tool Tabs */}
        <Tabs.Root value={activeTab} onValueChange={(e) => setActiveTab(e.value)}>
          <Tabs.List>
            {DEBUG_TOOLS.map((tool) => (
              <Tabs.Trigger key={tool.id} value={tool.id}>
                <HStack gap={2}>
                  <Text>{tool.icon}</Text>
                  <Text>{tool.label}</Text>
                </HStack>
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {/* Overview Tab */}
          <Tabs.Content value="overview">
            <VStack gap={4} align="stretch">
              <Box>
                <Heading size="lg" mb={4}>System Overview</Heading>
                <VStack gap={3} align="start">
                  <HStack>
                    <Badge colorPalette="green">Environment</Badge>
                    <Text>{import.meta.env.MODE}</Text>
                  </HStack>
                  <HStack>
                    <Badge colorPalette="blue">Node ENV</Badge>
                    <Text>{process.env.NODE_ENV}</Text>
                  </HStack>
                  <HStack>
                    <Badge colorPalette="purple">User Role</Badge>
                    <Text>{user?.role}</Text>
                  </HStack>
                  <HStack>
                    <Badge colorPalette="orange">User Email</Badge>
                    <Text>{user?.email}</Text>
                  </HStack>
                </VStack>
              </Box>

              <Box>
                <Heading size="md" mb={3}>Available Tools</Heading>
                <VStack gap={2} align="start">
                  {DEBUG_TOOLS.slice(1).map((tool) => (
                    <HStack key={tool.id}>
                      <Text>{tool.icon}</Text>
                      <Text fontSize="sm">{tool.label}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>

              <Box>
                <Heading size="md" mb={3}>Console Helper (window.__CONSOLE_HELPER__)</Heading>
                <VStack gap={2} align="start" fontSize="sm" fontFamily="mono">
                  <Text>__CONSOLE_HELPER__.getErrors(10) - Get last 10 errors</Text>
                  <Text>__CONSOLE_HELPER__.getTopModules(5) - Top 5 active modules</Text>
                  <Text>__CONSOLE_HELPER__.getByModule("Materials", 20) - Module logs</Text>
                  <Text>__CONSOLE_HELPER__.exportForAI(&#123; level: "error" &#125;) - Export for AI</Text>
                  <Text>__CONSOLE_HELPER__.getSummary() - Statistics summary</Text>
                </VStack>
              </Box>
            </VStack>
          </Tabs.Content>

          {/* Performance Tab */}
          <Tabs.Content value="performance">
            <PerformanceDashboard />
          </Tabs.Content>

          {/* Stores Tab */}
          <Tabs.Content value="stores">
            <StoreDebugger />
          </Tabs.Content>

          {/* Theme Tab */}
          <Tabs.Content value="theme">
            <TokenTest />
          </Tabs.Content>

          {/* Console Helper Tab */}
          <Tabs.Content value="console">
            <VStack gap={4} align="stretch">
              <Heading size="lg">Console Helper</Heading>
              <Alert.Root status="info">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>Browser Console Only</Alert.Title>
                  <Alert.Description>
                    Open browser DevTools console and use window.__CONSOLE_HELPER__ commands
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
              <Box p={4} bg="gray.50" borderRadius="md" fontFamily="mono" fontSize="sm">
                <VStack gap={2} align="start">
                  <Text fontWeight="bold">Available Commands:</Text>
                  <Text>window.__CONSOLE_HELPER__.getErrors(limit)</Text>
                  <Text>window.__CONSOLE_HELPER__.getTopModules(limit)</Text>
                  <Text>window.__CONSOLE_HELPER__.getByModule(moduleName, limit)</Text>
                  <Text>window.__CONSOLE_HELPER__.exportForAI(options)</Text>
                  <Text>window.__CONSOLE_HELPER__.getSummary()</Text>
                </VStack>
              </Box>
            </VStack>
          </Tabs.Content>
        </Tabs.Root>
      </VStack>
    </ContentLayout>
  );
}

export default DebugPage;
