// SchedulingActions.tsx - Enterprise Quick Actions Component
// Following G-Admin Mini v2.1 patterns - Scheduling Module

import React from 'react';
import {
  Section, Stack, Button, Icon
} from '@/shared/ui';
import { CapabilityGate } from '@/lib/capabilities';
import {
  PlusIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

interface SchedulingActionsProps {
  onAddShift?: () => void;
  onAutoSchedule?: () => void;
  onExportSchedule?: () => void;
  onGenerateReport?: () => void;
  onCopyWeek?: () => void;
  onFindCoverage?: () => void;
  onBulkOperations?: () => void;
  hasCapability: (capability: string) => boolean;
  isMobile?: boolean;
  loading?: boolean;
}

export function SchedulingActions({
  onAddShift = () => {},
  onAutoSchedule = () => {},
  onExportSchedule = () => {},
  onGenerateReport = () => {},
  onCopyWeek = () => {},
  onFindCoverage = () => {},
  onBulkOperations = () => {},
  hasCapability,
  isMobile = false,
  loading = false
}: SchedulingActionsProps) {

  const buttonDirection = isMobile ? "column" : "row";
  const buttonWidth = isMobile ? "full" : "auto";

  return (
    <Section variant="default" title="Acciones Rápidas">
      <Stack direction={buttonDirection} gap="md" flexWrap="wrap">

        {/* Acción Principal */}
        <CapabilityGate capability="schedule_management">
          <Button
            variant="solid"
            onClick={onAddShift}
            size="lg"
            width={buttonWidth}
            loading={loading}
          >
            <Icon icon={PlusIcon} size="sm" />
            Nuevo Turno
          </Button>
        </CapabilityGate>

        {/* Auto-Programar */}
        <CapabilityGate capability="schedule_management">
          <Button
            variant="outline"
            onClick={onAutoSchedule}
            flex={isMobile ? undefined : "1"}
            minW="200px"
            width={buttonWidth}
          >
            <Icon icon={Cog6ToothIcon} size="sm" />
            Auto-Programar
          </Button>
        </CapabilityGate>

        {/* Exportar Horarios */}
        <Button
          variant="outline"
          onClick={onExportSchedule}
          width={buttonWidth}
        >
          <Icon icon={ArrowPathIcon} size="sm" />
          Exportar Horarios
        </Button>

        {/* Acciones Secundarias */}
        {!isMobile && (
          <>
            <Button
              variant="ghost"
              onClick={onCopyWeek}
              width={buttonWidth}
            >
              <Icon icon={CalendarDaysIcon} size="sm" />
              Copiar Semana
            </Button>

            <Button
              variant="ghost"
              onClick={onFindCoverage}
              width={buttonWidth}
            >
              <Icon icon={UsersIcon} size="sm" />
              Buscar Cobertura
            </Button>

            <CapabilityGate capability="view_labor_costs">
              <Button
                variant="ghost"
                onClick={onGenerateReport}
                width={buttonWidth}
              >
                <Icon icon={DocumentTextIcon} size="sm" />
                Reporte Costos
              </Button>
            </CapabilityGate>
          </>
        )}

        {/* Mobile: Menú de más acciones */}
        {isMobile && (
          <Button
            variant="outline"
            onClick={onBulkOperations}
            width={buttonWidth}
          >
            <Icon icon={Cog6ToothIcon} size="sm" />
            Más Acciones
          </Button>
        )}
      </Stack>

      {/* Información adicional para mobile */}
      {isMobile && (
        <Stack direction="column" gap="xs" mt="md">
          <Section variant="flat" title="Accesos Rápidos">
            <Stack direction="row" gap="sm">
              <Button size="sm" variant="ghost" onClick={onCopyWeek}>
                <Icon icon={CalendarDaysIcon} size="xs" />
                Copiar
              </Button>
              <Button size="sm" variant="ghost" onClick={onFindCoverage}>
                <Icon icon={UsersIcon} size="xs" />
                Cobertura
              </Button>
              <CapabilityGate capability="view_labor_costs">
                <Button size="sm" variant="ghost" onClick={onGenerateReport}>
                  <Icon icon={DocumentTextIcon} size="xs" />
                  Reporte
                </Button>
              </CapabilityGate>
            </Stack>
          </Section>
        </Stack>
      )}
    </Section>
  );
}

export default SchedulingActions;