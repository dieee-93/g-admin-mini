import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from '@/shared/ui/provider';
import { MaterialsPage } from '../MaterialsPage';

// Mock the inventory hook
const mockInventoryHook = {
  items: [
    {
      id: '1',
      name: 'Tomate',
      unit: 'kg',
      current_stock: 10,
      min_stock: 5,
      category: 'vegetales'
    },
    {
      id: '2',
      name: 'Cebolla',
      unit: 'kg',
      current_stock: 3,
      min_stock: 5,
      category: 'vegetales'
    }
  ],
  loading: false,
  error: null,
  addItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
  refreshInventory: vi.fn()
};

vi.mock('../hooks/useInventory', () => ({
  useInventory: () => mockInventoryHook
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/materials' })
}));

// Mock icons
vi.mock('@heroicons/react/24/outline', () => ({
  PlusIcon: ({ className }: { className: string }) => <div data-testid="plus-icon" className={className} />,
  MagnifyingGlassIcon: ({ className }: { className: string }) => <div data-testid="search-icon" className={className} />,
  AdjustmentsHorizontalIcon: ({ className }: { className: string }) => <div data-testid="filter-icon" className={className} />
}));

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>
    {children}
  </Provider>
);

describe('MaterialsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the materials page', () => {
    render(
      <TestWrapper>
        <MaterialsPage />
      </TestWrapper>
    );

    expect(screen.getByText('Gestión de Materiales')).toBeInTheDocument();
    expect(screen.getByText('Controla el inventario de materias primas')).toBeInTheDocument();
  });

  it('should display inventory items', () => {
    render(
      <TestWrapper>
        <MaterialsPage />
      </TestWrapper>
    );

    expect(screen.getByText('Tomate')).toBeInTheDocument();
    expect(screen.getByText('Cebolla')).toBeInTheDocument();
    expect(screen.getByText('10 kg')).toBeInTheDocument();
    expect(screen.getByText('3 kg')).toBeInTheDocument();
  });

  it('should show low stock indicators', () => {
    render(
      <TestWrapper>
        <MaterialsPage />
      </TestWrapper>
    );

    // Cebolla should show low stock (3 < 5)
    const lowStockItems = screen.getAllByText(/stock bajo/i);
    expect(lowStockItems.length).toBeGreaterThan(0);
  });

  it('should handle search functionality', async () => {
    render(
      <TestWrapper>
        <MaterialsPage />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText(/buscar materiales/i);
    fireEvent.change(searchInput, { target: { value: 'tomate' } });

    await waitFor(() => {
      expect(screen.getByText('Tomate')).toBeInTheDocument();
      expect(screen.queryByText('Cebolla')).not.toBeInTheDocument();
    });
  });

  it('should handle category filtering', async () => {
    render(
      <TestWrapper>
        <MaterialsPage />
      </TestWrapper>
    );

    // Find and click filter button
    const filterButton = screen.getByRole('button', { name: /filtros/i });
    fireEvent.click(filterButton);

    // Select category filter
    const categorySelect = screen.getByRole('combobox');
    fireEvent.change(categorySelect, { target: { value: 'vegetales' } });

    await waitFor(() => {
      expect(screen.getByText('Tomate')).toBeInTheDocument();
      expect(screen.getByText('Cebolla')).toBeInTheDocument();
    });
  });

  it('should handle adding new item', async () => {
    render(
      <TestWrapper>
        <MaterialsPage />
      </TestWrapper>
    );

    const addButton = screen.getByRole('button', { name: /nuevo material/i });
    fireEvent.click(addButton);

    // Modal should open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/agregar nuevo material/i)).toBeInTheDocument();
  });

  it('should handle item editing', async () => {
    render(
      <TestWrapper>
        <MaterialsPage />
      </TestWrapper>
    );

    // Find edit button for first item
    const editButtons = screen.getAllByRole('button', { name: /editar/i });
    fireEvent.click(editButtons[0]);

    expect(mockInventoryHook.updateItem).toHaveBeenCalled();
  });

  it('should handle item deletion', async () => {
    render(
      <TestWrapper>
        <MaterialsPage />
      </TestWrapper>
    );

    // Find delete button for first item
    const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i });
    fireEvent.click(deleteButtons[0]);

    // Confirmation dialog should appear
    expect(screen.getByText(/confirmar eliminación/i)).toBeInTheDocument();
  });

  it('should show loading state', () => {
    vi.mocked(mockInventoryHook).loading = true;

    render(
      <TestWrapper>
        <MaterialsPage />
      </TestWrapper>
    );

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('should show error state', () => {
    vi.mocked(mockInventoryHook).error = 'Error loading inventory';

    render(
      <TestWrapper>
        <MaterialsPage />
      </TestWrapper>
    );

    expect(screen.getByText(/error loading inventory/i)).toBeInTheDocument();
  });

  it('should handle refresh action', async () => {
    render(
      <TestWrapper>
        <MaterialsPage />
      </TestWrapper>
    );

    const refreshButton = screen.getByRole('button', { name: /actualizar/i });
    fireEvent.click(refreshButton);

    expect(mockInventoryHook.refreshInventory).toHaveBeenCalled();
  });

  it('should display correct stock status badges', () => {
    render(
      <TestWrapper>
        <MaterialsPage />
      </TestWrapper>
    );

    // Check for stock status indicators
    const stockElements = screen.getAllByText(/stock/i);
    expect(stockElements.length).toBeGreaterThan(0);
  });
});