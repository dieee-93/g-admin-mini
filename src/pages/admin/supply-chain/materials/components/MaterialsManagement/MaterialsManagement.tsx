import { Tabs } from '@/shared/ui';
import { InventoryTab } from './index'; // ✅ Virtual scrolling version (auto-switches at 50+ items)
import { AnalyticsTabEnhanced } from './AnalyticsTabEnhanced';
import { ProcurementTab } from './ProcurementTab';
import { TransfersTab } from './TransfersTab';
import { HookPoint } from '@/lib/modules';
import { useCallback, memo } from 'react';

interface MaterialsManagementProps {
  items: any[]; // ✅ Propagate items (typing as any[] temporarily to avoid deep imports, or import MaterialItem)
  activeTab: string;
  onTabChange: (tab: string) => void;
  onStockUpdate: (itemId: string, newStock: number) => Promise<void>;
  onBulkAction: (action: string, itemIds: string[]) => Promise<void>;
  onAddMaterial?: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  performanceMode?: boolean;
}

// ✅ PERFORMANCE: Memoize to prevent unnecessary re-renders
export const MaterialsManagement = memo(function MaterialsManagement({
  items, // ✅ Received from page
  activeTab,
  onTabChange,
  onStockUpdate,
  onBulkAction,
  onAddMaterial,
  onEdit,
  onDelete,
  performanceMode = false
}: MaterialsManagementProps) {
  // ✅ PERFORMANCE: Stabilize onValueChange callback to prevent TabsContext thrashing
  const handleTabChange = useCallback((details: { value: string }) => {
    onTabChange(details.value);
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
      data-testid="materials-management-tabs"
    >
      <Tabs.List gap="sm">
        <Tabs.Trigger value="inventory" data-testid="tab-inventory">
          Inventario
        </Tabs.Trigger>
        <Tabs.Trigger value="analytics" data-testid="abc-analysis-tab">
          Análisis ABC
        </Tabs.Trigger>
        <Tabs.Trigger value="procurement" data-testid="tab-procurement">
          Compras
        </Tabs.Trigger>
        <Tabs.Trigger value="transfers" data-testid="tab-transfers">
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
          items={items} // ✅ Pass items
          onStockUpdate={onStockUpdate}
          onBulkAction={onBulkAction}
          onAddMaterial={onAddMaterial}
          onEdit={onEdit}
          onDelete={onDelete}
          performanceMode={performanceMode}
        />
      </Tabs.Content>

      <Tabs.Content value="analytics" padding="md">
        <AnalyticsTabEnhanced items={items} />
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