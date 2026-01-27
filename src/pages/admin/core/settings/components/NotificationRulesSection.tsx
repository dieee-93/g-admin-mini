/**
 * NOTIFICATION RULES SECTION
 * 
 * Component for managing notification rules configuration
 * Location: Settings page -> Notification Rules section
 */

import { useState } from 'react';
import {
  Stack,
  HStack,
  Card,
  Badge,
  Switch,
  Button,
  Icon,
  Alert,
  Tabs,
} from '@/shared/ui';
import {
  BellAlertIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ChatBubbleLeftIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline';
import {
  useNotificationRules,
  useNotificationRulesStats,
  useToggleNotificationRuleEnabled,
} from '@/hooks/useNotificationRules';
import { NotificationRuleConfigModal } from './NotificationRuleConfigModal';
import type { NotificationRule, NotificationCategory } from '@/pages/admin/core/settings/services/notificationRulesApi';

// ============================================
// TYPES
// ============================================

const CATEGORY_CONFIG = {
  inventory: {
    name: 'Inventario',
    color: 'purple' as const,
    icon: InformationCircleIcon,
  },
  staff: {
    name: 'Personal',
    color: 'blue' as const,
    icon: InformationCircleIcon,
  },
  customers: {
    name: 'Clientes',
    color: 'green' as const,
    icon: InformationCircleIcon,
  },
  finance: {
    name: 'Finanzas',
    color: 'orange' as const,
    icon: InformationCircleIcon,
  },
  system: {
    name: 'Sistema',
    color: 'red' as const,
    icon: InformationCircleIcon,
  },
};

const SEVERITY_CONFIG = {
  info: {
    icon: InformationCircleIcon,
    color: 'blue' as const,
  },
  warning: {
    icon: ExclamationTriangleIcon,
    color: 'orange' as const,
  },
  error: {
    icon: ExclamationCircleIcon,
    color: 'red' as const,
  },
  critical: {
    icon: ShieldExclamationIcon,
    color: 'red' as const,
  },
};

// ============================================
// STATS CARDS COMPONENT
// ============================================

function NotificationStatsCards() {
  const { data: stats, isLoading } = useNotificationRulesStats();

  if (isLoading || !stats) {
    return null;
  }

  return (
    <Stack gap="4" direction="row">
      <Card variant="outline" p="4" flex="1">
        <Stack gap="2">
          <HStack justify="space-between">
            <span style={{ fontSize: '0.875rem', color: 'var(--colors-gray-600)' }}>
              Total Reglas
            </span>
            <Icon icon={BellAlertIcon} size="sm" color="purple.500" />
          </HStack>
          <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>{stats.total}</span>
        </Stack>
      </Card>

      <Card variant="outline" p="4" flex="1">
        <Stack gap="2">
          <HStack justify="space-between">
            <span style={{ fontSize: '0.875rem', color: 'var(--colors-gray-600)' }}>
              Activas
            </span>
            <Icon icon={BellAlertIcon} size="sm" color="green.500" />
          </HStack>
          <span style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--colors-green-600)' }}>
            {stats.enabled}
          </span>
        </Stack>
      </Card>

      <Card variant="outline" p="4" flex="1">
        <Stack gap="2">
          <span style={{ fontSize: '0.875rem', color: 'var(--colors-gray-600)' }}>
            Por Categoría
          </span>
          <HStack gap="2" flexWrap="wrap">
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <Badge key={category} colorPalette={CATEGORY_CONFIG[category as NotificationCategory].color} size="sm">
                {CATEGORY_CONFIG[category as NotificationCategory].name}: {count}
              </Badge>
            ))}
          </HStack>
        </Stack>
      </Card>
    </Stack>
  );
}

// ============================================
// NOTIFICATION RULE ITEM COMPONENT
// ============================================

interface NotificationRuleItemProps {
  rule: NotificationRule;
  onConfigure: (rule: NotificationRule) => void;
}

function NotificationRuleItem({ rule, onConfigure }: NotificationRuleItemProps) {
  const toggleEnabled = useToggleNotificationRuleEnabled();

  const SeverityIcon = SEVERITY_CONFIG[rule.severity].icon;

  const handleToggle = () => {
    toggleEnabled.mutate({ id: rule.id, enabled: !rule.is_enabled });
  };

  // Count active channels
  const activeChannels = [
    rule.notify_email && 'Email',
    rule.notify_push && 'Push',
    rule.notify_sms && 'SMS',
    rule.notify_in_app && 'In-App',
  ].filter(Boolean);

  return (
    <Card variant="outline" p="4">
      <HStack justify="space-between" align="start">
        <HStack gap="3" align="start" flex="1">
          <Icon
            icon={SeverityIcon}
            size="md"
            color={`${SEVERITY_CONFIG[rule.severity].color}.500`}
          />
          <Stack gap="2" flex="1">
            <HStack gap="2">
              <strong>{rule.name}</strong>
              <Badge colorPalette={SEVERITY_CONFIG[rule.severity].color} size="sm">
                {rule.severity.toUpperCase()}
              </Badge>
            </HStack>
            {rule.description && (
              <p style={{ fontSize: '0.875rem', color: 'var(--colors-gray-600)' }}>
                {rule.description}
              </p>
            )}
            <HStack gap="2" flexWrap="wrap">
              <span style={{ fontSize: '0.875rem', color: 'var(--colors-gray-500)' }}>
                Canales:
              </span>
              {activeChannels.length > 0 ? (
                activeChannels.map((channel) => (
                  <Badge key={channel} colorPalette="gray" size="sm">
                    {channel}
                  </Badge>
                ))
              ) : (
                <Badge colorPalette="red" size="sm">
                  Sin canales
                </Badge>
              )}
            </HStack>
          </Stack>
        </HStack>

        <HStack gap="3" align="center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onConfigure(rule)}
          >
            <Icon icon={Cog6ToothIcon} size="sm" />
            Configurar
          </Button>
          <Switch
            checked={rule.is_enabled}
            onCheckedChange={handleToggle}
            disabled={toggleEnabled.isPending}
          />
        </HStack>
      </HStack>
    </Card>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function NotificationRulesSection() {
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('inventory');
  const [selectedRule, setSelectedRule] = useState<NotificationRule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: rules, isLoading, error } = useNotificationRules(activeCategory);

  const handleConfigure = (rule: NotificationRule) => {
    setSelectedRule(rule);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRule(null);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        Cargando reglas de notificación...
      </div>
    );
  }

  if (error) {
    return (
      <Alert status="error" title="Error al cargar reglas">
        No se pudieron cargar las reglas de notificación
      </Alert>
    );
  }

  return (
    <Stack gap="6">
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px' }}>
          Reglas de Notificación
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--colors-gray-600)' }}>
          Configura cuándo y cómo recibir notificaciones del sistema
        </p>
      </div>

      <NotificationStatsCards />

      <Alert status="info" title="Canales de Notificación">
        <Stack gap="2" mt="2">
          <HStack gap="2">
            <Icon icon={EnvelopeIcon} size="sm" />
            <strong>Email:</strong> Notificaciones por correo electrónico
          </HStack>
          <HStack gap="2">
            <Icon icon={DevicePhoneMobileIcon} size="sm" />
            <strong>Push:</strong> Notificaciones push en dispositivos móviles
          </HStack>
          <HStack gap="2">
            <Icon icon={ChatBubbleLeftIcon} size="sm" />
            <strong>SMS:</strong> Mensajes de texto (requiere configuración)
          </HStack>
          <HStack gap="2">
            <Icon icon={BellAlertIcon} size="sm" />
            <strong>In-App:</strong> Notificaciones dentro de la aplicación
          </HStack>
        </Stack>
      </Alert>

      <Tabs.Root value={activeCategory} onValueChange={(details) => setActiveCategory(details.value as NotificationCategory)}>
        <Tabs.List>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <Tabs.Trigger key={key} value={key}>
              <Icon icon={config.icon} size="sm" />
              {config.name}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value={activeCategory}>
          <Stack gap="3" mt="4">
            {rules && rules.length > 0 ? (
              rules.map((rule) => (
                <NotificationRuleItem
                  key={rule.id}
                  rule={rule}
                  onConfigure={handleConfigure}
                />
              ))
            ) : (
              <Alert status="info" title="Sin reglas">
                No hay reglas de notificación en esta categoría
              </Alert>
            )}
          </Stack>
        </Tabs.Content>
      </Tabs.Root>

      {selectedRule && (
        <NotificationRuleConfigModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          rule={selectedRule}
        />
      )}
    </Stack>
  );
}
