import { useState } from 'react';
import {
  Box,
  Card,
  Text,
  VStack,
  HStack,
  Button,
  IconButton,
  Badge,
  Collapsible,
  SimpleGrid
} from '@chakra-ui/react';
// Iconos SVG inline para mantener consistencia con el proyecto
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
);

const ChefHatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.5 11.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zm-11 0c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zm6.5-5c1.66 0 3 1.34 3 3v1h2c.55 0 1 .45 1 1v8c0 .55-.45 1-1 1H6c-.55 0-1-.45-1-1v-8c0-.55.45-1 1-1h2v-1c0-1.66 1.34-3 3-3zm1 4v-1c0-.55-.45-1-1-1s-1 .45-1 1v1h2z"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
  </svg>
);

const PackageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3 3h4v14H5V5h4l3-3zm0 2.83L10.83 6H7v12h10V6h-3.83L12 4.83zm0 2.17l2 2v6h-4v-6l2-2z"/>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 0 0 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
);

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
);

// Types basados en el proyecto
interface Item {
  id: string;
  name: string;
  type: 'UNIT' | 'WEIGHT' | 'VOLUME' | 'ELABORATED';
  unit: string;
  stock: number;
  unit_cost?: number;
  created_at?: string;
}

interface ItemCardProps {
  item: Item;
  onQuickAction: (action: QuickActionType, itemId: string) => void;
}

type QuickActionType = 'add_stock' | 'use_in_recipe' | 'view_details' | 'create_product' | 'edit';

// Mapeo de tipos para mostrar
const TYPE_LABELS = {
  UNIT: 'Unidades',
  WEIGHT: 'Peso',
  VOLUME: 'Volumen',
  ELABORATED: 'Elaborado'
} as const;

const TYPE_COLORS = {
  UNIT: 'blue',
  WEIGHT: 'green', 
  VOLUME: 'purple',
  ELABORATED: 'orange'
} as const;

export function ItemCard({ item, onQuickAction }: ItemCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);

  // Determinar estado del stock
  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { color: 'red', label: 'Sin stock' };
    if (stock <= 10) return { color: 'yellow', label: 'Stock bajo' };
    return { color: 'green', label: 'Disponible' };
  };

  const stockStatus = getStockStatus(item.stock);

  const handleQuickAction = (action: QuickActionType) => {
    onQuickAction(action, item.id);
    setIsActionsMenuOpen(false);
  };

  return (
    <Card.Root
      size="sm"
      borderWidth="1px"
      borderColor="gray.200"
      _hover={{ 
        borderColor: 'blue.300',
        boxShadow: 'sm',
        transform: 'translateY(-1px)',
        transition: 'all 0.2s'
      }}
    >
      <Card.Body p={4}>
        <VStack align="stretch" gap="3">
          {/* Header */}
          <HStack justify="space-between" align="flex-start">
            <VStack align="flex-start" gap="1" flex="1">
              <Text fontWeight="semibold" fontSize="md" color="gray.800">
                {item.name}
              </Text>
              <HStack gap="2">
                <Badge colorPalette={TYPE_COLORS[item.type]} size="sm">
                  {TYPE_LABELS[item.type]}
                </Badge>
                <Badge colorPalette={stockStatus.color} size="sm">
                  {stockStatus.label}
                </Badge>
              </HStack>
            </VStack>
            
            {/* Menú de acciones */}
            <Box position="relative">
              <IconButton
                aria-label="Más acciones"
                size="sm"
                variant="ghost"
                onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
              >
                <MoreIcon />
              </IconButton>
              
              {/* Quick Actions Menu */}
              <Collapsible.Root open={isActionsMenuOpen}>
                <Collapsible.Content>
                  <Box
                    position="absolute"
                    right="0"
                    top="100%"
                    zIndex="10"
                    mt={1}
                    bg="white"
                    borderWidth="1px"
                    borderColor="gray.200"
                    rounded="md"
                    boxShadow="lg"
                    minW="180px"
                    py={2}
                  >
                    <VStack gap="1" align="stretch" divideY="1px">
                      <VStack gap="1" align="stretch">
                        <Button
                          size="sm"
                          variant="ghost"
                          justifyContent="flex-start"
                          onClick={() => handleQuickAction('add_stock')}
                          colorPalette="green"
                        >
                          <PlusIcon />
                          Agregar Stock
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          justifyContent="flex-start"
                          onClick={() => handleQuickAction('use_in_recipe')}
                          colorPalette="purple"
                        >
                          <ChefHatIcon />
                          Usar en Receta
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          justifyContent="flex-start"
                          onClick={() => handleQuickAction('create_product')}
                          colorPalette="orange"
                        >
                          <PackageIcon />
                          Crear Producto
                        </Button>
                      </VStack>
                      
                      <VStack gap="1" align="stretch">
                        <Button
                          size="sm"
                          variant="ghost"
                          justifyContent="flex-start"
                          onClick={() => handleQuickAction('edit')}
                          colorPalette="blue"
                        >
                          <EditIcon />
                          Editar
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          justifyContent="flex-start"
                          onClick={() => setShowDetails(!showDetails)}
                          colorPalette="gray"
                        >
                          <InfoIcon />
                          {showDetails ? 'Ocultar' : 'Ver'} Detalles
                        </Button>
                      </VStack>
                    </VStack>
                  </Box>
                </Collapsible.Content>
              </Collapsible.Root>
            </Box>
          </HStack>

          {/* Stock Info */}
          <HStack justify="space-between" align="center">
            <VStack align="flex-start" gap="0">
              <Text fontSize="lg" fontWeight="bold" color="gray.700">
                {item.stock} {item.unit}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Stock actual
              </Text>
            </VStack>
            
            {item.unit_cost && (
              <VStack align="flex-end" gap="0">
                <Text fontSize="md" fontWeight="medium" color="green.600">
                  ${item.unit_cost.toFixed(2)}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  por {item.unit}
                </Text>
              </VStack>
            )}
          </HStack>

          {/* Detalles expandibles */}
          <Collapsible.Root open={showDetails}>
            <Collapsible.Content>
              <Box pt={2} borderTop="1px" borderColor="gray.100">
                <SimpleGrid columns={2} gap={3}>
                  <VStack align="flex-start" gap="1">
                    <Text fontSize="xs" fontWeight="medium" color="gray.600">
                      ID
                    </Text>
                    <Text fontSize="sm" color="gray.700" fontFamily="mono">
                      {item.id.slice(0, 8)}...
                    </Text>
                  </VStack>
                  
                  <VStack align="flex-start" gap="1">
                    <Text fontSize="xs" fontWeight="medium" color="gray.600">
                      Tipo
                    </Text>
                    <Text fontSize="sm" color="gray.700">
                      {TYPE_LABELS[item.type]}
                    </Text>
                  </VStack>
                  
                  <VStack align="flex-start" gap="1">
                    <Text fontSize="xs" fontWeight="medium" color="gray.600">
                      Unidad
                    </Text>
                    <Text fontSize="sm" color="gray.700">
                      {item.unit}
                    </Text>
                  </VStack>
                  
                  {item.created_at && (
                    <VStack align="flex-start" gap="1">
                      <Text fontSize="xs" fontWeight="medium" color="gray.600">
                        Creado
                      </Text>
                      <Text fontSize="sm" color="gray.700">
                        {new Date(item.created_at).toLocaleDateString()}
                      </Text>
                    </VStack>
                  )}
                </SimpleGrid>
                
                {item.unit_cost && (
                  <Box mt={3} p={2} bg="green.50" rounded="md">
                    <Text fontSize="sm" color="green.700">
                      <Text as="span" fontWeight="medium">Valor total:</Text>{' '}
                      ${(item.stock * item.unit_cost).toFixed(2)}
                    </Text>
                  </Box>
                )}
              </Box>
            </Collapsible.Content>
          </Collapsible.Root>

          {/* Acciones principales rápidas */}
          <HStack gap="2" justify="center" pt={2}>
            <Button
              size="sm"
              colorPalette="green"
              variant="outline"
              onClick={() => handleQuickAction('add_stock')}
              flex="1"
            >
              <PlusIcon />
              Stock
            </Button>
            
            <Button
              size="sm"
              colorPalette="purple"
              variant="outline"
              onClick={() => handleQuickAction('use_in_recipe')}
              flex="1"
            >
              <ChefHatIcon />
              Receta
            </Button>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}

// Componente de demostración con datos de ejemplo
export default function ItemCardDemo() {
  const sampleItems: Item[] = [
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
  ];

  const handleQuickAction = (action: QuickActionType, itemId: string) => {
    const actionMessages = {
      add_stock: 'Abrir modal para agregar stock',
      use_in_recipe: 'Navegar a recetas con este item',
      view_details: 'Mostrar detalles expandidos',
      create_product: 'Crear producto con este item',
      edit: 'Editar este item'
    };

    alert(`Acción: ${actionMessages[action]} para item ${itemId}`);
  };

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <VStack align="stretch" gap="6">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
            🏷️ Items con Quick Actions
          </Text>
          <Text color="gray.600" mb={4}>
            Cards interactivas para gestión rápida de inventario. Cada card incluye acciones contextuales y detalles expandibles.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
          {sampleItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onQuickAction={handleQuickAction}
            />
          ))}
        </SimpleGrid>

        <Box bg="blue.50" p={4} rounded="md" borderLeft="4px" borderColor="blue.400">
          <Text fontSize="sm" fontWeight="medium" color="blue.800" mb={2}>
            💡 Quick Actions Disponibles:
          </Text>
          <VStack align="flex-start" gap="1" fontSize="sm" color="blue.700">
            <Text>• <Text as="span" fontWeight="medium">Agregar Stock:</Text> Modal para entrada de mercadería</Text>
            <Text>• <Text as="span" fontWeight="medium">Usar en Receta:</Text> Navegación contextual a recipes</Text>
            <Text>• <Text as="span" fontWeight="medium">Crear Producto:</Text> Generar producto para venta</Text>
            <Text>• <Text as="span" fontWeight="medium">Editar:</Text> Modificar información del item</Text>
            <Text>• <Text as="span" fontWeight="medium">Ver Detalles:</Text> Información expandida inline</Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}