// Enhanced RecipesModule Component Tests
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import RecipesModule from "./index"

// Mock child components
vi.mock("./ui/RecipeForm", () => ({
  RecipeForm: () => <div data-testid="recipe-form">Recipe Form</div>
}))

vi.mock("./ui/RecipeList", () => ({
  RecipeList: () => <div data-testid="recipe-list">Recipe List</div>
}))

vi.mock("./components/RecipeIntelligenceDashboard/RecipeIntelligenceDashboard", () => ({
  RecipeIntelligenceDashboard: ({ recipes }) => (
    <div data-testid="intelligence-dashboard">
      Intelligence Dashboard - {recipes.length} recipes
    </div>
  )
}))

vi.mock("./components/MiniBuilders/QuickRecipeBuilder", () => ({
  QuickRecipeBuilder: ({ onRecipeCreated }) => (
    <div data-testid="quick-builder">Quick Recipe Builder</div>
  )
}))

// Mock useRecipes hook
const mockUseRecipes = {
  recipes: [
    { id: "recipe-1", name: "Test Recipe 1", output_item_id: "item-1", output_quantity: 2 },
    { id: "recipe-2", name: "Test Recipe 2", output_item_id: "item-2", output_quantity: 1 }
  ],
  loading: false
}

vi.mock("./logic/useRecipes", () => ({
  useRecipes: () => mockUseRecipes
}))

// Mock Chakra UI components
vi.mock("@chakra-ui/react", () => ({
  Box: ({ children, ...props }) => <div {...props}>{children}</div>,
  VStack: ({ children, ...props }) => <div {...props}>{children}</div>,
  HStack: ({ children, ...props }) => <div {...props}>{children}</div>,
  Button: ({ children, onClick, variant, ...props }) => (
    <button onClick={onClick} data-variant={variant} {...props}>
      {children}
    </button>
  ),
  Text: ({ children, ...props }) => <span {...props}>{children}</span>,
  Badge: ({ children, ...props }) => <span data-testid="badge" {...props}>{children}</span>
}))

describe("RecipesModule Component", () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Initial Rendering", () => {
    it("should render with default intelligence view", () => {
      render(<RecipesModule />)

      expect(screen.getByText("G-Admin Recipe Intelligence System")).toBeInTheDocument()
      expect(screen.getByTestId("intelligence-dashboard")).toBeInTheDocument()
    })

    it("should render with custom initial view", () => {
      render(<RecipesModule currentView="builder" />)

      expect(screen.getByTestId("quick-builder")).toBeInTheDocument()
    })
  })

  describe("View Navigation", () => {
    it("should switch to builder view", async () => {
      render(<RecipesModule />)

      const builderButton = screen.getByRole("button", { name: /Quick Builder/ })
      await user.click(builderButton)

      expect(screen.getByTestId("quick-builder")).toBeInTheDocument()
    })

    it("should switch to classic view", async () => {
      render(<RecipesModule />)

      const classicButton = screen.getByRole("button", { name: /Classic View/ })
      await user.click(classicButton)

      expect(screen.getByTestId("recipe-form")).toBeInTheDocument()
      expect(screen.getByTestId("recipe-list")).toBeInTheDocument()
    })
  })

  describe("Feature Display", () => {
    it("should display intelligence features", () => {
      render(<RecipesModule />)

      expect(screen.getByText("Recipe Intelligence Features")).toBeInTheDocument()
      expect(screen.getByText("✓ Real-time Cost Calculation")).toBeInTheDocument()
      expect(screen.getByText("✓ Menu Engineering Matrix")).toBeInTheDocument()
    })
  })
})
