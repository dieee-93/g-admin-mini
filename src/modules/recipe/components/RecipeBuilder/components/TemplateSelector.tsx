/**
 * TemplateSelector - UI para seleccionar templates de recetas
 *
 * Muestra templates built-in y permite crear receta desde template
 */

import { useState, useMemo } from 'react'
import {
  Stack,
  Input,
  Button,
  SimpleGrid,
  Badge,
  Text,
  Box,
  Flex,
  Card as UICard
} from '@/shared/ui'
import { Dialog } from '@/shared/ui'
import { BUILT_IN_TEMPLATES, searchTemplates } from '../../../services/builtInTemplates'
import type { BuiltInTemplate } from '../../../types/templates'
import type { Recipe } from '../../../types/recipe'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

// ============================================
// TYPES
// ============================================

interface TemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (recipeData: Partial<Recipe>) => void
  entityType: 'material' | 'product' | 'kit' | 'service'
}

// ============================================
// TEMPLATE CARD
// ============================================

interface TemplateCardProps {
  template: BuiltInTemplate
  onSelect: () => void
}

function TemplateCard({ template, onSelect }: TemplateCardProps) {
  return (
    <UICard.Root
      variant="outline"
      _hover={{ boxShadow: 'md', borderColor: 'blue.500', cursor: 'pointer' }}
      onClick={onSelect}
    >
      <UICard.Body>
        <Stack gap="3">
          {/* Header */}
          <Box>
            <Text fontWeight="bold" fontSize="lg">
              {template.name}
            </Text>
            {template.description && (
              <Text fontSize="sm" color="fg.muted" mt="1">
                {template.description}
              </Text>
            )}
          </Box>

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <Flex gap="2" flexWrap="wrap">
              {template.tags.map((tag, index) => (
                <Badge key={index} colorPalette="blue" size="sm">
                  {tag}
                </Badge>
              ))}
            </Flex>
          )}

          {/* Metadata */}
          <Flex gap="4" fontSize="sm" color="fg.muted">
            {template.recipeData.preparationTime && (
              <Text>⏱️ {template.recipeData.preparationTime + (template.recipeData.cookingTime ?? 0)} min</Text>
            )}
            {template.recipeData.difficulty && (
              <Text>📊 {template.recipeData.difficulty}</Text>
            )}
            {template.recipeData.inputs && (
              <Text>🥘 {template.recipeData.inputs.length} ingredientes</Text>
            )}
          </Flex>
        </Stack>
      </UICard.Body>
    </UICard.Root>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function TemplateSelector({ isOpen, onClose, onSelect, entityType }: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter templates by entity type and search query
  const filteredTemplates = useMemo(() => {
    let templates = BUILT_IN_TEMPLATES.filter(t => t.entityType === entityType)

    if (searchQuery.trim()) {
      templates = searchTemplates(searchQuery).filter(t => t.entityType === entityType)
    }

    return templates
  }, [searchQuery, entityType])

  // Handle template selection
  const handleSelectTemplate = (template: BuiltInTemplate) => {
    onSelect(template.recipeData)
    onClose()
  }

  // Handle start from scratch
  const handleStartFromScratch = () => {
    onClose()
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={() => onClose()} size="xl">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Seleccionar Template de Receta</Dialog.Title>
            <Dialog.CloseTrigger />
          </Dialog.Header>

          <Dialog.Body>
            <Stack gap="6">
              {/* Search */}
              <Flex gap="2" align="center">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Buscar templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  flex="1"
                />
              </Flex>

              {/* Templates Grid */}
              {filteredTemplates.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                  {filteredTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={() => handleSelectTemplate(template)}
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <Box p="8" textAlign="center" bg="bg.subtle" borderRadius="md">
                  <Text color="fg.muted">
                    No se encontraron templates{searchQuery ? ` para "${searchQuery}"` : ''}
                  </Text>
                </Box>
              )}

              {/* Start from scratch */}
              <Box pt="4" borderTopWidth="1px">
                <Button
                  variant="outline"
                  w="full"
                  onClick={handleStartFromScratch}
                >
                  Empezar desde cero (sin template)
                </Button>
              </Box>
            </Stack>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}
