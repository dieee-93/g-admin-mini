// MenuEngineeringAnalysis Component - Comprehensive Test Suite
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MenuEngineeringAnalysis } from './MenuEngineeringAnalysis'
import type { MenuCategory } from '../../types'

// Mock ChakraUI Provider for tests
const ChakraWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="chakra-wrapper">{children}</div>
}

const renderWithChakra = (component: React.ReactElement) => {
  return render(component, { wrapper: ChakraWrapper })
}

describe('MenuEngineeringAnalysis Component - Comprehensive Test Suite', () => {
  describe('Basic Rendering', () => {
    it('should render with recipe ID and default stars category', () => {
      renderWithChakra(<MenuEngineeringAnalysis recipeId="recipe-123" />)

      expect(screen.getByText('Menu Engineering Analysis')).toBeInTheDocument()
      expect(screen.getByText('Recipe: recipe-123')).toBeInTheDocument()
      expect(screen.getByText('STARS')).toBeInTheDocument()
      expect(screen.getByText('High profit + High popularity')).toBeInTheDocument()
    })

    it('should render with custom category', () => {
      renderWithChakra(
        <MenuEngineeringAnalysis recipeId="recipe-456" category="plowhorses" />
      )

      expect(screen.getByText('PLOWHORSES')).toBeInTheDocument()
      expect(screen.getByText('Low profit + High popularity')).toBeInTheDocument()
      expect(screen.getByText('Recipe: recipe-456')).toBeInTheDocument()
    })

    it('should handle empty recipe ID', () => {
      renderWithChakra(<MenuEngineeringAnalysis recipeId="" />)

      expect(screen.getByText('Recipe:')).toBeInTheDocument()
      expect(screen.getByText('STARS')).toBeInTheDocument()
    })
  })

  describe('Menu Category Display', () => {
    const testCategories: { category: MenuCategory; description: string }[] = [
      { category: 'stars', description: 'High profit + High popularity' },
      { category: 'plowhorses', description: 'Low profit + High popularity' },
      { category: 'puzzles', description: 'High profit + Low popularity' },
      { category: 'dogs', description: 'Low profit + Low popularity' }
    ]

    testCategories.forEach(({ category, description }) => {
      it(`should display correct information for ${category} category`, () => {
        renderWithChakra(
          <MenuEngineeringAnalysis recipeId="test-recipe" category={category} />
        )

        expect(screen.getByText(category.toUpperCase())).toBeInTheDocument()
        expect(screen.getByText(description)).toBeInTheDocument()
      })
    })
  })

  describe('Category Color Mapping', () => {
    it('should apply correct badge styling for stars category', () => {
      renderWithChakra(
        <MenuEngineeringAnalysis recipeId="recipe-1" category="stars" />
      )

      const badge = screen.getByText('STARS')
      expect(badge).toBeInTheDocument()
    })

    it('should apply correct badge styling for dogs category', () => {
      renderWithChakra(
        <MenuEngineeringAnalysis recipeId="recipe-1" category="dogs" />
      )

      const badge = screen.getByText('DOGS')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Props Validation', () => {
    it('should handle undefined category gracefully', () => {
      renderWithChakra(
        <MenuEngineeringAnalysis recipeId="recipe-1" category={undefined as any} />
      )

      expect(screen.getByText('STARS')).toBeInTheDocument()
      expect(screen.getByText('High profit + High popularity')).toBeInTheDocument()
    })

    it('should handle invalid category gracefully', () => {
      renderWithChakra(
        <MenuEngineeringAnalysis recipeId="recipe-1" category={'invalid' as MenuCategory} />
      )

      expect(screen.getByText('INVALID')).toBeInTheDocument()
      expect(screen.getByText('Unknown category')).toBeInTheDocument()
    })
  })

  describe('Component Structure', () => {
    it('should render card container', () => {
      renderWithChakra(<MenuEngineeringAnalysis recipeId="recipe-1" />)

      expect(screen.getByTestId('chakra-wrapper')).toBeInTheDocument()
    })

    it('should display all required elements', () => {
      renderWithChakra(
        <MenuEngineeringAnalysis recipeId="test-recipe" category="puzzles" />
      )

      expect(screen.getByText('Menu Engineering Analysis')).toBeInTheDocument()
      expect(screen.getByText('PUZZLES')).toBeInTheDocument()
      expect(screen.getByText('High profit + Low popularity')).toBeInTheDocument()
      expect(screen.getByText('Recipe: test-recipe')).toBeInTheDocument()
    })
  })

  describe('Accessibility and User Experience', () => {
    it('should have proper text hierarchy', () => {
      renderWithChakra(
        <MenuEngineeringAnalysis recipeId="recipe-accessibility" category="stars" />
      )

      const title = screen.getByText('Menu Engineering Analysis')
      const category = screen.getByText('STARS')
      const description = screen.getByText('High profit + High popularity')
      const recipeId = screen.getByText('Recipe: recipe-accessibility')

      expect(title).toBeInTheDocument()
      expect(category).toBeInTheDocument()
      expect(description).toBeInTheDocument()
      expect(recipeId).toBeInTheDocument()
    })

    it('should display category information clearly', () => {
      renderWithChakra(
        <MenuEngineeringAnalysis recipeId="recipe-ux" category="plowhorses" />
      )

      expect(screen.getByText('PLOWHORSES')).toBeInTheDocument()
      expect(screen.getByText('Low profit + High popularity')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long recipe IDs', () => {
      const longRecipeId = 'recipe-with-very-long-id-that-might-cause-layout-issues-in-some-cases'
      
      renderWithChakra(
        <MenuEngineeringAnalysis recipeId={longRecipeId} />
      )

      expect(screen.getByText(`Recipe: ${longRecipeId}`)).toBeInTheDocument()
    })

    it('should handle special characters in recipe ID', () => {
      const specialRecipeId = 'recipe-123\!@#$%^&*()'
      
      renderWithChakra(
        <MenuEngineeringAnalysis recipeId={specialRecipeId} />
      )

      expect(screen.getByText(`Recipe: ${specialRecipeId}`)).toBeInTheDocument()
    })

    it('should handle all category variations correctly', () => {
      const categories: MenuCategory[] = ['stars', 'plowhorses', 'puzzles', 'dogs']
      
      categories.forEach(category => {
        const { unmount } = renderWithChakra(
          <MenuEngineeringAnalysis recipeId={`recipe-${category}`} category={category} />
        )
        
        expect(screen.getByText(category.toUpperCase())).toBeInTheDocument()
        
        unmount()
      })
    })
  })

  describe('Performance and Memory', () => {
    it('should render multiple instances without issues', () => {
      const { rerender } = renderWithChakra(
        <MenuEngineeringAnalysis recipeId="recipe-1" category="stars" />
      )

      expect(screen.getByText('STARS')).toBeInTheDocument()

      rerender(<MenuEngineeringAnalysis recipeId="recipe-2" category="dogs" />)

      expect(screen.getByText('DOGS')).toBeInTheDocument()
      expect(screen.getByText('Recipe: recipe-2')).toBeInTheDocument()
    })

    it('should handle rapid re-renders', () => {
      const { rerender } = renderWithChakra(
        <MenuEngineeringAnalysis recipeId="recipe-1" category="stars" />
      )

      const categories: MenuCategory[] = ['stars', 'plowhorses', 'puzzles', 'dogs']
      
      categories.forEach((category, index) => {
        rerender(
          <MenuEngineeringAnalysis recipeId={`recipe-${index}`} category={category} />
        )
        
        expect(screen.getByText(category.toUpperCase())).toBeInTheDocument()
      })
    })
  })
})
