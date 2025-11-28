/**
 * ASSETS BUSINESS LOGIC SERVICE
 * Business logic and calculations for assets
 */

import { assetsApi } from './assetsApi';
import type { Asset, AssetMetrics, AssetFilters } from '../types';

export const assetsService = {
  /**
   * Calculate asset metrics
   */
  async getMetrics(filters?: AssetFilters): Promise<AssetMetrics> {
    const assets = await assetsApi.getAll(filters);

    const available_count = assets.filter((a) => a.status === 'available').length;
    const in_use_count = assets.filter((a) => a.status === 'in_use').length;
    const maintenance_count = assets.filter((a) => a.status === 'maintenance').length;
    const rented_count = assets.filter((a) => a.currently_rented).length;
    const rentable_count = assets.filter((a) => a.is_rentable).length;

    const total_value = assets.reduce((sum, a) => sum + (a.current_value || a.purchase_price || 0), 0);

    // Count assets with maintenance due in next 7 days
    const today = new Date();
    const week_from_now = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const maintenance_due_soon = assets.filter((a) => {
      if (!a.next_maintenance_date) return false;
      const due_date = new Date(a.next_maintenance_date);
      return due_date >= today && due_date <= week_from_now;
    }).length;

    return {
      total_assets: assets.length,
      available_count,
      in_use_count,
      maintenance_count,
      rented_count,
      total_value,
      rentable_count,
      maintenance_due_soon,
    };
  },

  /**
   * Check if asset is available for rental
   */
  isAvailableForRental(asset: Asset): boolean {
    return (
      asset.is_rentable &&
      !asset.currently_rented &&
      ['available', 'in_use'].includes(asset.status) &&
      asset.condition !== 'broken' &&
      asset.condition !== 'poor'
    );
  },

  /**
   * Calculate depreciation
   */
  calculateDepreciation(asset: Asset, years: number = 5): number {
    if (!asset.purchase_price || !asset.purchase_date) return 0;

    const purchase = new Date(asset.purchase_date);
    const now = new Date();
    const age_years = (now.getTime() - purchase.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

    const depreciation_per_year = asset.purchase_price / years;
    const total_depreciation = depreciation_per_year * age_years;

    return Math.max(0, asset.purchase_price - total_depreciation);
  },

  /**
   * Get assets needing maintenance
   */
  async getMaintenanceDue(days_ahead: number = 30): Promise<Asset[]> {
    const all_assets = await assetsApi.getAll();
    const cutoff_date = new Date();
    cutoff_date.setDate(cutoff_date.getDate() + days_ahead);

    return all_assets.filter((asset) => {
      if (!asset.next_maintenance_date) return false;
      const due_date = new Date(asset.next_maintenance_date);
      return due_date <= cutoff_date;
    });
  },

  /**
   * Schedule next maintenance
   */
  scheduleNextMaintenance(last_date: Date, interval_days: number): Date {
    const next = new Date(last_date);
    next.setDate(next.getDate() + interval_days);
    return next;
  },

  /**
   * Generate unique asset code
   */
  generateAssetCode(category: string, sequence: number): string {
    const prefix = category.substring(0, 3).toUpperCase();
    const padded = String(sequence).padStart(4, '0');
    return `${prefix}-${padded}`;
  },

  /**
   * Validate rental pricing
   */
  validateRentalPricing(asset: Partial<Asset>): string[] {
    const errors: string[] = [];

    if (asset.is_rentable) {
      if (!asset.rental_price_per_day && !asset.rental_price_per_hour) {
        errors.push('Rentable assets must have at least one rental price defined');
      }
      if (asset.rental_price_per_day && asset.rental_price_per_day <= 0) {
        errors.push('Daily rental price must be positive');
      }
      if (asset.rental_price_per_hour && asset.rental_price_per_hour <= 0) {
        errors.push('Hourly rental price must be positive');
      }
    }

    return errors;
  },
};
