/**
 * MATERIALS ACTIONS COMPONENT
 *
 * 🎯 ARCHITECTURAL PATTERN: Permission-Gated Actions
 * - Conditionally renders actions based on user permissions
 * - Follows RBAC (Role-Based Access Control) principles
 * - Provides cross-module extension via HookPoint
 *
 * 🔒 PERMISSIONS:
 * - canCreate → "Agregar Material" button
 * - canUpdate → "Operaciones Masivas" button
 * - canExport → "Generar Reporte" button
 * - canConfigure → "Sincronizar" button
 */

import { Section, Stack, Button, Icon } from '@/shared/ui';
import {
  PlusIcon, DocumentTextIcon,
  ArrowPathIcon, CogIcon
} from '@heroicons/react/24/outline';
import { HookPoint } from '@/lib/modules';

interface MaterialsActionsProps {
  onAddMaterial?: () => void;
  onBulkOperations?: () => void;
  onGenerateReport?: () => Promise<void>;
  onSyncInventory?: () => Promise<void>;
  isMobile?: boolean;
  permissions?: {
    canCreate: boolean;
    canUpdate: boolean;
    canExport: boolean;
    canConfigure: boolean;
  };
}

export function MaterialsActions({
  onAddMaterial,
  onBulkOperations,
  onGenerateReport,
  onSyncInventory,
  isMobile = false,
  permissions = {
    canCreate: true,
    canUpdate: true,
    canExport: true,
    canConfigure: true
  }
}: MaterialsActionsProps) {
  // 🔒 Check if user has any available actions
  const hasAnyAction = (
    (permissions.canCreate && onAddMaterial) ||
    (permissions.canUpdate && onBulkOperations) ||
    (permissions.canExport && onGenerateReport) ||
    (permissions.canConfigure && onSyncInventory)
  );

  // Don't render section if no actions available
  if (!hasAnyAction) {
    return null;
  }

  return (
    <Section variant="default" title="Acciones Rápidas">
      <Stack
        direction={isMobile ? "column" : "row"}
        gap="md"
        flexWrap="wrap"
      >
        {/* 🔒 PRIMARY ACTION - Create Material (requires 'create' permission) */}
        {permissions.canCreate && onAddMaterial && (
          <Button
            variant="solid"
            onClick={onAddMaterial}
            size="lg"
            flex={isMobile ? "1" : "0"}
          >
            <Icon icon={PlusIcon} size="sm" />
            Agregar Material
          </Button>
        )}

        {/* 🔒 SECONDARY ACTION - Bulk Operations (requires 'update' permission) */}
        {permissions.canUpdate && onBulkOperations && (
          <Button
            variant="outline"
            onClick={onBulkOperations}
            flex={isMobile ? "1" : "0"}
            minW="200px"
          >
            <Icon icon={CogIcon} size="sm" />
            Operaciones Masivas
          </Button>
        )}

        {/* 🔒 EXPORT ACTION - Generate Report (requires 'export' permission) */}
        {permissions.canExport && onGenerateReport && (
          <Button
            variant="outline"
            onClick={onGenerateReport}
            flex={isMobile ? "1" : "0"}
            minW="200px"
          >
            <Icon icon={DocumentTextIcon} size="sm" />
            Generar Reporte
          </Button>
        )}

        {/* 🔒 CONFIGURE ACTION - Sync Inventory (requires 'configure' permission) */}
        {permissions.canConfigure && onSyncInventory && (
          <Button
            variant="outline"
            onClick={onSyncInventory}
            flex={isMobile ? "1" : "0"}
            minW="180px"
          >
            <Icon icon={ArrowPathIcon} size="sm" />
            Sincronizar
          </Button>
        )}

        {/* 🔌 HOOK POINT: Cross-module toolbar actions (e.g., Suppliers "Export to PO", Products "Check Recipes") */}
        <HookPoint
          name="materials.toolbar.actions"
          data={{
            onAddMaterial,
            onBulkOperations,
            onGenerateReport,
            onSyncInventory,
            permissions
          }}
          direction="row"
          gap="md"
          fallback={null}
        />
      </Stack>
    </Section>
  );
}