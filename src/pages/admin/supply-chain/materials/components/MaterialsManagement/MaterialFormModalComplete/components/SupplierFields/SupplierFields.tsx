import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Stack,
  Text,
  Flex,
  Collapsible
} from '@/shared/ui';
import { CardWrapper, InputField, SelectField, createListCollection } from '@/shared/ui';
import { PlusIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

import { logger } from '@/lib/logging';
interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  rating?: number;
}

interface SupplierData {
  supplier_id?: string;
  purchase_date?: string;
  invoice_number?: string;
  delivery_date?: string;
  quality_rating?: number;

  // Para crear nuevo supplier
  new_supplier?: {
    name: string;
    contact_person?: string;
    email?: string;
    phone?: string;
  };
}

interface SupplierFieldsProps {
  supplierData: SupplierData;
  updateSupplierData: (updates: Partial<SupplierData>) => void;
  fieldErrors: Record<string, string>;
  disabled?: boolean;
  isVisible: boolean;
}

export const SupplierFields = ({
  supplierData,
  updateSupplierData,
  fieldErrors,
  disabled = false,
  isVisible
}: SupplierFieldsProps) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showNewSupplierForm, setShowNewSupplierForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar suppliers desde la API
  useEffect(() => {
    if (isVisible && suppliers.length === 0) {
      loadSuppliers();
    }
  }, [isVisible, suppliers.length]);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      // Usar la API real de suppliers
      const { suppliersApi } = await import('@/pages/admin/supply-chain/materials/services');
      const suppliersData = await suppliersApi.getActiveSuppliers();
      logger.info('MaterialsStore', 'Suppliers loaded from API:', suppliersData); // Debug

      if (suppliersData && suppliersData.length > 0) {
        setSuppliers(suppliersData);
      } else {
        logger.info('MaterialsStore', 'No suppliers found in DB, using fallback data'); // Debug
        // Fallback a mock data si no hay suppliers en DB
        setSuppliers([
          { id: 'mock-1', name: 'Distribuidora Central (Mock)', contact_person: 'Juan Pérez', email: 'juan@distcentral.com', rating: 4.5, is_active: true, created_at: '', updated_at: '' },
          { id: 'mock-2', name: 'Mercado Mayorista Sur (Mock)', contact_person: 'María García', email: 'ventas@mayoristasur.com', rating: 4.2, is_active: true, created_at: '', updated_at: '' },
          { id: 'mock-3', name: 'Panadería Industrial López (Mock)', contact_person: 'Carlos López', email: 'carlos@panlopez.com', rating: 4.8, is_active: true, created_at: '', updated_at: '' }
        ] as Supplier[]);
      }
    } catch (error) {
      logger.error('MaterialsStore', 'Error loading suppliers:', error);
      // Fallback a mock data si la API falla
      setSuppliers([
        { id: 'mock-1', name: 'Distribuidora Central (Error Fallback)', contact_person: 'Juan Pérez', email: 'juan@distcentral.com', rating: 4.5, is_active: true, created_at: '', updated_at: '' },
        { id: 'mock-2', name: 'Mercado Mayorista Sur (Error Fallback)', contact_person: 'María García', email: 'ventas@mayoristasur.com', rating: 4.2, is_active: true, created_at: '', updated_at: '' },
        { id: 'mock-3', name: 'Panadería Industrial López (Error Fallback)', contact_person: 'Carlos López', email: 'carlos@panlopez.com', rating: 4.8, is_active: true, created_at: '', updated_at: '' }
      ] as Supplier[]);
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierChange = (supplierId: string) => {
    logger.info('MaterialsStore', 'handleSupplierChange called with:', supplierId); // Debug
    if (supplierId === 'new') {
      setShowNewSupplierForm(true);
      updateSupplierData({ supplier_id: undefined });
    } else {
      setShowNewSupplierForm(false);
      updateSupplierData({ supplier_id: supplierId, new_supplier: undefined });
    }
    logger.info('MaterialsStore', 'State updated, supplier_id should be:', supplierId); // Debug
  };

  if (!isVisible) return null;

  return (
    <CardWrapper variant="outline" w="full">
      <CardWrapper.Body>
        <Collapsible.Root open={!isCollapsed} onOpenChange={(details) => setIsCollapsed(!details.open)}>
          <Collapsible.Trigger asChild>
            <Flex
              justify="space-between"
              align="center"
              cursor="pointer"
              _hover={{ bg: "gray.50" }}
              borderRadius="md"
              p="2"
              transition="background 0.2s"
            >
              <Stack gap="1">
                <Text fontWeight="semibold" color="blue.700">
                  Información del Proveedor
                </Text>
                <Text fontSize="sm" color="text.muted">
                  Opcional - Para un mejor control de stock y compras
                </Text>
              </Stack>
              <Box>
                {isCollapsed ? (
                  <ChevronDownIcon width="20px" height="20px" />
                ) : (
                  <ChevronUpIcon width="20px" height="20px" />
                )}
              </Box>
            </Flex>
          </Collapsible.Trigger>

          <Collapsible.Content>
            <Stack gap="4" mt="4" pt="4" borderTop="1px solid" borderColor="border">
              {/* Selector de Proveedor */}
              <Box>
                <SelectField
                  label="Proveedor"
                  collection={useMemo(() => createListCollection({
                    items: [
                      ...suppliers.map(s => ({
                        value: s.id,
                        label: s.rating
                          ? `${s.name} (${s.rating.toFixed(1)} ⭐)`
                          : s.name
                      })),
                      { value: 'new', label: '➕ Crear nuevo proveedor' }
                    ]
                  }), [suppliers])}
                  value={supplierData.supplier_id ? [supplierData.supplier_id] : []}
                  onValueChange={(details) => {
                    logger.info('MaterialsStore', 'Select change:', details);
                    const selectedValue = details.value?.[0] || details.value;
                    handleSupplierChange(selectedValue as string);
                  }}
                  disabled={disabled || loading}
                  error={fieldErrors.supplier_id}
                  placeholder="Seleccionar proveedor..."
                />
              </Box>

              {/* Formulario de Nuevo Proveedor */}
              {showNewSupplierForm && (
                <CardWrapper variant="subtle" padding="md">
                  <CardWrapper.Body>
                    <Stack gap="4">
                      <Text fontWeight="semibold" fontSize="sm" color="blue.700">
                        Crear Nuevo Proveedor
                      </Text>

                      <Flex gap="4" direction={{ base: "column", md: "row" }}>
                        <Box flex="1">
                          <Stack gap="2">
                            <Text fontSize="sm" fontWeight="medium">
                              Nombre del Proveedor *
                            </Text>
                            <InputField
                              value={supplierData.new_supplier?.name || ''}
                              onChange={(e) => updateSupplierData({
                                new_supplier: {
                                  ...supplierData.new_supplier,
                                  name: e.target.value
                                }
                              })}
                              placeholder="Ej: Distribuidora ABC"
                              disabled={disabled}
                            />
                            {fieldErrors['new_supplier.name'] && (
                              <Text fontSize="sm" color="red.500">
                                {fieldErrors['new_supplier.name']}
                              </Text>
                            )}
                          </Stack>
                        </Box>

                        <Box flex="1">
                          <Stack gap="2">
                            <Text fontSize="sm" fontWeight="medium">
                              Persona de Contacto
                            </Text>
                            <InputField
                              value={supplierData.new_supplier?.contact_person || ''}
                              onChange={(e) => updateSupplierData({
                                new_supplier: {
                                  ...supplierData.new_supplier,
                                  contact_person: e.target.value
                                }
                              })}
                              placeholder="Nombre del contacto"
                              disabled={disabled}
                            />
                          </Stack>
                        </Box>
                      </Flex>

                      <Flex gap="4" direction={{ base: "column", md: "row" }}>
                        <Box flex="1">
                          <Stack gap="2">
                            <Text fontSize="sm" fontWeight="medium">
                              Email
                            </Text>
                            <InputField
                              type="email"
                              value={supplierData.new_supplier?.email || ''}
                              onChange={(e) => updateSupplierData({
                                new_supplier: {
                                  ...supplierData.new_supplier,
                                  email: e.target.value
                                }
                              })}
                              placeholder="contacto@proveedor.com"
                              disabled={disabled}
                            />
                            {fieldErrors['new_supplier.email'] && (
                              <Text fontSize="sm" color="red.500">
                                {fieldErrors['new_supplier.email']}
                              </Text>
                            )}
                          </Stack>
                        </Box>

                        <Box flex="1">
                          <Stack gap="2">
                            <Text fontSize="sm" fontWeight="medium">
                              Teléfono
                            </Text>
                            <InputField
                              value={supplierData.new_supplier?.phone || ''}
                              onChange={(e) => updateSupplierData({
                                new_supplier: {
                                  ...supplierData.new_supplier,
                                  phone: e.target.value
                                }
                              })}
                              placeholder="+54 11 4555-0123"
                              disabled={disabled}
                            />
                          </Stack>
                        </Box>
                      </Flex>
                    </Stack>
                  </CardWrapper.Body>
                </CardWrapper>
              )}

              {/* Información de la Compra */}
              <Stack gap="4">
                <Text fontWeight="semibold" fontSize="sm" color="blue.700">
                  Detalles de la Compra
                </Text>

                <Flex gap="4" direction={{ base: "column", md: "row" }}>
                  <Box flex="1">
                    <Stack gap="2">
                      <Text fontSize="sm" fontWeight="medium">
                        Fecha de Compra
                      </Text>
                      <InputField
                        type="date"
                        value={supplierData.purchase_date || new Date().toISOString().split('T')[0]}
                        onChange={(e) => updateSupplierData({ purchase_date: e.target.value })}
                        disabled={disabled}
                      />
                    </Stack>
                  </Box>

                  <Box flex="1">
                    <Stack gap="2">
                      <Text fontSize="sm" fontWeight="medium">
                        Número de Factura
                      </Text>
                      <InputField
                        value={supplierData.invoice_number || ''}
                        onChange={(e) => updateSupplierData({ invoice_number: e.target.value })}
                        placeholder="Ej: FC-2024-001234"
                        disabled={disabled}
                      />
                    </Stack>
                  </Box>
                </Flex>

                <Flex gap="4" direction={{ base: "column", md: "row" }}>
                  <Box flex="1">
                    <Stack gap="2">
                      <Text fontSize="sm" fontWeight="medium">
                        Fecha de Entrega
                      </Text>
                      <InputField
                        type="date"
                        value={supplierData.delivery_date || ''}
                        onChange={(e) => updateSupplierData({ delivery_date: e.target.value })}
                        disabled={disabled}
                      />
                    </Stack>
                  </Box>

                  <Box flex="1">
                    <SelectField
                      label="Calidad (1-5)"
                      collection={useMemo(() => createListCollection({
                        items: [
                          { value: '5', label: '5 - Excelente ⭐⭐⭐⭐⭐' },
                          { value: '4', label: '4 - Muy Buena ⭐⭐⭐⭐' },
                          { value: '3', label: '3 - Buena ⭐⭐⭐' },
                          { value: '2', label: '2 - Regular ⭐⭐' },
                          { value: '1', label: '1 - Mala ⭐' }
                        ]
                      }), [])}
                      value={supplierData.quality_rating ? [supplierData.quality_rating.toString()] : []}
                      onValueChange={(details) => updateSupplierData({
                        quality_rating: details.value[0] ? parseInt(details.value[0]) : undefined
                      })}
                      disabled={disabled}
                      placeholder="Calificar calidad..."
                    />
                  </Box>
                </Flex>
              </Stack>

              {/* Información útil */}
              <CardWrapper variant="subtle" padding="sm">
                <CardWrapper.Body>
                  <Text fontSize="xs" color="text.muted">
                    💡 <strong>Tip:</strong> Esta información te ayudará a rastrear compras, evaluar proveedores y mantener un historial completo de tu inventario.
                  </Text>
                </CardWrapper.Body>
              </CardWrapper>
            </Stack>
          </Collapsible.Content>
        </Collapsible.Root>
      </CardWrapper.Body>
    </CardWrapper>
  );
};