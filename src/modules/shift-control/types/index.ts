/**
 * ShiftControl Types
 * Type definitions for operational shift management
 *
 * @module shift-control/types
 * @version 2.2 - Fixed TypeScript any types with proper imports
 */

import type { FeatureId } from '@/config/types';
import type { CashSessionRow } from '@/modules/cash/types';

// ============================================
// CORE TYPES
// ============================================

/**
 * Operational Shift - Main entity
 * Represents a period of business operation
 */
export interface OperationalShift {
  id: string;
  business_id: string;
  opened_by: string;
  opened_at: string; // ISO 8601
  closed_by?: string | null;
  closed_at?: string | null;
  status: 'active' | 'closed';

  // Metadata
  created_at: string;
  updated_at: string;

  // Payment totals (updated in real-time)
  cash_total?: number;
  card_total?: number;
  transfer_total?: number;
  qr_total?: number;

  // Summary stats (computed at close time)
  total_sales?: number;
  labor_cost?: number;
  active_staff_count?: number;

  // Notes
  open_notes?: string;
  close_notes?: string;
}

/**
 * Shift State for UI
 * Tracks the current state of shift operations in the UI
 */
export type ShiftUIState =
  | 'NO_SHIFT'           // No active shift
  | 'VALIDATE_OPEN'      // Checking if can open (achievements validation)
  | 'OPENING_MODAL'      // Opening modal displayed
  | 'SHIFT_ACTIVE'       // Shift is operational
  | 'VALIDATE_CLOSE'     // Checking if can close
  | 'BLOCKED'            // Cannot close (blockers exist)
  | 'CLOSING_MODAL'      // Closing modal displayed
  | 'CLOSING'            // Closing in progress
  | 'SHIFT_CLOSED';      // Shift closed successfully

/**
 * Validation result for close operation
 */
export interface CloseValidationResult {
  canClose: boolean;
  blockers: ValidationBlocker[];
  warnings: ValidationWarning[];
}

export interface ValidationBlocker {
  type:
  | 'cash_session'          // Cash session is open
  | 'open_tables'           // Tables with status 'occupied'
  | 'active_deliveries'     // Deliveries in pending/in_progress/ready status
  | 'pending_orders'        // Orders in pending/in_progress status
  | 'pending_returns';      // Asset rentals with pending returns
  message: string;
  count?: number;
  affectedFeature: FeatureId;
}

export interface ValidationWarning {
  type: 'unchecked_staff' | 'inventory_count' | 'low_cash';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

// ============================================
// FORM DATA TYPES
// ============================================

/**
 * Data for opening a new shift
 */
export interface OpenShiftData {
  opened_by: string; // User ID
  notes?: string;
  initial_cash_amount?: number; // If cash session needs to be opened
}

/**
 * Data for closing a shift
 */
export interface CloseShiftData {
  closed_by: string; // User ID
  notes?: string;
  final_cash_amount?: number; // If cash session needs to be closed
  force_close?: boolean; // Override blockers (admin only)
}

// ============================================
// ALERT TYPES
// ============================================

/**
 * Shift alert from modules
 */
export interface ShiftAlert {
  id: string;
  type: 'cash' | 'staff' | 'inventory' | 'operations';
  severity: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  moduleId: string;
  actionable?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Stock alert from inventory module
 */
export interface StockAlert {
  material_id: string;
  material_name: string;
  current_quantity: number;
  min_quantity: number;
  severity: 'low' | 'medium' | 'high';
}

// ============================================
// HOOKPOINT DATA CONTRACTS
// ============================================

/**
 * Data passed to 'shift-control.indicators' hookpoint
 */
export interface ShiftIndicatorData {
  shiftId: string;
  cashSession: CashSessionRow | null;
  activeStaffCount: number;
  scheduledStaffCount?: number;
  openTablesCount: number;
  activeDeliveriesCount: number;
  pendingOrdersCount: number;
  stockAlerts: StockAlert[];
}

/**
 * Data passed to 'shift-control.quick-actions' hookpoint
 */
export interface ShiftQuickActionData {
  shift: OperationalShift | null;
  uiState: ShiftUIState;
  refreshShift: () => Promise<void>;
}

/**
 * Data passed to 'shift-control.alerts' hookpoint
 */
export interface ShiftAlertData {
  shiftId: string;
  onDismissAlert: (alertId: string) => void;
}

/**
 * Data passed to 'shift-control.close-validation' hookpoint
 */
export interface ShiftCloseValidationData {
  shift: OperationalShift;
  userId: string;
}

// ============================================
// EVENT PAYLOAD TYPES
// ============================================

/**
 * Payload for shift.opened event
 */
export interface ShiftOpenedPayload {
  shift: OperationalShift;
  opened_by_user: {
    id: string;
    name: string;
    role: string;
  };
  notes?: string;
}

/**
 * Payload for shift.closed event
 */
export interface ShiftClosedPayload {
  shift: OperationalShift;
  closed_by_user: {
    id: string;
    name: string;
    role: string;
  };
  summary: {
    total_sales: number;
    labor_cost: number;
    duration_minutes: number;
    staff_count: number;
    transactions_count: number;
  };
  notes?: string;
}

/**
 * Payload for staff.employee.checked_in event
 */
export interface StaffCheckedInPayload {
  employee_id: string;
  employee_name: string;
  shift_id: string | null;
  checked_in_at: string;
}

/**
 * Payload for staff.employee.checked_out event
 */
export interface StaffCheckedOutPayload {
  employee_id: string;
  shift_id: string | null;
  checked_out_at: string;
  hours_worked: number;
}

/**
 * Payload for cash.session.opened event
 */
export interface CashSessionOpenedPayload {
  session: CashSessionRow;
  shift_id?: string;
}

/**
 * Payload for cash.session.closed event
 */
export interface CashSessionClosedPayload {
  session: CashSessionRow;
  discrepancy?: number;
}
