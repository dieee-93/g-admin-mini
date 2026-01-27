/**
 * RecipeConfigSection - Unit Tests
 *
 * Tests de integración del componente RecipeConfigSection
 * que envuelve RecipeBuilder para usarlo en ProductFormWizard
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from '@/shared/ui/provider';
import { RecipeConfigSection } from '../RecipeConfigSection';
import type { RecipeConfigFields } from '../../../types/productForm';
import type { Recipe } from '@/modules/recipe/types';

// ============================================
// MOCKS
// ============================================

// Mock RecipeBuilder component
vi.mock('@/modules/recipe/components/RecipeBuilder', () => ({
  RecipeBuilder: ({ mode, onSave, entityType, complexity }: any) => (
    <div data-testid="recipe-builder-mock">
      <div data-testid="recipe-builder-mode">{mode}</div>
      <div data-testid="recipe-builder-entity-type">{entityType}</div>
      <div data-testid="recipe-builder-complexity">{complexity}</div>
      <button
        data-testid="recipe-builder-save"
        onClick={() => {
          // Simular guardado de receta
          const mockRecipe: Recipe = {
            id: 'recipe-123',
            name: 'Test Recipe',
            entityType: 'product',
            executionMode: 'on_demand',
            output: {
              item: 'product-123',
              quantity: 1,
              unit: 'unit'
            },
            inputs: [],
            createdAt: new Date(),
            updatedAt: new Date()
          };
          onSave(mockRecipe);
        }}
      >
        Save Recipe
      </button>
    </div>
  )
}));

// ============================================
// TEST WRAPPER
// ============================================

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider>
    {children}
  </Provider>
);

// ============================================
// TESTS
// ============================================

describe('RecipeConfigSection', () => {
  const mockOnChange = vi.fn();

  const defaultData: RecipeConfigFields = {
    has_recipe: false,
    recipe_id: undefined
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // TEST 1: Renderizado básico (modo create)
  // ============================================
  it('should render RecipeBuilder in create mode when no recipe_id exists', () => {
    render(
      <TestWrapper>
        <RecipeConfigSection
          data={defaultData}
          onChange={mockOnChange}
          errors={[]}
          readOnly={false}
        />
      </TestWrapper>
    );

    // Verificar que RecipeBuilder está presente
    expect(screen.getByTestId('recipe-builder-mock')).toBeInTheDocument();

    // Verificar configuración correcta
    expect(screen.getByTestId('recipe-builder-mode')).toHaveTextContent('create');
    expect(screen.getByTestId('recipe-builder-entity-type')).toHaveTextContent('product');
    expect(screen.getByTestId('recipe-builder-complexity')).toHaveTextContent('standard');
  });

  // ============================================
  // TEST 2: Renderizado en modo edit
  // ============================================
  it('should render RecipeBuilder in edit mode when recipe_id exists', () => {
    const dataWithRecipe: RecipeConfigFields = {
      has_recipe: true,
      recipe_id: 'existing-recipe-123'
    };

    render(
      <TestWrapper>
        <RecipeConfigSection
          data={dataWithRecipe}
          onChange={mockOnChange}
          errors={[]}
          readOnly={false}
        />
      </TestWrapper>
    );

    // Verificar modo edit
    expect(screen.getByTestId('recipe-builder-mode')).toHaveTextContent('edit');

    // Verificar mensaje de éxito
    expect(screen.getByText(/Receta configurada correctamente/i)).toBeInTheDocument();
  });

  // ============================================
  // TEST 3: Callback onSave
  // ============================================
  it('should call onChange with recipe_id when recipe is saved', async () => {
    render(
      <TestWrapper>
        <RecipeConfigSection
          data={defaultData}
          onChange={mockOnChange}
          errors={[]}
          readOnly={false}
        />
      </TestWrapper>
    );

    // Simular guardar receta
    const saveButton = screen.getByTestId('recipe-builder-save');
    saveButton.click();

    // Verificar que onChange fue llamado con el recipe_id
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith({
        has_recipe: true,
        recipe_id: 'recipe-123'
      });
    });
  });

  // ============================================
  // TEST 4: Mostrar errores de validación
  // ============================================
  it('should display validation errors when provided', () => {
    const errors = [
      {
        field: 'recipe_config.recipe_id',
        message: 'La receta es requerida para este tipo de producto',
        section: 'recipe_config'
      }
    ];

    render(
      <TestWrapper>
        <RecipeConfigSection
          data={defaultData}
          onChange={mockOnChange}
          errors={errors}
          readOnly={false}
        />
      </TestWrapper>
    );

    // Verificar que el error se muestra
    expect(screen.getByText(/La receta es requerida/i)).toBeInTheDocument();
  });

  // ============================================
  // TEST 5: Modo readonly
  // ============================================
  it('should render in readonly mode when readOnly prop is true', () => {
    render(
      <TestWrapper>
        <RecipeConfigSection
          data={defaultData}
          onChange={mockOnChange}
          errors={[]}
          readOnly={true}
        />
      </TestWrapper>
    );

    // RecipeBuilder debe estar presente (el readonly se maneja internamente)
    expect(screen.getByTestId('recipe-builder-mock')).toBeInTheDocument();
  });

  // ============================================
  // TEST 6: Descripción de la sección
  // ============================================
  it('should display section description', () => {
    render(
      <TestWrapper>
        <RecipeConfigSection
          data={defaultData}
          onChange={mockOnChange}
          errors={[]}
          readOnly={false}
        />
      </TestWrapper>
    );

    // Verificar descripción
    expect(
      screen.getByText(/Define los materiales o productos que componen este producto/i)
    ).toBeInTheDocument();
  });

  // ============================================
  // TEST 7: Features configuradas correctamente
  // ============================================
  it('should configure RecipeBuilder with correct features for products', () => {
    render(
      <TestWrapper>
        <RecipeConfigSection
          data={defaultData}
          onChange={mockOnChange}
          errors={[]}
          readOnly={false}
        />
      </TestWrapper>
    );

    // Verificar que RecipeBuilder usa complexity="standard"
    // (que incluye: showCostCalculation, showInstructions, showYieldConfig)
    expect(screen.getByTestId('recipe-builder-complexity')).toHaveTextContent('standard');
  });
});
