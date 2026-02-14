// TeamMember Form - MIGRATED to Zod + React Hook Form validation
import { useEffect, useState } from 'react';
import {
  VStack,
  HStack,
  Text,
  Button,
  CardWrapper,
  Input,
  Modal,
  Alert,
  Icon,
  SelectField,
  createListCollection,
  Field,
} from '../../../../../shared/ui';
import { XMarkIcon, ExclamationTriangleIcon, ShieldCheckIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useCreateTeam, useUpdateTeam } from '@/modules/team/hooks';
import { useTeamMemberValidation } from '@/modules/team/hooks';
import type { TeamMember } from '../types';
import type { TeamMemberCompleteFormData } from '@/lib/validation/zod/CommonSchemas';

interface TeamMemberFormProps {
  // teamMember can be a Partial if we are creating, 
  // but typically for editing it should correspond to our TeamMember Definition from types
  // However, the validation hook expects certain fields
  teamMember?: Partial<TeamMember> | undefined;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (teamMember: TeamMember) => void;
}

export function TeamMemberForm({ teamMember, isOpen, onClose, onSuccess }: TeamMemberFormProps) {
  const createMutation = useCreateTeam();
  const updateMutation = useUpdateTeam();
  const hasLinkedUser = !!(teamMember as any)?.auth_user_id;
  const loading = createMutation.isPending || updateMutation.isPending;

  const isEditing = !!teamMember;

  // 🔥 NEW: Use validation hook with Zod + React Hook Form
  const {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateForm
  } = useTeamMemberValidation(
    {
      employee_id: teamMember?.employee_id || '',
      first_name: teamMember?.first_name || '',
      last_name: teamMember?.last_name || '',
      email: teamMember?.email || '',
      phone: teamMember?.phone || '',
      position: teamMember?.position || '',
      department: (teamMember?.department || 'service') as 'kitchen' | 'service' | 'admin' | 'cleaning' | 'management',
      hire_date: teamMember?.hire_date || new Date().toISOString().split('T')[0],
      employment_type: (teamMember?.employment_type || 'full_time') as 'full_time' | 'part_time' | 'contractor' | 'temp',
      employment_status: 'active',
      salary: teamMember?.salary,
      hourly_rate: teamMember?.hourly_rate,
      weekly_hours: 40,
      // map to TeamMember Definition role if needed, simplified for form
      role: (teamMember?.role as any) || 'employee',
      can_work_multiple_locations: false
    },
    [], // We don't have the full list here easily, but validation hook handles empty array gracefully for duplicates if needed, or we could fetch it.
    teamMember?.id
  );

  const { register, handleSubmit: createSubmitHandler, reset, formState: { errors } } = form;

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const handleSubmit = createSubmitHandler(async (data: TeamMemberCompleteFormData) => {
    // Additional validation
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      // Map form data to API format
      const employeeData = {
        employee_id: data.employee_id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || '',
        position: data.position,
        department: data.department,
        hire_date: data.hire_date,
        employment_type: data.employment_type,
        employment_status: data.employment_status,
        salary: data.salary || 0,
        hourly_rate: data.hourly_rate || 0,
        weekly_hours: data.weekly_hours || 40,
        role: data.role,
        performance_score: 85,
        attendance_rate: 95,
        completed_tasks: 0,
        available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        permissions: [] as string[],
        home_location_id: data.home_location_id,
        can_work_multiple_locations: data.can_work_multiple_locations
      };

      let result: TeamMember | null = null;

      if (isEditing && teamMember?.id) {
        // We cast as any because the updated type might have slight differences, 
        // but useUpdateTeam handles the transform internally
        const updated = await updateMutation.mutateAsync({ id: teamMember.id, data: employeeData as any });
        // The mutation returns the updated object. We might need to cast it to match TeamMember type if needed for onSuccess
        // Assuming updated structure matches
        result = updated as unknown as TeamMember;
      } else {
        result = await createMutation.mutateAsync(employeeData as any) as unknown as TeamMember;
      }

      if (result) {
        onSuccess?.(result);
        onClose();
        reset();
      }
    } catch (error) {
      form.setError('root', {
        type: 'manual',
        message: error instanceof Error ? error.message : 'Error al guardar empleado'
      });
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>
            {isEditing ? 'Editar Empleado' : 'Nuevo Empleado'}
          </Modal.Title>
          <Modal.CloseTrigger>
            <Icon icon={XMarkIcon} size="sm" />
          </Modal.CloseTrigger>
        </Modal.Header>

        <Modal.Body>
          <form onSubmit={handleSubmit} id="teamMember-form">
            <VStack gap="4" align="stretch">
              {/* Root Error */}
              {errors.root && (
                <Alert status="error">
                  <Alert.Indicator />
                  <Alert.Title>Error</Alert.Title>
                  <Alert.Description>{errors.root.message}</Alert.Description>
                </Alert>
              )}

              {/* Validation Summary */}
              {validationState.hasErrors && (
                <Alert status="error">
                  <Alert.Indicator />
                  <Alert.Title>Errores de Validación</Alert.Title>
                  <Alert.Description>
                    Hay {validationState.errorCount} error(es) en el formulario. Corrige los campos marcados.
                  </Alert.Description>
                </Alert>
              )}

              {/* Personal Information */}
              <CardWrapper variant="outline">
                <CardWrapper.Body>
                  <VStack gap="4" align="stretch">
                    <Text fontWeight="semibold">Información Personal</Text>

                    {/* TeamMember ID */}
                    <Field.Root invalid={!!fieldErrors.employee_id}>
                      <Field.Label>ID Empleado *</Field.Label>
                      <Input
                        {...register('employee_id')}
                        placeholder="EMP001"
                      />
                      {fieldErrors.employee_id && (
                        <Field.ErrorText>{fieldErrors.employee_id}</Field.ErrorText>
                      )}
                      <Field.HelperText>Identificador único del empleado</Field.HelperText>
                    </Field.Root>

                    <HStack gap="4">
                      {/* First Name */}
                      <Field.Root invalid={!!fieldErrors.first_name} flex="1">
                        <Field.Label>Nombre *</Field.Label>
                        <Input
                          {...register('first_name')}
                          placeholder="Juan"
                        />
                        {fieldErrors.first_name && (
                          <Field.ErrorText>{fieldErrors.first_name}</Field.ErrorText>
                        )}
                      </Field.Root>

                      {/* Last Name */}
                      <Field.Root invalid={!!fieldErrors.last_name} flex="1">
                        <Field.Label>Apellido *</Field.Label>
                        <Input
                          {...register('last_name')}
                          placeholder="Pérez"
                        />
                        {fieldErrors.last_name && (
                          <Field.ErrorText>{fieldErrors.last_name}</Field.ErrorText>
                        )}
                      </Field.Root>
                    </HStack>

                    {/* Email */}
                    <Field.Root invalid={!!fieldErrors.email}>
                      <Field.Label>Email *</Field.Label>
                      <Input
                        type="email"
                        {...register('email')}
                        placeholder="email@ejemplo.com"
                      />
                      {fieldErrors.email && (
                        <Field.ErrorText>{fieldErrors.email}</Field.ErrorText>
                      )}
                    </Field.Root>

                    {/* Phone */}
                    <Field.Root invalid={!!fieldErrors.phone}>
                      <Field.Label>Teléfono</Field.Label>
                      <Input
                        type="tel"
                        {...register('phone')}
                        placeholder="+54 11 1234-5678"
                      />
                      {fieldErrors.phone && (
                        <Field.ErrorText>{fieldErrors.phone}</Field.ErrorText>
                      )}
                    </Field.Root>
                  </VStack>
                </CardWrapper.Body>
              </CardWrapper>

              {/* Job Information */}
              <CardWrapper variant="outline">
                <CardWrapper.Body>
                  <VStack gap="4" align="stretch">
                    <Text fontWeight="semibold">Información Laboral</Text>

                    <HStack gap="4">
                      {/* Position */}
                      <Field.Root invalid={!!fieldErrors.position} flex="1">
                        <Field.Label>Posición *</Field.Label>
                        <Input
                          {...register('position')}
                          placeholder="Ej: Mesero, Cocinero, Gerente"
                        />
                        {fieldErrors.position && (
                          <Field.ErrorText>{fieldErrors.position}</Field.ErrorText>
                        )}
                      </Field.Root>

                      {/* Department */}
                      <SelectField
                        label="Departamento *"
                        placeholder="Seleccionar..."
                        error={fieldErrors.department}
                        collection={createListCollection({
                          items: [
                            { value: 'kitchen', label: 'Cocina' },
                            { value: 'service', label: 'Servicio' },
                            { value: 'admin', label: 'Administración' },
                            { value: 'cleaning', label: 'Limpieza' },
                            { value: 'management', label: 'Gerencia' },
                          ]
                        })}
                        {...register('department')}
                      />
                    </HStack>

                    <HStack gap="4">
                      {/* Hire Date */}
                      <Field.Root invalid={!!fieldErrors.hire_date} flex="1">
                        <Field.Label>Fecha de Contratación *</Field.Label>
                        <Input
                          {...register('hire_date')}
                        />
                        {fieldErrors.hire_date && (
                          <Field.ErrorText>{fieldErrors.hire_date}</Field.ErrorText>
                        )}
                      </Field.Root>

                      {/* Employment Type */}
                      <SelectField
                        label="Tipo de Empleo *"
                        placeholder="Seleccionar..."
                        error={fieldErrors.employment_type}
                        collection={createListCollection({
                          items: [
                            { value: 'full_time', label: 'Tiempo Completo' },
                            { value: 'part_time', label: 'Tiempo Parcial' },
                            { value: 'contractor', label: 'Contratista' },
                            { value: 'temp', label: 'Temporal' },
                          ]
                        })}
                        {...register('employment_type')}
                      />
                    </HStack>

                    <HStack gap="4">
                      {/* Salary */}
                      <Field.Root invalid={!!fieldErrors.salary} flex="1">
                        <Field.Label>Salario Mensual</Field.Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register('salary', { valueAsNumber: true })}
                          placeholder="0.00"
                        />
                        {fieldErrors.salary && (
                          <Field.ErrorText>{fieldErrors.salary}</Field.ErrorText>
                        )}
                        {fieldWarnings.salary && (
                          <HStack gap="1" color="orange.500" fontSize="sm">
                            <Icon icon={ExclamationTriangleIcon} size="xs" />
                            <Text>{fieldWarnings.salary}</Text>
                          </HStack>
                        )}
                      </Field.Root>

                      {/* Weekly Hours */}
                      <Field.Root invalid={!!fieldErrors.weekly_hours} flex="1">
                        <Field.Label>Horas Semanales</Field.Label>
                        <Input
                          type="number"
                          {...register('weekly_hours', { valueAsNumber: true })}
                          placeholder="40"
                        />
                        {fieldErrors.weekly_hours && (
                          <Field.ErrorText>{fieldErrors.weekly_hours}</Field.ErrorText>
                        )}
                        {fieldWarnings.weekly_hours && (
                          <HStack gap="1" color="orange.500" fontSize="sm">
                            <Icon icon={ExclamationTriangleIcon} size="xs" />
                            <Text>{fieldWarnings.weekly_hours}</Text>
                          </HStack>
                        )}
                      </Field.Root>
                    </HStack>

                    {/* Hourly Rate */}
                    <Field.Root invalid={!!fieldErrors.hourly_rate}>
                      <Field.Label>Tarifa Horaria</Field.Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register('hourly_rate', { valueAsNumber: true })}
                        placeholder="0.00"
                      />
                      {fieldErrors.hourly_rate && (
                        <Field.ErrorText>{fieldErrors.hourly_rate}</Field.ErrorText>
                      )}
                      {fieldWarnings.hourly_rate && (
                        <HStack gap="1" color="orange.500" fontSize="sm">
                          <Icon icon={ExclamationTriangleIcon} size="xs" />
                          <Text>{fieldWarnings.hourly_rate}</Text>
                        </HStack>
                      )}
                    </Field.Root>
                  </VStack>
                </CardWrapper.Body>
              </CardWrapper>
              {/* Panel Access Info */}
              <CardWrapper variant="outline">
                <CardWrapper.Body>
                  <VStack gap="3" align="stretch">
                    <HStack gap="2">
                      <Icon icon={ShieldCheckIcon} size="sm" color="blue.500" />
                      <Text fontWeight="semibold">Acceso al Panel</Text>
                    </HStack>
                    {hasLinkedUser ? (
                      <Alert status="success">
                        <Alert.Indicator />
                        <VStack align="stretch" gap="2" width="full">
                          <Alert.Description>
                            Este empleado tiene cuenta de acceso al panel vinculada.
                          </Alert.Description>
                          <HStack gap="2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Navigate to Users page with userId filter
                                const userId = (teamMember as any)?.auth_user_id;
                                if (userId) {
                                  window.location.href = `/admin/core/settings/users?userId=${userId}`;
                                }
                              }}
                            >
                              Ver cuenta de usuario
                            </Button>
                          </HStack>
                        </VStack>
                      </Alert>
                    ) : (
                      <Alert status="info" variant="subtle">
                        <Alert.Indicator />
                        <VStack align="stretch" gap="2" width="full">
                          <Alert.Description>
                            Este empleado no tiene acceso al panel administrativo.
                          </Alert.Description>
                          <Button
                            size="sm"
                            colorPalette="blue"
                            onClick={() => {
                              // Navigate to Users page with email pre-filled
                              window.location.href = `/admin/core/settings/users?invite=true&email=${encodeURIComponent(teamMember?.email || '')}`;
                            }}
                            disabled={!teamMember?.email}
                          >
                            <Icon icon={PlusIcon} size="xs" />
                            Dar acceso al panel
                          </Button>
                          {!teamMember?.email && (
                            <Text fontSize="sm" color="fg.muted">
                              Agrega un email al empleado para poder otorgarle acceso
                            </Text>
                          )}
                        </VStack>
                      </Alert>
                    )}
                  </VStack>
                </CardWrapper.Body>
              </CardWrapper>
            </VStack>
          </form>
        </Modal.Body>

        <Modal.Footer>
          <HStack gap="3" justify="end">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              {...({ form: "teamMember-form" } as any)}
              colorPalette="blue"
              loading={loading}
            >
              {isEditing ? 'Actualizar' : 'Crear'} Empleado
            </Button>
          </HStack>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}
