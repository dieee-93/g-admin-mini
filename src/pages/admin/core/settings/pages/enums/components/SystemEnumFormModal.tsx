/**
 * SYSTEM ENUM FORM MODAL
 * 
 * Create/edit system enum values
 * 
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  FormSection,
  Stack,
  HStack,
  Input,
  Textarea,
  Select,
  Switch,
  Button,
  Field,
  Spinner,
} from '@/shared/ui';
import type { EnumType } from '@/pages/admin/core/settings/services/systemEnumsApi';
import {
  useSystemEnum,
  useCreateSystemEnum,
  useUpdateSystemEnum,
} from '@/hooks';

interface SystemEnumFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  enumId: string | null;
  defaultType: EnumType;
}

interface FormData {
  enum_type: EnumType;
  key: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
}

const ENUM_TYPE_OPTIONS = [
  { value: 'staff_department', label: 'Departamento de Personal' },
  { value: 'product_type', label: 'Tipo de Producto' },
  { value: 'asset_category', label: 'Categoría de Asset' },
  { value: 'material_category', label: 'Categoría de Material' },
  { value: 'loyalty_tier', label: 'Nivel de Lealtad' },
];

export function SystemEnumFormModal({
  isOpen,
  onClose,
  enumId,
  defaultType,
}: SystemEnumFormModalProps) {
  const isEditMode = !!enumId;

  const { data: existingEnum, isLoading: isLoadingEnum } = useSystemEnum(enumId);
  const createEnum = useCreateSystemEnum();
  const updateEnum = useUpdateSystemEnum();

  const [formData, setFormData] = useState<FormData>({
    enum_type: defaultType,
    key: '',
    label: '',
    description: '',
    icon: '',
    color: '',
    sort_order: 10,
    is_active: true,
  });

  const handleFieldChange = <K extends keyof FormData>(field: K) => (value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      enum_type: defaultType,
      key: '',
      label: '',
      description: '',
      icon: '',
      color: '',
      sort_order: 10,
      is_active: true,
    });
  };

  // Load existing enum data when editing
  useEffect(() => {
    if (existingEnum && isEditMode) {
      setFormData({
        enum_type: existingEnum.enum_type,
        key: existingEnum.key,
        label: existingEnum.label,
        description: existingEnum.description || '',
        icon: existingEnum.icon || '',
        color: existingEnum.color || '',
        sort_order: existingEnum.sort_order,
        is_active: existingEnum.is_active,
      });
    } else if (!isEditMode) {
      resetForm();
    }
  }, [existingEnum, isEditMode]);

  const handleSubmit = async () => {
    if (isEditMode && enumId) {
      await updateEnum.mutateAsync({
        id: enumId,
        updates: {
          label: formData.label,
          description: formData.description || undefined,
          icon: formData.icon || undefined,
          color: formData.color || undefined,
          sort_order: formData.sort_order,
          is_active: formData.is_active,
        },
      });
    } else {
      await createEnum.mutateAsync({
        enum_type: formData.enum_type,
        key: formData.key,
        label: formData.label,
        description: formData.description || undefined,
        icon: formData.icon || undefined,
        color: formData.color || undefined,
        sort_order: formData.sort_order,
        is_active: formData.is_active,
      });
    }

    onClose();
    resetForm();
  };

  const isSubmitting = createEnum.isPending || updateEnum.isPending;

  if (isLoadingEnum && isEditMode) {
    return (
      <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Content>
          <Stack align="center" justify="center" minH="200px">
            <Spinner size="lg" />
          </Stack>
        </Dialog.Content>
      </Dialog.Root>
    );
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>
            {isEditMode ? 'Editar Valor' : 'Nuevo Valor'}
          </Dialog.Title>
        </Dialog.Header>

        <Dialog.Body>
          <Stack gap="6">
            {/* Basic Info */}
            <FormSection title="Información Básica">
              <Stack gap="4">
                {!isEditMode && (
                  <Field.Root>
                    <Field.Label>Tipo *</Field.Label>
                    <Select.Root
                      value={[formData.enum_type]}
                      onValueChange={(e) => handleFieldChange('enum_type')(e.value[0] as EnumType)}
                    >
                      <Select.Trigger>
                        <Select.ValueText placeholder="Selecciona tipo" />
                      </Select.Trigger>
                      <Select.Content>
                        {ENUM_TYPE_OPTIONS.map(option => (
                          <Select.Item key={option.value} value={option.value}>
                            {option.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Field.Root>
                )}

                {!isEditMode && (
                  <Field.Root>
                    <Field.Label>Key *</Field.Label>
                    <Input
                      value={formData.key}
                      onChange={(e) => handleFieldChange('key')(e.target.value)}
                      placeholder="ej: kitchen, service"
                    />
                    <Field.HelperText>
                      Identificador único (snake_case, sin espacios)
                    </Field.HelperText>
                  </Field.Root>
                )}

                <Field.Root>
                  <Field.Label>Nombre *</Field.Label>
                  <Input
                    value={formData.label}
                    onChange={(e) => handleFieldChange('label')(e.target.value)}
                    placeholder="Nombre visible"
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Descripción</Field.Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description')(e.target.value)}
                    placeholder="Descripción del valor"
                    rows={2}
                  />
                </Field.Root>
              </Stack>
            </FormSection>

            {/* Visual Properties */}
            <FormSection title="Propiedades Visuales">
              <Stack gap="4">
                <Field.Root>
                  <Field.Label>Icono</Field.Label>
                  <Input
                    value={formData.icon}
                    onChange={(e) => handleFieldChange('icon')(e.target.value)}
                    placeholder="ej: fire, users"
                  />
                  <Field.HelperText>
                    Nombre del icono de Heroicons
                  </Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>Color</Field.Label>
                  <Input
                    value={formData.color}
                    onChange={(e) => handleFieldChange('color')(e.target.value)}
                    placeholder="ej: red, blue, #FF5733"
                  />
                  <Field.HelperText>
                    Color del badge (nombre o código hex)
                  </Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>Orden de Visualización</Field.Label>
                  <Input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => handleFieldChange('sort_order')(Number(e.target.value))}
                  />
                  <Field.HelperText>
                    Orden en listas (menor = primero)
                  </Field.HelperText>
                </Field.Root>
              </Stack>
            </FormSection>

            {/* Status */}
            <FormSection title="Estado">
              <HStack justify="space-between">
                <Field.Label>Valor Activo</Field.Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(e) => handleFieldChange('is_active')(e.checked)}
                />
              </HStack>
            </FormSection>
          </Stack>
        </Dialog.Body>

        <Dialog.Footer>
          <HStack justify="end" gap="3">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              colorPalette="purple"
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={!formData.label || (!isEditMode && !formData.key)}
            >
              {isEditMode ? 'Guardar Cambios' : 'Crear Valor'}
            </Button>
          </HStack>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}
