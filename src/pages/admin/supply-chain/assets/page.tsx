/**
 * ASSETS PAGE
 * Main page for asset management
 *
 * Follows G-Admin architecture patterns:
 * - ContentLayout for semantic structure
 * - Shared UI components
 * - Zustand store for state
 * - EventBus integration
 */

import { ContentLayout, Section, Stack, Heading, Text } from '@/shared/ui';
import { AssetsMetrics } from './components/AssetsMetrics';
import { AssetsManagement } from './components/AssetsManagement';
import { useAssetsPage } from './hooks';

export default function AssetsPage() {
  const { metrics, loading } = useAssetsPage();

  return (
    <ContentLayout>
      <Section>
        <Stack gap={6}>
          {/* Header */}
          <Stack gap={2}>
            <Heading level={1}>Gestión de Assets</Heading>
            <Text variant="secondary">
              Administra tus activos físicos, equipamiento e inventario de alquiler
            </Text>
          </Stack>

          {/* Metrics */}
          <AssetsMetrics metrics={metrics} isLoading={loading} />

          {/* Main Management */}
          <AssetsManagement />
        </Stack>
      </Section>
    </ContentLayout>
  );
}
