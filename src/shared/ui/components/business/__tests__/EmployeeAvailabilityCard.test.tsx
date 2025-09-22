// EmployeeAvailabilityCard.test.tsx - Tests para tarjeta de disponibilidad de empleados
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmployeeAvailabilityCard } from '../EmployeeAvailabilityCard';
import type { EmployeeAvailability } from '../EmployeeAvailabilityCard';

// Mock de shared UI components
vi.mock('@/shared/ui', async () => {
  const actual = await vi.importActual('@/shared/ui');
  return {
    ...actual,
    Stack: ({ children, ...props }: any) => <div data-testid="stack" {...props}>{children}</div>,
    Badge: ({ children, colorPalette, variant, ...props }: any) => (
      <span data-testid="badge" data-color={colorPalette} data-variant={variant} {...props}>
        {children}
      </span>
    ),
    Icon: ({ icon, ...props }: any) => <span data-testid="icon" {...props}>{icon.name || 'icon'}</span>,
    Avatar: ({ name, fallback, ...props }: any) => (
      <div data-testid="avatar" {...props}>
        {name?.charAt(0) || 'A'}
      </div>
    )
  };
});

describe('EmployeeAvailabilityCard Component', () => {
  const mockEmployee: EmployeeAvailability = {
    id: '1',
    name: 'Ana García',
    position: 'Server',
    email: 'ana@restaurant.com',
    availableDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    preferredShifts: ['morning', 'afternoon'],
    maxWeeklyHours: 40,
    currentWeeklyHours: 32,
    status: 'available',
    reliability: 95,
    averageRating: 4.8,
    totalShiftsThisMonth: 12,
    lastScheduled: '2024-01-10'
  };

  const defaultProps = {
    employee: mockEmployee,
    variant: 'default' as const,
    showActions: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      render(<EmployeeAvailabilityCard {...defaultProps} />);

      expect(screen.getByText('Ana García')).toBeInTheDocument();
      expect(screen.getByText('Server')).toBeInTheDocument();
    });

    it('should display employee avatar and basic info', () => {
      render(<EmployeeAvailabilityCard {...defaultProps} />);

      expect(screen.getByTestId('avatar')).toBeInTheDocument();
      expect(screen.getByText('Ana García')).toBeInTheDocument();
      expect(screen.getByText('Server')).toBeInTheDocument();
    });

    it('should show status badge', () => {
      render(<EmployeeAvailabilityCard {...defaultProps} />);

      const statusBadge = screen.getByText('Disponible');
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge.closest('[data-testid="badge"]')).toHaveAttribute('data-color', 'green');
    });
  });

  describe('Availability Display', () => {
    it('should show availability days as badges', () => {
      render(<EmployeeAvailabilityCard {...defaultProps} />);

      // Verificar días disponibles
      expect(screen.getByText('L')).toBeInTheDocument(); // Lunes
      expect(screen.getByText('M')).toBeInTheDocument(); // Martes
      expect(screen.getByText('X')).toBeInTheDocument(); // Miércoles
      expect(screen.getByText('J')).toBeInTheDocument(); // Jueves
      expect(screen.getByText('V')).toBeInTheDocument(); // Viernes

      // Verificar días no disponibles
      const saturdayBadge = screen.getByText('S');
      expect(saturdayBadge.closest('[data-testid="badge"]')).toHaveAttribute('data-color', 'gray');
    });

    it('should display preferred shifts', () => {
      render(<EmployeeAvailabilityCard {...defaultProps} />);

      expect(screen.getByText('morning')).toBeInTheDocument();
      expect(screen.getByText('afternoon')).toBeInTheDocument();
    });
  });

  describe('Metrics Display', () => {
    it('should show hours utilization', () => {
      render(<EmployeeAvailabilityCard {...defaultProps} />);

      expect(screen.getByText('32/40h')).toBeInTheDocument();
    });

    it('should display reliability percentage', () => {
      render(<EmployeeAvailabilityCard {...defaultProps} />);

      expect(screen.getByText('95% confiabilidad')).toBeInTheDocument();
    });

    it('should show average rating', () => {
      render(<EmployeeAvailabilityCard {...defaultProps} />);

      expect(screen.getByText('⭐ 4.8')).toBeInTheDocument();
    });

    it('should display total shifts this month', () => {
      render(<EmployeeAvailabilityCard {...defaultProps} />);

      expect(screen.getByText('12 turnos este mes')).toBeInTheDocument();
    });
  });

  describe('Variant Rendering', () => {
    it('should render compact variant correctly', () => {
      render(<EmployeeAvailabilityCard {...defaultProps} variant="compact" />);

      // En modo compacto debería mostrar información básica
      expect(screen.getByText('Ana García')).toBeInTheDocument();
      expect(screen.getByText('32/40h')).toBeInTheDocument();
    });

    it('should render detailed variant with extra info', () => {
      render(<EmployeeAvailabilityCard {...defaultProps} variant="detailed" />);

      // En modo detallado debería mostrar más información
      expect(screen.getByText('Ana García')).toBeInTheDocument();
      expect(screen.getByText(/Último turno:/)).toBeInTheDocument();
    });
  });

  describe('Status Handling', () => {
    it('should handle different employee statuses', () => {
      const busyEmployee = { ...mockEmployee, status: 'busy' as const };
      render(<EmployeeAvailabilityCard {...defaultProps} employee={busyEmployee} />);

      const statusBadge = screen.getByText('Ocupado');
      expect(statusBadge.closest('[data-testid="badge"]')).toHaveAttribute('data-color', 'orange');
    });

    it('should handle vacation status', () => {
      const vacationEmployee = { ...mockEmployee, status: 'vacation' as const };
      render(<EmployeeAvailabilityCard {...defaultProps} employee={vacationEmployee} />);

      expect(screen.getByText('Vacaciones')).toBeInTheDocument();
    });

    it('should handle sick status', () => {
      const sickEmployee = { ...mockEmployee, status: 'sick' as const };
      render(<EmployeeAvailabilityCard {...defaultProps} employee={sickEmployee} />);

      expect(screen.getByText('Enfermo')).toBeInTheDocument();
    });
  });

  describe('Actions and Interactions', () => {
    it('should call onClick when card is clicked', () => {
      const onClick = vi.fn();
      render(<EmployeeAvailabilityCard {...defaultProps} onClick={onClick} />);

      const card = screen.getByText('Ana García').closest('[data-testid="stack"]');
      fireEvent.click(card!);

      expect(onClick).toHaveBeenCalledWith(mockEmployee);
    });

    it('should show action buttons when showActions is true', () => {
      render(<EmployeeAvailabilityCard {...defaultProps} showActions={true} />);

      expect(screen.getByText('Programar turno')).toBeInTheDocument();
      expect(screen.getByText('Contactar')).toBeInTheDocument();
    });

    it('should call onQuickAction when action button is clicked', () => {
      const onQuickAction = vi.fn();
      render(
        <EmployeeAvailabilityCard
          {...defaultProps}
          showActions={true}
          onQuickAction={onQuickAction}
        />
      );

      const scheduleButton = screen.getByText('Programar turno');
      fireEvent.click(scheduleButton);

      expect(onQuickAction).toHaveBeenCalledWith('1', 'schedule');
    });

    it('should not show actions for unavailable employees', () => {
      const unavailableEmployee = { ...mockEmployee, status: 'off' as const };
      render(
        <EmployeeAvailabilityCard
          {...defaultProps}
          employee={unavailableEmployee}
          showActions={true}
        />
      );

      expect(screen.queryByText('Programar turno')).not.toBeInTheDocument();
    });
  });

  describe('Configuration Options', () => {
    it('should show contact info when config.showContact is true', () => {
      render(
        <EmployeeAvailabilityCard
          {...defaultProps}
          variant="detailed"
          config={{ showContact: true, showMetrics: true, showAvailabilityDetails: true, allowScheduling: true }}
        />
      );

      expect(screen.getByText('ana@restaurant.com')).toBeInTheDocument();
    });

    it('should hide metrics when config.showMetrics is false', () => {
      render(
        <EmployeeAvailabilityCard
          {...defaultProps}
          config={{ showMetrics: false, showContact: false, showAvailabilityDetails: true, allowScheduling: true }}
        />
      );

      expect(screen.queryByText('32/40h')).not.toBeInTheDocument();
    });

    it('should hide availability details when config.showAvailabilityDetails is false', () => {
      render(
        <EmployeeAvailabilityCard
          {...defaultProps}
          config={{ showAvailabilityDetails: false, showMetrics: true, showContact: false, allowScheduling: true }}
        />
      );

      expect(screen.queryByText('Disponibilidad semanal')).not.toBeInTheDocument();
    });
  });

  describe('Utilization Calculations', () => {
    it('should calculate and display correct utilization percentage', () => {
      // 32/40 = 80%
      render(<EmployeeAvailabilityCard {...defaultProps} />);

      const utilizationBadge = screen.getByText('80%');
      expect(utilizationBadge).toBeInTheDocument();
    });

    it('should handle high utilization (>90%)', () => {
      const highUtilizationEmployee = {
        ...mockEmployee,
        currentWeeklyHours: 38, // 38/40 = 95%
        maxWeeklyHours: 40
      };

      render(<EmployeeAvailabilityCard {...defaultProps} employee={highUtilizationEmployee} />);

      const utilizationBadge = screen.getByText('95%');
      expect(utilizationBadge.closest('[data-testid="badge"]')).toHaveAttribute('data-color', 'red');
    });

    it('should handle low utilization (<50%)', () => {
      const lowUtilizationEmployee = {
        ...mockEmployee,
        currentWeeklyHours: 15, // 15/40 = 37.5%
        maxWeeklyHours: 40
      };

      render(<EmployeeAvailabilityCard {...defaultProps} employee={lowUtilizationEmployee} />);

      const utilizationBadge = screen.getByText('38%');
      expect(utilizationBadge.closest('[data-testid="badge"]')).toHaveAttribute('data-color', 'green');
    });
  });

  describe('Edge Cases', () => {
    it('should handle employee without current hours', () => {
      const employeeWithoutHours = {
        ...mockEmployee,
        currentWeeklyHours: undefined
      };

      render(<EmployeeAvailabilityCard {...defaultProps} employee={employeeWithoutHours} />);

      expect(screen.getByText('0/40h')).toBeInTheDocument();
    });

    it('should handle employee without reliability score', () => {
      const employeeWithoutReliability = {
        ...mockEmployee,
        reliability: undefined
      };

      render(<EmployeeAvailabilityCard {...defaultProps} employee={employeeWithoutReliability} />);

      // No debería mostrar el indicador de confiabilidad
      expect(screen.queryByText(/confiabilidad/)).not.toBeInTheDocument();
    });

    it('should handle empty preferred shifts', () => {
      const employeeWithoutShifts = {
        ...mockEmployee,
        preferredShifts: []
      };

      render(<EmployeeAvailabilityCard {...defaultProps} employee={employeeWithoutShifts} />);

      // No debería mostrar la sección de turnos preferidos
      expect(screen.queryByText('Turnos preferidos')).not.toBeInTheDocument();
    });

    it('should handle employee with no available days', () => {
      const employeeWithNoDays = {
        ...mockEmployee,
        availableDays: []
      };

      render(<EmployeeAvailabilityCard {...defaultProps} employee={employeeWithNoDays} />);

      // Todos los días deberían estar en gris
      const dayBadges = screen.getAllByTestId('badge').filter(badge =>
        ['L', 'M', 'X', 'J', 'V', 'S', 'D'].includes(badge.textContent || '')
      );

      dayBadges.forEach(badge => {
        expect(badge).toHaveAttribute('data-color', 'gray');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility attributes for actions', () => {
      render(<EmployeeAvailabilityCard {...defaultProps} showActions={true} />);

      const scheduleButton = screen.getByText('Programar turno');
      expect(scheduleButton.closest('button')).toBeInTheDocument();
    });

    it('should provide meaningful tooltips for day badges', () => {
      render(<EmployeeAvailabilityCard {...defaultProps} />);

      const mondayBadge = screen.getByText('L');
      expect(mondayBadge.closest('[data-testid="badge"]')).toHaveAttribute('title', 'Mon - Disponible');
    });
  });
});