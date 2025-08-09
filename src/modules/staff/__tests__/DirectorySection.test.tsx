// Directory Section Component Tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from '@/shared/ui/provider';
import { DirectorySection } from '../components/sections/DirectorySection';
import type { StaffViewState } from '../types';

// Mock window.open for phone and email links
Object.defineProperty(window, 'open', {
  writable: true,
  value: vi.fn()
});

const mockViewState: StaffViewState = {
  activeTab: 'directory',
  filters: {},
  sortBy: { field: 'name', direction: 'asc' },
  viewMode: 'grid'
};

const mockOnViewStateChange = vi.fn();

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>
    {children}
  </Provider>
);

describe('DirectorySection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input and view controls', () => {
    render(
      <TestWrapper>
        <DirectorySection 
          viewState={mockViewState} 
          onViewStateChange={mockOnViewStateChange} 
        />
      </TestWrapper>
    );

    // Check search input
    expect(screen.getByPlaceholderText('Buscar empleados...')).toBeInTheDocument();
    
    // Check view toggle buttons
    expect(screen.getByLabelText('Grid view')).toBeInTheDocument();
    expect(screen.getByLabelText('List view')).toBeInTheDocument();
    
    // Check filter toggle
    expect(screen.getByLabelText('Toggle filters')).toBeInTheDocument();
  });

  it('should render employee cards in grid view', () => {
    render(
      <TestWrapper>
        <DirectorySection 
          viewState={mockViewState} 
          onViewStateChange={mockOnViewStateChange} 
        />
      </TestWrapper>
    );

    // Check that employee cards are rendered
    expect(screen.getByText('Ana García')).toBeInTheDocument();
    expect(screen.getByText('Carlos Rodriguez')).toBeInTheDocument();
    expect(screen.getByText('María López')).toBeInTheDocument();
    expect(screen.getByText('Diego Martín')).toBeInTheDocument();
    
    // Check employee positions
    expect(screen.getByText('Gerente General')).toBeInTheDocument();
    expect(screen.getByText('Chef Principal')).toBeInTheDocument();
    expect(screen.getByText('Mesera Senior')).toBeInTheDocument();
    expect(screen.getByText('Cocinero')).toBeInTheDocument();
  });

  it('should switch between grid and list views', () => {
    render(
      <TestWrapper>
        <DirectorySection 
          viewState={mockViewState} 
          onViewStateChange={mockOnViewStateChange} 
        />
      </TestWrapper>
    );

    // Click list view button
    const listViewButton = screen.getByLabelText('List view');
    fireEvent.click(listViewButton);

    expect(mockOnViewStateChange).toHaveBeenCalledWith({
      ...mockViewState,
      viewMode: 'list'
    });
  });

  it('should toggle filters panel', () => {
    render(
      <TestWrapper>
        <DirectorySection 
          viewState={mockViewState} 
          onViewStateChange={mockOnViewStateChange} 
        />
      </TestWrapper>
    );

    // Initially filters should not be visible
    expect(screen.queryByText('Departamento')).not.toBeInTheDocument();

    // Click filter toggle
    const filterToggle = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterToggle);

    // Filters should now be visible
    expect(screen.getByText('Departamento')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Rol')).toBeInTheDocument();
  });

  it('should handle search input', () => {
    render(
      <TestWrapper>
        <DirectorySection 
          viewState={mockViewState} 
          onViewStateChange={mockOnViewStateChange} 
        />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText('Buscar empleados...');
    
    fireEvent.change(searchInput, { target: { value: 'Ana' } });

    // Should still show Ana García but not other employees
    expect(screen.getByText('Ana García')).toBeInTheDocument();
    expect(screen.queryByText('Carlos Rodriguez')).not.toBeInTheDocument();
  });

  it('should handle department filter', () => {
    render(
      <TestWrapper>
        <DirectorySection 
          viewState={mockViewState} 
          onViewStateChange={mockOnViewStateChange} 
        />
      </TestWrapper>
    );

    // Open filters
    const filterToggle = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterToggle);

    // Select department filter
    const departmentSelect = screen.getByDisplayValue('Todos');
    fireEvent.change(departmentSelect, { target: { value: 'Cocina' } });

    expect(mockOnViewStateChange).toHaveBeenCalledWith({
      ...mockViewState,
      filters: { department: 'Cocina' }
    });
  });

  it('should handle employment status filter', () => {
    render(
      <TestWrapper>
        <DirectorySection 
          viewState={mockViewState} 
          onViewStateChange={mockOnViewStateChange} 
        />
      </TestWrapper>
    );

    // Open filters
    const filterToggle = screen.getByLabelText('Toggle filters');
    fireEvent.click(filterToggle);

    // Get the status select (there are multiple "Todos" selects)
    const selects = screen.getAllByDisplayValue('Todos');
    const statusSelect = selects[1]; // Second select is status
    
    fireEvent.change(statusSelect, { target: { value: 'active' } });

    expect(mockOnViewStateChange).toHaveBeenCalledWith({
      ...mockViewState,
      filters: { employment_status: 'active' }
    });
  });

  it('should display employee badges correctly', () => {
    render(
      <TestWrapper>
        <DirectorySection 
          viewState={mockViewState} 
          onViewStateChange={mockOnViewStateChange} 
        />
      </TestWrapper>
    );

    // Check for status badges
    const activeBadges = screen.getAllByText('active');
    expect(activeBadges.length).toBeGreaterThan(0);

    // Check for role badges
    expect(screen.getByText('manager')).toBeInTheDocument();
    expect(screen.getByText('supervisor')).toBeInTheDocument();
    expect(screen.getAllByText('employee')).toHaveLength(2);

    // Check for department badges
    expect(screen.getByText('Administración')).toBeInTheDocument();
    expect(screen.getByText('Cocina')).toBeInTheDocument();
    expect(screen.getByText('Servicio')).toBeInTheDocument();
  });

  it('should display performance scores as badges', () => {
    render(
      <TestWrapper>
        <DirectorySection 
          viewState={mockViewState} 
          onViewStateChange={mockOnViewStateChange} 
        />
      </TestWrapper>
    );

    // Check for performance score badges
    expect(screen.getByText('95%')).toBeInTheDocument();
    expect(screen.getByText('88%')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('78%')).toBeInTheDocument();
  });

  it('should handle phone and email actions', () => {
    render(
      <TestWrapper>
        <DirectorySection 
          viewState={mockViewState} 
          onViewStateChange={mockOnViewStateChange} 
        />
      </TestWrapper>
    );

    // Find and click phone button
    const phoneButtons = screen.getAllByLabelText('Call employee');
    fireEvent.click(phoneButtons[0]);

    expect(window.open).toHaveBeenCalledWith('tel:+1234567890');

    // Find and click email button
    const emailButtons = screen.getAllByLabelText('Email employee');
    fireEvent.click(emailButtons[0]);

    expect(window.open).toHaveBeenCalledWith('mailto:ana.garcia@restaurant.com');
  });

  it('should handle view employee action', () => {
    render(
      <TestWrapper>
        <DirectorySection 
          viewState={mockViewState} 
          onViewStateChange={mockOnViewStateChange} 
        />
      </TestWrapper>
    );

    // Find and click view button
    const viewButtons = screen.getAllByLabelText('View employee');
    fireEvent.click(viewButtons[0]);

    // Should call onViewStateChange with selected employee
    expect(mockOnViewStateChange).toHaveBeenCalled();
    const lastCall = mockOnViewStateChange.mock.calls[mockOnViewStateChange.mock.calls.length - 1];
    expect(lastCall[0].selectedEmployee).toBeDefined();
    expect(lastCall[0].selectedEmployee.first_name).toBe('Ana');
  });

  it('should show results count', () => {
    render(
      <TestWrapper>
        <DirectorySection 
          viewState={mockViewState} 
          onViewStateChange={mockOnViewStateChange} 
        />
      </TestWrapper>
    );

    // Check results summary
    expect(screen.getByText('Mostrando 4 de 4 empleados')).toBeInTheDocument();
    expect(screen.getByText('Actualizado hace 2 minutos')).toBeInTheDocument();
  });

  it('should show empty state when no employees match filters', () => {
    render(
      <TestWrapper>
        <DirectorySection 
          viewState={{
            ...mockViewState,
            filters: { search: 'NonExistentEmployee' }
          }} 
          onViewStateChange={mockOnViewStateChange} 
        />
      </TestWrapper>
    );

    expect(screen.getByText('No se encontraron empleados')).toBeInTheDocument();
    expect(screen.getByText('Intenta ajustar los filtros o términos de búsqueda')).toBeInTheDocument();
    
    // Should show clear filters button
    const clearButton = screen.getByText('Limpiar Filtros');
    expect(clearButton).toBeInTheDocument();
  });

  it('should handle clear filters action', () => {
    render(
      <TestWrapper>
        <DirectorySection 
          viewState={{
            ...mockViewState,
            filters: { search: 'NonExistentEmployee' }
          }} 
          onViewStateChange={mockOnViewStateChange} 
        />
      </TestWrapper>
    );

    const clearButton = screen.getByText('Limpiar Filtros');
    fireEvent.click(clearButton);

    expect(mockOnViewStateChange).toHaveBeenCalledWith({
      ...mockViewState,
      filters: {}
    });
  });

  it('should render in list view when viewMode is list', () => {
    render(
      <TestWrapper>
        <DirectorySection 
          viewState={{ ...mockViewState, viewMode: 'list' }} 
          onViewStateChange={mockOnViewStateChange} 
        />
      </TestWrapper>
    );

    // In list view, employees should still be visible but with different layout
    expect(screen.getByText('Ana García')).toBeInTheDocument();
    expect(screen.getByText('(EMP001)')).toBeInTheDocument();
  });

  it('should show last seen information', () => {
    render(
      <TestWrapper>
        <DirectorySection 
          viewState={mockViewState} 
          onViewStateChange={mockOnViewStateChange} 
        />
      </TestWrapper>
    );

    // Check for "Hace X horas" or similar last seen text
    const lastSeenElements = screen.getAllByText(/Hace/);
    expect(lastSeenElements.length).toBeGreaterThan(0);
  });
});