import { Stack, Button } from '@/shared/ui';
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
    <Stack direction="column" gap="md">
      {/* Simple Tab Navigation */}
      <Stack direction="row" gap="sm">
        <Button
          variant={activeTab === 'inventory' ? 'solid' : 'outline'}
          onClick={() => onTabChange('inventory')}
        >
          Inventario
        </Button>
        <Button
          variant={activeTab === 'analytics' ? 'solid' : 'outline'}
          onClick={() => onTabChange('analytics')}
        >
          Análisis ABC
        </Button>
        <Button
          variant={activeTab === 'procurement' ? 'solid' : 'outline'}
          onClick={() => onTabChange('procurement')}
        >
          Compras
        </Button>
      </Stack>

      {/* Tab Content */}
      <Stack>
        {activeTab === 'inventory' && (
          <InventoryTab
            onStockUpdate={onStockUpdate}
            onBulkAction={onBulkAction}
            onAddMaterial={onAddMaterial}
            performanceMode={performanceMode}
          />
        )}

        {activeTab === 'analytics' && <ABCAnalysisTab />}

        {activeTab === 'procurement' && <ProcurementTab />}
      </Stack>
    </Stack>
  );
}