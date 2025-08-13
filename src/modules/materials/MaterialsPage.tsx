import { useEffect } from 'react';
import { Box, VStack, Text, Button } from '@chakra-ui/react';

// New components
import { MaterialsHeader } from './components/MaterialsHeader';
import { MaterialsFilters } from './components/MaterialsFilters';
import { MaterialsGrid } from './components/MaterialsGrid';
import { MaterialFormModal } from './components/MaterialFormModal';

// Hooks
import { useMaterials } from '@/hooks/useZustandStores';
import { useApp } from '@/hooks/useZustandStores';
import { useNavigation } from '@/contexts/NavigationContext';

// Types
import { MaterialItem } from '@/store/materialsStore';

export const MaterialsPage = () => {
  const navigation = useNavigation();
  const { handleError } = useApp();
  
  const { 
    items,
    loading,
    error,
    openModal,
    deleteItem,
    setItems,
    refreshStats
  } = useMaterials();

  // Initialize navigation badges
  useEffect(() => {
    if (navigation?.updateBadge) {
      navigation.updateBadge('materials', items.length);
    }
  }, [items.length, navigation]);

  // Load initial data
  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      // TODO: Replace with actual API call
      // For now, we'll use mock data
      const mockItems: Omit<InventoryItem, 'stock_status' | 'total_value'>[] = [
        {
          id: '1',
          name: 'Tomate',
          unit: 'kg',
          current_stock: 25,
          min_stock: 10,
          max_stock: 50,
          category: 'vegetales',
          cost_per_unit: 800,
          location: 'Refrigerador A',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          notes: 'Tomates frescos para ensaladas'
        },
        {
          id: '2',
          name: 'Carne de Res',
          unit: 'kg',
          current_stock: 8,
          min_stock: 15,
          category: 'carnes',
          cost_per_unit: 4500,
          location: 'Freezer Principal',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          notes: 'Corte magro para hamburguesas'
        },
        {
          id: '3',
          name: 'Queso Mozzarella',
          unit: 'kg',
          current_stock: 0,
          min_stock: 5,
          max_stock: 20,
          category: 'lacteos',
          cost_per_unit: 2800,
          location: 'Refrigerador B',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          notes: 'Para pizzas y platos principales'
        },
        {
          id: '4',
          name: 'Aceite de Oliva',
          unit: 'l',
          current_stock: 12,
          min_stock: 8,
          max_stock: 25,
          category: 'condimentos',
          cost_per_unit: 1200,
          location: 'Despensa',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          notes: 'Extra virgen para ensaladas'
        },
        {
          id: '5',
          name: 'Harina 0000',
          unit: 'kg',
          current_stock: 3,
          min_stock: 10,
          category: 'granos',
          cost_per_unit: 450,
          location: 'Despensa Seca',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          notes: 'Para masa de pizza y pan'
        }
      ];

      setItems(mockItems as InventoryItem[]);
    } catch (error) {
      handleError(error as Error, { operation: 'loadInventory' });
    }
  };

  const handleAddItem = () => {
    openModal('add');
  };

  const handleEditItem = (item: InventoryItem) => {
    openModal('edit', item);
  };

  const handleViewItem = (item: InventoryItem) => {
    openModal('view', item);
  };

  const handleDeleteItem = async (item: InventoryItem) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${item.name}"?`)) {
      try {
        deleteItem(item.id);
        // TODO: Call API to delete from backend
      } catch (error) {
        handleError(error as Error, { operation: 'deleteItem', itemId: item.id });
      }
    }
  };

  const handleShowAnalytics = () => {
    // TODO: Implement analytics modal or navigate to analytics page
    console.log('Show analytics modal');
  };

  if (error) {
    return (
      <Box p={6} textAlign="center">
        <VStack gap={4}>
          <Text fontSize="lg" color="red.500">
            Error al cargar los materiales
          </Text>
          <Text fontSize="sm" color="gray.500">
            {error}
          </Text>
          <Button onClick={loadInventoryData} colorPalette="blue">
            Reintentar
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <VStack gap={0} align="stretch" h="full">
      {/* Header with stats */}
      <MaterialsHeader 
        onAddItem={handleAddItem}
        onShowAnalytics={handleShowAnalytics}
      />

      {/* Filters */}
      <MaterialsFilters />

      {/* Materials Grid */}
      <Box flex={1} overflow="auto">
        <MaterialsGrid
          onEdit={handleEditItem}
          onView={handleViewItem}
          onDelete={handleDeleteItem}
        />
      </Box>

      {/* Form Modal */}
      <MaterialFormModal />
    </VStack>
  );
};