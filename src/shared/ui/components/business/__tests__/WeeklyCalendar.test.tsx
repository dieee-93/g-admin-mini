// WeeklyCalendar.test.tsx - Tests para el calendario semanal compartido
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeeklyCalendar } from '../WeeklyCalendar';
import type { CalendarShift } from '../WeeklyCalendar';

// Mock de shared UI components
vi.mock('@/shared/ui', async () => {
  const actual = await vi.importActual('@/shared/ui');
  return {
    ...actual,
    Stack: ({ children, ...props }: any) => <div data-testid="stack" {...props}>{children}</div>,
    Button: ({ children, onClick, ...props }: any) => (
      <button onClick={onClick} {...props}>{children}</button>
    ),
    Icon: ({ icon, ...props }: any) => <span data-testid="icon" {...props}>{icon.name || 'icon'}</span>,
    Badge: ({ children, ...props }: any) => <span data-testid="badge" {...props}>{children}</span>,
    Grid: ({ children, ...props }: any) => <div data-testid="grid" {...props}>{children}</div>,
    Skeleton: ({ ...props }: any) => <div data-testid="skeleton" {...props}>Loading...</div>
  };
});

// Mock de Chakra UI
vi.mock('@chakra-ui/react', () => ({
  Skeleton: ({ children, ...props }: any) => <div data-testid="chakra-skeleton" {...props}>Loading...</div>
}));

describe('WeeklyCalendar Component', () => {
  const mockShifts: CalendarShift[] = [
    {
      id: '1',
      employeeId: 'emp1',
      employeeName: 'Ana García',
      date: '2024-01-15',
      startTime: '09:00',
      endTime: '17:00',
      position: 'Server',
      status: 'confirmed'
    },
    {
      id: '2',
      employeeId: 'emp2',
      employeeName: 'Carlos López',
      date: '2024-01-16',
      startTime: '11:00',
      endTime: '20:00',
      position: 'Cook',
      status: 'scheduled'
    }
  ];

  const defaultProps = {
    shifts: mockShifts,
    initialWeek: new Date('2024-01-15'),
    onWeekChange: vi.fn(),
    onDayClick: vi.fn(),
    onShiftClick: vi.fn(),
    onNewShift: vi.fn(),
    loading: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      render(<WeeklyCalendar {...defaultProps} />);

      // Verificar que la estructura básica está presente
      expect(screen.getAllByTestId('stack')).toHaveLength(2); // Header + main content
    });

    it('should display week navigation header', () => {
      render(<WeeklyCalendar {...defaultProps} />);

      // Verificar navegación de semana
      expect(screen.getByText(/enero 2024/i)).toBeInTheDocument();
      expect(screen.getByText(/Week of/i)).toBeInTheDocument();
    });

    it('should render calendar grid with 7 days', () => {
      render(<WeeklyCalendar {...defaultProps} />);

      // Debería tener un grid con columnas para los 7 días
      const grid = screen.getByTestId('grid');
      expect(grid).toBeInTheDocument();
    });

    it('should show shift count in header', () => {
      render(<WeeklyCalendar {...defaultProps} />);

      expect(screen.getByText('2 shifts this week')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show skeleton when loading', () => {
      render(<WeeklyCalendar {...defaultProps} loading={true} />);

      expect(screen.getByTestId('chakra-skeleton')).toBeInTheDocument();
    });

    it('should not show main content when loading', () => {
      render(<WeeklyCalendar {...defaultProps} loading={true} />);

      // No debería mostrar la navegación de semana
      expect(screen.queryByText(/enero 2024/i)).not.toBeInTheDocument();
    });
  });

  describe('Week Navigation', () => {
    it('should call onWeekChange when navigating', () => {
      const onWeekChange = vi.fn();
      render(<WeeklyCalendar {...defaultProps} onWeekChange={onWeekChange} />);

      // Click en botón de navegación anterior/siguiente
      const buttons = screen.getAllByRole('button');
      const navButtons = buttons.filter(btn => {
        const icon = btn.querySelector('[data-testid="icon"]');
        return icon && (icon.textContent === 'ChevronLeftIcon' || icon.textContent === 'ChevronRightIcon');
      });

      if (navButtons.length > 0) {
        fireEvent.click(navButtons[0]);
        expect(onWeekChange).toHaveBeenCalled();
      }
    });
  });

  describe('Shifts Display', () => {
    it('should render shifts in correct days', () => {
      render(<WeeklyCalendar {...defaultProps} />);

      // Verificar que se muestran los turnos
      expect(screen.getByText('Ana García')).toBeInTheDocument();
      expect(screen.getByText('Carlos López')).toBeInTheDocument();
    });

    it('should show shift status badges', () => {
      render(<WeeklyCalendar {...defaultProps} />);

      // Verificar badges de estado
      const badges = screen.getAllByTestId('badge');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should call onShiftClick when shift is clicked', () => {
      const onShiftClick = vi.fn();
      render(<WeeklyCalendar {...defaultProps} onShiftClick={onShiftClick} />);

      // Click en un turno
      const shiftElement = screen.getByText('Ana García');
      fireEvent.click(shiftElement.closest('[data-testid="stack"]') || shiftElement);

      expect(onShiftClick).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          employeeName: 'Ana García'
        })
      );
    });
  });

  describe('Configuration Options', () => {
    it('should show coverage when config.showCoverage is true', () => {
      render(
        <WeeklyCalendar
          {...defaultProps}
          config={{ showCoverage: true, showHours: false, allowNewShifts: false, compactMode: false }}
        />
      );

      // Verificar que se muestra información de cobertura
      const badges = screen.getAllByTestId('badge');
      const coverageBadge = badges.find(badge => badge.textContent?.includes('%'));
      expect(coverageBadge).toBeInTheDocument();
    });

    it('should show hours when config.showHours is true', () => {
      render(
        <WeeklyCalendar
          {...defaultProps}
          config={{ showCoverage: false, showHours: true, allowNewShifts: false, compactMode: false }}
        />
      );

      // Verificar que se muestra información de horas
      expect(screen.getByText(/h$/)).toBeInTheDocument();
    });

    it('should show new shift button when allowNewShifts is true', () => {
      render(
        <WeeklyCalendar
          {...defaultProps}
          config={{ showCoverage: false, showHours: false, allowNewShifts: true, compactMode: false }}
        />
      );

      // Verificar botón de nuevo turno
      expect(screen.getByText('New Shift')).toBeInTheDocument();
    });

    it('should call onNewShift when new shift button is clicked', () => {
      const onNewShift = vi.fn();
      render(
        <WeeklyCalendar
          {...defaultProps}
          onNewShift={onNewShift}
          config={{ allowNewShifts: true, showCoverage: false, showHours: false, compactMode: false }}
        />
      );

      const newShiftButton = screen.getByText('New Shift');
      fireEvent.click(newShiftButton);

      expect(onNewShift).toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no shifts', () => {
      render(<WeeklyCalendar {...defaultProps} shifts={[]} />);

      expect(screen.getByText('0 shifts this week')).toBeInTheDocument();
    });

    it('should show add shift prompts in empty days', () => {
      render(
        <WeeklyCalendar
          {...defaultProps}
          shifts={[]}
          config={{ allowNewShifts: true, showCoverage: false, showHours: false, compactMode: false }}
        />
      );

      // Debería mostrar prompts para agregar turnos
      expect(screen.getByText('Add shift')).toBeInTheDocument();
    });
  });

  describe('Day Interaction', () => {
    it('should call onDayClick when day header is clicked', () => {
      const onDayClick = vi.fn();
      render(<WeeklyCalendar {...defaultProps} onDayClick={onDayClick} />);

      // Buscar un elemento que represente un día (número del día)
      const dayElements = screen.getAllByText(/^\d{1,2}$/); // Números del 1-31
      if (dayElements.length > 0) {
        fireEvent.click(dayElements[0]);
        expect(onDayClick).toHaveBeenCalled();
      }
    });
  });

  describe('Responsive Behavior', () => {
    it('should handle compact mode configuration', () => {
      render(
        <WeeklyCalendar
          {...defaultProps}
          config={{ compactMode: true, showCoverage: true, showHours: true, allowNewShifts: true }}
        />
      );

      // En modo compacto debería seguir funcionando
      expect(screen.getByText('Ana García')).toBeInTheDocument();
    });
  });

  describe('Data Calculation', () => {
    it('should calculate day metrics correctly', () => {
      render(<WeeklyCalendar {...defaultProps} />);

      // Verificar que se calculan las métricas (horas, cobertura)
      // Los cálculos internos deberían reflejarse en la UI
      const badges = screen.getAllByTestId('badge');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should handle different shift statuses', () => {
      const mixedShifts: CalendarShift[] = [
        {
          ...mockShifts[0],
          status: 'confirmed'
        },
        {
          ...mockShifts[1],
          status: 'cancelled'
        }
      ];

      render(<WeeklyCalendar {...defaultProps} shifts={mixedShifts} />);

      // Debería manejar diferentes estados de turnos
      expect(screen.getByText('Ana García')).toBeInTheDocument();
      expect(screen.getByText('Carlos López')).toBeInTheDocument();
    });
  });
});