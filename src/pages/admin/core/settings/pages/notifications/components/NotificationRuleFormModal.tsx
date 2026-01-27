/**
 * NOTIFICATION RULE FORM MODAL
 * 
 * Create/edit notification rules
 * 
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  FormSection,
  Stack,
  HStack,
  Input,
  Textarea,
  Select,
  Switch,
  Button,
  Field,
  Spinner,
} from '@/shared/ui';
import type { NotificationCategory, NotificationSeverity } from '@/pages/admin/core/settings/services/notificationsApi';
import {
  useNotificationRule,
  useCreateNotificationRule,
  useUpdateNotificationRule,
} from '@/hooks/useNotifications';

interface NotificationRuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  ruleId: string | null;
  defaultCategory: NotificationCategory;
}

interface FormData {
  rule_key: string;
  category: NotificationCategory;
  name: string;
  description: string;
  severity: NotificationSeverity;
  is_enabled: boolean;
  notify_email: boolean;
  notify_push: boolean;
  notify_sms: boolean;
  notify_in_app: boolean;
}

export function NotificationRuleFormModal({
  isOpen,
  onClose,
  ruleId,
  defaultCategory,
}: NotificationRuleFormModalProps) {
  const isEditMode = !!ruleId;

  const { data: existingRule, isLoading: isLoadingRule } = useNotificationRule(ruleId);
  const createRule = useCreateNotificationRule();
  const updateRule = useUpdateNotificationRule();

  const [formData, setFormData] = useState<FormData>({
    rule_key: '',
    category: defaultCategory,
    name: '',
    description: '',
    severity: 'info',
    is_enabled: true,
    notify_email: false,
    notify_push: false,
    notify_sms: false,
    notify_in_app: true,
  });

  const handleFieldChange = <K extends keyof FormData>(field: K) => (value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      rule_key: '',
      category: defaultCategory,
      name: '',
      description: '',
      severity: 'info',
      is_enabled: true,
      notify_email: false,
      notify_push: false,
      notify_sms: false,
      notify_in_app: true,
    });
  };

  // Load existing rule data when editing
  useEffect(() => {
    if (existingRule && isEditMode) {
      setFormData({
        rule_key: existingRule.rule_key,
        category: existingRule.category,
        name: existingRule.name,
        description: existingRule.description || '',
        severity: existingRule.severity,
        is_enabled: existingRule.is_enabled,
        notify_email: existingRule.notify_email,
        notify_push: existingRule.notify_push,
        notify_sms: existingRule.notify_sms,
        notify_in_app: existingRule.notify_in_app,
      });
    } else if (!isEditMode) {
      resetForm();
    }
  }, [existingRule, isEditMode]);

  const handleSubmit = async () => {
    if (isEditMode && ruleId) {
      await updateRule.mutateAsync({
        id: ruleId,
        updates: {
          name: formData.name,
          description: formData.description || undefined,
          severity: formData.severity,
          is_enabled: formData.is_enabled,
          notify_email: formData.notify_email,
          notify_push: formData.notify_push,
          notify_sms: formData.notify_sms,
          notify_in_app: formData.notify_in_app,
        },
      });
    } else {
      await createRule.mutateAsync({
        rule_key: formData.rule_key,
        category: formData.category,
        name: formData.name,
        description: formData.description || undefined,
        severity: formData.severity,
        is_enabled: formData.is_enabled,
        notify_email: formData.notify_email,
        notify_push: formData.notify_push,
        notify_sms: formData.notify_sms,
        notify_in_app: formData.notify_in_app,
      });
    }

    onClose();
    resetForm();
  };

  const isSubmitting = createRule.isPending || updateRule.isPending;

  if (isLoadingRule && isEditMode) {
    return (
      <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Content>
          <Stack align="center" justify="center" minH="200px">
            <Spinner size="lg" />
          </Stack>
        </Dialog.Content>
      </Dialog.Root>
    );
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>
            {isEditMode ? 'Editar Regla de Notificación' : 'Nueva Regla de Notificación'}
          </Dialog.Title>
        </Dialog.Header>

        <Dialog.Body>
          <Stack gap="6">
            {/* Basic Info */}
            <FormSection title="Información Básica">
              <Stack gap="4">
                {!isEditMode && (
                  <Field.Root>
                    <Field.Label>Clave de Regla *</Field.Label>
                    <Input
                      value={formData.rule_key}
                      onChange={(e) => handleFieldChange('rule_key')(e.target.value)}
                      placeholder="ej: inventory.stock.low"
                    />
                    <Field.HelperText>
                      Identificador único en formato: categoria.entidad.evento
                    </Field.HelperText>
                  </Field.Root>
                )}

                {!isEditMode && (
                  <Field.Root>
                    <Field.Label>Categoría *</Field.Label>
                    <Select.Root
                      value={[formData.category]}
                      onValueChange={(e) => handleFieldChange('category')(e.value[0] as NotificationCategory)}
                    >
                      <Select.Trigger>
                        <Select.ValueText placeholder="Selecciona categoría" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="inventory">Inventario</Select.Item>
                        <Select.Item value="staff">Personal</Select.Item>
                        <Select.Item value="customers">Clientes</Select.Item>
                        <Select.Item value="finance">Finanzas</Select.Item>
                        <Select.Item value="system">Sistema</Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Field.Root>
                )}

                <Field.Root>
                  <Field.Label>Nombre *</Field.Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name')(e.target.value)}
                    placeholder="Nombre descriptivo"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Descripción</Field.Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description')(e.target.value)}
                    placeholder="Describe cuándo se activa esta notificación"
                    rows={3}
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Severidad *</Field.Label>
                  <Select.Root
                    value={[formData.severity]}
                    onValueChange={(e) => handleFieldChange('severity')(e.value[0] as NotificationSeverity)}
                  >
                    <Select.Trigger>
                      <Select.ValueText placeholder="Selecciona severidad" />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="info">Info</Select.Item>
                      <Select.Item value="warning">Warning</Select.Item>
                      <Select.Item value="error">Error</Select.Item>
                      <Select.Item value="critical">Critical</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Field.Root>
              </Stack>
            </FormSection>

            {/* Notification Channels */}
            <FormSection title="Canales de Notificación">
              <Stack gap="3">
                <HStack justify="space-between">
                  <Field.Label>Email</Field.Label>
                  <Switch
                    checked={formData.notify_email}
                    onCheckedChange={(e) => handleFieldChange('notify_email')(e.checked)}
                  />
                </HStack>

                <HStack justify="space-between">
                  <Field.Label>Push Notification</Field.Label>
                  <Switch
                    checked={formData.notify_push}
                    onCheckedChange={(e) => handleFieldChange('notify_push')(e.checked)}
                  />
                </HStack>

                <HStack justify="space-between">
                  <Field.Label>SMS</Field.Label>
                  <Switch
                    checked={formData.notify_sms}
                    onCheckedChange={(e) => handleFieldChange('notify_sms')(e.checked)}
                  />
                </HStack>

                <HStack justify="space-between">
                  <Field.Label>In-App</Field.Label>
                  <Switch
                    checked={formData.notify_in_app}
                    onCheckedChange={(e) => handleFieldChange('notify_in_app')(e.checked)}
                  />
                </HStack>
              </Stack>
            </FormSection>

            {/* Status */}
            <FormSection title="Estado">
              <HStack justify="space-between">
                <Field.Label>Regla Activa</Field.Label>
                <Switch
                  checked={formData.is_enabled}
                  onCheckedChange={(e) => handleFieldChange('is_enabled')(e.checked)}
                />
              </HStack>
            </FormSection>
          </Stack>
        </Dialog.Body>

        <Dialog.Footer>
          <HStack justify="end" gap="3">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              colorPalette="purple"
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={!formData.name || !formData.rule_key}
            >
              {isEditMode ? 'Guardar Cambios' : 'Crear Regla'}
            </Button>
          </HStack>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}
