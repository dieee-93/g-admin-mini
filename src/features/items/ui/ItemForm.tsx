import {
  Box, Button, Input, Select, Stack,
} from '@chakra-ui/react';
import { toaster } from '@/components/ui/toaster';  // tu toaster importado
import { useState } from 'react';
import { useItems } from '../logic/useItem';  // asumo que mantenés este hook

export function ItemForm() {
  const { addItem } = useItems();
  const [form, setForm] = useState({
    name: '',
    type: 'UNIT',
    unit: '',
    unit_cost: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await addItem({
        name: form.name,
        type: form.type as any,
        unit: form.unit,
        unit_cost: parseFloat(form.unit_cost) || undefined,
      });
      toaster.create({
        title: 'Item creado',
        description: 'Se agregó correctamente el insumo',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setForm({ name: '', type: 'UNIT', unit: '', unit_cost: '' });
    } catch (error) {
      toaster.create({
        title: 'Error creando item',
        description: error?.message || 'Ocurrió un error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box borderWidth="1px" rounded="md" p={4} mb={6}>
      <Stack spacing={3}>
        <Input
          placeholder="Nombre"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
        <Select name="type" value={form.type} onChange={handleChange}>
          <option value="UNIT">Unidades</option>
          <option value="WEIGHT">Peso</option>
          <option value="VOLUME">Volumen</option>
          <option value="ELABORATED">Elaborado</option>
        </Select>
        <Input
          placeholder="Unidad (g, ml, u...)"
          name="unit"
          value={form.unit}
          onChange={handleChange}
        />
        <Input
          placeholder="Costo por unidad"
          name="unit_cost"
          value={form.unit_cost}
          onChange={handleChange}
        />
        <Button onClick={handleSubmit} colorScheme="green">
          Agregar
        </Button>
      </Stack>
    </Box>
  );
}
