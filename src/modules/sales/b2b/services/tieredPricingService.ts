/**
 * Tiered Pricing Service
 *
 * Service layer for calculating volume-based pricing and discounts.
 * Supports quantity-based, value-based, and annual volume tiers.
 *
 * @module sales/b2b/services/tieredPricingService
 */

import Decimal from 'decimal.js';
import { logger } from '@/lib/logging';
import type {
  TieredPricing,
  PricingTier,
  // TODO Phase 3: Implement PricingTierType enum for tier type validation
  // PricingTierType,
  CalculatedPrice,
} from '../types';

// ============================================
// PRICE CALCULATION
// ============================================

/**
 * Calculate price with tiered discount
 *
 * @param basePrice - Original product price
 * @param quantity - Order quantity
 * @param tieredPricing - Tiered pricing configuration
 * @returns Calculated price with discount applied
 */
export const calculateTieredPrice = (
  basePrice: string | Decimal,
  quantity: number,
  tieredPricing: TieredPricing
): CalculatedPrice => {
  try {
    const originalPrice = new Decimal(basePrice);

    // Find applicable tier
    const applicableTier = findApplicableTier(quantity, tieredPricing);

    if (!applicableTier) {
      // No tier applies, return original price
      return {
        original_price: originalPrice,
        discount_percentage: 0,
        discount_amount: new Decimal(0),
        final_price: originalPrice,
      };
    }

    // Check if tier has fixed price
    if (applicableTier.fixed_price) {
      const fixedPrice = new Decimal(applicableTier.fixed_price);
      const discountAmount = originalPrice.minus(fixedPrice);
      const discountPercentage = originalPrice.isZero()
        ? 0
        : discountAmount.dividedBy(originalPrice).times(100).toNumber();

      return {
        original_price: originalPrice,
        tier_applied: applicableTier,
        discount_percentage: Math.max(0, discountPercentage),
        discount_amount: discountAmount,
        final_price: fixedPrice,
      };
    }

    // Calculate percentage discount
    const discountPercentage = applicableTier.discount_percentage;
    const discountAmount = originalPrice.times(discountPercentage).dividedBy(100);
    const finalPrice = originalPrice.minus(discountAmount);

    return {
      original_price: originalPrice,
      tier_applied: applicableTier,
      discount_percentage: discountPercentage,
      discount_amount: discountAmount,
      final_price: finalPrice,
    };
  } catch (error) {
    logger.error('B2B', 'Error calculating tiered price', error);
    throw error;
  }
};

/**
 * Find applicable pricing tier based on quantity or value
 */
const findApplicableTier = (
  quantity: number,
  tieredPricing: TieredPricing
): PricingTier | undefined => {
  if (!tieredPricing.is_active) {
    return undefined;
  }

  // Sort tiers by min_quantity (ascending) or min_value
  const sortedTiers = [...tieredPricing.tiers].sort((a, b) => {
    if (tieredPricing.type === 'volume') {
      return (a.min_quantity || 0) - (b.min_quantity || 0);
    }
    // For value-based, we'd need order total which is calculated elsewhere
    return 0;
  });

  // Find the highest tier that the quantity qualifies for
  let applicableTier: PricingTier | undefined;

  for (const tier of sortedTiers) {
    if (tieredPricing.type === 'volume') {
      const meetsMin = !tier.min_quantity || quantity >= tier.min_quantity;
      const meetsMax = !tier.max_quantity || quantity <= tier.max_quantity;

      if (meetsMin && meetsMax) {
        applicableTier = tier;
      }
    }
  }

  return applicableTier;
};

/**
 * Calculate total order value with tiered pricing
 */
export const calculateOrderWithTiers = (
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price: string;
  }>,
  tieredPricings: Record<string, TieredPricing> // Keyed by product_id
): {
  subtotal: Decimal;
  total_discount: Decimal;
  final_total: Decimal;
  items_with_pricing: Array<{
    product_id: string;
    quantity: number;
    unit_price: Decimal;
    calculated_price: CalculatedPrice;
    line_total: Decimal;
  }>;
} => {
  let subtotal = new Decimal(0);
  let totalDiscount = new Decimal(0);

  const itemsWithPricing = items.map(item => {
    const tier = tieredPricings[item.product_id];
    const calculatedPrice = tier
      ? calculateTieredPrice(item.unit_price, item.quantity, tier)
      : {
          original_price: new Decimal(item.unit_price),
          discount_percentage: 0,
          discount_amount: new Decimal(0),
          final_price: new Decimal(item.unit_price),
        };

    const lineTotal = calculatedPrice.final_price.times(item.quantity);

    subtotal = subtotal.plus(lineTotal);
    totalDiscount = totalDiscount.plus(
      calculatedPrice.discount_amount.times(item.quantity)
    );

    return {
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: new Decimal(item.unit_price),
      calculated_price: calculatedPrice,
      line_total: lineTotal,
    };
  });

  return {
    subtotal,
    total_discount: totalDiscount,
    final_total: subtotal,
    items_with_pricing: itemsWithPricing,
  };
};

// ============================================
// TIER MANAGEMENT
// ============================================

/**
 * Get all tiered pricing configurations
 */
export const getTieredPricings = async (): Promise<TieredPricing[]> => {
  try {
    logger.debug('B2B', 'Fetching tiered pricings');

    // TODO: Replace with actual Supabase query when table exists
    // const { data, error } = await supabase
    //   .from('tiered_pricings')
    //   .select('*')
    //   .eq('is_active', true);

    // if (error) throw error;

    // Placeholder: return empty array
    return [];
  } catch (error) {
    logger.error('B2B', 'Error fetching tiered pricings', error);
    throw error;
  }
};

/**
 * Get tiered pricing by ID
 */
export const getTieredPricingById = async (id: string): Promise<TieredPricing | null> => {
  try {
    logger.debug('B2B', 'Fetching tiered pricing', { id });

    // TODO: Replace with actual Supabase query when table exists
    // const { data, error } = await supabase
    //   .from('tiered_pricings')
    //   .select('*')
    //   .eq('id', id)
    //   .single();

    // if (error) throw error;

    // Placeholder: return null
    return null;
  } catch (error) {
    logger.error('B2B', 'Error fetching tiered pricing', error);
    throw error;
  }
};

/**
 * Get tiered pricing for product
 */
export const getTieredPricingForProduct = async (
  productId: string
): Promise<TieredPricing | null> => {
  try {
    logger.debug('B2B', 'Fetching tiered pricing for product', { productId });

    // TODO: Replace with actual Supabase query when table exists
    // Find tiered pricing where product is in applicable_products array
    // const { data, error } = await supabase
    //   .from('tiered_pricings')
    //   .select('*')
    //   .contains('applicable_products', [productId])
    //   .eq('is_active', true)
    //   .single();

    // if (error) throw error;

    // Placeholder: return null
    return null;
  } catch (error) {
    logger.error('B2B', 'Error fetching tiered pricing for product', error);
    throw error;
  }
};

/**
 * Validate tiered pricing configuration
 */
export const validateTieredPricing = (tieredPricing: TieredPricing): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  // Check tiers exist
  if (!tieredPricing.tiers || tieredPricing.tiers.length === 0) {
    errors.push('At least one tier is required');
  }

  // Check tier ranges don't overlap
  const tiers = tieredPricing.tiers;
  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];

    // Validate min <= max
    if (tier.min_quantity && tier.max_quantity && tier.min_quantity > tier.max_quantity) {
      errors.push(`Tier ${i + 1}: min_quantity cannot be greater than max_quantity`);
    }

    // Validate discount percentage
    if (tier.discount_percentage < 0 || tier.discount_percentage > 100) {
      errors.push(`Tier ${i + 1}: discount_percentage must be between 0 and 100`);
    }

    // Check for gaps between tiers
    if (i > 0 && tieredPricing.type === 'volume') {
      const prevTier = tiers[i - 1];
      if (prevTier.max_quantity && tier.min_quantity) {
        if (prevTier.max_quantity + 1 < tier.min_quantity) {
          errors.push(`Gap between tier ${i} and tier ${i + 1}`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ============================================
// EXPORTS
// ============================================

export default {
  calculateTieredPrice,
  calculateOrderWithTiers,
  getTieredPricings,
  getTieredPricingById,
  getTieredPricingForProduct,
  validateTieredPricing,
};
