/**
 * InputsEditorSection Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InputsEditorSection } from '../InputsEditorSection'
import { createSectionProps, createMockRecipeInput } from '../../../../__tests__/testUtils'

describe('InputsEditorSection', () => {
  describe('Rendering', () => {
    it('should render with no inputs', () => {
      const props = createSectionProps({ recipe: { inputs: [] } })

      render(<InputsEditorSection {...props} />)

      expect(screen.getByText('Ingredientes / Componentes')).toBeInTheDocument()
      expect(screen.getByText(/No hay ingredientes agregados/)).toBeInTheDocument()
    })

    it('should render list of inputs', () => {
      const inputs = [
        createMockRecipeInput({ id: '1', item: 'Harina', quantity: 500, unit: 'g' }),
        createMockRecipeInput({ id: '2', item: 'Agua', quantity: 300, unit: 'ml' }),
      ]

      const props = createSectionProps({ recipe: { inputs } })

      render(<InputsEditorSection {...props} />)

      expect(screen.getByDisplayValue('Harina')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Agua')).toBeInTheDocument()
    })

    it('should show add button', () => {
      const props = createSectionProps()

      render(<InputsEditorSection {...props} />)

      expect(screen.getByText('Agregar Ingrediente')).toBeInTheDocument()
    })
  })

  describe('Adding Inputs', () => {
    it('should call updateRecipe when add button is clicked', async () => {
      const user = userEvent.setup()
      const updateRecipe = vi.fn()
      const props = createSectionProps({ updateRecipe, recipe: { inputs: [] } })

      render(<InputsEditorSection {...props} />)

      const addButton = screen.getByText('Agregar Ingrediente')
      await user.click(addButton)

      expect(updateRecipe).toHaveBeenCalledWith({
        inputs: expect.arrayContaining([
          expect.objectContaining({
            quantity: 1,
            unit: 'unit',
          }),
        ]),
      })
    })
  })

  describe('Editing Inputs', () => {
    it('should update input name', async () => {
      const user = userEvent.setup()
      const updateRecipe = vi.fn()
      const inputs = [createMockRecipeInput({ id: '1', item: 'Harina' })]
      const props = createSectionProps({ updateRecipe, recipe: { inputs } })

      render(<InputsEditorSection {...props} />)

      const nameInput = screen.getByDisplayValue('Harina')
      await user.clear(nameInput)
      await user.type(nameInput, 'Azúcar')

      expect(updateRecipe).toHaveBeenCalled()
    })

    it('should update input quantity', async () => {
      const user = userEvent.setup()
      const updateRecipe = vi.fn()
      const inputs = [createMockRecipeInput({ id: '1', quantity: 100 })]
      const props = createSectionProps({ updateRecipe, recipe: { inputs } })

      render(<InputsEditorSection {...props} />)

      const quantityInput = screen.getByDisplayValue('100')
      await user.clear(quantityInput)
      await user.type(quantityInput, '200')

      expect(updateRecipe).toHaveBeenCalled()
    })
  })

  describe('Deleting Inputs', () => {
    it('should remove input when delete button is clicked', async () => {
      const user = userEvent.setup()
      const updateRecipe = vi.fn()
      const inputs = [
        createMockRecipeInput({ id: '1', item: 'Harina' }),
        createMockRecipeInput({ id: '2', item: 'Agua' }),
      ]
      const props = createSectionProps({ updateRecipe, recipe: { inputs } })

      render(<InputsEditorSection {...props} />)

      const deleteButtons = screen.getAllByLabelText('Eliminar ingrediente')
      await user.click(deleteButtons[0])

      expect(updateRecipe).toHaveBeenCalledWith({
        inputs: expect.arrayContaining([
          expect.objectContaining({ item: 'Agua' }),
        ]),
      })
    })
  })

  describe('Entity Type Descriptions', () => {
    it('should show correct description for material entityType', () => {
      const props = createSectionProps({ entityType: 'material' })

      render(<InputsEditorSection {...props} />)

      expect(screen.getByText(/solo materials permitidos/)).toBeInTheDocument()
    })

    it('should show correct description for product entityType', () => {
      const props = createSectionProps({ entityType: 'product' })

      render(<InputsEditorSection {...props} />)

      expect(screen.getByText(/materials y products permitidos/)).toBeInTheDocument()
    })

    it('should show correct description for kit entityType', () => {
      const props = createSectionProps({ entityType: 'kit' })

      render(<InputsEditorSection {...props} />)

      expect(screen.getByText(/solo products permitidos/)).toBeInTheDocument()
    })
  })

  describe('React.memo optimization', () => {
    it('should prevent unnecessary re-renders', () => {
      const props = createSectionProps()
      const { rerender } = render(<InputsEditorSection {...props} />)

      const initialRenderCount = screen.getAllByText(/Ingredientes/).length

      // Re-render with same props (memo should prevent re-render)
      rerender(<InputsEditorSection {...props} />)

      expect(screen.getAllByText(/Ingredientes/).length).toBe(initialRenderCount)
    })
  })
})
