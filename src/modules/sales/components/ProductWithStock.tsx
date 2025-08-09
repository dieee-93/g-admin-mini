// src/features/sales/components/ProductWithStock.tsx
import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  VStack, 
  HStack,
  Text, 
  Input,
  Badge,
  Card,
  Skeleton,
  Alert,
  createListCollection
} from '@chakra-ui/react';
import { 
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { 
  CheckCircleIcon as CheckCircleSolid,
  XCircleIcon as XCircleSolid,
  ExclamationTriangleIcon as ExclamationTriangleSolid
} from '@heroicons/react/24/solid';

import { fetchProductsWithAvailability } from '../data/saleApi';
import { useSaleStockValidation } from '@/hooks/useSaleStockValidation';
import { toaster } from '@/shared/ui/toaster';

interface ProductWithAvailability {
  id: string;
  name: string;
  unit: string;
  type: string;
  description?: string;
  cost: number;
  availability: number;
  components_count: number;
}

interface SaleItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  max_available: number;
}

interface ProductWithStockProps {
  onAddToCart?: (item: SaleItem) => void;
  onQuantityChange?: (productId: string, quantity: number) => void;
  currentCart?: SaleItem[];
  disabled?: boolean;
}

export function ProductWithStock({ 
  onAddToCart,
  onQuantityChange,
  currentCart = [],
  disabled = false 
}: ProductWithStockProps) {
  const [products, setProducts] = useState<ProductWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [prices, setPrices] = useState<Record<string, number>>({});
  
  const { validateStock, validationResult, isValidating } = useSaleStockValidation();

  // Cargar productos con disponibilidad
  useEffect(() => {
    loadProductsWithStock();
  }, []);

  const loadProductsWithStock = async () => {
    try {
      setLoading(true);
      const data = await fetchProductsWithAvailability();
      setProducts(data);
      
      // Inicializar precios con costo + margen
      const initialPrices: Record<string, number> = {};
      data.forEach(product => {
        initialPrices[product.id] = Math.round(product.cost * 1.5); // 50% margen default
      });
      setPrices(initialPrices);
      
    } catch (error) {
      console.error('Error loading products:', error);
      toaster.create({
        title: "Error al cargar productos",
        description: "No se pudieron cargar los productos con stock disponible",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Validar stock en tiempo real cuando cambian las cantidades
  useEffect(() => {
    const saleItems = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, quantity]) => ({
        product_id: productId,
        quantity
      }));

    if (saleItems.length > 0) {
      validateStock(saleItems);
    }
  }, [quantities, validateStock]);

  const handleQuantityChange = (productId: string, value: string) => {
    const quantity = parseInt(value) || 0;
    const newQuantities = { ...quantities, [productId]: quantity };
    setQuantities(newQuantities);
    
    if (onQuantityChange) {
      onQuantityChange(productId, quantity);
    }
  };

  const handlePriceChange = (productId: string, value: string) => {
    const price = parseFloat(value) || 0;
    setPrices(prev => ({ ...prev, [productId]: price }));
  };

  const handleAddToCart = (product: ProductWithAvailability) => {
    const quantity = quantities[product.id] || 0;
    const unitPrice = prices[product.id] || 0;

    if (quantity <= 0) {
      toaster.create({
        title: "Cantidad requerida",
        description: "Ingresa una cantidad mayor a 0",
        status: "warning",
      });
      return;
    }

    if (quantity > product.availability) {
      toaster.create({
        title: "Stock insuficiente",
        description: `Solo hay ${product.availability} ${product.unit} disponibles`,
        status: "error",
      });
      return;
    }

    if (unitPrice <= 0) {
      toaster.create({
        title: "Precio requerido",
        description: "Ingresa un precio de venta válido",
        status: "warning",
      });
      return;
    }

    const saleItem: SaleItem = {
      product_id: product.id,
      product_name: product.name,
      quantity,
      unit_price: unitPrice,
      max_available: product.availability
    };

    if (onAddToCart) {
      onAddToCart(saleItem);
    }

    // Limpiar cantidad después de agregar
    setQuantities(prev => ({ ...prev, [product.id]: 0 }));

    toaster.create({
      title: "Producto agregado",
      description: `${quantity} ${product.unit} de ${product.name} agregado al carrito`,
      status: "success",
    });
  };

  const getStockStatus = (availability: number) => {
    if (availability === 0) {
      return {
        status: 'sin-stock',
        color: 'red',
        icon: XCircleSolid,
        text: 'Sin Stock'
      };
    } else if (availability <= 5) {
      return {
        status: 'stock-bajo',
        color: 'orange',
        icon: ExclamationTriangleSolid,
        text: 'Stock Bajo'
      };
    } else {
      return {
        status: 'disponible',
        color: 'green',
        icon: CheckCircleSolid,
        text: 'Disponible'
      };
    }
  };

  const getQuantityValidation = (productId: string) => {
    const quantity = quantities[productId] || 0;
    const product = products.find(p => p.id === productId);
    
    if (!product || quantity === 0) return null;

    if (quantity > product.availability) {
      return {
        isValid: false,
        message: `Máximo ${product.availability} disponibles`
      };
    }

    return { isValid: true, message: 'Cantidad válida' };
  };

  if (loading) {
    return (
      <VStack gap="4" align="stretch">
        <Skeleton height="60px" />
        <Skeleton height="60px" />
        <Skeleton height="60px" />
      </VStack>
    );
  }

  if (products.length === 0) {
    return (
      <Alert.Root status="info">
        <Alert.Indicator>
          <InformationCircleIcon className="w-5 h-5" />
        </Alert.Indicator>
        <Alert.Title>No hay productos disponibles</Alert.Title>
        <Alert.Description>
          No se encontraron productos con stock disponible para la venta.
        </Alert.Description>
      </Alert.Root>
    );
  }

  return (
    <VStack gap="4" align="stretch">
      {/* Alert de validación global */}
      {validationResult && !validationResult.is_valid && (
        <Alert.Root status="error">
          <Alert.Indicator>
            <ExclamationTriangleIcon className="w-5 h-5" />
          </Alert.Indicator>
          <Alert.Title>Stock Insuficiente</Alert.Title>
          <Alert.Description>
            {validationResult.error_message}
            {validationResult.insufficient_items && (
              <Box mt="2">
                {validationResult.insufficient_items.map((item, idx) => (
                  <Text key={idx} fontSize="sm">
                    • {item.product_name}: necesitas {item.required}, solo hay {item.available}
                  </Text>
                ))}
              </Box>
            )}
          </Alert.Description>
        </Alert.Root>
      )}

      {/* Lista de productos */}
      {products.map((product) => {
        const stockStatus = getStockStatus(product.availability);
        const quantityValidation = getQuantityValidation(product.id);
        const currentQuantity = quantities[product.id] || 0;
        const currentPrice = prices[product.id] || 0;
        const StatusIcon = stockStatus.icon;

        return (
          <Card.Root key={product.id} variant="outline">
            <Card.Body>
              <VStack gap="3" align="stretch">
                {/* Header con nombre y badge de stock */}
                <HStack justify="space-between" align="center">
                  <VStack gap="1" align="start">
                    <Text fontWeight="bold" fontSize="lg">
                      {product.name}
                    </Text>
                    {product.description && (
                      <Text fontSize="sm" color="gray.600">
                        {product.description}
                      </Text>
                    )}
                  </VStack>
                  
                  <Badge colorPalette={stockStatus.color} size="lg">
                    <StatusIcon className="w-4 h-4 mr-1" />
                    {stockStatus.text}
                  </Badge>
                </HStack>

                {/* Información de stock y costos */}
                <HStack gap="6" wrap="wrap">
                  <Text fontSize="sm">
                    <Text as="span" fontWeight="medium">Stock:</Text>{' '}
                    {product.availability} {product.unit}
                  </Text>
                  <Text fontSize="sm">
                    <Text as="span" fontWeight="medium">Costo:</Text>{' '}
                    ${product.cost.toFixed(2)}
                  </Text>
                  <Text fontSize="sm">
                    <Text as="span" fontWeight="medium">Componentes:</Text>{' '}
                    {product.components_count}
                  </Text>
                </HStack>

                {/* Controles de venta */}
                {product.availability > 0 && (
                  <HStack gap="3" align="end">
                    <Box flex="1">
                      <Text mb="1" fontSize="sm" fontWeight="medium">
                        Cantidad
                      </Text>
                      <Input
                        type="number"
                        min="0"
                        max={product.availability}
                        value={currentQuantity || ''}
                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                        placeholder="0"
                        disabled={disabled}
                      />
                      {quantityValidation && (
                        <Text 
                          fontSize="xs" 
                          color={quantityValidation.isValid ? "green.600" : "red.600"}
                          mt="1"
                        >
                          {quantityValidation.message}
                        </Text>
                      )}
                    </Box>

                    <Box flex="1">
                      <Text mb="1" fontSize="sm" fontWeight="medium">
                        Precio Unitario
                      </Text>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={currentPrice || ''}
                        onChange={(e) => handlePriceChange(product.id, e.target.value)}
                        placeholder="0.00"
                        disabled={disabled}
                      />
                    </Box>

                    <Button
                      colorPalette="blue"
                      onClick={() => handleAddToCart(product)}
                      disabled={
                        disabled || 
                        currentQuantity <= 0 || 
                        currentQuantity > product.availability ||
                        currentPrice <= 0 ||
                        isValidating
                      }
                      loading={isValidating}
                    >
                      <ShoppingCartIcon className="w-4 h-4" />
                      Agregar
                    </Button>
                  </HStack>
                )}

                {/* Mensaje cuando no hay stock */}
                {product.availability === 0 && (
                  <Alert.Root status="warning" size="sm">
                    <Alert.Indicator>
                      <XCircleIcon className="w-4 h-4" />
                    </Alert.Indicator>
                    <Alert.Description>
                      Producto sin stock disponible. Revisa los componentes en el módulo de Inventario.
                    </Alert.Description>
                  </Alert.Root>
                )}
              </VStack>
            </Card.Body>
          </Card.Root>
        );
      })}

      {/* Botón de refrescar */}
      <HStack justify="center" mt="4">
        <Button
          variant="outline"
          onClick={loadProductsWithStock}
          disabled={loading}
          loading={loading}
        >
          Actualizar Stock
        </Button>
      </HStack>
    </VStack>
  );
}