import { Tabs } from '@/shared/ui';
import { InventoryTab } from './index'; // ✅ Virtual scrolling version (auto-switches at 50+ items)
import { AnalyticsTabEnhanced } from './AnalyticsTabEnhanced';
import { ProcurementTab } from './ProcurementTab';
import { TransfersTab } from './TransfersTab';
import { HookPoint } from '@/lib/modules';
import { useCallback, memo } from 'react';

interface MaterialsManagementProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onStockUpdate: (itemId: string, newStock: number) => Promise<void>;
  onBulkAction: (action: string, itemIds: string[]) => Promise<void>;
  onAddMaterial?: () => void;
  performanceMode?: boolean;
}

// ✅ PERFORMANCE: Memoize to prevent unnecessary re-renders
export const MaterialsManagement = memo(function MaterialsManagement({
  activeTab,
  onTabChange,
  onStockUpdate,
  onBulkAction,
  onAddMaterial,
  performanceMode = false
}: MaterialsManagementProps) {
  // ✅ PERFORMANCE: Stabilize onValueChange callback to prevent TabsContext thrashing
  const handleTabChange = useCallback((details: { value: string }) => {
    onTabChange(details.value);
MaterialsManagement.displayName = 'MaterialsManagement';
  }, [onTabChange]);

  return (
    <Tabs.Root
      value={activeTab}
      onValueChange={handleTabChange}
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
        <Tabs.Trigger value="transfers">
          Transferencias 🏢
        </Tabs.Trigger>

        {/* Hook point for cross-module tabs (e.g., Suppliers tab, Products tab) */}
        <HookPoint
          name="materials.tabs"
          data={{ activeTab, onTabChange }}
          direction="row"
          gap="0"
          fallback={null}
        />
      </Tabs.List>

      <Tabs.Content value="inventory" padding="md">
        <InventoryTab
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

      <Tabs.Content value="transfers" padding="md">
        <TransfersTab />
      </Tabs.Content>

      {/* Hook point for cross-module tab content (e.g., Suppliers content, Products content) */}
      <HookPoint
        name="materials.tab_content"
        data={{ activeTab }}
        fallback={null}
      />
    </Tabs.Root>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent re-renders when props haven't meaningfully changed
  return (
    prevProps.activeTab === nextProps.activeTab &&
    prevProps.onTabChange === nextProps.onTabChange &&
    prevProps.onStockUpdate === nextProps.onStockUpdate &&
    prevProps.onBulkAction === nextProps.onBulkAction &&
    prevProps.onAddMaterial === nextProps.onAddMaterial &&
    prevProps.performanceMode === nextProps.performanceMode
  );
});