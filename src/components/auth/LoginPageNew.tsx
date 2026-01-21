import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import {
  Box,
  Stack as VStack,
  Stack as HStack,
  Text,
  Presence,
  IconButton,
  Progress,
  Heading,
  Alert,
  CardWrapper,
  Button,
  InputField
} from '@/shared/ui';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logging';

export function LoginPageNew() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});
  const [mounted, setMounted] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Validate form fields
  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};

    if (!email) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email inválido';
    }

    if (!password) {
      errors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Get password strength
  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFormErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn(email, password);

      if (result.error) {
        setError(result.error);
      } else {
        // Success - navigation will be handled by auth state change
        navigate(from, { replace: true });
      }
    } catch (error) {
      logger.error('Auth', 'Login failed with unexpected error', { error, email });
      setError('Error inesperado al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (formErrors.email) {
      setFormErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (formErrors.password) {
      setFormErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      p="md"
      position="relative"
    >
      <Presence
        present={mounted}
        animationName={{ _open: "scale-fade-in", _closed: "scale-fade-out" }}
        animationDuration="moderate"
      >
        <CardWrapper variant="elevated"
          padding="lg"
          maxW="md"
          width="full"
        >
          <CardWrapper.Header>
            <VStack gap="lg" textAlign="center">
              <Box
                p="md"

                borderRadius="full"
                color="white"
              >
                <ShieldCheckIcon style={{ width: '32px', height: '32px' }} />
              </Box>
              <VStack gap="sm">
                <Heading size="xl">
                  Bienvenido a G-Admin
                </Heading>
                <Text colorPalette="gray" fontSize="md">
                  Inicia sesión para acceder a tu panel de administración
                </Text>
              </VStack>
            </VStack>
          </CardWrapper.Header>

          <CardWrapper.Body>
            <form onSubmit={handleSubmit}>
              <VStack gap="lg">
                <Presence
                  present={!!error}
                  animationName={{ _open: "fade-in", _closed: "fade-out" }}
                  animationDuration="fast"
                >
                  <Alert.Root status="error">
                    <Alert.Description>
                      {error}
                    </Alert.Description>
                  </Alert.Root>
                </Presence>

                <VStack gap="md" w="full">
                  <InputField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e)}
                    placeholder="tu@email.com"
                    required
                    disabled={isLoading}
                    error={formErrors.email}
                  />

                  <Box w="full" position="relative">
                    <InputField
                      label="Contraseña"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => handlePasswordChange(e)}
                      placeholder="••••••••"
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
                        {showPassword ? <EyeSlashIcon style={{ width: '16px', height: '16px' }} /> : <EyeIcon style={{ width: '16px', height: '16px' }} />}
                      </IconButton>
                    </Box>
                    {password && !formErrors.password && (
                      <Box mt="sm">
                        <HStack gap="sm" mb="xs">
                          <Text fontSize="sm" colorPalette="gray">
                            Seguridad:
                          </Text>
                          <Text fontSize="sm" fontWeight="semibold" color={
                            getPasswordStrength() >= 75 ? "success.500" :
                              getPasswordStrength() >= 50 ? "warning.500" : "error.500"
                          }>
                            {getPasswordStrength() >= 75 ? "Fuerte" :
                              getPasswordStrength() >= 50 ? "Media" : "Débil"}
                          </Text>
                        </HStack>
                        <Progress.Root
                          value={getPasswordStrength()}
                          size="sm"
                          colorPalette={
                            getPasswordStrength() >= 75 ? "green" :
                              getPasswordStrength() >= 50 ? "yellow" : "red"
                          }
                        >
                          <Progress.Track>
                            <Progress.Range />
                          </Progress.Track>
                        </Progress.Root>
                      </Box>
                    )}
                  </Box>
                </VStack>

                <Button
                  type="submit"
                  size="lg"
                  variant="solid"
                  colorPalette="purple"
                  disabled={isLoading || !email || !password}
                  loading={isLoading}
                >
                  <HStack gap="sm">
                    <ShieldCheckIcon style={{ width: '16px', height: '16px' }} />
                    <Text>Iniciar Sesión</Text>
                  </HStack>
                </Button>
              </VStack>
            </form>
          </CardWrapper.Body>

          <CardWrapper.Footer>
            <VStack gap="sm" w="full" textAlign="center">
              <Text fontSize="sm" colorPalette="gray">
                ¿Problemas para acceder? Contacta al administrador
              </Text>
              <HStack gap="xs" fontSize="sm" colorPalette="gray">
                <Text>Protegido por</Text>
                <ShieldCheckIcon style={{ width: '16px', height: '16px' }} />
                <Text fontWeight="medium">G-Admin Security</Text>
              </HStack>
            </VStack>
          </CardWrapper.Footer>
        </CardWrapper>
      </Presence>
    </Box>
  );
}