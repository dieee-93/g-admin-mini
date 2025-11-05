/**
 * Payment Integration Form Modal
 * Pure presentational component - follows Material Form Pattern
 *
 * Created: 2025-02-01
 * Pattern: Material Form Pattern (UI separated from business logic)
 * Business Logic: See usePaymentIntegrationForm hook
 */

import React from 'react';
import {
  Dialog,
  Stack,
  Button,
  Alert,
  Badge,
  Progress,
  Field,
  Input,
  NativeSelect as Select,
  Checkbox,
  Text,
  Card,
  Grid,
  GridItem
} from '@/shared/ui';
import { usePaymentIntegrationForm, type PaymentIntegration } from '../hooks';
import { notify } from '@/lib/notifications';
import { logger } from '@/lib/logging';

interface PaymentIntegrationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  integration?: PaymentIntegration;
  onSuccess?: () => void;
}

export const PaymentIntegrationFormModal: React.FC<PaymentIntegrationFormModalProps> = ({
  isOpen,
  onClose,
  integration,
  onSuccess
}) => {

  // ===== HOOK =====
  const {
    form,
    formData,
    isEditMode,
    fieldErrors,
    fieldWarnings,
    validationState,
    integrationSecurity,
    isValidating,
    isSaving,
    isTesting,
    integrationCreated,
    modalTitle,
    submitButtonContent,
    formStatusBadge,
    operationProgress,
    securityBadge,
    providerName,
    testConnection,
    handleSubmit
  } = usePaymentIntegrationForm({
    integration,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
    onSubmit: async (data) => {
      // Simulate API call
      logger.info('PaymentIntegration', 'Creating/updating payment integration:', data);

      // In production, this would call:
      // await createPaymentIntegration(data) or await updatePaymentIntegration(id, data)

      notify.success({
        title: isEditMode ? 'Integración actualizada' : 'Integración creada',
        description: `La integración con ${providerName} fue ${isEditMode ? 'actualizada' : 'creada'} exitosamente`
      });
    }
  });

  const { register, formState } = form;
  const { isSubmitting } = formState;

  // ===== FIELD HELPER =====
  const getFieldStyle = (fieldName: keyof typeof fieldErrors) => ({
    borderColor: fieldErrors[fieldName] ? 'var(--border-error)' :
                 fieldWarnings[fieldName] ? 'var(--border-warning)' :
                 undefined
  });

  // ===== TEST CONNECTION HANDLER =====
  const handleTestConnection = async () => {
    const result = await testConnection();

    if (result.success) {
      notify.success({
        title: 'Conexión exitosa',
        description: result.message
      });
    } else {
      notify.error({
        title: 'Error de conexión',
        description: result.message
      });
    }
  };

  // ===== RENDER =====
  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()} size="xl">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>{modalTitle}</Dialog.Title>
            <Dialog.CloseTrigger onClick={onClose} />
          </Dialog.Header>

          <Dialog.Body>
            <form onSubmit={handleSubmit} id="payment-integration-form">
              <Stack gap="6">

                {/* ===== VALIDATION SUMMARY ===== */}
                {validationState.hasErrors && (
                  <Alert status="error" title={`${validationState.errorCount} error(es) de validación`}>
                    Por favor corrige los errores antes de continuar
                  </Alert>
                )}

                {validationState.hasWarnings && !validationState.hasErrors && (
                  <Alert status="warning" title={`${validationState.warningCount} advertencia(s)`}>
                    Revisa las advertencias antes de guardar
                  </Alert>
                )}

                {/* ===== FORM STATUS + SECURITY ===== */}
                <Stack direction="row" gap="2" justify="space-between" align="center">
                  <Stack direction="row" gap="2">
                    <Badge colorPalette={formStatusBadge.color} size="sm">
                      {formStatusBadge.text}
                    </Badge>
                    <Badge colorPalette={securityBadge.color} size="sm">
                      {securityBadge.text}
                    </Badge>
                    {connectionTested && (
                      <Badge colorPalette="green" size="sm">
                        ✓ Conexión probada
                      </Badge>
                    )}
                  </Stack>

                  {operationProgress > 0 && (
                    <Text fontSize="sm" color="fg.muted">
                      Progreso: {operationProgress}%
                    </Text>
                  )}
                </Stack>

                {/* ===== PROGRESS INDICATOR ===== */}
                {(isValidating || isSaving || integrationCreated) && (
                  <Stack gap="2">
                    <Progress.Root value={operationProgress} size="sm">
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                    <Text fontSize="sm" color="fg.muted">
                      {isValidating && '⏳ Validando credenciales...'}
                      {isSaving && '💾 Guardando integración...'}
                      {integrationCreated && '✓ Completado'}
                    </Text>
                  </Stack>
                )}

                {/* ===== SECURITY METRICS ===== */}
                <Card.Root>
                  <Card.Header>
                    <Card.Title>Análisis de Seguridad</Card.Title>
                    <Card.Description>Nivel de seguridad de la integración</Card.Description>
                  </Card.Header>
                  <Card.Body>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap="4">
                      <GridItem>
                        <Stack gap="1">
                          <Text fontSize="sm" color="fg.muted">Puntaje de Seguridad</Text>
                          <Text fontSize="2xl" fontWeight="bold" color={
                            integrationSecurity.securityLevel === 'high' ? 'green.500' :
                            integrationSecurity.securityLevel === 'medium' ? 'blue.500' :
                            integrationSecurity.securityLevel === 'low' ? 'orange.500' :
                            'red.500'
                          }>
                            {integrationSecurity.securityScore}/100
                          </Text>
                        </Stack>
                      </GridItem>

                      <GridItem>
                        <Stack gap="1">
                          <Text fontSize="sm" color="fg.muted">Fortaleza de Claves</Text>
                          <Badge colorPalette={
                            integrationSecurity.keyStrength === 'strong' ? 'green' :
                            integrationSecurity.keyStrength === 'medium' ? 'yellow' :
                            'red'
                          }>
                            {integrationSecurity.keyStrength === 'strong' ? 'Fuerte' :
                             integrationSecurity.keyStrength === 'medium' ? 'Media' :
                             'Débil'}
                          </Badge>
                        </Stack>
                      </GridItem>

                      <GridItem>
                        <Stack gap="1">
                          <Text fontSize="sm" color="fg.muted">Webhook</Text>
                          <Badge colorPalette={integrationSecurity.hasWebhook ? 'green' : 'gray'}>
                            {integrationSecurity.hasWebhook ? 'Configurado' : 'No configurado'}
                          </Badge>
                        </Stack>
                      </GridItem>

                      <GridItem>
                        <Stack gap="1">
                          <Text fontSize="sm" color="fg.muted">Entorno</Text>
                          <Badge colorPalette={integrationSecurity.isProduction ? 'blue' : 'yellow'}>
                            {integrationSecurity.isProduction ? 'Producción' : 'Prueba'}
                          </Badge>
                        </Stack>
                      </GridItem>
                    </Grid>

                    {integrationSecurity.securityLevel === 'critical' && (
                      <Alert status="error" mt="4">
                        <Alert.Icon />
                        <Stack gap="1">
                          <Alert.Title>Seguridad Crítica</Alert.Title>
                          <Alert.Description>
                            Esta integración tiene un nivel de seguridad crítico.
                            Por favor verifica las credenciales y configura un webhook.
                          </Alert.Description>
                        </Stack>
                      </Alert>
                    )}
                  </Card.Body>
                </Card.Root>

                {/* ===== PROVIDER SELECTION ===== */}
                <Card.Root>
                  <Card.Header>
                    <Card.Title>Proveedor de Pago</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <Field.Root>
                      <Field.Label>Proveedor *</Field.Label>
                      <Select.Root collection={{ items: ['mercadopago', 'modo', 'stripe', 'paypal', 'other'] }}>
                        <Select.Trigger {...register('provider')}>
                          <Select.ValueText placeholder="Seleccionar proveedor" />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item item="mercadopago">Mercado Pago</Select.Item>
                          <Select.Item item="modo">MODO</Select.Item>
                          <Select.Item item="stripe">Stripe</Select.Item>
                          <Select.Item item="paypal">PayPal</Select.Item>
                          <Select.Item item="other">Otro</Select.Item>
                        </Select.Content>
                      </Select.Root>
                      <Field.HelperText>
                        Proveedor seleccionado: <strong>{providerName}</strong>
                      </Field.HelperText>
                    </Field.Root>
                  </Card.Body>
                </Card.Root>

                {/* ===== API CREDENTIALS ===== */}
                <Card.Root>
                  <Card.Header>
                    <Card.Title>Credenciales API</Card.Title>
                    <Card.Description>Claves de acceso del proveedor</Card.Description>
                  </Card.Header>
                  <Card.Body>
                    <Grid templateColumns={{ base: '1fr' }} gap="4">
                      <GridItem>
                        <Field.Root invalid={!!fieldErrors.api_key}>
                          <Field.Label>API Key *</Field.Label>
                          <Input
                            {...register('api_key')}
                            type="password"
                            placeholder="pk_test_..."
                            style={getFieldStyle('api_key')}
                          />
                          {fieldErrors.api_key && (
                            <Field.ErrorText>❌ {fieldErrors.api_key}</Field.ErrorText>
                          )}
                          {!fieldErrors.api_key && fieldWarnings.api_key && (
                            <Field.HelperText color="orange.500">⚠️ {fieldWarnings.api_key}</Field.HelperText>
                          )}
                          <Field.HelperText>
                            Longitud actual: {formData.api_key?.length || 0} caracteres
                          </Field.HelperText>
                        </Field.Root>
                      </GridItem>

                      <GridItem>
                        <Field.Root invalid={!!fieldErrors.api_secret}>
                          <Field.Label>API Secret *</Field.Label>
                          <Input
                            {...register('api_secret')}
                            type="password"
                            placeholder="sk_test_..."
                            style={getFieldStyle('api_secret')}
                          />
                          {fieldErrors.api_secret && (
                            <Field.ErrorText>❌ {fieldErrors.api_secret}</Field.ErrorText>
                          )}
                          {!fieldErrors.api_secret && fieldWarnings.api_secret && (
                            <Field.HelperText color="orange.500">⚠️ {fieldWarnings.api_secret}</Field.HelperText>
                          )}
                          <Field.HelperText>
                            Longitud actual: {formData.api_secret?.length || 0} caracteres
                          </Field.HelperText>
                        </Field.Root>
                      </GridItem>

                      <GridItem>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleTestConnection}
                          loading={isTesting}
                          disabled={!formData.api_key || !formData.api_secret}
                        >
                          {isTesting ? 'Probando...' : 'Probar Conexión'}
                        </Button>
                      </GridItem>
                    </Grid>
                  </Card.Body>
                </Card.Root>

                {/* ===== WEBHOOK CONFIGURATION ===== */}
                <Card.Root>
                  <Card.Header>
                    <Card.Title>Configuración de Webhook</Card.Title>
                    <Card.Description>URL para recibir notificaciones del proveedor</Card.Description>
                  </Card.Header>
                  <Card.Body>
                    <Field.Root invalid={!!fieldErrors.webhook_url}>
                      <Field.Label>Webhook URL (opcional)</Field.Label>
                      <Input
                        {...register('webhook_url')}
                        type="url"
                        placeholder="https://tu-dominio.com/webhooks/payment"
                        style={getFieldStyle('webhook_url')}
                      />
                      {fieldErrors.webhook_url && (
                        <Field.ErrorText>❌ {fieldErrors.webhook_url}</Field.ErrorText>
                      )}
                      {!fieldErrors.webhook_url && fieldWarnings.webhook_url && (
                        <Field.HelperText color="orange.500">⚠️ {fieldWarnings.webhook_url}</Field.HelperText>
                      )}
                      <Field.HelperText>
                        El webhook permite recibir notificaciones en tiempo real de pagos y eventos
                      </Field.HelperText>
                    </Field.Root>
                  </Card.Body>
                </Card.Root>

                {/* ===== INTEGRATION OPTIONS ===== */}
                <Card.Root>
                  <Card.Header>
                    <Card.Title>Opciones de Integración</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="4">
                      <GridItem>
                        <Checkbox {...register('test_mode')}>
                          Modo de prueba (test/sandbox)
                        </Checkbox>
                        {!fieldErrors.test_mode && fieldWarnings.test_mode && (
                          <Text fontSize="sm" color="orange.500" mt="1">
                            ⚠️ {fieldWarnings.test_mode}
                          </Text>
                        )}
                      </GridItem>

                      <GridItem>
                        <Checkbox {...register('is_active')}>
                          Integración activa
                        </Checkbox>
                      </GridItem>
                    </Grid>
                  </Card.Body>
                </Card.Root>

              </Stack>
            </form>
          </Dialog.Body>

          <Dialog.Footer>
            <Dialog.ActionTrigger asChild>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </Dialog.ActionTrigger>
            <Button
              type="submit"
              form="payment-integration-form"
              colorPalette="blue"
              loading={isSubmitting || isValidating || isSaving}
              disabled={validationState.hasErrors}
            >
              {submitButtonContent}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default PaymentIntegrationFormModal;
