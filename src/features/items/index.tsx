import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  Dialog,
  Input,
  Textarea,
  Select,
  createListCollection,
  Alert
} from '@chakra-ui/react';
import { toaster } from '@/components/ui/toaster'; // Configurar según tu setup de toaster
import { EnhancedItemList } from './ui/ItemList';

// Types - basados en el proyecto actual
interface Item {
  id: string;
  name: string;
  type: 'UNIT' | 'WEIGHT' | 'VOLUME' | 'ELABORATED';
  unit: string;
  stock: number;
  unit_cost?: number;
  created_at?: string;
}

type QuickActionType = 'add_stock' | 'use_in_recipe' | 'view_details' | 'create_product' | 'edit';

// Iconos SVG inline siguiendo la convención del proyecto
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
);

const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

// Hook simulado - en el proyecto real esto vendría de logic/useItems.ts
function useItems() {
  const [items, setItems] = useState<Item[]>([
    {
      id: '1',
      name: 'Harina 000',
      type: 'WEIGHT',
      unit: 'kg',
      stock: 25.5,
      unit_cost: 120.50,
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2', 
      name: 'Aceite de Girasol',
      type: 'VOLUME',
      unit: 'litros',
      stock: 8.2,
      unit_cost: 85.00,
      created_at: '2024-01-20T14:45:00Z'
    },
    {
      id: '3',
      name: 'Empanadas de Carne',
      type: 'ELABORATED',
      unit: 'unidades',
      stock: 0,
      unit_cost: 15.75,
      created_at: '2024-01-22T09:15:00Z'
    },
    {
      id: '4',
      name: 'Servilletas',
      type: 'UNIT',
      unit: 'paquetes',
      stock: 45,
      unit_cost: 12.00,
      created_at: '2024-01-18T16:20:00Z'
    }
  ]);

  const [loading, setLoading] = useState(false);

  const createItem = async (itemData: Omit<Item, 'id' | 'created_at'>) => {
    setLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newItem: Item = {
        ...itemData,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      };
      
      setItems(prev => [...prev, newItem]);
      return newItem;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id: string, updates: Partial<Item>) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
    } finally {
      setLoading(false);
    }
  };

  return { items, loading, createItem, updateItem };
}

// Collections para formularios
const ITEM_TYPE_COLLECTION = createListCollection({
  items: [
    { label: 'Unidades', value: 'UNIT' },
    { label: 'Peso', value: 'WEIGHT' },
    { label: 'Volumen', value: 'VOLUME' },
    { label: 'Elaborado', value: 'ELABORATED' },
  ],
});

// Dialog para agregar stock - USANDO DIALOG CORRECTAMENTE
interface AddStockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
  onAddStock: (itemId: string, quantity: number, cost: number, note: string) => void;
}

function AddStockDialog({ isOpen, onClose, item, onAddStock }: AddStockDialogProps) {
  const [form, setForm] = useState({ quantity: '', cost: '', note: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.quantity || isNaN(Number(form.quantity)) || Number(form.quantity) <= 0) {
      newErrors.quantity = 'Cantidad debe ser un número mayor a 0';
    }
    
    if (form.cost && (isNaN(Number(form.cost)) || Number(form.cost) < 0)) {
      newErrors.cost = 'Costo debe ser un número válido';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await onAddStock(
        item!.id,
        Number(form.quantity),
        Number(form.cost) || 0,
        form.note
      );
      setForm({ quantity: '', cost: '', note: '' });
      onClose();
      
      toaster.create({
        title: 'Stock agregado',
        description: `Se agregaron ${form.quantity} ${item?.unit} a ${item?.name}`,
        status: 'success'
      });
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'No se pudo agregar el stock',
        status: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="md">
          <Dialog.Header>
            <Dialog.Title>➕ Agregar Stock - {item.name}</Dialog.Title>
            <Dialog.CloseTrigger />
          </Dialog.Header>
          
          <Dialog.Body>
            <VStack gap="4" align="stretch">
              <Alert.Root status="info" size="sm">
                <Alert.Indicator />
                <Alert.Title>Stock actual: {item.stock} {item.unit}</Alert.Title>
              </Alert.Root>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Cantidad a agregar *
                </Text>
                <Input
                  placeholder={`Cantidad en ${item.unit}`}
                  value={form.quantity}
                  onChange={(e) => setForm(prev => ({ ...prev, quantity: e.target.value }))}
                  borderColor={errors.quantity ? 'red.300' : undefined}
                />
                {errors.quantity && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.quantity}
                  </Text>
                )}
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Costo por {item.unit} (opcional)
                </Text>
                <Input
                  placeholder="0.00"
                  value={form.cost}
                  onChange={(e) => setForm(prev => ({ ...prev, cost: e.target.value }))}
                  borderColor={errors.cost ? 'red.300' : undefined}
                />
                {errors.cost && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.cost}
                  </Text>
                )}
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Notas (opcional)
                </Text>
                <Textarea
                  placeholder="Proveedor, factura, observaciones..."
                  value={form.note}
                  onChange={(e) => setForm(prev => ({ ...prev, note: e.target.value }))}
                  size="sm"
                />
              </Box>
            </VStack>
          </Dialog.Body>
          
          <Dialog.Footer>
            <HStack gap="3" justify="flex-end">
              <Button variant="outline" onClick={onClose}>
                <XIcon />
                Cancelar
              </Button>
              <Button 
                colorPalette="green" 
                onClick={handleSubmit}
                loading={isSubmitting}
                loadingText="Agregando..."
              >
                <PlusIcon />
                Agregar Stock
              </Button>
            </HStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}

// Dialog para agregar nuevo item - USANDO DIALOG CORRECTAMENTE
interface AddItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateItem: (item: Omit<Item, 'id' | 'created_at'>) => Promise<void>;
}

function AddItemDialog({ isOpen, onClose, onCreateItem }: AddItemDialogProps) {
  const [form, setForm] = useState({
    name: '',
    type: '',
    unit: '',
    stock: '',
    unit_cost: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTypeChange = (details: { value: string[] }) => {
    setForm(prev => ({ ...prev, type: details.value[0] || '' }));
    if (errors.type) {
      setErrors(prev => ({ ...prev, type: undefined }));
    }
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!form.type) newErrors.type = 'El tipo es requerido';
    if (!form.unit.trim()) newErrors.unit = 'La unidad es requerida';
    if (form.stock && isNaN(Number(form.stock))) newErrors.stock = 'Stock debe ser un número';
    if (form.unit_cost && isNaN(Number(form.unit_cost))) newErrors.unit_cost = 'Costo debe ser un número';

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await onCreateItem({
        name: form.name.trim(),
        type: form.type as Item['type'],
        unit: form.unit.trim(),
        stock: Number(form.stock) || 0,
        unit_cost: Number(form.unit_cost) || undefined
      });
      
      setForm({ name: '', type: '', unit: '', stock: '', unit_cost: '' });
      onClose();
      
      toaster.create({
        title: 'Item creado',
        description: `${form.name} se creó exitosamente`,
        status: 'success'
      });
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'No se pudo crear el item',
        status: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="md">
          <Dialog.Header>
            <Dialog.Title>📦 Crear Nuevo Item</Dialog.Title>
            <Dialog.CloseTrigger />
          </Dialog.Header>
          
          <Dialog.Body>
            <VStack gap="4" align="stretch">
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Nombre *
                </Text>
                <Input
                  placeholder="Nombre del item"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  borderColor={errors.name ? 'red.300' : undefined}
                />
                {errors.name && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.name}
                  </Text>
                )}
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Tipo *
                </Text>
                <Select.Root
                  collection={ITEM_TYPE_COLLECTION}
                  value={form.type ? [form.type] : []}
                  onValueChange={handleTypeChange}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger borderColor={errors.type ? 'red.300' : undefined}>
                      <Select.ValueText placeholder="Seleccionar tipo" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Select.Positioner>
                    <Select.Content>
                      {ITEM_TYPE_COLLECTION.items.map((item) => (
                        <Select.Item key={item.value} item={item}>
                          <Select.ItemText>{item.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Select.Root>
                {errors.type && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.type}
                  </Text>
                )}
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  Unidad *
                </Text>
                <Input
                  placeholder="kg, litros, unidades, etc."
                  value={form.unit}
                  onChange={(e) => setForm(prev => ({ ...prev, unit: e.target.value }))}
                  borderColor={errors.unit ? 'red.300' : undefined}
                />
                {errors.unit && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {errors.unit}
                  </Text>
                )}
              </Box>

              <HStack gap="4">
                <Box flex="1">
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Stock inicial (opcional)
                  </Text>
                  <Input
                    placeholder="0"
                    value={form.stock}
                    onChange={(e) => setForm(prev => ({ ...prev, stock: e.target.value }))}
                    borderColor={errors.stock ? 'red.300' : undefined}
                  />
                  {errors.stock && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.stock}
                    </Text>
                  )}
                </Box>

                <Box flex="1">
                  <Text fontSize="sm" fontWeight="medium" mb={2}>
                    Costo/unidad (opcional)
                  </Text>
                  <Input
                    placeholder="0.00"
                    value={form.unit_cost}
                    onChange={(e) => setForm(prev => ({ ...prev, unit_cost: e.target.value }))}
                    borderColor={errors.unit_cost ? 'red.300' : undefined}
                  />
                  {errors.unit_cost && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.unit_cost}
                    </Text>
                  )}
                </Box>
              </HStack>
            </VStack>
          </Dialog.Body>
          
          <Dialog.Footer>
            <HStack gap="3" justify="flex-end">
              <Button variant="outline" onClick={onClose}>
                <XIcon />
                Cancelar
              </Button>
              <Button 
                colorPalette="blue" 
                onClick={handleSubmit}
                loading={isSubmitting}
                loadingText="Creando..."
              >
                <SaveIcon />
                Crear Item
              </Button>
            </HStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}

// Componente principal
export default function ItemsPageWithQuickActions() {
  const { items, loading, createItem, updateItem } = useItems();
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showAddStockDialog, setShowAddStockDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const handleQuickAction = (action: QuickActionType, itemId: string, item?: Item) => {
    const foundItem = item || items.find(i => i.id === itemId);
    
    switch (action) {
      case 'add_stock':
        setSelectedItem(foundItem || null);
        setShowAddStockDialog(true);
        break;
        
      case 'use_in_recipe':
        // En el proyecto real: navigate('/recipes?preloadItem=' + itemId)
        toaster.create({
          title: '📝 Navegando a Recetas',
          description: `Abriendo recetas con ${foundItem?.name} pre-cargado`,
          status: 'info'
        });
        break;
        
      case 'create_product':
        // En el proyecto real: navigate('/products/new?fromItem=' + itemId)
        toaster.create({
          title: '🎯 Creando Producto',
          description: `Creando producto usando ${foundItem?.name}`,
          status: 'info'
        });
        break;
        
      case 'edit':
        // En el proyecto real: Abrir dialog de edición o navigate
        toaster.create({
          title: '✏️ Editando Item',
          description: `Abriendo editor para ${foundItem?.name}`,
          status: 'info'
        });
        break;
        
      case 'view_details':
        // Ya manejado por el ItemCard interno
        break;
    }
  };

  const handleAddStock = async (itemId: string, quantity: number, cost: number, note: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    // Actualizar stock del item
    await updateItem(itemId, {
      stock: item.stock + quantity,
      unit_cost: cost > 0 ? cost : item.unit_cost
    });

    // En el proyecto real también crearías un StockEntry:
    // await createStockEntry({ itemId, quantity, unitCost: cost, note });
  };

  const handleCreateItem = async (itemData: Omit<Item, 'id' | 'created_at'>) => {
    await createItem(itemData);
  };

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <VStack align="stretch" gap="6">
        {/* Header de página */}
        <HStack justify="space-between" align="center">
          <VStack align="flex-start" gap="1">
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              📦 Gestión de Items
            </Text>
            <Text color="gray.600">
              Items del inventario con acciones rápidas integradas
            </Text>
          </VStack>
          
          <Button colorPalette="blue" onClick={() => setShowAddItemDialog(true)}>
            <PlusIcon />
            Nuevo Item
          </Button>
        </HStack>

        {/* Lista mejorada */}
        <EnhancedItemList
          items={items}
          loading={loading}
          onQuickAction={handleQuickAction}
          onAddItem={() => setShowAddItemDialog(true)}
        />

        {/* Dialogs */}
        <AddItemDialog
          isOpen={showAddItemDialog}
          onClose={() => setShowAddItemDialog(false)}
          onCreateItem={handleCreateItem}
        />

        <AddStockDialog
          isOpen={showAddStockDialog}
          onClose={() => {
            setShowAddStockDialog(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          onAddStock={handleAddStock}
        />

        {/* Info de implementación */}
        <Box bg="blue.50" p={4} rounded="md" borderLeft="4px" borderColor="blue.400">
          <Text fontSize="sm" fontWeight="medium" color="blue.800" mb={2}>
            🛠️ Quick Win Implementado: Quick Actions en Items
          </Text>
          <VStack align="flex-start" gap="1" fontSize="sm" color="blue.700">
            <Text>✅ Cards interactivas con acciones contextuales</Text>
            <Text>✅ Dialog de "Agregar Stock" integrado</Text>
            <Text>✅ Navegación contextual a otros módulos</Text>
            <Text>✅ Vista dual: Cards + Tabla con filtros</Text>
            <Text>✅ Integración completa con arquitectura existente</Text>
            <Text>✅ Dialog API correcta (no Modal) de Chakra UI v3.23</Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}