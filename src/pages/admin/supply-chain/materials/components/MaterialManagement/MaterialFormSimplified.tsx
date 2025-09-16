/**
 * Simplified Material Form using DynamicForm
 * Migrated from UniversalItemForm to use reusable patterns
 */
import React from 'react';
import { DynamicForm, type FormSectionConfig } from '@/shared/components/forms';
import { useFormManager } from '@/shared/hooks/business';
import { CRUDHandlers } from '@/shared/utils/errorHandling';
import { EntitySchemas } from '@/lib/validation/zod/CommonSchemas';
import { z } from 'zod';
import { useInventory } from '../logic/useInventory';

// Material-specific schema extending base entity schema
const MaterialSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  type: z.enum(['MEASURABLE', 'COUNTABLE', 'ELABORATED'], {
    required_error: "Debes seleccionar un tipo de item"
  }),
  category: z.string().min(1, "Debes seleccionar una categoría"),
  unit: z.string().min(1, "La unidad es obligatoria"),
  initial_stock: z.number().min(0, "El stock inicial no puede ser negativo").default(0),
  unit_cost: z.number().min(0, "El costo unitario no puede ser negativo").default(0),
  description: z.string().optional(),
  supplier: z.string().optional(),
  min_stock: z.number().min(0).default(10),
  max_stock: z.number().min(0).default(100),
});

type MaterialFormData = z.infer<typeof MaterialSchema>;

interface MaterialFormProps {
  material?: any; // Material to edit
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MaterialFormSimplified({ material, onSuccess, onCancel }: MaterialFormProps) {
  const { addItem, updateItem } = useInventory();
  const isEditMode = !!material;

  // Form sections configuration
  const formSections: FormSectionConfig[] = [
    {
      title: "Información Básica",
      description: "Datos principales del material",
      fields: [
        {
          name: 'name',
          label: 'Nombre del Material',
          type: 'text',
          placeholder: 'Ej: Harina 0000, Huevos, Aceite...',
          required: true,
          gridColumn: '1 / -1'
        },
        {
          name: 'category',
          label: 'Categoría',
          type: 'text', // Would be select in real implementation
          placeholder: 'Lácteos, Carnes, Verduras...',
          required: true
        },
        {
          name: 'type',
          label: 'Tipo de Material',
          type: 'text', // Would be select in real implementation
          placeholder: 'MEASURABLE, COUNTABLE, ELABORATED',
          required: true
        }
      ]
    },
    {
      title: "Unidades y Medición",
      description: "Configuración de unidades de medida",
      fields: [
        {
          name: 'unit',
          label: 'Unidad de Medida',
          type: 'text',
          placeholder: 'kg, unidades, litros...',
          required: true
        },
        {
          name: 'initial_stock',
          label: 'Stock Inicial',
          type: 'number',
          placeholder: '0'
        }
      ]
    },
    {
      title: "Costos y Proveedores",
      description: "Información financiera y de proveedores",
      fields: [
        {
          name: 'unit_cost',
          label: 'Costo Unitario ($)',
          type: 'number',
          placeholder: '0.00'
        },
        {
          name: 'supplier',
          label: 'Proveedor',
          type: 'text',
          placeholder: 'Nombre del proveedor principal'
        }
      ]
    },
    {
      title: "Control de Stock",
      description: "Niveles mínimos y máximos de inventario",
      fields: [
        {
          name: 'min_stock',
          label: 'Stock Mínimo',
          type: 'number',
          placeholder: '10',
          description: 'Nivel de alerta para reposición'
        },
        {
          name: 'max_stock',
          label: 'Stock Máximo',
          type: 'number',
          placeholder: '100',
          description: 'Nivel máximo recomendado'
        }
      ]
    },
    {
      title: "Información Adicional",
      description: "Detalles opcionales del material",
      fields: [
        {
          name: 'description',
          label: 'Descripción',
          type: 'textarea',
          placeholder: 'Información adicional sobre el material...',
          gridColumn: '1 / -1'
        }
      ]
    }
  ];

  return (
    <DynamicForm<MaterialFormData>
      title={isEditMode ? '✏️ Editar Material' : '📦 Nuevo Material'}
      description="Gestión completa de materiales e inventario"
      schema={MaterialSchema}
      sections={formSections}
      defaultValues={{
        name: material?.name || '',
        type: material?.type || 'MEASURABLE',
        category: material?.category || '',
        unit: material?.unit || '',
        initial_stock: material?.stock || 0,
        unit_cost: material?.unit_cost || 0,
        description: material?.description || '',
        supplier: material?.supplier || '',
        min_stock: material?.min_stock || 10,
        max_stock: material?.max_stock || 100
      }}
      onSubmit={async (data) => {
        if (isEditMode) {
          await CRUDHandlers.update(
            () => updateItem(material.id, data),
            'Material',
            onSuccess
          );
        } else {
          await CRUDHandlers.create(
            () => addItem(data),
            'Material',
            onSuccess
          );
        }
      }}
      onCancel={onCancel}
      submitText={isEditMode ? '✅ Actualizar Material' : '✅ Crear Material'}
      successMessage={{
        title: isEditMode ? 'MATERIAL_UPDATED' : 'MATERIAL_CREATED',
        description: `Material ${isEditMode ? 'actualizado' : 'creado'} correctamente`
      }}
      resetOnSuccess={!isEditMode}
    />
  );
}