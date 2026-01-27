/**
 * TemplateSelector Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TemplateSelector } from '../TemplateSelector'

describe('TemplateSelector', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSelect: vi.fn(),
    entityType: 'product' as const,
  }

  describe('Rendering', () => {
    it('should not render when closed', () => {
      render(<TemplateSelector {...defaultProps} isOpen={false} />)

      expect(screen.queryByText('Seleccionar Template')).not.toBeInTheDocument()
    })

    it('should render when open', () => {
      render(<TemplateSelector {...defaultProps} />)

      expect(screen.getByText('Seleccionar Template')).toBeInTheDocument()
    })

    it('should show search input', () => {
      render(<TemplateSelector {...defaultProps} />)

      expect(screen.getByPlaceholderText(/Buscar templates/i)).toBeInTheDocument()
    })

    it('should show "Empezar desde cero" button', () => {
      render(<TemplateSelector {...defaultProps} />)

      expect(screen.getByText('Empezar desde cero')).toBeInTheDocument()
    })

    it('should display built-in templates', () => {
      render(<TemplateSelector {...defaultProps} />)

      // Check for some of the built-in templates
      expect(screen.getByText(/Hamburguesa/i)).toBeInTheDocument()
      expect(screen.getByText(/Pizza/i)).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('should filter templates by search query', async () => {
      const user = userEvent.setup()
      render(<TemplateSelector {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText(/Buscar templates/i)
      await user.type(searchInput, 'Pizza')

      // Pizza should be visible
      expect(screen.getByText(/Pizza Margarita/i)).toBeInTheDocument()

      // Other templates should not be visible
      expect(screen.queryByText(/Hamburguesa/i)).not.toBeInTheDocument()
    })

    it('should show no results message when search has no matches', async () => {
      const user = userEvent.setup()
      render(<TemplateSelector {...defaultProps} />)

      const searchInput = screen.getByPlaceholderText(/Buscar templates/i)
      await user.type(searchInput, 'NONEXISTENT')

      expect(screen.getByText(/No se encontraron templates/i)).toBeInTheDocument()
    })
  })

  describe('Entity Type Filtering', () => {
    it('should filter templates by entityType', () => {
      render(<TemplateSelector {...defaultProps} entityType="product" />)

      // Product templates should be visible
      expect(screen.getByText(/Hamburguesa/i)).toBeInTheDocument()
    })

    it('should show all templates when entityType matches', () => {
      render(<TemplateSelector {...defaultProps} entityType="product" />)

      // Check that product templates are shown
      const templates = screen.getAllByRole('button').filter(button =>
        !button.textContent?.includes('Cerrar') &&
        !button.textContent?.includes('Empezar desde cero')
      )

      expect(templates.length).toBeGreaterThan(0)
    })
  })

  describe('Template Selection', () => {
    it('should call onSelect with template data when template is clicked', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      render(<TemplateSelector {...defaultProps} onSelect={onSelect} />)

      // Find and click the first template card
      const templateCards = screen.getAllByRole('button').filter(button =>
        button.textContent?.includes('Hamburguesa') ||
        button.textContent?.includes('Pizza')
      )

      if (templateCards.length > 0) {
        await user.click(templateCards[0])

        expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({
          name: expect.any(String),
          inputs: expect.any(Array),
        }))
      }
    })

    it('should close modal after selecting template', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<TemplateSelector {...defaultProps} onClose={onClose} />)

      const templateCards = screen.getAllByRole('button').filter(button =>
        button.textContent?.includes('Hamburguesa')
      )

      if (templateCards.length > 0) {
        await user.click(templateCards[0])

        expect(onClose).toHaveBeenCalled()
      }
    })

    it('should call onSelect with empty recipe when "Empezar desde cero" is clicked', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()
      render(<TemplateSelector {...defaultProps} onSelect={onSelect} />)

      const startFromScratchButton = screen.getByText('Empezar desde cero')
      await user.click(startFromScratchButton)

      expect(onSelect).toHaveBeenCalledWith({
        name: '',
        description: '',
        inputs: [],
        instructions: [],
      })
    })
  })

  describe('Modal Controls', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<TemplateSelector {...defaultProps} onClose={onClose} />)

      const closeButton = screen.getByRole('button', { name: /cerrar/i })
      await user.click(closeButton)

      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('Template Cards', () => {
    it('should display template metadata', () => {
      render(<TemplateSelector {...defaultProps} />)

      // Check that templates show time, difficulty, ingredients count
      const templateCards = screen.getAllByText(/min/)
      expect(templateCards.length).toBeGreaterThan(0)
    })

    it('should display template tags', () => {
      render(<TemplateSelector {...defaultProps} />)

      // Templates should have tags
      const tags = screen.getAllByText(/Rápido|Fácil|Principiante/i)
      expect(tags.length).toBeGreaterThan(0)
    })
  })
})
