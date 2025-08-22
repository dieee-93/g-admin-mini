import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Link,
  Separator,
  Heading,
} from '@chakra-ui/react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { InputField } from '@/shared/ui/InputField';
import { useAuth } from '@/lib/auth/useAuth';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
  onSwitchToReset?: () => void;
}

export function LoginForm({ onSwitchToRegister, onSwitchToReset }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { signIn, isLoading, error, clearError } = useAuth();

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    
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
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validateForm()) {
      return;
    }

    const success = await signIn({ email, password });
    
    if (success) {
      // Login successful - auth service handles the rest
      console.log('Login successful');
    }
  };

  return (
    <Card>
      <Box maxW="md" mx="auto" mt={8}>
        <VStack gap={6}>
          <VStack gap={2}>
            <Heading size="lg" color="blue.500">
              G-Mini
            </Heading>
            <Text color="gray.600" textAlign="center">
              Inicia sesión para acceder a tu negocio
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
                placeholder="Tu contraseña"
                required
                error={passwordError}
              />

              <Button
                type="submit"
                colorPalette="brand"
                fullWidth
                loading={isLoading}
              >
                Iniciar Sesión
              </Button>

              {onSwitchToReset && (
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  ¿Olvidaste tu contraseña?{' '}
                  <Link
                    color="blue.500"
                    onClick={onSwitchToReset}
                    cursor="pointer"
                    _hover={{ textDecoration: 'underline' }}
                  >
                    Recuperar contraseña
                  </Link>
                </Text>
              )}

              {onSwitchToRegister && (
                <>
                  <Separator />
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    ¿No tienes cuenta?{' '}
                    <Link
                      color="blue.500"
                      onClick={onSwitchToRegister}
                      cursor="pointer"
                      _hover={{ textDecoration: 'underline' }}
                    >
                      Crear cuenta
                    </Link>
                  </Text>
                </>
              )}

              <Box mt={4}>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  Demo: Usa cualquier email válido para crear una cuenta de prueba
                </Text>
              </Box>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Card>
  );
}
