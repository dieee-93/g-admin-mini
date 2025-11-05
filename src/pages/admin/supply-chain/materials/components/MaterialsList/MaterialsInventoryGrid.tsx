// MaterialsInventoryGrid.tsx - Virtualized inventory grid with smart filtering
import React, { useMemo } from 'react';
import {
  Section, Stack, Typography, InputField, SelectField, Alert, Badge, Button
} from '@/shared/ui';
import {
  ExclamationTriangleIcon,
  CubeIcon,
  PencilIcon,
  EyeIcon,
  PlusIcon,
  ScaleIcon,
  HashtagIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { type InventoryItem } from '@/lib/ml/inventory/PredictiveInventory'; 
import { VirtualizedList } from '@/lib/performance';
import { StockCalculation } from '@/business-logic/inventory/stockCalculation';
interface MaterialsInventoryGridProps {
  items: InventoryItem[];
  searchTerm: string;
  typeFilter: string;
  onSearchChange: (term: string) => void;
  onTypeFilterChange: (type: string) => void;
  onEditItem: (item: InventoryItem) => void;
  onAddStock: (item: InventoryItem) => void;
  onViewDetails: (item: InventoryItem) => void;
}

const typeFilterOptions = [
  { label: 'Todos los tipos', value: 'all' },
  { label: 'Conmensurables', value: 'MEASURABLE' },
  { label: 'Contables', value: 'COUNTABLE' },
  { label: 'Elaborados', value: 'ELABORATED' }
];

export function MaterialsInventoryGrid({
  items,
  searchTerm,
  typeFilter,
  onSearchChange,
  onTypeFilterChange,
  onEditItem,
  onAddStock,
  onViewDetails
}: MaterialsInventoryGridProps) {
  // Filter items with memoization for performance
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [items, searchTerm, typeFilter]);

  const criticalItems = useMemo(() => 
    filteredItems.filter(item => getStockStatusForDisplay(item).severity === 'critical'),
    [filteredItems]
  );

  const getStockStatusForDisplay = (item: InventoryItem) => {
    const status = StockCalculation.getStockStatus(item);
    const colorMap = { 'green': 'green', 'yellow': 'yellow', 'orange': 'red', 'red': 'red' };
    const rawColor = StockCalculation.getStatusColor(status);
    const color = colorMap[rawColor.split('.')[0] as keyof typeof colorMap] || 'green';
    const label = StockCalculation.getStatusLabel(status);
    const severity = status === 'out' || status === 'critical' ? 'critical' : 
                    status === 'low' ? 'warning' : 'ok';
    return { color, label, severity };
  };

  const formatQuantity = (quantity: number, unit: string, item: InventoryItem): string => {
    if (item.type === 'MEASURABLE') {
      if (item.category === 'weight') {
        if (quantity >= 1000) return `${(quantity / 1000).toFixed(1)} ton`;
        if (quantity >= 1) return `${quantity} kg`;
        return `${(quantity * 1000).toFixed(0)} g`;
      }
      if (item.category === 'volume') {
        if (quantity >= 1) return `${quantity} L`;
        return `${(quantity * 1000).toFixed(0)} ml`;
      }
      if (item.category === 'length') {
        if (quantity >= 1000) return `${(quantity / 1000).toFixed(1)} km`;
        if (quantity >= 1) return `${quantity} m`;
        return `${(quantity * 10).toFixed(0)} cm`;
      }
    }
    
    if (item.type === 'COUNTABLE' && item.packaging) {
      const packages = Math.floor(quantity / item.packaging.package_size);
      const remaining = quantity % item.packaging.package_size;
      if (packages > 0 && remaining > 0) {
        return `${packages} ${item.packaging.package_unit}${packages !== 1 ? 's' : ''} + ${remaining} unidades`;
      }
      if (packages > 0) {
        return `${packages} ${item.packaging.package_unit}${packages !== 1 ? 's' : ''}`;
      }
    }
    
    return `${quantity} ${unit}${quantity !== 1 ? 's' : ''}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'MEASURABLE': return ScaleIcon;
      case 'COUNTABLE': return HashtagIcon;
      case 'ELABORATED': return BeakerIcon;
      default: return CubeIcon;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MEASURABLE': return 'blue';
      case 'COUNTABLE': return 'green';
      case 'ELABORATED': return 'purple';
      default: return 'gray';
    }
  };

  const renderItem = ({ item }: { item: InventoryItem; index: number }) => (
    <ModernItemCard
      key={item.id}
      item={item}
      onEdit={onEditItem}
      onAddStock={onAddStock}
      onViewDetails={onViewDetails}
      formatQuantity={formatQuantity}
      getStockStatus={getStockStatusForDisplay}
      getTypeIcon={getTypeIcon}
      getTypeColor={getTypeColor}
    />
  );

  return (
    <Stack gap="lg" align="stretch">
      {/* Critical alerts */}
      {criticalItems.length > 0 && (
        <Alert status="error" title="Stock crítico detectado">
          {criticalItems.length} item{criticalItems.length !== 1 ? 's' : ''} con stock crítico: {criticalItems.map(item => item.name).join(', ')}
        </Alert>
      )}

      {/* Filters */}
      <Stack direction="row" gap="md" wrap="wrap">
        <div style={{ flex: 1, minWidth: '250px' }}>
          <InputField
            placeholder="Buscar items..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <div style={{ width: '200px' }}>
          <SelectField
            options={typeFilterOptions}
            value={typeFilter}
            onChange={onTypeFilterChange}
            placeholder="Tipo de item"
          />
        </div>
      </Stack>

      {/* Items Grid */}
      <Section variant="default" title={`Items (${filteredItems.length})`}>
        {filteredItems.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <Stack align="center" gap="md">
              <CubeIcon className="w-12 h-12 text-gray-400" />
              <Typography variant="body" color="text.muted">No se encontraron items</Typography>
              <Typography variant="body" size="sm" color="text.muted">
                {searchTerm || typeFilter !== 'all' 
                  ? 'Prueba ajustando los filtros' 
                  : 'Comienza agregando tu primer item'}
              </Typography>
            </Stack>
          </div>
        ) : (
          <VirtualizedList
            items={filteredItems}
            itemHeight={180}
            renderItem={renderItem}
            containerHeight={600}
            overscan={5}
            className="inventory-grid"
          />
        )}
      </Section>
    </Stack>
  );
}

// Separate component for better performance with memoization
const ModernItemCard = React.memo(({ 
  item, 
  onEdit, 
  onAddStock, 
  onViewDetails,
  formatQuantity,
  getStockStatus,
  getTypeIcon,
  getTypeColor
}: {
  item: InventoryItem & { syncStatus?: string; isOfflineItem?: boolean; localModifications?: Array<Record<string, unknown>> };
  onEdit: (item: InventoryItem) => void;
  onAddStock: (item: InventoryItem) => void;
  onViewDetails: (item: InventoryItem) => void;
  formatQuantity: (quantity: number, unit: string, item: InventoryItem) => string;
  getStockStatus: (item: InventoryItem) => { color: string; label: string; severity: string };
  getTypeIcon: (type: string) => React.ElementType;
  getTypeColor: (type: string) => string;
}) => {
  const TypeIcon = getTypeIcon(item.type);
  const stockStatus = getStockStatus(item);
  const typeColor = getTypeColor(item.type);
  
  return (
    <div 
      style={{
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid var(--colors-border-subtle)',
        backgroundColor: stockStatus.severity === 'critical' ? 'var(--colors-red-50)' : 
                        stockStatus.severity === 'warning' ? 'var(--colors-yellow-50)' : 
                        item.isOfflineItem ? 'var(--colors-blue-50)' : 'var(--colors-bg-surface)',
        transition: 'all 0.2s',
        cursor: 'pointer'
      }}
    >
      <Stack gap="sm">
        <Stack direction="row" justify="space-between" align="flex-start">
          <Stack direction="row" gap="sm" style={{ flex: 1 }}>
            <div style={{ 
              padding: '4px', 
              borderRadius: '6px', 
              backgroundColor: `var(--colors-${typeColor}-100)` 
            }}>
              <TypeIcon className={`w-4 h-4 text-${typeColor}-600`} />
            </div>
            <Stack style={{ flex: 1 }} gap="xs">
              <Stack direction="row" align="center" gap="xs">
                <Typography variant="body" weight="bold" size="sm">
                  {item.name}
                </Typography>
                {item.isOfflineItem && (
                  <Badge colorPalette="blue" size="xs">
                    OFFLINE
                  </Badge>
                )}
                {item.syncStatus === 'modified' && (
                  <Badge colorPalette="yellow" size="xs">
                    MODIFIED
                  </Badge>
                )}
              </Stack>
              <Badge 
                colorPalette={typeColor} 
                variant="subtle" 
                size="xs"
              >
                {item.type === 'MEASURABLE' ? 'Conmensurable' : 
                 item.type === 'COUNTABLE' ? 'Contable' : 'Elaborado'}
              </Badge>
            </Stack>
          </Stack>
          
          {stockStatus.severity !== 'ok' && (
            <ExclamationTriangleIcon 
              className={`w-4 h-4 ${stockStatus.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'}`}
            />
          )}
        </Stack>

        <Stack gap="xs">
          <Stack direction="row" justify="space-between">
            <Typography variant="body" size="xs" color="text.muted">Stock actual:</Typography>
            <Badge 
              colorPalette={stockStatus.color} 
              variant="subtle" 
              size="xs"
            >
              {stockStatus.label}
            </Badge>
          </Stack>
          
          <Typography 
            variant="heading" 
            size="lg" 
            colorPalette={stockStatus.color === 'red' ? 'red' : stockStatus.color === 'yellow' ? 'yellow' : undefined}
          >
            {formatQuantity(item.stock, item.unit, item)}
          </Typography>
          
          {item.unit_cost && (
            <Typography variant="body" size="xs" color="text.muted">
              ${item.unit_cost.toFixed(2)} por {item.unit}
            </Typography>
          )}
        </Stack>

        {/* Local modifications indicator */}
        {item.localModifications && item.localModifications.length > 0 && (
          <Badge colorPalette="blue" size="xs">
            {item.localModifications.length} local changes
          </Badge>
        )}

        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          paddingTop: '0.5rem', 
          borderTop: '1px solid var(--colors-border-subtle)' 
        }}>
          <Button 
            size="xs" 
            variant="ghost" 
            colorPalette="green"
            onClick={() => onAddStock(item)}
            style={{ flex: 1 }}
          >
            <PlusIcon className="w-3 h-3" />
            Stock
          </Button>
          
          <Button 
            size="xs" 
            variant="ghost" 
            colorPalette="blue"
            onClick={() => onEdit(item)}
            style={{ flex: 1 }}
          >
            <PencilIcon className="w-3 h-3" />
            Editar
          </Button>
          
          <Button 
            size="xs" 
            variant="ghost" 
            colorPalette="gray"
            onClick={() => onViewDetails(item)}
          >
            <EyeIcon className="w-3 h-3" />
          </Button>
        </div>
      </Stack>
    </div>
  );
});

ModernItemCard.displayName = 'ModernItemCard';

export default MaterialsInventoryGrid;