import { Section, Stack, Button, Icon } from '@/shared/ui';
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
  hasCapability?: (capability: string) => boolean;
}

export function SalesActions({
  onNewSale,
  onQRGeneration,
  onShowAnalytics,
  onKitchenDisplay,
  isMobile = false,
  hasCapability = () => true
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
          flex={isMobile ? "1" : "none"}
          minW="200px"
        >
          <Icon icon={PlusIcon} size="sm" />
          Nueva Venta
        </Button>

        {/* Acciones Secundarias */}
        <Button
          variant="outline"
          onClick={onQRGeneration}
          flex="1"
          minW="200px"
          disabled={!hasCapability('pos_system')}
        >
          <Icon icon={QrCodeIcon} size="sm" />
          Códigos QR
        </Button>

        <Button
          variant="outline"
          onClick={onShowAnalytics}
          flex="1"
          minW="200px"
        >
          <Icon icon={ChartBarIcon} size="sm" />
          Ver Analytics
        </Button>

        <Button
          variant="outline"
          onClick={onKitchenDisplay}
          flex="1"
          minW="200px"
          disabled={!hasCapability('pos_system')}
        >
          <Icon icon={ComputerDesktopIcon} size="sm" />
          Pantalla Cocina
        </Button>

        {/* Acciones Adicionales - Solo en Desktop */}
        {!isMobile && (
          <>
            <Button
              variant="outline"
              onClick={() => console.log('Gestión Mesas')}
              flex="1"
              minW="200px"
            >
              <Icon icon={TableCellsIcon} size="sm" />
              Gestión Mesas
            </Button>

            <Button
              variant="outline"
              onClick={() => console.log('Procesar Pagos')}
              flex="1"
              minW="200px"
              disabled={!hasCapability('payment_processing')}
            >
              <Icon icon={CreditCardIcon} size="sm" />
              Procesar Pagos
            </Button>

            <Button
              variant="outline"
              onClick={() => console.log('Generar Reportes')}
              flex="1"
              minW="200px"
            >
              <Icon icon={DocumentTextIcon} size="sm" />
              Reportes
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              flex="1"
              minW="200px"
              colorPalette="gray"
            >
              <Icon icon={ArrowPathIcon} size="sm" />
              Actualizar
            </Button>
          </>
        )}
      </Stack>
    </Section>
  );
}