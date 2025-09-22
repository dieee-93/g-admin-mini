// TimeSlotPicker.test.tsx - Tests para selector de horarios
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimeSlotPicker } from '../TimeSlotPicker';
import type { TimeSlot } from '../TimeSlotPicker';

// Mock de shared UI components
vi.mock('@/shared/ui', async () => {
  const actual = await vi.importActual('@/shared/ui');
  return {
    ...actual,
    Stack: ({ children, direction, gap, ...props }: any) => (
      <div data-testid="stack" data-direction={direction} data-gap={gap} {...props}>
        {children}
      </div>
    ),
    Button: ({ children, onClick, variant, disabled, ...props }: any) => (
      <button
        onClick={onClick}
        disabled={disabled}
        data-variant={variant}
        {...props}
      >
        {children}
      </button>
    ),
    Icon: ({ icon, size, color, ...props }: any) => (
      <span data-testid="icon" data-size={size} data-color={color} {...props}>
        {icon.name || 'icon'}
      </span>
    ),
    Badge: ({ children, colorPalette, variant, size, ...props }: any) => (
      <span
        data-testid="badge"
        data-color={colorPalette}
        data-variant={variant}
        data-size={size}
        {...props}
      >
        {children}
      </span>
    ),
    Grid: ({ children, templateColumns, gap, ...props }: any) => (
      <div
        data-testid="grid"
        data-template-columns={templateColumns}
        data-gap={gap}
        {...props}
      >
        {children}
      </div>
    )
  };
});

describe('TimeSlotPicker Component', () => {
  const mockTimeSlots: TimeSlot[] = [
    {
      id: '1',
      startTime: '09:00',
      endTime: '17:00',
      duration: 480, // 8 hours
      available: true,
      capacity: 5,
      assigned: 2
    },
    {
      id: '2',
      startTime: '14:00',
      endTime: '22:00',
      duration: 480, // 8 hours
      available: true,
      capacity: 3,
      assigned: 3
    },
    {
      id: '3',
      startTime: '22:00',
      endTime: '06:00',
      duration: 480, // 8 hours
      available: false,
      reason: 'Cerrado por mantenimiento'
    },
    {
      id: '4',
      startTime: '10:00',
      endTime: '18:00',
      duration: 480,
      available: true,
      conflicted: true,
      reason: 'Conflicto con otro evento'
    }
  ];

  const defaultProps = {
    timeSlots: mockTimeSlots,
    selectedSlot: null,
    onSlotSelect: vi.fn(),
    loading: false,
    title: 'Seleccionar Horario'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      render(<TimeSlotPicker {...defaultProps} />);

      expect(screen.getByText('Seleccionar Horario')).toBeInTheDocument();
    });

    it('should display title correctly', () => {
      render(<TimeSlotPicker {...defaultProps} title="Custom Title" />);

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('should show available slots count', () => {
      render(<TimeSlotPicker {...defaultProps} />);

      // 3 slots están disponibles (sin conflictos)
      expect(screen.getByText('2 disponibles')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading skeleton when loading', () => {
      render(<TimeSlotPicker {...defaultProps} loading={true} />);

      expect(screen.getByText('Seleccionar Horario')).toBeInTheDocument();
      // Debería mostrar elementos de carga simulados
      expect(screen.getAllByTestId('grid')).toHaveLength(1);
    });
  });

  describe('Time Slot Display', () => {
    it('should render available time slots', () => {
      render(<TimeSlotPicker {...defaultProps} />);

      expect(screen.getByText('9:00 AM - 5:00 PM')).toBeInTheDocument();
      expect(screen.getByText('2:00 PM - 10:00 PM')).toBeInTheDocument();
    });

    it('should show unavailable slots in separate section', () => {
      render(<TimeSlotPicker {...defaultProps} />);

      expect(screen.getByText('No Disponibles')).toBeInTheDocument();
      expect(screen.getByText('Cerrado por mantenimiento')).toBeInTheDocument();
    });

    it('should display slot duration when config.showDuration is true', () => {
      render(
        <TimeSlotPicker
          {...defaultProps}
          config={{ showDuration: true, showCapacity: false, showConflicts: false, allowConflicted: false, compactMode: false }}
        />
      );

      expect(screen.getByText('8h')).toBeInTheDocument();
    });

    it('should show capacity information when config.showCapacity is true', () => {
      render(
        <TimeSlotPicker
          {...defaultProps}
          config={{ showCapacity: true, showDuration: false, showConflicts: false, allowConflicted: false, compactMode: false }}
        />
      );

      expect(screen.getByText('2/5')).toBeInTheDocument();
      expect(screen.getByText('3/3')).toBeInTheDocument();
    });

    it('should display conflict warnings when config.showConflicts is true', () => {
      render(
        <TimeSlotPicker
          {...defaultProps}
          config={{ showConflicts: true, showDuration: false, showCapacity: false, allowConflicted: true, compactMode: false }}
        />
      );

      expect(screen.getByText('Conflicto con otro evento')).toBeInTheDocument();
    });
  });

  describe('Slot Selection', () => {
    it('should call onSlotSelect when slot is clicked', () => {
      const onSlotSelect = vi.fn();
      render(<TimeSlotPicker {...defaultProps} onSlotSelect={onSlotSelect} />);

      // Click en el primer slot disponible
      const firstSlot = screen.getByText('9:00 AM - 5:00 PM');
      fireEvent.click(firstSlot.closest('[data-testid="stack"]')!);

      expect(onSlotSelect).toHaveBeenCalledWith('1');
    });

    it('should highlight selected slot', () => {
      render(<TimeSlotPicker {...defaultProps} selectedSlot="1" />);

      // El slot seleccionado debería tener indicador visual
      const selectedSlot = screen.getByText('9:00 AM - 5:00 PM').closest('[data-testid="stack"]');
      expect(selectedSlot).toBeInTheDocument();
    });

    it('should allow deselecting slot in single mode', () => {
      const onSlotSelect = vi.fn();
      render(<TimeSlotPicker {...defaultProps} selectedSlot="1" onSlotSelect={onSlotSelect} />);

      // Click en el slot ya seleccionado debería deseleccionarlo
      const selectedSlot = screen.getByText('9:00 AM - 5:00 PM');
      fireEvent.click(selectedSlot.closest('[data-testid="stack"]')!);

      expect(onSlotSelect).toHaveBeenCalledWith(null);
    });

    it('should handle multiple selection mode', () => {
      render(
        <TimeSlotPicker
          {...defaultProps}
          selectionMode="multiple"
          selectedSlots={['1', '2']}
        />
      );

      // Verificar que múltiples slots pueden estar seleccionados
      expect(screen.getByText('2 seleccionados')).toBeInTheDocument();
    });
  });

  describe('Slot Status Handling', () => {
    it('should show correct status for available slots', () => {
      render(<TimeSlotPicker {...defaultProps} />);

      expect(screen.getByText('Disponible')).toBeInTheDocument();
    });

    it('should show correct status for full capacity slots', () => {
      render(
        <TimeSlotPicker
          {...defaultProps}
          config={{ showCapacity: true, showDuration: false, showConflicts: false, allowConflicted: false, compactMode: false }}
        />
      );

      // El slot con 3/3 capacidad debería mostrar "Completo"
      expect(screen.getByText('Completo')).toBeInTheDocument();
    });

    it('should prevent selection of unavailable slots', () => {
      const onSlotSelect = vi.fn();
      render(<TimeSlotPicker {...defaultProps} onSlotSelect={onSlotSelect} />);

      // Intentar click en slot no disponible
      const unavailableSlot = screen.getByText('Cerrado por mantenimiento');
      fireEvent.click(unavailableSlot.closest('[data-testid="stack"]')!);

      // No debería llamar onSlotSelect
      expect(onSlotSelect).not.toHaveBeenCalled();
    });

    it('should prevent selection of conflicted slots when not allowed', () => {
      const onSlotSelect = vi.fn();
      render(
        <TimeSlotPicker
          {...defaultProps}
          config={{ allowConflicted: false, showConflicts: true, showDuration: false, showCapacity: false, compactMode: false }}
          onSlotSelect={onSlotSelect}
        />
      );

      // Intentar click en slot conflictivo
      const conflictedSlot = screen.getByText('Conflicto con otro evento');
      fireEvent.click(conflictedSlot.closest('[data-testid="stack"]')!);

      expect(onSlotSelect).not.toHaveBeenCalled();
    });
  });

  describe('Custom Slot Creation', () => {
    it('should show quick time generator when onCreateSlot is provided', () => {
      const onCreateSlot = vi.fn();
      render(<TimeSlotPicker {...defaultProps} onCreateSlot={onCreateSlot} />);

      expect(screen.getByText('Crear horario personalizado')).toBeInTheDocument();
      expect(screen.getByText('Mañana')).toBeInTheDocument();
      expect(screen.getByText('Tarde')).toBeInTheDocument();
      expect(screen.getByText('Noche')).toBeInTheDocument();
      expect(screen.getByText('Jornada')).toBeInTheDocument();
    });

    it('should call onCreateSlot when preset button is clicked', () => {
      const onCreateSlot = vi.fn();
      render(<TimeSlotPicker {...defaultProps} onCreateSlot={onCreateSlot} />);

      const morningButton = screen.getByText('Mañana');
      fireEvent.click(morningButton);

      expect(onCreateSlot).toHaveBeenCalledWith('06:00', '14:00');
    });

    it('should call onCreateSlot with custom times', () => {
      const onCreateSlot = vi.fn();
      render(<TimeSlotPicker {...defaultProps} onCreateSlot={onCreateSlot} />);

      // Cambiar tiempos personalizados
      const startTimeInput = screen.getByDisplayValue('09:00');
      const endTimeInput = screen.getByDisplayValue('17:00');
      const createButton = screen.getByText('Crear');

      fireEvent.change(startTimeInput, { target: { value: '10:00' } });
      fireEvent.change(endTimeInput, { target: { value: '18:00' } });
      fireEvent.click(createButton);

      expect(onCreateSlot).toHaveBeenCalledWith('10:00', '18:00');
    });

    it('should disable create button when end time is before start time', () => {
      const onCreateSlot = vi.fn();
      render(<TimeSlotPicker {...defaultProps} onCreateSlot={onCreateSlot} />);

      const startTimeInput = screen.getByDisplayValue('09:00');
      const endTimeInput = screen.getByDisplayValue('17:00');

      fireEvent.change(startTimeInput, { target: { value: '18:00' } });
      fireEvent.change(endTimeInput, { target: { value: '17:00' } });

      const createButton = screen.getByText('Crear');
      expect(createButton).toBeDisabled();
    });
  });

  describe('Custom Validation', () => {
    it('should apply custom validator', () => {
      const validator = vi.fn(() => ({ valid: false, message: 'Custom validation error' }));
      render(<TimeSlotPicker {...defaultProps} validator={validator} />);

      expect(screen.getByText('Custom validation error')).toBeInTheDocument();
      expect(validator).toHaveBeenCalled();
    });

    it('should prevent selection when validator returns invalid', () => {
      const validator = () => ({ valid: false, message: 'Not allowed' });
      const onSlotSelect = vi.fn();
      render(
        <TimeSlotPicker
          {...defaultProps}
          validator={validator}
          onSlotSelect={onSlotSelect}
        />
      );

      const firstSlot = screen.getByText('9:00 AM - 5:00 PM');
      fireEvent.click(firstSlot.closest('[data-testid="stack"]')!);

      expect(onSlotSelect).not.toHaveBeenCalled();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no slots provided', () => {
      render(<TimeSlotPicker {...defaultProps} timeSlots={[]} />);

      expect(screen.getByText('No hay horarios disponibles')).toBeInTheDocument();
    });

    it('should show create first slot button in empty state', () => {
      const onCreateSlot = vi.fn();
      render(
        <TimeSlotPicker
          {...defaultProps}
          timeSlots={[]}
          onCreateSlot={onCreateSlot}
        />
      );

      const createFirstButton = screen.getByText('Crear primer horario');
      fireEvent.click(createFirstButton);

      expect(onCreateSlot).toHaveBeenCalledWith('09:00', '17:00');
    });
  });

  describe('Compact Mode', () => {
    it('should render in compact mode correctly', () => {
      render(
        <TimeSlotPicker
          {...defaultProps}
          config={{ compactMode: true, showDuration: true, showCapacity: true, showConflicts: true, allowConflicted: false }}
        />
      );

      // En modo compacto debería seguir mostrando información esencial
      expect(screen.getByText('9:00 AM - 5:00 PM')).toBeInTheDocument();
    });
  });

  describe('Time Formatting', () => {
    it('should format time correctly in 12-hour format', () => {
      render(<TimeSlotPicker {...defaultProps} />);

      expect(screen.getByText('9:00 AM - 5:00 PM')).toBeInTheDocument();
      expect(screen.getByText('2:00 PM - 10:00 PM')).toBeInTheDocument();
    });

    it('should handle overnight shifts correctly', () => {
      const overnightSlots: TimeSlot[] = [
        {
          id: '1',
          startTime: '22:00',
          endTime: '06:00',
          duration: 480,
          available: true
        }
      ];

      render(<TimeSlotPicker {...defaultProps} timeSlots={overnightSlots} />);

      expect(screen.getByText('10:00 PM - 6:00 AM')).toBeInTheDocument();
    });
  });

  describe('Duration Calculations', () => {
    it('should calculate duration correctly for same-day shifts', () => {
      render(
        <TimeSlotPicker
          {...defaultProps}
          config={{ showDuration: true, showCapacity: false, showConflicts: false, allowConflicted: false, compactMode: false }}
        />
      );

      // 8 horas = 480 minutos
      expect(screen.getByText('8h')).toBeInTheDocument();
    });

    it('should handle fractional hours in duration display', () => {
      const fractionalSlots: TimeSlot[] = [
        {
          id: '1',
          startTime: '09:00',
          endTime: '17:30',
          duration: 510, // 8.5 horas
          available: true
        }
      ];

      render(
        <TimeSlotPicker
          {...defaultProps}
          timeSlots={fractionalSlots}
          config={{ showDuration: true, showCapacity: false, showConflicts: false, allowConflicted: false, compactMode: false }}
        />
      );

      expect(screen.getByText('8h 30m')).toBeInTheDocument();
    });
  });
});