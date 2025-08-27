// RecipeIntelligenceDashboard Component Tests
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { RecipeIntelligenceDashboard } from "./RecipeIntelligenceDashboard"
import type { Recipe } from "../../types"

// Mock ChakraUI Provider for tests
const ChakraWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="chakra-wrapper">{children}</div>
}

const renderWithChakra = (component: React.ReactElement) => {
  return render(component, { wrapper: ChakraWrapper })
}

describe("RecipeIntelligenceDashboard", () => {
  const mockRecipes: Recipe[] = [
    {
      id: "1",
      name: "Test Recipe 1",
      output_item_id: "item-1",
      output_quantity: 2
    },
    {
      id: "2",
      name: "Test Recipe 2",
      output_item_id: "item-2",
      output_quantity: 4
    }
  ]

  it("should render dashboard title", () => {
    renderWithChakra(<RecipeIntelligenceDashboard recipes={mockRecipes} />)

    expect(screen.getByText("Recipe Intelligence System v3.0")).toBeInTheDocument()
    expect(screen.getByText("Smart Cost + Menu Engineering + Production Intelligence")).toBeInTheDocument()
  })

  it("should display correct recipe count", () => {
    renderWithChakra(<RecipeIntelligenceDashboard recipes={mockRecipes} />)

    expect(screen.getByText("2")).toBeInTheDocument()
    expect(screen.getByText("Total Recipes")).toBeInTheDocument()
  })

  it("should display profitability metric", () => {
    renderWithChakra(<RecipeIntelligenceDashboard recipes={mockRecipes} />)

    expect(screen.getByText("85%")).toBeInTheDocument()
    expect(screen.getByText("Profitability")).toBeInTheDocument()
  })

  it("should display description", () => {
    renderWithChakra(<RecipeIntelligenceDashboard recipes={mockRecipes} />)

    expect(screen.getByText("Enhanced recipe management with real-time costing, yield analysis, and menu engineering")).toBeInTheDocument()
  })

  it("should handle empty recipes array", () => {
    renderWithChakra(<RecipeIntelligenceDashboard recipes={[]} />)

    expect(screen.getByText("0")).toBeInTheDocument()
    expect(screen.getByText("Total Recipes")).toBeInTheDocument()
  })

  it("should handle large number of recipes", () => {
    const manyRecipes = Array.from({ length: 150 }, (_, i) => ({
      id: `recipe-${i}`,
      name: `Recipe ${i}`,
      output_item_id: `item-${i}`,
      output_quantity: 1
    }))

    renderWithChakra(<RecipeIntelligenceDashboard recipes={manyRecipes} />)

    expect(screen.getByText("150")).toBeInTheDocument()
  })
})
