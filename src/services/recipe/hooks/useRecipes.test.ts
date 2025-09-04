// Enhanced useRecipes Hook Tests - Comprehensive Test Suite
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { useRecipes, useRecipeOperations } from "./useRecipes"
import type { Recipe, CreateRecipeData, RecipeWithCost, RecipeViability, RecipeExecution } from "../types"

import {
  fetchRecipes,
  fetchRecipesWithCosts,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  calculateRecipeCost,
  checkRecipeViability,
  executeRecipe,
} from '../api/recipeApi';

vi.mock("../api/recipeApi")

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
    vi.clearAllMocks();
    (fetchRecipes as vi.Mock).mockResolvedValue(mockRecipes);
    (fetchRecipesWithCosts as vi.Mock).mockResolvedValue([]);
  })

  describe("Initial State and Loading", () => {
    it("should initialize with correct default state", () => {
      const { result } = renderHook(() => useRecipes())

      expect(result.current.recipes).toEqual([])
      expect(result.current.recipesWithCosts).toEqual([])
      expect(result.current.loading).toBe(true)
      expect(result.current.loadingCosts).toBe(true) // This should be true initially
    })

    it("should load recipes on mount", async () => {
      const { result } = renderHook(() => useRecipes())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(fetchRecipes).toHaveBeenCalledTimes(1)
      expect(fetchRecipesWithCosts).toHaveBeenCalledTimes(1)
      expect(result.current.recipes).toEqual(mockRecipes)
    })

    it("should handle loading errors gracefully", async () => {
      const error = new Error("Failed to load recipes");
      (fetchRecipes as vi.Mock).mockRejectedValue(error);
      (fetchRecipesWithCosts as vi.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useRecipes())

      // Wait for both loading states to complete with longer timeout
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.loadingCosts).toBe(false)
      }, { timeout: 3000 })

      expect(result.current.recipes).toEqual([])
      expect(result.current.recipesWithCosts).toEqual([])
    })
  })

  describe("Recipe CRUD Operations", () => {
    it("should add a new recipe successfully", async () => {
      const newRecipeData: CreateRecipeData = {
        name: "New Test Recipe",
        output_item_id: "item-3",
        output_quantity: 1,
        ingredients: [ { item_id: "ingredient-1", quantity: 1 } ]
      }
      const createdRecipe: Recipe = { id: "recipe-3", ...newRecipeData, recipe_ingredients: [] };
      (createRecipe as vi.Mock).mockResolvedValue(createdRecipe)

      const { result } = renderHook(() => useRecipes())
      await waitFor(() => expect(result.current.loading).toBe(false))

      let returnedRecipe: Recipe | undefined;
      await act(async () => {
        returnedRecipe = await result.current.addRecipe(newRecipeData)
      })

      expect(createRecipe).toHaveBeenCalledWith(newRecipeData)
      expect(returnedRecipe).toEqual(createdRecipe)
      expect(fetchRecipes).toHaveBeenCalledTimes(2)
      expect(fetchRecipesWithCosts).toHaveBeenCalledTimes(2)
    })

    it("should edit an existing recipe successfully", async () => {
      const updates: Partial<CreateRecipeData> = { name: "Updated Recipe Name" }
      const updatedRecipe: Recipe = { ...mockRecipes[0], ...updates };
      (updateRecipe as vi.Mock).mockResolvedValue(updatedRecipe)

      const { result } = renderHook(() => useRecipes())
      await waitFor(() => expect(result.current.loading).toBe(false))

      let returnedRecipe: Recipe | undefined;
      await act(async () => {
        returnedRecipe = await result.current.editRecipe("recipe-1", updates)
      })

      expect(updateRecipe).toHaveBeenCalledWith("recipe-1", updates)
      expect(returnedRecipe).toEqual(updatedRecipe)
    })

    it("should remove a recipe successfully", async () => {
      (deleteRecipe as vi.Mock).mockResolvedValue(undefined)

      const { result } = renderHook(() => useRecipes())
      await waitFor(() => expect(result.current.loading).toBe(false))

      await act(async () => {
        await result.current.removeRecipe("recipe-1")
      })

      expect(deleteRecipe).toHaveBeenCalledWith("recipe-1")
      expect(fetchRecipes).toHaveBeenCalledTimes(2)
    })
  })
})

describe("useRecipeOperations Hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (calculateRecipeCost as vi.Mock).mockResolvedValue(15.75);
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

      let cost: number | undefined;
      await act(async () => {
        cost = await result.current.getCost("recipe-1")
      })

      expect(calculateRecipeCost).toHaveBeenCalledWith("recipe-1")
      expect(cost).toBe(15.75)
      expect(result.current.loading).toBe(false)
    })

    it("should handle cost calculation errors", async () => {
      const error = new Error("Cost calculation failed");
      (calculateRecipeCost as vi.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useRecipeOperations())

      await expect(result.current.getCost("recipe-1")).rejects.toThrow("Cost calculation failed")
      expect(result.current.loading).toBe(false)
    })
  })
})
