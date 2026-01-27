/**
 * Shift Validation Hook (Scheduling Module)
 * Uses centralized validation system with Zod + React Hook Form
 *
 * FEATURES:
 * - Time validation (start/end times)
 * - Shift overlap detection
 * - Employee availability validation
 * - Date validation
 */

import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntitySchemas, type ShiftFormData } from '@/lib/validation/zod/CommonSchemas';

interface ValidationOptions {
  enableRealTime?: boolean;
  checkOverlaps?: boolean;
}

interface UseShiftValidationResult {
  form: UseFormReturn<ShiftFormData>;
  fieldErrors: Record<string, string | undefined>;
  fieldWarnings: Record<string, string>;
  validationState: {
    hasErrors: boolean;
    hasWarnings: boolean;
    errorCount: number;
    warningCount: number;
  };
  validateField: (field: keyof ShiftFormData, value: any) => void;
  validateForm: () => Promise<boolean>;
  clearValidation: () => void;

  // Business logic validation
  validateTimeRange: (startTime: string, endTime: string) => boolean;
  validateShiftOverlap: (employeeId: string, date: string, startTime: string, endTime: string) => boolean;
  calculateShiftDuration: (startTime: string, endTime: string) => number;
}

interface Shift {
  id?: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  [key: string]: any;
}

export function useShiftValidation(
  initialData: Partial<ShiftFormData> = {},
  existingShifts: Shift[] = [],
  currentShiftId?: string,
  options: ValidationOptions = {}
): UseShiftValidationResult {

  const { enableRealTime = true, checkOverlaps = true } = options;

  const form = useForm<ShiftFormData>({
    resolver: zodResolver(EntitySchemas.shift),
    defaultValues: {
      employee_id: '',
      start_time: '09:00',
      end_time: '17:00',
      date: new Date().toISOString().split('T')[0],
      position: '',
      location_id: undefined,
      notes: '',
      status: 'scheduled',
      ...initialData
    },
    mode: enableRealTime ? 'onChange' : 'onSubmit'
  });

  // ========================================================================
  // BUSINESS LOGIC VALIDATORS
  // ========================================================================

  /**
   * Validate time range (end must be after start)
   */
  const validateTimeRange = useCallback((startTime: string, endTime: string): boolean => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return endMinutes > startMinutes;
  }, []);

  /**
   * Calculate shift duration in hours
   */
  const calculateShiftDuration = useCallback((startTime: string, endTime: string): number => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return (endMinutes - startMinutes) / 60;
  }, []);

  /**
   * Validate shift doesn't overlap with existing shifts
   */
  const validateShiftOverlap = useCallback((
    employeeId: string,
    date: string,
    startTime: string,
    endTime: string
  ): boolean => {
    if (!checkOverlaps) return true;

    const [newStartHour, newStartMin] = startTime.split(':').map(Number);
    const [newEndHour, newEndMin] = endTime.split(':').map(Number);
    const newStartMinutes = newStartHour * 60 + newStartMin;
    const newEndMinutes = newEndHour * 60 + newEndMin;

    const overlapping = existingShifts.find(shift => {
      if (shift.id === currentShiftId) return false; // Skip current shift
      if (shift.employee_id !== employeeId) return false;
      if (shift.date !== date) return false;

      const [existingStartHour, existingStartMin] = shift.start_time.split(':').map(Number);
      const [existingEndHour, existingEndMin] = shift.end_time.split(':').map(Number);
      const existingStartMinutes = existingStartHour * 60 + existingStartMin;
      const existingEndMinutes = existingEndHour * 60 + existingEndMin;

      // Check overlap
      return (
        (newStartMinutes >= existingStartMinutes && newStartMinutes < existingEndMinutes) ||
        (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) ||
        (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes)
      );
    });

    return !overlapping;
  }, [existingShifts, currentShiftId, checkOverlaps]);

  // ========================================================================
  // FIELD ERRORS & WARNINGS
  // ========================================================================

  const fieldErrors = useMemo(() => {
    const errors: Record<string, string | undefined> = {};
    const formErrors = form.formState.errors;

    Object.keys(formErrors).forEach(key => {
      const error = formErrors[key as keyof ShiftFormData];
      if (error) {
        errors[key] = error.message as string;
      }
    });

    return errors;
  }, [form.formState.errors]);

  const fieldWarnings = useMemo(() => {
    const warnings: Record<string, string> = {};
    const formData = form.watch();

    // Warning: Shift muy largo
    if (formData.start_time && formData.end_time) {
      const duration = calculateShiftDuration(formData.start_time, formData.end_time);

      if (duration > 12) {
        warnings.end_time = 'Turno muy largo (más de 12 horas)';
      } else if (duration < 2) {
        warnings.end_time = 'Turno muy corto (menos de 2 horas)';
      }
    }

    // Warning: Shift overlap
    if (checkOverlaps && formData.employee_id && formData.date && formData.start_time && formData.end_time) {
      if (!validateShiftOverlap(formData.employee_id, formData.date, formData.start_time, formData.end_time)) {
        warnings.start_time = 'Este turno se solapa con otro turno existente del empleado';
      }
    }

    // Warning: Shift fuera de horario normal
    if (formData.start_time) {
      const [hour] = formData.start_time.split(':').map(Number);

      if (hour < 6 || hour > 22) {
        warnings.start_time = 'Horario fuera del rango normal (6:00 - 22:00)';
      }
    }

    // Warning: Shift cancelado
    if (formData.status === 'cancelled') {
      warnings.status = 'Este turno está cancelado';
    }

    return warnings;
  }, [calculateShiftDuration, validateShiftOverlap, checkOverlaps]);

  const validationState = useMemo(() => ({
    hasErrors: Object.keys(fieldErrors).length > 0,
    hasWarnings: Object.keys(fieldWarnings).length > 0,
    errorCount: Object.keys(fieldErrors).length,
    warningCount: Object.keys(fieldWarnings).length
  }), [fieldErrors, fieldWarnings]);

  // ========================================================================
  // VALIDATION METHODS
  // ========================================================================

  const validateField = useCallback((field: keyof ShiftFormData, value: any) => {
    form.setValue(field, value, { shouldValidate: true });
  }, [form]);

  const validateForm = useCallback(async (): Promise<boolean> => {
    // First run Zod validation
    const isZodValid = await form.trigger();

    if (!isZodValid) {
      return false;
    }

    const formData = form.getValues();

    // Business logic: Check time range
    if (!validateTimeRange(formData.start_time, formData.end_time)) {
      form.setError('end_time', {
        type: 'custom',
        message: 'La hora de finalización debe ser posterior a la de inicio'
      });
      return false;
    }

    // Business logic: Check shift overlap
    if (checkOverlaps) {
      if (!validateShiftOverlap(formData.employee_id, formData.date, formData.start_time, formData.end_time)) {
        form.setError('start_time', {
          type: 'custom',
          message: 'Este turno se solapa con otro turno existente del empleado'
        });
        return false;
      }
    }

    return true;
  }, [form, validateTimeRange, validateShiftOverlap, checkOverlaps]);

  const clearValidation = useCallback(() => {
    form.clearErrors();
  }, [form]);

  // ========================================================================
  // RETURN
  // ========================================================================

  return {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateField,
    validateForm,
    clearValidation,

    // Business logic validators
    validateTimeRange,
    validateShiftOverlap,
    calculateShiftDuration
  };
}

/**
 * HOOK FEATURES SUMMARY:
 *
 * ✅ Zod Schema Validation: Uses EntitySchemas.shift
 * ✅ React Hook Form: Full integration with RHF
 * ✅ Time Range Validation: End time must be after start time
 * ✅ Shift Overlap Detection: Prevents double-booking employees
 * ✅ Duration Calculation: Calculate shift hours
 * ✅ Field Warnings: Long shifts, overlaps, unusual hours
 * ✅ Business Logic: Time validation, overlap detection
 *
 * USAGE EXAMPLE:
 *
 * const existingShifts = [
 *   { id: '1', employee_id: 'emp-1', date: '2025-01-31', start_time: '09:00', end_time: '17:00' },
 *   { id: '2', employee_id: 'emp-2', date: '2025-01-31', start_time: '14:00', end_time: '22:00' }
 * ];
 *
 * const {
 *   form,
 *   fieldErrors,
 *   fieldWarnings,
 *   validateForm,
 *   validateShiftOverlap
 * } = useShiftValidation({}, existingShifts);
 *
 * // Submit handler
 * const handleSubmit = async () => {
 *   const isValid = await validateForm();
 *   if (isValid) {
 *     const data = form.getValues();
 *     await createShift(data);
 *   }
 * };
 */
