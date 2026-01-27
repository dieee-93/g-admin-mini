import { useState, useMemo } from 'react';
import { SelectField, createListCollection } from '@/shared/ui';
import { useDisclosure } from '@/shared/hooks';
import { useBrands } from '../hooks/useBrands';
import { BrandFormModal } from './BrandFormModal';

interface BrandSelectFieldProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  error?: string;
  disabled?: boolean;
}

type BrandOption = {
  label: string;
  value: string;
};

export function BrandSelectField({ value, onChange, error, disabled }: BrandSelectFieldProps) {
  const { data: brands = [], isLoading } = useBrands();
  const createModal = useDisclosure();

  const handleValueChange = (details: { value: string[] }) => {
    const selectedValue = details.value?.[0];
    
    if (selectedValue === 'CREATE_NEW') {
      createModal.onOpen();
      return;
    }

    onChange(selectedValue === 'none' ? undefined : selectedValue);
  };

  const brandCollection = useMemo(() => {
    const items: BrandOption[] = [
      { value: 'none', label: 'Sin marca' },
      ...brands.map((brand) => ({
        value: brand.id,
        label: brand.name,
      })),
      { value: 'CREATE_NEW', label: '➕ Crear nueva marca' },
    ];
    return createListCollection<BrandOption>({ items });
  }, [brands]);

  return (
    <>
      <SelectField
        label="Marca"
        placeholder={isLoading ? 'Cargando marcas...' : 'Selecciona una marca'}
        collection={brandCollection}
        value={value ? [value] : ['none']}
        onValueChange={handleValueChange}
        disabled={disabled || isLoading}
        invalid={!!error}
        helperText={error}
        noPortal={true}
      />

      <BrandFormModal
        isOpen={createModal.isOpen}
        onClose={createModal.onClose}
        mode="create"
      />
    </>
  );
}
