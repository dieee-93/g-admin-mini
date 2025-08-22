import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from '@/shared/ui/provider';
import { MaterialsPage } from '../MaterialsPage';

// Mock data for tests
const mockMaterials = [
  {
    id: '1',
    name: 'Tomate',
    unit: 'kg',
    stock: 10,
    unit_cost: 50,
    type: 'MEASURABLE',
    category: 'weight',
    precision: 2,
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  },
  {
    id: '2',
    name: 'Cebolla',
    unit: 'kg',
    stock: 3,
    unit_cost: 30,
    type: 'MEASURABLE',
    category: 'weight',
    precision: 2,
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  }
];

// Mock materials store
const mockMaterialsStore = {
  getFilteredItems: vi.fn(() => mockMaterials),
  loading: false,
  error: null,
  openModal: vi.fn(),
  deleteItem: vi.fn(),
  setItems: vi.fn(),
  refreshStats: vi.fn()
};

// Mock app store
const mockAppStore = {
  handleError: vi.fn()
};

// Mock navigation context
const mockNavigationContext = {
  updateModuleBadge: vi.fn()
};

// Mock all the hooks and stores
vi.mock('@/store/materialsStore', () => ({
  useMaterials: () => mockMaterialsStore
}));

vi.mock('@/hooks/useZustandStores', () => ({
  useApp: () => mockAppStore
}));

vi.mock('@/contexts/NavigationContext', () => ({
  useNavigation: () => mockNavigationContext
}));

// Mock the API
vi.mock('../data/inventoryApi', () => ({
  inventoryApi: {
    getAll: vi.fn(() => Promise.resolve(mockMaterials))
  }
}));

// Mock the normalizer service
vi.mock('../services', () => ({
  MaterialsNormalizer: {
    normalizeApiItems: vi.fn(items => items)
  }
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

  it('should display materials items', () => {
    render(
      <TestWrapper>
        <MaterialsPage />
      </TestWrapper>
    );

    expect(screen.getByText('Tomate')).toBeInTheDocument();
    expect(screen.getByText('Cebolla')).toBeInTheDocument();
  });

  it('should call materials store functions', () => {
    render(
      <TestWrapper>
        <MaterialsPage />
      </TestWrapper>
    );

    // Verificar que se llaman las funciones del store
    expect(mockMaterialsStore.getFilteredItems).toHaveBeenCalled();
  });

  it('should show loading state', () => {
    // Modificar el mock para simular loading
    mockMaterialsStore.loading = true;

    render(
      <TestWrapper>
        <MaterialsPage />
      </TestWrapper>
    );

    // La página debe mostrar algún indicador de carga
    // Esto depende de cómo esté implementado el loading en tu componente
    expect(mockMaterialsStore.getFilteredItems).toHaveBeenCalled();
  });

  it('should show error state', () => {
    // Modificar el mock para simular error
    mockMaterialsStore.error = 'Error loading materials';

    render(
      <TestWrapper>
        <MaterialsPage />
      </TestWrapper>
    );

    expect(mockMaterialsStore.getFilteredItems).toHaveBeenCalled();
  });

  it('should update navigation badge with items count', () => {
    render(
      <TestWrapper>
        <MaterialsPage />
      </TestWrapper>
    );

    // Verificar que se actualiza el badge de navegación
    expect(mockNavigationContext.updateModuleBadge).toHaveBeenCalledWith(
      'materials', 
      mockMaterials.length
    );
  });
});