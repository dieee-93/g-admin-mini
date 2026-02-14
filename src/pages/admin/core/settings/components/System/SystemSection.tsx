// SystemSection.tsx - System Settings with Theme Configuration
import React from 'react';
import {
  Stack, Typography, CardWrapper, Section, Badge, SimpleGrid, Icon, Button
} from '@/shared/ui';
import {
  PaintBrushIcon,
  ComputerDesktopIcon,
  CogIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { availableThemes } from '@/store/themeStore';

export const SystemSection: React.FC = () => {
  const systemInfo = {
    version: 'v2.1.0',
    environment: 'Production',
    build: '2025.01.13',
    uptime: '7 días, 12 horas'
  };

  return (
    <Section variant="elevated" title="Configuraciones del Sistema" icon={CogIcon}>
        <Stack direction="column" gap="xl">
          {/* Theme Configuration */}
          <CardWrapper variant="outline" >
            <CardWrapper.Header>
              <Stack direction="row" gap="sm" align="center">
                <Icon icon={PaintBrushIcon} size="md" />
                <Typography variant="heading" level={4}>Themes & Appearance</Typography>
              </Stack>
            </CardWrapper.Header>
            <CardWrapper.Body>
              <Stack direction="column" gap="md">
                <Typography variant="body" color="text.secondary">
                  Personaliza la apariencia con {availableThemes.length} themes disponibles.
                </Typography>
                <ThemeToggle />
                <Typography variant="caption" color="text.muted">
                  Los cambios se aplican instantáneamente.
                </Typography>
              </Stack>
              <Button size="md" variant={'subtle'}>
                <Icon icon={CogIcon} size="sm" />
                Guardar Cambios
              </Button>
            </CardWrapper.Body>
          </CardWrapper>

          {/* System Status */}
          <CardWrapper variant="outline" >
            <CardWrapper.Header>
              <Stack direction="row" gap="sm" align="center">
                <Icon icon={ComputerDesktopIcon} size="md" />
                <Typography variant="heading" level={4}>System Status</Typography>
                <Badge variant="solid" colorPalette="green" size="sm">Operativo</Badge>
              </Stack>
            </CardWrapper.Header>
            <CardWrapper.Body>
              <SimpleGrid columns={{ base: 2, md: 4 }} gap="md">
                <Stack align="center" gap="xs">
                  <Typography variant="caption" color="text.secondary">Uptime</Typography>
                  <Typography variant="body" weight="bold">{systemInfo.uptime}</Typography>
                </Stack>
                <Stack align="center" gap="xs">
                  <Typography variant="caption" color="text.secondary">Version</Typography>
                  <Typography variant="body" weight="bold">{systemInfo.version}</Typography>
                </Stack>
                <Stack align="center" gap="xs">
                  <Typography variant="caption" color="text.secondary">Environment</Typography>
                  <Typography variant="body" weight="bold">{systemInfo.environment}</Typography>
                </Stack>
                <Stack align="center" gap="xs">
                  <Typography variant="caption" color="text.secondary">Build</Typography>
                  <Typography variant="body" weight="bold">{systemInfo.build}</Typography>
                </Stack>
              </SimpleGrid>
            </CardWrapper.Body>
          </CardWrapper>

          {/* System Information */}
          <CardWrapper variant="outline" >
            <CardWrapper.Header>
              <Stack direction="row" gap="sm" align="center">
                <Icon icon={InformationCircleIcon} size="md" />
                <Typography variant="heading" level={4}>System Information</Typography>
              </Stack>
            </CardWrapper.Header>
            <CardWrapper.Body>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="lg">
                <Stack gap="sm">
                  <Typography variant="body" weight="medium">Application</Typography>
                  <Stack gap="xs">
                    <Stack direction="row" justify="space-between">
                      <Typography variant="caption" color="text.secondary">Database</Typography>
                      <Typography variant="caption">PostgreSQL 15.2</Typography>
                    </Stack>
                    <Stack direction="row" justify="space-between">
                      <Typography variant="caption" color="text.secondary">Storage</Typography>
                      <Typography variant="caption">120GB / 280GB</Typography>
                    </Stack>
                  </Stack>
                </Stack>
                
                <Stack gap="sm">
                  <Typography variant="body" weight="medium">Framework</Typography>
                  <Stack gap="xs">
                    <Stack direction="row" justify="space-between">
                      <Typography variant="caption" color="text.secondary">React</Typography>
                      <Typography variant="caption">v18.2.0</Typography>
                    </Stack>
                    <Stack direction="row" justify="space-between">
                      <Typography variant="caption" color="text.secondary">Chakra UI</Typography>
                      <Typography variant="caption">v3.23.0</Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </SimpleGrid>
            </CardWrapper.Body>
          </CardWrapper>
        </Stack>
    </Section>
  );
};