import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Text,
  Presence,
  IconButton,
  Progress,
  Heading,
  Alert
} from '@chakra-ui/react';
import { EyeIcon, EyeSlashIcon, ShoppingBagIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useSmartRedirect } from '@/hooks';
import { CardWrapper, Button, InputField, Typography, Stack } from '@/shared/ui';

export default function CustomerLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{email?: string; password?: string}>({});
  const [mounted, setMounted] = useState(false);
  
  const { signIn, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { redirectAfterLogin, getDefaultRouteForRole } = useSmartRedirect();
  
  // Fallback path for customers
  const from = location.state?.from?.pathname || '/customer-portal';

  useEffect(() => {
    setMounted(true);
  }, []);

  // Double-check: Si ya está autenticado, redirigir inmediatamente
  useEffect(() => {
    if (isAuthenticated && user && user.role) {
      const defaultRoute = getDefaultRouteForRole(user.role);
      navigate(defaultRoute, { replace: true });
    }
  }, [isAuthenticated, user, navigate, getDefaultRouteForRole]);

  // Validate form fields
  const validateForm = () => {
    const errors: {email?: string; password?: string} = {};
    
    if (!email) {
      errors.email = 'Tu email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Por favor ingresa un email válido';
    }
    
    if (!password) {
      errors.password = 'Tu contraseña es requerida';
    } else if (password.length < 3) {
      errors.password = 'La contraseña debe tener al menos 3 caracteres';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Get password strength (relaxed for login)
  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 3) strength += 40; // Más permisivo
    if (password.length >= 6) strength += 30;
    if (/[A-Z]/.test(password) || /[0-9]/.test(password)) strength += 30;
    return Math.min(strength, 100);
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
        // Success - let AuthContext handle redirect via useEffect
        return;
      }
    } catch (error) {
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
      bg="linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ffaa44 100%)"
      p="md"
      position="relative"
    >
      {/* Back to home button */}
      <Box position="absolute" top="md" left="md">
        <Button
          variant="ghost"
          size="sm"
          color="white"
          _hover={{ bg: "rgba(255,255,255,0.1)" }}
          as={RouterLink}
          to="/"
        >
          <ArrowLeftIcon style={{ width: '16px', height: '16px' }} />
          Volver al inicio
        </Button>
      </Box>

      <Presence
        present={mounted}
        animationName={{ _open: "scale-fade-in", _closed: "scale-fade-out" }}
        animationDuration="moderate"
      >
        <CardWrapper variant="elevated" 
          padding="xl"
          maxW="md" 
          w="full"
          bg="white"
          shadow="2xl"
        >
          <CardWrapper.Header>
            <VStack gap="lg" textAlign="center">
              <Box
                p="lg"
                bg="linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)"
                borderRadius="full"
                color="white"
              >
                <ShoppingBagIcon style={{ width: '40px', height: '40px' }} />
              </Box>
              <VStack gap="sm">
                <Typography variant="heading" color="text.primary">
                  ¡Bienvenido de vuelta!
                </Typography>
                <Typography variant="body" color="text.muted" textAlign="center">
                  Inicia sesión para hacer tu pedido favorito
                </Typography>
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
                    label="Tu Email"
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
                      label="Tu Contraseña"
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
                          <Text fontSize="sm" color="gray.600">
                            Seguridad:
                          </Text>
                          <Text fontSize="sm" fontWeight="semibold" color={
                            getPasswordStrength() >= 70 ? "green.500" :
                            getPasswordStrength() >= 40 ? "orange.500" : "red.500"
                          }>
                            {getPasswordStrength() >= 70 ? "Perfecta" :
                             getPasswordStrength() >= 40 ? "Buena" : "Válida"}
                          </Text>
                        </HStack>
                        <Progress.Root 
                          value={getPasswordStrength()} 
                          size="sm" 
                          colorPalette={
                            getPasswordStrength() >= 70 ? "green" :
                            getPasswordStrength() >= 40 ? "orange" : "red"
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
                  w="full"
                  size="lg"
                  variant="solid"
                  bg="linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)"
                  color="white"
                  _hover={{ 
                    bg: "linear-gradient(135deg, #ff5722 0%, #f57c00 100%)",
                    transform: "translateY(-1px)",
                    shadow: "lg"
                  }}
                  disabled={isLoading || !email || !password}
                  loading={isLoading}
                  loadingText="Iniciando sesión..."
                >
                  <HStack gap="sm">
                    <ShoppingBagIcon style={{ width: '20px', height: '20px' }} />
                    <Text>Iniciar Sesión</Text>
                  </HStack>
                </Button>
              </VStack>
            </form>
          </CardWrapper.Body>
          
          <CardWrapper.Footer>
            <VStack gap="md" w="full" textAlign="center">
              <Stack gap="sm" align="center">
                <Typography variant="body" color="text.muted">
                  ¿Primera vez en La Gigante?
                </Typography>
                <Button 
                  variant="outline" 
                  size="md"
                  colorPalette="accent"
                  // TODO: Link to register page when implemented
                  onClick={() => alert('Registro próximamente disponible')}
                >
                  Crear Cuenta Nueva
                </Button>
              </Stack>
              
              <HStack gap="sm" justify="center">
                <Typography variant="caption" color="text.muted">
                  ¿Problemas para acceder?
                </Typography>
                <Button 
                  variant="ghost" 
                  size="sm"
                  color="orange.600"
                  onClick={() => alert('Contactar: (011) 4567-8900')}
                >
                  Ayuda
                </Button>
              </HStack>
              
              <HStack gap="xs" fontSize="sm" color="gray.500" justify="center">
                <Text>🍕</Text>
                <Typography variant="caption" color="text.muted">
                  Protegido y seguro
                </Typography>
                <Text>🔒</Text>
              </HStack>
            </VStack>
          </CardWrapper.Footer>
        </CardWrapper>
      </Presence>
    </Box>
  );
}