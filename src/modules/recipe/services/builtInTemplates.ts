/**
 * Built-in Recipe Templates
 *
 * Templates pre-configurados para uso común
 */

import type { BuiltInTemplate } from '../types/templates'
import { DifficultyLevel, QualityGrade } from '../types/recipe'

// ============================================
// GASTRONOMÍA TEMPLATES
// ============================================

export const BUILT_IN_TEMPLATES: BuiltInTemplate[] = [
  // ===== HAMBURGUESA CLÁSICA =====
  {
    id: 'template_classic_burger',
    name: 'Hamburguesa Clásica',
    description: 'Hamburguesa tradicional con pan, carne, lechuga, tomate y queso',
    category: 'mains',
    entityType: 'product',
    tags: ['gastronomía', 'fast-food', 'popular'],
    recipeData: {
      name: 'Hamburguesa Clásica',
      difficulty: DifficultyLevel.BEGINNER,
      preparationTime: 10,
      cookingTime: 5,
      totalTime: 15,
      output: {
        quantity: 1,
        unit: 'unit',
        qualityGrade: QualityGrade.STANDARD,
        yieldPercentage: 100,
        wastePercentage: 5
      },
      inputs: [
        {
          id: 'input_bun',
          item: '',  // Usuario debe seleccionar
          quantity: 1,
          unit: 'unit',
          yieldPercentage: 100,
          displayOrder: 1
        },
        {
          id: 'input_patty',
          item: '',
          quantity: 150,
          unit: 'g',
          yieldPercentage: 95,
          wastePercentage: 5,
          displayOrder: 2
        },
        {
          id: 'input_cheese',
          item: '',
          quantity: 30,
          unit: 'g',
          displayOrder: 3
        },
        {
          id: 'input_lettuce',
          item: '',
          quantity: 20,
          unit: 'g',
          wastePercentage: 10,
          displayOrder: 4
        },
        {
          id: 'input_tomato',
          item: '',
          quantity: 30,
          unit: 'g',
          wastePercentage: 15,
          displayOrder: 5
        },
        {
          id: 'input_sauce',
          item: '',
          quantity: 15,
          unit: 'g',
          displayOrder: 6
        }
      ],
      instructions: [
        {
          step: 1,
          description: 'Tostar el pan en plancha o horno',
          duration: 2,
          temperature: 180,
          equipment: ['Plancha', 'Horno']
        },
        {
          step: 2,
          description: 'Cocinar la carne a término medio',
          duration: 5,
          temperature: 200,
          equipment: ['Plancha']
        },
        {
          step: 3,
          description: 'Agregar queso sobre la carne en los últimos 30 segundos',
          duration: 1
        },
        {
          step: 4,
          description: 'Armar: base de pan, lechuga, tomate, carne con queso, salsa, tapa de pan',
          duration: 2
        }
      ],
      notes: 'Puedes agregar cebolla caramelizada, pepinillos o bacon para variaciones'
    }
  },

  // ===== PIZZA MARGARITA =====
  {
    id: 'template_pizza_margarita',
    name: 'Pizza Margarita',
    description: 'Pizza clásica italiana con tomate, mozzarella y albahaca',
    category: 'mains',
    entityType: 'product',
    tags: ['gastronomía', 'italiana', 'vegetariana'],
    recipeData: {
      name: 'Pizza Margarita',
      difficulty: DifficultyLevel.INTERMEDIATE,
      preparationTime: 20,
      cookingTime: 12,
      totalTime: 32,
      output: {
        quantity: 1,
        unit: 'unit',
        qualityGrade: QualityGrade.PREMIUM,
        yieldPercentage: 100,
        wastePercentage: 2
      },
      inputs: [
        {
          id: 'input_dough',
          item: '',
          quantity: 250,
          unit: 'g',
          yieldPercentage: 100,
          displayOrder: 1
        },
        {
          id: 'input_tomato_sauce',
          item: '',
          quantity: 80,
          unit: 'g',
          displayOrder: 2
        },
        {
          id: 'input_mozzarella',
          item: '',
          quantity: 100,
          unit: 'g',
          displayOrder: 3
        },
        {
          id: 'input_basil',
          item: '',
          quantity: 5,
          unit: 'g',
          wastePercentage: 5,
          displayOrder: 4
        },
        {
          id: 'input_olive_oil',
          item: '',
          quantity: 10,
          unit: 'ml',
          displayOrder: 5
        }
      ],
      instructions: [
        {
          step: 1,
          description: 'Estirar la masa hasta obtener un círculo de 30cm de diámetro',
          duration: 5,
          equipment: ['Rodillo', 'Mesa de trabajo']
        },
        {
          step: 2,
          description: 'Distribuir la salsa de tomate uniformemente, dejando 1cm de borde',
          duration: 2
        },
        {
          step: 3,
          description: 'Agregar mozzarella cortada en cubos o rallada',
          duration: 3
        },
        {
          step: 4,
          description: 'Hornear en horno bien caliente hasta que el queso burbujee y el borde esté dorado',
          duration: 12,
          temperature: 250,
          equipment: ['Horno', 'Pala de pizza']
        },
        {
          step: 5,
          description: 'Decorar con hojas de albahaca fresca y un chorrito de aceite de oliva',
          duration: 1
        }
      ]
    }
  },

  // ===== SMOOTHIE VERDE =====
  {
    id: 'template_green_smoothie',
    name: 'Smoothie Verde Detox',
    description: 'Batido saludable con espinaca, frutas y yogurt',
    category: 'beverages',
    entityType: 'product',
    tags: ['saludable', 'vegano-opcional', 'bebidas'],
    recipeData: {
      name: 'Smoothie Verde',
      difficulty: DifficultyLevel.BEGINNER,
      preparationTime: 5,
      cookingTime: 0,
      totalTime: 5,
      output: {
        quantity: 500,
        unit: 'ml',
        yieldPercentage: 95,
        wastePercentage: 5
      },
      inputs: [
        {
          id: 'input_spinach',
          item: '',
          quantity: 50,
          unit: 'g',
          wastePercentage: 10,
          displayOrder: 1
        },
        {
          id: 'input_banana',
          item: '',
          quantity: 100,
          unit: 'g',
          wastePercentage: 30,
          displayOrder: 2
        },
        {
          id: 'input_apple',
          item: '',
          quantity: 80,
          unit: 'g',
          wastePercentage: 25,
          displayOrder: 3
        },
        {
          id: 'input_yogurt',
          item: '',
          quantity: 150,
          unit: 'g',
          displayOrder: 4
        },
        {
          id: 'input_water',
          item: '',
          quantity: 100,
          unit: 'ml',
          displayOrder: 5
        },
        {
          id: 'input_honey',
          item: '',
          quantity: 10,
          unit: 'g',
          optional: true,
          displayOrder: 6
        }
      ],
      instructions: [
        {
          step: 1,
          description: 'Lavar bien la espinaca',
          duration: 1
        },
        {
          step: 2,
          description: 'Colocar todos los ingredientes en la licuadora',
          duration: 1,
          equipment: ['Licuadora']
        },
        {
          step: 3,
          description: 'Licuar durante 60 segundos hasta obtener consistencia cremosa',
          duration: 2,
          equipment: ['Licuadora']
        },
        {
          step: 4,
          description: 'Servir inmediatamente en vaso alto',
          duration: 1
        }
      ],
      notes: 'Puedes sustituir la manzana por mango o piña. Para versión vegana, usa yogurt de coco o almendras.'
    }
  },

  // ===== BROWNIE DE CHOCOLATE =====
  {
    id: 'template_chocolate_brownie',
    name: 'Brownie de Chocolate',
    description: 'Brownie húmedo y denso con chocolate oscuro',
    category: 'desserts',
    entityType: 'product',
    tags: ['postre', 'chocolate', 'horneado'],
    recipeData: {
      name: 'Brownie de Chocolate',
      difficulty: DifficultyLevel.INTERMEDIATE,
      preparationTime: 15,
      cookingTime: 25,
      totalTime: 40,
      output: {
        quantity: 12,
        unit: 'porciones',
        qualityGrade: QualityGrade.PREMIUM,
        yieldPercentage: 98,
        wastePercentage: 2
      },
      inputs: [
        {
          id: 'input_dark_chocolate',
          item: '',
          quantity: 200,
          unit: 'g',
          displayOrder: 1
        },
        {
          id: 'input_butter',
          item: '',
          quantity: 150,
          unit: 'g',
          displayOrder: 2
        },
        {
          id: 'input_sugar',
          item: '',
          quantity: 180,
          unit: 'g',
          displayOrder: 3
        },
        {
          id: 'input_eggs',
          item: '',
          quantity: 3,
          unit: 'unit',
          displayOrder: 4
        },
        {
          id: 'input_flour',
          item: '',
          quantity: 80,
          unit: 'g',
          displayOrder: 5
        },
        {
          id: 'input_cocoa_powder',
          item: '',
          quantity: 30,
          unit: 'g',
          displayOrder: 6
        },
        {
          id: 'input_vanilla',
          item: '',
          quantity: 5,
          unit: 'ml',
          displayOrder: 7
        }
      ],
      instructions: [
        {
          step: 1,
          description: 'Derretir chocolate y mantequilla a baño maría o microondas',
          duration: 5,
          temperature: 50,
          equipment: ['Baño maría', 'Microondas']
        },
        {
          step: 2,
          description: 'Batir huevos con azúcar hasta que blanqueen',
          duration: 5,
          equipment: ['Batidora']
        },
        {
          step: 3,
          description: 'Mezclar chocolate derretido con huevos batidos',
          duration: 2
        },
        {
          step: 4,
          description: 'Incorporar harina y cacao tamizados, mezclar con movimientos envolventes',
          duration: 3,
          equipment: ['Tamiz', 'Espátula']
        },
        {
          step: 5,
          description: 'Verter en molde engrasado y enharinado (20x20cm)',
          duration: 2,
          equipment: ['Molde cuadrado']
        },
        {
          step: 6,
          description: 'Hornear hasta que los bordes estén firmes pero el centro ligeramente húmedo',
          duration: 25,
          temperature: 180,
          equipment: ['Horno']
        },
        {
          step: 7,
          description: 'Dejar enfriar completamente antes de cortar',
          duration: 30
        }
      ],
      notes: 'No sobrecocinar - el centro debe quedar fudgy. Puedes agregar nueces o chips de chocolate.'
    }
  }
]

// ============================================
// HELPERS
// ============================================

/**
 * Get template by ID
 */
export function getTemplateById(id: string): BuiltInTemplate | undefined {
  return BUILT_IN_TEMPLATES.find(t => t.id === id)
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): BuiltInTemplate[] {
  return BUILT_IN_TEMPLATES.filter(t => t.category === category)
}

/**
 * Get templates by entity type
 */
export function getTemplatesByEntityType(entityType: string): BuiltInTemplate[] {
  return BUILT_IN_TEMPLATES.filter(t => t.entityType === entityType)
}

/**
 * Search templates
 */
export function searchTemplates(query: string): BuiltInTemplate[] {
  const lowerQuery = query.toLowerCase()
  return BUILT_IN_TEMPLATES.filter(
    t =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}
