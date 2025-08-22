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
import { 
  EyeIcon, 
  EyeSlashIcon, 
  ShieldCheckIcon, 
  ArrowLeftIcon,
  CogIcon,
  ComputerDesktopIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useSmartRedirect } from '@/hooks/useSmartRedirect';
import { Card, Button, InputField, Layout, Typography, Stack, Badge } from '@/shared/ui';

export function AdminLoginPage() {
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
  
  // Fallback path for admin/staff
  const from = location.state?.from?.pathname || '/dashboard';

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

  // Validate form fields with stricter admin requirements
  const validateForm = () => {
    const errors: {email?: string; password?: string} = {};
    
    if (!email) {
      errors.email = 'Email corporativo requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Formato de email inválido';
    }
    
    if (!password) {
      errors.password = 'Contraseña requerida';
    } else if (password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Get password strength (relaxed for login but still professional)
  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 30;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 20;
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
      setError('Error de autenticación. Verifique sus credenciales.');
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
      bg={{ base: "gray.50", _dark: "gray.900" }}
      p="md"
      position="relative"
    >
      {/* Navigation bar */}
      <Box position="absolute" top="0" left="0" right="0" p="md">
        <HStack justify="space-between" align="center">
          <Button
            variant="ghost"
            size="sm"
            color="gray.600"
            _hover={{ bg: "gray.100" }}
            as={RouterLink}
            to="/"
          >
            <ArrowLeftIcon style={{ width: '16px', height: '16px' }} />
            Sitio público
          </Button>
          
          <Badge colorPalette="blue" variant="subtle">
            <CogIcon style={{ width: '12px', height: '12px' }} />
            Panel Administrativo
          </Badge>
        </HStack>
      </Box>

      <Presence
        present={mounted}
        animationName={{ _open: "scale-fade-in", _closed: "scale-fade-out" }}
        animationDuration="moderate"
      >
        <Card 
          variant="elevated" 
          padding="xl"
          maxW="md" 
          w="full"
          bg="white"
          borderTop="4px solid"
          borderTopColor="blue.500"
        >
          <Card.Header>
            <VStack gap="lg" textAlign="center">
              <Box
                p="lg"
                bg="blue.500"
                borderRadius="lg"
                color="white"
              >
                <ComputerDesktopIcon style={{ width: '40px', height: '40px' }} />
              </Box>
              <VStack gap="sm">
                <Typography variant="heading" color="primary">
                  G-Admin Sistema
                </Typography>
                <Typography variant="body" color="muted" textAlign="center">
                  Panel de administración y gestión empresarial
                </Typography>
              </VStack>
            </VStack>
          </Card.Header>
      
          <Card.Body>
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
                    label="Email Corporativo"
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e)}
                    placeholder="usuario@empresa.com"
                    required
                    disabled={isLoading}
                    error={formErrors.email}
                  />
                  
                  <Box w="full" position="relative">
                    <InputField
                      label="Contraseña de Acceso"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => handlePasswordChange(e)}
                      placeholder="••••••••••••"
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
                            Nivel de seguridad:
                          </Text>
                          <Text fontSize="sm" fontWeight="semibold" color={
                            getPasswordStrength() >= 75 ? "green.600" :
                            getPasswordStrength() >= 50 ? "yellow.600" : "red.600"
                          }>
                            {getPasswordStrength() >= 75 ? "Corporativo" :
                             getPasswordStrength() >= 50 ? "Estándar" : "Insuficiente"}
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
                  w="full"
                  size="lg"
                  variant="solid"
                  colorPalette="blue"
                  disabled={isLoading || !email || !password}
                  loading={isLoading}
                  loadingText="Autenticando..."
                >
                  <HStack gap="sm">
                    <ShieldCheckIcon style={{ width: '20px', height: '20px' }} />
                    <Text>Acceder al Sistema</Text>
                  </HStack>
                </Button>
                
              </VStack>
            </form>
          </Card.Body>
          
          <Card.Footer>
            <VStack gap="md" w="full" textAlign="center">
              <Stack gap="sm" align="center">
                <Typography variant="caption" color="muted">
                  Solo personal autorizado. Sesiones monitoreadas.
                </Typography>
                
                <HStack gap="sm">
                  <Typography variant="caption" color="muted">
                    ¿Problemas de acceso?
                  </Typography>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    color="blue.600"
                    onClick={() => alert('Contactar IT: admin@empresa.com')}
                  >
                    Soporte IT
                  </Button>
                </HStack>
              </Stack>
              
              <HStack gap="xs" fontSize="sm" color="gray.500" justify="center">
                <ShieldCheckIcon style={{ width: '16px', height: '16px' }} />
                <Typography variant="caption" color="muted">
                  Conexión segura SSL/TLS
                </Typography>
                <Text>🔒</Text>
              </HStack>
            </VStack>
          </Card.Footer>
        </Card>
      </Presence>
    </Box>
  );
}