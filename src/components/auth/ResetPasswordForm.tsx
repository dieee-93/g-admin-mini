import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Heading,
  CardWrapper,
  Button,
  InputField
} from '@/shared/ui';
import { Link } from '@chakra-ui/react';
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging/Logger';

interface ResetPasswordFormProps {
  onSwitchToLogin?: () => void;
}

export function ResetPasswordForm({ onSwitchToLogin }: ResetPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');

    if (!email?.trim()) {
      setEmailError('El email es requerido');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Formato de email inválido');
      return;
    }

    setIsLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      logger.error('Auth', 'Error sending reset email:', err);
      setError('Ocurrió un error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <CardWrapper>
        <Box maxW="md" mx="auto" mt="8">
          <VStack gap="6">
            <Heading size="lg" color="green.500">
              Email Enviado
            </Heading>
            
            <VStack gap="4">
              <Box 
                w="full" 
                p="4" 
                 
                border="1px solid" 
                borderColor="green.200" 
                borderRadius="md"
              >
                <Text fontSize="sm" color="green.700">
                  Te hemos enviado un enlace de recuperación a <strong>{email}</strong>.
                  Revisa tu bandeja de entrada y sigue las instrucciones.
                </Text>
              </Box>

              <Text fontSize="sm" color="gray.600" textAlign="center">
                ¿No recibiste el email? Revisa tu carpeta de spam o intenta nuevamente.
              </Text>

              <Button
                variant="outline"
                colorPalette="purple"
                onClick={() => setSubmitted(false)}
              >
                Enviar nuevamente
              </Button>

              {onSwitchToLogin && (
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  <Link
                    color="blue.500"
                    onClick={onSwitchToLogin}
                    cursor="pointer"
                    _hover={{ textDecoration: 'underline' }}
                  >
                    Volver al inicio de sesión
                  </Link>
                </Text>
              )}
            </VStack>
          </VStack>
        </Box>
      </CardWrapper>
    );
  }

  return (
    <CardWrapper>
      <Box maxW="md" mx="auto" mt="8">
        <VStack gap="6">
          <VStack gap="2">
            <Heading size="lg" color="blue.500">
              Recuperar Contraseña
            </Heading>
            <Text color="gray.600" textAlign="center">
              Ingresa tu email y te enviaremos un enlace de recuperación
            </Text>
          </VStack>
          
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack gap="4">
              {error && (
                <Box 
                  w="full" 
                  p="3" 
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

              <Button
                type="submit"
                colorPalette="purple"
                fullWidth
                loading={isLoading}
              >
                Enviar Enlace de Recuperación
              </Button>

              {onSwitchToLogin && (
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  ¿Recordaste tu contraseña?{' '}
                  <Link
                    color="blue.500"
                    onClick={onSwitchToLogin}
                    cursor="pointer"
                    _hover={{ textDecoration: 'underline' }}
                  >
                    Iniciar sesión
                  </Link>
                </Text>
              )}
            </VStack>
          </form>
        </VStack>
      </Box>
    </CardWrapper>
  );
}