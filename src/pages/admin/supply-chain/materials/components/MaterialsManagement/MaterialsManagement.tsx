import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@/shared/ui';
import { InventoryTab } from './InventoryTab';
import { ABCAnalysisTab } from './ABCAnalysisTab';
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
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      variant="line"
      colorPalette="blue"
      size="md"
      isLazy
      lazyBehavior="keepMounted"
    >
      <TabList gap="sm">
        <Tab value="inventory">
          Inventario
        </Tab>
        <Tab value="analytics">
          Análisis ABC
        </Tab>
        <Tab value="procurement">
          Compras
        </Tab>
      </TabList>

      <TabPanels>
        <TabPanel value="inventory" padding="md">
          <InventoryTab
            onStockUpdate={onStockUpdate}
            onBulkAction={onBulkAction}
            onAddMaterial={onAddMaterial}
            performanceMode={performanceMode}
          />
        </TabPanel>

        <TabPanel value="analytics" padding="md">
          <ABCAnalysisTab />
        </TabPanel>

        <TabPanel value="procurement" padding="md">
          <ProcurementTab />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}