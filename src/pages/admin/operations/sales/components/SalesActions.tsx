import { Section, Stack, Button, Icon } from '@/shared/ui';
import { logger } from '@/lib/logging';
import {
  PlusIcon,
  QrCodeIcon,
  ChartBarIcon,
  ComputerDesktopIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CreditCardIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';

interface SalesActionsProps {
  onNewSale?: () => void;
  onQRGeneration?: () => void;
  onShowAnalytics?: () => void;
  onKitchenDisplay?: () => void;
  isMobile?: boolean;
}

export function SalesActions({
  onNewSale,
  onQRGeneration,
  onShowAnalytics,
  onKitchenDisplay,
  isMobile = false
}: SalesActionsProps) {
  return (
    <Section variant="default" title="Acciones Rápidas">
      <Stack
        direction={isMobile ? "column" : "row"}
        gap="md"
        flexWrap="wrap"
      >
        {/* Acción Principal */}
        <Button
          variant="solid"
          size="lg"
          onClick={onNewSale}
          colorPalette="teal"
        >
          <Icon icon={PlusIcon} size="sm" />
          Nueva Venta
        </Button>

        {/* Acciones Secundarias */}
        <Button
          variant="outline"
          onClick={onQRGeneration}
        >
          <Icon icon={QrCodeIcon} size="sm" />
          Códigos QR
        </Button>

        <Button
          variant="outline"
          onClick={onShowAnalytics}
        >
          <Icon icon={ChartBarIcon} size="sm" />
          Ver Analytics
        </Button>

        <Button
          variant="outline"
          onClick={onKitchenDisplay}
        >
          <Icon icon={ComputerDesktopIcon} size="sm" />
          Pantalla Cocina
        </Button>

        {/* Acciones Adicionales - Solo en Desktop */}
        {!isMobile && (
          <>
            <Button
              variant="outline"
              onClick={() => logger.debug('SalesStore', 'Gestión Mesas')}
            >
              <Icon icon={TableCellsIcon} size="sm" />
              Gestión Mesas
            </Button>

            <Button
              variant="outline"
              onClick={() => logger.debug('SalesActions', 'Procesar Pagos')}
            >
              <Icon icon={CreditCardIcon} size="sm" />
              Procesar Pagos
            </Button>

            <Button
              variant="outline"
              onClick={() => logger.debug('SalesActions', 'Generar Reportes')}
            >
              <Icon icon={DocumentTextIcon} size="sm" />
              Reportes
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              colorPalette="gray"
            >
              <Icon icon={ArrowPathIcon} size="sm" />
              Actualizar
            </Button>
          </>
        )}
      </Stack>
    </Section>);
}