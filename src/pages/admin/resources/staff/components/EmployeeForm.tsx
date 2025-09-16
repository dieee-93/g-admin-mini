// Employee Form - Create/Edit employee form with real API integration
import { useState } from 'react';
import {
  VStack,
  HStack,
  Text,
  Button,
  CardWrapper,
  Input,
  Modal,
  Alert,
  Icon
} from '../../../../../shared/ui';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useStaffWithLoader } from '../../../../../hooks/useStaffData';
import type { Employee } from '../../../../../services/staff/staffApi';

interface EmployeeFormProps {
  employee?: Employee;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (employee: Employee) => void;
}

interface EmployeeFormData {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  department: 'kitchen' | 'service' | 'admin' | 'cleaning' | 'management';
  hire_date: string;
  employment_type: 'full_time' | 'part_time' | 'contractor' | 'temp';
  salary: number;
  weekly_hours: number;
  shift_preference: 'morning' | 'afternoon' | 'night' | 'flexible';
}

export function EmployeeForm({ employee, isOpen, onClose, onSuccess }: EmployeeFormProps) {
  const { createEmployee, updateEmployee, loading } = useStaffWithLoader();
  const [formData, setFormData] = useState<EmployeeFormData>({
    employee_id: employee?.employee_id || '',
    first_name: employee?.first_name || '',
    last_name: employee?.last_name || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    position: employee?.position || '',
    department: employee?.department || 'service',
    hire_date: employee?.hire_date || new Date().toISOString().split('T')[0],
    employment_type: employee?.employment_type || 'full_time',
    salary: employee?.salary || 0,
    weekly_hours: employee?.weekly_hours || 40,
    shift_preference: employee?.shift_preference || 'flexible'
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEditing = !!employee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    try {
      const employeeData = {
        ...formData,
        employment_status: 'active' as const,
        role: 'employee' as const,
        performance_score: 85,
        attendance_rate: 95,
        completed_tasks: 0,
        available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        permissions: [] as string[]
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
        // Reset form
        setFormData({
          employee_id: '',
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          position: '',
          department: 'service',
          hire_date: new Date().toISOString().split('T')[0],
          employment_type: 'full_time',
          salary: 0,
          weekly_hours: 40,
          shift_preference: 'flexible'
        });
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Error al guardar empleado');
    }
  };

  const handleInputChange = (field: keyof EmployeeFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
          <form onSubmit={handleSubmit}>
            <VStack gap="4" align="stretch">
              {submitError && (
                <Alert status="error">
                  <Alert.Indicator />
                  <Alert.Title>Error</Alert.Title>
                  <Alert.Description>{submitError}</Alert.Description>
                </Alert>
              )}

              {/* Personal Information */}
              <CardWrapper variant="flat" padding="md">
                <CardWrapper.Body>
                  <VStack gap="4" align="stretch">
                    <Text fontWeight="semibold">Información Personal</Text>
                    
                    <HStack gap="4">
                      <VStack align="stretch" flex="1">
                        <Text fontSize="sm" fontWeight="medium">Nombre *</Text>
                        <Input
                          required
                          value={formData.first_name}
                          onChange={(e) => handleInputChange('first_name', e.target.value)}
                          placeholder="Nombre"
                        />
                      </VStack>
                      <VStack align="stretch" flex="1">
                        <Text fontSize="sm" fontWeight="medium">Apellido *</Text>
                        <Input
                          required
                          value={formData.last_name}
                          onChange={(e) => handleInputChange('last_name', e.target.value)}
                          placeholder="Apellido"
                        />
                      </VStack>
                    </HStack>

                    <VStack align="stretch">
                      <Text fontSize="sm" fontWeight="medium">Email *</Text>
                      <Input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="email@ejemplo.com"
                      />
                    </VStack>

                    <VStack align="stretch">
                      <Text fontSize="sm" fontWeight="medium">Teléfono</Text>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+1234567890"
                      />
                    </VStack>
                  </VStack>
                </CardWrapper.Body>
              </CardWrapper>

              {/* Job Information */}
              <CardWrapper variant="flat" padding="md">
                <CardWrapper.Body>
                  <VStack gap="4" align="stretch">
                    <Text fontWeight="semibold">Información Laboral</Text>
                    
                    <HStack gap="4">
                      <VStack align="stretch" flex="1">
                        <Text fontSize="sm" fontWeight="medium">Posición *</Text>
                        <Input
                          required
                          value={formData.position}
                          onChange={(e) => handleInputChange('position', e.target.value)}
                          placeholder="Ej: Mesero, Cocinero, Gerente"
                        />
                      </VStack>
                      <VStack align="stretch" flex="1">
                        <Text fontSize="sm" fontWeight="medium">Departamento *</Text>
                        <select
                          required
                          value={formData.department}
                          onChange={(e) => handleInputChange('department', e.target.value)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="kitchen">Cocina</option>
                          <option value="service">Servicio</option>
                          <option value="admin">Administración</option>
                          <option value="cleaning">Limpieza</option>
                          <option value="management">Gerencia</option>
                        </select>
                      </VStack>
                    </HStack>

                    <HStack gap="4">
                      <VStack align="stretch" flex="1">
                        <Text fontSize="sm" fontWeight="medium">Fecha de Contratación *</Text>
                        <Input
                          type="date"
                          required
                          value={formData.hire_date}
                          onChange={(e) => handleInputChange('hire_date', e.target.value)}
                        />
                      </VStack>
                      <VStack align="stretch" flex="1">
                        <Text fontSize="sm" fontWeight="medium">Tipo de Empleo *</Text>
                        <select
                          required
                          value={formData.employment_type}
                          onChange={(e) => handleInputChange('employment_type', e.target.value)}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="full_time">Tiempo Completo</option>
                          <option value="part_time">Tiempo Parcial</option>
                          <option value="contractor">Contratista</option>
                          <option value="temp">Temporal</option>
                        </select>
                      </VStack>
                    </HStack>

                    <HStack gap="4">
                      <VStack align="stretch" flex="1">
                        <Text fontSize="sm" fontWeight="medium">Salario Mensual</Text>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.salary}
                          onChange={(e) => handleInputChange('salary', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </VStack>
                      <VStack align="stretch" flex="1">
                        <Text fontSize="sm" fontWeight="medium">Horas Semanales</Text>
                        <Input
                          type="number"
                          min="1"
                          max="60"
                          value={formData.weekly_hours}
                          onChange={(e) => handleInputChange('weekly_hours', parseInt(e.target.value) || 40)}
                        />
                      </VStack>
                    </HStack>

                    <VStack align="stretch">
                      <Text fontSize="sm" fontWeight="medium">Preferencia de Turno</Text>
                      <select
                        value={formData.shift_preference}
                        onChange={(e) => handleInputChange('shift_preference', e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="morning">Mañana</option>
                        <option value="afternoon">Tarde</option>
                        <option value="night">Noche</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </VStack>
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
              colorPalette="blue"
              loading={loading}
              onClick={handleSubmit}
            >
              {isEditing ? 'Actualizar' : 'Crear'} Empleado
            </Button>
          </HStack>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}