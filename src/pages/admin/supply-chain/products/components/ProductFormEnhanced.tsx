/**
 * Product Form Enhanced - Using ModuleFactory patterns
 * Migrates from custom form to DynamicForm with AnalyticsEngine integration
 */
import React from 'react';
import { z } from 'zod';
import { DynamicForm, type FormSectionConfig } from '@/shared/components/forms';
import { useFormManager } from '@/shared/hooks/business';
import { CRUDHandlers } from '@/shared/utils/errorHandling';
import {
  FinancialCalculations,
  QuickCalculations,
  type PricingScenario
} from '@/business-logic/shared/FinancialCalculations';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';

// Enhanced Product schema with financial calculations
const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
  category: z.string().min(1, "La categoría es obligatoria"),
  price: z.number().min(0.01, "El precio debe ser mayor a 0"),
  estimated_cost: z.number().min(0, "El costo no puede ser negativo").default(0),
  is_active: z.boolean().default(true),
  recipe_id: z.string().optional(),
  preparation_time: z.number().min(0).default(0),
  difficulty_level: z.enum(['easy', 'medium', 'hard']).default('medium'),
  allergens: z.array(z.string()).default([]),
  nutritional_info: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  seasonal: z.boolean().default(false)
});

type ProductFormData = z.infer<typeof ProductSchema>;

interface ProductFormEnhancedProps {
  product?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductFormEnhanced({ product, onSuccess, onCancel }: ProductFormEnhancedProps) {
  const isEditMode = !!product;

  // Form sections configuration using DynamicForm pattern
  const formSections: FormSectionConfig[] = [
    {
      title: "Información Básica",
      description: "Datos principales del producto",
      fields: [
        {
          name: 'name',
          label: 'Nombre del Producto',
          type: 'text',
          placeholder: 'Ej: Pizza Margherita, Hamburguesa Clásica...',
          required: true,
          gridColumn: '1 / -1'
        },
        {
          name: 'category',
          label: 'Categoría',
          type: 'text', // Would be select in real implementation
          placeholder: 'Pizzas, Hamburguesas, Bebidas, Postres...',
          required: true
        },
        {
          name: 'difficulty_level',
          label: 'Nivel de Dificultad',
          type: 'text', // Would be select: easy, medium, hard
          placeholder: 'easy, medium, hard'
        }
      ]
    },
    {
      title: "Descripción y Características",
      description: "Información detallada del producto",
      fields: [
        {
          name: 'description',
          label: 'Descripción',
          type: 'textarea',
          placeholder: 'Descripción detallada del producto, ingredientes principales...',
          gridColumn: '1 / -1'
        },
        {
          name: 'preparation_time',
          label: 'Tiempo de Preparación (minutos)',
          type: 'number',
          placeholder: '15'
        },
        {
          name: 'tags',
          label: 'Tags (separados por coma)',
          type: 'text',
          placeholder: 'vegetariano, picante, sin gluten...',
          description: 'Etiquetas para facilitar la búsqueda'
        }
      ]
    },
    {
      title: "Precios y Costos",
      description: "Configuración financiera del producto",
      fields: [
        {
          name: 'estimated_cost',
          label: 'Costo Estimado ($)',
          type: 'number',
          placeholder: '8.50',
          description: 'Costo total de ingredientes y preparación'
        },
        {
          name: 'price',
          label: 'Precio de Venta ($)',
          type: 'number',
          placeholder: '25.00',
          required: true,
          description: 'Precio final al cliente'
        }
      ]
    },
    {
      title: "Información Nutricional y Alergenos",
      description: "Datos nutricionales y restricciones alimentarias",
      fields: [
        {
          name: 'nutritional_info',
          label: 'Información Nutricional',
          type: 'textarea',
          placeholder: 'Calorías: 450, Proteínas: 25g, Carbohidratos: 35g...',
          gridColumn: '1 / -1'
        },
        {
          name: 'allergens',
          label: 'Alérgenos (separados por coma)',
          type: 'text',
          placeholder: 'gluten, lactosa, frutos secos...',
          description: 'Importante para clientes con alergias'
        }
      ]
    },
    {
      title: "Configuración Adicional",
      description: "Opciones avanzadas del producto",
      fields: [
        {
          name: 'image_url',
          label: 'URL de Imagen',
          type: 'text',
          placeholder: 'https://example.com/image.jpg',
          gridColumn: '1 / -1'
        },
        {
          name: 'recipe_id',
          label: 'ID de Receta',
          type: 'text',
          placeholder: 'recipe_123',
          description: 'Vincular con una receta específica'
        }
      ]
    }
  ];

  // Enhanced form manager with financial calculations
  const { register, errors, watch, submit, isSubmitting } = useFormManager({
    schema: ProductSchema,
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      category: product?.category || '',
      price: product?.price || 0,
      estimated_cost: product?.estimated_cost || 0,
      is_active: product?.is_active ?? true,
      recipe_id: product?.recipe_id || '',
      preparation_time: product?.preparation_time || 0,
      difficulty_level: product?.difficulty_level || 'medium',
      allergens: product?.allergens || [],
      nutritional_info: product?.nutritional_info || '',
      image_url: product?.image_url || '',
      tags: product?.tags || [],
      seasonal: product?.seasonal || false
    },
    onSubmit: async (data: ProductFormData) => {
      // Enhanced data with financial calculations
      const enhancedData = await enhanceProductData(data);

      if (isEditMode) {
        await CRUDHandlers.update(
          () => updateProduct(product.id, enhancedData),
          'Producto',
          () => {
            // Emit product updated event
            ModuleEventUtils.analytics.generated('products', {
              action: 'product_updated',
              productId: product.id,
              changes: enhancedData
            });
            onSuccess?.();
          }
        );
      } else {
        await CRUDHandlers.create(
          () => createProduct(enhancedData),
          'Producto',
          () => {
            // Emit product created event
            ModuleEventUtils.analytics.generated('products', {
              action: 'product_created',
              productData: enhancedData
            });
            onSuccess?.();
          }
        );
      }
    },
    successMessage: {
      title: isEditMode ? 'PRODUCT_UPDATED' : 'PRODUCT_CREATED',
      description: `Producto ${isEditMode ? 'actualizado' : 'creado'} correctamente`
    },
    resetOnSuccess: !isEditMode
  });

  // Watch form values for real-time financial calculations
  const watchedValues = watch();
  const estimatedCost = watchedValues.estimated_cost || 0;
  const currentPrice = watchedValues.price || 0;

  // Real-time financial metrics
  const financialMetrics = React.useMemo(() => {
    if (!estimatedCost || !currentPrice) {
      return {
        profitMargin: 0,
        markup: 0,
        profitAmount: 0,
        isValidPrice: false,
        pricingScenarios: []
      };
    }

    const profitMargin = QuickCalculations.profitMargin(currentPrice, estimatedCost);
    const markup = QuickCalculations.markup(currentPrice, estimatedCost);
    const profitAmount = currentPrice - estimatedCost;
    const isValidPrice = currentPrice > estimatedCost;

    // Generate pricing scenarios
    const pricingScenarios = estimatedCost > 0 ? FinancialCalculations.generatePricingScenarios(
      estimatedCost,
      [50, 100, 150, 200, 250] // Various markup percentages
    ) : [];

    return {
      profitMargin,
      markup,
      profitAmount,
      isValidPrice,
      pricingScenarios
    };
  }, [estimatedCost, currentPrice]);

  // Enhance product data with calculations
  const enhanceProductData = async (data: ProductFormData) => {
    return {
      ...data,
      // Financial calculations
      profit_margin: financialMetrics.profitMargin,
      markup_percentage: financialMetrics.markup,
      profit_amount: financialMetrics.profitAmount,
      is_price_valid: financialMetrics.isValidPrice,

      // Business intelligence
      profitability_score: financialMetrics.pricingScenarios.find(s =>
        Math.abs(s.selling_price - currentPrice) < 0.01
      )?.competitiveness_score || 0,

      // Enhanced metadata
      created_at: product?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),

      // Tags processing
      tags: typeof data.tags === 'string'
        ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : data.tags || [],

      // Allergens processing
      allergens: typeof data.allergens === 'string'
        ? data.allergens.split(',').map(allergen => allergen.trim()).filter(Boolean)
        : data.allergens || []
    };
  };

  // Mock CRUD operations (would be replaced with real API calls)
  const createProduct = async (data: any) => {
    console.log('Creating product:', data);
    return { id: Date.now().toString(), ...data };
  };

  const updateProduct = async (id: string, data: any) => {
    console.log('Updating product:', id, data);
    return { id, ...data };
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <DynamicForm<ProductFormData>
        title={isEditMode ? '✏️ Editar Producto' : '🍽️ Nuevo Producto'}
        description="Gestión completa de productos con análisis financiero automático"
        schema={ProductSchema}
        sections={formSections}
        defaultValues={watchedValues}
        onSubmit={submit as any}
        onCancel={onCancel}
        submitText={isEditMode ? '✅ Actualizar Producto' : '✅ Crear Producto'}
        successMessage={{
          title: isEditMode ? 'PRODUCT_UPDATED' : 'PRODUCT_CREATED',
          description: `Producto ${isEditMode ? 'actualizado' : 'creado'} correctamente`
        }}
        resetOnSuccess={!isEditMode}
      />

      {/* Real-time Financial Analysis Panel */}
      {estimatedCost > 0 && (
        <div style={{
          marginTop: '24px',
          padding: '20px',
          backgroundColor: 'var(--colors-blue-50)',
          borderRadius: '8px',
          border: '1px solid var(--colors-blue-200)'
        }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--colors-blue-800)' }}>
            📊 Análisis Financiero en Tiempo Real
          </h3>

          {/* Current Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'green' }}>
                {QuickCalculations.formatPercentage(financialMetrics.profitMargin)}
              </div>
              <div style={{ fontSize: '12px', color: 'gray' }}>Margen</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'blue' }}>
                {QuickCalculations.formatPercentage(financialMetrics.markup)}
              </div>
              <div style={{ fontSize: '12px', color: 'gray' }}>Markup</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'purple' }}>
                {QuickCalculations.formatCurrency(financialMetrics.profitAmount)}
              </div>
              <div style={{ fontSize: '12px', color: 'gray' }}>Ganancia</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: financialMetrics.isValidPrice ? 'green' : 'red' }}>
                {financialMetrics.isValidPrice ? '✓' : '✗'}
              </div>
              <div style={{ fontSize: '12px', color: 'gray' }}>Válido</div>
            </div>
          </div>

          {/* Pricing Scenarios */}
          {financialMetrics.pricingScenarios.length > 0 && (
            <div>
              <h4 style={{ marginBottom: '12px', color: 'var(--colors-blue-700)' }}>
                💡 Escenarios de Precio Sugeridos
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
                {financialMetrics.pricingScenarios.map((scenario, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '12px',
                      backgroundColor: 'white',
                      borderRadius: '6px',
                      border: '1px solid var(--colors-gray-200)',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {QuickCalculations.formatCurrency(scenario.selling_price)}
                    </div>
                    <div style={{ fontSize: '11px', color: 'gray', marginBottom: '8px' }}>
                      {scenario.markup_percentage}% markup
                    </div>
                    <div style={{ fontSize: '10px', color: 'gray' }}>
                      {QuickCalculations.formatPercentage(scenario.profit_margin)} margen
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}