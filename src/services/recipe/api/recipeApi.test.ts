// Enhanced Recipe API Tests - Comprehensive Test Suite
import { describe, it, expect, vi, beforeEach } from "vitest"
import * as recipeApi from "./recipeApi"
import type { Recipe, CreateRecipeData } from "../types"

// Mock Supabase with comprehensive chain methods
const mockSupabaseChain = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(), 
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis()
}

const mockSupabase = {
  from: vi.fn(() => mockSupabaseChain),
  rpc: vi.fn()
}

vi.mock("@/lib/supabase", () => ({
  supabase: mockSupabase
}))

describe("Recipe API - Enhanced Test Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.values(mockSupabaseChain).forEach(mock => mock.mockReturnThis())
  })

  describe("fetchRecipes", () => {
    const mockRecipes = [
      {
        id: "recipe-1",
        name: "Test Recipe 1", 
        output_item_id: "item-1",
        output_quantity: 2
      }
    ]

    it("should fetch recipes successfully", async () => {
      mockSupabaseChain.order.mockResolvedValue({ data: mockRecipes, error: null })

      const result = await recipeApi.fetchRecipes()

      expect(mockSupabase.from).toHaveBeenCalledWith("recipes")
      expect(result).toEqual(mockRecipes)
    })

    it("should handle fetch error", async () => {
      mockSupabaseChain.order.mockResolvedValue({ 
        data: null, 
        error: { message: "Database error" } 
      })

      await expect(recipeApi.fetchRecipes()).rejects.toThrow()
    })

    it("should handle empty result", async () => {
      mockSupabaseChain.order.mockResolvedValue({ data: null, error: null })

      const result = await recipeApi.fetchRecipes()
      expect(result).toEqual([])
    })
  })

  describe("createRecipe", () => {
    const newRecipeData = {
      name: "New Recipe",
      output_item_id: "item-new", 
      output_quantity: 3,
      ingredients: [
        { item_id: "ingredient-1", quantity: 2 }
      ]
    }

    const createdRecipe = {
      id: "new-recipe-id",
      ...newRecipeData
    }

    it("should create recipe successfully", async () => {
      mockSupabaseChain.single.mockResolvedValueOnce({ data: createdRecipe, error: null })
      mockSupabaseChain.insert.mockResolvedValueOnce({ error: null })
      vi.spyOn(recipeApi, 'fetchRecipeById').mockResolvedValue(createdRecipe)

      const result = await recipeApi.createRecipe(newRecipeData)

      expect(mockSupabase.from).toHaveBeenCalledWith("recipes")
      expect(result).toEqual(createdRecipe)
    })

    it("should handle creation error", async () => {
      mockSupabaseChain.single.mockResolvedValue({ 
        data: null, 
        error: { message: "Creation failed" } 
      })

      await expect(recipeApi.createRecipe(newRecipeData)).rejects.toThrow()
    })
  })

  describe("calculateRecipeCost", () => {
    it("should calculate cost successfully", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 15.75, error: null })

      const result = await recipeApi.calculateRecipeCost("recipe-1")

      expect(mockSupabase.rpc).toHaveBeenCalledWith("calculate_recipe_cost", { recipe_id: "recipe-1" })
      expect(result).toBe(15.75)
    })

    it("should handle null cost data", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null })

      const result = await recipeApi.calculateRecipeCost("recipe-1")
      expect(result).toBe(0)
    })

    it("should handle negative costs", async () => {
      mockSupabase.rpc.mockResolvedValue({ data: -5.25, error: null })

      const result = await recipeApi.calculateRecipeCost("recipe-1")
      expect(result).toBe(0)
    })

    it("should handle cost calculation error", async () => {
      mockSupabase.rpc.mockResolvedValue({ 
        data: null, 
        error: { message: "Calculation failed" } 
      })

      await expect(recipeApi.calculateRecipeCost("recipe-1"))
        .rejects.toThrow("Error calculating recipe cost")
    })
  })

  describe("deleteRecipe", () => {
    it("should delete recipe successfully", async () => {
      mockSupabaseChain.delete.mockResolvedValue({ error: null })

      await recipeApi.deleteRecipe("recipe-1")

      expect(mockSupabase.from).toHaveBeenCalledWith("recipes")
      expect(mockSupabaseChain.eq).toHaveBeenCalledWith("id", "recipe-1")
    })

    it("should handle delete error", async () => {
      mockSupabaseChain.delete.mockResolvedValue({ 
        error: { message: "Delete failed" } 
      })

      await expect(recipeApi.deleteRecipe("recipe-1")).rejects.toThrow()
    })
  })

  describe("Performance Tests", () => {
    it("should handle multiple concurrent calls", async () => {
      mockSupabaseChain.order.mockResolvedValue({ data: [], error: null })

      const calls = Array.from({ length: 5 }, () => recipeApi.fetchRecipes())
      const results = await Promise.all(calls)

      expect(results).toHaveLength(5)
      expect(mockSupabase.from).toHaveBeenCalledTimes(5)
    })
  })
})
