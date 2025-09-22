// Test básico para verificar la sintaxis y estructura del SchedulingPage
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SchedulingPage from '../page';

// Mock de los componentes externos
vi.mock('../components', () => ({
  SchedulingMetrics: () => <div data-testid="scheduling-metrics">Scheduling Metrics</div>,
  SchedulingManagement: () => <div data-testid="scheduling-management">Scheduling Management</div>,
  SchedulingActions: () => <div data-testid="scheduling-actions">Scheduling Actions</div>,
  SchedulingAlerts: () => <div data-testid="scheduling-alerts">Scheduling Alerts</div>,
  WeeklyScheduleView: () => <div data-testid="weekly-schedule">Weekly Schedule</div>,
  TimeOffManager: () => <div data-testid="time-off">Time Off Manager</div>,
  CoveragePlanner: () => <div data-testid="coverage">Coverage Planner</div>,
  LaborCostTracker: () => <div data-testid="labor-cost">Labor Cost Tracker</div>,
  RealTimeLaborTracker: () => <div data-testid="realtime">Real Time Tracker</div>,
  AutoSchedulingModal: () => <div data-testid="auto-modal">Auto Scheduling Modal</div>
}));

// Mock de los hooks
vi.mock('../hooks', () => ({
  useSchedulingPage: () => ({
    viewState: {
      activeTab: 'schedule',
      selectedWeek: '2024-01-15',
      filters: {},
      viewMode: 'week'
    },
    schedulingStats: {
      total_shifts_this_week: 156,
      employees_scheduled: 24,
      coverage_percentage: 87.5,
      pending_time_off: 8,
      labor_cost_this_week: 18750,
      overtime_hours: 12,
      understaffed_shifts: 3,
      approved_requests: 15
    },
    isAutoSchedulingOpen: false,
    loading: false,
    error: null,
    handleTabChange: vi.fn(),
    setViewState: vi.fn(),
    setIsAutoSchedulingOpen: vi.fn(),
    handleScheduleGenerated: vi.fn()
  })
}));

// Mock de los sistemas integrados
vi.mock('@/hooks/useModuleIntegration', () => ({
  useModuleIntegration: () => ({
    emitEvent: vi.fn(),
    hasCapability: vi.fn(() => true),
    status: {
      isActive: true,
      missingCapabilities: []
    }
  })
}));

vi.mock('@/lib/capabilities', () => ({
  CapabilityGate: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

vi.mock('@/lib/error-handling', () => ({
  useErrorHandler: () => ({
    handleError: vi.fn()
  })
}));

vi.mock('@/lib/offline/useOfflineStatus', () => ({
  useOfflineStatus: () => ({
    isOnline: true
  })
}));

vi.mock('@/lib/performance/PerformanceMonitor', () => ({
  usePerformanceMonitor: () => ({
    shouldReduceAnimations: false
  })
}));

vi.mock('@/contexts/NavigationContext', () => ({
  useNavigation: () => ({
    isMobile: false
  })
}));

describe('SchedulingPage', () => {
  it('should render without crashing', () => {
    render(<SchedulingPage />);

    // Verificar que las métricas principales están presentes
    expect(screen.getByText('Turnos Esta Semana')).toBeInTheDocument();
    expect(screen.getByText('Cobertura')).toBeInTheDocument();
    expect(screen.getByText('Solicitudes Pendientes')).toBeInTheDocument();
    expect(screen.getByText('Costo Laboral')).toBeInTheDocument();
  });

  it('should display correct metric values', () => {
    render(<SchedulingPage />);

    // Verificar que los valores de las métricas se muestran correctamente
    expect(screen.getByText('156')).toBeInTheDocument(); // total_shifts_this_week
    expect(screen.getByText('87.5%')).toBeInTheDocument(); // coverage_percentage
    expect(screen.getByText('8')).toBeInTheDocument(); // pending_time_off
    expect(screen.getByText('$18.750')).toBeInTheDocument(); // labor_cost_this_week (formato argentino)
  });

  it('should render all tab sections', () => {
    render(<SchedulingPage />);

    // Verificar que todas las pestañas están presentes
    expect(screen.getByText('Horarios')).toBeInTheDocument();
    expect(screen.getByText('Permisos')).toBeInTheDocument();
    expect(screen.getByText('Cobertura')).toBeInTheDocument();
    expect(screen.getByText('Costos')).toBeInTheDocument();
    expect(screen.getByText('Tiempo Real')).toBeInTheDocument();
  });

  it('should render action buttons', () => {
    render(<SchedulingPage />);

    // Verificar que los botones de acción están presentes
    expect(screen.getByText('Nuevo Turno')).toBeInTheDocument();
    expect(screen.getByText('Auto-Programar')).toBeInTheDocument();
    expect(screen.getByText('Exportar Horarios')).toBeInTheDocument();
  });

  it('should show alerts when there are issues', () => {
    render(<SchedulingPage />);

    // Verificar que las alertas se muestran cuando hay problemas
    expect(screen.getByText('Turnos con Personal Insuficiente')).toBeInTheDocument();
    expect(screen.getByText('Horas Extra Detectadas')).toBeInTheDocument();
  });

  it('should use enterprise template structure', () => {
    render(<SchedulingPage />);

    // Verificar que sigue la estructura de template empresarial
    expect(screen.getByText('Gestión de Horarios')).toBeInTheDocument();
    expect(screen.getByText('Alertas y Notificaciones')).toBeInTheDocument();
    expect(screen.getByText('Acciones Rápidas')).toBeInTheDocument();
  });
});