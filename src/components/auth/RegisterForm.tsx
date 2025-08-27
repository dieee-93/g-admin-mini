import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Link,
  Separator,
  Heading,
} from '@chakra-ui/react';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { Button } from '@/shared/ui/Button';
import { InputField } from '@/shared/ui/InputField';
import { useAuth } from '@/contexts/AuthContext';

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  
  const { signUp, isLoading, error, clearError } = useAuth();

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setConfirmError('');
    
    if (!email?.trim()) {
      setEmailError('El email es requerido');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Formato de email inválido');
      isValid = false;
    }
    
    if (!password?.trim()) {
      setPasswordError('La contraseña es requerida');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      isValid = false;
    }
    
    if (!confirmPassword?.trim()) {
      setConfirmError('Confirmar contraseña es requerido');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmError('Las contraseñas no coinciden');
      isValid = false;
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validateForm()) {
      return;
    }

    const success = await signUp({
      email,
      password,
      full_name: fullName,
    });
    
    if (success) {
      console.log('Registration successful');
    }
  };

  return (
    <CardWrapper>
      <Box maxW="md" mx="auto" mt={8}>
        <VStack gap={6}>
          <VStack gap={2}>
            <Heading size="lg" color="blue.500">
              G-Mini
            </Heading>
            <Text color="gray.600" textAlign="center">
              Crea tu cuenta para comenzar
            </Text>
          </VStack>
          
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack gap={4}>
              {error && (
                <Box 
                  w="full" 
                  p={3} 
                  bg="red.50" 
                  border="1px solid" 
                  borderColor="red.200" 
                  borderRadius="md"
                >
                  <Text fontSize="sm" color="red.700">
                    {error}
                  </Text>
                </Box>
              )}

              <InputField
                label="Nombre completo"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre completo"
              />

              <InputField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                error={emailError}
              />

              <InputField
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                error={passwordError}
              />

              <InputField
                label="Confirmar contraseña"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                required
                error={confirmError}
              />

              <Button
                type="submit"
                colorPalette="brand"
                fullWidth
                loading={isLoading}
              >
                Crear Cuenta
              </Button>

              {onSwitchToLogin && (
                <>
                  <Separator />
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    ¿Ya tienes cuenta?{' '}
                    <Link
                      color="blue.500"
                      onClick={onSwitchToLogin}
                      cursor="pointer"
                      _hover={{ textDecoration: 'underline' }}
                    >
                      Iniciar sesión
                    </Link>
                  </Text>
                </>
              )}

              <Box mt={4}>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  Al registrarte, aceptas nuestros términos y condiciones
                </Text>
              </Box>
            </VStack>
          </form>
        </VStack>
      </Box>
    </CardWrapper>
  );
}