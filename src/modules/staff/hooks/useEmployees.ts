/**
 * useEmployees - Type-safe hook for Employee CRUD operations
 *
 * This hook wraps useCrudOperations with specific Employee types from Supabase,
 * providing full type safety at the domain layer while using the generic
 * infrastructure hook underneath.
 *
 * ARCHITECTURE PATTERN: Hybrid 3-Layer Type Safety
 * - Layer 1 (Infrastructure): useCrudOperations with dynamic tableName
 * - Layer 2 (Domain): useEmployees with specific types ← THIS FILE
 * - Layer 3 (Component): Components get full type safety
 */

import { useCrudOperations } from '@/hooks';
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/supabase/database.types';
import { z } from 'zod';

// ============================================================================
// TYPES - Generated from Supabase
// ============================================================================

export type Employee = Tables<'employees'>;
export type EmployeeInsert = TablesInsert<'employees'>;
export type EmployeeUpdate = TablesUpdate<'employees'>;

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================
//
// ⚠️ CRITICAL NOTE: This hook is DEPRECATED in favor of useEmployeeValidation + EntitySchemas.employeeComplete
//
// The actual Employee forms in the codebase use:
// - src/hooks/useEmployeeValidation.ts (validation hook)
// - src/lib/validation/zod/CommonSchemas.ts → EntitySchemas.employeeComplete (schema)
// - See: src/pages/admin/resources/team/components/EmployeeForm.tsx (usage example)
//
// This hook (useEmployees) wraps useCrudOperations but is NOT actively used in production code.
// It exists as a pattern example but the Staff module uses a different architecture.
//
// EXPECTED FIELDS (per EntitySchemas.employeeComplete):
// Core: employee_id, first_name, last_name, email, phone, position
// Employment: department (enum), hire_date, employment_type (enum), employment_status (enum)
// Compensation: salary, hourly_rate, weekly_hours
// Access: role (enum), home_location_id, can_work_multiple_locations
//
// DB MISMATCH RESOLUTION NEEDED:
// 1. DB has: department (string | null) → Should be: enum NOT NULL
// 2. DB has: employment_status (string | null) → Should be: enum NOT NULL
// 3. DB MISSING: employment_type (full_time/part_time/contractor/temp) → ADD to DB
// 4. DB MISSING: role (admin/manager/supervisor/employee) → ADD to DB
//
// TODO: Create migration to add missing columns and convert string fields to enums
//
export const employeeSchema = z.object({
  // THIS SCHEMA IS FOR useCrudOperations ONLY - NOT USED IN ACTUAL FORMS
  // For type safety with minimal fields
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  position: z.string().min(1),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  hire_date: z.string().nullable().optional(),
  employment_status: z.string().nullable().optional(),
  salary: z.number().nullable().optional(),
  hourly_rate: z.number().nullable().optional(),
  weekly_hours: z.number().nullable().optional(),
  performance_score: z.number().nullable().optional(),
  attendance_rate: z.number().nullable().optional(),
}).passthrough(); // Allow all other DB fields to pass through

export type EmployeeFormData = z.infer<typeof employeeSchema>;

// ============================================================================
// HOOK
// ============================================================================

/**
 * Type-safe hook for Employee CRUD operations
 *
 * @example
 * ```tsx
 * const { items: employees, create, update, remove } = useEmployees();
 *
 * // All operations are fully type-safe
 * await create({
 *   first_name: 'John',
 *   last_name: 'Doe',
 *   email: 'john@example.com',
 *   // TypeScript will autocomplete and validate all fields
 * });
 * ```
 */
export function useEmployees() {
  return useCrudOperations<Employee>({
    tableName: 'employees',
    selectQuery: '*',
    schema: employeeSchema,
    defaultValues: {
      // Only fields that exist in the DB schema
      employment_status: 'active',
      performance_score: 0,
      attendance_rate: 0,
      weekly_hours: 0,
    },
    enableRealtime: true,
    realtimeFilter: 'employment_status=neq.terminated',
  });
}
