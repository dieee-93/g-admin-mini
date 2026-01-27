// RecipeIntelligenceDashboard Component Tests
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor, act } from "@testing-library/react"
import { RecipeIntelligenceDashboard } from "./RecipeIntelligenceDashboard"
import type { Recipe, RecipeWithCost } from "../../../../../../../modules/recipe/types"
import { fetchRecipesWithCosts } from "../../../../../../../modules/recipe/api/recipeApi"

import { Provider } from '../../../../../../shared/ui/provider'
import { useThemeStore } from '../../../../../../store/themeStore'

vi.mock('../../../../../../../store/themeStore')
vi.mock('../../../../../../../modules/recipe/api/recipeApi')

const renderWithChakra = (component: React.ReactElement) => {
  (useThemeStore as vi.Mock).mockReturnValue({
    currentTheme: { id: 'light', name: 'Light' },
  });
  return render(component, { wrapper: Provider })
}

describe("RecipeIntelligenceDashboard", () => {
  const mockRecipes: Recipe[] = [
    { id: "1", name: "Test Recipe 1", output_item_id: "item-1", output_quantity: 2 },
    { id: "2", name: "Test Recipe 2", output_item_id: "item-2", output_quantity: 4 }
  ]

  const mockRecipesWithCosts: RecipeWithCost[] = [
    { id: "1", name: "Test Recipe 1", total_cost: 10, cost_per_unit: 5, is_viable: true, ingredient_count: 2, output_item_id: "item-1", output_quantity: 2 },
    { id: "2", name: "Test Recipe 2", total_cost: 20, cost_per_unit: 5, is_viable: false, ingredient_count: 3, output_item_id: "item-2", output_quantity: 4 }
  ]

  beforeEach(() => {
    (fetchRecipesWithCosts as vi.Mock).mockResolvedValue(mockRecipesWithCosts)
  })

  it("should render dashboard title", async () => {
    await act(async () => {
      renderWithChakra(<RecipeIntelligenceDashboard recipes={mockRecipes} />);
    });
    expect(screen.getByText("Recipe Intelligence Dashboard v3.0")).toBeInTheDocument()
  })

  it("should display correct recipe count", async () => {
    await act(async () => {
      renderWithChakra(<RecipeIntelligenceDashboard recipes={mockRecipes} />);
    });
    expect(screen.getByText("2")).toBeInTheDocument()
    expect(screen.getByText("Total Recipes")).toBeInTheDocument()
  })

  it("should display profitability metric", async () => {
    await act(async () => {
      renderWithChakra(<RecipeIntelligenceDashboard recipes={mockRecipes} />);
    });
    await waitFor(() => {
      expect(screen.getByText("60%")).toBeInTheDocument()
    });
    expect(screen.getByText("Avg Profitability")).toBeInTheDocument()
  })

  it("should handle empty recipes array", async () => {
    await act(async () => {
      renderWithChakra(<RecipeIntelligenceDashboard recipes={[]} />);
    });
    expect(screen.getByText("0")).toBeInTheDocument()
    expect(screen.getByText("Total Recipes")).toBeInTheDocument()
  })
})
