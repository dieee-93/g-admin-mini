// src/features/products/ui/ProductList.tsx
// Product List with Intelligence Display

import React from "react";
import {
  Stack,
  Typography,
  Badge,
  CardWrapper ,
  Grid
} from "@/shared/ui";
import { VirtualizedList } from "@/lib/performance/virtualization/VirtualizedList";
import { type ProductWithIntelligence } from "../types";

interface ProductListProps {
  products: ProductWithIntelligence[];
  loading: boolean;
  error: string | null;
  onEdit?: (product: ProductWithIntelligence) => void;
  onDelete?: (productId: string) => void;
  onManageComponents?: (product: ProductWithIntelligence) => void;
}

export function ProductList({ 
  products, 
  loading, 
  error, 
  onEdit, 
  onDelete, 
  onManageComponents 
}: ProductListProps) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <Typography className="mt-4" color="text.muted">Cargando productos...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-error/50 rounded-lg bg-error/10">
        <Typography color="error" weight="medium">Error al cargar productos</Typography>
        <Typography color="error" size="sm">{error}</Typography>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <Typography size="lg" color="text.muted" className="mb-4">
          No hay productos registrados
        </Typography>
        <Typography color="text.muted">
          Comienza creando tu primer producto
        </Typography>
      </div>
    );
  }

  const getAvailabilityColor = (availability: number) => {
    if (availability === 0) return "error";
    if (availability <= 5) return "warning";
    return "success";
  };

  const getAvailabilityLabel = (availability: number) => {
    if (availability === 0) return "Sin Stock";
    if (availability <= 5) return "Stock Bajo";
    return "Disponible";
  };

  // Use virtualization for large product lists (>30 products)
  if (products && products.length > 30) {
    return (
      <Stack direction="column" gap="md">
        <div>
          <Typography size="lg" weight="semibold" className="mb-2">
            Productos ({products?.length || 0})
          </Typography>
          <Typography size="sm" color="text.muted">
            Lista de productos con información de costos y disponibilidad
          </Typography>
        </div>

        <div className="h-[calc(100vh-200px)]">
          <VirtualizedList
            items={products}
            itemHeight={320}
            containerHeight={window.innerHeight - 200}
            renderItem={(product) => (
              <div className="px-2 pb-4">
                <CardWrapper className="p-4 shadow-sm">
                  <Stack direction="column" gap="sm">
                    {/* Header */}
                    <Stack direction="row" justify="space-between" align="start">
                      <Stack direction="column" gap="xs" className="flex-1">
                        <Typography size="md" weight="semibold">
                          {product.name}
                        </Typography>
                        {product.unit && (
                          <Typography size="xs" color="text.muted">
                            Unidad: {product.unit}
                          </Typography>
                        )}
                      </Stack>
                      <Badge colorPalette="blue" size="sm">
                        {product.type}
                      </Badge>
                    </Stack>

                    {/* Description */}
                    {product.description && (
                      <Typography size="sm" color="text.muted" className="line-clamp-2">
                        {product.description}
                      </Typography>
                    )}

                    {/* Intelligence Metrics */}
                    <Stack direction="column" gap="xs">
                      {/* Cost */}
                      <Stack direction="row" justify="space-between">
                        <Typography size="sm" color="text.muted">Costo:</Typography>
                        <Typography size="sm" weight="medium">
                          ${product.cost.toFixed(2)}
                        </Typography>
                      </Stack>

                      {/* Availability */}
                      <Stack direction="row" justify="space-between">
                        <Typography size="sm" color="text.muted">Disponibilidad:</Typography>
                        <Stack direction="row" gap="xs">
                          <Typography size="sm" weight="medium">
                            {product.availability}
                          </Typography>
                          <Badge 
                            colorPalette={getAvailabilityColor(product.availability)} 
                            size="sm"
                          >
                            {getAvailabilityLabel(product.availability)}
                          </Badge>
                        </Stack>
                      </Stack>

                      {/* Components */}
                      <Stack direction="row" justify="space-between">
                        <Typography size="sm" color="text.muted">Componentes:</Typography>
                        <Typography size="sm" weight="medium">
                          {product.components_count}
                        </Typography>
                      </Stack>

                      {/* Production Status */}
                      <Stack direction="row" justify="space-between">
                        <Typography size="sm" color="text.muted">Estado:</Typography>
                        <Badge 
                          colorPalette={product.production_ready ? "green" : "gray"}
                          size="sm"
                        >
                          {product.production_ready ? "Listo para producir" : "Requiere configuración"}
                        </Badge>
                      </Stack>
                    </Stack>

                    {/* Actions */}
                    <Stack direction="column" gap="xs" className="pt-2">
                      {onManageComponents && (
                        <button 
                          onClick={() => onManageComponents(product)}
                          className="px-3 py-1.5 text-sm border border-input rounded-md bg-background text-foreground hover:bg-accent transition-colors"
                        >
                          Gestionar Componentes ({product.components_count})
                        </button>
                      )}
                      
                      <Stack direction="row" gap="xs">
                        {onEdit && (
                          <button 
                            onClick={() => onEdit(product)}
                            className="flex-1 px-3 py-1.5 text-sm border border-input rounded-md bg-background text-foreground hover:bg-accent transition-colors"
                          >
                            Editar
                          </button>
                        )}
                        {onDelete && (
                          <button 
                            onClick={() => onDelete(product.id)}
                            className="flex-1 px-3 py-1.5 text-sm border border-destructive text-destructive rounded-md bg-background hover:bg-destructive/10 transition-colors"
                          >
                            Eliminar
                          </button>
                        )}
                      </Stack>
                    </Stack>
                  </Stack>
                </CardWrapper>
              </div>
            )}
            overscan={3}
            hasMore={false}
            loading={false}
          />
        </div>
      </Stack>
    );
  }

  return (
    <Stack direction="column" gap="md">
      <div>
        <Typography size="lg" weight="semibold" className="mb-2">
          Productos ({products?.length || 0})
        </Typography>
        <Typography size="sm" color="text.muted">
          Lista de productos con información de costos y disponibilidad
        </Typography>
      </div>

      <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(products || []).map((product) => (
          <CardWrapper key={product.id} className="p-4 shadow-sm">
            <Stack direction="column" gap="sm">
              {/* Header */}
              <Stack direction="row" justify="space-between" align="start">
                <Stack direction="column" gap="xs" className="flex-1">
                  <Typography size="md" weight="semibold">
                    {product.name}
                  </Typography>
                  {product.unit && (
                    <Typography size="xs" color="text.muted">
                      Unidad: {product.unit}
                    </Typography>
                  )}
                </Stack>
                <Badge colorPalette="blue" size="sm">
                  {product.type}
                </Badge>
              </Stack>

              {/* Description */}
              {product.description && (
                <Typography size="sm" color="text.muted" className="line-clamp-2">
                  {product.description}
                </Typography>
              )}

              {/* Intelligence Metrics */}
              <Stack direction="column" gap="xs">
                {/* Cost */}
                <Stack direction="row" justify="space-between">
                  <Typography size="sm" color="text.muted">Costo:</Typography>
                  <Typography size="sm" weight="medium">
                    ${product.cost.toFixed(2)}
                  </Typography>
                </Stack>

                {/* Availability */}
                <Stack direction="row" justify="space-between">
                  <Typography size="sm" color="text.muted">Disponibilidad:</Typography>
                  <Stack direction="row" gap="xs">
                    <Typography size="sm" weight="medium">
                      {product.availability}
                    </Typography>
                    <Badge 
                      colorPalette={getAvailabilityColor(product.availability)} 
                      size="sm"
                    >
                      {getAvailabilityLabel(product.availability)}
                    </Badge>
                  </Stack>
                </Stack>

                {/* Components */}
                <Stack direction="row" justify="space-between">
                  <Typography size="sm" color="text.muted">Componentes:</Typography>
                  <Typography size="sm" weight="medium">
                    {product.components_count}
                  </Typography>
                </Stack>

                {/* Production Status */}
                <Stack direction="row" justify="space-between">
                  <Typography size="sm" color="text.muted">Estado:</Typography>
                  <Badge 
                    colorPalette={product.production_ready ? "green" : "gray"}
                    size="sm"
                  >
                    {product.production_ready ? "Listo para producir" : "Requiere configuración"}
                  </Badge>
                </Stack>
              </Stack>

              {/* Actions */}
              <Stack direction="column" gap="xs" className="pt-2">
                {onManageComponents && (
                  <button 
                    onClick={() => onManageComponents(product)}
                    className="px-3 py-1.5 text-sm border border-input rounded-md bg-background text-foreground hover:bg-accent transition-colors"
                  >
                    Gestionar Componentes ({product.components_count})
                  </button>
                )}
                
                <Stack direction="row" gap="xs">
                  {onEdit && (
                    <button 
                      onClick={() => onEdit(product)}
                      className="flex-1 px-3 py-1.5 text-sm border border-input rounded-md bg-background text-foreground hover:bg-accent transition-colors"
                    >
                      Editar
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      onClick={() => onDelete(product.id)}
                      className="flex-1 px-3 py-1.5 text-sm border border-destructive text-destructive rounded-md bg-background hover:bg-destructive/10 transition-colors"
                    >
                      Eliminar
                    </button>
                  )}
                </Stack>
              </Stack>
            </Stack>
          </CardWrapper>
        ))}
      </Grid>
    </Stack>
  );
}
