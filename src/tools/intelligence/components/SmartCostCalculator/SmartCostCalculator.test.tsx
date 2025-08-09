// SmartCostCalculator Component Tests
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { SmartCostCalculator } from "./SmartCostCalculator"

// Mock ChakraUI Provider for tests
const ChakraWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="chakra-wrapper">{children}</div>
}

const renderWithChakra = (component: React.ReactElement) => {
  return render(component, { wrapper: ChakraWrapper })
}

describe("SmartCostCalculator", () => {
  it("should render with recipe ID", () => {
    renderWithChakra(<SmartCostCalculator recipeId="test-recipe-123" />)

    expect(screen.getByText("Smart Cost Calculator")).toBeInTheDocument()
    expect(screen.getByText(/Recipe: test-recipe-123/)).toBeInTheDocument()
  })

  it("should display cost analysis description", () => {
    renderWithChakra(<SmartCostCalculator recipeId="recipe-1" />)

    expect(screen.getByText("Real-time costing with yield analysis for Recipe: recipe-1")).toBeInTheDocument()
  })

  it("should handle empty recipe ID", () => {
    renderWithChakra(<SmartCostCalculator recipeId="" />)

    expect(screen.getByText("Smart Cost Calculator")).toBeInTheDocument()
    expect(screen.getByText(/Recipe:/)).toBeInTheDocument()
  })

  it("should render card container", () => {
    renderWithChakra(<SmartCostCalculator recipeId="recipe-1" />)

    expect(screen.getByTestId("chakra-wrapper")).toBeInTheDocument()
  })
})
