/**
 * Recipe Module - Test Utilities
 *
 * Helpers, mocks, and factories for testing recipe components
 */

import { vi } from 'vitest'
import { type ReactNode } from 'react'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import type { Recipe, RecipeInput, RecipeOutput } from '../types/recipe'
import type { ValidationResult } from '../components/RecipeBuilder/types'

// ============================================
// TEST WRAPPER
// ============================================

/**
 * Wrapper component that provides ChakraProvider for UI tests
 */
export function TestWrapper({ children }: { children: ReactNode }) {
  return <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
}

// ============================================
// MOCK DATA FACTORIES
// ============================================

/**
 * Create a mock Recipe for testing
 */
export function createMockRecipe(overrides?: Partial<Recipe>): Recipe {
  return {
    id: 'test-recipe-1',
    name: 'Test Recipe',
    description: 'A test recipe',
    entityType: 'product',
    executionMode: 'on_demand',
    output: {
      quantity: 1,
      unit: 'unit',
    },
    inputs: [],
    category: undefined,
    tags: [],
    difficulty: undefined,
    preparationTime: undefined,
    cookingTime: undefined,
    totalTime: undefined,
    instructions: [],
    notes: undefined,
    costConfig: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Create a mock RecipeInput for testing
 */
export function createMockRecipeInput(overrides?: Partial<RecipeInput>): RecipeInput {
  return {
    id: `input-${Date.now()}`,
    item: 'Test Item',
    quantity: 1,
    unit: 'unit',
    optional: false,
    yieldPercentage: 100,
    wastePercentage: 0,
    ...overrides,
  }
}

/**
 * Create a mock RecipeOutput for testing
 */
export function createMockRecipeOutput(overrides?: Partial<RecipeOutput>): RecipeOutput {
  return {
    quantity: 1,
    unit: 'unit',
    ...overrides,
  }
}

/**
 * Create a mock ValidationResult for testing
 */
export function createMockValidationResult(overrides?: Partial<ValidationResult>): ValidationResult {
  return {
    isValid: true,
    errors: [],
    warnings: [],
    ...overrides,
  }
}

// ============================================
// MOCK TANSTACK QUERY HOOKS
// ============================================

/**
 * Mock useCreateRecipe hook
 */
export function mockUseCreateRecipe() {
  return {
    mutateAsync: vi.fn().mockResolvedValue(createMockRecipe()),
    isPending: false,
    isError: false,
    error: null,
  }
}

/**
 * Mock useUpdateRecipe hook
 */
export function mockUseUpdateRecipe() {
  return {
    mutateAsync: vi.fn().mockResolvedValue(createMockRecipe()),
    isPending: false,
    isError: false,
    error: null,
  }
}

/**
 * Mock useRecipeCosts hook
 */
export function mockUseRecipeCosts() {
  return {
    calculateCostAsync: vi.fn().mockResolvedValue({
      materialsCost: 10.5,
      laborCost: 0,
      overheadCost: 0,
      totalCost: 10.5,
      costPerUnit: 10.5,
      inputsBreakdown: [],
      yieldAnalysis: {
        yieldPercentage: 100,
        wasteFactor: 0,
        efficiencyScore: 100,
      },
    }),
    isCalculating: false,
  }
}

// ============================================
// MOCK VALIDATION SERVICE
// ============================================

/**
 * Mock validateRecipe function
 */
export function mockValidateRecipe(result?: ValidationResult) {
  return vi.fn().mockReturnValue(
    result ?? createMockValidationResult()
  )
}

// ============================================
// COMPONENT PROPS HELPERS
// ============================================

/**
 * Create default props for RecipeBuilder component
 */
export function createRecipeBuilderProps(overrides?: any) {
  return {
    mode: 'create' as const,
    entityType: 'product' as const,
    complexity: 'standard' as const,
    features: {
      showCostCalculation: true,
      showAnalytics: false,
      showInstructions: true,
      showYieldConfig: true,
      showQualityConfig: false,
      allowSubstitutions: false,
      enableAiSuggestions: false,
    },
    onSave: vi.fn(),
    onCancel: vi.fn(),
    ...overrides,
  }
}

/**
 * Create default props for section components
 */
export function createSectionProps(overrides?: any) {
  return {
    recipe: createMockRecipe(),
    updateRecipe: vi.fn(),
    entityType: 'product' as const,
    features: {
      showCostCalculation: true,
      showAnalytics: false,
      showInstructions: true,
      showYieldConfig: true,
      showQualityConfig: false,
      allowSubstitutions: false,
      enableAiSuggestions: false,
    },
    ...overrides,
  }
}

// ============================================
// CUSTOM MATCHERS
// ============================================

/**
 * Assert that a recipe has the expected structure
 */
export function expectRecipeToHaveValidStructure(recipe: Partial<Recipe>) {
  expect(recipe).toBeDefined()
  expect(recipe.entityType).toBeDefined()
  expect(recipe.executionMode).toBeDefined()
  expect(recipe.inputs).toBeInstanceOf(Array)
  expect(recipe.output).toBeDefined()
}

/**
 * Assert that validation result is valid
 */
export function expectValidationToBeValid(validation: ValidationResult) {
  expect(validation.isValid).toBe(true)
  expect(validation.errors).toHaveLength(0)
}

/**
 * Assert that validation result has errors
 */
export function expectValidationToHaveErrors(validation: ValidationResult, expectedErrors: number = 1) {
  expect(validation.isValid).toBe(false)
  expect(validation.errors.length).toBeGreaterThanOrEqual(expectedErrors)
}

// ============================================
// WAIT HELPERS
// ============================================

/**
 * Wait for async operations to complete
 */
export async function waitForAsync() {
  await new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * Wait for multiple ticks
 */
export async function waitForTicks(ticks: number = 1) {
  for (let i = 0; i < ticks; i++) {
    await waitForAsync()
  }
}
