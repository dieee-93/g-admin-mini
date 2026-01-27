import { useMemo, useState, memo } from 'react';
import {
  Box,
  Stack,
  Text,
  Flex,
  Collapsible,
} from '@/shared/ui';
import { CardWrapper, InputField, SelectField, createListCollection } from '@/shared/ui';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useSuppliers } from '@/modules/suppliers/hooks';
import { logger } from '@/lib/logging';

/**
 * SupplierFields Component
 * 
 * ✅ ARCHITECTURE: TanStack Query Pattern (Industry Validated)
 * - Server state via TanStack Query hooks
 * - Optimal caching and background refetching
 * - Automatic cross-module reactivity
 * 
 * @see src/hooks/useSuppliers.ts - TanStack Query hooks
 * @see ZUSTAND_TANSTACK_MIGRATION_AUDIT.md - Migration guide
 */

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
  onCreateNew?: () => void; // Optional callback to trigger wizard
}

// ⚡ PERFORMANCE: React.memo prevents re-renders when props don't change
const SupplierFields = memo(function SupplierFields({
  supplierData,
  updateSupplierData,
  fieldErrors,
  disabled = false,
  isVisible,
  onCreateNew
}: SupplierFieldsProps) {
  // ============================================================================
  // ✅ TANSTACK QUERY - Server state management
  // ============================================================================
  // Fetch active suppliers (TanStack Query handles caching automatically)
  const { data: suppliers = [], isLoading } = useSuppliers({ status: 'active' });

  // Memoize the supplier collection for the select dropdown
  const supplierCollection = useMemo(() => {
    return createListCollection({
      items: [
        ...suppliers.map(s => ({
          value: s.id,
          label: s.rating
            ? `${s.name} (${s.rating.toFixed(1)} ⭐)`
            : s.name
        })),
        { value: 'new', label: '➕ Crear nuevo proveedor' }
      ]
    });
  }, [suppliers]);

  // ============================================================================
  // LOCAL UI STATE
  // ============================================================================
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showNewSupplierForm, setShowNewSupplierForm] = useState(false);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  const handleSupplierChange = (supplierId: string) => {
    if (supplierId === 'new') {
      if (onCreateNew) {
        // Use wizard modal if callback provided
        onCreateNew();
      } else {
        // Fallback to inline form
        setShowNewSupplierForm(true);
        updateSupplierData({ supplier_id: undefined });
      }
    } else {
      setShowNewSupplierForm(false);
      updateSupplierData({ supplier_id: supplierId, new_supplier: undefined });
    }
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
                  collection={supplierCollection}
                  value={supplierData.supplier_id ? [supplierData.supplier_id] : []}
                  onValueChange={(details) => {
                    const selectedValue = details.value?.[0] || details.value;
                    handleSupplierChange(selectedValue as string);
                  }}
                  disabled={disabled || isLoading}
                  error={fieldErrors.supplier_id}
                  placeholder="Seleccionar proveedor..."
                  height="44px"
                  noPortal={true}
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
                                  name: supplierData.new_supplier?.name || '',
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
                                  name: supplierData.new_supplier?.name || '',
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
                                  name: supplierData.new_supplier?.name || '',
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
                      height="44px"
                      noPortal={true}
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
});

// ✅ Already wrapped with memo in the component definition above
export default SupplierFields;
SupplierFields.displayName = 'SupplierFields';