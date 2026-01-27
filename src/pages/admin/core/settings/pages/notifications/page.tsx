/**
 * NOTIFICATION SETTINGS PAGE
 * 
 * Configure notification rules for alerts:
 * - Inventory (stock low, expiry, waste)
 * - Staff (shifts, attendance, overtime)
 * - Customers (birthdays, feedback, loyalty)
 * - Finance (payments, invoices, cash)
 * - System (backups, integrations, performance)
 * 
 * @version 1.0.0
 */

import { useState } from 'react';
import {
  ContentLayout,
  Section,
  Stack,
  Tabs,
  Alert,
  Button,
  Icon,
  HStack,
  Badge,
  Spinner,
} from '@/shared/ui';
import {
  BellIcon,
  BellAlertIcon,
  CubeIcon,
  UserGroupIcon,
  UsersIcon,
  BanknotesIcon,
  ServerIcon,
} from '@heroicons/react/24/outline';
import type { NotificationCategory } from '@/pages/admin/core/settings/services/notificationsApi';
import {
  useNotificationRules,
  useBulkToggleNotificationRules,
} from '@/hooks/useNotifications';
import { NotificationRulesList } from './components/NotificationRulesList';
import { NotificationRuleFormModal } from './components/NotificationRuleFormModal';

export default function NotificationSettingsPage() {
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory>('inventory');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

  const { data: rules, isLoading, error } = useNotificationRules();
  const bulkToggle = useBulkToggleNotificationRules();

  // Stats by category
  const stats = rules?.reduce(
    (acc, rule) => {
      acc[rule.category] = (acc[rule.category] || 0) + 1;
      if (rule.is_enabled) {
        acc[`${rule.category}_enabled`] = (acc[`${rule.category}_enabled`] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  const handleCreateRule = () => {
    setSelectedRuleId(null);
    setIsFormModalOpen(true);
  };

  const handleEditRule = (ruleId: string) => {
    setSelectedRuleId(ruleId);
    setIsFormModalOpen(true);
  };

  const handleEnableAll = () => {
    const categoryRules = rules?.filter(r => r.category === selectedCategory) || [];
    const ids = categoryRules.map(r => r.id);
    bulkToggle.mutate({ ids, isEnabled: true });
  };

  const handleDisableAll = () => {
    const categoryRules = rules?.filter(r => r.category === selectedCategory) || [];
    const ids = categoryRules.map(r => r.id);
    bulkToggle.mutate({ ids, isEnabled: false });
  };

  if (isLoading) {
    return (
      <ContentLayout>
        <Section variant="flat">
          <Stack align="center" justify="center" minH="400px">
            <Spinner size="lg" />
          </Stack>
        </Section>
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout>
        <Section variant="flat">
          <Alert status="error" title="Error al cargar notificaciones">
            No se pudieron cargar las reglas de notificación. Intenta recargar la página.
          </Alert>
        </Section>
      </ContentLayout>
    );
  }

  const categoryRules = rules?.filter(r => r.category === selectedCategory) || [];
  const enabledCount = stats?.[`${selectedCategory}_enabled`] || 0;
  const totalCount = stats?.[selectedCategory] || 0;

  return (
    <ContentLayout spacing="normal">
      <Section
        variant="flat"
        title="Configuración de Notificaciones"
        actions={
          <Button colorPalette="purple" onClick={handleCreateRule}>
            <Icon icon={BellAlertIcon} />
            Nueva Regla
          </Button>
        }
      >
        <Stack gap="6">
          {/* Info Alert */}
          <Alert status="info" title="Gestión de Alertas">
            Configura qué eventos del sistema deben generar notificaciones y cómo deben ser entregadas
            (email, push, SMS, in-app).
          </Alert>

          {/* Category Tabs */}
          <Tabs.Root value={selectedCategory} onValueChange={(e) => setSelectedCategory(e.value as NotificationCategory)}>
            <Tabs.List>
              <Tabs.Trigger value="inventory">
                <HStack gap="2">
                  <Icon icon={CubeIcon} size="sm" />
                  Inventario
                  <Badge size="sm" colorPalette="purple">
                    {stats?.inventory_enabled || 0}/{stats?.inventory || 0}
                  </Badge>
                </HStack>
              </Tabs.Trigger>

              <Tabs.Trigger value="staff">
                <HStack gap="2">
                  <Icon icon={UserGroupIcon} size="sm" />
                  Personal
                  <Badge size="sm" colorPalette="purple">
                    {stats?.staff_enabled || 0}/{stats?.staff || 0}
                  </Badge>
                </HStack>
              </Tabs.Trigger>

              <Tabs.Trigger value="customers">
                <HStack gap="2">
                  <Icon icon={UsersIcon} size="sm" />
                  Clientes
                  <Badge size="sm" colorPalette="purple">
                    {stats?.customers_enabled || 0}/{stats?.customers || 0}
                  </Badge>
                </HStack>
              </Tabs.Trigger>

              <Tabs.Trigger value="finance">
                <HStack gap="2">
                  <Icon icon={BanknotesIcon} size="sm" />
                  Finanzas
                  <Badge size="sm" colorPalette="purple">
                    {stats?.finance_enabled || 0}/{stats?.finance || 0}
                  </Badge>
                </HStack>
              </Tabs.Trigger>

              <Tabs.Trigger value="system">
                <HStack gap="2">
                  <Icon icon={ServerIcon} size="sm" />
                  Sistema
                  <Badge size="sm" colorPalette="purple">
                    {stats?.system_enabled || 0}/{stats?.system || 0}
                  </Badge>
                </HStack>
              </Tabs.Trigger>
            </Tabs.List>

            {/* Bulk Actions */}
            <HStack justify="space-between" py="4">
              <Stack gap="1">
                <Badge size="lg" colorPalette={enabledCount === totalCount ? 'green' : 'gray'}>
                  {enabledCount} de {totalCount} reglas activas
                </Badge>
              </Stack>

              <HStack gap="2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEnableAll}
                  loading={bulkToggle.isPending}
                >
                  Activar Todas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisableAll}
                  loading={bulkToggle.isPending}
                >
                  Desactivar Todas
                </Button>
              </HStack>
            </HStack>

            {/* Content for each category */}
            <Tabs.Content value="inventory">
              <NotificationRulesList
                rules={categoryRules}
                onEditRule={handleEditRule}
              />
            </Tabs.Content>

            <Tabs.Content value="staff">
              <NotificationRulesList
                rules={categoryRules}
                onEditRule={handleEditRule}
              />
            </Tabs.Content>

            <Tabs.Content value="customers">
              <NotificationRulesList
                rules={categoryRules}
                onEditRule={handleEditRule}
              />
            </Tabs.Content>

            <Tabs.Content value="finance">
              <NotificationRulesList
                rules={categoryRules}
                onEditRule={handleEditRule}
              />
            </Tabs.Content>

            <Tabs.Content value="system">
              <NotificationRulesList
                rules={categoryRules}
                onEditRule={handleEditRule}
              />
            </Tabs.Content>
          </Tabs.Root>
        </Stack>
      </Section>

      {/* Form Modal */}
      <NotificationRuleFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedRuleId(null);
        }}
        ruleId={selectedRuleId}
        defaultCategory={selectedCategory}
      />
    </ContentLayout>
  );
}
