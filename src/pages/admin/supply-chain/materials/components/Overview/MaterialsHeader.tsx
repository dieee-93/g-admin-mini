import { StatsSection, CardGrid, MetricCard, Button, Badge, Section } from '@/shared/ui';
import { PlusIcon, ChartBarIcon, CubeIcon, ExclamationTriangleIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useMaterials } from '@/store/materialsStore';

interface MaterialsHeaderProps {
  onAddItem: () => void;
  onShowAnalytics?: () => void;
  itemCount?: number;
}

export const MaterialsHeader = ({ onAddItem, onShowAnalytics }: MaterialsHeaderProps) => {
  const { stats } = useMaterials();

  return (
    <Section variant="flat">
      {onShowAnalytics && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <Button
            variant="outline"
            size="md"
            onClick={onShowAnalytics}
          >
            <ChartBarIcon className="w-4 h-4" />
            Analytics
          </Button>
        </div>
      )}

      <StatsSection>
        <CardGrid columns={{ base: 1, md: 5 }}>
          <MetricCard 
            title="Total Items"
            value={stats.totalItems?.toString()}
            icon={CubeIcon}
          />
          <MetricCard 
            title="Valor Total"
            value={`$${stats.totalValue.toLocaleString()}`}
            icon={CurrencyDollarIcon}
          />
          <MetricCard 
            title="Stock Bajo"
            value={stats.lowStockCount?.toString()}
            icon={ExclamationTriangleIcon}
            colorPalette={stats.lowStockCount > 0 ? "orange" : undefined}
            badge={stats.lowStockCount > 0 ? (
              <Badge colorPalette="orange" size="sm">
                {stats.lowStockCount}
              </Badge>
            ) : undefined}
          />
          <MetricCard 
            title="Stock Crítico"
            value={stats.criticalStockCount?.toString()}
            icon={ExclamationTriangleIcon}
            colorPalette={stats.criticalStockCount > 0 ? "red" : undefined}
            badge={stats.criticalStockCount > 0 ? (
              <Badge colorPalette="red" size="sm">
                {stats.criticalStockCount}
              </Badge>
            ) : undefined}
          />
          <MetricCard 
            title="Sin Stock"
            value={stats.outOfStockCount?.toString()}
            icon={ExclamationTriangleIcon}
            colorPalette={stats.outOfStockCount > 0 ? "red" : undefined}
            badge={stats.outOfStockCount > 0 ? (
              <Badge colorPalette="red" size="sm">
                {stats.outOfStockCount}
              </Badge>
            ) : undefined}
          />
        </CardGrid>
      </StatsSection>
    </Section>
  );
};