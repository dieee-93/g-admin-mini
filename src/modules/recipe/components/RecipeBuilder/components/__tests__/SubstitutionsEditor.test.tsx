/**
 * SubstitutionsEditor Component Tests
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SubstitutionsEditor } from '../SubstitutionsEditor'
import { createMockRecipeInput } from '../../../../__tests__/testUtils'

describe('SubstitutionsEditor', () => {
  const defaultProps = {
    inputs: [
      createMockRecipeInput({ id: '1', item: 'Leche', quantity: 200, unit: 'ml' }),
      createMockRecipeInput({ id: '2', item: 'Harina', quantity: 500, unit: 'g' }),
    ],
    onUpdate: vi.fn(),
  }

  describe('Rendering', () => {
    it('should render with inputs', () => {
      render(<SubstitutionsEditor {...defaultProps} />)

      expect(screen.getByText('Sustituciones de Ingredientes')).toBeInTheDocument()
    })

    it('should show message when no inputs', () => {
      render(<SubstitutionsEditor {...defaultProps} inputs={[]} />)

      expect(screen.getByText(/No hay ingredientes/i)).toBeInTheDocument()
    })

    it('should display all inputs for substitution', () => {
      render(<SubstitutionsEditor {...defaultProps} />)

      expect(screen.getByText(/Leche/)).toBeInTheDocument()
      expect(screen.getByText(/Harina/)).toBeInTheDocument()
    })
  })

  describe('Adding Substitutions', () => {
    it('should show add button for each input', () => {
      render(<SubstitutionsEditor {...defaultProps} />)

      const addButtons = screen.getAllByText(/Agregar sustituto/i)
      expect(addButtons.length).toBe(2) // One for each input
    })

    it('should add substitution row when button is clicked', async () => {
      const user = userEvent.setup()
      render(<SubstitutionsEditor {...defaultProps} />)

      const addButtons = screen.getAllByText(/Agregar sustituto/i)
      await user.click(addButtons[0])

      // Should show substitution input fields
      expect(screen.getByPlaceholderText(/Nombre del sustituto/i)).toBeInTheDocument()
    })
  })

  describe('Editing Substitutions', () => {
    it('should allow editing substitution name', async () => {
      const user = userEvent.setup()
      render(<SubstitutionsEditor {...defaultProps} />)

      // Add a substitution first
      const addButtons = screen.getAllByText(/Agregar sustituto/i)
      await user.click(addButtons[0])

      const nameInput = screen.getByPlaceholderText(/Nombre del sustituto/i)
      await user.type(nameInput, 'Leche de Almendras')

      expect(nameInput).toHaveValue('Leche de Almendras')
    })

    it('should allow editing ratio', async () => {
      const user = userEvent.setup()
      render(<SubstitutionsEditor {...defaultProps} />)

      // Add a substitution first
      const addButtons = screen.getAllByText(/Agregar sustituto/i)
      await user.click(addButtons[0])

      const ratioInput = screen.getByPlaceholderText('1.0')
      await user.clear(ratioInput)
      await user.type(ratioInput, '1.2')

      expect(ratioInput).toHaveValue(1.2)
    })

    it('should enforce ratio min/max', async () => {
      const user = userEvent.setup()
      render(<SubstitutionsEditor {...defaultProps} />)

      // Add a substitution first
      const addButtons = screen.getAllByText(/Agregar sustituto/i)
      await user.click(addButtons[0])

      const ratioInput = screen.getByPlaceholderText('1.0')

      // Check min/max attributes
      expect(ratioInput).toHaveAttribute('min', '0.1')
      expect(ratioInput).toHaveAttribute('max', '10')
    })

    it('should allow editing notes', async () => {
      const user = userEvent.setup()
      render(<SubstitutionsEditor {...defaultProps} />)

      // Add a substitution first
      const addButtons = screen.getAllByText(/Agregar sustituto/i)
      await user.click(addButtons[0])

      const notesInput = screen.getByPlaceholderText(/Notas opcionales/i)
      await user.type(notesInput, 'Mismo volumen, sabor más suave')

      expect(notesInput).toHaveValue('Mismo volumen, sabor más suave')
    })
  })

  describe('Deleting Substitutions', () => {
    it('should show delete button for each substitution', async () => {
      const user = userEvent.setup()
      render(<SubstitutionsEditor {...defaultProps} />)

      // Add a substitution first
      const addButtons = screen.getAllByText(/Agregar sustituto/i)
      await user.click(addButtons[0])

      const deleteButton = screen.getByLabelText(/Eliminar sustitución/i)
      expect(deleteButton).toBeInTheDocument()
    })

    it('should remove substitution when delete button is clicked', async () => {
      const user = userEvent.setup()
      render(<SubstitutionsEditor {...defaultProps} />)

      // Add a substitution first
      const addButtons = screen.getAllByText(/Agregar sustituto/i)
      await user.click(addButtons[0])

      const nameInput = screen.getByPlaceholderText(/Nombre del sustituto/i)
      await user.type(nameInput, 'Test Substitute')

      // Delete it
      const deleteButton = screen.getByLabelText(/Eliminar sustitución/i)
      await user.click(deleteButton)

      // Should be removed
      expect(screen.queryByDisplayValue('Test Substitute')).not.toBeInTheDocument()
    })
  })

  describe('Multiple Substitutions', () => {
    it('should allow multiple substitutions for one ingredient', async () => {
      const user = userEvent.setup()
      render(<SubstitutionsEditor {...defaultProps} />)

      const addButtons = screen.getAllByText(/Agregar sustituto/i)

      // Add first substitution
      await user.click(addButtons[0])
      const nameInputs1 = screen.getAllByPlaceholderText(/Nombre del sustituto/i)
      await user.type(nameInputs1[0], 'Leche de Almendras')

      // Add second substitution
      await user.click(addButtons[0])
      const nameInputs2 = screen.getAllByPlaceholderText(/Nombre del sustituto/i)
      await user.type(nameInputs2[1], 'Leche de Coco')

      expect(screen.getByDisplayValue('Leche de Almendras')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Leche de Coco')).toBeInTheDocument()
    })
  })

  describe('onUpdate Callback', () => {
    it('should call onUpdate when substitution is added', async () => {
      const user = userEvent.setup()
      const onUpdate = vi.fn()
      render(<SubstitutionsEditor {...defaultProps} onUpdate={onUpdate} />)

      const addButtons = screen.getAllByText(/Agregar sustituto/i)
      await user.click(addButtons[0])

      // Should be called when substitution is added
      expect(onUpdate).toHaveBeenCalled()
    })

    it('should call onUpdate when substitution is modified', async () => {
      const user = userEvent.setup()
      const onUpdate = vi.fn()
      render(<SubstitutionsEditor {...defaultProps} onUpdate={onUpdate} />)

      // Add substitution
      const addButtons = screen.getAllByText(/Agregar sustituto/i)
      await user.click(addButtons[0])

      onUpdate.mockClear()

      // Modify it
      const nameInput = screen.getByPlaceholderText(/Nombre del sustituto/i)
      await user.type(nameInput, 'A')

      expect(onUpdate).toHaveBeenCalled()
    })

    it('should call onUpdate when substitution is deleted', async () => {
      const user = userEvent.setup()
      const onUpdate = vi.fn()
      render(<SubstitutionsEditor {...defaultProps} onUpdate={onUpdate} />)

      // Add substitution
      const addButtons = screen.getAllByText(/Agregar sustituto/i)
      await user.click(addButtons[0])

      onUpdate.mockClear()

      // Delete it
      const deleteButton = screen.getByLabelText(/Eliminar sustitución/i)
      await user.click(deleteButton)

      expect(onUpdate).toHaveBeenCalled()
    })
  })
})
