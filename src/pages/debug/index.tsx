/**
 * Debug Tools Dashboard - Central hub for all development tools
 * Provides organized access to various debugging and testing utilities
 */

import React from 'react';
import {
  ContentLayout,
  Section,
  Stack,
  Typography,
  Button,
  Badge,
  CardWrapper,
  CardBody,
  CardHeader,
  SimpleGrid,
  Icon
} from '@/shared/ui';
import { useNavigate } from 'react-router-dom';

interface DebugTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  category: 'system' | 'ui' | 'data' | 'performance';
  status: 'stable' | 'beta' | 'experimental';
}

const debugTools: DebugTool[] = [
  // System Tools
  {
    id: 'capabilities',
    title: 'Capabilities Debugger',
    description: 'Debug business capabilities, modules, and feature flags',
    icon: '🎯',
    path: '/debug/capabilities',
    category: 'system',
    status: 'stable'
  },
  {
    id: 'eventbus',
    title: 'EventBus Monitor',
    description: 'Real-time event monitoring, metrics, and module health',
    icon: '📡',
    path: '/debug/eventbus',
    category: 'system',
    status: 'stable'
  },
  {
    id: 'navigation',
    title: 'Navigation Inspector',
    description: 'Inspect navigation state, routes, and modules',
    icon: '🧭',
    path: '/debug/navigation',
    category: 'system',
    status: 'stable'
  },
  {
    id: 'slots',
    title: 'Slots System',
    description: 'Test and debug the modular slot system',
    icon: '🔌',
    path: '/debug/slots',
    category: 'system',
    status: 'stable'
  },

  // UI Tools
  {
    id: 'theme',
    title: 'Theme System',
    description: 'Test themes, tokens, and design system components',
    icon: '🎨',
    path: '/debug/theme',
    category: 'ui',
    status: 'stable'
  },
  {
    id: 'alerts',
    title: 'Alerts System Testing',
    description: 'Test toast stack, NotificationCenter, badges, and animations',
    icon: '🧪',
    path: '/debug/alerts',
    category: 'ui',
    status: 'stable'
  },
  {
    id: 'components',
    title: 'Component Library',
    description: 'Browse and test all UI components',
    icon: '🧩',
    path: '/debug/components',
    category: 'ui',
    status: 'stable'
  },
  {
    id: 'feature-ui-mapping',
    title: 'Feature-UI Mapping',
    description: 'Validate UI components sync with capabilities',
    icon: '🔍',
    path: '/debug/feature-ui-mapping',
    category: 'ui',
    status: 'stable'
  },

  // Data Tools
  {
    id: 'stores',
    title: 'Store Inspector',
    description: 'Inspect Zustand stores, localStorage, and state',
    icon: '📦',
    path: '/debug/stores',
    category: 'data',
    status: 'stable'
  },
  {
    id: 'api',
    title: 'API Inspector',
    description: 'Monitor HTTP calls, responses, and cache with request interception',
    icon: '🌐',
    path: '/debug/api',
    category: 'data',
    status: 'stable'
  },

  // Performance Tools
  {
    id: 'performance',
    title: 'Performance Monitor',
    description: 'Real-time performance metrics, FPS, memory usage, and bundle analysis',
    icon: '⚡',
    path: '/debug/performance',
    category: 'performance',
    status: 'stable'
  },
  {
    id: 'bundle',
    title: 'Bundle Analyzer',
    description: 'Analyze bundle size and dependencies',
    icon: '📊',
    path: '/debug/bundle',
    category: 'performance',
    status: 'experimental'
  }
];

const categoryColors = {
  system: 'blue',
  ui: 'purple',
  data: 'green',
  performance: 'orange'
} as const;

const statusColors = {
  stable: 'green',
  beta: 'yellow',
  experimental: 'red'
} as const;

export default function DebugDashboard() {
  const navigate = useNavigate();

  const toolsByCategory = debugTools.reduce((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, DebugTool[]>);

  const handleToolClick = (path: string) => {
    navigate(path);
  };

  return (
    <ContentLayout spacing="normal">
      <Section variant="flat" title="🛠️ Debug Tools Dashboard">
        <Typography variant="body" color="gray.600" marginBottom="6">
          Development and debugging utilities for G-Admin Mini.
          Available only in development mode.
        </Typography>

        {Object.entries(toolsByCategory).map(([category, tools]) => (
          <Section
            key={category}
            variant="elevated"
            title={`${category.charAt(0).toUpperCase() + category.slice(1)} Tools`}
            style={{ marginBottom: '24px' }}
          >
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="md">
              {tools.map(tool => (
                <CardWrapper
                  key={tool.id}
                  variant="elevated"
                  style={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    ':hover': { transform: 'translateY(-2px)' }
                  }}
                  onClick={() => handleToolClick(tool.path)}
                >
                  <CardWrapper.Header>
                    <Stack direction="row" justify="space-between" align="center">
                      <Stack direction="row" align="center" spacing="sm">
                        <span style={{ fontSize: '24px' }}>{tool.icon}</span>
                        <Typography variant="subtitle">{tool.title}</Typography>
                      </Stack>
                      <Stack direction="row" spacing="xs">
                        <Badge
                          colorPalette={categoryColors[tool.category]}
                          size="sm"
                        >
                          {tool.category}
                        </Badge>
                        <Badge
                          colorPalette={statusColors[tool.status]}
                          size="sm"
                        >
                          {tool.status}
                        </Badge>
                      </Stack>
                    </Stack>
                  </CardWrapper.Header>
                  <CardWrapper.Body>
                    <Typography variant="body" fontSize="sm" color="gray.600">
                      {tool.description}
                    </Typography>
                  </CardWrapper.Body>
                </CardWrapper>
              ))}
            </SimpleGrid>
          </Section>
        ))}

        <Section variant="elevated" title="⚠️ Development Notes">
          <Stack spacing="sm">
            <Typography variant="body" style={{ fontSize: '14px' }}>
              • Debug tools are only available in development mode
            </Typography>
            <Typography variant="body" style={{ fontSize: '14px' }}>
              • Some tools may affect performance - use with caution
            </Typography>
            <Typography variant="body" style={{ fontSize: '14px' }}>
              • Experimental tools may have bugs or incomplete features
            </Typography>
            <Typography variant="body" style={{ fontSize: '14px' }}>
              • Data is not persisted between sessions unless explicitly saved
            </Typography>
          </Stack>
        </Section>
      </Section>
    </ContentLayout>
  );
}