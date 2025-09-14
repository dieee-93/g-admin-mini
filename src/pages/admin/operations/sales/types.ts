// src/features/sales/types.ts - MODERN POS ARCHITECTURE v3.0
// ========================================================
// CORE SALES & ORDER MANAGEMENT
// ========================================================

export interface Sale {
  id: string;
  customer_id?: string;
  table_id?: string; // 🚀 NEW: Table management integration
  order_id?: string; // 🚀 NEW: Order lifecycle tracking
  total: number;
  subtotal: number; // 🚀 NEW: Before taxes/tips (calculated by fiscal service)
  taxes: number; // 🚀 NEW: Tax calculation (IVA + other taxes from fiscal service)
  tips: number; // 🚀 NEW: Digital tip management
  discounts: number; // 🚀 NEW: Discount tracking
  
  // 🚀 NEW: Detailed tax breakdown (from fiscal service)
  iva_amount?: number;
  ingresos_brutos_amount?: number;
  effective_tax_rate?: number;
  note?: string;
  
  // 🚀 NEW: Advanced order properties
  order_type: OrderType;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  fulfillment_type: FulfillmentType;
  
  // 🚀 NEW: Service timing
  created_at: string;
  estimated_ready_time?: string;
  actual_ready_time?: string;
  completed_at?: string;
  updated_at?: string;
  
  // 🚀 NEW: Service intelligence
  priority_level: PriorityLevel;
  service_stage?: ServiceStage;
  special_instructions?: string[];
  allergy_warnings?: string[];
  
  // Relaciones expandidas
  customer?: Customer;
  table?: Table;
  order?: Order;
  sale_items?: SaleItem[];
  payment_methods?: PaymentMethod[];
}

// 🚀 NEW: Modern order management
export interface Order {
  id: string;
  order_number: string;
  sale_id: string;
  table_id?: string;
  customer_id?: string;
  
  // Order lifecycle
  status: OrderStatus;
  order_type: OrderType;
  fulfillment_type: FulfillmentType;
  priority_level: PriorityLevel;
  
  // Timing intelligence
  created_at: string;
  estimated_ready_time: string;
  actual_ready_time?: string;
  completed_at?: string;
  
  // Service tracking
  service_timeline: ServiceEvent[];
  kitchen_notes?: string;
  special_instructions?: string[];
  allergy_warnings?: string[];
  
  // Relations
  items: OrderItem[];
  table?: Table;
  customer?: Customer;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  order_id?: string; // 🚀 NEW: Order tracking
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number; // 🚀 NEW: Calculated line total
  
  // 🚀 NEW: Item modifications & preferences
  modifications?: ItemModification[];
  special_instructions?: string;
  preparation_notes?: string;
  
  // 🚀 NEW: Kitchen integration
  kitchen_status?: KitchenItemStatus;
  preparation_time?: number; // estimated minutes
  actual_prep_time?: number; // actual minutes taken
  
  // Timing
  created_at?: string;
  updated_at?: string;
  
  // Relations
  product?: Product;
  order?: Order;
}

// 🚀 NEW: Order items (separate from sale items for better tracking)
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  
  // Kitchen management
  status: KitchenItemStatus;
  station_assigned?: string; // grill, salad, dessert, etc.
  preparation_time_estimate: number;
  actual_prep_time?: number;
  
  // Customizations
  modifications: ItemModification[];
  special_instructions?: string;
  allergy_warnings?: string[];
  
  // Timing
  created_at: string;
  started_prep_at?: string;
  completed_at?: string;
  
  // Relations
  product?: Product;
}

// 🚀 NEW: Item modifications (add-ons, substitutions, etc.)
export interface ItemModification {
  id: string;
  type: 'addition' | 'substitution' | 'removal' | 'preparation_style';
  description: string;
  price_adjustment: number; // can be positive or negative
  ingredients_affected?: string[];
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  note?: string;
  address?: string;
  created_at: string;
  updated_at?: string;
  
  // 🚀 NEW: Customer intelligence
  is_vip?: boolean;
  loyalty_points?: number;
  total_spent?: number;
  visit_count?: number;
  last_visit_date?: string;
  preferred_table?: string;
  dietary_restrictions?: string[];
  allergies?: string[];
  preferences?: string[];
}

// ========================================================
// 🚀 TABLE MANAGEMENT SYSTEM
// ========================================================

export interface Table {
  id: string;
  number: string;
  capacity: number;
  location: TableLocation;
  
  // Real-time status
  status: TableStatus;
  current_party?: Party;
  estimated_turn_time?: number; // minutes
  service_stage?: ServiceStage;
  
  // Intelligence & performance
  average_turn_time: number; // historical data
  revenue_contribution: number; // performance tracking
  preferred_by: string[]; // customer preferences
  
  // Visual management
  color_code: TableColorCode;
  priority: TablePriority;
  
  // Physical properties
  position_x?: number; // for floor plan
  position_y?: number; // for floor plan
  shape?: 'square' | 'round' | 'rectangle';
  section_id?: string;
  
  // Metadata
  created_at: string;
  updated_at?: string;
  is_active: boolean;
}

export interface Party {
  id: string;
  table_id: string;
  size: number;
  customer_ids?: string[];
  seated_at: string;
  estimated_duration: number; // minutes
  actual_duration?: number;
  special_requests: string[];
  total_spent: number;
  
  // Service intelligence
  service_timeline: ServiceEvent[];
  satisfaction: SatisfactionLevel;
  is_vip: boolean;
  has_allergies: boolean;
  dietary_restrictions: string[];
  
  // Status
  status: PartyStatus;
  created_at: string;
  updated_at?: string;
}

export interface ServiceEvent {
  id: string;
  type: ServiceEventType;
  timestamp: string;
  description: string;
  staff_member?: string;
  duration_minutes?: number;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  unit?: string;
  type?: string;
  description?: string;
  cost?: number; // Calculated by function
  availability?: number; // Calculated by function
  components_count?: number; // Calculated by function
  created_at: string;
  updated_at?: string;
  
  // 🚀 NEW: Enhanced product properties
  category_id?: string;
  allergens?: string[];
  preparation_time?: number; // minutes
  kitchen_station?: string; // grill, salad, dessert, etc.
  is_available?: boolean;
  popularity_score?: number;
  profit_margin?: number;
}

// ========================================================
// 🚀 PAYMENT REVOLUTION SYSTEM
// ========================================================

export interface PaymentMethod {
  id: string;
  sale_id: string;
  type: PaymentType;
  amount: number;
  provider?: string; // 'stripe', 'square', 'paypal', etc.
  transaction_id?: string;
  status: PaymentTransactionStatus;
  
  // 🚀 Modern payment features
  is_contactless?: boolean;
  processing_time?: number; // seconds
  tip_amount?: number;
  reference_number?: string;
  
  // 🚀 Customer experience
  receipt_method?: ReceiptDeliveryMethod;
  customer_signature?: string; // base64 image
  
  // Timing
  processed_at: string;
  created_at: string;
}

export interface SplitBill {
  id: string;
  sale_id: string;
  total_amount: number;
  split_type: SplitBillType;
  splits: BillSplit[];
  status: SplitBillStatus;
  created_at: string;
  completed_at?: string;
}

export interface BillSplit {
  id: string;
  split_bill_id: string;
  customer_name?: string;
  amount: number;
  payment_method?: PaymentMethod;
  status: 'pending' | 'paid' | 'failed';
  items?: string[]; // item IDs if item-based split
}

export interface TipConfiguration {
  suggested_percentages: number[]; // [15, 18, 20, 25]
  allow_custom: boolean;
  allow_no_tip: boolean;
  default_percentage?: number;
  tip_pooling_enabled: boolean;
}

// ========================================================
// 🚀 SALES INTELLIGENCE & ANALYTICS
// ========================================================

export interface SalesAnalytics {
  // Financial Performance (CRITICAL)
  daily_revenue: number;
  monthly_revenue: number;
  average_order_value: number;
  sales_per_labor_hour: number;
  food_cost_percentage: number;
  gross_profit_margin: number;
  
  // Operational Excellence
  average_covers: number;
  covers_trend: 'up' | 'down' | 'stable';
  table_utilization: number;
  table_turnover_rate: number;
  average_service_time: number;
  
  // Customer Intelligence
  customer_acquisition_cost: number;
  repeat_customer_rate: number;
  customer_lifetime_value: number;
  
  // Performance Benchmarks
  peak_hours_analysis: PeakHour[];
  seasonal_trends: SeasonalTrend[];
  menu_item_performance: MenuItemStats[];
  
  // Real-time Intelligence
  current_day_metrics: RealTimeMetrics;
  alerts_and_insights: BusinessAlert[];
}

export interface PeakHour {
  time_slot: string; // '12:00-13:00'
  average_covers: number;
  revenue_contribution: number;
  staffing_recommendation: number;
  popular_items: string[];
}

export interface MenuItemStats {
  item_id: string;
  item_name: string;
  units_sold: number;
  revenue_contribution: number;
  profit_margin: number;
  popularity: 'high' | 'medium' | 'low';
  trend: 'up' | 'down' | 'stable';
  recommended_action: 'promote' | 'optimize' | 'remove' | 'maintain';
}

export interface BusinessAlert {
  type: 'opportunity' | 'warning' | 'critical';
  message: string;
  actionable: boolean;
  suggested_action?: string;
  impact: 'high' | 'medium' | 'low';
}

export interface RealTimeMetrics {
  current_revenue: number;
  orders_in_progress: number;
  tables_occupied: number;
  average_wait_time: number;
  kitchen_backlog: number;
}

export interface SeasonalTrend {
  period: string;
  revenue_change: number;
  popular_items: string[];
  recommendations: string[];
}

// ========================================================
// 🚀 ENUMS & CONSTANTS
// ========================================================

export enum OrderType {
  DINE_IN = 'dine_in',
  TAKEOUT = 'takeout',
  DELIVERY = 'delivery',
  PICKUP = 'pickup',
  CATERING = 'catering'
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_PAID = 'partially_paid'
}

export enum FulfillmentType {
  DINE_IN = 'dine_in',
  TAKEOUT = 'takeout',
  DELIVERY = 'delivery',
  PICKUP = 'pickup'
}

export enum PriorityLevel {
  NORMAL = 'normal',
  RUSH = 'rush',
  VIP = 'vip'
}

export enum ServiceStage {
  SEATED = 'seated',
  DRINKS_ORDERED = 'drinks_ordered',
  APPETIZERS = 'appetizers',
  ENTREES_ORDERED = 'entrees_ordered',
  ENTREES_SERVED = 'entrees_served',
  DESSERT = 'dessert',
  BILL_REQUESTED = 'bill_requested',
  PAYING = 'paying',
  COMPLETED = 'completed'
}

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  NEEDS_CLEANING = 'needs_cleaning',
  OUT_OF_ORDER = 'out_of_order',
  READY_FOR_BILL = 'ready_for_bill'
}

export enum TableLocation {
  DINING_ROOM = 'dining_room',
  BAR = 'bar',
  PATIO = 'patio',
  PRIVATE = 'private'
}

export enum TableColorCode {
  GREEN = 'green',     // service_optimal (≤15 minutes)
  YELLOW = 'yellow',   // needs_attention (15-30 minutes)
  RED = 'red'          // immediate_action (30+ minutes)
}

export enum TablePriority {
  NORMAL = 'normal',
  VIP = 'vip',
  ATTENTION_NEEDED = 'attention_needed'
}

export enum PartyStatus {
  WAITING = 'waiting',
  SEATED = 'seated',
  ORDERING = 'ordering',
  DINING = 'dining',
  READY_TO_PAY = 'ready_to_pay',
  COMPLETED = 'completed'
}

export enum SatisfactionLevel {
  HIGH = 'high',
  MEDIUM = 'medium', 
  LOW = 'low',
  UNKNOWN = 'unknown'
}

export enum ServiceEventType {
  SEATED = 'seated',
  ORDER_TAKEN = 'order_taken',
  FOOD_SERVED = 'food_served',
  CHECK_REQUESTED = 'check_requested',
  PAYMENT_PROCESSED = 'payment_processed',
  TABLE_CLEARED = 'table_cleared'
}

export enum KitchenItemStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  READY = 'ready',
  SERVED = 'served'
}

export enum PaymentType {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  NFC_CARD = 'nfc_card',
  MOBILE_WALLET = 'mobile_wallet',
  QR_CODE = 'qr_code',
  DIGITAL_WALLET = 'digital_wallet',
  CRYPTO = 'crypto',
  BUY_NOW_PAY_LATER = 'bnpl'
}

export enum PaymentTransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum ReceiptDeliveryMethod {
  EMAIL = 'email',
  SMS = 'sms',
  APP_NOTIFICATION = 'app_notification',
  PRINTED = 'printed'
}

export enum SplitBillType {
  EVEN = 'even',
  ITEM_BASED = 'item_based',
  CUSTOM = 'custom'
}

export enum SplitBillStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// ========================================================
// 🚀 LEGACY COMPATIBILITY & FORM DATA
// ========================================================

export interface CreateSaleData {
  customer_id?: string;
  table_id?: string;
  order_type?: OrderType;
  fulfillment_type?: FulfillmentType;
  note?: string;
  special_instructions?: string[];
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
    modifications?: ItemModification[];
    special_instructions?: string;
  }[];
  
  // 🚀 NEW: Modern POS features
  payment_methods?: {
    type: PaymentType;
    amount: number;
    tip_amount?: number;
  }[];
  split_bill?: boolean;
  tip_percentage?: number;
}

export interface SaleValidation {
  is_valid: boolean;
  error_message?: string;
  insufficient_items?: {
    product_id: string;
    product_name: string;
    requested: number;
    available: number;
  }[];
  warnings?: ValidationWarning[];
}

export interface ValidationWarning {
  type: 'low_stock' | 'high_demand' | 'preparation_time';
  product_id: string;
  product_name: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface SaleProcessResult {
  success: boolean;
  sale_id?: string;
  order_id?: string;
  message: string;
  receipt_url?: string;
  estimated_ready_time?: string;
}

export interface SalesListFilters {
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  tableId?: string;
  orderType?: OrderType;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  minTotal?: number;
  maxTotal?: number;
  fulfillmentType?: FulfillmentType;
}

export interface SalesSummary {
  total_sales: number;
  revenue: number;
  avg_amount: number;
  top_customer?: {
    id: string;
    name: string;
    total_spent: number;
  };
  // 🚀 Enhanced summary metrics
  total_orders: number;
  table_turnover_rate: number;
  average_service_time: number;
  most_popular_item?: string;
  peak_hour?: string;
}

// Legacy form compatibility
export interface SaleFormItem {
  product_id: string;
  quantity: string;
  unit_price: string;
}

// ========================================================
// 🚀 QR CODE & TABLESIDE ORDERING
// ========================================================

export interface QROrder {
  id: string;
  table_id: string;
  qr_code: string;
  status: 'active' | 'expired' | 'completed';
  items: QROrderItem[];
  customer_name?: string;
  special_requests?: string;
  created_at: string;
  expires_at: string;
}

export interface QROrderItem {
  product_id: string;
  quantity: number;
  special_instructions?: string;
  modifications?: ItemModification[];
}

// ========================================================
// 🚀 KITCHEN DISPLAY SYSTEM
// ========================================================

export interface KitchenOrder {
  order_id: string;
  order_number: string;
  table_number?: string;
  items: KitchenOrderItem[];
  order_time: string;
  estimated_ready_time: string;
  priority: PriorityLevel;
  special_instructions: string[];
  allergy_warnings: string[];
  
  // Progress tracking
  items_completed: number;
  items_total: number;
  completion_percentage: number;
  estimated_time_remaining: number;
}

export interface KitchenOrderItem {
  item_id: string;
  product_name: string;
  quantity: number;
  modifications: ItemModification[];
  special_instructions?: string;
  allergy_warnings: string[];
  station: string; // grill, salad, dessert, etc.
  status: KitchenItemStatus;
  estimated_prep_time: number;
}

// ========================================================
// 🚀 WAIT TIME & CAPACITY MANAGEMENT
// ========================================================

export interface WaitTimeEstimator {
  average_wait_time: number;
  current_wait_time: number;
  queue_length: number;
  peak_hour_adjustment: number;
}

export interface CapacityManager {
  total_tables: number;
  available_tables: number;
  occupied_tables: number;
  reserved_tables: number;
  utilization_percentage: number;
  estimated_next_available: string;
}

// ========================================================
// 🚀 STAFF PERFORMANCE & TRACKING
// ========================================================

export interface ServerPerformance {
  server_id: string;
  server_name: string;
  tables_served: number;
  total_sales: number;
  average_order_value: number;
  customer_satisfaction: number;
  tip_percentage: number;
  service_speed_rating: number;
}

// ========================================================
// 🚀 INVENTORY INTEGRATION
// ========================================================

export interface StockImpact {
  product_id: string;
  product_name: string;
  quantity_needed: number;
  current_stock: number;
  projected_stock_after: number;
  reorder_triggered: boolean;
}

// ========================================================
// 🚀 CUSTOMER EXPERIENCE
// ========================================================

export interface CustomerFeedback {
  id: string;
  sale_id: string;
  customer_id?: string;
  rating: number; // 1-5
  comment?: string;
  service_rating: number;
  food_rating: number;
  speed_rating: number;
  categories: FeedbackCategory[];
  created_at: string;
}

export interface FeedbackCategory {
  category: 'food_quality' | 'service_speed' | 'staff_friendliness' | 'cleanliness' | 'value';
  rating: number;
  comment?: string;
}

// ========================================================
// 🚀 LOYALTY & REWARDS INTEGRATION
// ========================================================

export interface LoyaltyTransaction {
  id: string;
  customer_id: string;
  sale_id: string;
  points_earned: number;
  points_redeemed: number;
  tier_level: 'bronze' | 'silver' | 'gold' | 'platinum';
  reward_applied?: string;
  transaction_type: 'earn' | 'redeem' | 'bonus';
}

// ========================================================
// 🚀 CONSTANTS & CONFIGURATIONS
// ========================================================

export const DEFAULT_TIP_PERCENTAGES = [15, 18, 20, 25];
export const DEFAULT_SERVICE_TIME_LIMITS = {
  GREEN: 15,  // minutes - optimal service
  YELLOW: 30, // minutes - needs attention
  RED: 45     // minutes - immediate action required
};

export const KITCHEN_STATIONS = [
  'grill',
  'salad',
  'dessert',
  'bar',
  'prep',
  'expo'
] as const;

export const PAYMENT_PROCESSING_TIMES = {
  [PaymentType.CASH]: 30,           // seconds
  [PaymentType.CREDIT_CARD]: 45,    // seconds
  [PaymentType.NFC_CARD]: 5,        // seconds
  [PaymentType.MOBILE_WALLET]: 8,   // seconds
  [PaymentType.QR_CODE]: 12,        // seconds
} as const;