/**
 * NOTIFICATION RULES LIST COMPONENT
 * 
 * Displays notification rules with toggle switches
 * 
 * @version 1.0.0
 */

import {
  Stack,
  CardWrapper,
  HStack,
  Icon,
  Typography,
  Badge,
  Switch,
  Button,
} from '@/shared/ui';
import {
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import type { NotificationRule } from '@/pages/admin/core/settings/services/notificationsApi';
import {
  useToggleNotificationRule,
  useDeleteNotificationRule,
} from '@/hooks/useNotifications';

interface NotificationRulesListProps {
  rules: NotificationRule[];
  onEditRule: (ruleId: string) => void;
}

export function NotificationRulesList({ rules, onEditRule }: NotificationRulesListProps) {
  const toggleRule = useToggleNotificationRule();
  const deleteRule = useDeleteNotificationRule();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'red';
      case 'error':
        return 'orange';
      case 'warning':
        return 'yellow';
      default:
        return 'blue';
    }
  };

  const handleDelete = (ruleId: string, ruleName: string) => {
    if (confirm(`¿Eliminar la regla "${ruleName}"?`)) {
      deleteRule.mutate(ruleId);
    }
  };

  if (rules.length === 0) {
    return (
      <Stack align="center" justify="center" minH="200px" gap="2">
        <Icon icon={BellIcon} size="2xl" color="gray.400" />
        <Typography variant="body" color="gray.600">
          No hay reglas configuradas para esta categoría
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack gap="3">
      {rules.map((rule) => (
        <CardWrapper key={rule.id} variant="outline">
          <CardWrapper.Body p="4">
            <HStack justify="space-between" align="start">
              {/* Left: Rule info */}
              <Stack gap="2" flex="1">
                <HStack gap="3">
                  <Typography variant="body" fontWeight="semibold">
                    {rule.name}
                  </Typography>
                  <Badge
                    size="sm"
                    colorPalette={getSeverityColor(rule.severity)}
                  >
                    {rule.severity.toUpperCase()}
                  </Badge>
                </HStack>

                {rule.description && (
                  <Typography variant="body" fontSize="sm" color="gray.600">
                    {rule.description}
                  </Typography>
                )}

                {/* Notification channels */}
                <HStack gap="3">
                  {rule.notify_email && (
                    <HStack gap="1">
                      <Icon icon={EnvelopeIcon} size="xs" color="gray.500" />
                      <Typography variant="body" fontSize="xs" color="gray.600">
                        Email
                      </Typography>
                    </HStack>
                  )}
                  {rule.notify_push && (
                    <HStack gap="1">
                      <Icon icon={DevicePhoneMobileIcon} size="xs" color="gray.500" />
                      <Typography variant="body" fontSize="xs" color="gray.600">
                        Push
                      </Typography>
                    </HStack>
                  )}
                  {rule.notify_sms && (
                    <HStack gap="1">
                      <Icon icon={ChatBubbleLeftRightIcon} size="xs" color="gray.500" />
                      <Typography variant="body" fontSize="xs" color="gray.600">
                        SMS
                      </Typography>
                    </HStack>
                  )}
                  {rule.notify_in_app && (
                    <HStack gap="1">
                      <Icon icon={BellIcon} size="xs" color="gray.500" />
                      <Typography variant="body" fontSize="xs" color="gray.600">
                        In-App
                      </Typography>
                    </HStack>
                  )}
                </HStack>

                {/* Conditions preview (if any) */}
                {Object.keys(rule.conditions).length > 0 && (
                  <Typography variant="body" fontSize="xs" color="gray.500">
                    Condiciones: {JSON.stringify(rule.conditions)}
                  </Typography>
                )}
              </Stack>

              {/* Right: Actions */}
              <HStack gap="2" align="center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditRule(rule.id)}
                >
                  <Icon icon={PencilIcon} size="sm" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  colorPalette="red"
                  onClick={() => handleDelete(rule.id, rule.name)}
                  loading={deleteRule.isPending}
                >
                  <Icon icon={TrashIcon} size="sm" />
                </Button>

                <Switch
                  checked={rule.is_enabled}
                  onCheckedChange={(e) =>
                    toggleRule.mutate({ id: rule.id, isEnabled: e.checked })
                  }
                  disabled={toggleRule.isPending}
                />
              </HStack>
            </HStack>
          </CardWrapper.Body>
        </CardWrapper>
      ))}
    </Stack>
  );
}
