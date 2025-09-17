import {
  ContentLayout, Section, StatsSection, CardGrid, MetricCard,
  Button, Alert, Badge, Icon, Stack, Typography
} from '@/shared/ui';
import {
  UserGroupIcon,
  UsersIcon,
  ChartBarIcon,
  AcademicCapIcon,
  CogIcon,
  PlusIcon,
  ClockIcon,
  TrophyIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { ModuleEventUtils } from '@/shared/events/ModuleEventBus';
import { useStaffPage } from './hooks';

// Import tab sections
import { DirectorySection } from './components/sections/DirectorySection';
import { PerformanceSection } from './components/sections/PerformanceSection';
import { TrainingSection } from './components/sections/TrainingSection';
import { ManagementSection } from './components/sections/ManagementSection';
import { TimeTrackingSection } from './components/sections/TimeTrackingSection';

export default function StaffPage() {
  const {
    pageState,
    metrics,
    loading,
    error,
    actions,
    alertsData
  } = useStaffPage();

  if (loading) {
    return (
      <ContentLayout spacing="normal">
        <div>Cargando datos del personal...</div>
      </ContentLayout>
    );
  }

  if (error) {
    ModuleEventUtils.business.error('staff-load-failed', error);
    return (
      <ContentLayout spacing="normal">
        <Stack gap={12}>
          <Alert variant="subtle" title={error} />
        </Stack>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout spacing="normal">
      <Stack gap={12}>
        {/* 📊 MÉTRICAS DE STAFF - SIEMPRE PRIMERO */}
        <StatsSection>
          <Stack direction="row" justify="space-between" align="center" mb="lg">
            <Stack direction="row" gap="sm" align="center">
              <Badge variant="solid" colorPalette="blue">Security Compliant</Badge>
              <Badge variant="solid" colorPalette="green">{metrics.activeStaff} Activos</Badge>
              <Typography variant="body" size="sm" color="text.muted">
                Directorio, rendimiento, entrenamiento y administración HR
              </Typography>
            </Stack>
            <Button variant="solid" onClick={actions.handleNewEmployee} size="lg">
              <Icon icon={PlusIcon} size="sm" />
              Nuevo Empleado
            </Button>
          </Stack>
          <CardGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="md">
            <MetricCard
              title="Total Personal"
              value={metrics.totalStaff}
              icon={UsersIcon}
              colorPalette="blue"
              onClick={() => ModuleEventUtils.business.metricClicked('total-staff')}
            />
            <MetricCard
              title="En Turno"
              value={metrics.onShiftCount}
              icon={ClockIcon}
              colorPalette="green"
              onClick={() => ModuleEventUtils.business.metricClicked('on-shift')}
            />
            <MetricCard
              title="Rendimiento Prom."
              value={`${(metrics.avgPerformanceRating * 20).toFixed(1)}%`}
              icon={TrophyIcon}
              colorPalette="purple"
              trend={{ value: metrics.avgPerformanceRating, isPositive: metrics.avgPerformanceRating > 3.5 }}
              onClick={() => ModuleEventUtils.business.metricClicked('performance')}
            />
            <MetricCard
              title="Evaluaciones Pendientes"
              value={metrics.upcomingReviews}
              icon={AcademicCapIcon}
              colorPalette="orange"
              onClick={() => ModuleEventUtils.business.metricClicked('reviews')}
            />
          </CardGrid>
        </StatsSection>

        {/* 💰 MÉTRICAS DE COSTOS LABORALES */}
        <StatsSection>
          <CardGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="md">
            <MetricCard
              title="Costo Laboral Hoy"
              value={`$${metrics.todayLaborCost.toFixed(2)}`}
              icon={CurrencyDollarIcon}
              colorPalette="teal"
              onClick={() => ModuleEventUtils.business.metricClicked('labor-cost')}
            />
            <MetricCard
              title="Uso Presupuesto"
              value={`${metrics.budgetUtilization.toFixed(1)}%`}
              icon={ArrowTrendingUpIcon}
              colorPalette={metrics.budgetVariance > 10 ? "red" : "green"}
              trend={{ value: metrics.budgetVariance, isPositive: metrics.budgetVariance <= 0 }}
              onClick={() => ModuleEventUtils.business.metricClicked('budget-usage')}
            />
            <MetricCard
              title="Eficiencia"
              value={`${metrics.efficiencyScore.toFixed(1)}%`}
              icon={CheckCircleIcon}
              colorPalette="cyan"
              trend={{ value: metrics.efficiencyScore, isPositive: metrics.efficiencyScore > 80 }}
              onClick={() => ModuleEventUtils.business.metricClicked('efficiency')}
            />
            <MetricCard
              title="Horas Extra"
              value={`${metrics.totalOvertimeHours.toFixed(1)}h`}
              icon={ExclamationTriangleIcon}
              colorPalette={metrics.overtimeConcerns > 0 ? "orange" : "green"}
              onClick={() => ModuleEventUtils.business.metricClicked('overtime')}
            />
          </CardGrid>
        </StatsSection>

        {/* 🚨 ALERTAS CRÍTICAS - Solo si existen */}
        {alertsData.length > 0 && (
          <Section variant="elevated" title="Alertas y Notificaciones">
            <Stack direction="column" gap="sm">
              {alertsData.map((alert, index) => (
                <Alert
                  key={index}
                  variant="subtle"
                  title={alert.message}
                  icon={<Icon icon={ExclamationTriangleIcon} size="sm" />}
                />
              ))}
            </Stack>
          </Section>
        )}

        {/* ⏰ CONTROL DE TIEMPO */}
        <Section variant="elevated" title="Control de Tiempo">
          <Stack direction="row" gap="sm" align="center" mb="md">
            <Icon icon={ClockIcon} size="lg" color="blue.600" />
            <Typography variant="body" color="text.muted">
              Personal activo en turno: {metrics.onShiftCount}
            </Typography>
          </Stack>
          <Stack direction="row" gap="md" flexWrap="wrap">
            <Button
              variant="outline"
              onClick={actions.handleTimeReports}
              flex="1"
              minW="200px"
            >
              <Icon icon={ChartBarIcon} size="sm" />
              Ver Reportes
            </Button>
            <Button
              variant="outline"
              onClick={actions.handleScheduleManagement}
              flex="1"
              minW="200px"
            >
              <Icon icon={ClockIcon} size="sm" />
              Gestionar Horarios
            </Button>
          </Stack>
        </Section>

        {/* 📈 ANALYTICS DE RENDIMIENTO - Condicional */}
        {pageState.showAnalytics && (
          <Section variant="elevated" title="Analytics de Rendimiento">
            <CardGrid columns={{ base: 1, md: 2, lg: 3 }} gap="md">
              <MetricCard
                title="Asistencia Promedio"
                value={`${metrics.avgAttendanceRate.toFixed(1)}%`}
                icon={CheckCircleIcon}
                colorPalette="green"
              />
              <MetricCard
                title="Puntualidad"
                value={`${metrics.avgPunctualityScore.toFixed(1)}%`}
                icon={ClockIcon}
                colorPalette="blue"
              />
              <MetricCard
                title="Riesgos de Retención"
                value={metrics.retentionRisks}
                icon={ExclamationTriangleIcon}
                colorPalette="red"
              />
            </CardGrid>
          </Section>
        )}

        {/* 🏢 ACCIONES ADMINISTRATIVAS */}
        <Section variant="flat" title="Acciones Administrativas">
          <Stack direction="row" gap="md" flexWrap="wrap">
            <Button
              variant="outline"
              onClick={actions.handlePayrollGeneration}
              flex="1"
              minW="200px"
            >
              <Icon icon={CurrencyDollarIcon} size="sm" />
              Generar Nómina
            </Button>
            <Button
              variant="outline"
              onClick={actions.handleBudgetAnalysis}
              flex="1"
              minW="200px"
            >
              <Icon icon={ChartBarIcon} size="sm" />
              Análisis Presupuesto
            </Button>
            <Button
              variant="outline"
              onClick={actions.handleScheduleTraining}
              flex="1"
              minW="200px"
            >
              <Icon icon={AcademicCapIcon} size="sm" />
              Programar Entrenamiento
            </Button>
          </Stack>
        </Section>

        {/* ⚡ ACCIONES RÁPIDAS */}
        <Section variant="default" title="Acciones Rápidas">
          <Stack direction="row" gap="md" flexWrap="wrap">
            <Button
              variant="outline"
              onClick={actions.handleShowAnalytics}
              flex="1"
              minW="200px"
            >
              <Icon icon={ChartBarIcon} size="sm" />
              {pageState.showAnalytics ? 'Ocultar' : 'Ver'} Analytics
            </Button>
            <Button
              variant="outline"
              onClick={actions.handleBulkPerformanceUpdate}
              flex="1"
              minW="200px"
            >
              <Icon icon={TrophyIcon} size="sm" />
              Evaluación Masiva
            </Button>
            <Button
              variant="outline"
              onClick={actions.handleComplianceReport}
              flex="1"
              minW="200px"
            >
              <Icon icon={ShieldCheckIcon} size="sm" />
              Reporte Cumplimiento
            </Button>
          </Stack>
        </Section>
      </Stack>
    </ContentLayout>
  );
}
