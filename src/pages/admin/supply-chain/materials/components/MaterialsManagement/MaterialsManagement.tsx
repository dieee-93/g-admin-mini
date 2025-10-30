import { Tabs } from '@/shared/ui';
import { InventoryTabEnhanced } from './InventoryTabEnhanced';
import { AnalyticsTabEnhanced } from './AnalyticsTabEnhanced';
import { ProcurementTab } from './ProcurementTab';

interface MaterialsManagementProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onStockUpdate: (itemId: string, newStock: number) => Promise<void>;
  onBulkAction: (action: string, itemIds: string[]) => Promise<void>;
  onAddMaterial?: () => void;
  performanceMode?: boolean;
}

export function MaterialsManagement({
  activeTab,
  onTabChange,
  onStockUpdate,
  onBulkAction,
  onAddMaterial,
  performanceMode = false
}: MaterialsManagementProps) {
  return (
    <Tabs.Root
      value={activeTab}
      onValueChange={(details) => onTabChange(details.value)}
      variant="line"
      colorPalette="blue"
      size="md"
      lazyMount
      unmountOnExit={false}
    >
      <Tabs.List gap="sm">
        <Tabs.Trigger value="inventory">
          Inventario
        </Tabs.Trigger>
        <Tabs.Trigger value="analytics">
          Análisis ABC
        </Tabs.Trigger>
        <Tabs.Trigger value="procurement">
          Compras
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="inventory" padding="md">
        <InventoryTabEnhanced
          onStockUpdate={onStockUpdate}
          onBulkAction={onBulkAction}
          onAddMaterial={onAddMaterial}
          performanceMode={performanceMode}
        />
      </Tabs.Content>

      <Tabs.Content value="analytics" padding="md">
        <AnalyticsTabEnhanced />
      </Tabs.Content>

      <Tabs.Content value="procurement" padding="md">
        <ProcurementTab />
      </Tabs.Content>
    </Tabs.Root>
  );
}