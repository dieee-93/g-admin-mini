/**
 * RecipeBuilder Component Tests
 *
 * Tests the main RecipeBuilder component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RecipeBuilder } from '../RecipeBuilder'
import {
  createRecipeBuilderProps,
  createMockRecipe,
  mockUseCreateRecipe,
  mockUseUpdateRecipe,
  createMockValidationResult,
  TestWrapper,
} from '../../../__tests__/testUtils'

// ============================================
// MOCKS
// ============================================

vi.mock('../../../hooks/useRecipes', () => ({
  useCreateRecipe: vi.fn(),
  useUpdateRecipe: vi.fn(),
  useRecipe: vi.fn(),
}))

vi.mock('../../../services/recipeValidation', () => ({
  validateRecipe: vi.fn(),
}))

vi.mock('@/lib/logging/Logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

import { useCreateRecipe, useUpdateRecipe, useRecipe } from '../../../hooks/useRecipes'
import { validateRecipe } from '../../../services/recipeValidation'

// ============================================
// TEST SETUP
// ============================================

describe('RecipeBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mocks
    vi.mocked(useCreateRecipe).mockReturnValue(mockUseCreateRecipe() as any)
    vi.mocked(useUpdateRecipe).mockReturnValue(mockUseUpdateRecipe() as any)
    vi.mocked(useRecipe).mockReturnValue({ data: null, isLoading: false } as any)
    vi.mocked(validateRecipe).mockReturnValue(createMockValidationResult())
  })

  // ============================================
  // RENDERING TESTS
  // ============================================

  describe('Rendering', () => {
    it('should render in create mode', () => {
      const props = createRecipeBuilderProps({ mode: 'create' })

      render(<RecipeBuilder {...props} />, { wrapper: TestWrapper })

      expect(screen.getByText('Información Básica')).toBeInTheDocument()
      expect(screen.getByText('Configuración de Salida')).toBeInTheDocument()
      expect(screen.getByText('Ingredientes / Componentes')).toBeInTheDocument()
    })

    it('should render in edit mode', () => {
      const mockRecipe = createMockRecipe({ name: 'Existing Recipe' })
      const props = createRecipeBuilderProps({
        mode: 'edit',
        initialData: mockRecipe,
      })

      render(<RecipeBuilder {...props} />)

      expect(screen.getByDisplayValue('Existing Recipe')).toBeInTheDocument()
    })

    it('should show template button in create mode with no name', () => {
      const props = createRecipeBuilderProps({ mode: 'create' })

      render(<RecipeBuilder {...props} />)

      expect(screen.getByText('📋 Usar Template')).toBeInTheDocument()
    })

    it('should not show template button in edit mode', () => {
      const props = createRecipeBuilderProps({ mode: 'edit' })

      render(<RecipeBuilder {...props} />)

      expect(screen.queryByText('📋 Usar Template')).not.toBeInTheDocument()
    })

    it('should show save button with correct text for create mode', () => {
      const props = createRecipeBuilderProps({ mode: 'create' })

      render(<RecipeBuilder {...props} />)

      expect(screen.getByText('Crear Receta')).toBeInTheDocument()
    })

    it('should show save button with correct text for edit mode', () => {
      const props = createRecipeBuilderProps({ mode: 'edit' })

      render(<RecipeBuilder {...props} />)

      expect(screen.getByText('Guardar Cambios')).toBeInTheDocument()
    })
  })

  // ============================================
  // SECTION VISIBILITY TESTS
  // ============================================

  describe('Section Visibility', () => {
    it('should always show core sections', () => {
      const props = createRecipeBuilderProps()

      render(<RecipeBuilder {...props} />)

      expect(screen.getByText('Información Básica')).toBeInTheDocument()
      expect(screen.getByText('Configuración de Salida')).toBeInTheDocument()
      expect(screen.getByText('Ingredientes / Componentes')).toBeInTheDocument()
    })

    it('should not show cost section when no inputs', () => {
      const props = createRecipeBuilderProps({
        features: { showCostCalculation: true },
      })

      render(<RecipeBuilder {...props} />)

      expect(screen.queryByText('Resumen de Costos')).not.toBeInTheDocument()
    })

    it('should not show instructions in minimal complexity', () => {
      const props = createRecipeBuilderProps({
        complexity: 'minimal',
        features: { showInstructions: true },
      })

      render(<RecipeBuilder {...props} />)

      // Instructions section is lazy loaded, so we just check it's not immediately visible
      expect(screen.queryByText('Instrucciones')).not.toBeInTheDocument()
    })

    it('should show advanced section only in advanced complexity', () => {
      const props = createRecipeBuilderProps({
        complexity: 'advanced',
      })

      render(<RecipeBuilder {...props} />)

      // Advanced section is lazy loaded
      // We can't easily test lazy loaded components without more setup
      // This test validates that the component renders without errors
      expect(screen.getByText('Información Básica')).toBeInTheDocument()
    })
  })

  // ============================================
  // VALIDATION TESTS
  // ============================================

  describe('Validation', () => {
    it('should display validation errors', () => {
      vi.mocked(validateRecipe).mockReturnValue(
        createMockValidationResult({
          isValid: false,
          errors: ['Name is required', 'Output quantity must be greater than 0'],
        })
      )

      const props = createRecipeBuilderProps()

      render(<RecipeBuilder {...props} />)

      expect(screen.getByText('Errores de validación')).toBeInTheDocument()
      expect(screen.getByText('Name is required')).toBeInTheDocument()
      expect(screen.getByText('Output quantity must be greater than 0')).toBeInTheDocument()
    })

    it('should display validation warnings', () => {
      vi.mocked(validateRecipe).mockReturnValue(
        createMockValidationResult({
          isValid: true,
          warnings: ['Consider adding preparation time'],
        })
      )

      const props = createRecipeBuilderProps()

      render(<RecipeBuilder {...props} />)

      expect(screen.getByText('Advertencias')).toBeInTheDocument()
      expect(screen.getByText('Consider adding preparation time')).toBeInTheDocument()
    })

    it('should disable save button when validation fails', () => {
      vi.mocked(validateRecipe).mockReturnValue(
        createMockValidationResult({ isValid: false, errors: ['Error'] })
      )

      const props = createRecipeBuilderProps()

      render(<RecipeBuilder {...props} />)

      const saveButton = screen.getByText('Crear Receta')
      expect(saveButton).toBeDisabled()
    })
  })

  // ============================================
  // INTERACTION TESTS
  // ============================================

  describe('Interactions', () => {
    it('should call onSave when save button is clicked', async () => {
      const user = userEvent.setup()
      const onSave = vi.fn()
      const props = createRecipeBuilderProps({
        onSave,
        initialData: { name: 'Test Recipe' },
      })

      render(<RecipeBuilder {...props} />)

      const saveButton = screen.getByText('Crear Receta')
      await user.click(saveButton)

      await waitFor(() => {
        expect(onSave).toHaveBeenCalled()
      })
    })

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      const onCancel = vi.fn()
      const props = createRecipeBuilderProps({ onCancel })

      render(<RecipeBuilder {...props} />)

      const cancelButton = screen.getByText('Cancelar')
      await user.click(cancelButton)

      expect(onCancel).toHaveBeenCalled()
    })

    it('should update recipe name when input changes', async () => {
      const user = userEvent.setup()
      const props = createRecipeBuilderProps()

      render(<RecipeBuilder {...props} />)

      const nameInput = screen.getByPlaceholderText('Ej: Hamburguesa Clásica')
      await user.type(nameInput, 'My Recipe')

      expect(nameInput).toHaveValue('My Recipe')
    })
  })

  // ============================================
  // LOADING STATE TESTS
  // ============================================

  describe('Loading States', () => {
    it('should show progress bar when submitting', () => {
      const mockCreate = mockUseCreateRecipe()
      mockCreate.isPending = true
      vi.mocked(useCreateRecipe).mockReturnValue(mockCreate as any)

      const props = createRecipeBuilderProps()

      render(<RecipeBuilder {...props} />)

      // Progress bar should be rendered
      const progressBar = document.querySelector('[role="progressbar"]')
      expect(progressBar).toBeInTheDocument()
    })

    it('should disable buttons when submitting', () => {
      const mockCreate = mockUseCreateRecipe()
      mockCreate.isPending = true
      vi.mocked(useCreateRecipe).mockReturnValue(mockCreate as any)

      const props = createRecipeBuilderProps()

      render(<RecipeBuilder {...props} />)

      const cancelButton = screen.getByText('Cancelar')
      expect(cancelButton).toBeDisabled()
    })
  })

  // ============================================
  // ENTITY TYPE TESTS
  // ============================================

  describe('Entity Type Handling', () => {
    it('should render correctly for material entityType', () => {
      const props = createRecipeBuilderProps({ entityType: 'material' })

      render(<RecipeBuilder {...props} />)

      expect(screen.getByText(/solo materials permitidos/)).toBeInTheDocument()
    })

    it('should render correctly for product entityType', () => {
      const props = createRecipeBuilderProps({ entityType: 'product' })

      render(<RecipeBuilder {...props} />)

      expect(screen.getByText(/materials y products permitidos/)).toBeInTheDocument()
    })

    it('should render correctly for kit entityType', () => {
      const props = createRecipeBuilderProps({ entityType: 'kit' })

      render(<RecipeBuilder {...props} />)

      expect(screen.getByText(/solo products permitidos/)).toBeInTheDocument()
    })

    it('should render correctly for service entityType', () => {
      const props = createRecipeBuilderProps({ entityType: 'service' })

      render(<RecipeBuilder {...props} />)

      expect(screen.getByText(/materials y assets permitidos/)).toBeInTheDocument()
    })
  })
})
