// src/features/sales/components/ProductWithStock.tsx
import { useState, useEffect } from 'react';
import { 
  Stack,
  Typography, 
  Button, 
  Badge,
  InputField,
  NumberField,
  CardWrapper ,
  Alert,
  Icon
} from '@/shared/ui';
import { Skeleton } from '@chakra-ui/react';
import { notify } from '@/lib/notifications';
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

import { fetchProductsWithAvailability } from '../services/saleApi';
import { useSaleStockValidation } from '@/hooks/useSaleStockValidation';

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
  offlineMode?: boolean;
}

export function ProductWithStock({ 
  onAddToCart,
  onQuantityChange,
  currentCart = [],
  disabled = false,
  offlineMode = false
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
      setProducts(data as ProductWithAvailability[]);
      
      // Inicializar precios con costo + margen
      const initialPrices: Record<string, number> = {};
      data.forEach(product => {
        initialPrices[product.id] = Math.round((product.cost || 0) * 1.5); // 50% margen default
      });
      setPrices(initialPrices);
      
    } catch (error) {
      console.error('Error loading products:', error);
      notify.error({
        title: "Error al cargar productos",
        description: "No se pudieron cargar los productos con stock disponible"
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
      notify.warning({
        title: "Cantidad requerida",
        description: "Ingresa una cantidad mayor a 0"
      });
      return;
    }

    if (quantity > product.availability) {
      notify.error({
        title: "Stock insuficiente",
        description: `Solo hay ${product.availability} ${product.unit} disponibles`
      });
      return;
    }

    if (unitPrice <= 0) {
      notify.warning({
        title: "Precio requerido",
        description: "Ingresa un precio de venta válido"
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

    notify.success({
      title: "Producto agregado",
      description: `${quantity} ${product.unit} de ${product.name} agregado al carrito`
    });
  };

  const getStockStatus = (availability: number) => {
    if (availability === 0) {
      return {
        status: 'sin-stock',
        color: 'error',
        icon: XCircleSolid,
        text: 'Sin Stock'
      };
    } else if (availability <= 5) {
      return {
        status: 'stock-bajo',
        color: 'warning',
        icon: ExclamationTriangleSolid,
        text: 'Stock Bajo'
      };
    } else {
      return {
        status: 'disponible',
        color: 'success',
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
      <Stack direction="column" gap="md">
        <Skeleton height="60px" />
        <Skeleton height="60px" />
        <Skeleton height="60px" />
      </Stack>
    );
  }

  if (products.length === 0) {
    return (
      <Alert 
        status="info" 
        title="No hay productos disponibles"
      >
        No se encontraron productos con stock disponible para la venta.
      </Alert>
    );
  }

  return (
    <Stack direction="column" gap="md">
      {/* Alert de validación global */}
      {validationResult && !validationResult.is_valid && (
        <Alert 
          status="error" 
          title="Stock Insuficiente"
        >
          <div>
            {validationResult.error_message}
            {validationResult.insufficient_items && (
              <div style={{ marginTop: '0.5rem' }}>
                {validationResult.insufficient_items.map((item, idx) => (
                  <Typography key={idx} variant="body" size="sm">
                    • {item.product_name}: necesitas {item.required}, solo hay {item.available}
                  </Typography>
                ))}
              </div>
            )}
          </div>
        </Alert>
      )}

      {/* Lista de productos */}
      {products.map((product) => {
        const stockStatus = getStockStatus(product.availability);
        const quantityValidation = getQuantityValidation(product.id);
        const currentQuantity = quantities[product.id] || 0;
        const currentPrice = prices[product.id] || 0;
        const StatusIcon = stockStatus.icon;

        return (
          <CardWrapper key={product.id} variant="outline">
            <div style={{ padding: '1rem' }}>
              <Stack direction="column" gap="md">
                {/* Header con nombre y badge de stock */}
                <Stack direction="row" justify="space-between" align="center">
                  <Stack direction="column" gap="xs" align="start">
                    <Typography variant="heading" size="md" weight="bold">
                      {product.name}
                    </Typography>
                    {product.description && (
                      <Typography variant="body" size="sm" color="text.muted">
                        {product.description}
                      </Typography>
                    )}
                  </Stack>
                  
                  <Badge colorPalette={stockStatus.color as 'error' | 'warning' | 'success'} size="lg">
                    <StatusIcon className="w-4 h-4 mr-1" />
                    {stockStatus.text}
                  </Badge>
                </Stack>

                {/* Información de stock y costos */}
                <Stack direction="row" gap="lg">
                  <Typography variant="body" size="sm">
                    <span style={{ fontWeight: 'bold' }}>Stock:</span>{' '}
                    {product.availability} {product.unit}
                  </Typography>
                  <Typography variant="body" size="sm">
                    <span style={{ fontWeight: 'bold' }}>Costo:</span>{' '}
                    ${product.cost?.toFixed(2) || '0.00'}
                  </Typography>
                  <Typography variant="body" size="sm">
                    <span style={{ fontWeight: 'bold' }}>Componentes:</span>{' '}
                    {product.components_count}
                  </Typography>
                </Stack>

                {/* Controles de venta */}
                {product.availability > 0 && (
                  <Stack direction="row" gap="md" align="end">
                    <div style={{ flex: 1 }}>
                      <Typography variant="body" size="sm" weight="medium" style={{ marginBottom: '0.25rem' }}>
                        Cantidad
                      </Typography>
                      <NumberField
                        min={0}
                        max={product.availability}
                        value={currentQuantity || 0}
                        onChange={(value) => handleQuantityChange(product.id, value.toString())}
                        placeholder="0"
                        disabled={disabled}
                        step={1}
                      />
                      {quantityValidation && (
                        <Typography 
                          variant="body" 
                          size="xs" 
                          color={quantityValidation.isValid ? "success" : "error"}
                          style={{ marginTop: '0.25rem' }}
                        >
                          {quantityValidation.message}
                        </Typography>
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <Typography variant="body" size="sm" weight="medium" style={{ marginBottom: '0.25rem' }}>
                        Precio Unitario
                      </Typography>
                      <NumberField
                        min={0}
                        step={0.01}
                        precision={2}
                        value={currentPrice || 0}
                        onChange={(value) => handlePriceChange(product.id, value.toString())}
                        placeholder="0.00"
                        disabled={disabled}
                      />
                    </div>

                    <Button
                      colorPalette="info"
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
                  </Stack>
                )}

                {/* Mensaje cuando no hay stock */}
                {product.availability === 0 && (
                  <Alert 
                    status="warning" 
                    size="sm"
                  >
                    Producto sin stock disponible. Revisa los componentes en el módulo de Inventario.
                  </Alert>
                )}
              </Stack>
            </div>
          </CardWrapper>
        );
      })}

      {/* Botón de refrescar */}
      <Stack direction="row" justify="center" style={{ marginTop: '1rem' }}>
        <Button
          variant="outline"
          onClick={loadProductsWithStock}
          disabled={loading}
          loading={loading}
        >
          Actualizar Stock
        </Button>
      </Stack>
    </Stack>
  );
}