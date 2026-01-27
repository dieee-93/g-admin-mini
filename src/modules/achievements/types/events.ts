/**
 * ACHIEVEMENT EVENTS - Type Definitions
 * 
 * Event payload interfaces for achievement system integration.
 * Based on LinkedIn/Kafka "Self-Contained Events" pattern.
 * 
 * @see https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying
 */

export interface BaseAchievementEventPayload {
  timestamp: number;
  userId?: string;
  triggeredBy: 'manual' | 'import' | 'api' | 'system';
}

export interface ProductCreatedEventPayload extends BaseAchievementEventPayload {
  product: {
    id: string;
    name: string;
    category?: string;
  };
  totalCount: number;
  previousCount: number;
}

export interface SaleCompletedEventPayload extends BaseAchievementEventPayload {
  orderId: string;
  orderTotal: number;
  items: Array<{ productId: string; quantity: number }>;
  totalSales: number;
  previousTotalSales: number;
}

export interface StaffMemberAddedEventPayload extends BaseAchievementEventPayload {
  staffId: string;
  staffName: string;
  role: string;
  totalStaff: number;
  previousTotalStaff: number;
}

export interface SettingsUpdatedEventPayload extends BaseAchievementEventPayload {
  setting: string;
  value: unknown;
  previousValue?: unknown;
}

export interface PaymentMethodConfiguredEventPayload extends BaseAchievementEventPayload {
  method: string;
  provider?: string;
  isFirstMethod: boolean;
}

export type AchievementEventPayload =
  | ProductCreatedEventPayload
  | SaleCompletedEventPayload
  | StaffMemberAddedEventPayload
  | SettingsUpdatedEventPayload
  | PaymentMethodConfiguredEventPayload;

export const PRODUCT_MILESTONES = [1, 5, 10, 20, 50, 100, 500] as const;
export const SALES_MILESTONES = [1, 10, 50, 100, 500, 1000] as const;
export const STAFF_MILESTONES = [1, 5, 10, 25, 50] as const;

export type ProductMilestone = typeof PRODUCT_MILESTONES[number];
export type SalesMilestone = typeof SALES_MILESTONES[number];
export type StaffMilestone = typeof STAFF_MILESTONES[number];
