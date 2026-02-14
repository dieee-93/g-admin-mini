/**
 * Report Filters Component
 * Filtros comunes para reportes contables
 */

import { useState, useCallback } from 'react';
import { Box, Button, Stack, Text, Input } from '@/shared/ui';
import type { ReportPeriod } from '@/modules/accounting/types/reports';

interface ReportFiltersProps {
  onGenerateReport: (filters: {
    reportType: 'balance-sheet' | 'cash-flow' | 'profit-loss' | 'session-history';
    period: ReportPeriod;
    startDate?: string;
    endDate?: string;
    asOfDate?: string;
  }) => void;
  isLoading?: boolean;
}

export function ReportFilters({ onGenerateReport, isLoading }: ReportFiltersProps) {
  const [reportType, setReportType] = useState<
    'balance-sheet' | 'cash-flow' | 'profit-loss' | 'session-history'
  >('balance-sheet');
  const [period, setPeriod] = useState<ReportPeriod>('this_month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  const handlePeriodChange = useCallback((newPeriod: ReportPeriod) => {
    setPeriod(newPeriod);

    if (newPeriod !== 'custom') {
      const dates = getPeriodDates(newPeriod);
      setStartDate(dates.startDate);
      setEndDate(dates.endDate);
    }
  }, []);

  const handleGenerate = useCallback(() => {
    onGenerateReport({
      reportType,
      period,
      startDate: period === 'custom' ? startDate : getPeriodDates(period).startDate,
      endDate: period === 'custom' ? endDate : getPeriodDates(period).endDate,
      asOfDate,
    });
  }, [reportType, period, startDate, endDate, asOfDate, onGenerateReport]);

  const requiresDateRange = reportType !== 'balance-sheet';

  return (
    <Box p={4} bg="gray.50" borderRadius="md">
      <Stack gap={4}>
        {/* Tipo de Reporte */}
        <Stack gap="2">
          <Text fontWeight="600">Tipo de Reporte</Text>
          <Stack direction="row" gap={2} flexWrap="wrap">
            <Button
              size="sm"
              colorPalette={reportType === 'balance-sheet' ? 'blue' : 'gray'}
              variant={reportType === 'balance-sheet' ? 'solid' : 'outline'}
              onClick={() => setReportType('balance-sheet')}
            >
              Balance Sheet
            </Button>
            <Button
              size="sm"
              colorPalette={reportType === 'cash-flow' ? 'blue' : 'gray'}
              variant={reportType === 'cash-flow' ? 'solid' : 'outline'}
              onClick={() => setReportType('cash-flow')}
            >
              Cash Flow
            </Button>
            <Button
              size="sm"
              colorPalette={reportType === 'profit-loss' ? 'blue' : 'gray'}
              variant={reportType === 'profit-loss' ? 'solid' : 'outline'}
              onClick={() => setReportType('profit-loss')}
            >
              P&L
            </Button>
            <Button
              size="sm"
              colorPalette={reportType === 'session-history' ? 'blue' : 'gray'}
              variant={reportType === 'session-history' ? 'solid' : 'outline'}
              onClick={() => setReportType('session-history')}
            >
              Sesiones
            </Button>
          </Stack>
        </Stack>

        {/* Período */}
        {requiresDateRange && (
          <Stack gap="2">
            <Text fontWeight="600">Período</Text>
            <Stack direction="row" gap={2} flexWrap="wrap">
              <Button
                size="sm"
                colorPalette={period === 'today' ? 'teal' : 'gray'}
                variant={period === 'today' ? 'solid' : 'outline'}
                onClick={() => handlePeriodChange('today')}
              >
                Hoy
              </Button>
              <Button
                size="sm"
                colorPalette={period === 'this_week' ? 'teal' : 'gray'}
                variant={period === 'this_week' ? 'solid' : 'outline'}
                onClick={() => handlePeriodChange('this_week')}
              >
                Esta Semana
              </Button>
              <Button
                size="sm"
                colorPalette={period === 'this_month' ? 'teal' : 'gray'}
                variant={period === 'this_month' ? 'solid' : 'outline'}
                onClick={() => handlePeriodChange('this_month')}
              >
                Este Mes
              </Button>
              <Button
                size="sm"
                colorPalette={period === 'last_month' ? 'teal' : 'gray'}
                variant={period === 'last_month' ? 'solid' : 'outline'}
                onClick={() => handlePeriodChange('last_month')}
              >
                Mes Anterior
              </Button>
              <Button
                size="sm"
                colorPalette={period === 'this_year' ? 'teal' : 'gray'}
                variant={period === 'this_year' ? 'solid' : 'outline'}
                onClick={() => handlePeriodChange('this_year')}
              >
                Este Año
              </Button>
              <Button
                size="sm"
                colorPalette={period === 'custom' ? 'teal' : 'gray'}
                variant={period === 'custom' ? 'solid' : 'outline'}
                onClick={() => setPeriod('custom')}
              >
                Personalizado
              </Button>
            </Stack>
          </Stack>
        )}

        {/* Fechas Personalizadas */}
        {period === 'custom' && requiresDateRange && (
          <Stack direction="row" gap={4}>
            <Stack gap="2" flex={1}>
              <Text fontWeight="600">Fecha Inicio</Text>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Stack>
            <Stack gap="2" flex={1}>
              <Text fontWeight="600">Fecha Fin</Text>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Stack>
          </Stack>
        )}

        {/* Fecha "As Of" para Balance Sheet */}
        {reportType === 'balance-sheet' && (
          <Stack gap="2" maxW="200px">
            <Text fontWeight="600">Fecha del Reporte (As Of)</Text>
            <Input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
            />
          </Stack>
        )}

        {/* Botón Generar */}
        <Stack direction="row" justify="flex-end">
          <Button
            colorPalette="green"
            onClick={handleGenerate}
            loading={isLoading}
            disabled={period === 'custom' && (!startDate || !endDate)}
          >
            Generar Reporte
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

// Helper: Obtener fechas para períodos predefinidos
function getPeriodDates(period: ReportPeriod): { startDate: string; endDate: string } {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  switch (period) {
    case 'today':
      return {
        startDate: formatDate(today),
        endDate: formatDate(today),
      };

    case 'yesterday': {
      const yesterday = new Date(year, month, day - 1);
      return {
        startDate: formatDate(yesterday),
        endDate: formatDate(yesterday),
      };
    }

    case 'this_week': {
      const startOfWeek = new Date(year, month, day - today.getDay());
      return {
        startDate: formatDate(startOfWeek),
        endDate: formatDate(today),
      };
    }

    case 'last_week': {
      const startOfLastWeek = new Date(year, month, day - today.getDay() - 7);
      const endOfLastWeek = new Date(year, month, day - today.getDay() - 1);
      return {
        startDate: formatDate(startOfLastWeek),
        endDate: formatDate(endOfLastWeek),
      };
    }

    case 'this_month': {
      const startOfMonth = new Date(year, month, 1);
      return {
        startDate: formatDate(startOfMonth),
        endDate: formatDate(today),
      };
    }

    case 'last_month': {
      const startOfLastMonth = new Date(year, month - 1, 1);
      const endOfLastMonth = new Date(year, month, 0);
      return {
        startDate: formatDate(startOfLastMonth),
        endDate: formatDate(endOfLastMonth),
      };
    }

    case 'this_year': {
      const startOfYear = new Date(year, 0, 1);
      return {
        startDate: formatDate(startOfYear),
        endDate: formatDate(today),
      };
    }

    default:
      return {
        startDate: formatDate(today),
        endDate: formatDate(today),
      };
  }
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
