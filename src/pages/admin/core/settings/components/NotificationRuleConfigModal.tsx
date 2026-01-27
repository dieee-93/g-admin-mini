/**
 * NOTIFICATION RULE CONFIG MODAL
 * 
 * Modal for configuring notification rule settings
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  Stack,
  HStack,
  Button,
  Switch,
  FormSection,
  InputField,
  Alert,
  Badge,
  Icon,
} from '@/shared/ui';
import {
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ChatBubbleLeftIcon,
  BellAlertIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useUpdateNotificationChannels,
  useUpdateNotificationRecipients,
} from '@/hooks/useNotificationRules';
import type { NotificationRule } from '@/pages/admin/core/settings/services/notificationRulesApi';

interface NotificationRuleConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  rule: NotificationRule;
}

interface ChannelsState {
  notify_email: boolean;
  notify_push: boolean;
  notify_sms: boolean;
  notify_in_app: boolean;
}

export function NotificationRuleConfigModal({
  isOpen,
  onClose,
  rule,
}: NotificationRuleConfigModalProps) {
  const updateChannels = useUpdateNotificationChannels();
  const updateRecipients = useUpdateNotificationRecipients();

  const [channels, setChannels] = useState<ChannelsState>({
    notify_email: false,
    notify_push: false,
    notify_sms: false,
    notify_in_app: false,
  });

  const [recipientRoles, setRecipientRoles] = useState<string>('');

  useEffect(() => {
    if (isOpen && rule) {
      setChannels({
        notify_email: rule.notify_email,
        notify_push: rule.notify_push,
        notify_sms: rule.notify_sms,
        notify_in_app: rule.notify_in_app,
      });
      setRecipientRoles(rule.recipient_roles.join(', '));
    }
  }, [isOpen, rule]);

  const handleChannelToggle = (channel: keyof ChannelsState) => {
    setChannels((prev) => ({
      ...prev,
      [channel]: !prev[channel],
    }));
  };

  const handleSave = async () => {
    try {
      // Update channels
      await updateChannels.mutateAsync({
        id: rule.id,
        channels,
      });

      // Update recipients
      const rolesArray = recipientRoles
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);

      if (rolesArray.length > 0) {
        await updateRecipients.mutateAsync({
          id: rule.id,
          recipients: {
            recipient_roles: rolesArray,
            recipient_users: rule.recipient_users, // Keep existing users
          },
        });
      }

      onClose();
    } catch (error) {
      // Error handling is done in mutation hooks
    }
  };

  const isAnyChannelActive = Object.values(channels).some((v) => v);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(details) => !details.open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="600px">
          <Dialog.Header>
            <Dialog.Title>Configurar Notificación</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            <Stack gap="6">
              {/* Rule Info */}
              <div>
                <HStack gap="2" mb="2">
                  <strong style={{ fontSize: '1.125rem' }}>{rule.name}</strong>
                  <Badge colorPalette="purple" size="sm">
                    {rule.severity.toUpperCase()}
                  </Badge>
                </HStack>
                {rule.description && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--colors-gray-600)' }}>
                    {rule.description}
                  </p>
                )}
                <Badge colorPalette="gray" size="sm" mt="2">
                  {rule.rule_key}
                </Badge>
              </div>

              {/* Warning if no channels */}
              {!isAnyChannelActive && (
                <Alert status="warning" title="Sin canales activos">
                  Activa al menos un canal para recibir notificaciones
                </Alert>
              )}

              {/* Channels Section */}
              <FormSection title="Canales de Notificación">
                <Stack gap="4">
                  <Card variant="outline" p="4">
                    <HStack justify="space-between">
                      <HStack gap="3">
                        <Icon icon={EnvelopeIcon} size="md" color="blue.500" />
                        <Stack gap="1">
                          <strong>Email</strong>
                          <span style={{ fontSize: '0.875rem', color: 'var(--colors-gray-600)' }}>
                            Enviar por correo electrónico
                          </span>
                        </Stack>
                      </HStack>
                      <Switch
                        checked={channels.notify_email}
                        onCheckedChange={() => handleChannelToggle('notify_email')}
                      />
                    </HStack>
                  </Card>

                  <Card variant="outline" p="4">
                    <HStack justify="space-between">
                      <HStack gap="3">
                        <Icon icon={DevicePhoneMobileIcon} size="md" color="green.500" />
                        <Stack gap="1">
                          <strong>Push</strong>
                          <span style={{ fontSize: '0.875rem', color: 'var(--colors-gray-600)' }}>
                            Notificación push en dispositivos
                          </span>
                        </Stack>
                      </HStack>
                      <Switch
                        checked={channels.notify_push}
                        onCheckedChange={() => handleChannelToggle('notify_push')}
                      />
                    </HStack>
                  </Card>

                  <Card variant="outline" p="4">
                    <HStack justify="space-between">
                      <HStack gap="3">
                        <Icon icon={ChatBubbleLeftIcon} size="md" color="purple.500" />
                        <Stack gap="1">
                          <strong>SMS</strong>
                          <span style={{ fontSize: '0.875rem', color: 'var(--colors-gray-600)' }}>
                            Mensaje de texto (requiere configuración)
                          </span>
                        </Stack>
                      </HStack>
                      <Switch
                        checked={channels.notify_sms}
                        onCheckedChange={() => handleChannelToggle('notify_sms')}
                      />
                    </HStack>
                  </Card>

                  <Card variant="outline" p="4">
                    <HStack justify="space-between">
                      <HStack gap="3">
                        <Icon icon={BellAlertIcon} size="md" color="orange.500" />
                        <Stack gap="1">
                          <strong>In-App</strong>
                          <span style={{ fontSize: '0.875rem', color: 'var(--colors-gray-600)' }}>
                            Notificación dentro de la aplicación
                          </span>
                        </Stack>
                      </HStack>
                      <Switch
                        checked={channels.notify_in_app}
                        onCheckedChange={() => handleChannelToggle('notify_in_app')}
                      />
                    </HStack>
                  </Card>
                </Stack>
              </FormSection>

              {/* Recipients Section */}
              <FormSection title="Destinatarios">
                <Stack gap="4">
                  <InputField
                    label="Roles (separados por coma)"
                    placeholder="admin, manager, cashier"
                    value={recipientRoles}
                    onChange={(e) => setRecipientRoles(e.target.value)}
                  />
                  <Alert status="info">
                    <Stack gap="1">
                      <strong>Roles disponibles:</strong>
                      <span style={{ fontSize: '0.875rem' }}>
                        admin, manager, cashier, chef, waiter, driver
                      </span>
                    </Stack>
                  </Alert>
                </Stack>
              </FormSection>

              {/* Conditions Info */}
              {Object.keys(rule.conditions).length > 0 && (
                <FormSection title="Condiciones Actuales">
                  <Card variant="outline" p="4">
                    <pre style={{ fontSize: '0.75rem', overflow: 'auto' }}>
                      {JSON.stringify(rule.conditions, null, 2)}
                    </pre>
                  </Card>
                  <Alert status="info" mt="2">
                    Las condiciones avanzadas se editan desde código
                  </Alert>
                </FormSection>
              )}
            </Stack>
          </Dialog.Body>

          <Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </Dialog.CloseTrigger>
            <Button
              onClick={handleSave}
              disabled={updateChannels.isPending || updateRecipients.isPending || !isAnyChannelActive}
              colorPalette="purple"
            >
              <Icon icon={CheckCircleIcon} />
              {updateChannels.isPending || updateRecipients.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}

// Card wrapper for inline use
import { Card } from '@/shared/ui';
