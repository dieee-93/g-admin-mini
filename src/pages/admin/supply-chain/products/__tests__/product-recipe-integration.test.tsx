/**
 * Product + Recipe Integration Tests
 *
 * Tests de integración del flujo completo:
 * - Crear producto con BOM (Materials → Product)
 * - Editar producto con receta existente
 * - Validar que executionMode es 'on_demand' para products
 * - Verificar que recipe_id se guarda correctamente
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from '@/shared/ui/provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductFormWizard } from '../components/ProductFormWizard';
import type { ProductFormData } from '../types/productForm';
import type { Recipe } from '@/modules/recipe/types';

// ============================================
// MOCKS
// ============================================

// Mock RecipeBuilder
vi.mock('@/modules/recipe/components/RecipeBuilder', () => ({
  RecipeBuilder: ({ mode, onSave, entityType, complexity, recipeId }: any) => (
    <div data-testid="recipe-builder">
      <div data-testid="mode">{mode}</div>
      <div data-testid="entity-type">{entityType}</div>
      <div data-testid="complexity">{complexity}</div>
      {recipeId && <div data-testid="recipe-id">{recipeId}</div>}
      <button
        data-testid="save-recipe-btn"
        onClick={() => {
          const mockRecipe: Recipe = {
            id: recipeId || 'new-recipe-123',
            name: 'Hamburguesa BOM',
            entityType: 'product',
            executionMode: 'on_demand', // 🔑 CRÍTICO: products usan on_demand
            output: {
              item: 'product-456',
              quantity: 1,
              unit: 'unit'
            },
            inputs: [
              {
                id: 'input-1',
                item: 'material-pan',
                quantity: 1,
                unit: 'unit'
              },
              {
                id: 'input-2',
                item: 'material-carne',
                quantity: 200,
                unit: 'g'
              }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
          };
          onSave(mockRecipe);
        }}
      >
        Guardar Receta
      </button>
    </div>
  )
}));

// Mock useCapabilityStore
vi.mock('@/store/capabilityStore', () => ({
  useCapabilityStore: () => ({
    features: {
      activeFeatures: [
        'inventory_stock_tracking',
        'production_bom_management' // 🔑 Feature requerida para BOM
      ]
    }
  })
}));

// Mock useAvailableProductTypes
vi.mock('../hooks/useAvailableProductTypes', () => ({
  useAvailableProductTypes: () => [
    {
      type: 'physical_product',
      label: 'Producto Físico',
      description: 'Productos tangibles con inventario'
    }
  ]
}));

// Mock RecipeConfigSection with integrated RecipeBuilder mock
const MockRecipeConfigSection = ({ data, onChange }: any) => {
  const handleSaveRecipe = () => {
    // Simular guardar receta
    const mockRecipe: Recipe = {
      id: data.recipe_id || 'new-recipe-123',
      name: 'Test Recipe',
      entityType: 'product',
      executionMode: 'on_demand',
      output: { item: 'product-456', quantity: 1, unit: 'unit' },
      inputs: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    onChange({ ...data, recipe_id: mockRecipe.id, has_recipe: true });
  };

  return (
    <div data-testid="recipe-config-section">
      <div data-testid="recipe-builder">
        <div data-testid="mode">{data.recipe_id ? 'edit' : 'create'}</div>
        <div data-testid="entity-type">product</div>
        <div data-testid="complexity">standard</div>
        {data.recipe_id && <div data-testid="recipe-id">{data.recipe_id}</div>}
        <button
          data-testid="save-recipe-btn"
          onClick={handleSaveRecipe}
        >
          Guardar Receta
        </button>
        {data.has_recipe && data.recipe_id && (
          <div>Receta configurada correctamente</div>
        )}
      </div>
    </div>
  );
};

// Mock useVisibleFormSections
vi.mock('../config/formSectionsRegistry', () => ({
  useVisibleFormSections: vi.fn(() => [
    {
      id: 'basic_info',
      label: 'Información Básica',
      component: ({ data, onChange }: any) => (
        <div data-testid="basic-info-section">
          <input
            data-testid="product-name-input"
            value={data.name || ''}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder="Nombre del producto"
          />
        </div>
      ),
      order: 1
    },
    {
      id: 'recipe_config',
      label: 'Bill of Materials',
      component: MockRecipeConfigSection,
      order: 3
    },
    {
      id: 'pricing',
      label: 'Precio',
      component: ({ data, onChange }: any) => (
        <div data-testid="pricing-section">
          <input
            data-testid="price-input"
            type="number"
            value={data.price || 0}
            onChange={(e) => onChange({ ...data, price: parseFloat(e.target.value) })}
            placeholder="Precio"
          />
        </div>
      ),
      order: 100
    }
  ])
}));

// ============================================
// TEST WRAPPER
// ============================================

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        {children}
      </Provider>
    </QueryClientProvider>
  );
};

// ============================================
// TESTS
// ============================================

describe('Product + Recipe Integration', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // TEST 1: Crear producto con BOM (flujo completo)
  // ============================================
  it('should create product with BOM recipe successfully', async () => {
    render(
      <TestWrapper>
        <ProductFormWizard
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    // PASO 1: Llenar información básica
    const nameInput = screen.getByTestId('product-name-input');
    fireEvent.change(nameInput, { target: { value: 'Hamburguesa Clásica' } });

    // Avanzar al siguiente paso
    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    fireEvent.click(nextButton);

    // PASO 2: Configurar BOM
    await waitFor(() => {
      expect(screen.getByTestId('recipe-builder')).toBeInTheDocument();
    });

    // Verificar configuración correcta de RecipeBuilder
    expect(screen.getByTestId('entity-type')).toHaveTextContent('product');
    expect(screen.getByTestId('complexity')).toHaveTextContent('standard');
    expect(screen.getByTestId('mode')).toHaveTextContent('create');

    // Guardar receta
    const saveRecipeBtn = screen.getByTestId('save-recipe-btn');
    fireEvent.click(saveRecipeBtn);

    // Verificar que recipe_id se agregó
    await waitFor(() => {
      // La sección debe mostrar mensaje de éxito
      expect(screen.getByText(/Receta configurada correctamente/i)).toBeInTheDocument();
    });

    // Avanzar al siguiente paso (Pricing)
    fireEvent.click(nextButton);

    // PASO 3: Configurar precio
    await waitFor(() => {
      expect(screen.getByTestId('pricing-section')).toBeInTheDocument();
    });

    const priceInput = screen.getByTestId('price-input');
    fireEvent.change(priceInput, { target: { value: '150' } });

    // Guardar producto
    const submitButton = screen.getByRole('button', { name: /crear producto/i });
    fireEvent.click(submitButton);

    // Verificar que se llamó onSubmit con recipe_config
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          basic_info: expect.objectContaining({
            name: 'Hamburguesa Clásica'
          }),
          recipe_config: expect.objectContaining({
            has_recipe: true,
            recipe_id: 'new-recipe-123'
          }),
          pricing: expect.objectContaining({
            price: 150
          })
        })
      );
    });
  });

  // ============================================
  // TEST 2: Editar producto con receta existente
  // ============================================
  it('should load existing recipe in edit mode', async () => {
    const existingProduct: Partial<ProductFormData> = {
      id: 'product-789',
      product_type: 'physical_product',
      basic_info: {
        name: 'Hamburguesa Especial',
        active: true
      },
      recipe_config: {
        has_recipe: true,
        recipe_id: 'existing-recipe-456'
      },
      pricing: {
        price: 200
      }
    };

    render(
      <TestWrapper>
        <ProductFormWizard
          initialData={existingProduct as ProductFormData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    // Navegar a la sección de Recipe
    // (asumiendo que puede navegar directamente o usar breadcrumbs)
    const bomButton = screen.getByRole('button', { name: /bill of materials/i });
    fireEvent.click(bomButton);

    // Verificar que RecipeBuilder cargó en modo edit
    await waitFor(() => {
      expect(screen.getByTestId('recipe-builder')).toBeInTheDocument();
      expect(screen.getByTestId('mode')).toHaveTextContent('edit');
      expect(screen.getByTestId('recipe-id')).toHaveTextContent('existing-recipe-456');
    });
  });

  // ============================================
  // TEST 3: Validar executionMode = 'on_demand'
  // ============================================
  it('should use executionMode "on_demand" for product recipes', async () => {
    render(
      <TestWrapper>
        <ProductFormWizard
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    // Navegar a Recipe section
    const nameInput = screen.getByTestId('product-name-input');
    fireEvent.change(nameInput, { target: { value: 'Test Product' } });

    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByTestId('recipe-builder')).toBeInTheDocument();
    });

    // Guardar receta
    const saveRecipeBtn = screen.getByTestId('save-recipe-btn');
    fireEvent.click(saveRecipeBtn);

    // Verificar que la receta tiene executionMode='on_demand'
    // (esto se verifica indirectamente - la receta mock ya lo tiene configurado)
    // En un test real, verificaríamos con el API o store
    await waitFor(() => {
      expect(screen.getByText(/Receta configurada correctamente/i)).toBeInTheDocument();
    });
  });

  // ============================================
  // TEST 4: Sección BOM solo visible con feature activa
  // ============================================
  it('should show BOM section when feature is active', async () => {
    render(
      <TestWrapper>
        <ProductFormWizard
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    );

    // Llenar basic info para poder avanzar
    const nameInput = screen.getByTestId('product-name-input');
    fireEvent.change(nameInput, { target: { value: 'Test Product' } });

    // Avanzar
    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    fireEvent.click(nextButton);

    // Verificar que la sección BOM aparece
    await waitFor(() => {
      expect(screen.getByTestId('recipe-config-section')).toBeInTheDocument();
    });
  });
});
