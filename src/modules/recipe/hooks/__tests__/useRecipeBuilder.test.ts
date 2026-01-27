/**
 * useRecipeBuilder Hook Tests
 *
 * Tests the custom hook that manages RecipeBuilder state and logic
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useRecipeBuilder } from '../useRecipeBuilder'
import type { UseRecipeBuilderParams } from '../useRecipeBuilder'
import {
  createMockRecipe,
  createMockValidationResult,
  mockUseCreateRecipe,
  mockUseUpdateRecipe,
  expectRecipeToHaveValidStructure,
  expectValidationToBeValid,
} from '../../__tests__/testUtils'

// ============================================
// MOCKS
// ============================================

// Mock TanStack Query hooks
vi.mock('../useRecipes', () => ({
  useCreateRecipe: vi.fn(),
  useUpdateRecipe: vi.fn(),
}))

// Mock validation service
vi.mock('../../services/recipeValidation', () => ({
  validateRecipe: vi.fn(),
}))

// Mock logger
vi.mock('@/lib/logging/Logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

import { useCreateRecipe, useUpdateRecipe } from '../useRecipes'
import { validateRecipe } from '../../services/recipeValidation'

// ============================================
// TEST SETUP
// ============================================

describe('useRecipeBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mocks
    vi.mocked(useCreateRecipe).mockReturnValue(mockUseCreateRecipe() as any)
    vi.mocked(useUpdateRecipe).mockReturnValue(mockUseUpdateRecipe() as any)
    vi.mocked(validateRecipe).mockReturnValue(createMockValidationResult())
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  // ============================================
  // INITIALIZATION TESTS
  // ============================================

  describe('Initialization', () => {
    it('should initialize with default values in create mode', () => {
      const params: UseRecipeBuilderParams = {
        mode: 'create',
        entityType: 'product',
      }

      const { result } = renderHook(() => useRecipeBuilder(params))

      expect(result.current.recipe.name).toBe('')
      expect(result.current.recipe.entityType).toBe('product')
      expect(result.current.recipe.executionMode).toBe('on_demand')
      expect(result.current.recipe.inputs).toEqual([])
      expect(result.current.mode).toBe('create')
    })

    it('should initialize with provided initialData', () => {
      const mockRecipe = createMockRecipe({ name: 'Test Recipe' })

      const params: UseRecipeBuilderParams = {
        mode: 'edit',
        entityType: 'product',
        initialData: mockRecipe,
      }

      const { result } = renderHook(() => useRecipeBuilder(params))

      expect(result.current.recipe.name).toBe('Test Recipe')
      expect(result.current.recipe.id).toBe(mockRecipe.id)
    })

    it('should set executionMode to immediate for material entityType', () => {
      const params: UseRecipeBuilderParams = {
        mode: 'create',
        entityType: 'material',
      }

      const { result } = renderHook(() => useRecipeBuilder(params))

      expect(result.current.recipe.executionMode).toBe('immediate')
    })

    it('should set executionMode to on_demand for non-material entityTypes', () => {
      const entityTypes: Array<'product' | 'kit' | 'service'> = ['product', 'kit', 'service']

      entityTypes.forEach(entityType => {
        const params: UseRecipeBuilderParams = {
          mode: 'create',
          entityType,
        }

        const { result } = renderHook(() => useRecipeBuilder(params))

        expect(result.current.recipe.executionMode).toBe('on_demand')
      })
    })

    it('should merge features with defaults', () => {
      const params: UseRecipeBuilderParams = {
        mode: 'create',
        entityType: 'product',
        features: {
          showCostCalculation: false,
          enableAiSuggestions: true,
        },
      }

      const { result } = renderHook(() => useRecipeBuilder(params))

      expect(result.current.features.showCostCalculation).toBe(false)
      expect(result.current.features.enableAiSuggestions).toBe(true)
      expect(result.current.features.showInstructions).toBe(true) // default
    })
  })

  // ============================================
  // STATE UPDATE TESTS
  // ============================================

  describe('State Updates', () => {
    it('should update recipe when updateRecipe is called', () => {
      const params: UseRecipeBuilderParams = {
        mode: 'create',
        entityType: 'product',
      }

      const { result } = renderHook(() => useRecipeBuilder(params))

      act(() => {
        result.current.updateRecipe({ name: 'Updated Recipe' })
      })

      expect(result.current.recipe.name).toBe('Updated Recipe')
    })

    it('should merge updates with existing recipe data', () => {
      const params: UseRecipeBuilderParams = {
        mode: 'create',
        entityType: 'product',
        initialData: { name: 'Original', description: 'Original description' },
      }

      const { result } = renderHook(() => useRecipeBuilder(params))

      act(() => {
        result.current.updateRecipe({ name: 'Updated' })
      })

      expect(result.current.recipe.name).toBe('Updated')
      expect(result.current.recipe.description).toBe('Original description')
    })
  })

  // ============================================
  // VALIDATION TESTS
  // ============================================

  describe('Validation', () => {
    it('should validate recipe automatically', () => {
      const params: UseRecipeBuilderParams = {
        mode: 'create',
        entityType: 'product',
      }

      const { result } = renderHook(() => useRecipeBuilder(params))

      expect(result.current.validation).toBeDefined()
      expect(validateRecipe).toHaveBeenCalled()
    })

    it('should use custom validation if provided', () => {
      const customValidation = vi.fn().mockReturnValue(
        createMockValidationResult({ errors: ['Custom error'] })
      )

      const params: UseRecipeBuilderParams = {
        mode: 'create',
        entityType: 'product',
        customValidation,
      }

      const { result } = renderHook(() => useRecipeBuilder(params))

      expect(customValidation).toHaveBeenCalled()
      expect(result.current.validation.errors).toContain('Custom error')
    })

    it('should return error validation on exception', () => {
      vi.mocked(validateRecipe).mockImplementation(() => {
        throw new Error('Validation error')
      })

      const params: UseRecipeBuilderParams = {
        mode: 'create',
        entityType: 'product',
      }

      const { result } = renderHook(() => useRecipeBuilder(params))

      expect(result.current.validation.isValid).toBe(false)
      expect(result.current.validation.errors.length).toBeGreaterThan(0)
    })
  })

  // ============================================
  // SAVE RECIPE TESTS
  // ============================================

  describe('Save Recipe', () => {
    it('should create recipe in create mode', async () => {
      const mockCreate = mockUseCreateRecipe()
      vi.mocked(useCreateRecipe).mockReturnValue(mockCreate as any)

      const onSave = vi.fn()
      const params: UseRecipeBuilderParams = {
        mode: 'create',
        entityType: 'product',
        initialData: { name: 'Test Recipe' },
        onSave,
      }

      const { result } = renderHook(() => useRecipeBuilder(params))

      let savedRecipe: any
      await act(async () => {
        savedRecipe = await result.current.saveRecipe()
      })

      expect(mockCreate.mutateAsync).toHaveBeenCalled()
      expect(onSave).toHaveBeenCalled()
      expect(savedRecipe).toBeDefined()
    })

    it('should update recipe in edit mode', async () => {
      const mockUpdate = mockUseUpdateRecipe()
      vi.mocked(useUpdateRecipe).mockReturnValue(mockUpdate as any)

      const mockRecipe = createMockRecipe()
      const params: UseRecipeBuilderParams = {
        mode: 'edit',
        entityType: 'product',
        initialData: mockRecipe,
      }

      const { result } = renderHook(() => useRecipeBuilder(params))

      await act(async () => {
        await result.current.saveRecipe()
      })

      expect(mockUpdate.mutateAsync).toHaveBeenCalledWith({
        id: mockRecipe.id,
        updates: expect.any(Object),
      })
    })

    it('should not save if validation fails', async () => {
      vi.mocked(validateRecipe).mockReturnValue(
        createMockValidationResult({ isValid: false, errors: ['Name required'] })
      )

      const mockCreate = mockUseCreateRecipe()
      vi.mocked(useCreateRecipe).mockReturnValue(mockCreate as any)

      const params: UseRecipeBuilderParams = {
        mode: 'create',
        entityType: 'product',
      }

      const { result } = renderHook(() => useRecipeBuilder(params))

      const savedRecipe = await act(async () => {
        return await result.current.saveRecipe()
      })

      expect(mockCreate.mutateAsync).not.toHaveBeenCalled()
      expect(savedRecipe).toBeNull()
    })

    it('should return null on save error', async () => {
      const mockCreate = mockUseCreateRecipe()
      mockCreate.mutateAsync = vi.fn().mockRejectedValue(new Error('Save failed'))
      vi.mocked(useCreateRecipe).mockReturnValue(mockCreate as any)

      const params: UseRecipeBuilderParams = {
        mode: 'create',
        entityType: 'product',
        initialData: { name: 'Test' },
      }

      const { result } = renderHook(() => useRecipeBuilder(params))

      const savedRecipe = await act(async () => {
        return await result.current.saveRecipe()
      })

      expect(savedRecipe).toBeNull()
    })
  })

  // ============================================
  // METADATA TESTS
  // ============================================

  describe('Metadata', () => {
    it('should expose mode and entityType', () => {
      const params: UseRecipeBuilderParams = {
        mode: 'edit',
        entityType: 'material',
      }

      const { result } = renderHook(() => useRecipeBuilder(params))

      expect(result.current.mode).toBe('edit')
      expect(result.current.entityType).toBe('material')
    })

    it('should expose complexity', () => {
      const params: UseRecipeBuilderParams = {
        mode: 'create',
        entityType: 'product',
        complexity: 'advanced',
      }

      const { result } = renderHook(() => useRecipeBuilder(params))

      expect(result.current.complexity).toBe('advanced')
    })

    it('should track isSubmitting state', async () => {
      const mockCreate = mockUseCreateRecipe()
      mockCreate.isPending = true
      vi.mocked(useCreateRecipe).mockReturnValue(mockCreate as any)

      const params: UseRecipeBuilderParams = {
        mode: 'create',
        entityType: 'product',
      }

      const { result } = renderHook(() => useRecipeBuilder(params))

      expect(result.current.isSubmitting).toBe(true)
    })
  })
})
