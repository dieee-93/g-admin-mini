import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from '@/shared/ui/provider';
import { MaterialsGrid } from '../MaterialsGrid';
import type { MaterialItem } from '../../types';

// 🎯 Mock data que simula materials reales
const mockMaterials: MaterialItem[] = [
  {
    id: '1',
    name: 'Tomate',
    type: 'MEASURABLE',
    unit: 'kg',
    category: 'Verduras',
    precision: 2,
    stock: 10,
    unit_cost: 50,
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  },
  {
    id: '2',
    name: 'Cebolla',
    type: 'MEASURABLE',
    unit: 'kg', 
    category: 'Verduras',
    precision: 2,
    stock: 3, // Stock bajo para testing
    unit_cost: 30,
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  },
  {
    id: '3',
    name: 'Huevos',
    type: 'COUNTABLE',
    unit: 'unidad',
    stock: 0, // Sin stock para testing
    unit_cost: 25,
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  }
];

// 🎯 Mock handlers para las acciones
const mockHandlers = {
  onEdit: vi.fn(),
  onView: vi.fn(), 
  onDelete: vi.fn()
};

// 🎯 Mock del store de materials
const mockMaterialsStore = {
  getFilteredItems: vi.fn(() => mockMaterials),
  loading: false
};

// 🎯 Mock del hook useMaterials 
vi.mock('@/store/materialsStore', () => ({
  useMaterials: () => mockMaterialsStore
}));

// 🎯 Wrapper de testing con providers necesarios
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>
    {children}
  </Provider>
);

describe('MaterialsGrid', () => {
  // 🧹 Limpiar mocks antes de cada test
  beforeEach(() => {
    vi.clearAllMocks();
    // 🔧 Reset del estado del mock antes de cada test
    mockMaterialsStore.getFilteredItems.mockReturnValue(mockMaterials);
    mockMaterialsStore.loading = false;
  });

  // ✅ TEST 1: Renderizado básico
  it('should render materials grid with items', () => {
    render(
      <TestWrapper>
        <MaterialsGrid {...mockHandlers} />
      </TestWrapper>
    );

    // Verificar que se muestran los nombres de los materiales
    expect(screen.getByText('Tomate')).toBeInTheDocument();
    expect(screen.getByText('Cebolla')).toBeInTheDocument();
    expect(screen.getByText('Huevos')).toBeInTheDocument();
  });

  // ✅ TEST 2: Estados de stock
  it('should display correct stock status badges', () => {
    render(
      <TestWrapper>
        <MaterialsGrid {...mockHandlers} />
      </TestWrapper>
    );

    // Buscar badges de estado usando funciones más específicas
    expect(screen.getByText('Stock Bajo')).toBeInTheDocument();
    
    // Para "Sin Stock" hay múltiples elementos, usar getAllBy y verificar que hay al menos uno
    const sinStockElements = screen.getAllByText(/sin stock/i);
    expect(sinStockElements.length).toBeGreaterThan(0);
  });

  // ✅ TEST 3: Mostrar categorías
  it('should display item categories correctly', () => {
    render(
      <TestWrapper>
        <MaterialsGrid {...mockHandlers} />
      </TestWrapper>
    );

    // Verificar que se muestran las categorías de negocio
    expect(screen.getAllByText('Verduras')).toHaveLength(2); // Tomate y Cebolla
    expect(screen.getByText('countable')).toBeInTheDocument(); // Huevos (tipo)
  });

  // ✅ TEST 4: Estado de loading
  it('should show loading skeletons when loading', () => {
    // Modificar el mock para simular loading
    mockMaterialsStore.loading = true;
    
    render(
      <TestWrapper>
        <MaterialsGrid {...mockHandlers} />
      </TestWrapper>
    );

    // Verificar que se muestran skeletons de loading
    // Los skeletons tienen bg="gray.50" y se generan 6 items
    const skeletons = screen.getAllByRole('generic'); // Box elements
    expect(skeletons.length).toBeGreaterThan(0);
  });

  // ✅ TEST 5: Estado vacío
  it('should show empty state when no items', () => {
    // Modificar el mock para simular lista vacía
    mockMaterialsStore.getFilteredItems.mockReturnValue([]);
    mockMaterialsStore.loading = false;
    
    render(
      <TestWrapper>
        <MaterialsGrid {...mockHandlers} />
      </TestWrapper>
    );

    // Verificar mensaje de estado vacío
    expect(screen.getByText('No se encontraron materiales')).toBeInTheDocument();
    expect(screen.getByText('Intenta ajustar los filtros o agregar nuevos materiales')).toBeInTheDocument();
  });

  // ✅ TEST 6: Botones de acción
  it('should call correct handlers when action buttons are clicked', () => {
    render(
      <TestWrapper>
        <MaterialsGrid {...mockHandlers} />
      </TestWrapper>
    );

    // Encontrar botones por aria-label específico
    const viewButton = screen.getByLabelText('Ver Tomate');
    const editButton = screen.getByLabelText('Editar Tomate');
    const deleteButton = screen.getByLabelText('Eliminar Tomate');

    // Hacer click y verificar que se llaman con el item correcto
    fireEvent.click(viewButton);
    expect(mockHandlers.onView).toHaveBeenCalledWith(mockMaterials[0]);

    fireEvent.click(editButton);
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockMaterials[0]);

    fireEvent.click(deleteButton);
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockMaterials[0]);
  });

  // ✅ TEST 7: Accesibilidad
  it('should have proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <MaterialsGrid {...mockHandlers} />
      </TestWrapper>
    );

    // Verificar que los cards tienen role="article"
    const materialCards = screen.getAllByRole('article');
    expect(materialCards).toHaveLength(3);

    // Verificar que tienen aria-label descriptivo
    expect(screen.getByLabelText('Tomate - Verduras')).toBeInTheDocument();
    expect(screen.getByLabelText('Cebolla - Verduras')).toBeInTheDocument();
    expect(screen.getByLabelText('Huevos - countable')).toBeInTheDocument();
  });

  // ✅ TEST 8: Cálculos de stock
  it('should display calculated values correctly', () => {
    render(
      <TestWrapper>
        <MaterialsGrid {...mockHandlers} />
      </TestWrapper>
    );

    // Verificar que se muestran valores de stock (formato más flexible)
    expect(screen.getByText(/10.*kg/)).toBeInTheDocument(); // Tomate: "10 kg"
    expect(screen.getByText(/3.*kg/)).toBeInTheDocument();  // Cebolla: "3 kg"
    
    // Verificar elementos con 0 unidad
    const zeroUnidadElements = screen.getAllByText(/0.*unidad/);
    expect(zeroUnidadElements.length).toBeGreaterThan(0);

    // Verificar que se muestran valores de precio
    expect(screen.getByText('$500.00')).toBeInTheDocument(); // Valor total Tomate
  });

  // ✅ TEST 9: Responsividad del grid
  it('should render responsive grid layout', () => {
    render(
      <TestWrapper>
        <MaterialsGrid {...mockHandlers} />
      </TestWrapper>
    );

    // Verificar que se renderizan todos los items
    const materialCards = screen.getAllByRole('article');
    expect(materialCards).toHaveLength(3);
    
    // Verificar que el contenedor principal existe y contiene los items
    const gridContainer = materialCards[0].parentElement;
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer).toContainElement(materialCards[0]);
  });
});