/**
 * TeamMember Validation Hook
 * Uses centralized validation system with Zod + React Hook Form
 * Pattern: Same as useMaterialValidation.ts
 */

import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntitySchemas, type TeamMemberCompleteFormData } from '@/lib/validation/zod/CommonSchemas';

interface ValidationOptions {
  enableRealTime?: boolean;
  debounceMs?: number;
}

interface UseTeamMemberValidationResult {
  form: UseFormReturn<TeamMemberCompleteFormData>;
  fieldErrors: Record<string, string | undefined>;
  fieldWarnings: Record<string, string>;
  validationState: {
    hasErrors: boolean;
    hasWarnings: boolean;
    errorCount: number;
    warningCount: number;
  };
  validateField: (field: keyof TeamMemberCompleteFormData, value: any) => void;
  validateForm: () => Promise<boolean>;
  clearValidation: () => void;
  // Business logic validation
  checkEmailExists: (email: string) => string | null;
  checkTeamMemberIdExists: (employeeId: string) => string | null;
}

interface TeamMember {
  id?: string;
  employee_id: string;
  email: string;
  [key: string]: any;
}

export function useTeamMemberValidation(
  initialData: Partial<TeamMemberCompleteFormData> = {},
  existingTeamMembers: TeamMember[] = [],
  currentTeamMemberId?: string, // For edit mode
  options: ValidationOptions = {}
): UseTeamMemberValidationResult {

  const { enableRealTime = true, debounceMs = 300 } = options;

  // React Hook Form with Zod validation
  const form = useForm<TeamMemberCompleteFormData>({
    resolver: zodResolver(EntitySchemas.teamMemberComplete),
    defaultValues: {
      employee_id: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      position: '',
      department: 'service',
      hire_date: new Date().toISOString().split('T')[0],
      employment_type: 'full_time',
      employment_status: 'active', // Default value handled here, not in schema
      role: 'employee', // Default value handled here, not in schema
      can_work_multiple_locations: false, // Default value handled here, not in schema
      ...initialData
    },
    mode: enableRealTime ? 'onChange' : 'onSubmit'
  });

  // Business logic validators (not handled by Zod)
  const checkEmailExists = useCallback((email: string): string | null => {
    if (!email?.trim()) return null;

    // Skip check if editing current teamMember
    const isDuplicate = existingTeamMembers.some(emp =>
      emp.email.toLowerCase().trim() === email.toLowerCase().trim() &&
      emp.id !== currentTeamMemberId
    );

    return isDuplicate ? 'Ya existe un empleado con este email' : null;
  }, [existingTeamMembers, currentTeamMemberId]);

  const checkTeamMemberIdExists = useCallback((employeeId: string): string | null => {
    if (!employeeId?.trim()) return null;

    // Skip check if editing current teamMember
    const isDuplicate = existingTeamMembers.some(emp =>
      emp.employee_id.toLowerCase().trim() === employeeId.toLowerCase().trim() &&
      emp.id !== currentTeamMemberId
    );

    return isDuplicate ? 'Ya existe un empleado con este ID' : null;
  }, [existingTeamMembers, currentTeamMemberId]);

  // Custom field validation with business rules
  const validateField = useCallback((field: keyof TeamMemberCompleteFormData, value: any) => {
    // Clear previous custom errors
    form.clearErrors(field);

    // Run Zod validation first
    form.trigger(field);

    // Apply business logic validation
    if (field === 'email' && typeof value === 'string') {
      const duplicateError = checkEmailExists(value);
      if (duplicateError) {
        form.setError('email', { type: 'custom', message: duplicateError });
      }
    }

    if (field === 'employee_id' && typeof value === 'string') {
      const duplicateError = checkTeamMemberIdExists(value);
      if (duplicateError) {
        form.setError('employee_id', { type: 'custom', message: duplicateError });
      }
    }
  }, [form, checkEmailExists, checkTeamMemberIdExists]);

  // Enhanced form validation
  const validateForm = useCallback(async (): Promise<boolean> => {
    // Run Zod validation
    const isZodValid = await form.trigger();

    // Run business logic validation
    const formData = form.getValues();
    const emailError = checkEmailExists(formData.email);
    const employeeIdError = checkTeamMemberIdExists(formData.employee_id);

    if (emailError) {
      form.setError('email', { type: 'custom', message: emailError });
      return false;
    }

    if (employeeIdError) {
      form.setError('employee_id', { type: 'custom', message: employeeIdError });
      return false;
    }

    return isZodValid;
  }, [form, checkEmailExists, checkTeamMemberIdExists]);

  // Clear validation state
  const clearValidation = useCallback(() => {
    form.clearErrors();
  }, [form]);

  // Field errors from React Hook Form
  const fieldErrors = useMemo(() => {
    const errors: Record<string, string | undefined> = {};
    Object.entries(form.formState.errors).forEach(([field, error]) => {
      if (error?.message) {
        errors[field] = error.message;
      }
    });
    return errors;
  }, [form.formState.errors]);

  // Field warnings (business logic hints)
  const fieldWarnings = useMemo(() => {
    const warnings: Record<string, string> = {};
    const formData = form.watch();

    // Warning for high salary
    if (formData.salary && formData.salary > 500000) {
      warnings.salary = 'Salario muy alto, verifica el valor';
    }

    // Warning for high hourly rate
    if (formData.hourly_rate && formData.hourly_rate > 10000) {
      warnings.hourly_rate = 'Tarifa horaria muy alta, verifica el valor';
    }

    // Warning for excessive weekly hours
    if (formData.weekly_hours && formData.weekly_hours > 60) {
      warnings.weekly_hours = 'Más de 60 horas semanales puede afectar el rendimiento';
    }

    return warnings;
  }, []);

  // Validation state summary
  const validationState = useMemo(() => ({
    hasErrors: Object.keys(fieldErrors).length > 0,
    hasWarnings: Object.keys(fieldWarnings).length > 0,
    errorCount: Object.keys(fieldErrors).length,
    warningCount: Object.keys(fieldWarnings).length
  }), [fieldErrors, fieldWarnings]);

  return {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateField,
    validateForm,
    clearValidation,
    checkEmailExists,
    checkTeamMemberIdExists
  };
}

export default useTeamMemberValidation;
