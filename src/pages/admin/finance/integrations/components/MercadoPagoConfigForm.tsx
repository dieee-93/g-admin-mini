/**
 * MercadoPago Configuration Form
 * Specific form for configuring MercadoPago gateway with test/production mode
 * Professional UX following Stripe/Shopify patterns
 */

import React, { useState } from 'react';
import {
  FormSection,
  InputField,
  Stack,
  Button,
  Switch,
  Alert,
  Badge,
  Box,
  Flex,
  Text,
} from '@/shared/ui';
import { Icon } from '@/shared/ui';
import { CheckCircleIcon, XCircleIcon, BoltIcon, QuestionMarkCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { TooltipRoot, TooltipTrigger, TooltipContent } from '@chakra-ui/react';

export interface MercadoPagoConfig {
  test_mode: boolean;
  public_key: string;
  access_token: string;
  webhook_url?: string;
  webhook_secret?: string;
  currency: string;
  capture_mode: 'auto' | 'manual';
}

interface AccountInfo {
  user_id: number;
  email: string;
  site_id: string;
  nickname: string;
  last_tested?: string;
}

interface MercadoPagoConfigFormProps {
  initialConfig?: Partial<MercadoPagoConfig>;
  onChange: (config: MercadoPagoConfig) => void;
  onTestConnection?: (config: MercadoPagoConfig) => Promise<AccountInfo | boolean>;
}

const DEFAULT_CONFIG: MercadoPagoConfig = {
  test_mode: true,
  public_key: '',
  access_token: '',
  webhook_url: '',
  webhook_secret: '',
  currency: 'ARS',
  capture_mode: 'auto',
};

export function MercadoPagoConfigForm({
  initialConfig,
  onChange,
  onTestConnection
}: MercadoPagoConfigFormProps) {
  const [config, setConfig] = useState<MercadoPagoConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
  });

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'testing' | 'connected' | 'error'>('disconnected');
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Update parent when config changes
  React.useEffect(() => {
    onChange(config);
  }, [config, onChange]);

  const handleFieldChange = (field: keyof MercadoPagoConfig) => (value: string | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: '' }));

    // Reset connection status when credentials change
    if (field === 'public_key' || field === 'access_token' || field === 'test_mode') {
      setConnectionStatus('disconnected');
      setAccountInfo(null);
    }
  };

  const handleTestConnection = async () => {
    if (!onTestConnection) return;

    // Validate required fields
    const errors: Record<string, string> = {};
    if (!config.public_key.trim()) {
      errors.public_key = 'Public Key es requerido';
    }
    if (!config.access_token.trim()) {
      errors.access_token = 'Access Token es requerido';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('testing');
    setAccountInfo(null);

    try {
      const result = await onTestConnection(config);

      // Check if result is AccountInfo or just boolean
      if (typeof result === 'object' && result !== null) {
        // It's AccountInfo - production mode
        setAccountInfo({
          ...result,
          last_tested: new Date().toISOString(),
        });
        setConnectionStatus('connected');
      } else if (result === true) {
        // It's boolean true - development mode (format validation)
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      setConnectionStatus('error');
      setAccountInfo(null);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const getKeyPrefix = (key: string): string => {
    // MercadoPago credentials can start with APP_USR- or TEST- in both modes
    // The actual difference is in the account configuration, not the prefix
    if (key.startsWith('APP_USR-') || key.startsWith('TEST-')) {
      return '✅ Válido';
    }
    return '⚠️ Formato incorrecto (debe empezar con APP_USR- o TEST-)';
  };

  const formatLastTested = (timestamp: string | undefined): string => {
    if (!timestamp) return 'Nunca';

    const now = new Date();
    const tested = new Date(timestamp);
    const diffMs = now.getTime() - tested.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Justo ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)} horas`;
    return `Hace ${Math.floor(diffMins / 1440)} días`;
  };

  // Status badge configuration
  const statusBadgeConfig = {
    disconnected: {
      colorPalette: 'gray' as const,
      text: 'No Conectado',
      icon: XCircleIcon,
    },
    testing: {
      colorPalette: 'blue' as const,
      text: 'Probando...',
      icon: BoltIcon,
    },
    connected: {
      colorPalette: 'green' as const,
      text: 'Conectado',
      icon: CheckCircleIcon,
    },
    error: {
      colorPalette: 'red' as const,
      text: 'Error',
      icon: XCircleIcon,
    },
  };

  const currentStatusConfig = statusBadgeConfig[connectionStatus];

  return (
    <Stack gap="lg">
      {/* Status Badge & Connection Info */}
      <Box
        p="4"
        borderWidth="1px"
        borderRadius="md"
        borderColor={connectionStatus === 'connected' ? 'green.200' : 'gray.200'}
        bg={connectionStatus === 'connected' ? 'green.50' : 'gray.50'}
      >
        <Flex justify="space-between" align="center" mb={accountInfo ? '3' : '0'}>
          <Flex align="center" gap="2">
            <Text fontWeight="semibold" fontSize="md">
              Estado de Integración
            </Text>
            <Badge
              colorPalette={currentStatusConfig.colorPalette}
              variant="solid"
              size="md"
            >
              <Flex align="center" gap="1">
                {isTestingConnection ? (
                  <Box as="span" display="inline-block" animation="spin 1s linear infinite">
                    ⟳
                  </Box>
                ) : (
                  <Icon as={currentStatusConfig.icon} boxSize="3" />
                )}
                {currentStatusConfig.text}
              </Flex>
            </Badge>
          </Flex>
        </Flex>

        {/* Account Info - Solo cuando está conectado */}
        {accountInfo && connectionStatus === 'connected' && (
          <Stack gap="2" mt="3" pt="3" borderTopWidth="1px" borderColor="green.200">
            <Flex align="center" gap="2">
              <Icon as={CheckCircleIcon} color="green.600" boxSize="4" />
              <Text fontSize="sm" fontWeight="medium">
                Conectado como: <strong>{accountInfo.email}</strong>
              </Text>
            </Flex>
            <Flex gap="4" fontSize="sm" color="gray.600">
              <Text>
                <strong>User ID:</strong> {accountInfo.user_id}
              </Text>
              <Text>
                <strong>Ambiente:</strong> {config.test_mode ? 'Test (Sandbox)' : 'Producción'}
              </Text>
              <Text>
                <strong>Última prueba:</strong> {formatLastTested(accountInfo.last_tested)}
              </Text>
            </Flex>
          </Stack>
        )}
      </Box>

      {/* Mode Toggle */}
      <FormSection title="Modo de Operación">
        <Stack gap="md">
          <Stack direction="row" justify="space-between" align="center">
            <Stack gap="0">
              <strong>Modo de Prueba (Test)</strong>
              <small style={{ color: 'var(--colors-gray-600)' }}>
                {config.test_mode
                  ? '🟡 Usando credenciales de prueba (no cobra dinero real)'
                  : '🟢 Usando credenciales de producción (cobra dinero real)'}
              </small>
            </Stack>
            <Switch
              checked={config.test_mode}
              onCheckedChange={(checked) => handleFieldChange('test_mode')(checked.checked)}
            />
          </Stack>

          {!config.test_mode && (
            <Alert status="warning" title="Modo Producción Activo">
              <strong>⚠️ ADVERTENCIA:</strong> Estás en modo producción.
              Los pagos procesarán dinero real. Asegúrate de que tus credenciales sean correctas.
            </Alert>
          )}
        </Stack>
      </FormSection>

      {/* API Credentials */}
      <FormSection title="Credenciales de API">
        <Stack gap="md">
          {/* Public Key with Tooltip */}
          <Box>
            <Flex align="center" gap="2" mb="2">
              <Text fontWeight="medium" fontSize="sm">
                Public Key {config.test_mode ? '(TEST)' : '(PRODUCCIÓN)'} *
              </Text>
              <TooltipRoot>
                <TooltipTrigger asChild>
                  <Box cursor="pointer" display="inline-flex">
                    <Icon as={QuestionMarkCircleIcon} boxSize="4" color="gray.500" />
                  </Box>
                </TooltipTrigger>
                <TooltipContent maxW="300px" p="3">
                  <Stack gap="2">
                    <Text fontWeight="semibold" fontSize="sm">
                      ¿Dónde encontrar tu Public Key?
                    </Text>
                    <Text fontSize="xs">
                      1. Ve a{' '}
                      <a
                        href="https://www.mercadopago.com.ar/developers/panel/app"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'underline', color: '#0070f3' }}
                      >
                        MercadoPago Developers
                      </a>
                    </Text>
                    <Text fontSize="xs">2. Selecciona tu aplicación</Text>
                    <Text fontSize="xs">3. Ve a "Credenciales"</Text>
                    <Text fontSize="xs">
                      4. Copia la {config.test_mode ? 'Public Key de prueba' : 'Public Key de producción'}
                    </Text>
                    <Text fontSize="xs" mt="2" color="blue.600">
                      Formato: APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
                    </Text>
                  </Stack>
                </TooltipContent>
              </TooltipRoot>
            </Flex>
            <InputField
              value={config.public_key}
              onChange={(e) => handleFieldChange('public_key')(e.target.value)}
              placeholder={config.test_mode ? 'TEST-xxx-xxx' : 'APP_USR-xxx-xxx'}
              type="password"
              style={{
                borderColor: fieldErrors.public_key ? 'var(--colors-error)' : undefined,
                fontFamily: 'monospace',
                fontSize: '14px'
              }}
            />
          </Box>
          {config.public_key && (
            <small style={{ color: 'var(--colors-gray-600)' }}>
              {getKeyPrefix(config.public_key)}
            </small>
          )}
          {fieldErrors.public_key && (
            <span style={{ color: 'var(--colors-error)', fontSize: '14px' }}>
              {fieldErrors.public_key}
            </span>
          )}

          {/* Access Token with Tooltip */}
          <Box>
            <Flex align="center" gap="2" mb="2">
              <Text fontWeight="medium" fontSize="sm">
                Access Token {config.test_mode ? '(TEST)' : '(PRODUCCIÓN)'} *
              </Text>
              <TooltipRoot>
                <TooltipTrigger asChild>
                  <Box cursor="pointer" display="inline-flex">
                    <Icon as={QuestionMarkCircleIcon} boxSize="4" color="gray.500" />
                  </Box>
                </TooltipTrigger>
                <TooltipContent maxW="300px" p="3">
                  <Stack gap="2">
                    <Text fontWeight="semibold" fontSize="sm" color="red.600">
                      ⚠️ Access Token (Privado)
                    </Text>
                    <Text fontSize="xs">
                      Este token permite realizar operaciones en tu cuenta de MercadoPago.
                    </Text>
                    <Text fontSize="xs" fontWeight="bold" color="red.600">
                      NUNCA compartas esta clave públicamente.
                    </Text>
                    <Text fontSize="xs" mt="2">
                      Encuéntralo en el mismo lugar que la Public Key, en la sección "Credenciales".
                    </Text>
                    <Text fontSize="xs" mt="2" color="blue.600">
                      Formato: APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
                    </Text>
                  </Stack>
                </TooltipContent>
              </TooltipRoot>
            </Flex>
            <InputField
              value={config.access_token}
              onChange={(e) => handleFieldChange('access_token')(e.target.value)}
              placeholder={config.test_mode ? 'TEST-xxx-xxx' : 'APP_USR-xxx-xxx'}
              type="password"
              style={{
                borderColor: fieldErrors.access_token ? 'var(--colors-error)' : undefined,
                fontFamily: 'monospace',
                fontSize: '14px'
              }}
            />
          </Box>
          {config.access_token && (
            <small style={{ color: 'var(--colors-gray-600)' }}>
              {getKeyPrefix(config.access_token)}
            </small>
          )}
          {fieldErrors.access_token && (
            <span style={{ color: 'var(--colors-error)', fontSize: '14px' }}>
              {fieldErrors.access_token}
            </span>
          )}

          <Alert status="info" title="Dónde obtener las credenciales">
            <ol style={{ marginLeft: '20px', marginTop: '8px' }}>
              <li>Ingresa a <a href="https://www.mercadopago.com.ar/developers" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--colors-blue-600)', textDecoration: 'underline' }}>MercadoPago Developers</a></li>
              <li>Ve a "Tus integraciones" → Selecciona tu aplicación</li>
              <li>En "Credenciales" encontrarás las keys de Test y Producción</li>
            </ol>
          </Alert>

          {/* Test Connection Button */}
          {onTestConnection && (
            <Stack gap="sm">
              {/* Connection info notice */}
              {connectionStatus === 'disconnected' && (
                <Alert status="info" title="Test de Conexión">
                  <Flex align="start" gap="2">
                    <Icon as={InformationCircleIcon} boxSize="5" color="blue.600" mt="0.5" />
                    <Stack gap="1">
                      <Text fontSize="sm">
                        El test de conexión verificará tus credenciales con la API de MercadoPago.
                      </Text>
                      <Text fontSize="sm">
                        Asegúrate de tener <strong>vercel dev</strong> corriendo para que funcione.
                      </Text>
                    </Stack>
                  </Flex>
                </Alert>
              )}

              <Button
                onClick={handleTestConnection}
                disabled={isTestingConnection || !config.public_key || !config.access_token}
                colorPalette={
                  connectionStatus === 'connected' ? 'green' :
                  connectionStatus === 'error' ? 'red' :
                  connectionStatus === 'testing' ? 'blue' : 'gray'
                }
                variant={connectionStatus === 'disconnected' ? 'outline' : 'solid'}
                size="lg"
              >
                {isTestingConnection ? (
                  <>
                    <Box as="span" display="inline-block" animation="spin 1s linear infinite" mr="2">
                      ⟳
                    </Box>
                    Probando conexión...
                  </>
                ) : connectionStatus === 'connected' ? (
                  <>
                    <Icon as={CheckCircleIcon} mr="2" />
                    ✅ Conexión Exitosa
                  </>
                ) : connectionStatus === 'error' ? (
                  <>
                    <Icon as={XCircleIcon} mr="2" />
                    ❌ Error - Reintentar
                  </>
                ) : (
                  <>
                    <Icon as={BoltIcon} mr="2" />
                    Probar Conexión
                  </>
                )}
              </Button>

              {connectionStatus === 'connected' && !accountInfo && (
                <Alert status="success" title="Conexión Exitosa">
                  <Stack gap="2">
                    <Text fontSize="sm">
                      ✅ Las credenciales son válidas y la conexión fue exitosa.
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Guarda la configuración para comenzar a procesar pagos.
                    </Text>
                  </Stack>
                </Alert>
              )}

              {connectionStatus === 'connected' && accountInfo && (
                <Alert status="success" title="Conexión Verificada con MercadoPago">
                  <Stack gap="3">
                    <Flex align="center" gap="2">
                      <Icon as={CheckCircleIcon} color="green.600" boxSize="5" />
                      <Text fontSize="sm" fontWeight="semibold">
                        Las credenciales son válidas y la API responde correctamente
                      </Text>
                    </Flex>
                    <Box
                      p="3"
                      bg="green.50"
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="green.200"
                    >
                      <Stack gap="2">
                        <Text fontSize="sm">
                          <strong>Cuenta:</strong> {accountInfo.email}
                        </Text>
                        <Text fontSize="sm">
                          <strong>Nickname:</strong> {accountInfo.nickname}
                        </Text>
                        <Text fontSize="sm">
                          <strong>Site ID:</strong> {accountInfo.site_id}
                        </Text>
                      </Stack>
                    </Box>
                    <Text fontSize="xs" color="gray.600">
                      ¡Todo listo! Guarda la configuración para empezar a procesar pagos.
                    </Text>
                  </Stack>
                </Alert>
              )}

              {connectionStatus === 'error' && (
                <Alert status="error" title="Error al Verificar Conexión">
                  <Stack gap="3">
                    <Flex align="start" gap="2">
                      <Icon as={XCircleIcon} color="red.600" boxSize="5" mt="0.5" />
                      <Stack gap="2">
                        <Text fontSize="sm" fontWeight="semibold">
                          No se pudo conectar con MercadoPago
                        </Text>
                        <Text fontSize="sm">
                          Verifica que las credenciales sean correctas y correspondan al modo seleccionado
                        </Text>
                      </Stack>
                    </Flex>
                    <Box
                      p="3"
                      bg="red.50"
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="red.200"
                    >
                      <Text fontSize="sm" fontWeight="semibold" mb="2">
                        Checklist de verificación:
                      </Text>
                      <Stack gap="1" fontSize="xs">
                        <Text>✓ Las credenciales empiezan con APP_USR- o TEST-</Text>
                        <Text>✓ Estás usando las credenciales del ambiente correcto (Test/Producción)</Text>
                        <Text>✓ Las credenciales fueron copiadas sin espacios adicionales</Text>
                        <Text>✓ Tu cuenta de MercadoPago está activa</Text>
                      </Stack>
                    </Box>
                  </Stack>
                </Alert>
              )}
            </Stack>
          )}
        </Stack>
      </FormSection>

      {/* Webhook Configuration */}
      <FormSection title="Webhooks (Notificaciones)">
        <Stack gap="md">
          <Alert status="info" title="Configuración de Webhooks">
            Los webhooks permiten que MercadoPago notifique a tu aplicación cuando ocurre un pago.
            Configura esta URL en tu panel de MercadoPago para recibir notificaciones automáticas.
          </Alert>

          <InputField
            label="Webhook URL"
            value={config.webhook_url || ''}
            onChange={(e) => handleFieldChange('webhook_url')(e.target.value)}
            placeholder="https://tuapp.com/api/webhooks/mercadopago"
            type="url"
            style={{ fontFamily: 'monospace', fontSize: '14px' }}
          />

          <InputField
            label="Webhook Secret (Opcional)"
            value={config.webhook_secret || ''}
            onChange={(e) => handleFieldChange('webhook_secret')(e.target.value)}
            placeholder="secret_xxx"
            type="password"
            style={{ fontFamily: 'monospace', fontSize: '14px' }}
          />
        </Stack>
      </FormSection>

      {/* Additional Settings */}
      <FormSection title="Configuración Adicional">
        <Stack gap="md">
          <InputField
            label="Moneda"
            value={config.currency}
            onChange={(e) => handleFieldChange('currency')(e.target.value)}
            disabled
            style={{ fontFamily: 'monospace' }}
          />
          <small style={{ color: 'var(--colors-gray-600)', marginTop: '-8px' }}>
            Argentina utiliza ARS (Peso Argentino)
          </small>

          <Stack direction="row" justify="space-between" align="center">
            <Stack gap="0">
              <strong>Modo de Captura</strong>
              <small style={{ color: 'var(--colors-gray-600)' }}>
                {config.capture_mode === 'auto'
                  ? 'Automático: El dinero se captura inmediatamente'
                  : 'Manual: Requiere captura manual después de la autorización'}
              </small>
            </Stack>
            <Badge colorPalette={config.capture_mode === 'auto' ? 'green' : 'orange'}>
              {config.capture_mode === 'auto' ? 'Automático' : 'Manual'}
            </Badge>
          </Stack>
        </Stack>
      </FormSection>

      {/* Summary */}
      <Alert status="info" title="Resumen de Configuración">
        <Stack gap="xs">
          <p><strong>Modo:</strong> {config.test_mode ? '🟡 Prueba (Test)' : '🟢 Producción (Live)'}</p>
          <p><strong>Public Key:</strong> {config.public_key ? '***' + config.public_key.slice(-8) : 'No configurado'}</p>
          <p><strong>Access Token:</strong> {config.access_token ? '***' + config.access_token.slice(-8) : 'No configurado'}</p>
          <p><strong>Webhook:</strong> {config.webhook_url || 'No configurado'}</p>
          <p><strong>Moneda:</strong> {config.currency}</p>
        </Stack>
      </Alert>
    </Stack>
  );
}
