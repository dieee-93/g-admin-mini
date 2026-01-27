/**
 * SubstitutionsEditor - Editor de sustituciones de ingredientes
 *
 * Permite definir ingredientes alternativos para cada input
 * Ej: "Usar leche de almendras en lugar de leche normal"
 */

import { useState } from 'react'
import {
  Stack,
  Button,
  IconButton,
  Input,
  Field,
  Table,
  Badge,
  Typography,
  Box,
  Flex
} from '@/shared/ui'
import { CardWrapper } from '@/shared/ui'
import { PlusIcon, TrashIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline'
import type { RecipeInput } from '../../../types/recipe'

// ============================================
// TYPES
// ============================================

interface SubstitutionsEditorProps {
  inputs: RecipeInput[]
  onUpdate: (inputId: string, substitutions: Substitution[]) => void
}

interface Substitution {
  id: string
  originalInputId: string
  substituteItemId: string
  substituteItemName: string
  ratio: number  // Ej: 1.2 significa usar 20% más del sustituto
  notes?: string
}

// ============================================
// SUBSTITUTION ROW
// ============================================

interface SubstitutionRowProps {
  substitution: Substitution
  onUpdate: (updates: Partial<Substitution>) => void
  onDelete: () => void
}

function SubstitutionRow({ substitution, onUpdate, onDelete }: SubstitutionRowProps) {
  return (
    <Table.Row>
      <Table.Cell>
        <Flex align="center" gap="2">
          <ArrowsRightLeftIcon className="w-4 h-4 text-blue-500" />
          <Input
            placeholder="Nombre del sustituto"
            value={substitution.substituteItemName}
            onChange={(e) => onUpdate({ substituteItemName: e.target.value })}
            size="sm"
          />
        </Flex>
      </Table.Cell>

      <Table.Cell>
        <Input
          type="number"
          placeholder="1.0"
          value={substitution.ratio}
          onChange={(e) => onUpdate({ ratio: parseFloat(e.target.value) || 1 })}
          size="sm"
          min="0.1"
          max="10"
          step="0.1"
        />
      </Table.Cell>

      <Table.Cell>
        <Input
          placeholder="Notas opcionales..."
          value={substitution.notes ?? ''}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          size="sm"
        />
      </Table.Cell>

      <Table.Cell>
        <IconButton
          aria-label="Eliminar sustitución"
          size="sm"
          variant="ghost"
          colorPalette="red"
          onClick={onDelete}
        >
          <TrashIcon className="w-4 h-4" />
        </IconButton>
      </Table.Cell>
    </Table.Row>
  )
}

// ============================================
// INPUT SUBSTITUTIONS SECTION
// ============================================

interface InputSubstitutionsSectionProps {
  input: RecipeInput
  onUpdate: (substitutions: Substitution[]) => void
}

function InputSubstitutionsSection({ input, onUpdate }: InputSubstitutionsSectionProps) {
  const [substitutions, setSubstitutions] = useState<Substitution[]>([])

  const handleAddSubstitution = () => {
    const newSubstitution: Substitution = {
      id: `sub_${Date.now()}`,
      originalInputId: input.id,
      substituteItemId: '',
      substituteItemName: '',
      ratio: 1.0
    }

    const updated = [...substitutions, newSubstitution]
    setSubstitutions(updated)
    onUpdate(updated)
  }

  const handleUpdateSubstitution = (index: number, updates: Partial<Substitution>) => {
    const updated = [...substitutions]
    updated[index] = { ...updated[index], ...updates }
    setSubstitutions(updated)
    onUpdate(updated)
  }

  const handleDeleteSubstitution = (index: number) => {
    const updated = substitutions.filter((_, i) => i !== index)
    setSubstitutions(updated)
    onUpdate(updated)
  }

  return (
    <Box borderWidth="1px" borderRadius="md" p="4" bg="bg.subtle">
      <Stack gap="3">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Typography variant="label">
              {input.item || 'Ingrediente sin nombre'}
            </Typography>
            <Typography variant="caption" color="fg.muted">
              {input.quantity} {input.unit}
            </Typography>
          </Box>
          <Badge colorPalette="blue" size="sm">
            {substitutions.length} sustituto{substitutions.length !== 1 ? 's' : ''}
          </Badge>
        </Flex>

        {/* Substitutions Table */}
        {substitutions.length > 0 && (
          <Table.Root size="sm" variant="outline">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Sustituto</Table.ColumnHeader>
                <Table.ColumnHeader>Ratio</Table.ColumnHeader>
                <Table.ColumnHeader>Notas</Table.ColumnHeader>
                <Table.ColumnHeader w="50px"></Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {substitutions.map((sub, index) => (
                <SubstitutionRow
                  key={sub.id}
                  substitution={sub}
                  onUpdate={(updates) => handleUpdateSubstitution(index, updates)}
                  onDelete={() => handleDeleteSubstitution(index)}
                />
              ))}
            </Table.Body>
          </Table.Root>
        )}

        {/* Add Button */}
        <Button
          size="sm"
          variant="outline"
          onClick={handleAddSubstitution}
          colorPalette="blue"
        >
          <PlusIcon className="w-4 h-4" />
          Agregar Sustituto
        </Button>
      </Stack>
    </Box>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function SubstitutionsEditor({ inputs, onUpdate }: SubstitutionsEditorProps) {
  if (inputs.length === 0) {
    return (
      <CardWrapper>
        <CardWrapper.Header>
          <CardWrapper.Title>Sustituciones de Ingredientes</CardWrapper.Title>
          <CardWrapper.Description>Define ingredientes alternativos para cada ingrediente</CardWrapper.Description>
        </CardWrapper.Header>
        <CardWrapper.Body>
          <Stack gap="4">
            <Box p="6" textAlign="center" bg="bg.subtle" borderRadius="md">
              <Typography variant="body" color="fg.muted">
                Agrega ingredientes primero para poder definir sustituciones
              </Typography>
            </Box>
          </Stack>
        </CardWrapper.Body>
      </CardWrapper>
    )
  }

  return (
    <CardWrapper>
      <CardWrapper.Header>
        <CardWrapper.Title>Sustituciones de Ingredientes</CardWrapper.Title>
        <CardWrapper.Description>Define ingredientes alternativos y sus ratios de conversión</CardWrapper.Description>
      </CardWrapper.Header>
      <CardWrapper.Body>
        <Stack gap="4">
          {/* Info Box */}
          <Box p="3" bg="blue.50" borderRadius="md" borderWidth="1px" borderColor="blue.200">
            <Typography variant="caption" color="blue.700">
              <strong>💡 Tip:</strong> El ratio indica la cantidad del sustituto en relación al original.
              Por ejemplo, ratio 1.2 significa usar 20% más del sustituto.
            </Typography>
          </Box>

          {/* Substitutions for each input */}
          {inputs.map((input) => (
            <InputSubstitutionsSection
              key={input.id}
              input={input}
              onUpdate={(subs) => onUpdate(input.id, subs)}
            />
          ))}
        </Stack>
      </CardWrapper.Body>
    </CardWrapper>
  )
}
