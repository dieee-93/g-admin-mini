/**
 * Recipe Module - Test Setup
 *
 * Tests básicos para verificar que el módulo está correctamente configurado
 */

import { describe, it, expect } from 'vitest'
import recipeManifest from '../manifest'
import type { Recipe, RecipeEntityType, RecipeExecutionMode } from '../types'

describe('Recipe Module Setup', () => {
  describe('Manifest', () => {
    it('should have correct module metadata', () => {
      expect(recipeManifest.id).toBe('recipe')
      expect(recipeManifest.name).toBe('Recipe Management')
      expect(recipeManifest.domain).toBe('SUPPLY_CHAIN')
      expect(recipeManifest.category).toBe('core')
    })

    it('should provide expected hook points', () => {
      expect(recipeManifest.provide).toContain('recipe.builder')
      expect(recipeManifest.provide).toContain('recipe.cost_calculation')
      expect(recipeManifest.provide).toContain('recipe.analytics')
    })

    it('should consume expected hook points', () => {
      expect(recipeManifest.consume).toContain('materials.stock_updated')
      expect(recipeManifest.consume).toContain('sales.order_completed')
    })

    it('should have required permissions', () => {
      const permissionIds = recipeManifest.permissions?.map(p => p.id) || []
      expect(permissionIds).toContain('recipe.view')
      expect(permissionIds).toContain('recipe.create')
      expect(permissionIds).toContain('recipe.edit')
      expect(permissionIds).toContain('recipe.execute')
    })

    it('should declare dependencies', () => {
      expect(recipeManifest.dependencies).toContain('materials')
      expect(recipeManifest.dependencies).toContain('products')
    })
  })

  describe('Types', () => {
    it('should allow creating a basic recipe object', () => {
      const recipe: Partial<Recipe> = {
        id: 'test-recipe-1',
        name: 'Pan Francés',
        entityType: 'material' as RecipeEntityType,
        executionMode: 'immediate' as RecipeExecutionMode,
        output: {
          item: 'material-123',
          quantity: 10,
          unit: 'units'
        },
        inputs: [
          {
            id: 'input-1',
            item: 'flour',
            quantity: 500,
            unit: 'g'
          },
          {
            id: 'input-2',
            item: 'water',
            quantity: 300,
            unit: 'ml'
          }
        ]
      }

      expect(recipe.id).toBe('test-recipe-1')
      expect(recipe.name).toBe('Pan Francés')
      expect(recipe.entityType).toBe('material')
      expect(recipe.executionMode).toBe('immediate')
      expect(recipe.inputs).toHaveLength(2)
    })

    it('should enforce entityType constraints', () => {
      const validEntityTypes: RecipeEntityType[] = ['material', 'product', 'kit', 'service']

      validEntityTypes.forEach(entityType => {
        const recipe: Partial<Recipe> = {
          entityType: entityType as RecipeEntityType,
          executionMode: entityType === 'material' ? 'immediate' : 'on_demand'
        }

        expect(recipe.entityType).toBe(entityType)
      })
    })

    it('should enforce executionMode constraints', () => {
      const validModes: RecipeExecutionMode[] = ['immediate', 'on_demand']

      validModes.forEach(mode => {
        const recipe: Partial<Recipe> = {
          executionMode: mode as RecipeExecutionMode
        }

        expect(recipe.executionMode).toBe(mode)
      })
    })
  })
})
