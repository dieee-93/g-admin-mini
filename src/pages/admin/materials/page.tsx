import { useEffect } from 'react';
import { 
  Layout, Stack, Typography, CardWrapper, Button, Modal, Alert, Badge 
} from '@/shared/ui';

// Module components - Temporariamente comentados para evitar errores de compilación
// import { MaterialsHeader } from './components/MaterialsHeader';
// import { MaterialsFilters } from './components/MaterialsFilters';
// import { MaterialsGrid } from './components/MaterialsGrid';
// import { LazyMaterialFormModal } from './components/LazyMaterialFormModal';

// Hooks
import { 
  useMaterials
} from '@/store/materialsStore';
import { useApp } from '@/hooks/useZustandStores';
import { useNavigation } from '@/contexts/NavigationContext';

// API
import { inventoryApi } from './services/inventoryApi';
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
      <Layout variant="panel">
        <Stack direction="column" gap="md" p="lg">
          <Alert status="error" title="Error de carga">
            {error}
          </Alert>
          <Button onClick={() => window.location.reload()}>
            Recargar página
          </Button>
        </Stack>
      </Layout>
    );
  }

  return (
    <Layout variant="panel">
      {/* Page Header */}
      <Stack direction="row" justify="space-between" align="center" p="lg">
        <Typography variant="heading" size="xl">
          Gestión de Materiales
        </Typography>
        <Button variant="solid" color="accent" onClick={handleAddItem}>
          Nuevo Material
        </Button>
      </Stack>

      {/* Module Content */}
      <Stack direction="column" gap="lg" p="lg">
        {/* Temporary simplified content */}
        <Card variant="elevated">
          <Card.Header>
            <Typography variant="heading" size="lg">
              Materials Overview
            </Typography>
          </Card.Header>
          <Card.Body>
            <Stack direction="column" gap="md">
              <Typography variant="body">
                Items en inventario: {items.length}
              </Typography>
              <Typography variant="body" color="muted">
                Sistema de gestión de materiales funcionando correctamente.
              </Typography>
              {loading && (
                <Alert status="info" title="Cargando datos">
                  Cargando información del inventario...
                </Alert>
              )}
            </Stack>
          </Card.Body>
        </CardWrapper>

        {/* Quick Actions */}
        <Card variant="elevated">
          <Card.Header>
            <Typography variant="heading" size="md">
              Acciones Rápidas
            </Typography>
          </Card.Header>
          <Card.Body>
            <Stack direction="row" gap="md">
              <Button variant="solid" color="accent" onClick={handleAddItem}>
                Agregar Material
              </Button>
              <Button variant="outline" onClick={() => loadInventoryData()}>
                Actualizar Datos
              </Button>
            </Stack>
          </Card.Body>
        </CardWrapper>
      </Stack>
    </Layout>
  );
}

export default MaterialsPage;