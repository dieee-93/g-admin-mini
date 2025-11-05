/**
 * BILLING MODULE TYPES
 *
 * Type definitions for the Billing module
 *
 * @version 1.0.0
 */

// ==================== SUBSCRIPTION TYPES ====================

export interface Subscription {
  id: string;
  customerId: string;
  subscriptionName: string;
  billingType: 'monthly' | 'quarterly' | 'annual' | 'custom';
  amount: number;
  currency: 'ARS' | 'USD' | 'EUR';
  taxIncluded: boolean;
  startDate: string;
  endDate?: string;
  billingCycles?: number;
  customInterval?: number;
  customIntervalType?: 'days' | 'weeks' | 'months';
  status: 'active' | 'suspended' | 'cancelled' | 'trial';
  autoInvoice: boolean;
  autoCollect: boolean;
  retryFailedPayments: boolean;
  maxRetries: number;
  paymentTerms: 'immediate' | 'net15' | 'net30' | 'net45';
  reminderDays: number[];
  prorate: boolean;
  allowUsageCharges: boolean;
  suspendOnFailure: boolean;
  description?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== BILLING CYCLE TYPES ====================

export interface BillingCycle {
  id: string;
  subscriptionId: string;
  cycleNumber: number;
  startDate: string;
  endDate: string;
  dueDate: string;
  amount: number;
  status: 'pending' | 'invoiced' | 'paid' | 'overdue' | 'cancelled';
  invoiceId?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== INVOICE TYPES ====================

export interface Invoice {
  id: string;
  customerId: string;
  subscriptionId?: string;
  billingCycleId?: string;
  invoiceNumber: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  currency: 'ARS' | 'USD' | 'EUR';
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== PAYMENT METHOD TYPES ====================

export interface PaymentMethod {
  id: string;
  sale_id: string;
  order_id?: string;
  type: string;
  amount: number;
  provider?: string;
  transaction_id?: string;
  authorization_code?: string;
  reference_number?: string;
  batch_id?: string;
  status?: string;
  processed_at?: string;
  is_contactless: boolean;
  processing_time?: string;
  tip_amount: number;
  tip_percentage?: number;
  receipt_method?: string;
  customer_signature?: string;
  terminal_id?: string;
  last_four_digits?: string;
  card_brand?: string;
  is_emv?: boolean;
  cvv_verified?: boolean;
  created_at: string;
}

// ==================== PAYMENT TYPES ====================

export interface Payment {
  id: string;
  invoiceId: string;
  paymentMethodId?: string;
  amount: number;
  currency: 'ARS' | 'USD' | 'EUR';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  provider?: string;
  failureReason?: string;
  retryCount: number;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== ANALYTICS TYPES ====================

export interface BillingMetrics {
  monthlyAmount: number;
  annualRevenue: number;
  lifetimeValue: number;
  nextBillingDate: Date | null;
  revenueHealth: 'high' | 'medium' | 'low';
  retentionRisk: 'high' | 'medium' | 'low';
}

export interface SubscriptionStats {
  total: number;
  active: number;
  suspended: number;
  cancelled: number;
  trial: number;
}

export interface RevenueStats {
  monthly: number;
  quarterly: number;
  annual: number;
  growth: number;
}

export interface ChurnStats {
  rate: number;
  voluntaryChurn: number;
  involuntaryChurn: number;
  trend: number;
}

export interface LTVStats {
  average: number;
  median: number;
  top10Percent: number;
  cohortImprovement: number;
}

export interface BillingHealthStats {
  successfulCharges: number;
  failedCharges: number;
  retrySuccessRate: number;
  averageCollectionTime: number;
}

export interface SubscriptionSegment {
  title: string;
  description: string;
  count: number;
  avgRevenue: number;
  churnRate: number;
  color: 'green' | 'blue' | 'orange' | 'yellow' | 'red' | 'gray';
  priority: string;
  strategies: string[];
}

export interface CohortData {
  cohort: string;
  initialSize: number;
  retention30: number;
  retention60: number;
  retention90: number | null;
  avgLTV: number;
  status: 'mature' | 'growing' | 'concerning' | 'early';
}

export interface RevenueInsight {
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

// ==================== EVENT TYPES ====================

export interface BillingInvoiceGeneratedEvent {
  invoiceId: string;
  subscriptionId?: string;
  customerId: string;
  amount: number;
  dueDate: string;
}

export interface BillingPaymentReceivedEvent {
  paymentId: string;
  invoiceId: string;
  amount: number;
  paymentMethodId?: string;
  processedAt: string;
}

export interface BillingSubscriptionCreatedEvent {
  subscriptionId: string;
  customerId: string;
  subscriptionName: string;
  amount: number;
  billingType: Subscription['billingType'];
  projectedRevenue: number;
  lifetimeValue: number;
}

// ==================== FORM TYPES ====================

export interface RecurringBillingFormData {
  subscriptionName: string;
  customerId: string;
  billingType: 'monthly' | 'quarterly' | 'annual' | 'custom';
  amount: number;
  currency: 'ARS' | 'USD' | 'EUR';
  taxIncluded: boolean;
  startDate: string;
  endDate?: string;
  billingCycles?: number;
  customInterval?: number;
  customIntervalType?: 'days' | 'weeks' | 'months';
  autoInvoice: boolean;
  autoCollect: boolean;
  retryFailedPayments: boolean;
  maxRetries: number;
  description?: string;
  internalNotes?: string;
  paymentTerms: 'immediate' | 'net15' | 'net30' | 'net45';
  reminderDays: number[];
  prorate: boolean;
  allowUsageCharges: boolean;
  suspendOnFailure: boolean;
}

// ==================== API RESPONSE TYPES ====================

export interface CreateInvoiceResponse {
  invoice: Invoice | null;
  success: boolean;
  error?: string;
}

export interface ProcessPaymentResponse {
  success: boolean;
  paymentId?: string;
  transactionId?: string;
  error?: string;
}

export interface BillingAnalyticsData {
  subscriptions: SubscriptionStats;
  revenue: RevenueStats;
  churn: ChurnStats;
  ltv: LTVStats;
  billingHealth: BillingHealthStats;
}
