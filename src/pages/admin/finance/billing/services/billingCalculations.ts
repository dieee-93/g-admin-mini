/**
 * BILLING CALCULATIONS SERVICE
 *
 * Banking-level precision calculations using Decimal.js
 *
 * @version 1.0.0
 */

import { DecimalUtils } from '@/lib/decimal';
import type { Subscription, BillingMetrics } from '../types';

/**
 * Calculate monthly recurring revenue (MRR) from a subscription
 */
export function calculateMRR(subscription: Subscription): number {
  const amount = DecimalUtils.fromValue(subscription.amount ?? 0, 'currency');

  switch (subscription.billing_type) {
    case 'monthly':
      return DecimalUtils.toNumber(amount);
    case 'quarterly':
      return DecimalUtils.toNumber(DecimalUtils.divide(amount, 3, 'currency'));
    case 'annual':
      return DecimalUtils.toNumber(DecimalUtils.divide(amount, 12, 'currency'));
    case 'custom':
      if (subscription.custom_interval && subscription.custom_interval_type) {
        const daysInterval =
          subscription.custom_interval_type === 'days' ? subscription.custom_interval :
          subscription.custom_interval_type === 'weeks' ? subscription.custom_interval * 7 :
          subscription.custom_interval * 30;

        const monthlyMultiplier = DecimalUtils.fromValue(30 / daysInterval, 'currency');
        return DecimalUtils.toNumber(DecimalUtils.multiply(amount, monthlyMultiplier, 'currency'));
      }
      return 0;
    default:
      return 0;
  }
}

/**
 * Calculate annual recurring revenue (ARR)
 */
export function calculateARR(subscription: Subscription): number {
  const mrr = calculateMRR(subscription);
  const mrrDecimal = DecimalUtils.fromValue(mrr, 'currency');
  const arr = DecimalUtils.multiply(mrrDecimal, 12, 'currency');
  return DecimalUtils.toNumber(arr);
}

/**
 * Calculate lifetime value (LTV) of a subscription
 */
export function calculateLTV(subscription: Subscription): number {
  const mrr = DecimalUtils.fromValue(calculateMRR(subscription), 'currency');

  // If end date exists, calculate based on duration
  if (subscription.end_date && subscription.start_date) {
    const start = new Date(subscription.start_date);
    const end = new Date(subscription.end_date);
    const months = Math.max(0, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    const monthsDecimal = DecimalUtils.fromValue(months, 'currency');
    const ltv = DecimalUtils.multiply(mrr, monthsDecimal, 'currency');
    return DecimalUtils.toNumber(ltv);
  }

  // If billing cycles specified
  if (subscription.billing_cycles) {
    const amount = DecimalUtils.fromValue(subscription.amount ?? 0, 'currency');
    const cycles = DecimalUtils.fromValue(subscription.billing_cycles, 'currency');
    const ltv = DecimalUtils.multiply(amount, cycles, 'currency');
    return DecimalUtils.toNumber(ltv);
  }

  // Default: estimate 2 years
  const twoYears = DecimalUtils.fromValue(24, 'currency');
  const ltv = DecimalUtils.multiply(mrr, twoYears, 'currency');
  return DecimalUtils.toNumber(ltv);
}

/**
 * Calculate next billing date
 */
export function calculateNextBillingDate(
  startDate: string,
  billingType: Subscription['billing_type'],
  customInterval?: number,
  customIntervalType?: 'days' | 'weeks' | 'months'
): Date {
  const start = new Date(startDate);

  switch (billingType) {
    case 'monthly':
      return new Date(start.setMonth(start.getMonth() + 1));
    case 'quarterly':
      return new Date(start.setMonth(start.getMonth() + 3));
    case 'annual':
      return new Date(start.setFullYear(start.getFullYear() + 1));
    case 'custom':
      if (customInterval && customIntervalType) {
        const days =
          customIntervalType === 'days' ? customInterval :
          customIntervalType === 'weeks' ? customInterval * 7 :
          customInterval * 30;
        return new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
      }
      return start;
    default:
      return start;
  }
}

/**
 * Calculate total cycles based on start/end dates
 */
export function calculateTotalCycles(
  startDate: string,
  endDate: string,
  billingType: Subscription['billing_type']
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  switch (billingType) {
    case 'monthly':
      return Math.ceil(totalDays / 30);
    case 'quarterly':
      return Math.ceil(totalDays / 90);
    case 'annual':
      return Math.ceil(totalDays / 365);
    default:
      return Math.ceil(totalDays / 30);
  }
}

/**
 * Calculate comprehensive billing metrics
 */
export function calculateBillingMetrics(
  amount: number,
  billingType: Subscription['billing_type'],
  startDate: string,
  endDate?: string,
  billingCycles?: number,
  customInterval?: number,
  customIntervalType?: 'days' | 'weeks' | 'months'
): BillingMetrics {
  const amountDecimal = DecimalUtils.fromValue(amount ?? 0, 'currency');

  // Monthly amount
  let monthlyAmount = 0;
  switch (billingType) {
    case 'monthly':
      monthlyAmount = amount;
      break;
    case 'quarterly':
      monthlyAmount = DecimalUtils.toNumber(DecimalUtils.divide(amountDecimal, 3, 'currency'));
      break;
    case 'annual':
      monthlyAmount = DecimalUtils.toNumber(DecimalUtils.divide(amountDecimal, 12, 'currency'));
      break;
    case 'custom':
      if (customInterval && customIntervalType) {
        const daysInterval =
          customIntervalType === 'days' ? customInterval :
          customIntervalType === 'weeks' ? customInterval * 7 :
          customInterval * 30;
        const multiplier = DecimalUtils.fromValue(30 / daysInterval, 'currency');
        monthlyAmount = DecimalUtils.toNumber(DecimalUtils.multiply(amountDecimal, multiplier, 'currency'));
      }
      break;
  }

  const monthlyDecimal = DecimalUtils.fromValue(monthlyAmount, 'currency');
  const annualRevenue = DecimalUtils.toNumber(DecimalUtils.multiply(monthlyDecimal, 12, 'currency'));

  // Lifetime value
  let lifetimeValue = 0;
  if (endDate && startDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = Math.max(0, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    const monthsDecimal = DecimalUtils.fromValue(months, 'currency');
    lifetimeValue = DecimalUtils.toNumber(DecimalUtils.multiply(monthlyDecimal, monthsDecimal, 'currency'));
  } else if (billingCycles) {
    const cyclesDecimal = DecimalUtils.fromValue(billingCycles, 'currency');
    lifetimeValue = DecimalUtils.toNumber(DecimalUtils.multiply(amountDecimal, cyclesDecimal, 'currency'));
  } else {
    const twoYears = DecimalUtils.fromValue(24, 'currency');
    lifetimeValue = DecimalUtils.toNumber(DecimalUtils.multiply(monthlyDecimal, twoYears, 'currency'));
  }

  // Next billing date
  const nextBillingDate = calculateNextBillingDate(startDate, billingType, customInterval, customIntervalType);

  // Revenue health
  const revenueHealth: 'high' | 'medium' | 'low' =
    monthlyAmount > 1000 ? 'high' :
    monthlyAmount > 500 ? 'medium' :
    'low';

  // Retention risk
  const retentionRisk: 'high' | 'medium' | 'low' =
    billingCycles && billingCycles < 12 ? 'high' :
    billingType === 'annual' ? 'low' :
    'medium';

  return {
    monthlyAmount,
    annualRevenue,
    lifetimeValue,
    nextBillingDate,
    revenueHealth,
    retentionRisk
  };
}

/**
 * Calculate invoice total with tax
 */
export function calculateInvoiceTotal(
  amount: number,
  taxRate: number = 0.21
): { amount: number; taxAmount: number; totalAmount: number } {
  const amountDecimal = DecimalUtils.fromValue(amount, 'currency');
  const taxRateDecimal = DecimalUtils.fromValue(taxRate, 'currency');

  const taxAmount = DecimalUtils.toNumber(
    DecimalUtils.multiply(amountDecimal, taxRateDecimal, 'currency')
  );

  const taxDecimal = DecimalUtils.fromValue(taxAmount, 'currency');
  const totalAmount = DecimalUtils.toNumber(
    DecimalUtils.add(amountDecimal, taxDecimal, 'currency')
  );

  return {
    amount,
    taxAmount,
    totalAmount
  };
}

/**
 * Calculate proration amount
 */
export function calculateProration(
  fullAmount: number,
  periodStart: string,
  periodEnd: string,
  actualStart: string
): number {
  const fullAmountDecimal = DecimalUtils.fromValue(fullAmount, 'currency');

  const periodStartDate = new Date(periodStart);
  const periodEndDate = new Date(periodEnd);
  const actualStartDate = new Date(actualStart);

  const totalDays = Math.ceil((periodEndDate.getTime() - periodStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const usedDays = Math.ceil((periodEndDate.getTime() - actualStartDate.getTime()) / (1000 * 60 * 60 * 24));

  const totalDaysDecimal = DecimalUtils.fromValue(totalDays, 'currency');
  const usedDaysDecimal = DecimalUtils.fromValue(usedDays, 'currency');

  const proratedAmount = DecimalUtils.multiply(
    fullAmountDecimal,
    DecimalUtils.divide(usedDaysDecimal, totalDaysDecimal, 'currency'),
    'currency'
  );

  return DecimalUtils.toNumber(proratedAmount);
}
