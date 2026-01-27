/**
 * Staff Form Hook
 * Follows Material Form Pattern - Business logic separated from UI
 *
 * Created: 2025-02-01
 * Pattern: Material Form Pattern (established by useMaterialForm)
 */

import { useState, useMemo, useCallback } from 'react';
import { useStaffValidation } from '@/modules/team/hooks';
import type { StaffFormData } from '@/lib/validation/zod/CommonSchemas';

export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  position: string;
  department?: string;
  hire_date: string;
  salary?: number;
  employment_type: 'full_time' | 'part_time' | 'contractor';
  status: 'active' | 'inactive' | 'on_leave';
  skills?: string[];
}

interface UseStaffFormOptions {
  staffMember?: TeamMember;
  existingStaff?: TeamMember[];
  onSuccess?: () => void;
  onSubmit: (data: StaffFormData) => Promise<void>;
}

interface StaffMetrics {
  hasCompleteProfile: boolean;
  profileCompleteness: number; // 0-100%
  tenureMonths: number;
  tenureCategory: 'new' | 'junior' | 'senior' | 'veteran';
  hasSalaryInfo: boolean;
  hasSkills: boolean;
  employmentRisk: 'low' | 'medium' | 'high';
}

export function useStaffForm({
  staffMember,
  existingStaff = [],
  onSuccess,
  onSubmit
}: UseStaffFormOptions) {

  // ===== MODO =====
  const isEditMode = !!staffMember;

  // ===== LOADING STATES =====
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ===== SUCCESS STATES =====
  const [validationPassed, setValidationPassed] = useState(false);
  const [staffCreated, setStaffCreated] = useState(false);

  // ===== VALIDATION HOOK =====
  const {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateForm
  } = useStaffValidation(
    {
      name: staffMember?.name || '',
      email: staffMember?.email || '',
      phone: staffMember?.phone || '',
      position: staffMember?.position || '',
      department: staffMember?.department || '',
      hire_date: staffMember?.hire_date || new Date().toISOString().split('T')[0],
      salary: staffMember?.salary || 0,
      employment_type: staffMember?.employment_type || 'full_time',
      status: staffMember?.status || 'active',
      skills: staffMember?.skills || []
    },
    existingStaff,
    staffMember?.id
  );

  const { watch, handleSubmit } = form;
  const formData = watch();

  // ===== STAFF METRICS =====
  const staffMetrics: StaffMetrics = useMemo(() => {
    const { name, email, phone, position, department, hire_date, salary, skills, status } = formData;

    // Calculate profile completeness
    let completeness = 0;
    if (name) completeness += 20;
    if (email) completeness += 15;
    if (phone) completeness += 10;
    if (position) completeness += 20;
    if (department) completeness += 10;
    if (hire_date) completeness += 10;
    if (salary && salary > 0) completeness += 10;
    if (skills && skills.length > 0) completeness += 5;

    const hasCompleteProfile = completeness >= 80;

    // Calculate tenure
    const today = new Date();
    const hireDate = new Date(hire_date || today);
    const tenureMonths = Math.max(0, Math.floor((today.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));

    const tenureCategory: 'new' | 'junior' | 'senior' | 'veteran' =
      tenureMonths < 3 ? 'new' :
      tenureMonths < 12 ? 'junior' :
      tenureMonths < 36 ? 'senior' :
      'veteran';

    const hasSalaryInfo = !!(salary && salary > 0);
    const hasSkills = !!(skills && skills.length > 0);

    // Calculate employment risk
    const employmentRisk: 'low' | 'medium' | 'high' =
      status === 'inactive' || status === 'on_leave' ? 'high' :
      !hasCompleteProfile || !hasSalaryInfo ? 'medium' :
      'low';

    return {
      hasCompleteProfile,
      profileCompleteness: completeness,
      tenureMonths,
      tenureCategory,
      hasSalaryInfo,
      hasSkills,
      employmentRisk
    };
  }, [formData]);

  // ===== COMPUTED VALUES =====
  const modalTitle = useMemo(() => {
    return isEditMode ? 'Editar Empleado' : 'Nuevo Empleado';
  }, [isEditMode]);

  const submitButtonContent = useMemo(() => {
    if (isValidating) return 'Validando...';
    if (isSaving) return isEditMode ? 'Actualizando...' : 'Creando...';
    if (staffCreated) return '✓ Guardado';
    return isEditMode ? 'Actualizar Empleado' : 'Crear Empleado';
  }, [isValidating, isSaving, staffCreated, isEditMode]);

  const formStatusBadge = useMemo(() => {
    if (validationState.hasErrors) return { text: 'Con errores', color: 'red' as const };
    if (validationState.hasWarnings) return { text: 'Con advertencias', color: 'yellow' as const };
    if (!formData.name || !formData.position) {
      return { text: 'Incompleto', color: 'gray' as const };
    }
    return { text: 'Listo para guardar', color: 'green' as const };
  }, [validationState, formData.name, formData.position]);

  const operationProgress = useMemo(() => {
    if (staffCreated) return 100;
    if (isSaving) return 66;
    if (validationPassed) return 33;
    return 0;
  }, [validationPassed, isSaving, staffCreated]);

  const tenureBadge = useMemo(() => {
    const { tenureCategory } = staffMetrics;

    if (tenureCategory === 'veteran') {
      return { text: 'Veterano', color: 'purple' as const };
    }
    if (tenureCategory === 'senior') {
      return { text: 'Senior', color: 'blue' as const };
    }
    if (tenureCategory === 'junior') {
      return { text: 'Junior', color: 'green' as const };
    }
    return { text: 'Nuevo', color: 'yellow' as const };
  }, [staffMetrics]);

  const statusBadge = useMemo(() => {
    const status = formData.status;

    if (status === 'active') {
      return { text: 'Activo', color: 'green' as const };
    }
    if (status === 'on_leave') {
      return { text: 'En Licencia', color: 'yellow' as const };
    }
    return { text: 'Inactivo', color: 'gray' as const };
  }, [formData.status]);

  // ===== SUBMIT HANDLER =====
  const handleFormSubmit = useCallback(
    handleSubmit(async (data) => {
      try {
        // Step 1: Validate
        setIsValidating(true);
        const isValid = await validateForm();
        setIsValidating(false);

        if (!isValid) {
          setValidationPassed(false);
          return;
        }

        setValidationPassed(true);

        // Step 2: Save
        setIsSaving(true);
        await onSubmit(data);
        setIsSaving(false);

        // Step 3: Success
        setStaffCreated(true);

        // Reset states after delay
        setTimeout(() => {
          setValidationPassed(false);
          setStaffCreated(false);
          onSuccess?.();
        }, 1500);

      } catch (error) {
        setIsValidating(false);
        setIsSaving(false);
        setValidationPassed(false);
        throw error;
      }
    }),
    [handleSubmit, validateForm, onSubmit, onSuccess]
  );

  // ===== RETURN API =====
  return {
    // Form
    form,
    formData,
    isEditMode,

    // Validation
    fieldErrors,
    fieldWarnings,
    validationState,

    // Staff metrics
    staffMetrics,

    // Loading states
    isValidating,
    isSaving,

    // Success states
    validationPassed,
    staffCreated,

    // Computed values
    modalTitle,
    submitButtonContent,
    formStatusBadge,
    operationProgress,
    tenureBadge,
    statusBadge,

    // Handlers
    handleSubmit: handleFormSubmit
  };
}
