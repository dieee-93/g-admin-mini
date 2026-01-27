/**
 * MODO Configuration Form
 * Specific form for configuring MODO gateway with test/production mode
 *
 * MODO is the digital wallet of 30+ Argentine banks consortium
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
} from '@/shared/ui';
import { Icon } from '@/shared/ui';
import { CheckCircleIcon, XCircleIcon, BoltIcon, QrCodeIcon } from '@heroicons/react/24/outline';

export interface MODOConfig {
  test_mode: boolean;
  api_key: string;
  merchant_id: string;
  webhook_url?: string;
  webhook_secret?: string;
  qr_expiration_minutes: number;
}

interface MODOConfigFormProps {
  initialConfig?: Partial<MODOConfig>;
  onChange: (config: MODOConfig) => void;
  onTestConnection?: (config: MODOConfig) => Promise<boolean>;
}

const DEFAULT_CONFIG: MODOConfig = {
  test_mode: true,
  api_key: '',
  merchant_id: '',
  webhook_url: '',
  webhook_secret: '',
  qr_expiration_minutes: 15,
};

export function MODOConfigForm({
  initialConfig,
  onChange,
  onTestConnection
}: MODOConfigFormProps) {
  const [config, setConfig] = useState<MODOConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig,
  });

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Update parent when config changes
  React.useEffect(() => {
    onChange(config);
  }, [config, onChange]);

  const handleFieldChange = (field: keyof MODOConfig) => (value: string | boolean | number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
    setConnectionStatus('idle');
  };

  const handleTestConnection = async () => {
    if (!onTestConnection) return;

    // Validate required fields
    const errors: Record<string, string> = {};
    if (!config.api_key.trim()) {
      errors.api_key = 'API Key es requerido';
    }
    if (!config.merchant_id.trim()) {
      errors.merchant_id = 'Merchant ID es requerido';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('idle');

    try {
      const isValid = await onTestConnection(config);
      setConnectionStatus(isValid ? 'success' : 'error');
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <Stack gap="lg">
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
          <InputField
            label={`API Key ${config.test_mode ? '(TEST)' : '(PRODUCCIÓN)'} *`}
            value={config.api_key}
            onChange={(e) => handleFieldChange('api_key')(e.target.value)}
            placeholder={config.test_mode ? 'test_xxx...' : 'prod_xxx...'}
            type="password"
            style={{
              borderColor: fieldErrors.api_key ? 'var(--colors-error)' : undefined,
              fontFamily: 'monospace',
              fontSize: '14px'
            }}
          />
          {fieldErrors.api_key && (
            <small style={{ color: 'var(--colors-error)' }}>{fieldErrors.api_key}</small>
          )}
          {config.api_key && (
            <small style={{ color: 'var(--colors-gray-600)' }}>
              {config.test_mode
                ? '💡 Keys de prueba comienzan con test_'
                : '🔐 Keys de producción comienzan con prod_'}
            </small>
          )}

          <InputField
            label="Merchant ID *"
            value={config.merchant_id}
            onChange={(e) => handleFieldChange('merchant_id')(e.target.value)}
            placeholder="merchant_xxx..."
            type="text"
            style={{
              borderColor: fieldErrors.merchant_id ? 'var(--colors-error)' : undefined,
              fontFamily: 'monospace',
              fontSize: '14px'
            }}
          />
          {fieldErrors.merchant_id && (
            <small style={{ color: 'var(--colors-error)' }}>{fieldErrors.merchant_id}</small>
          )}
          <small style={{ color: 'var(--colors-gray-600)' }}>
            Tu ID de comercio en MODO. Lo encuentras en el panel de MODO.
          </small>

          {/* Test Connection Button */}
          <Button
            onClick={handleTestConnection}
            disabled={isTestingConnection}
            loading={isTestingConnection}
            colorPalette="blue"
            variant="outline"
          >
            <Icon as={BoltIcon} />
            {isTestingConnection ? 'Probando...' : 'Probar Conexión'}
          </Button>

          {/* Connection Status */}
          {connectionStatus === 'success' && (
            <Alert status="success">
              <Icon as={CheckCircleIcon} />
              <Stack gap="1">
                <strong>✅ Conexión exitosa</strong>
                <small>Las credenciales son válidas y MODO está respondiendo correctamente.</small>
              </Stack>
            </Alert>
          )}

          {connectionStatus === 'error' && (
            <Alert status="error">
              <Icon as={XCircleIcon} />
              <Stack gap="1">
                <strong>❌ Error de conexión</strong>
                <small>No se pudo conectar con MODO. Verifica tus credenciales.</small>
              </Stack>
            </Alert>
          )}
        </Stack>
      </FormSection>

      {/* QR Configuration */}
      <FormSection title="Configuración de QR">
        <Stack gap="md">
          <InputField
            label="Tiempo de Expiración (minutos)"
            value={config.qr_expiration_minutes.toString()}
            onChange={(e) => handleFieldChange('qr_expiration_minutes')(parseInt(e.target.value) || 15)}
            type="number"
            min={1}
            max={60}
          />
          <small style={{ color: 'var(--colors-gray-600)' }}>
            <Icon as={QrCodeIcon} style={{ display: 'inline', marginRight: '4px' }} />
            Los códigos QR expirarán después de este tiempo (recomendado: 15 minutos)
          </small>
        </Stack>
      </FormSection>

      {/* Webhook Configuration */}
      <FormSection title="Configuración de Webhooks">
        <Stack gap="md">
          <InputField
            label="Webhook URL"
            value={config.webhook_url || ''}
            onChange={(e) => handleFieldChange('webhook_url')(e.target.value)}
            placeholder="https://tu-dominio.com/api/webhooks/modo"
            type="url"
            style={{
              fontFamily: 'monospace',
              fontSize: '14px'
            }}
          />
          <small style={{ color: 'var(--colors-gray-600)' }}>
            URL pública donde MODO enviará las notificaciones de pago.
            Debe ser HTTPS y estar accesible desde internet.
          </small>

          <InputField
            label="Webhook Secret (opcional)"
            value={config.webhook_secret || ''}
            onChange={(e) => handleFieldChange('webhook_secret')(e.target.value)}
            placeholder="webhook_secret_xxx..."
            type="password"
            style={{
              fontFamily: 'monospace',
              fontSize: '14px'
            }}
          />
          <small style={{ color: 'var(--colors-gray-600)' }}>
            Secret para verificar la autenticidad de los webhooks de MODO.
          </small>
        </Stack>
      </FormSection>

      {/* Configuration Summary */}
      <FormSection title="Resumen de Configuración">
        <Stack gap="sm" style={{
          backgroundColor: 'var(--colors-gray-50)',
          padding: '1rem',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <Stack direction="row" justify="space-between">
            <span>Modo:</span>
            <Badge colorPalette={config.test_mode ? 'yellow' : 'green'}>
              {config.test_mode ? 'Test' : 'Producción'}
            </Badge>
          </Stack>
          <Stack direction="row" justify="space-between">
            <span>API Key:</span>
            <span style={{ fontFamily: 'monospace' }}>
              {config.api_key ? '***' + config.api_key.slice(-6) : 'No configurado'}
            </span>
          </Stack>
          <Stack direction="row" justify="space-between">
            <span>Merchant ID:</span>
            <span style={{ fontFamily: 'monospace' }}>
              {config.merchant_id || 'No configurado'}
            </span>
          </Stack>
          <Stack direction="row" justify="space-between">
            <span>QR Expiration:</span>
            <span>{config.qr_expiration_minutes} minutos</span>
          </Stack>
          <Stack direction="row" justify="space-between">
            <span>Webhook:</span>
            <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
              {config.webhook_url ? config.webhook_url.slice(0, 40) + '...' : 'No configurado'}
            </span>
          </Stack>
        </Stack>
      </FormSection>

      {/* Help & Documentation */}
      <FormSection title="Ayuda y Documentación">
        <Stack gap="sm" style={{ fontSize: '14px' }}>
          <p>
            🏦 <strong>MODO</strong> es la billetera digital del consorcio de 30+ bancos argentinos.
          </p>
          <Stack gap="xs">
            <a
              href="https://docs.modo.com.ar/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--colors-blue-600)' }}
            >
              📖 Documentación de MODO
            </a>
            <a
              href="https://www.modo.com.ar/conexiones"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--colors-blue-600)' }}
            >
              🔗 MODO Conexiones
            </a>
            <a
              href="https://docs.modo.com.ar/api-docs/api-cliente"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--colors-blue-600)' }}
            >
              🛠️ API Cliente Documentation
            </a>
          </Stack>
        </Stack>
      </FormSection>
    </Stack>
  );
}
