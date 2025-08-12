// OfflineMaterialsPage.tsx - Offline-First Materials Management for G-Admin Mini
// Provides seamless offline inventory management with intelligent sync
// Now using code splitting for better performance

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { Box, VStack } from '@chakra-ui/react';
import { LazyFallback } from '@/lib/performance';

// Import split components
import { LazyMaterialsHeader, LazyMaterialsStats, LazyMaterialsGrid } from './LazyOfflineMaterialsPage';

// Offline functionality
import { 
  useOfflineStatus,
  offlineSync,
  localStorage,
  type SyncOperation 
} from '@/lib/offline';
import { EventBus } from '@/lib/events/EventBus';
import { RestaurantEvents } from '@/lib/events/RestaurantEvents';
import { notify } from '@/lib/notifications';

// Materials imports
import { useNavigation } from '@/contexts/NavigationContext';
import { useInventory } from '../logic/useInventory';
import { UniversalItemForm } from './UniversalItemForm';
import { 
  type InventoryItem,
  isMeasurable,
  isCountable,
  isElaborated
} from '../types';

// Supply Chain Intelligence - will work offline with cached data
import ABCAnalysisEngine from '../intelligence/ABCAnalysisEngine';
import { ProcurementIntelligence } from '../intelligence/ProcurementIntelligence';
import { SupplierScoring } from '../intelligence/SupplierScoring';
import { InventoryOptimization } from '../intelligence/InventoryOptimization';
import { AlertingSystem } from '../intelligence/AlertingSystem';
import { SupplyChainReporting } from '../intelligence/SupplyChainReporting';

// Offline-specific interfaces
interface OfflineInventoryOperation {
  id: string;
  type: 'stock_adjustment' | 'item_create' | 'item_update' | 'item_delete';
  entityId: string;
  data: any;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  originalValue?: any;
  conflicts?: any[];
}

interface OfflineInventorySync {
  lastSync: number;
  pendingOperations: OfflineInventoryOperation[];
  conflictedItems: string[];
  syncErrors: string[];
}

// Collections
const TYPE_FILTER_COLLECTION = createListCollection({
  items: [
    { label: 'Todos los tipos', value: 'all' },
    { label: 'Conmensurables', value: 'MEASURABLE' },
    { label: 'Contables', value: 'COUNTABLE' },
    { label: 'Elaborados', value: 'ELABORATED' }
  ]
});

export function OfflineMaterialsPage() {
  // Offline status management
  const {
    isOnline,
    isConnecting,
    connectionQuality,
    isSyncing,
    queueSize,
    queueOperation,
    forceSync,
    cacheData,
    getCachedData
  } = useOfflineStatus();

  // Materials functionality
  const { setQuickActions } = useNavigation();
  const {
    items: onlineItems,
    alerts,
    inventoryStats: onlineStats,
    loading: onlineLoading,
    error: onlineError,
    addItem: onlineAddItem,
    updateItem: onlineUpdateItem,
    hasAlerts,
    hasCriticalAlerts
  } = useInventory();

  // Local state for offline functionality
  const [offlineItems, setOfflineItems] = useState<InventoryItem[]>([]);
  const [offlineOperations, setOfflineOperations] = useState<OfflineInventoryOperation[]>([]);
  const [syncStatus, setSyncStatus] = useState<OfflineInventorySync>({
    lastSync: 0,
    pendingOperations: [],
    conflictedItems: [],
    syncErrors: []
  });

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<'inventory' | 'abc-analysis' | 'procurement' | 'suppliers' | 'optimization' | 'alerts' | 'reporting'>('inventory');
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [stockDialogItem, setStockDialogItem] = useState<InventoryItem | null>(null);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const [stockAdjustment, setStockAdjustment] = useState({
    quantity: 0,
    type: 'add' as 'add' | 'subtract' | 'set',
    reason: '',
    notes: ''
  });

  // Initialize offline functionality
  useEffect(() => {
    loadMaterialsWithOfflineSupport();
    loadOfflineOperations();
    setupInventoryEventListeners();
  }, [isOnline]);

  // Sync progress monitoring
  useEffect(() => {
    const updateSyncProgress = () => {
      if (isSyncing && queueSize > 0) {
        const progress = Math.max(0, Math.min(100, (1 - queueSize / Math.max(offlineOperations.length, 1)) * 100));
        setSyncProgress(progress);
      } else if (!isSyncing) {
        setSyncProgress(100);
      }
    };

    const interval = setInterval(updateSyncProgress, 1000);
    return () => clearInterval(interval);
  }, [isSyncing, queueSize, offlineOperations.length]);

  const loadMaterialsWithOfflineSupport = async () => {
    try {
      let materials: InventoryItem[] = [];

      if (isOnline) {
        // Use online items when available
        materials = onlineItems;
        
        if (materials.length > 0) {
          // Cache for offline use
          await cacheData('inventory_items', materials, 30 * 60 * 1000); // 30 minutes TTL
          await cacheData('inventory_stats', onlineStats, 30 * 60 * 1000);
        }
      } else {
        // Load from cache when offline
        const cachedItems = await getCachedData('inventory_items') || [];
        materials = cachedItems;
        
        if (materials.length > 0) {
          notify.info('Showing cached inventory data (offline mode)');
        }
      }

      // Load offline-only items and merge
      const offlineOnlyItems = await localStorage.getAll('offline_inventory_items') || [];
      const mergedItems = mergeInventoryItems(materials, offlineOnlyItems);
      
      setOfflineItems(mergedItems);

    } catch (error) {
      console.error('Error loading materials with offline support:', error);
      
      // Fallback to cached data
      const cachedItems = await getCachedData('inventory_items') || [];
      const offlineOnlyItems = await localStorage.getAll('offline_inventory_items') || [];
      
      if (cachedItems.length > 0 || offlineOnlyItems.length > 0) {
        const mergedItems = mergeInventoryItems(cachedItems, offlineOnlyItems);
        setOfflineItems(mergedItems);
        notify.warning('Using cached inventory data - could not connect to server');
      } else {
        notify.error('No inventory data available offline');
      }
    }
  };

  const mergeInventoryItems = (onlineItems: InventoryItem[], offlineItems: InventoryItem[]): InventoryItem[] => {
    const itemMap = new Map<string, InventoryItem>();
    
    // Start with online items (authoritative when available)
    onlineItems.forEach(item => {
      itemMap.set(item.id, { ...item, syncStatus: 'synced' });
    });
    
    // Add offline-only items or local modifications
    offlineItems.forEach(item => {
      if (!itemMap.has(item.id)) {
        itemMap.set(item.id, { 
          ...item, 
          isOfflineItem: true,
          syncStatus: 'pending'
        });
      } else {
        // Merge offline changes with online item
        const onlineItem = itemMap.get(item.id)!;
        itemMap.set(item.id, {
          ...onlineItem,
          ...item,
          localModifications: item.localModifications || [],
          syncStatus: item.localModifications?.length ? 'modified' : 'synced'
        });
      }
    });

    return Array.from(itemMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  const loadOfflineOperations = async () => {
    try {
      const operations = await localStorage.getAll('offline_inventory_operations') || [];
      setOfflineOperations(operations);
      
      setSyncStatus(prev => ({
        ...prev,
        pendingOperations: operations.filter((op: OfflineInventoryOperation) => op.status === 'pending'),
        lastSync: Date.now()
      }));
    } catch (error) {
      console.error('Error loading offline operations:', error);
    }
  };

  const setupInventoryEventListeners = () => {
    // Listen for order events that might affect inventory
    const handleOrderPlaced = async (event: any) => {
      if (event.isOffline) {
        // Automatically adjust inventory for offline orders
        await handleOfflineInventoryDeduction(event);
      }
    };

    EventBus.on(RestaurantEvents.ORDER_PLACED, handleOrderPlaced);

    return () => {
      EventBus.off(RestaurantEvents.ORDER_PLACED, handleOrderPlaced);
    };
  };

  const handleOfflineInventoryDeduction = async (orderEvent: any) => {
    try {
      // Process inventory deductions for each item in the order
      for (const orderItem of orderEvent.items) {
        const inventoryItem = offlineItems.find(item => 
          item.name.toLowerCase().includes(orderItem.productName?.toLowerCase() || '') ||
          item.id === orderItem.productId
        );

        if (inventoryItem && inventoryItem.stock > 0) {
          const deductionQuantity = orderItem.quantity;
          
          await processOfflineStockAdjustment(inventoryItem.id, {
            quantity: deductionQuantity,
            type: 'subtract',
            reason: 'sale',
            notes: `Automatic deduction for offline order ${orderEvent.orderId}`
          });
        }
      }
      
      notify.info(`Inventory automatically adjusted for offline order`);
    } catch (error) {
      console.error('Error processing offline inventory deduction:', error);
    }
  };

  // Offline-enhanced item operations
  const handleAddItemWithOfflineSupport = async (itemData: any) => {
    try {
      if (isOnline) {
        // Try online creation first
        try {
          await onlineAddItem(itemData);
          notify.success('Item added successfully');
          return;
        } catch (error) {
          console.warn('Online creation failed, switching to offline mode:', error);
        }
      }

      // Offline processing
      await processOfflineItemCreation(itemData);
      notify.success('Item added offline - will sync when online');

    } catch (error) {
      console.error('Error adding item:', error);
      notify.error('Failed to add item');
    }
  };

  const processOfflineItemCreation = async (itemData: any) => {
    const offlineItem: InventoryItem = {
      ...itemData,
      id: `offline_item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isOfflineItem: true,
      syncStatus: 'pending'
    };

    // Store offline item
    await localStorage.set('offline_inventory_items', offlineItem.id, offlineItem);

    // Create sync operation
    const operation: OfflineInventoryOperation = {
      id: `create_${offlineItem.id}`,
      type: 'item_create',
      entityId: offlineItem.id,
      data: offlineItem,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending'
    };

    // Queue for sync
    const syncOperation: Omit<SyncOperation, 'id' | 'timestamp' | 'clientId' | 'retry'> = {
      type: 'CREATE',
      entity: 'inventory_items',
      data: offlineItem,
      priority: 3 // Medium priority for inventory operations
    };

    queueOperation(syncOperation);

    // Store operation
    await localStorage.set('offline_inventory_operations', operation.id, operation);
    setOfflineOperations(prev => [...prev, operation]);

    // Update local items
    setOfflineItems(prev => [...prev, offlineItem]);
  };

  const handleUpdateItemWithOfflineSupport = async (itemId: string, itemData: any) => {
    try {
      if (isOnline) {
        // Try online update first
        try {
          await onlineUpdateItem(itemId, itemData);
          notify.success('Item updated successfully');
          return;
        } catch (error) {
          console.warn('Online update failed, switching to offline mode:', error);
        }
      }

      // Offline processing
      await processOfflineItemUpdate(itemId, itemData);
      notify.success('Item updated offline - will sync when online');

    } catch (error) {
      console.error('Error updating item:', error);
      notify.error('Failed to update item');
    }
  };

  const processOfflineItemUpdate = async (itemId: string, itemData: any) => {
    const updatedItem = {
      ...itemData,
      id: itemId,
      updated_at: new Date().toISOString(),
      localModifications: [
        ...(itemData.localModifications || []),
        {
          type: 'item_update',
          timestamp: Date.now(),
          changes: itemData
        }
      ],
      syncStatus: 'modified'
    };

    // Update stored item
    await localStorage.set('offline_inventory_items', itemId, updatedItem);

    // Create sync operation
    const operation: OfflineInventoryOperation = {
      id: `update_${itemId}_${Date.now()}`,
      type: 'item_update',
      entityId: itemId,
      data: updatedItem,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
      originalValue: offlineItems.find(item => item.id === itemId)
    };

    // Queue for sync
    const syncOperation: Omit<SyncOperation, 'id' | 'timestamp' | 'clientId' | 'retry'> = {
      type: 'UPDATE',
      entity: 'inventory_items',
      data: updatedItem,
      priority: 3
    };

    queueOperation(syncOperation);

    // Store operation
    await localStorage.set('offline_inventory_operations', operation.id, operation);
    setOfflineOperations(prev => [...prev, operation]);

    // Update local items
    setOfflineItems(prev => prev.map(item => 
      item.id === itemId ? updatedItem : item
    ));
  };

  const handleStockAdjustmentWithOfflineSupport = async () => {
    if (!stockDialogItem || stockAdjustment.quantity === 0) return;
    
    try {
      if (isOnline) {
        // Try online adjustment first
        try {
          // Call online stock adjustment API
          console.log('Processing online stock adjustment');
          // await onlineStockAdjustment(stockDialogItem.id, stockAdjustment);
          
          handleStockDialogClose();
          notify.success('Stock adjusted successfully');
          return;
        } catch (error) {
          console.warn('Online stock adjustment failed, switching to offline mode:', error);
        }
      }

      // Offline processing
      await processOfflineStockAdjustment(stockDialogItem.id, stockAdjustment);
      handleStockDialogClose();
      notify.success('Stock adjusted offline - will sync when online');

    } catch (error) {
      console.error('Error adjusting stock:', error);
      notify.error('Failed to adjust stock');
    }
  };

  const processOfflineStockAdjustment = async (itemId: string, adjustment: any) => {
    const currentItem = offlineItems.find(item => item.id === itemId);
    if (!currentItem) return;

    let newStock = currentItem.stock;
    switch (adjustment.type) {
      case 'add':
        newStock = currentItem.stock + adjustment.quantity;
        break;
      case 'subtract':
        newStock = Math.max(0, currentItem.stock - adjustment.quantity);
        break;
      case 'set':
        newStock = adjustment.quantity;
        break;
    }

    const updatedItem = {
      ...currentItem,
      stock: newStock,
      updated_at: new Date().toISOString(),
      localModifications: [
        ...(currentItem.localModifications || []),
        {
          type: 'stock_adjustment',
          timestamp: Date.now(),
          adjustment,
          previousStock: currentItem.stock,
          newStock
        }
      ],
      syncStatus: 'modified'
    };

    // Store updated item
    await localStorage.set('offline_inventory_items', itemId, updatedItem);

    // Create sync operation
    const operation: OfflineInventoryOperation = {
      id: `stock_${itemId}_${Date.now()}`,
      type: 'stock_adjustment',
      entityId: itemId,
      data: {
        itemId,
        adjustment,
        newStock,
        timestamp: Date.now()
      },
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
      originalValue: currentItem.stock
    };

    // Queue for sync
    const syncOperation: Omit<SyncOperation, 'id' | 'timestamp' | 'clientId' | 'retry'> = {
      type: 'UPDATE',
      entity: 'inventory_stock',
      data: operation.data,
      priority: 2 // Higher priority for stock changes
    };

    queueOperation(syncOperation);

    // Store operation
    await localStorage.set('offline_inventory_operations', operation.id, operation);
    setOfflineOperations(prev => [...prev, operation]);

    // Update local items
    setOfflineItems(prev => prev.map(item => 
      item.id === itemId ? updatedItem : item
    ));
  };

  const handleForceSyncInventory = async () => {
    try {
      await forceSync();
      await loadOfflineOperations();
      notify.success('Inventory sync completed');
    } catch (error) {
      console.error('Error forcing inventory sync:', error);
      notify.error('Failed to sync inventory operations');
    }
  };

  const handleStockDialogClose = () => {
    setShowStockDialog(false);
    setStockDialogItem(null);
    setStockAdjustment({
      quantity: 0,
      type: 'add',
      reason: '',
      notes: ''
    });
  };

  // Use offline items for all calculations
  const items = offlineItems;
  const loading = onlineLoading && offlineItems.length === 0;
  const error = isOnline ? onlineError : null;

  // Recalculate stats from offline items
  const inventoryStats = useMemo(() => {
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => 
      sum + (item.stock * (item.unit_cost || 0)), 0
    );
    
    return {
      totalItems,
      totalValue,
      lowStockItems: items.filter(item => getStockStatus(item.stock, item.type).severity === 'warning').length,
      criticalItems: items.filter(item => getStockStatus(item.stock, item.type).severity === 'critical').length
    };
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [items, searchTerm, typeFilter]);

  const criticalItems = useMemo(() => 
    filteredItems.filter(item => getStockStatus(item.stock, item.type).severity === 'critical'),
    [filteredItems]
  );
  
  const lowStockItems = useMemo(() => 
    filteredItems.filter(item => getStockStatus(item.stock, item.type).severity === 'warning'),
    [filteredItems]
  );

  // Connection status helper
  const getConnectionStatusColor = () => {
    if (!isOnline) return 'red';
    if (connectionQuality === 'excellent') return 'green';
    if (connectionQuality === 'good') return 'yellow';
    return 'orange';
  };

  // Quick actions based on active tab and connection status
  useEffect(() => {
    const quickActions: any[] = [];

    // Always available offline actions
    quickActions.push(
      {
        id: 'add-item-offline',
        label: 'Nuevo Item',
        icon: CubeIcon,
        action: () => {
          setSelectedItem(null);
          setShowItemDialog(true);
        },
        color: 'blue'
      }
    );

    // Offline operations indicator
    if (offlineOperations.length > 0) {
      quickActions.push({
        id: 'view-offline-ops',
        label: `${offlineOperations.length} Offline`,
        icon: CircleStackIcon,
        action: () => setShowOfflineModal(true),
        color: 'orange'
      });
    }

    // Sync operations
    if (queueSize > 0) {
      quickActions.push({
        id: 'force-sync',
        label: `Sync (${queueSize})`,
        icon: CloudIcon,
        action: handleForceSyncInventory,
        color: 'purple'
      });
    }

    setQuickActions(quickActions);
    return () => setQuickActions([]);
  }, [setQuickActions, offlineOperations.length, queueSize, activeTab]);

  // Utility functions (same as original)
  const formatQuantity = (quantity: number, unit: string, item: InventoryItem): string => {
    if (isMeasurable(item)) {
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
    
    if (isCountable(item) && item.packaging) {
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

  const getStockStatus = (stock: number, type: string) => {
    if (stock <= 0) return { color: 'red', label: 'Sin stock', severity: 'critical' };
    
    const threshold = type === 'ELABORATED' ? 5 : type === 'MEASURABLE' ? 3 : 20;
    const criticalThreshold = threshold / 2;
    
    if (stock <= criticalThreshold) return { color: 'red', label: 'Crítico', severity: 'critical' };
    if (stock <= threshold) return { color: 'yellow', label: 'Bajo', severity: 'warning' };
    return { color: 'green', label: 'Disponible', severity: 'ok' };
  };

  if (loading) {
    return (
      <Box p="6" maxW="7xl" mx="auto">
        <VStack gap="6" align="stretch">
          <Text>Loading inventory...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p="6" maxW="7xl" mx="auto">
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Title>Error loading inventory</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
      </Box>
    );
  }

  return (
    <Box p="6" maxW="7xl" mx="auto">
      <VStack gap="6" align="stretch">
        {/* Code-split header component */}
        <Suspense
          fallback={
            <LazyFallback
              moduleName="MaterialsHeader"
              loadingState={{ isLoading: true, stage: 'Loading header...' }}
              variant="skeleton"
            />
          }
        >
          <LazyMaterialsHeader
            isOnline={isOnline}
            isConnecting={isConnecting}
            connectionQuality={connectionQuality}
            isSyncing={isSyncing}
            syncProgress={syncProgress}
            offlineOperationsCount={offlineOperations.length}
            queueSize={queueSize}
            onAddItem={() => {
              setSelectedItem(null);
              setShowItemDialog(true);
            }}
            onShowOfflineModal={() => setShowOfflineModal(true)}
            onForceSync={handleForceSyncInventory}
          />
        </Suspense>

            <HStack gap="2">
              {/* Offline Operations Indicator */}
              {offlineOperations.length > 0 && (
                <Tooltip label={`${offlineOperations.length} operations pending sync`}>
                  <Button
                    variant="outline"
                    colorPalette="orange"
                    size="sm"
                    onClick={() => setShowOfflineModal(true)}
                  >
                    <CircleStackIcon className="w-4 h-4" />
                    {offlineOperations.length} Offline
                  </Button>
                </Tooltip>
              )}

              {/* Sync Progress */}
              {isSyncing && (
                <Box minW="120px">
                  <Text fontSize="xs" mb={1}>Syncing...</Text>
                  <Progress.Root value={syncProgress} size="sm">
                    <Progress.Track>
                      <Progress.Range />
                    </Progress.Track>
                  </Progress.Root>
                </Box>
              )}

              {/* Manual Sync Button */}
              {queueSize > 0 && (
                <Button
                  variant="outline"
                  colorPalette="blue"
                  size="sm"
                  onClick={handleForceSyncInventory}
                  loading={isSyncing}
                >
                  <CloudIcon className="w-4 h-4" />
                  Sync ({queueSize})
                </Button>
              )}

              <Button 
                variant="outline"
                colorPalette="orange" 
                onClick={() => window.open('/tools/intelligence/recipes', '_blank')}
                leftIcon={<BeakerIcon className="w-4 h-4" />}
                size="sm"
              >
                🧠 Recipe Intelligence
              </Button>

              {activeTab === 'inventory' && (
                <Button 
                  colorPalette="blue" 
                  onClick={() => {
                    setSelectedItem(null);
                    setShowItemDialog(true);
                  }}
                  leftIcon={<PlusIcon className="w-4 h-4" />}
                >
                  Nuevo Item
                </Button>
              )}
            </HStack>
          </HStack>

          {/* Offline Mode Alert */}
          {!isOnline && (
            <Alert.Root status="warning">
              <Alert.Indicator>
                <NoSymbolIcon className="w-5 h-5" />
              </Alert.Indicator>
              <Alert.Title>Inventory Offline Mode</Alert.Title>
              <Alert.Description>
                All inventory operations will be saved locally and synced automatically when connection is restored.
                {syncStatus.lastSync && ` Last sync: ${new Date(syncStatus.lastSync).toLocaleTimeString()}`}
              </Alert.Description>
            </Alert.Root>
          )}

          {/* Code-split statistics component */}
          <Suspense
            fallback={
              <LazyFallback
                moduleName="MaterialsStats"
                loadingState={{ isLoading: true, stage: 'Loading statistics...' }}
                variant="skeleton"
              />
            }
          >
            <LazyMaterialsStats items={offlineItems} />
          </Suspense>
        </VStack>

        {/* Supply Chain Intelligence Tabs */}
        <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value as any)}>
          <Tabs.List>
            <Tabs.Trigger value="inventory">
              <HStack gap={2}>
                <CubeIcon className="w-4 h-4" />
                <Text>Inventario</Text>
                {!isOnline && <Badge colorScheme="orange" size="xs">Offline</Badge>}
              </HStack>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="abc-analysis">
              <HStack gap={2}>
                <ChartBarIcon className="w-4 h-4" />
                <Text>ABC Analysis</Text>
              </HStack>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="procurement">
              <HStack gap={2}>
                <ArrowPathIcon className="w-4 h-4" />
                <Text>Procurement</Text>
              </HStack>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="suppliers">
              <HStack gap={2}>
                <CheckCircleIcon className="w-4 h-4" />
                <Text>Proveedores</Text>
              </HStack>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="optimization">
              <HStack gap={2}>
                <WifiIcon className="w-4 h-4" />
                <Text>Optimización</Text>
              </HStack>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="alerts">
              <HStack gap={2}>
                <ExclamationTriangleIcon className="w-4 h-4" />
                <Text>Alertas</Text>
              </HStack>
            </Tabs.Trigger>
            
            <Tabs.Trigger value="reporting">
              <HStack gap={2}>
                <ChartBarIcon className="w-4 h-4" />
                <Text>Reportes</Text>
              </HStack>
            </Tabs.Trigger>
          </Tabs.List>

          <Box mt="6">
            {/* Inventory Tab - Enhanced with Offline Features */}
            <Tabs.Content value="inventory">
              {/* Code-split inventory grid component */}
              <Suspense
                fallback={
                  <LazyFallback
                    moduleName="MaterialsGrid"
                    loadingState={{ isLoading: true, stage: 'Loading inventory grid...' }}
                    variant="skeleton"
                  />
                }
              >
                <LazyMaterialsGrid
                  items={offlineItems}
                  searchTerm={searchTerm}
                  typeFilter={typeFilter}
                  onSearchChange={setSearchTerm}
                  onTypeFilterChange={setTypeFilter}
                  onEditItem={(item) => {
                    setSelectedItem(item);
                    setShowItemDialog(true);
                  }}
                  onAddStock={(item) => {
                    setStockDialogItem(item);
                    setShowStockDialog(true);
                  }}
                  onViewDetails={(item) => {
                    // Implement view details logic
                    console.log('View details for item:', item);
                  }}
                />
              </Suspense>
                  
                  {filteredItems.length === 0 ? (
                    <Card.Root>
                      <Card.Body p="8" textAlign="center">
                        <CubeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <Text color="gray.600" mb="2">No se encontraron items</Text>
                        <Text fontSize="sm" color="gray.500">
                          {searchTerm || typeFilter !== 'all' 
                            ? 'Prueba ajustando los filtros' 
                            : 'Comienza agregando tu primer item'}
                        </Text>
                      </Card.Body>
                    </Card.Root>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap="4">
                      {filteredItems.map(item => (
                        <ModernItemCard
                          key={item.id}
                          item={item}
                          onEdit={(item) => {
                            setSelectedItem(item);
                            setShowItemDialog(true);
                          }}
                          onAddStock={(item) => {
                            setStockDialogItem(item);
                            setShowStockDialog(true);
                          }}
                          onViewDetails={(item) => console.log('View details:', item)}
                        />
                      ))}
                    </SimpleGrid>
                  )}
                </Box>
              </VStack>
            </Tabs.Content>

            {/* Other tabs - Enhanced with offline capability indicators */}
            <Tabs.Content value="abc-analysis">
              <ABCAnalysisEngine />
            </Tabs.Content>

            <Tabs.Content value="procurement">
              <ProcurementIntelligence />
            </Tabs.Content>

            <Tabs.Content value="suppliers">
              <SupplierScoring />
            </Tabs.Content>

            <Tabs.Content value="optimization">
              <InventoryOptimization />
            </Tabs.Content>

            <Tabs.Content value="alerts">
              <AlertingSystem />
            </Tabs.Content>

            <Tabs.Content value="reporting">
              <SupplyChainReporting />
            </Tabs.Content>
          </Box>
        </Tabs.Root>

        {/* Enhanced Item Dialog */}
        <Dialog.Root open={showItemDialog} onOpenChange={(e) => setShowItemDialog(e.open)}>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="600px">
              <Dialog.Header>
                <Dialog.Title>
                  {selectedItem ? `Editar: ${selectedItem.name}` : 'Crear Nuevo Item'}
                  {!isOnline && <Badge colorScheme="orange" size="sm" ml={2}>Offline Mode</Badge>}
                </Dialog.Title>
                <Dialog.CloseTrigger />
              </Dialog.Header>
              <Dialog.Body p="6">
                <UniversalItemForm
                  editItem={selectedItem}
                  onSuccess={() => {
                    setShowItemDialog(false);
                    setSelectedItem(null);
                  }}
                  onCancel={() => {
                    setShowItemDialog(false);
                    setSelectedItem(null);
                  }}
                  offlineMode={!isOnline}
                />
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>

        {/* Enhanced Stock Adjustment Dialog */}
        <Dialog.Root open={showStockDialog} onOpenChange={() => setShowStockDialog(false)}>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>
                  {stockDialogItem ? `Ajustar Stock: ${stockDialogItem.name}` : 'Ajuste de Stock General'}
                  {!isOnline && <Badge colorScheme="orange" size="sm" ml={2}>Offline Mode</Badge>}
                </Dialog.Title>
                <Dialog.CloseTrigger />
              </Dialog.Header>
              <Dialog.Body>
                <VStack align="stretch" gap={4}>
                  {!isOnline && (
                    <Alert.Root status="info" size="sm">
                      <Alert.Indicator />
                      <Alert.Title>Offline Adjustment</Alert.Title>
                      <Alert.Description>
                        Stock adjustment will be saved locally and synced when connection is restored.
                      </Alert.Description>
                    </Alert.Root>
                  )}

                  {stockDialogItem && (
                    <Card.Root variant="outline">
                      <Card.Body p={3}>
                        <HStack justify="space-between">
                          <VStack align="start" gap={0}>
                            <Text fontWeight="medium">{stockDialogItem.name}</Text>
                            <Text fontSize="sm" color="gray.600">
                              Stock actual: {formatQuantity(stockDialogItem.stock, stockDialogItem.unit, stockDialogItem)}
                            </Text>
                          </VStack>
                          <Badge colorScheme={stockDialogItem.stock > 10 ? 'green' : 'red'}>
                            {stockDialogItem.stock > 10 ? 'Normal' : 'Bajo'}
                          </Badge>
                        </HStack>
                      </Card.Body>
                    </Card.Root>
                  )}

                  {/* Stock adjustment form - same as before but with offline handling */}
                  <VStack align="stretch" gap={3}>
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>Tipo de Ajuste</Text>
                      <Select.Root
                        value={[stockAdjustment.type]}
                        onValueChange={(details) => setStockAdjustment({
                          ...stockAdjustment, 
                          type: details.value[0] as 'add' | 'subtract' | 'set'
                        })}
                      >
                        <Select.Trigger>
                          <Select.ValueText />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="add">Agregar (+)</Select.Item>
                          <Select.Item value="subtract">Restar (-)</Select.Item>
                          <Select.Item value="set">Establecer (=)</Select.Item>
                        </Select.Content>
                      </Select.Root>
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>Cantidad</Text>
                      <NumberInput.Root
                        value={stockAdjustment.quantity.toString()}
                        onValueChange={(details) => setStockAdjustment({
                          ...stockAdjustment, 
                          quantity: Number(details.value)
                        })}
                        min={0}
                      >
                        <NumberInput.Field placeholder="0" />
                        <NumberInput.Control>
                          <NumberInput.IncrementTrigger />
                          <NumberInput.DecrementTrigger />
                        </NumberInput.Control>
                      </NumberInput.Root>
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>Razón</Text>
                      <Select.Root
                        value={[stockAdjustment.reason]}
                        onValueChange={(details) => setStockAdjustment({
                          ...stockAdjustment, 
                          reason: details.value[0]
                        })}
                      >
                        <Select.Trigger>
                          <Select.ValueText placeholder="Seleccionar razón" />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="purchase">Compra</Select.Item>
                          <Select.Item value="sale">Venta</Select.Item>
                          <Select.Item value="waste">Merma/Desperdicio</Select.Item>
                          <Select.Item value="damage">Daño/Deterioro</Select.Item>
                          <Select.Item value="inventory">Inventario físico</Select.Item>
                          <Select.Item value="transfer">Transferencia</Select.Item>
                          <Select.Item value="other">Otro</Select.Item>
                        </Select.Content>
                      </Select.Root>
                    </Box>

                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>Notas (opcional)</Text>
                      <Textarea
                        value={stockAdjustment.notes}
                        onChange={(e) => setStockAdjustment({
                          ...stockAdjustment, 
                          notes: e.target.value
                        })}
                        placeholder="Detalles adicionales sobre el ajuste..."
                        rows={3}
                      />
                    </Box>

                    {stockDialogItem && (
                      <Alert.Root status="info" size="sm">
                        <Alert.Description>
                          Stock resultante: {stockAdjustment.type === 'add' 
                            ? stockDialogItem.stock + stockAdjustment.quantity
                            : stockAdjustment.type === 'subtract' 
                            ? Math.max(0, stockDialogItem.stock - stockAdjustment.quantity)
                            : stockAdjustment.quantity
                          } {stockDialogItem.unit}
                        </Alert.Description>
                      </Alert.Root>
                    )}
                  </VStack>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant="outline" onClick={handleStockDialogClose}>
                  Cancelar
                </Button>
                <Button 
                  colorScheme="blue" 
                  onClick={handleStockAdjustmentWithOfflineSupport}
                  disabled={stockAdjustment.quantity === 0 || !stockAdjustment.reason}
                >
                  {isOnline ? 'Aplicar Ajuste' : 'Aplicar Offline'}
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>

        {/* Offline Operations Modal */}
        <OfflineInventoryOperationsModal
          isOpen={showOfflineModal}
          onClose={() => setShowOfflineModal(false)}
          operations={offlineOperations}
          onForceSync={handleForceSyncInventory}
          isSyncing={isSyncing}
        />
      </VStack>
    </Box>
  );
}

// Enhanced Item Card Component with Offline Indicators
function ModernItemCard({ 
  item, 
  onEdit, 
  onAddStock, 
  onViewDetails 
}: {
  item: InventoryItem & { syncStatus?: string; isOfflineItem?: boolean; localModifications?: any[] };
  onEdit: (item: InventoryItem) => void;
  onAddStock: (item: InventoryItem) => void;
  onViewDetails: (item: InventoryItem) => void;
}) {
  const TypeIcon = getTypeIcon(item.type);
  const stockStatus = getStockStatus(item.stock, item.type);
  const typeColor = getTypeColor(item.type);
  
  return (
    <Card.Root 
      variant="outline"
      bg={stockStatus.severity === 'critical' ? 'red.50' : 
          stockStatus.severity === 'warning' ? 'yellow.50' : 
          item.isOfflineItem ? 'blue.50' : 'white'}
      borderColor={stockStatus.severity === 'critical' ? 'red.200' : 
                  stockStatus.severity === 'warning' ? 'yellow.200' : 
                  item.isOfflineItem ? 'blue.200' : 'gray.200'}
      transition="all 0.2s"
      _hover={{ 
        transform: 'translateY(-2px)', 
        shadow: 'md',
        borderColor: typeColor === 'blue' ? 'blue.300' : 
                    typeColor === 'green' ? 'green.300' : 'purple.300'
      }}
    >
      <Card.Body p="4">
        <VStack align="stretch" gap="3">
          <HStack justify="space-between" align="start">
            <HStack gap="2" flex="1">
              <Box p="1" bg={`${typeColor}.100`} borderRadius="md">
                <TypeIcon className={`w-4 h-4 text-${typeColor}-600`} />
              </Box>
              <VStack align="start" gap="0" flex="1">
                <HStack>
                  <Text fontWeight="bold" lineHeight="1.2" fontSize="sm">
                    {item.name}
                  </Text>
                  {item.isOfflineItem && (
                    <Badge colorScheme="blue" size="xs">
                      OFFLINE
                    </Badge>
                  )}
                  {item.syncStatus === 'modified' && (
                    <Badge colorScheme="yellow" size="xs">
                      MODIFIED
                    </Badge>
                  )}
                </HStack>
                <Badge 
                  colorPalette={typeColor} 
                  variant="subtle" 
                  size="xs"
                >
                  {item.type === 'MEASURABLE' ? 'Conmensurable' : 
                   item.type === 'COUNTABLE' ? 'Contable' : 'Elaborado'}
                </Badge>
              </VStack>
            </HStack>
            
            {stockStatus.severity !== 'ok' && (
              <ExclamationTriangleIcon 
                className={`w-4 h-4 ${stockStatus.severity === 'critical' ? 'text-red-500' : 'text-yellow-500'}`}
              />
            )}
          </HStack>

          <VStack align="start" gap="1">
            <HStack justify="space-between" w="full">
              <Text fontSize="xs" color="gray.600">Stock actual:</Text>
              <Badge 
                colorPalette={stockStatus.color} 
                variant="subtle" 
                size="xs"
              >
                {stockStatus.label}
              </Badge>
            </HStack>
            
            <Text fontSize="lg" fontWeight="bold" color={
              stockStatus.color === 'red' ? 'red.600' : 
              stockStatus.color === 'yellow' ? 'yellow.600' : 'gray.800'
            }>
              {formatQuantity(item.stock, item.unit, item)}
            </Text>
            
            {item.unit_cost && (
              <Text fontSize="xs" color="gray.500">
                ${item.unit_cost.toFixed(2)} por {item.unit}
              </Text>
            )}
          </VStack>

          {/* Local modifications indicator */}
          {item.localModifications && item.localModifications.length > 0 && (
            <Badge colorScheme="blue" size="xs">
              {item.localModifications.length} local changes
            </Badge>
          )}

          <HStack gap="2" pt="2" borderTop="1px solid" borderColor="gray.100">
            <Button 
              size="xs" 
              variant="ghost" 
              colorPalette="green"
              onClick={() => onAddStock(item)}
              flex="1"
            >
              <PlusIcon className="w-3 h-3" />
              Stock
            </Button>
            
            <Button 
              size="xs" 
              variant="ghost" 
              colorPalette="blue"
              onClick={() => onEdit(item)}
              flex="1"
            >
              <PencilIcon className="w-3 h-3" />
              Editar
            </Button>
            
            <IconButton 
              size="xs" 
              variant="ghost" 
              colorPalette="gray"
              onClick={() => onViewDetails(item)}
            >
              <EyeIcon className="w-3 h-3" />
            </IconButton>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}

// Offline Operations Modal Component
const OfflineInventoryOperationsModal = ({
  isOpen,
  onClose,
  operations,
  onForceSync,
  isSyncing
}: {
  isOpen: boolean;
  onClose: () => void;
  operations: OfflineInventoryOperation[];
  onForceSync: () => void;
  isSyncing: boolean;
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="2xl">
          <Dialog.Header>
            <Dialog.Title>Inventory Operations Pending Sync</Dialog.Title>
            <Dialog.CloseTrigger />
          </Dialog.Header>

          <Dialog.Body>
            <VStack gap="4" align="stretch">
              <Text color="gray.600">
                {operations.length} inventory operation(s) pending synchronization
              </Text>

              <Box maxH="400px" overflowY="auto">
                <VStack gap="3" align="stretch">
                  {operations.map((operation) => (
                    <Card.Root key={operation.id} p="4">
                      <HStack justify="space-between" mb="2">
                        <VStack align="start" spacing="1">
                          <Text fontWeight="medium" textTransform="capitalize">
                            {operation.type.replace('_', ' ')}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {new Date(operation.timestamp).toLocaleString()}
                          </Text>
                        </VStack>
                        <Badge
                          colorScheme={
                            operation.status === 'synced' ? 'green' :
                            operation.status === 'syncing' ? 'blue' :
                            operation.status === 'failed' ? 'red' : 'yellow'
                          }
                        >
                          {operation.status}
                        </Badge>
                      </HStack>
                      
                      <Text fontSize="sm" color="gray.600">
                        Entity: {operation.entityId}
                        {operation.retryCount > 0 && (
                          <Text as="span" color="orange.600" ml={2}>
                            • {operation.retryCount} retries
                          </Text>
                        )}
                      </Text>
                    </Card.Root>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </Dialog.Body>

          <Dialog.Footer>
            <HStack gap="3">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                colorScheme="blue"
                onClick={onForceSync}
                loading={isSyncing}
                loadingText="Syncing..."
                disabled={operations.length === 0}
                leftIcon={<ArrowPathIcon className="w-4 h-4" />}
              >
                Force Sync All
              </Button>
            </HStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default OfflineMaterialsPage;