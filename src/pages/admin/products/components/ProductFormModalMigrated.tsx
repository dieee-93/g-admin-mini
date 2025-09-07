/**
 * MIGRATED: Product Form Modal
 * Demonstrates how to replace scattered calculations with centralized financial utilities
 * Uses: FinancialCalculations + QuickCalculations for precise math
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntitySchemas, type SchemaType } from '@/lib/validation/zod/CommonSchemas';
import { 
  FinancialCalculations, 
  QuickCalculations, 
  type PricingScenario 
} from '@/business-logic/shared/FinancialCalculations';

// Type safety with Zod schema
type ProductFormData = SchemaType<typeof EntitySchemas.product> & {
  estimated_cost?: number;
  recipe?: any;
};

interface ProductFormModalMigratedProps {
  product?: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
}

export const ProductFormModalMigrated: React.FC<ProductFormModalMigratedProps> = ({
  product,
  isOpen,
  onClose,
  onSubmit
}) => {
  // React Hook Form with Zod validation (unified validation system)
  const form = useForm<ProductFormData>({
    resolver: zodResolver(EntitySchemas.product),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: '',
      is_active: true,
      estimated_cost: 0,
      ...product
    }
  });

  // Watch form values for real-time calculations
  const watchedValues = form.watch();
  const estimatedCost = watchedValues.estimated_cost || 0;
  const currentPrice = watchedValues.price || 0;

  // ===== BEFORE (Duplicated calculations) =====
  // const markup = (data.estimated_cost * 2.5); // Hardcoded markup
  // const margin = 60; // Hardcoded margin
  // const profitabilityScore = 0; // Not calculated
  
  // ===== AFTER (Centralized calculations with precision) =====
  
  // Generate pricing scenarios automatically
  const pricingScenarios: PricingScenario[] = React.useMemo(() => {
    if (!estimatedCost || estimatedCost <= 0) return [];
    
    return FinancialCalculations.generatePricingScenarios(estimatedCost, [
      50,   // 50% markup
      100,  // 100% markup (2x)
      150,  // 150% markup (2.5x) - matches old hardcoded value
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

  // Profitability analysis
  const profitabilityAnalysis = React.useMemo(() => {
    if (!currentPrice || !estimatedCost) return null;
    
    return FinancialCalculations.analyzeProfitability(
      currentPrice,    // revenue (per unit)
      estimatedCost,   // cost (per unit)
      0                // no operating expenses for per-unit analysis
    );
  }, [currentPrice, estimatedCost]);

  // Form submission with calculated values
  const handleSubmit = async (data: ProductFormData) => {
    // Use centralized calculations instead of hardcoded values
    const enhancedData = {
      ...data,
      
      // Replace hardcoded calculations with precise ones
      price: data.price || QuickCalculations.sellingPriceFromMarkup(estimatedCost, 150), // 2.5x markup
      cost: estimatedCost,
      
      // Calculated financial metrics
      profit_margin: currentMetrics.profitMargin,
      markup_percentage: currentMetrics.markup,
      profit_amount: currentMetrics.profitAmount,
      
      // Enhanced business metrics
      profitability_score: profitabilityAnalysis?.return_on_cost || 0,
      pricing_scenarios: pricingScenarios, // Store scenarios for later analysis
      
      // Validation flags
      is_price_valid: currentMetrics.isValidPrice,
      recommended_price: pricingScenarios[2]?.selling_price || data.price // 150% markup scenario
    };

    await onSubmit(enhancedData);
  };

  // Quick price setter using scenarios
  const setRecommendedPrice = (scenario: PricingScenario) => {
    form.setValue('price', scenario.selling_price);
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{product ? 'Editar Producto' : 'Crear Producto'}</h2>
        
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          {/* Basic fields with unified validation */}
          <div>
            <label>Nombre</label>
            <input 
              {...form.register('name')} 
              className={form.formState.errors.name ? 'error' : ''}
            />
            {form.formState.errors.name && (
              <span className="error-message">
                {form.formState.errors.name.message}
              </span>
            )}
          </div>

          <div>
            <label>Costo Estimado</label>
            <input 
              type="number" 
              step="0.01"
              {...form.register('estimated_cost', { valueAsNumber: true })} 
            />
          </div>

          <div>
            <label>Precio de Venta</label>
            <input 
              type="number" 
              step="0.01"
              {...form.register('price', { valueAsNumber: true })} 
            />
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

              {/* Pricing scenarios from centralized system */}
              <div className="pricing-scenarios">
                <h4>Escenarios de Precios Sugeridos</h4>
                <div className="scenarios-grid">
                  {pricingScenarios.map((scenario, index) => (
                    <div key={index} className="scenario-card">
                      <p>Markup: {scenario.markup_percentage}%</p>
                      <p>Precio: {QuickCalculations.formatCurrency(scenario.selling_price)}</p>
                      <p>Margen: {QuickCalculations.formatPercentage(scenario.profit_margin)}</p>
                      <p>Competitividad: {scenario.competitiveness_score}/100</p>
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

              {/* Advanced profitability analysis */}
              {profitabilityAnalysis && (
                <div className="profitability-analysis">
                  <h4>Análisis de Rentabilidad</h4>
                  <p>ROI: {QuickCalculations.formatPercentage(profitabilityAnalysis.return_on_cost)}</p>
                  <p>Margen Bruto: {QuickCalculations.formatPercentage(profitabilityAnalysis.gross_margin_percentage)}</p>
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
              disabled={!form.formState.isValid || !currentMetrics.isValidPrice}
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
 * COMPARISON: BEFORE vs AFTER
 * 
 * BEFORE (Hardcoded, imprecise):
 * - price: data.estimated_cost * 2.5  // Basic multiplication
 * - margin: 60                        // Hardcoded value
 * - profitability_score: 0           // Not calculated
 * 
 * AFTER (Centralized, precise):
 * - Multiple pricing scenarios automatically generated
 * - Real-time profit margin calculation with decimal precision
 * - Advanced profitability analysis with ROI, competitiveness scores
 * - Automatic validation of price vs cost
 * - Consistent currency and percentage formatting
 * - Business logic separated from UI concerns
 */

export default ProductFormModalMigrated;