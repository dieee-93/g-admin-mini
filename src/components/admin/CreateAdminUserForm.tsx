import React, { useState } from 'react';
import {
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import {
  Box,
  Stack,
  Progress,
  IconButton,
  Alert,
  CardWrapper,
  Button,
  InputField,
  Typography,
  SelectField
} from '@/shared/ui';
import { usePasswordValidation } from '@/hooks';
import { logger } from '@/lib/logging';

type AdminRole = 'OPERADOR' | 'SUPERVISOR' | 'ADMINISTRADOR';

interface CreateAdminUserFormProps {
  onCancel?: () => void;
  onSuccess?: (user: unknown) => void;
}

export function CreateAdminUserForm({ onCancel, onSuccess }: CreateAdminUserFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'OPERADOR' as AdminRole
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Validación estricta para creación de admins
  const passwordValidation = usePasswordValidation({
    context: 'admin-creation',
    password: formData.password
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Validar email
    if (!formData.email.trim()) {
      errors.email = 'Email corporativo requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Formato de email inválido';
    }
    
    // Validar nombre
    if (!formData.fullName.trim()) {
      errors.fullName = 'Nombre completo requerido';
    } else if (formData.fullName.trim().length < 3) {
      errors.fullName = 'El nombre debe tener al menos 3 caracteres';
    }
    
    // Validar contraseña usando hook
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0] || 'Contraseña no cumple los requisitos de seguridad';
    }
    
    // Validar confirmación
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirmar contraseña es requerido';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Implementar creación real de usuario
      logger.info('App', 'Creating admin user:', {
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role
        // password no se loggea por seguridad
      });
      
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success
      if (onSuccess) {
        onSuccess({
          id: Math.random().toString(36),
          email: formData.email,
          fullName: formData.fullName,
          role: formData.role,
          createdAt: new Date().toISOString()
        });
      }
      
    } catch (error) {
      logger.error('App', 'Failed to create admin user', { error });
      setError('Error al crear usuario administrativo');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleDescription = (role: string) => {
    const descriptions = {
      'OPERADOR': 'Acceso a operaciones básicas del sistema',
      'SUPERVISOR': 'Gestión operativa y supervisión de personal',
      'ADMINISTRADOR': 'Control completo del sistema y configuraciones'
    };
    return descriptions[role as keyof typeof descriptions] || '';
  };

  return (
    <CardWrapper variant="elevated" padding="xl" maxW="2xl">
      <form onSubmit={handleSubmit}>
        <Stack direction="column" gap="lg" align="stretch">
          {/* Header */}
          <Stack direction="row" gap="sm" justify="center">
            <div style={{
              padding: '12px',
              background: '#3182ce',
              borderRadius: '12px',
              color: 'white'
            }}>
              <UserPlusIcon style={{ width: '24px', height: '24px' }} />
            </div>
            <Stack direction="column" gap="xs" align="start">
              <Typography variant="heading" color="text.primary">
                Crear Usuario Administrativo
              </Typography>
              <Typography variant="caption" color="text.muted">
                Usuario con acceso al panel de administración
              </Typography>
            </Stack>
          </Stack>

          {/* Error Display */}
          {error && (
            <Alert.Root status="error">
              <Alert.Description>{error}</Alert.Description>
            </Alert.Root>
          )}

          {/* Form Fields */}
          <Stack direction="column" gap="md" align="stretch">
            <InputField
              label="Nombre Completo"
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="Nombre y apellido del usuario"
              required
              disabled={isLoading}
              error={formErrors.fullName}
            />

            <InputField
              label="Email Corporativo"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="usuario@empresa.com"
              required
              disabled={isLoading}
              error={formErrors.email}
            />

            <SelectField
              label="Rol Administrativo"
              value={formData.role}
              onChange={(value) => setFormData(prev => ({ ...prev, role: value as AdminRole }))}
              placeholder="Seleccionar rol"
              required
              disabled={isLoading}
              options={[
                { label: 'Operador', value: 'OPERADOR' },
                { label: 'Supervisor', value: 'SUPERVISOR' },
                { label: 'Administrador', value: 'ADMINISTRADOR' }
              ]}
              helperText={getRoleDescription(formData.role)}
            />

            {/* Password with strict validation */}
            <Box position="relative">
              <InputField
                label="Contraseña Segura"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Mínimo 8 caracteres, mayúsculas, números y símbolos"
                required
                disabled={isLoading}
                error={formErrors.password}
              />
              <Box position="absolute" right="8px" top="32px" zIndex={2}>
                <IconButton
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? 
                    <EyeSlashIcon style={{ width: '16px', height: '16px' }} /> : 
                    <EyeIcon style={{ width: '16px', height: '16px' }} />
                  }
                </IconButton>
              </Box>
            </Box>

            {/* Password Strength Indicator */}
            {formData.password && (
              <CardWrapper variant="outline" padding="md">
                <Stack direction="column" gap="sm" align="stretch">
                  <Stack direction="row" justify="space-between" align="center">
                    <Typography variant="label" color="text.secondary">
                      Nivel de Seguridad:
                    </Typography>
                    <Stack direction="row" gap="xs">
                      {passwordValidation.strengthColor === 'green' ? 
                        <CheckCircleIcon style={{ width: '16px', height: '16px', color: '#22c55e' }} /> :
                        <ExclamationTriangleIcon style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
                      }
                      <Typography 
                        variant="label" 
                        color={
                          passwordValidation.strengthColor === 'green' ? 'success' :
                          passwordValidation.strengthColor === 'orange' ? 'warning' : 'error'
                        }
                        fontWeight="bold"
                      >
                        {passwordValidation.strengthLabel}
                      </Typography>
                    </Stack>
                  </Stack>
                  
                  <Progress.Root 
                    value={passwordValidation.strength} 
                    size="sm" 
                    colorPalette={passwordValidation.strengthColor}
                  >
                    <Progress.Track>
                      <Progress.Range />
                    </Progress.Track>
                  </Progress.Root>
                  
                  <Stack direction="column" gap="xs" align="stretch">
                    {passwordValidation.requirements.map((req, index) => (
                      <Stack direction="row" key={index} gap="xs" align="center">
                        <Box
                          width="4px"
                          height="4px"
                          borderRadius="full"
                          bg={req.met ? 'green.500' : 'gray.300'}
                        />
                        <Typography 
                          variant="caption" 
                          color={req.met ? 'success' : 'muted'}
                          size="sm"
                        >
                          {req.label}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </CardWrapper>
            )}

            {/* Confirm Password */}
            <Box position="relative">
              <InputField
                label="Confirmar Contraseña"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Repetir la contraseña"
                required
                disabled={isLoading}
                error={formErrors.confirmPassword}
              />
              <Box position="absolute" right="8px" top="32px" zIndex={2}>
                <IconButton
                  aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? 
                    <EyeSlashIcon style={{ width: '16px', height: '16px' }} /> : 
                    <EyeIcon style={{ width: '16px', height: '16px' }} />
                  }
                </IconButton>
              </Box>
            </Box>
          </Stack>

          {/* Actions */}
          <Stack direction="row" gap="md" justify="end">
            {onCancel && (
              <Button
                variant="outline"
                size="md"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            )}
            
            <Button
              type="submit"
              size="md"
              colorPalette="blue"
              disabled={isLoading || !passwordValidation.isValid || !formData.email || !formData.fullName}
              loading={isLoading}
            >
              <Stack direction="row" gap="sm">
                <ShieldCheckIcon style={{ width: '16px', height: '16px' }} />
                <Typography variant="body">Crear Usuario</Typography>
              </Stack>
            </Button>
          </Stack>

          {/* Security Notice */}
          <CardWrapper variant="subtle" padding="md">
            <Stack direction="row" gap="sm" align="start">
              <ShieldCheckIcon style={{ width: '16px', height: '16px', color: '#3182ce', marginTop: '2px' }} />
              <Stack direction="column" gap="xs" align="start">
                <Typography variant="label" color="text.primary" size="sm">
                  Política de Seguridad
                </Typography>
                <Typography variant="caption" color="text.muted" size="sm">
                  Los usuarios administrativos requieren contraseñas seguras y serán monitoreados.
                  El usuario recibirá un email de confirmación para activar su cuenta.
                </Typography>
              </Stack>
            </Stack>
          </CardWrapper>
        </Stack>
      </form>
    </CardWrapper>
  );
}