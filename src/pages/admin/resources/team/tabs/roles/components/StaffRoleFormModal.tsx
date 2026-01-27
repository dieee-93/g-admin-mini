/**
 * STAFF ROLE FORM MODAL
 * 
 * Create and edit staff roles for labor costing
 * 
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  Stack,
  Button,
  Input,
  Textarea,
  Switch,
  Field,
  HStack,
  Text,
  Alert,
  Tooltip,
} from '@/shared/ui';
import { FormSection } from '@/shared/ui';
import type { JobRole, StaffRoleFormData } from '../../../types/jobRole';
import {
  COMMON_ARGENTINE_CONVENTIONS,
  DEFAULT_LOADED_FACTOR_ARGENTINA,
} from '@/modules/team/types/jobRole';

interface StaffRoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StaffRoleFormData) => Promise<void>;
  role?: JobRole | null;
  isSubmitting?: boolean;
  departments?: string[];
}

const INITIAL_FORM_DATA: StaffRoleFormData = {
  name: '',
  department: '',
  description: '',
  labor_category: '',
  applicable_convention: '',
  default_hourly_rate: undefined,
  loaded_factor: DEFAULT_LOADED_FACTOR_ARGENTINA, // Default 1.40 for Argentina
  is_active: true,
  sort_order: 0,
};

export function StaffRoleFormModal({
  isOpen,
  onClose,
  onSubmit,
  role,
  isSubmitting = false,
  departments = [],
}: StaffRoleFormModalProps) {
  const [formData, setFormData] = useState<StaffRoleFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!role;

  // Reset form when modal opens/closes or role changes
  useEffect(() => {
    if (isOpen && role) {
      setFormData({
        name: role.name,
        department: role.department || '',
        description: role.description || '',
        labor_category: role.labor_category || '',
        applicable_convention: role.applicable_convention || '',
        default_hourly_rate: role.default_hourly_rate || undefined,
        loaded_factor: role.loaded_factor,
        is_active: role.is_active,
        sort_order: role.sort_order,
      });
    } else if (isOpen) {
      setFormData(INITIAL_FORM_DATA);
    }
    setErrors({});
  }, [isOpen, role]);

  const handleFieldChange = (field: keyof StaffRoleFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field changes
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleNumberChange = (field: 'default_hourly_rate' | 'loaded_factor' | 'sort_order') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    if (value === '') {
      setFormData((prev) => ({ ...prev, [field]: undefined }));
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setFormData((prev) => ({ ...prev, [field]: numValue }));
      }
    }
  };

  const handleSwitchChange = (field: 'is_active') => (details: { checked: boolean }) => {
    setFormData((prev) => ({ ...prev, [field]: details.checked }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (formData.loaded_factor !== undefined && formData.loaded_factor < 1) {
      newErrors.loaded_factor = 'El factor de carga debe ser al menos 1.0';
    }

    if (formData.default_hourly_rate !== undefined && formData.default_hourly_rate < 0) {
      newErrors.default_hourly_rate = 'La tarifa por hora no puede ser negativa';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting staff role:', error);
    }
  };

  // Calculate loaded hourly cost preview
  const loadedHourlyCost = (formData.default_hourly_rate || 0) * (formData.loaded_factor || 1);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(details) => !details.open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxWidth="xl">
          <Dialog.Header>
            <Dialog.Title>
              {isEditMode ? 'Editar Rol de Trabajo' : 'Nuevo Rol de Trabajo'}
            </Dialog.Title>
            <Dialog.CloseTrigger />
          </Dialog.Header>

          <Dialog.Body>
            <Stack gap={6}>
              {/* Basic Info */}
              <FormSection title="Informacion Basica">
                <Stack gap={4}>
                  <Field.Root invalid={!!errors.name}>
                    <Field.Label>Nombre *</Field.Label>
                    <Input
                      placeholder="Ej: Cocinero, Mesero, Barbero"
                      value={formData.name}
                      onChange={handleFieldChange('name')}
                    />
                    {errors.name && <Field.ErrorText>{errors.name}</Field.ErrorText>}
                    <Field.HelperText>
                      Nombre del rol para asignacion y costeo de mano de obra
                    </Field.HelperText>
                  </Field.Root>

                  <HStack gap={4}>
                    <Field.Root flex={1}>
                      <Field.Label>Departamento</Field.Label>
                      <Input
                        placeholder="Ej: Cocina, Servicio, Administracion"
                        value={formData.department || ''}
                        onChange={handleFieldChange('department')}
                        list="department-suggestions"
                      />
                      {departments.length > 0 && (
                        <datalist id="department-suggestions">
                          {departments.map((dept) => (
                            <option key={dept} value={dept} />
                          ))}
                        </datalist>
                      )}
                    </Field.Root>

                    <Field.Root width="120px">
                      <Field.Label>Orden</Field.Label>
                      <Input
                        type="number"
                        min={0}
                        value={formData.sort_order ?? 0}
                        onChange={handleNumberChange('sort_order')}
                      />
                    </Field.Root>
                  </HStack>

                  <Field.Root>
                    <Field.Label>Descripcion</Field.Label>
                    <Textarea
                      placeholder="Descripcion opcional del rol y sus responsabilidades"
                      value={formData.description || ''}
                      onChange={handleFieldChange('description')}
                      rows={2}
                    />
                  </Field.Root>
                </Stack>
              </FormSection>

              {/* Labor Category Information (Phase 1 - Argentina) */}
              <FormSection title="Categoria Laboral 🇦🇷">
                <Stack gap={4}>
                  <Field.Root>
                    <HStack gap={2} align="center">
                      <Field.Label>Categoria Laboral</Field.Label>
                      <Tooltip.Root>
                        <Tooltip.Trigger>
                          <Text fontSize="sm" color="gray.500" cursor="help">ℹ️</Text>
                        </Tooltip.Trigger>
                        <Tooltip.Positioner>
                          <Tooltip.Content maxW="300px">
                            <Stack gap={2} fontSize="sm">
                              <Text fontWeight="bold">Categoría Laboral</Text>
                              <Text>Clasificación según convenio colectivo de trabajo (CCT).</Text>
                              <Text mt={2}>Ejemplos:</Text>
                              <Text>• Cocinero 3ra categoría (Gastronómicos)</Text>
                              <Text>• Vendedor especializado (Comercio)</Text>
                              <Text>• Mozo categoría A (Gastronómicos)</Text>
                              <Text mt={2}>La categoría determina salarios mínimos y condiciones laborales según el CCT aplicable.</Text>
                            </Stack>
                          </Tooltip.Content>
                        </Tooltip.Positioner>
                      </Tooltip.Root>
                    </HStack>
                    <Input
                      placeholder="Ej: Cocinero 3ra categoria, Vendedor especializado"
                      value={formData.labor_category || ''}
                      onChange={handleFieldChange('labor_category')}
                    />
                    <Field.HelperText>
                      Categoría según convenio colectivo (CCT)
                    </Field.HelperText>
                  </Field.Root>

                  <Field.Root>
                    <HStack gap={2} align="center">
                      <Field.Label>Convenio Colectivo Aplicable</Field.Label>
                      <Tooltip.Root>
                        <Tooltip.Trigger>
                          <Text fontSize="sm" color="gray.500" cursor="help">ℹ️</Text>
                        </Tooltip.Trigger>
                        <Tooltip.Positioner>
                          <Tooltip.Content maxW="300px">
                            <Stack gap={2} fontSize="sm">
                              <Text fontWeight="bold">Convenio Colectivo de Trabajo (CCT)</Text>
                              <Text>Acuerdo que regula las condiciones laborales del rol.</Text>
                              <Text mt={2}>Ejemplos comunes:</Text>
                              {COMMON_ARGENTINE_CONVENTIONS.map((conv) => (
                                <Text key={conv}>• {conv}</Text>
                              ))}
                            </Stack>
                          </Tooltip.Content>
                        </Tooltip.Positioner>
                      </Tooltip.Root>
                    </HStack>
                    <Input
                      placeholder="Ej: CCT 130/75 - Comercio, CCT 389/04 - Gastronómicos"
                      value={formData.applicable_convention || ''}
                      onChange={handleFieldChange('applicable_convention')}
                      list="convention-suggestions"
                    />
                    <datalist id="convention-suggestions">
                      {COMMON_ARGENTINE_CONVENTIONS.map((conv) => (
                        <option key={conv} value={conv} />
                      ))}
                    </datalist>
                    <Field.HelperText>
                      Convenio colectivo que regula condiciones laborales
                    </Field.HelperText>
                  </Field.Root>

                  <Alert status="info" title="Información sobre Roles vs Empleados">
                    <Text fontSize="sm">
                      Este formulario define un <strong>rol de trabajo</strong> (plantilla).
                      Las características específicas de cada empleado (tipo de contratación,
                      experiencia, etc.) se configuran en el formulario de empleados.
                    </Text>
                  </Alert>
                </Stack>
              </FormSection>

              {/* Costing */}
              <FormSection title="Costeo de Mano de Obra (Valores por Defecto)">
                <Stack gap={4}>
                  <Alert status="info" title="Valores Base del Rol">
                    <Stack gap={1} fontSize="sm">
                      <Text>
                        Estos son valores <strong>por defecto</strong> para el rol.
                      </Text>
                      <Text color="gray.600">
                        Cada empleado asignado a este rol puede tener sus propios valores
                        según su tipo de contratación (empleado, monotributista, etc.).
                      </Text>
                    </Stack>
                  </Alert>

                  <HStack gap={4}>
                    <Field.Root flex={1} invalid={!!errors.default_hourly_rate}>
                      <HStack gap={2} align="center">
                        <Field.Label>Tarifa por Hora Base</Field.Label>
                        <Tooltip.Root>
                          <Tooltip.Trigger>
                            <Text fontSize="sm" color="gray.500" cursor="help">ℹ️</Text>
                          </Tooltip.Trigger>
                          <Tooltip.Positioner>
                            <Tooltip.Content maxW="300px">
                              <Text fontSize="sm">
                                Costo bruto por hora de trabajo, SIN incluir cargas sociales.
                                El factor de carga se multiplica por este valor para obtener
                                el costo total por hora.
                              </Text>
                            </Tooltip.Content>
                          </Tooltip.Positioner>
                        </Tooltip.Root>
                      </HStack>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="0.00"
                        value={formData.default_hourly_rate ?? ''}
                        onChange={handleNumberChange('default_hourly_rate')}
                      />
                      {errors.default_hourly_rate && (
                        <Field.ErrorText>{errors.default_hourly_rate}</Field.ErrorText>
                      )}
                      <Field.HelperText>Costo bruto por hora de trabajo</Field.HelperText>
                    </Field.Root>

                    <Field.Root flex={1} invalid={!!errors.loaded_factor}>
                      <HStack gap={2} align="center">
                        <Field.Label>Factor de Carga</Field.Label>
                        <Tooltip.Root>
                          <Tooltip.Trigger>
                            <Text fontSize="sm" color="gray.500" cursor="help">ℹ️</Text>
                          </Tooltip.Trigger>
                          <Tooltip.Positioner>
                            <Tooltip.Content maxW="300px">
                              <Stack gap={2} fontSize="sm">
                                <Text fontWeight="bold">Factor de Carga (Loaded Factor)</Text>
                                <Text>Multiplicador que incluye:</Text>
                                <Text>• Contribuciones patronales (18-20.4%)</Text>
                                <Text>• ART (2-4%)</Text>
                                <Text>• Seguro de vida (~0.5%)</Text>
                                <Text>• Otros costos laborales</Text>
                                <Text mt={2}>El factor se ajusta automáticamente según el tipo de contratación.</Text>
                              </Stack>
                            </Tooltip.Content>
                          </Tooltip.Positioner>
                        </Tooltip.Root>
                      </HStack>
                      <Input
                        type="number"
                        min={1}
                        step={0.01}
                        placeholder="1.00"
                        value={formData.loaded_factor ?? 1.0}
                        onChange={handleNumberChange('loaded_factor')}
                      />
                      {errors.loaded_factor && (
                        <Field.ErrorText>{errors.loaded_factor}</Field.ErrorText>
                      )}
                      <Field.HelperText>
                        Multiplicador para cargas sociales (ej: 1.35 = 35% adicional)
                      </Field.HelperText>
                    </Field.Root>
                  </HStack>

                  {/* Cost Preview */}
                  {formData.default_hourly_rate !== undefined && formData.default_hourly_rate > 0 && (
                    <Alert
                      status="success"
                      title="💰 Costo Cargado por Hora"
                    >
                      <Stack gap={2}>
                        <HStack gap={2} align="baseline">
                          <Text fontWeight="bold" fontSize="2xl" color="green.600">
                            ${loadedHourlyCost.toFixed(2)}
                          </Text>
                          <Text color="gray.600" fontSize="sm">
                            = ${formData.default_hourly_rate.toFixed(2)} × {(formData.loaded_factor || 1).toFixed(2)}
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.600">
                          Este es el costo real por hora que debes considerar para pricing y presupuestos.
                        </Text>
                      </Stack>
                    </Alert>
                  )}
                </Stack>
              </FormSection>

              {/* Status */}
              <FormSection title="Estado">
                <HStack justify="space-between">
                  <Stack gap={0}>
                    <Text fontWeight="medium">Rol Activo</Text>
                    <Text color="gray.600" fontSize="sm">
                      Los roles inactivos no aparecen en selectores de asignacion
                    </Text>
                  </Stack>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={handleSwitchChange('is_active')}
                  />
                </HStack>
              </FormSection>
            </Stack>
          </Dialog.Body>

          <Dialog.Footer>
            <HStack justify="end" gap={3}>
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button
                colorPalette="purple"
                onClick={handleSubmit}
                loading={isSubmitting}
              >
                {isEditMode ? 'Guardar Cambios' : 'Crear Rol'}
              </Button>
            </HStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
