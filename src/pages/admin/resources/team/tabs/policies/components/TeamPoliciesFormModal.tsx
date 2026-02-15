/**
 * TEAM POLICIES FORM MODAL
 * 
 * Modal for editing team policies configuration
 * Simplified version - covers main policies
 * 
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  Button,
  FormSection,
  InputField,
  Stack,
  Text,
  SelectField,
  Box,
} from '@/shared/ui';
import { useUpdateTeamPolicies } from '@/modules/team/hooks/useTeamPolicies';
import type { StaffPolicies, OvertimeCalculationPeriod } from '@/modules/team/services';

interface TeamPoliciesFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  policies: StaffPolicies;
}

interface FormData {
  overtime_threshold_hours: number;
  overtime_multiplier: number;
  overtime_calculation_period: OvertimeCalculationPeriod;
  break_duration_minutes: number;
  break_frequency_hours: number;
  shift_swap_advance_notice_hours: number;
  shift_swap_limit_per_month: number;
  attendance_grace_period_minutes: number;
  late_threshold_minutes: number;
  max_late_arrivals_per_month: number;
  max_unexcused_absences_per_month: number;
  performance_review_frequency_days: number;
  onboarding_duration_days: number;
  termination_notice_period_days: number;
}

const PERIOD_OPTIONS = [
  { value: 'daily', label: 'Diario' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quincenal' },
  { value: 'monthly', label: 'Mensual' },
];

export function TeamPoliciesFormModal({
  isOpen,
  onClose,
  policies,
}: TeamPoliciesFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    overtime_threshold_hours: 40,
    overtime_multiplier: 1.5,
    overtime_calculation_period: 'weekly',
    break_duration_minutes: 30,
    break_frequency_hours: 4,
    shift_swap_advance_notice_hours: 24,
    shift_swap_limit_per_month: 4,
    attendance_grace_period_minutes: 5,
    late_threshold_minutes: 15,
    max_late_arrivals_per_month: 3,
    max_unexcused_absences_per_month: 2,
    performance_review_frequency_days: 90,
    onboarding_duration_days: 30,
    termination_notice_period_days: 15,
  });

  const updatePolicies = useUpdateTeamPolicies();

  useEffect(() => {
    if (isOpen && policies) {
      setFormData({
        overtime_threshold_hours: policies.overtime_threshold_hours,
        overtime_multiplier: policies.overtime_multiplier,
        overtime_calculation_period: policies.overtime_calculation_period,
        break_duration_minutes: policies.break_duration_minutes,
        break_frequency_hours: policies.break_frequency_hours,
        shift_swap_advance_notice_hours: policies.shift_swap_advance_notice_hours,
        shift_swap_limit_per_month: policies.shift_swap_limit_per_month,
        attendance_grace_period_minutes: policies.attendance_grace_period_minutes,
        late_threshold_minutes: policies.late_threshold_minutes,
        max_late_arrivals_per_month: policies.max_late_arrivals_per_month,
        max_unexcused_absences_per_month: policies.max_unexcused_absences_per_month,
        performance_review_frequency_days: policies.performance_review_frequency_days,
        onboarding_duration_days: policies.onboarding_duration_days,
        termination_notice_period_days: policies.termination_notice_period_days,
      });
    }
  }, [isOpen, policies]);

  const handleFieldChange = (field: keyof FormData) => (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    setFormData((prev) => ({ ...prev, [field]: numValue }));
  };

  const handleSubmit = () => {
    updatePolicies.mutate(
      { id: policies.id, updates: formData },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open && !updatePolicies.isPending) {
          onClose();
        }
      }}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxWidth="3xl">
          <Dialog.Header>
            <Dialog.Title>Editar Políticas de Personal</Dialog.Title>
            <Dialog.CloseTrigger />
          </Dialog.Header>

          <Dialog.Body>
            <Stack gap={6}>
              <FormSection title="Horas Extras">
                <Stack gap={4}>
                  <InputField
                    label="Umbral (horas) *"
                    type="number"
                    value={formData.overtime_threshold_hours}
                    onChange={(e) =>
                      handleFieldChange('overtime_threshold_hours')(e.target.value)
                    }
                  />
                  <InputField
                    label="Multiplicador *"
                    type="number"
                    step="0.1"
                    value={formData.overtime_multiplier}
                    onChange={(e) =>
                      handleFieldChange('overtime_multiplier')(e.target.value)
                    }
                  />
                  <Box>
                    <SelectField
                      label="Período de Cálculo"
                      options={PERIOD_OPTIONS}
                      value={[formData.overtime_calculation_period]}
                      onValueChange={(details) =>
                        handleFieldChange('overtime_calculation_period')(
                          details.value[0] as OvertimeCalculationPeriod
                        )
                      }
                      required
                      noPortal
                    />
                  </Box>
                </Stack>
              </FormSection>

              <FormSection title="Descansos">
                <Stack gap={4}>
                  <InputField
                    label="Duración (minutos) *"
                    type="number"
                    value={formData.break_duration_minutes}
                    onChange={(e) =>
                      handleFieldChange('break_duration_minutes')(e.target.value)
                    }
                  />
                  <InputField
                    label="Frecuencia (horas) *"
                    type="number"
                    step="0.5"
                    value={formData.break_frequency_hours}
                    onChange={(e) =>
                      handleFieldChange('break_frequency_hours')(e.target.value)
                    }
                  />
                </Stack>
              </FormSection>

              <FormSection title="Gestión de Turnos">
                <Stack gap={4}>
                  <InputField
                    label="Aviso mínimo (horas) *"
                    type="number"
                    value={formData.shift_swap_advance_notice_hours}
                    onChange={(e) =>
                      handleFieldChange('shift_swap_advance_notice_hours')(e.target.value)
                    }
                  />
                  <InputField
                    label="Límite mensual *"
                    type="number"
                    value={formData.shift_swap_limit_per_month}
                    onChange={(e) =>
                      handleFieldChange('shift_swap_limit_per_month')(e.target.value)
                    }
                  />
                </Stack>
              </FormSection>

              <FormSection title="Asistencia">
                <Stack gap={4}>
                  <InputField
                    label="Gracia (minutos) *"
                    type="number"
                    value={formData.attendance_grace_period_minutes}
                    onChange={(e) =>
                      handleFieldChange('attendance_grace_period_minutes')(e.target.value)
                    }
                  />
                  <InputField
                    label="Umbral tardanza (minutos) *"
                    type="number"
                    value={formData.late_threshold_minutes}
                    onChange={(e) =>
                      handleFieldChange('late_threshold_minutes')(e.target.value)
                    }
                  />
                  <InputField
                    label="Tardanzas máx/mes *"
                    type="number"
                    value={formData.max_late_arrivals_per_month}
                    onChange={(e) =>
                      handleFieldChange('max_late_arrivals_per_month')(e.target.value)
                    }
                  />
                  <InputField
                    label="Ausencias máx/mes *"
                    type="number"
                    value={formData.max_unexcused_absences_per_month}
                    onChange={(e) =>
                      handleFieldChange('max_unexcused_absences_per_month')(e.target.value)
                    }
                  />
                </Stack>
              </FormSection>

              <FormSection title="Evaluación y Onboarding">
                <Stack gap={4}>
                  <InputField
                    label="Frecuencia evaluaciones (días) *"
                    type="number"
                    value={formData.performance_review_frequency_days}
                    onChange={(e) =>
                      handleFieldChange('performance_review_frequency_days')(e.target.value)
                    }
                  />
                  <InputField
                    label="Duración onboarding (días) *"
                    type="number"
                    value={formData.onboarding_duration_days}
                    onChange={(e) =>
                      handleFieldChange('onboarding_duration_days')(e.target.value)
                    }
                  />
                  <InputField
                    label="Aviso de término (días) *"
                    type="number"
                    value={formData.termination_notice_period_days}
                    onChange={(e) =>
                      handleFieldChange('termination_notice_period_days')(e.target.value)
                    }
                  />
                </Stack>
              </FormSection>
            </Stack>
          </Dialog.Body>

          <Dialog.Footer>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={updatePolicies.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              loading={updatePolicies.isPending}
              colorScheme="blue"
            >
              Guardar Cambios
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
