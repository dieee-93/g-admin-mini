// Employee Form - MIGRATED to Zod + React Hook Form validation
import { useEffect } from 'react';
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
  Field,
  NativeSelect
} from '../../../../../shared/ui';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useStaffWithLoader } from '../../../../../hooks/useStaffData';
import { useEmployeeValidation } from '../../../../../hooks/useEmployeeValidation';
import type { Employee } from '../../../../../services/staff/staffApi';
import type { EmployeeCompleteFormData } from '@/lib/validation/zod/CommonSchemas';

interface EmployeeFormProps {
  employee?: Employee;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (employee: Employee) => void;
}

export function EmployeeForm({ employee, isOpen, onClose, onSuccess }: EmployeeFormProps) {
  const { createEmployee, updateEmployee, loading, employees } = useStaffWithLoader();

  const isEditing = !!employee;

  // 🔥 NEW: Use validation hook with Zod + React Hook Form
  const {
    form,
    fieldErrors,
    fieldWarnings,
    validationState,
    validateForm
  } = useEmployeeValidation(
    {
      employee_id: employee?.employee_id || '',
      first_name: employee?.first_name || '',
      last_name: employee?.last_name || '',
      email: employee?.email || '',
      phone: employee?.phone || '',
      position: employee?.position || '',
      department: (employee?.department || 'service') as 'kitchen' | 'service' | 'admin' | 'cleaning' | 'management',
      hire_date: employee?.hire_date || new Date().toISOString().split('T')[0],
      employment_type: (employee?.employment_type || 'full_time') as 'full_time' | 'part_time' | 'contract' | 'intern',
      employment_status: 'active',
      salary: employee?.salary,
      hourly_rate: employee?.hourly_rate,
      weekly_hours: 40,
      role: 'employee',
      can_work_multiple_locations: false
    },
    employees || [],
    employee?.id
  );

  const { register, handleSubmit: createSubmitHandler, reset, formState: { errors } } = form;

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const handleSubmit = createSubmitHandler(async (data: EmployeeCompleteFormData) => {
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

      let result: Employee | null = null;

      if (isEditing) {
        result = await updateEmployee(employee.id, employeeData);
      } else {
        result = await createEmployee(employeeData);
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
    <Modal open={isOpen} onClose={onClose} size="lg">
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
          <form onSubmit={handleSubmit} id="employee-form">
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
              <CardWrapper variant="flat" padding="md">
                <CardWrapper.Body>
                  <VStack gap="4" align="stretch">
                    <Text fontWeight="semibold">Información Personal</Text>

                    {/* Employee ID */}
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
              <CardWrapper variant="flat" padding="md">
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
                      <Field.Root invalid={!!fieldErrors.department} flex="1">
                        <Field.Label>Departamento *</Field.Label>
                        <NativeSelect.Root {...register('department')}>
                          <NativeSelect.Field placeholder="Seleccionar...">
                            <option value="kitchen">Cocina</option>
                            <option value="service">Servicio</option>
                            <option value="admin">Administración</option>
                            <option value="cleaning">Limpieza</option>
                            <option value="management">Gerencia</option>
                          </NativeSelect.Field>
                        </NativeSelect.Root>
                        {fieldErrors.department && (
                          <Field.ErrorText>{fieldErrors.department}</Field.ErrorText>
                        )}
                      </Field.Root>
                    </HStack>

                    <HStack gap="4">
                      {/* Hire Date */}
                      <Field.Root invalid={!!fieldErrors.hire_date} flex="1">
                        <Field.Label>Fecha de Contratación *</Field.Label>
                        <Input
                          type="date"
                          {...register('hire_date')}
                        />
                        {fieldErrors.hire_date && (
                          <Field.ErrorText>{fieldErrors.hire_date}</Field.ErrorText>
                        )}
                      </Field.Root>

                      {/* Employment Type */}
                      <Field.Root invalid={!!fieldErrors.employment_type} flex="1">
                        <Field.Label>Tipo de Empleo *</Field.Label>
                        <NativeSelect.Root {...register('employment_type')}>
                          <NativeSelect.Field placeholder="Seleccionar...">
                            <option value="full_time">Tiempo Completo</option>
                            <option value="part_time">Tiempo Parcial</option>
                            <option value="contractor">Contratista</option>
                            <option value="temp">Temporal</option>
                          </NativeSelect.Field>
                        </NativeSelect.Root>
                        {fieldErrors.employment_type && (
                          <Field.ErrorText>{fieldErrors.employment_type}</Field.ErrorText>
                        )}
                      </Field.Root>
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
              form="employee-form"
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
