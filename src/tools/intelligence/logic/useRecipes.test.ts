// Enhanced useRecipes Hook Tests - Comprehensive Test Suite
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { useRecipes, useRecipeOperations } from "./useRecipes"
import type { Recipe, CreateRecipeData, RecipeWithCost, RecipeViability, RecipeExecution } from "../types"

// Mock the API
const mockFetchRecipes = vi.fn()
const mockFetchRecipesWithCosts = vi.fn()
const mockCreateRecipe = vi.fn()
const mockUpdateRecipe = vi.fn()
const mockDeleteRecipe = vi.fn()
const mockCalculateRecipeCost = vi.fn()
const mockCheckRecipeViability = vi.fn()
const mockExecuteRecipe = vi.fn()

vi.mock("../data/recipeApi", () => ({
  fetchRecipes: mockFetchRecipes,
  fetchRecipesWithCosts: mockFetchRecipesWithCosts,
  createRecipe: mockCreateRecipe,
  updateRecipe: mockUpdateRecipe,
  deleteRecipe: mockDeleteRecipe,
  calculateRecipeCost: mockCalculateRecipeCost,
  checkRecipeViability: mockCheckRecipeViability,
  executeRecipe: mockExecuteRecipe
}))

// Mock console.error to avoid test noise
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe("useRecipes Hook", () => {
  const mockRecipes: Recipe[] = [
    {
      id: "recipe-1",
      name: "Test Recipe 1",
      output_item_id: "item-1",
      output_quantity: 2,
      preparation_time: 30,
      instructions: "Test instructions",
      output_item: {
        id: "item-1",
        name: "Test Item",
        unit: "pieces",
        type: "product"
      },
      recipe_ingredients: [
        {
          id: "ing-1",
          recipe_id: "recipe-1",
          item_id: "ingredient-1",
          quantity: 2,
          item: {
            id: "ingredient-1",
            name: "Test Ingredient",
            unit: "kg",
            type: "ingredient",
            stock: 10,
            unit_cost: 5
          }
        }
      ]
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchRecipes.mockResolvedValue(mockRecipes)
    mockFetchRecipesWithCosts.mockResolvedValue([])
    consoleSpy.mockClear()
  })

  describe("Initial State and Loading", () => {
    it("should initialize with correct default state", () => {
      const { result } = renderHook(() => useRecipes())

      expect(result.current.recipes).toEqual([])
      expect(result.current.recipesWithCosts).toEqual([])
      expect(result.current.loading).toBe(true)
      expect(result.current.loadingCosts).toBe(false)
    })

    it("should load recipes on mount", async () => {
      const { result } = renderHook(() => useRecipes())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockFetchRecipes).toHaveBeenCalledTimes(1)
      expect(mockFetchRecipesWithCosts).toHaveBeenCalledTimes(1)
      expect(result.current.recipes).toEqual(mockRecipes)
    })

    it("should handle loading errors gracefully", async () => {
      const error = new Error("Failed to load recipes")
      mockFetchRecipes.mockRejectedValue(error)

      const { result } = renderHook(() => useRecipes())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(consoleSpy).toHaveBeenCalledWith("Error loading recipes:", error)
      expect(result.current.recipes).toEqual([])
    })
  })

  describe("Recipe CRUD Operations", () => {
    it("should add a new recipe successfully", async () => {
      const newRecipeData: CreateRecipeData = {
        name: "New Test Recipe",
        output_item_id: "item-3",
        output_quantity: 1,
        preparation_time: 20,
        instructions: "New recipe instructions",
        ingredients: [
          { item_id: "ingredient-1", quantity: 1 }
        ]
      }

      const createdRecipe: Recipe = {
        id: "recipe-3",
        ...newRecipeData,
        output_item: {
          id: "item-3",
          name: "New Item",
          unit: "pieces",
          type: "product"
        },
        recipe_ingredients: []
      }

      mockCreateRecipe.mockResolvedValue(createdRecipe)

      const { result } = renderHook(() => useRecipes())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let returnedRecipe: Recipe
      await act(async () => {
        returnedRecipe = await result.current.addRecipe(newRecipeData)
      })

      expect(mockCreateRecipe).toHaveBeenCalledWith(newRecipeData)
      expect(returnedRecipe).toEqual(createdRecipe)
      expect(mockFetchRecipes).toHaveBeenCalledTimes(2)
      expect(mockFetchRecipesWithCosts).toHaveBeenCalledTimes(2)
    })

    it("should edit an existing recipe successfully", async () => {
      const updates: Partial<CreateRecipeData> = {
        name: "Updated Recipe Name",
        preparation_time: 25
      }

      const updatedRecipe: Recipe = {
        ...mockRecipes[0],
        ...updates
      }

      mockUpdateRecipe.mockResolvedValue(updatedRecipe)

      const { result } = renderHook(() => useRecipes())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      let returnedRecipe: Recipe
      await act(async () => {
        returnedRecipe = await result.current.editRecipe("recipe-1", updates)
      })

      expect(mockUpdateRecipe).toHaveBeenCalledWith("recipe-1", updates)
      expect(returnedRecipe).toEqual(updatedRecipe)
    })

    it("should remove a recipe successfully", async () => {
      mockDeleteRecipe.mockResolvedValue(undefined)

      const { result } = renderHook(() => useRecipes())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.removeRecipe("recipe-1")
      })

      expect(mockDeleteRecipe).toHaveBeenCalledWith("recipe-1")
      expect(mockFetchRecipes).toHaveBeenCalledTimes(2)
    })
  })
})

describe("useRecipeOperations Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCalculateRecipeCost.mockResolvedValue(15.75)
  })

  describe("Initial State", () => {
    it("should initialize with correct default state", () => {
      const { result } = renderHook(() => useRecipeOperations())

      expect(result.current.loading).toBe(false)
      expect(typeof result.current.getCost).toBe("function")
      expect(typeof result.current.checkViability).toBe("function")
      expect(typeof result.current.execute).toBe("function")
    })
  })

  describe("Cost Calculation", () => {
    it("should calculate recipe cost successfully", async () => {
      const { result } = renderHook(() => useRecipeOperations())

      let cost: number
      await act(async () => {
        cost = await result.current.getCost("recipe-1")
      })

      expect(mockCalculateRecipeCost).toHaveBeenCalledWith("recipe-1")
      expect(cost).toBe(15.75)
      expect(result.current.loading).toBe(false)
    })

    it("should handle cost calculation errors", async () => {
      const error = new Error("Cost calculation failed")
      mockCalculateRecipeCost.mockRejectedValue(error)

      const { result } = renderHook(() => useRecipeOperations())

      await expect(
        act(async () => {
          await result.current.getCost("recipe-1")
        })
      ).rejects.toThrow("Cost calculation failed")

      expect(consoleSpy).toHaveBeenCalledWith("Error calculating recipe cost:", error)
      expect(result.current.loading).toBe(false)
    })
  })
})
