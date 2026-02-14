import React, { useState } from 'react';
import {
  Stack,
  HStack,
  Button,
  Alert,
  Modal,
  Icon,
  InputField,
  SelectField,
} from '@/shared/ui';
import {
  ShieldCheckIcon,
  UserPlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { usePasswordValidation } from '@/hooks';
import { logger } from '@/lib/logging';
import type { SystemRole } from '../hooks/useUsersPage';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prefillEmail?: string;
}

const ROLE_OPTIONS = [
  { label: 'Operador — acceso a operaciones básicas', value: 'OPERADOR' },
  { label: 'Supervisor — gestión operativa', value: 'SUPERVISOR' },
  { label: 'Administrador — control completo', value: 'ADMINISTRADOR' },
];

export function InviteUserModal({ isOpen, onClose, onSuccess, prefillEmail }: InviteUserModalProps) {
  const [formData, setFormData] = useState({
    email: prefillEmail || '',
    full_name: '',
    password: '',
    role: 'OPERADOR' as SystemRole,
    is_employee: false,  // NEW: checkbox for employee linking
    link_option: 'link_existing' as 'link_existing' | 'create_new',
    selected_employee_id: undefined as string | undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // NEW: Query to fetch employees without panel access
  const [employees, setEmployees] = useState<Array<{ id: string; first_name: string; last_name: string; position: string; email: string | null }>>([]);

  // NEW: Fetch unlinked employees when modal opens and is_employee is checked
  React.useEffect(() => {
    if (isOpen && formData.is_employee) {
      (async () => {
        const { supabase } = await import('@/lib/supabase/client');
        const { data } = await supabase
          .from('team_members')
          .select('id, first_name, last_name, position, email')
          .is('auth_user_id', null);
        setEmployees(data || []);
      })();
    }
  }, [isOpen, formData.is_employee]);

  const passwordValidation = usePasswordValidation({
    context: 'admin-creation',
    password: formData.password,
  });

  const handleClose = () => {
    setFormData({
      email: '',
      full_name: '',
      password: '',
      role: 'OPERADOR',
      is_employee: false,
      link_option: 'link_existing',
      selected_employee_id: undefined,
    });
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    setError('');

    if (!formData.email || !formData.full_name || !formData.password) {
      setError('Todos los campos son requeridos');
      return;
    }
    if (!passwordValidation.isValid) {
      setError('La contraseña no cumple los requisitos de seguridad');
      return;
    }

    setIsLoading(true);
    try {
      const { supabase } = await import('@/lib/supabase/client');

      // Edge Function crea el usuario Y asigna el rol en una operación atómica
      const { data, error: invokeError } = await supabase.functions.invoke('create-admin-user', {
        body: {
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          role: formData.role,
        },
      });

      if (invokeError) throw new Error(invokeError.message);
      if (!data?.success) throw new Error(data?.error || 'Error al crear usuario');

      const userId = data.userId;

      // NEW: If is_employee checked, handle linking
      if (formData.is_employee && formData.link_option === 'link_existing' && formData.selected_employee_id) {
        await supabase
          .from('team_members')
          .update({ auth_user_id: userId })
          .eq('id', formData.selected_employee_id);

        logger.info('App', 'User linked to employee', { userId, employeeId: formData.selected_employee_id });
      }

      logger.info('App', 'Panel user invited successfully', { userId, role: formData.role });
      onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al invitar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <Modal.Content>
        <Modal.Header>
          <HStack gap="2">
            <Icon icon={UserPlusIcon} size="sm" />
            Invitar Usuario al Panel
          </HStack>
          <Modal.CloseTrigger />
        </Modal.Header>

        <Modal.Body>
          <Stack gap="4">
            {error && (
              <Alert status="error">
                <Alert.Indicator />
                <Alert.Description>{error}</Alert.Description>
              </Alert>
            )}

            <InputField
              label="Nombre Completo"
              value={formData.full_name}
              onChange={(e) => setFormData(p => ({ ...p, full_name: e.target.value }))}
              placeholder="Nombre y apellido"
              required
              disabled={isLoading}
            />

            <InputField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
              placeholder="usuario@empresa.com"
              required
              disabled={isLoading}
            />

            <SelectField
              label="Rol del Sistema"
              value={[formData.role]}
              onValueChange={({ value }) => setFormData(p => ({ ...p, role: value[0] as SystemRole }))}
              required
              disabled={isLoading}
              options={ROLE_OPTIONS}
              noPortal
            />

            <InputField
              label="Contraseña Inicial"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
              placeholder="Mínimo 8 caracteres"
              required
              disabled={isLoading}
              helperText={
                formData.password && !passwordValidation.isValid
                  ? passwordValidation.errors[0]
                  : 'El usuario deberá cambiarla en su primer ingreso'
              }
            />

            {/* NEW: Employee Linking Checkbox */}
            <Stack gap="3" borderTopWidth="1px" borderColor="border.default" pt="4">
              <HStack gap="2">
                <input
                  type="checkbox"
                  id="is-employee"
                  checked={formData.is_employee}
                  onChange={(e) => setFormData(p => ({ ...p, is_employee: e.target.checked }))}
                  disabled={isLoading}
                />
                <label htmlFor="is-employee" style={{ fontWeight: 500, fontSize: '14px' }}>
                  Este usuario es empleado del negocio
                </label>
              </HStack>

              {formData.is_employee && (
                <Stack gap="3" pl="6" borderLeftWidth="2px" borderColor="blue.500">
                  <Alert variant="subtle" status="info">
                    <Alert.Description>
                      Vincula este usuario con un empleado existente o créalo después
                    </Alert.Description>
                  </Alert>

                  <SelectField
                    label="Vincular con empleado"
                    value={formData.selected_employee_id ? [formData.selected_employee_id] : []}
                    onValueChange={({ value }) => setFormData(p => ({ ...p, selected_employee_id: value[0] }))}
                    disabled={isLoading || employees.length === 0}
                    options={[
                      { label: '(Vincular más tarde)', value: '' },
                      ...employees.map(emp => ({
                        label: `${emp.first_name} ${emp.last_name} - ${emp.position}`,
                        value: emp.id,
                      })),
                    ]}
                    helperText={employees.length === 0 ? 'Todos los empleados ya tienen acceso al panel' : 'Selecciona un empleado para vincular'}
                    noPortal
                  />
                </Stack>
              )}
            </Stack>

            <Alert variant="subtle" status="info">
              <Alert.Indicator>
                <Icon icon={ShieldCheckIcon} size="sm" />
              </Alert.Indicator>
              <Alert.Description>
                El usuario recibirá acceso al panel con el rol seleccionado{formData.is_employee && formData.selected_employee_id ? ' y será vinculado al empleado seleccionado' : ''}.
              </Alert.Description>
            </Alert>
          </Stack>
        </Modal.Body>

        <Modal.Footer>
          <HStack gap="3" justify="end">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              colorPalette="blue"
              onClick={handleSubmit}
              loading={isLoading}
              disabled={!formData.email || !formData.full_name || !formData.password}
            >
              Invitar Usuario
            </Button>
          </HStack>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}
