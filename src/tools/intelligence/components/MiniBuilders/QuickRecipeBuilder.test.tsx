// QuickRecipeBuilder Component Tests
import { describe, it, expect, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QuickRecipeBuilder } from "./QuickRecipeBuilder"

// Mock ChakraUI Provider for tests
const ChakraWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="chakra-wrapper">{children}</div>
}

const renderWithChakra = (component: React.ReactElement) => {
  return render(component, { wrapper: ChakraWrapper })
}

describe("QuickRecipeBuilder", () => {
  const mockOnRecipeCreated = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should render all form fields", () => {
    renderWithChakra(<QuickRecipeBuilder onRecipeCreated={mockOnRecipeCreated} />)

    expect(screen.getByText("Quick Recipe Builder")).toBeInTheDocument()
    expect(screen.getByText("Recipe Name")).toBeInTheDocument()
    expect(screen.getByText("Difficulty")).toBeInTheDocument()
    expect(screen.getByText("Category")).toBeInTheDocument()
    expect(screen.getByText(/Prep Time/)).toBeInTheDocument()
  })

  it("should handle recipe name input", async () => {
    const user = userEvent.setup()
    renderWithChakra(<QuickRecipeBuilder onRecipeCreated={mockOnRecipeCreated} />)

    const nameInput = screen.getByPlaceholderText("Enter recipe name...")
    await user.type(nameInput, "Test Recipe")

    expect(nameInput).toHaveValue("Test Recipe")
  })

  it("should enable create button when name is provided", async () => {
    const user = userEvent.setup()
    renderWithChakra(<QuickRecipeBuilder onRecipeCreated={mockOnRecipeCreated} />)

    const createButton = screen.getByText("Create Recipe with AI Intelligence")
    const nameInput = screen.getByPlaceholderText("Enter recipe name...")

    expect(createButton).toBeDisabled()

    await user.type(nameInput, "Test Recipe")

    expect(createButton).not.toBeDisabled()
  })

  it("should call onRecipeCreated when form is submitted", async () => {
    const user = userEvent.setup()
    renderWithChakra(<QuickRecipeBuilder onRecipeCreated={mockOnRecipeCreated} />)

    const nameInput = screen.getByPlaceholderText("Enter recipe name...")
    const createButton = screen.getByText("Create Recipe with AI Intelligence")

    await user.type(nameInput, "Test Recipe")
    await user.click(createButton)

    expect(mockOnRecipeCreated).toHaveBeenCalledWith({
      name: "Test Recipe",
      difficulty_level: "intermediate",
      recipe_category: "main_course",
      preparation_time: 30,
      ingredients: []
    })
  })

  it("should not call onRecipeCreated if not provided", async () => {
    const user = userEvent.setup()
    renderWithChakra(<QuickRecipeBuilder />)

    const nameInput = screen.getByPlaceholderText("Enter recipe name...")
    const createButton = screen.getByText("Create Recipe with AI Intelligence")

    await user.type(nameInput, "Test Recipe")
    await user.click(createButton)

    // Should not throw error and component should still be rendered
    expect(screen.getByText("Quick Recipe Builder")).toBeInTheDocument()
    expect(nameInput).toHaveValue("Test Recipe")
  })

  it("should handle form validation correctly", async () => {
    const user = userEvent.setup()
    renderWithChakra(<QuickRecipeBuilder onRecipeCreated={mockOnRecipeCreated} />)

    const createButton = screen.getByText("Create Recipe with AI Intelligence")
    
    // Button should be disabled initially
    expect(createButton).toBeDisabled()
    
    // Type a short name (should still be valid)
    const nameInput = screen.getByPlaceholderText("Enter recipe name...")
    await user.type(nameInput, "A")
    expect(createButton).not.toBeDisabled()
    
    // Clear the field
    await user.clear(nameInput)
    expect(createButton).toBeDisabled()
  })
})
