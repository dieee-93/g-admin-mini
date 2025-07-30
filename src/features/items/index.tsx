// src/features/items/index.tsx - Ejemplo con breadcrumbs contextuales avanzados
import { Box, Button, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { ItemForm } from './ui/ItemForm';
import { useItems } from './logic/useItems';
import { useBreadcrumb } from '../../hooks/useBreadcrumb'; // ✅ Import el hook
import { Breadcrumb } from '../../components/navigation/Breadcrumb'; // ✅ Import el componente
import { EnhancedItemList as ItemList } from './ui/ItemList';
import type { Item } from './types';

type ItemsView = 'list' | 'create' | 'edit' | 'stock';

interface ItemsPageProps {
  // Si lo usas desde App.tsx, podrías pasar la función de navegación
  onNavigate?: (route: string) => void;
}

export default function ItemsPage({ onNavigate }: ItemsPageProps) {
  const [currentView, setCurrentView] = useState<ItemsView>('list');
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [stockItem, setStockItem] = useState<Item | null>(null);
  
  const { items, loading, addItem, updateItem } = useItems();
  
  // ✅ NUEVO: Hook de breadcrumb local para contextos internos
  const { breadcrumbItems, setBreadcrumbContext, pushBreadcrumb, popBreadcrumb } = useBreadcrumb(
    (route) => {
      if (route === 'dashboard' && onNavigate) {
        onNavigate(route);
      }
    }
  );

  // ✅ Función para cambiar vista y actualizar breadcrumb
  const changeView = (view: ItemsView, item?: Item) => {
    setCurrentView(view);
    
    switch (view) {
      case 'list':
        setBreadcrumbContext('items');
        setEditingItem(null);
        setStockItem(null);
        break;
        
      case 'create':
        setBreadcrumbContext('items.create');
        break;
        
      case 'edit':
        if (item) {
          setBreadcrumbContext('items.edit', { itemName: item.name });
          setEditingItem(item);
        }
        break;
        
      case 'stock':
        if (item) {
          setBreadcrumbContext('items.stock', { itemName: item.name });
          setStockItem(item);
        }
        break;
    }
  };

  // ✅ Handlers mejorados
  const handleCreateItem = async (itemData: Omit<Item, 'id'>) => {
    await addItem(itemData);
    changeView('list'); // Volver a lista después de crear
  };

  const handleEditItem = async (itemData: Partial<Item>) => {
    if (editingItem) {
      await updateItem(editingItem.id, itemData);
      changeView('list'); // Volver a lista después de editar
    }
  };

  const handleAddStock = (item: Item) => {
    changeView('stock', item);
  };

  const handleEditClick = (item: Item) => {
    changeView('edit', item);
  };

  // ✅ Render del breadcrumb local (si no viene desde App.tsx)
  const renderBreadcrumb = () => {
    if (breadcrumbItems.length > 1) {
      return <Breadcrumb items={breadcrumbItems} />;
    }
    return null;
  };

  return (
    <Box>
      {/* ✅ Breadcrumb local para navegación interna */}
      {renderBreadcrumb()}
      
      <VStack gap="6" align="stretch">
        {/* Vista Lista */}
        {currentView === 'list' && (
          <>
            <Button 
              colorPalette="blue" 
              alignSelf="flex-start"
              onClick={() => changeView('create')}
            >
              ➕ Nuevo Insumo
            </Button>
            
            <ItemList 
              items={items} 
              loading={loading}
              onEdit={handleEditClick}
              onAddStock={handleAddStock}
            />
          </>
        )}

        {/* Vista Crear */}
        {currentView === 'create' && (
          <Box>
            <Button 
              variant="ghost" 
              mb={4}
              onClick={() => changeView('list')}
            >
              ← Volver a Lista
            </Button>
            
            <ItemForm 
              onSubmit={handleCreateItem}
              onCancel={() => changeView('list')}
            />
          </Box>
        )}

        {/* Vista Editar */}
        {currentView === 'edit' && editingItem && (
          <Box>
            <Button 
              variant="ghost" 
              mb={4}
              onClick={() => changeView('list')}
            >
              ← Volver a Lista
            </Button>
            
            <ItemForm 
              initialData={editingItem}
              onSubmit={handleEditItem}
              onCancel={() => changeView('list')}
              mode="edit"
            />
          </Box>
        )}

        {/* Vista Stock (placeholder para próximo quick win) */}
        {currentView === 'stock' && stockItem && (
          <Box>
            <Button 
              variant="ghost" 
              mb={4}
              onClick={() => changeView('list')}
            >
              ← Volver a Lista
            </Button>
            
            <Box p={4} bg="yellow.50" borderRadius="md">
              <p>🚧 Vista de Stock para: <strong>{stockItem.name}</strong></p>
              <p>Esta será implementada en el próximo Quick Win: "Mostrar Stock en Sales"</p>
            </Box>
          </Box>
        )}
      </VStack>
    </Box>
  );
}

// ✅ OPCIONAL: Context Provider para pasar navegación a módulos
// src/contexts/NavigationContext.tsx
/*
import { createContext, useContext } from 'react';

interface NavigationContextType {
  navigate: (route: string) => void;
  currentRoute: string;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}

export function NavigationProvider({ 
  children, 
  navigate, 
  currentRoute 
}: {
  children: React.ReactNode;
  navigate: (route: string) => void;
  currentRoute: string;
}) {
  return (
    <NavigationContext.Provider value={{ navigate, currentRoute }}>
      {children}
    </NavigationContext.Provider>
  );
}
*/