import React, { useState } from 'react';
import {
  Stack, Typography, Input, SelectField, NumberField, Button, Alert, createListCollection
} from '@/shared/ui';
import {
  CubeIcon
} from '@heroicons/react/24/outline';
import { useInventory } from '../logic/useInventory';
import { type ItemType } from '../types';

// ✅ FIX: Definir opciones fuera del componente para performance
const itemTypeOptions = [
  { label: 'Contable (unidades)', value: 'UNIT' },
  { label: 'Por peso (kg, g)', value: 'WEIGHT' },
  { label: 'Por volumen (lt, ml)', value: 'VOLUME' },
  { label: 'Elaborado', value: 'ELABORATED' }
];

// ✅ FIX: Definir tipos de unidades con tipo consistente
const unitsByType: Record<ItemType, Array<{label: string; value: string}>> = {
  UNIT: [
    { label: 'unidad', value: 'unidad' },
    { label: 'docena', value: 'docena' },
    { label: 'caja', value: 'caja' },
    { label: 'paquete', value: 'paquete' },
    { label: 'bolsa', value: 'bolsa' }
  ],
  WEIGHT: [
    { label: 'kg', value: 'kg' },
    { label: 'g', value: 'g' },
    { label: 'ton', value: 'ton' }
  ],
  VOLUME: [
    { label: 'lt', value: 'lt' },
    { label: 'ml', value: 'ml' },
    { label: 'gal', value: 'gal' }
  ],
  ELABORATED: [
    { label: 'unidad', value: 'unidad' },
    { label: 'porción', value: 'porción' },
    { label: 'bandeja', value: 'bandeja' },
    { label: 'lata', value: 'lata' }
  ]
};

interface ItemFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ItemForm({ onSuccess, onCancel }: ItemFormProps) {
  const { addItem } = useInventory();
  
  const [formData, setFormData] = useState({
    name: '',
    type: '' as ItemType | '',
    unit: '',
    stock: 0,
    unit_cost: 0
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ FIX: useMemo con tipo consistente
  const unitsCollection = React.useMemo(() => {
    if (!formData.type) {
      return createListCollection({
        items: [] as Array<{label: string; value: string}>
      });
    }
    
    return createListCollection({
      items: unitsByType[formData.type]
    });
  }, [formData.type]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!formData.type) {
      newErrors.type = 'El tipo es requerido';
    }
    
    if (!formData.unit) {
      newErrors.unit = 'La unidad es requerida';
    }
    
    if (formData.stock < 0) {
      newErrors.stock = 'El stock no puede ser negativo';
    }
    
    if (formData.unit_cost < 0) {
      newErrors.unit_cost = 'El costo no puede ser negativo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await addItem(formData as any);
      onSuccess();
    } catch (error) {
      console.error('Error creating item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <VStack gap="4" align="stretch">
      {/* Nombre */}
      <VStack align="start" gap="2">
        <Text fontSize="sm" fontWeight="medium">Nombre *</Text>
        <Input
          placeholder="ej: Harina 000"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          borderColor={errors.name ? 'red.300' : undefined}
          _focus={{
            borderColor: errors.name ? 'red.500' : 'blue.500'
          }}
        />
        {errors.name && (
          <Text color="red.500" fontSize="sm">{errors.name}</Text>
        )}
      </VStack>

      {/* Tipo */}
      <VStack align="start" gap="2">
        <Text fontSize="sm" fontWeight="medium">Tipo *</Text>
        <Select.Root
          collection={ITEM_TYPE_COLLECTION}
          value={formData.type ? [formData.type] : []}
          onValueChange={(details) => {
            const type = details.value[0] as ItemType;
            setFormData(prev => ({ 
              ...prev, 
              type,
              unit: '' // Reset unit when type changes
            }));
          }}
        >
          <Select.Trigger
            borderColor={errors.type ? 'red.300' : undefined}
          >
            <Select.ValueText placeholder="Selecciona el tipo de item" />
          </Select.Trigger>
          <Select.Content>
            {ITEM_TYPE_COLLECTION.items.map((item) => (
              <Select.Item item={item} key={item.value}>
                {item.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        {errors.type && (
          <Text color="red.500" fontSize="sm">{errors.type}</Text>
        )}
      </VStack>

      {/* Unidad */}
      {formData.type && (
        <VStack align="start" gap="2">
          <Text fontSize="sm" fontWeight="medium">Unidad de medida *</Text>
          <Select.Root
            collection={unitsCollection}
            value={formData.unit ? [formData.unit] : []}
            onValueChange={(details) => 
              setFormData(prev => ({ ...prev, unit: details.value[0] || '' }))
            }
          >
            <Select.Trigger
              borderColor={errors.unit ? 'red.300' : undefined}
            >
              <Select.ValueText placeholder="Selecciona la unidad" />
            </Select.Trigger>
            <Select.Content>
              {unitsCollection.items.map((item) => (
                <Select.Item item={item} key={item.value}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          {errors.unit && (
            <Text color="red.500" fontSize="sm">{errors.unit}</Text>
          )}
        </VStack>
      )}

      {/* Stock inicial */}
      <VStack align="start" gap="2">
        <Text fontSize="sm" fontWeight="medium">Stock inicial</Text>
        <NumberInput.Root
          value={formData.stock.toString()}
          onValueChange={(details) => 
            setFormData(prev => ({ ...prev, stock: parseFloat(details.value) || 0 }))
          }
          min={0}
          defaultValue="0"
          borderColor={errors.stock ? 'red.300' : undefined}
        />
        {errors.stock && (
          <Text color="red.500" fontSize="sm">{errors.stock}</Text>
        )}
      </VStack>

      {/* Costo unitario */}
      <VStack align="start" gap="2">
        <Text fontSize="sm" fontWeight="medium">Costo unitario (opcional)</Text>
        <NumberInput.Root
          value={formData.unit_cost.toString()}
          onValueChange={(details) => 
            setFormData(prev => ({ ...prev, unit_cost: parseFloat(details.value) || 0 }))
          }
          min={0}
          defaultValue="0.00"
          borderColor={errors.unit_cost ? 'red.300' : undefined}
        />
        {errors.unit_cost && (
          <Text color="red.500" fontSize="sm">{errors.unit_cost}</Text>
        )}
      </VStack>

      {/* Botones */}
      <HStack gap="3" justify="end" pt="4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          colorPalette="blue"
          onClick={handleSubmit}
          loading={isSubmitting}
        >
          <CubeIcon className="w-4 h-4" />
          Crear Item
        </Button>
      </HStack>
    </VStack>
  );
}

// src/features/inventory/components/StockEntryForm.tsx
// Formulario para agregar stock - CORREGIDO

interface StockEntryFormProps {
  item: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function StockEntryForm({ item, onSuccess, onCancel }: StockEntryFormProps) {
  const { addStock } = useInventory();
  
  const [formData, setFormData] = useState({
    quantity: 0,
    unit_cost: item.unit_cost || 0,
    note: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.quantity <= 0) {
      newErrors.quantity = 'La cantidad debe ser mayor a 0';
    }
    
    if (formData.unit_cost <= 0) {
      newErrors.unit_cost = 'El costo unitario debe ser mayor a 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await addStock(item.id, formData.quantity, formData.unit_cost, formData.note);
      onSuccess();
    } catch (error) {
      console.error('Error adding stock:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCost = formData.quantity * formData.unit_cost;

  return (
    <VStack gap="4" align="stretch">
      {/* Info del item */}
      <Alert.Root>
        <Alert.Indicator>
          <CubeIcon />
        </Alert.Indicator>
        <Alert.Title>Stock actual: {item.stock} {item.unit}</Alert.Title>
        <Alert.Description>
          Agregar stock a: {item.name}
        </Alert.Description>
      </Alert.Root>

      {/* Cantidad */}
      <VStack align="start" gap="2">
        <Text fontSize="sm" fontWeight="medium">Cantidad a agregar *</Text>
        <NumberInput.Root
          value={formData.quantity.toString()}
          onValueChange={(details) => 
            setFormData(prev => ({ ...prev, quantity: parseFloat(details.value) || 0 }))
          }
          min={0}
          defaultValue="0"
          borderColor={errors.quantity ? 'red.300' : undefined}
        />
        <Text fontSize="sm" color="gray.600">Unidad: {item.unit}</Text>
        {errors.quantity && (
          <Text color="red.500" fontSize="sm">{errors.quantity}</Text>
        )}
      </VStack>

      {/* Costo unitario */}
      <VStack align="start" gap="2">
        <Text fontSize="sm" fontWeight="medium">Costo unitario *</Text>
        <NumberInput.Root
          value={formData.unit_cost.toString()}
          onValueChange={(details) => 
            setFormData(prev => ({ ...prev, unit_cost: parseFloat(details.value) || 0 }))
          }
          min={0}
          defaultValue="0.00"
          borderColor={errors.unit_cost ? 'red.300' : undefined}
        />
        {errors.unit_cost && (
          <Text color="red.500" fontSize="sm">{errors.unit_cost}</Text>
        )}
      </VStack>

      {/* Costo total */}
      {totalCost > 0 && (
        <Alert.Root status="info">
          <Alert.Indicator />
          <Alert.Title>Costo total: ${totalCost.toLocaleString()}</Alert.Title>
          <Alert.Description>
            {formData.quantity} {item.unit} × ${formData.unit_cost}
          </Alert.Description>
        </Alert.Root>
      )}

      {/* Nota */}
      <VStack align="start" gap="2">
        <Text fontSize="sm" fontWeight="medium">Nota (opcional)</Text>
        <Input
          placeholder="ej: Compra a proveedor X, lote 123"
          value={formData.note}
          onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
        />
      </VStack>

      {/* Botones */}
      <HStack gap="3" justify="end" pt="4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          colorPalette="green"
          onClick={handleSubmit}
          loading={isSubmitting}
        >
          Agregar Stock
        </Button>
      </HStack>
    </VStack>
  );
}

