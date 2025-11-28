// ============================================================================
// PRODUCTS ALERTS ADAPTER
// ============================================================================
// Integration bridge between Products module and unified alerts system
// Following SESSION_PLAN_PRODUCTS_COMPLETE.md - Session 2
// Based on Materials smartAlertsAdapter pattern

import { logger } from '@/lib/logging';
import type { Product, ProductWithConfig } from '@/pages/admin/supply-chain/products/types/product';
import type { CreateAlertInput } from '@/shared/alerts/types';
import { mapSeverity, enrichDescription } from '@/shared/alerts/utils';

// ============================================================================
// PRODUCTS ALERTS ADAPTER
// ============================================================================

export class ProductsAlertsAdapter {

  /**
   * Low margin alert
   * Triggered when product profit margin is below threshold (15%)
   */
  static lowMarginAlert(product: Product | ProductWithConfig): CreateAlertInput {
    // Extract pricing data
    const pricing = 'pricing' in product ? product.pricing : null;
    const profitMargin = pricing?.profit_margin ?? 0;

    return {
      type: 'business',
      context: 'products',
      severity: mapSeverity('high'),
      title: `Low Margin: ${product.name}`,
      description: enrichDescription({
        description: `Product profit margin is only ${profitMargin.toFixed(1)}%. Consider adjusting pricing or reducing costs.`,
        actionPriority: 'immediate',
        recommendedAction: 'Review pricing strategy or negotiate better supplier rates'
      }),
      metadata: {
        productId: product.id,
        productName: product.name,
        currentMargin: profitMargin,
        threshold: 15
      },
      persistent: true,
      actions: [
        {
          label: 'View Product',
          variant: 'primary',
          action: 'view-product',
          data: { productId: product.id }
        },
        {
          label: 'Adjust Pricing',
          variant: 'secondary',
          action: 'adjust-pricing',
          data: { productId: product.id }
        }
      ]
    };
  }

  /**
   * Recipe unavailable alert
   * Triggered when insufficient materials to produce recipe
   */
  static recipeUnavailableAlert(product: Product | ProductWithConfig): CreateAlertInput {
    const config = 'config' in product ? product.config : null;
    const availability = 'availability' in product ? product.availability : null;

    return {
      type: 'stock',
      context: 'products',
      severity: mapSeverity('critical'),
      title: `Cannot Produce: ${product.name}`,
      description: 'Insufficient materials to produce this recipe',
      metadata: {
        productId: product.id,
        hasComponents: config?.has_components ?? false,
        availability: availability?.can_produce_quantity ?? 0
      },
      persistent: false,
      actions: [
        {
          label: 'Check Materials',
          variant: 'primary',
          action: 'check-materials',
          data: { productId: product.id }
        },
        {
          label: 'Create PO',
          variant: 'secondary',
          action: 'create-purchase-order',
          data: { productId: product.id }
        }
      ]
    };
  }

  /**
   * Product creation failed alert
   * Triggered when product creation fails
   */
  static productCreationFailed(error: Error, productData: any): CreateAlertInput {
    return {
      type: 'operational',
      context: 'products',
      severity: mapSeverity('high'),
      title: 'Product Creation Failed',
      description: `Failed to create product "${productData.name}": ${error.message}`,
      metadata: {
        errorCode: error.name,
        productName: productData.name,
        productType: productData.type
      },
      persistent: true,
      actions: [
        {
          label: 'Retry',
          variant: 'primary',
          action: 'retry-product-creation'
        },
        {
          label: 'View Products',
          variant: 'secondary',
          action: 'view-products'
        }
      ]
    };
  }

  /**
   * Staff unavailable alert
   * Triggered when required staff is not available
   */
  static staffUnavailableAlert(product: Product | ProductWithConfig): CreateAlertInput {
    const config = 'config' in product ? product.config : null;

    return {
      type: 'operational',
      context: 'products',
      severity: mapSeverity('high'),
      title: `Staff Unavailable: ${product.name}`,
      description: 'No staff available for this service',
      metadata: {
        productId: product.id,
        requiredStaff: config?.staff_allocation ?? []
      },
      persistent: false
    };
  }

  /**
   * Booking slots full alert
   * Triggered when all booking slots are full
   */
  static bookingSlotsFullAlert(product: Product | ProductWithConfig, date: Date): CreateAlertInput {
    const config = 'config' in product ? product.config : null;

    return {
      type: 'operational',
      context: 'products',
      severity: mapSeverity('medium'),
      title: `Fully Booked: ${product.name}`,
      description: `All slots for ${date.toLocaleDateString()} are booked`,
      metadata: {
        productId: product.id,
        date: date.toISOString(),
        capacity: config?.concurrent_capacity ?? 1
      },
      persistent: false
    };
  }

  /**
   * Invalid configuration alert
   * Triggered when product configuration has errors
   */
  static invalidConfigurationAlert(product: Product | ProductWithConfig, errors: string[]): CreateAlertInput {
    return {
      type: 'operational',
      context: 'products',
      severity: mapSeverity('critical'),
      title: `Invalid Configuration: ${product.name}`,
      description: `Product configuration errors:\n${errors.join('\n')}`,
      metadata: {
        productId: product.id,
        errors
      },
      persistent: true,
      actions: [
        {
          label: 'Fix Configuration',
          variant: 'primary',
          action: 'edit-product',
          data: { productId: product.id }
        }
      ]
    };
  }

  /**
   * Generate comprehensive alerts for all products
   * Called periodically or on-demand
   */
  static async generateProductAlerts(products: (Product | ProductWithConfig)[]): Promise<CreateAlertInput[]> {
    try {
      const alerts: CreateAlertInput[] = [];

      products.forEach(product => {
        // Type guard to check if product has config
        const hasConfig = 'config' in product && 'pricing' in product && 'availability' in product;

        if (hasConfig) {
          const productWithConfig = product as ProductWithConfig;

          // Low margin alert
          if (productWithConfig.pricing.profit_margin < 15) {
            alerts.push(this.lowMarginAlert(productWithConfig));
          }

          // Recipe unavailable
          if (productWithConfig.config.has_components &&
              productWithConfig.config.requires_production &&
              (productWithConfig.availability.can_produce_quantity ?? 0) === 0) {
            alerts.push(this.recipeUnavailableAlert(productWithConfig));
          }

          // Validate configuration
          const configErrors = this.validateProductConfig(productWithConfig);
          if (configErrors.length > 0) {
            alerts.push(this.invalidConfigurationAlert(productWithConfig, configErrors));
          }
        }
      });

      logger.info('Products', `Generated ${alerts.length} product alerts from ${products.length} products`);
      return alerts;
    } catch (error) {
      logger.error('Products', 'Error generating product alerts', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        productsCount: products?.length || 0
      });
      return [];
    }
  }

  /**
   * Validate product configuration
   * Returns array of error messages
   */
  private static validateProductConfig(product: ProductWithConfig): string[] {
    const errors: string[] = [];
    const { config } = product;

    // Validate components
    if (config.has_components && config.components_required) {
      // Note: components check would need access to DB, skip for now
    }

    // Validate staff
    if (config.requires_staff && (!config.staff_allocation || config.staff_allocation.length === 0)) {
      errors.push("Staff required but not allocated");
    }

    // Validate duration
    if (config.has_duration && !config.duration_minutes) {
      errors.push("Duration required but not specified");
    }

    // Validate booking
    if (config.requires_booking && !config.booking_window_days) {
      errors.push("Booking window required but not specified");
    }

    // Validate digital
    if (config.is_digital && !config.digital_delivery) {
      errors.push("Digital delivery configuration missing");
    }

    // Validate retail
    if (config.is_retail && !config.retail_details?.sku) {
      errors.push("Retail SKU missing");
    }

    return errors;
  }
}
