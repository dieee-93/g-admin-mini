import { Section, Stack, Button, Icon } from '@/shared/ui';
import {
  PlusIcon, ChartBarIcon, DocumentTextIcon,
  ArrowPathIcon, CogIcon
} from '@heroicons/react/24/outline';

interface MaterialsActionsProps {
  onAddMaterial: () => void;
  onBulkOperations: () => void;
  onGenerateReport: () => Promise<void>;
  onSyncInventory: () => Promise<void>;
  isMobile?: boolean;
  hasCapability: (capability: string) => boolean;
}

export function MaterialsActions({
  onAddMaterial,
  onBulkOperations,
  onGenerateReport,
  onSyncInventory,
  isMobile = false,
  hasCapability
}: MaterialsActionsProps) {
  return (
    <Section variant="default" title="Acciones Rápidas">
      <Stack
        direction={isMobile ? "column" : "row"}
        gap="md"
        flexWrap="wrap"
      >
        {/* PRIMARY ACTION */}
        <Button
          variant="solid"
          onClick={onAddMaterial}
          size="lg"
          flex={isMobile ? "1" : "0"}
        >
          <Icon icon={PlusIcon} size="sm" />
          Agregar Material
        </Button>

        {/* SECONDARY ACTIONS */}
        {hasCapability('bulk_operations') && (
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

        <Button
          variant="outline"
          onClick={onGenerateReport}
          flex={isMobile ? "1" : "0"}
          minW="200px"
        >
          <Icon icon={DocumentTextIcon} size="sm" />
          Generar Reporte
        </Button>

        <Button
          variant="outline"
          onClick={onSyncInventory}
          flex={isMobile ? "1" : "0"}
          minW="180px"
        >
          <Icon icon={ArrowPathIcon} size="sm" />
          Sincronizar
        </Button>
      </Stack>
    </Section>
  );
}