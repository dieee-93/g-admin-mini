// Enhanced Recipe API Tests - Comprehensive Test Suite
import { describe, it, expect, vi, beforeEach } from "vitest"
import * as recipeApi from "./recipeApi"
import type { Recipe, CreateRecipeData } from "../types"
import { supabase } from "@/lib/supabase/client"

vi.mock("@/lib/supabase/client", () => {
  const createQueryBuilder = (initialData = { data: [], error: null }) => {
    let query = Promise.resolve(initialData);
    const builder = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(() => {
        query = Promise.resolve({ data: {}, error: null });
        return builder;
      }),
      then: (...args) => query.then(...args),
      catch: (...args) => query.catch(...args),
      finally: (...args) => query.finally(...args),
    };
    return builder;
  };

  const supabase = {
    from: vi.fn(() => createQueryBuilder()),
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: {} }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: {} }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        download: vi.fn(),
        remove: vi.fn(),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'http://example.com/avatar.png' } })),
      })),
    },
  };

  return { supabase };
})

describe("Recipe API - Enhanced Test Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
      (supabase.from as vi.Mock).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockRecipes, error: null }),
      });

      const result = await recipeApi.fetchRecipes()

      expect(supabase.from).toHaveBeenCalledWith("recipes")
      expect(result).toEqual(mockRecipes)
    })

    it("should handle fetch error", async () => {
      (supabase.from as vi.Mock).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ 
          data: null, 
          error: { message: "Database error" } 
        }),
      });

      await expect(recipeApi.fetchRecipes()).rejects.toThrow()
    })

    it("should handle empty result", async () => {
      (supabase.from as vi.Mock).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: null }),
      });

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
      (supabase.from as vi.Mock).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: createdRecipe, error: null }),
      });

      const result = await recipeApi.createRecipe(newRecipeData)

      expect(supabase.from).toHaveBeenCalledWith("recipes")
      expect(result).toEqual(createdRecipe)
    })

    it("should handle creation error", async () => {
      (supabase.from as vi.Mock).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({ data: null, error: { message: "Creation failed" } }),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: "Creation failed" } }),
      });

      await expect(recipeApi.createRecipe(newRecipeData)).rejects.toThrow()
    })
  })

  describe("calculateRecipeCost", () => {
    it("should calculate cost successfully", async () => {
      (supabase.rpc as vi.Mock).mockResolvedValue({ data: 15.75, error: null })

      const result = await recipeApi.calculateRecipeCost("recipe-1")

      expect(supabase.rpc).toHaveBeenCalledWith("calculate_recipe_cost", { recipe_id: "recipe-1" })
      expect(result).toBe(15.75)
    })

    it("should handle null cost data", async () => {
      (supabase.rpc as vi.Mock).mockResolvedValue({ data: null, error: null })

      const result = await recipeApi.calculateRecipeCost("recipe-1")
      expect(result).toBe(0)
    })

    it("should handle negative costs", async () => {
      (supabase.rpc as vi.Mock).mockResolvedValue({ data: -5.25, error: null })

      const result = await recipeApi.calculateRecipeCost("recipe-1")
      expect(result).toBe(0)
    })

    it("should handle cost calculation error", async () => {
      (supabase.rpc as vi.Mock).mockResolvedValue({ 
        data: null, 
        error: { message: "Calculation failed" } 
      })

      await expect(recipeApi.calculateRecipeCost("recipe-1"))
        .rejects.toThrow("Error calculating recipe cost")
    })
  })

  describe("deleteRecipe", () => {
    it("should delete recipe successfully", async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      (supabase.from as vi.Mock).mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: mockEq,
      });

      await recipeApi.deleteRecipe("recipe-1")

      expect(supabase.from).toHaveBeenCalledWith("recipes")
      expect(mockEq).toHaveBeenCalledWith("id", "recipe-1")
    })

    it("should handle delete error", async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: { message: "Delete failed" } });
      (supabase.from as vi.Mock).mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: mockEq,
      });

      await expect(recipeApi.deleteRecipe("recipe-1")).rejects.toThrow()
    })
  })

  describe("Performance Tests", () => {
    it("should handle multiple concurrent calls", async () => {
      (supabase.from as vi.Mock).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      });

      const calls = Array.from({ length: 5 }, () => recipeApi.fetchRecipes())
      const results = await Promise.all(calls)

      expect(results).toHaveLength(5)
      expect(supabase.from).toHaveBeenCalledTimes(5)
    })
  })
})
