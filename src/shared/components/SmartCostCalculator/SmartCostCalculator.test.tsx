// SmartCostCalculator Component Tests
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { SmartCostCalculator } from "./SmartCostCalculator"
import { calculateRecipeCost } from "@/services/recipe/api/recipeApi"
import type { Recipe } from "@/services/recipe/types"

import { Provider } from '@/shared/ui/provider'
import { useThemeStore } from '@/store/themeStore'

vi.mock('@/store/themeStore')
vi.mock('@/services/recipe/api/recipeApi')

const renderWithChakra = (component: React.ReactElement) => {
  (useThemeStore as vi.Mock).mockReturnValue({
    currentTheme: { id: 'default', name: 'Default' },
  });
  return render(component, { wrapper: Provider })
}

describe("SmartCostCalculator", () => {
  const mockRecipe: Recipe = {
    id: "recipe-1",
    name: "Test Recipe",
    output_item_id: "item-1",
    output_quantity: 4,
  }

  beforeEach(() => {
    (calculateRecipeCost as vi.Mock).mockResolvedValue(10)
  })

  it("should render with a recipe", async () => {
    renderWithChakra(<SmartCostCalculator recipe={mockRecipe} />)
    await waitFor(() => {
      expect(screen.getByText("Smart Cost Calculator")).toBeInTheDocument()
    })
  })

  it("should display the calculated cost", async () => {
    renderWithChakra(<SmartCostCalculator recipe={mockRecipe} />)
    await waitFor(() => {
      expect(screen.getByText("$10.00")).toBeInTheDocument()
    })
  })

  it("should be disabled if no recipe is provided", () => {
    renderWithChakra(<SmartCostCalculator />)
    const calculateButton = screen.getByText("Calculate Cost").closest('button')
    expect(calculateButton).toBeDisabled()
  })
})
