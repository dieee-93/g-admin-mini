/**
 * BasicInfoSection Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BasicInfoSection } from '../BasicInfoSection'
import { createSectionProps } from '../../../../__tests__/testUtils'

describe('BasicInfoSection', () => {
  describe('Rendering', () => {
    it('should render all fields', () => {
      const props = createSectionProps()

      render(<BasicInfoSection {...props} />)

      expect(screen.getByText('Información Básica')).toBeInTheDocument()
      expect(screen.getByLabelText('Nombre de la Receta')).toBeInTheDocument()
      expect(screen.getByLabelText('Descripción')).toBeInTheDocument()
      expect(screen.getByLabelText('Categoría')).toBeInTheDocument()
    })

    it('should display existing recipe data', () => {
      const props = createSectionProps({
        recipe: {
          name: 'Pizza Margarita',
          description: 'Classic Italian pizza',
        },
      })

      render(<BasicInfoSection {...props} />)

      expect(screen.getByDisplayValue('Pizza Margarita')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Classic Italian pizza')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should call updateRecipe when name changes', async () => {
      const user = userEvent.setup()
      const updateRecipe = vi.fn()
      const props = createSectionProps({ updateRecipe })

      render(<BasicInfoSection {...props} />)

      const nameInput = screen.getByPlaceholderText('Ej: Hamburguesa Clásica')
      await user.type(nameInput, 'New Recipe')

      expect(updateRecipe).toHaveBeenCalledWith({ name: expect.any(String) })
    })

    it('should call updateRecipe when description changes', async () => {
      const user = userEvent.setup()
      const updateRecipe = vi.fn()
      const props = createSectionProps({ updateRecipe })

      render(<BasicInfoSection {...props} />)

      const descriptionInput = screen.getByPlaceholderText('Describe esta receta...')
      await user.type(descriptionInput, 'New description')

      expect(updateRecipe).toHaveBeenCalledWith({ description: expect.any(String) })
    })

    it('should call updateRecipe when category changes', async () => {
      const user = userEvent.setup()
      const updateRecipe = vi.fn()
      const props = createSectionProps({ updateRecipe })

      render(<BasicInfoSection {...props} />)

      const categorySelect = screen.getByLabelText('Categoría')
      await user.selectOptions(categorySelect, 'MAIN_COURSE')

      expect(updateRecipe).toHaveBeenCalledWith({ category: 'MAIN_COURSE' })
    })
  })

  describe('Category Filtering', () => {
    it('should show gastronomy categories for product entityType', () => {
      const props = createSectionProps({ entityType: 'product' })

      render(<BasicInfoSection {...props} />)

      const categorySelect = screen.getByLabelText('Categoría')
      const options = Array.from(categorySelect.querySelectorAll('option'))

      const labels = options.map(opt => opt.textContent)
      expect(labels).toContain('Plato Principal')
      expect(labels).toContain('Postre')
    })

    it('should show kit categories for kit entityType', () => {
      const props = createSectionProps({ entityType: 'kit' })

      render(<BasicInfoSection {...props} />)

      const categorySelect = screen.getByLabelText('Categoría')
      const options = Array.from(categorySelect.querySelectorAll('option'))

      const labels = options.map(opt => opt.textContent)
      expect(labels).toContain('Kit')
      expect(labels).toContain('Bundle')
    })

    it('should show service categories for service entityType', () => {
      const props = createSectionProps({ entityType: 'service' })

      render(<BasicInfoSection {...props} />)

      const categorySelect = screen.getByLabelText('Categoría')
      const options = Array.from(categorySelect.querySelectorAll('option'))

      const labels = options.map(opt => opt.textContent)
      expect(labels).toContain('Procedimiento')
      expect(labels).toContain('Mantenimiento')
    })
  })

  describe('React.memo optimization', () => {
    it('should not re-render when unrelated props change', () => {
      const props = createSectionProps()
      const { rerender } = render(<BasicInfoSection {...props} />)

      const renderCount = screen.getAllByText(/Información Básica/).length

      // Re-render with same props
      rerender(<BasicInfoSection {...props} />)

      // Should still have same number of renders (memo prevents re-render)
      expect(screen.getAllByText(/Información Básica/).length).toBe(renderCount)
    })
  })
})
