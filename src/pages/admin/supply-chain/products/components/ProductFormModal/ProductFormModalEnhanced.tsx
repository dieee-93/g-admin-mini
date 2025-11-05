/**
 * ENHANCED: Product Form Modal with Business Validation
 * Combines:
 * - useProductValidation (name uniqueness, price validation)
 * - Financial Calculations (pricing scenarios, profitability)
 * - React Hook Form + Zod
 */

import React from 'react';
import { EntitySchemas, type SchemaType } from '@/lib/validation/zod/CommonSchemas';
import {
  FinancialCalculations,
  QuickCalculations,
  type PricingScenario
} from '@/business-logic/shared/FinancialCalculations';
import { useProductValidation } from '@/hooks/useProductValidation';
import { useProductsStore } from '@/store/productsStore';
import { notify } from '@/lib/notifications';
import type { ProductComponent } from '../../types';

// Type safety with Zod schema
type ProductFormData = SchemaType<typeof EntitySchemas.product> & {
  estimated_cost?: number;
  recipe?: ProductComponent[];
};

interface ProductFormModalEnhancedProps {
  product?: Partial<ProductFormData>;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
}

export const ProductFormModalEnhanced: React.FC<ProductFormModalEnhancedProps> = ({
  product,
  isOpen,
  onClose,
  onSubmit
}) => {
  // Get existing products for duplicate validation
  const { products } = useProductsStore();

  // Use specialized validation hook with business logic
  const {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateForm
  } = useProductValidation(
    {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      category: product?.category || '',
      is_active: product?.is_active ?? true
    },
    products, // Pass existing products for duplicate validation
    product?.id // Current product ID for edit mode
  );

  const { register, handleSubmit, watch, setValue, formState } = form;
  const { isSubmitting } = formState;

  // Watch form values for real-time calculations
  const watchedValues = watch();
  const estimatedCost = (product?.estimated_cost || 0);
  const currentPrice = watchedValues.price || 0;

  // Generate pricing scenarios automatically
  const pricingScenarios: PricingScenario[] = React.useMemo(() => {
    if (!estimatedCost || estimatedCost <= 0) return [];

    return FinancialCalculations.generatePricingScenarios(estimatedCost, [
      50,   // 50% markup
      100,  // 100% markup (2x)
      150,  // 150% markup (2.5x)
      200,  // 200% markup (3x)
      250   // 250% markup (3.5x)
    ]);
  }, [estimatedCost]);

  // Current financial metrics (real-time)
  const currentMetrics = React.useMemo(() => {
    if (!estimatedCost || !currentPrice) {
      return {
        profitMargin: 0,
        markup: 0,
        profitAmount: 0,
        isValidPrice: false
      };
    }

    return {
      profitMargin: QuickCalculations.profitMargin(currentPrice, estimatedCost),
      markup: QuickCalculations.markup(currentPrice, estimatedCost),
      profitAmount: currentPrice - estimatedCost,
      isValidPrice: currentPrice > estimatedCost
    };
  }, [currentPrice, estimatedCost]);

  // Form submission with validation
  const onSubmitHandler = handleSubmit(async (data) => {
    // Validate with business logic
    const isValid = await validateForm();

    if (!isValid) {
      notify.error({
        title: 'Validación fallida',
        description: 'Por favor corrige los errores antes de continuar'
      });
      return;
    }

    // Validate price is reasonable
    if (!currentMetrics.isValidPrice) {
      notify.error({
        title: 'Precio inválido',
        description: 'El precio debe ser mayor al costo estimado'
      });
      return;
    }

    // Enhanced data with financial metrics
    const enhancedData = {
      ...data,
      price: data.price || QuickCalculations.sellingPriceFromMarkup(estimatedCost, 150),
      cost: estimatedCost,
      profit_margin: currentMetrics.profitMargin,
      markup_percentage: currentMetrics.markup,
      profit_amount: currentMetrics.profitAmount,
      is_price_valid: currentMetrics.isValidPrice,
      recommended_price: pricingScenarios[2]?.selling_price || data.price
    };

    await onSubmit(enhancedData);
  });

  // Quick price setter using scenarios
  const setRecommendedPrice = (scenario: PricingScenario) => {
    setValue('price', scenario.selling_price);
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{product ? 'Editar Producto' : 'Crear Producto'}</h2>

        {/* Validation summary */}
        {validationState.hasErrors && (
          <div className="alert alert-error">
            ❌ Por favor corrige {validationState.errorCount} error(es) antes de continuar
          </div>
        )}

        {validationState.hasWarnings && !validationState.hasErrors && (
          <div className="alert alert-warning">
            ⚠️ Hay {validationState.warningCount} advertencia(s) que deberías revisar
          </div>
        )}

        <form onSubmit={onSubmitHandler}>
          {/* Name field with duplicate validation */}
          <div>
            <label>Nombre *</label>
            <input
              {...register('name')}
              className={fieldErrors.name ? 'error' : fieldWarnings.name ? 'warning' : ''}
            />
            {fieldErrors.name && (
              <span className="error-message">
                ❌ {fieldErrors.name}
              </span>
            )}
            {!fieldErrors.name && fieldWarnings.name && (
              <span className="warning-message">
                ⚠️ {fieldWarnings.name}
              </span>
            )}
          </div>

          {/* Description field */}
          <div>
            <label>Descripción *</label>
            <textarea
              {...register('description')}
              rows={3}
              className={fieldErrors.description ? 'error' : fieldWarnings.description ? 'warning' : ''}
            />
            {fieldErrors.description && (
              <span className="error-message">
                ❌ {fieldErrors.description}
              </span>
            )}
            {!fieldErrors.description && fieldWarnings.description && (
              <span className="warning-message">
                ⚠️ {fieldWarnings.description}
              </span>
            )}
          </div>

          {/* Category field */}
          <div>
            <label>Categoría *</label>
            <input
              {...register('category')}
              className={fieldErrors.category ? 'error' : ''}
            />
            {fieldErrors.category && (
              <span className="error-message">
                ❌ {fieldErrors.category}
              </span>
            )}
          </div>

          {/* Price field with validation */}
          <div>
            <label>Precio de Venta *</label>
            <input
              type="number"
              step="0.01"
              {...register('price', { valueAsNumber: true })}
              className={fieldErrors.price ? 'error' : fieldWarnings.price ? 'warning' : ''}
            />
            {fieldErrors.price && (
              <span className="error-message">
                ❌ {fieldErrors.price}
              </span>
            )}
            {!fieldErrors.price && fieldWarnings.price && (
              <span className="warning-message">
                ⚠️ {fieldWarnings.price}
              </span>
            )}
          </div>

          {/* Active status */}
          <div>
            <label>
              <input
                type="checkbox"
                {...register('is_active')}
              />
              Producto activo
            </label>
            {fieldWarnings.is_active && (
              <span className="warning-message">
                ⚠️ {fieldWarnings.is_active}
              </span>
            )}
          </div>

          {/* Real-time financial analysis */}
          {estimatedCost > 0 && (
            <div className="financial-analysis">
              <h3>Análisis Financiero</h3>

              <div className="current-metrics">
                <p>Margen de Ganancia: {QuickCalculations.formatPercentage(currentMetrics.profitMargin)}</p>
                <p>Markup: {QuickCalculations.formatPercentage(currentMetrics.markup)}</p>
                <p>Ganancia por Unidad: {QuickCalculations.formatCurrency(currentMetrics.profitAmount)}</p>
                <p className={currentMetrics.isValidPrice ? 'valid' : 'invalid'}>
                  {currentMetrics.isValidPrice ? '✓ Precio válido' : '✗ Precio debe ser mayor al costo'}
                </p>
              </div>

              {/* Pricing scenarios */}
              {pricingScenarios.length > 0 && (
                <div className="pricing-scenarios">
                  <h4>Escenarios de Precios Sugeridos</h4>
                  <div className="scenarios-grid">
                    {pricingScenarios.map((scenario, index) => (
                      <div key={index} className="scenario-card">
                        <p>Markup: {scenario.markup_percentage}%</p>
                        <p>Precio: {QuickCalculations.formatCurrency(scenario.selling_price)}</p>
                        <p>Margen: {QuickCalculations.formatPercentage(scenario.profit_margin)}</p>
                        <button
                          type="button"
                          onClick={() => setRecommendedPrice(scenario)}
                          className="use-price-btn"
                        >
                          Usar este precio
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form actions */}
          <div className="form-actions">
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || validationState.hasErrors || !currentMetrics.isValidPrice}
            >
              {product ? 'Actualizar' : 'Crear'} Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * ENHANCEMENTS ADDED:
 *
 * ✅ Business Validation:
 * - Name uniqueness (checks against existing products)
 * - Price must be positive and reasonable
 * - Category required
 * - Field warnings for extreme prices, inactive products
 *
 * ✅ Financial Analysis (PRESERVED):
 * - Pricing scenarios with different markup percentages
 * - Real-time profit margin, markup calculations
 * - Profitability analysis
 *
 * ✅ UX Improvements:
 * - Validation summary alerts
 * - Field-level error and warning messages
 * - Visual indicators (error borders, warning borders)
 * - Disabled submit when errors exist
 *
 * ✅ Maintained:
 * - All financial calculations from original
 * - Same pricing scenario generation
 * - Same UI structure
 */

export default ProductFormModalEnhanced;
