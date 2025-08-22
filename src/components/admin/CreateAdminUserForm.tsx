import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  IconButton,
  Alert
} from '@chakra-ui/react';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  ShieldCheckIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Card, Button, InputField, Typography, SelectField } from '@/shared/ui';
import { usePasswordValidation } from '@/hooks/usePasswordValidation';

interface CreateAdminUserFormProps {
  onCancel?: () => void;
  onSuccess?: (user: any) => void;
}

export function CreateAdminUserForm({ onCancel, onSuccess }: CreateAdminUserFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'OPERADOR' as 'OPERADOR' | 'SUPERVISOR' | 'ADMINISTRADOR'
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
      console.log('Creating admin user:', {
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
    <Card variant="elevated" padding="xl" maxW="2xl">
      <form onSubmit={handleSubmit}>
        <VStack gap="lg" align="stretch">
          {/* Header */}
          <HStack gap="sm" justify="center">
            <div style={{
              padding: '12px',
              background: '#3182ce',
              borderRadius: '12px',
              color: 'white'
            }}>
              <UserPlusIcon style={{ width: '24px', height: '24px' }} />
            </div>
            <VStack gap="xs" align="start">
              <Typography variant="heading" color="primary">
                Crear Usuario Administrativo
              </Typography>
              <Typography variant="caption" color="muted">
                Usuario con acceso al panel de administración
              </Typography>
            </VStack>
          </HStack>

          {/* Error Display */}
          {error && (
            <Alert.Root status="error">
              <Alert.Description>{error}</Alert.Description>
            </Alert.Root>
          )}

          {/* Form Fields */}
          <VStack gap="md" align="stretch">
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
              onChange={(value) => setFormData(prev => ({ ...prev, role: value as any }))}
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
              <Card variant="outline" padding="md">
                <VStack gap="sm" align="stretch">
                  <HStack justify="space-between" align="center">
                    <Typography variant="label" color="secondary">
                      Nivel de Seguridad:
                    </Typography>
                    <HStack gap="xs">
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
                    </HStack>
                  </HStack>
                  
                  <Progress.Root 
                    value={passwordValidation.strength} 
                    size="sm" 
                    colorPalette={passwordValidation.strengthColor}
                  >
                    <Progress.Track>
                      <Progress.Range />
                    </Progress.Track>
                  </Progress.Root>
                  
                  <VStack gap="xs" align="stretch">
                    {passwordValidation.requirements.map((req, index) => (
                      <HStack key={index} gap="xs" align="center">
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
                      </HStack>
                    ))}
                  </VStack>
                </VStack>
              </Card>
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
          </VStack>

          {/* Actions */}
          <HStack gap="md" justify="end">
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
              loadingText="Creando usuario..."
            >
              <HStack gap="sm">
                <ShieldCheckIcon style={{ width: '16px', height: '16px' }} />
                <Text>Crear Usuario</Text>
              </HStack>
            </Button>
          </HStack>

          {/* Security Notice */}
          <Card variant="subtle" padding="md">
            <HStack gap="sm" align="start">
              <ShieldCheckIcon style={{ width: '16px', height: '16px', color: '#3182ce', marginTop: '2px' }} />
              <VStack gap="xs" align="start">
                <Typography variant="label" color="primary" size="sm">
                  Política de Seguridad
                </Typography>
                <Typography variant="caption" color="muted" size="sm">
                  Los usuarios administrativos requieren contraseñas seguras y serán monitoreados.
                  El usuario recibirá un email de confirmación para activar su cuenta.
                </Typography>
              </VStack>
            </HStack>
          </Card>
        </VStack>
      </form>
    </Card>
  );
}