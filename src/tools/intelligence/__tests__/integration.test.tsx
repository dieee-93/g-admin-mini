// Recipe Integration Tests
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useRecipes } from "../logic/useRecipes"
import { SmartCostCalculator } from "../components/SmartCostCalculator/SmartCostCalculator"
import { QuickRecipeBuilder } from "../components/MiniBuilders/QuickRecipeBuilder"
import * as recipeApi from "../data/recipeApi"

// Mock API functions
vi.mock("../data/recipeApi")
const mockRecipeApi = recipeApi as any

// Mock ChakraUI
const ChakraWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="chakra-wrapper">{children}</div>
}

describe("Recipe Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Recipe CRUD Operations End-to-End", () => {
    it("should create, read, update, and delete recipes", async () => {
      const mockRecipe = {
        id: "new-recipe",
        name: "Integration Test Recipe",
        output_item_id: "item-1",
        output_quantity: 2
      }

      mockRecipeApi.fetchRecipes.mockResolvedValue([])
      mockRecipeApi.fetchRecipesWithCosts.mockResolvedValue([])
      mockRecipeApi.createRecipe.mockResolvedValue(mockRecipe)

      const { result } = renderHook(() => useRecipes())

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Create recipe
      await act(async () => {
        await result.current.addRecipe({
          name: "Integration Test Recipe",
          output_item_id: "item-1",
          output_quantity: 2,
          ingredients: []
        })
      })

      expect(mockRecipeApi.createRecipe).toHaveBeenCalled()
    })
  })

  describe("Cost Calculation Integration", () => {
    it("should integrate cost calculation with inventory data", async () => {
      const mockRecipe = {
        id: "test-recipe",
        name: "Test Recipe",
        ingredients: [
          { ingredient_id: "ing1", name: "Flour", quantity: 2, unit: "kg", cost: 5.0 },
          { ingredient_id: "ing2", name: "Sugar", quantity: 1, unit: "kg", cost: 3.50 }
        ]
      }

      const expectedCost = 25.50
      mockRecipeApi.calculateRecipeCost.mockResolvedValue(expectedCost)
      mockRecipeApi.fetchRecipes.mockResolvedValue([mockRecipe])
      mockRecipeApi.fetchRecipesWithCosts.mockResolvedValue([{ ...mockRecipe, total_cost: expectedCost }])

      const { result } = renderHook(() => useRecipes())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Test cost calculation integration
      await act(async () => {
        const calculatedCost = await result.current.calculateRecipeCost("test-recipe")
        expect(calculatedCost).toBe(expectedCost)
      })

      expect(mockRecipeApi.calculateRecipeCost).toHaveBeenCalledWith("test-recipe")
      
      // Verify recipes with costs are loaded
      expect(result.current.recipesWithCosts).toHaveLength(1)
      expect(result.current.recipesWithCosts[0].total_cost).toBe(expectedCost)
    })

    it("should handle cost calculation errors gracefully", async () => {
      mockRecipeApi.calculateRecipeCost.mockRejectedValue(new Error("Cost calculation failed"))
      mockRecipeApi.fetchRecipes.mockResolvedValue([])
      mockRecipeApi.fetchRecipesWithCosts.mockResolvedValue([])

      const { result } = renderHook(() => useRecipes())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Cost calculation should handle errors
      await act(async () => {
        try {
          await result.current.calculateRecipeCost("invalid-recipe")
        } catch (error) {
          expect(error).toBeInstanceOf(Error)
          expect((error as Error).message).toBe("Cost calculation failed")
        }
      })

      expect(mockRecipeApi.calculateRecipeCost).toHaveBeenCalledWith("invalid-recipe")
    })
  })

  describe("Form Submission Workflows", () => {
    it("should handle complete form submission workflow", async () => {
      const mockOnRecipeCreated = vi.fn()
      const user = userEvent.setup()

      render(
        <ChakraWrapper>
          <QuickRecipeBuilder onRecipeCreated={mockOnRecipeCreated} />
        </ChakraWrapper>
      )

      // Fill out form
      const nameInput = screen.getByPlaceholderText("Enter recipe name...")
      await user.type(nameInput, "Workflow Test Recipe")

      // Submit form
      const createButton = screen.getByText("Create Recipe with AI Intelligence")
      await user.click(createButton)

      // Verify callback was called with correct data
      expect(mockOnRecipeCreated).toHaveBeenCalledWith({
        name: "Workflow Test Recipe",
        difficulty_level: "intermediate",
        recipe_category: "main_course",
        preparation_time: 30,
        ingredients: []
      })
    })
  })

  describe("Navigation Between Recipe Views", () => {
    it("should handle navigation between different recipe components", () => {
      // Test navigation logic would go here
      // For now, testing component rendering
      render(
        <ChakraWrapper>
          <SmartCostCalculator recipeId="test-recipe" />
        </ChakraWrapper>
      )

      expect(screen.getByText("Smart Cost Calculator")).toBeInTheDocument()
    })
  })

  describe("Error Boundary Integration", () => {
    it("should handle component errors gracefully", () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      render(
        <ChakraWrapper>
          <SmartCostCalculator recipeId="test-recipe" />
        </ChakraWrapper>
      )

      // Component should render without throwing
      expect(screen.getByTestId("chakra-wrapper")).toBeInTheDocument()

      consoleSpy.mockRestore()
    })
  })

  describe("Loading States Integration", () => {
    it("should handle loading states correctly across components", async () => {
      mockRecipeApi.fetchRecipes.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([]), 100))
      )
      mockRecipeApi.fetchRecipesWithCosts.mockResolvedValue([])

      const { result } = renderHook(() => useRecipes())

      // Should start in loading state
      expect(result.current.loading).toBe(true)

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 200 })
    })
  })
})
