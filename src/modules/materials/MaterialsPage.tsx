import { useEffect } from 'react';
import { Box, VStack, Text, Button } from '@chakra-ui/react';

// Shared components
import { ModuleHeader } from '@/shared/layout/ModuleHeader';

// Module components
import { MaterialsHeader } from './components/MaterialsHeader';
import { MaterialsFilters } from './components/MaterialsFilters';
import { MaterialsGrid } from './components/MaterialsGrid';
import { LazyMaterialFormModal } from './components/LazyMaterialFormModal';

// Hooks
import { 
  useMaterials
} from '@/store/materialsStore';
import { useApp } from '@/hooks/useZustandStores';
import { useNavigation } from '@/contexts/NavigationContext';

// API
import { inventoryApi } from './data/inventoryApi';
import { MaterialsNormalizer } from './services';

// Types
import type { MaterialItem } from './types';

// Debug - temporal
import { debugSuppliers } from '@/debug-suppliers';

function MaterialsPage() {
  const navigation = useNavigation();
  const { handleError } = useApp();
  
  // 🎯 Use main hook to avoid infinite loop issues
  const { 
    getFilteredItems, 
    loading, 
    error, 
    openModal, 
    deleteItem, 
    setItems, 
    refreshStats 
  } = useMaterials();
  const items = getFilteredItems();

  // Initialize navigation badges
  useEffect(() => {
    if (navigation?.updateModuleBadge) {
      navigation.updateModuleBadge('materials', items.length);
    }
  }, [items.length, navigation]);

  // Load initial data
  useEffect(() => {
    loadInventoryData();
    
    // Debug suppliers - temporal
    debugSuppliers().then(result => {
      console.log('Debug suppliers result:', result);
    });
  }, []);

  const loadInventoryData = async () => {
    try {
      setItems([]);
      const apiItems = await inventoryApi.getItems();
      
      // 🎯 Use centralized normalizer service
      const normalizedItems = MaterialsNormalizer.normalizeApiItems(apiItems);

      setItems(normalizedItems);
      if (refreshStats) refreshStats();
    } catch (error) {
      console.error('Error loading inventory data:', error);
      handleError(error as Error, { operation: 'loadInventory' });
    }
  };

  const handleAddItem = () => {
    openModal('add');
  };

  const handleEditItem = (item: MaterialItem) => {
    openModal('edit', item);
  };

  const handleViewItem = (item: MaterialItem) => {
    openModal('view', item);
  };

  const handleDeleteItem = async (item: MaterialItem) => {
    try {
      if (window.confirm(`¿Estás seguro de que quieres eliminar "${item.name}"?`)) {
        // First delete from API (this handles all DB constraints and triggers)
        await inventoryApi.deleteItem(item.id);
        
        // Force refresh from database to ensure UI is perfectly synchronized
        await loadInventoryData();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      handleError(error as Error, { operation: 'deleteItem', itemName: item.name });
      
      // Refresh data anyway to ensure UI is in sync with DB
      await loadInventoryData();
    }
  };

  if (error) {
    return (
      <Box p={6}>
        <VStack gap={4}>
          <Text color="red.500">Error: {error}</Text>
          <Button onClick={() => window.location.reload()}>
            Recargar página
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <>
      {/* 🎯 Use unified ModuleHeader pattern */}
      <ModuleHeader 
        title="Gestión de Materiales"
        color="blue"
        rightActions={
          <Button colorPalette="blue" onClick={handleAddItem}>
            Nuevo Material
          </Button>
        }
      />

      {/* Module Content */}
      <Box px={6} pb={6}>
        <VStack gap={6} align="stretch">
          {/* Filters */}
          <MaterialsFilters />

          {/* Stats and Main Content */}
          <VStack gap={4} align="stretch">
            {/* Quick Stats */}
            <MaterialsHeader 
              onAddItem={handleAddItem}
              itemCount={items.length}
            />

            {/* Main Grid */}
            <MaterialsGrid 
              onEdit={handleEditItem}
              onView={handleViewItem}
              onDelete={handleDeleteItem}
            />
          </VStack>
        </VStack>
      </Box>

      {/* Modal - Lazy loaded version */}
      <LazyMaterialFormModal />
    </>
  );
}

export default MaterialsPage;