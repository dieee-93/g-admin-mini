// src/features/items/ui/ItemForm.tsx - VERSIÓN FINAL CORREGIDA
import {
  Box, Button, Input, VStack, Text, Select
} from '@chakra-ui/react';
import { useState } from 'react';
import { useItems } from '../logic/useItems';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { type ItemType } from '../types';

interface ItemFormData {
  name: string;
  type: ItemType | '';
  unit: string;
  unit_cost: string;
}

interface FormErrors {
  name?: string;
  type?: string;
  unit?: string;
  unit_cost?: string;
}

const ITEM_TYPES: { value: ItemType; label: string }[] = [
  { value: 'UNIT', label: 'Unidades' },
  { value: 'WEIGHT', label: 'Peso' },
  { value: 'VOLUME', label: 'Volumen' },
  { value: 'ELABORATED', label: 'Elaborado' },
];

export function ItemForm() {
  const { addItem } = useItems();
  const { handleError, handleSuccess } = useErrorHandler();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const [form, setForm] = useState<ItemFormData>({
    name: '',
    type: '',
    unit: '',
    unit_cost: '',
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!form.type) {
      newErrors.type = 'El tipo es requerido';
    }

    if (!form.unit.trim()) {
      newErrors.unit = 'La unidad es requerida';
    }

    if (form.unit_cost && isNaN(parseFloat(form.unit_cost))) {
      newErrors.unit_cost = 'Debe ser un número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (value: string[]) => {
    setForm(prev => ({ ...prev, type: value[0] as ItemType }));
    
    // Limpiar error del campo
    if (errors.type) {
      setErrors(prev => ({ ...prev, type: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addItem({
        name: form.name.trim(),
        type: form.type as ItemType,
        unit: form.unit.trim(),
        unit_cost: form.unit_cost ? parseFloat(form.unit_cost) : undefined,
      });
      
      handleSuccess('Se agregó correctamente el insumo', 'Item creado');
      
      // Resetear formulario
      setForm({
        name: '',
        type: '',
        unit: '',
        unit_cost: '',
      });
    } catch (error) {
      handleError(error, 'Error al crear el item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box borderWidth="1px" rounded="md" p={4} mb={6}>
      <VStack gap="4">
        {/* Campo Nombre */}
        <Box width="100%">
          <Input
            placeholder="Nombre del insumo"
            name="name"
            value={form.name}
            onChange={handleChange}
            borderColor={errors.name ? 'red.300' : undefined}
          />
          {errors.name && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.name}
            </Text>
          )}
        </Box>

        {/* Campo Tipo - Select Chakra v3 */}
        <Box width="100%">
          <Select.Root 
            value={form.type ? [form.type] : []}
            onValueChange={(details) => handleSelectChange(details.value)}
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger borderColor={errors.type ? 'red.300' : undefined}>
                <Select.ValueText placeholder="Seleccionar tipo" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                {ITEM_TYPES.map((type) => (
                  <Select.Item key={type.value} item={type.value}>
                    <Select.ItemText>{type.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Select.Root>
          {errors.type && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.type}
            </Text>
          )}
        </Box>

        {/* Campo Unidad */}
        <Box width="100%">
          <Input
            placeholder="Unidad (g, ml, u, kg, etc.)"
            name="unit"
            value={form.unit}
            onChange={handleChange}
            borderColor={errors.unit ? 'red.300' : undefined}
          />
          {errors.unit && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.unit}
            </Text>
          )}
        </Box>

        {/* Campo Costo */}
        <Box width="100%">
          <Input
            placeholder="Costo por unidad (opcional)"
            name="unit_cost"
            type="number"
            step="0.01"
            min="0"
            value={form.unit_cost}
            onChange={handleChange}
            borderColor={errors.unit_cost ? 'red.300' : undefined}
          />
          {errors.unit_cost && (
            <Text color="red.500" fontSize="sm" mt={1}>
              {errors.unit_cost}
            </Text>
          )}
        </Box>

        <Button 
          onClick={handleSubmit} 
          colorScheme="green"
          loading={isSubmitting}
          loadingText="Creando..."
          width="100%"
        >
          Agregar Insumo
        </Button>
      </VStack>
    </Box>
  );
}