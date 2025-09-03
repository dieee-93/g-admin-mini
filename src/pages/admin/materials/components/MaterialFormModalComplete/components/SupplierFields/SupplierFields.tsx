import { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Text,
  Field,
  Input,
  Flex,
  Select,
  IconButton,
  Card as ChakraCard,
  Collapsible
} from '@chakra-ui/react';
import { Card } from '@/shared/ui';
import { PlusIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

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
  }, [isVisible]);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      // Usar la API real de suppliers
      const { suppliersApi } = await import('../../../../data/suppliersApi');
      const suppliersData = await suppliersApi.getActiveSuppliers();
      console.log('Suppliers loaded from API:', suppliersData); // Debug
      
      if (suppliersData && suppliersData.length > 0) {
        setSuppliers(suppliersData);
      } else {
        console.log('No suppliers found in DB, using fallback data'); // Debug
        // Fallback a mock data si no hay suppliers en DB
        setSuppliers([
          { id: 'mock-1', name: 'Distribuidora Central (Mock)', contact_person: 'Juan Pérez', email: 'juan@distcentral.com', rating: 4.5, is_active: true, created_at: '', updated_at: '' },
          { id: 'mock-2', name: 'Mercado Mayorista Sur (Mock)', contact_person: 'María García', email: 'ventas@mayoristasur.com', rating: 4.2, is_active: true, created_at: '', updated_at: '' },
          { id: 'mock-3', name: 'Panadería Industrial López (Mock)', contact_person: 'Carlos López', email: 'carlos@panlopez.com', rating: 4.8, is_active: true, created_at: '', updated_at: '' }
        ] as Supplier[]);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
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
    console.log('handleSupplierChange called with:', supplierId); // Debug
    if (supplierId === 'new') {
      setShowNewSupplierForm(true);
      updateSupplierData({ supplier_id: undefined });
    } else {
      setShowNewSupplierForm(false);
      updateSupplierData({ supplier_id: supplierId, new_supplier: undefined });
    }
    console.log('State updated, supplier_id should be:', supplierId); // Debug
  };

  if (!isVisible) return null;

  return (
    <ChakraCard.Root variant="outline" w="full">
      <ChakraCard.Body>
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
                <Field.Root invalid={!!fieldErrors.supplier_id}>
                  <Field.Label fontSize="sm" fontWeight="medium" mb="2">
                    Proveedor
                  </Field.Label>
                  <Flex gap="2">
                    <Select.Root
                      value={supplierData.supplier_id || ''}
                      onValueChange={(details) => {
                        console.log('Select change:', details); // Debug
                        const selectedValue = details.value?.[0] || details.value;
                        handleSupplierChange(selectedValue as string);
                      }}
                      disabled={disabled || loading}
                      flex="1"
                    >
                      <Select.Trigger>
                        <Select.ValueText placeholder="Seleccionar proveedor..." />
                      </Select.Trigger>
                      <Select.Content>
                        {suppliers.map((supplier) => (
                          <Select.Item key={supplier.id} item={supplier.id}>
                            <Select.ItemText>
                              {supplier.name}
                              {supplier.rating && (
                                <Text as="span" fontSize="xs" color="text.muted" ml="2">
                                  ({supplier.rating.toFixed(1)} ⭐)
                                </Text>
                              )}
                            </Select.ItemText>
                          </Select.Item>
                        ))}
                        <Select.Item item="new">
                          <Select.ItemText>
                            <Flex align="center" gap="2">
                              <PlusIcon width="16px" height="16px" />
                              Crear nuevo proveedor
                            </Flex>
                          </Select.ItemText>
                        </Select.Item>
                      </Select.Content>
                    </Select.Root>
                  </Flex>
                  <Field.ErrorText>{fieldErrors.supplier_id}</Field.ErrorText>
                </Field.Root>
              </Box>

              {/* Formulario de Nuevo Proveedor */}
              {showNewSupplierForm && (
                <Card variant="subtle" padding="md">
                  <Card.Body>
                    <Stack gap="4">
                      <Text fontWeight="semibold" fontSize="sm" color="blue.700">
                        Crear Nuevo Proveedor
                      </Text>
                      
                      <Flex gap="4" direction={{ base: "column", md: "row" }}>
                        <Box flex="1">
                          <Field.Root invalid={!!fieldErrors['new_supplier.name']}>
                            <Field.Label fontSize="sm" fontWeight="medium" mb="2">
                              Nombre del Proveedor *
                            </Field.Label>
                            <Input
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
                            <Field.ErrorText>{fieldErrors['new_supplier.name']}</Field.ErrorText>
                          </Field.Root>
                        </Box>
                        
                        <Box flex="1">
                          <Field.Root>
                            <Field.Label fontSize="sm" fontWeight="medium" mb="2">
                              Persona de Contacto
                            </Field.Label>
                            <Input
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
                          </Field.Root>
                        </Box>
                      </Flex>

                      <Flex gap="4" direction={{ base: "column", md: "row" }}>
                        <Box flex="1">
                          <Field.Root invalid={!!fieldErrors['new_supplier.email']}>
                            <Field.Label fontSize="sm" fontWeight="medium" mb="2">
                              Email
                            </Field.Label>
                            <Input
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
                            <Field.ErrorText>{fieldErrors['new_supplier.email']}</Field.ErrorText>
                          </Field.Root>
                        </Box>
                        
                        <Box flex="1">
                          <Field.Root>
                            <Field.Label fontSize="sm" fontWeight="medium" mb="2">
                              Teléfono
                            </Field.Label>
                            <Input
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
                          </Field.Root>
                        </Box>
                      </Flex>
                    </Stack>
                  </Card.Body>
                </CardWrapper>
              )}

              {/* Información de la Compra */}
              <Stack gap="4">
                <Text fontWeight="semibold" fontSize="sm" color="blue.700">
                  Detalles de la Compra
                </Text>
                
                <Flex gap="4" direction={{ base: "column", md: "row" }}>
                  <Box flex="1">
                    <Field.Root>
                      <Field.Label fontSize="sm" fontWeight="medium" mb="2">
                        Fecha de Compra
                      </Field.Label>
                      <Input
                        type="date"
                        value={supplierData.purchase_date || new Date().toISOString().split('T')[0]}
                        onChange={(e) => updateSupplierData({ purchase_date: e.target.value })}
                        disabled={disabled}
                      />
                    </Field.Root>
                  </Box>
                  
                  <Box flex="1">
                    <Field.Root>
                      <Field.Label fontSize="sm" fontWeight="medium" mb="2">
                        Número de Factura
                      </Field.Label>
                      <Input
                        value={supplierData.invoice_number || ''}
                        onChange={(e) => updateSupplierData({ invoice_number: e.target.value })}
                        placeholder="Ej: FC-2024-001234"
                        disabled={disabled}
                      />
                    </Field.Root>
                  </Box>
                </Flex>

                <Flex gap="4" direction={{ base: "column", md: "row" }}>
                  <Box flex="1">
                    <Field.Root>
                      <Field.Label fontSize="sm" fontWeight="medium" mb="2">
                        Fecha de Entrega
                      </Field.Label>
                      <Input
                        type="date"
                        value={supplierData.delivery_date || ''}
                        onChange={(e) => updateSupplierData({ delivery_date: e.target.value })}
                        disabled={disabled}
                      />
                    </Field.Root>
                  </Box>
                  
                  <Box flex="1">
                    <Field.Root>
                      <Field.Label fontSize="sm" fontWeight="medium" mb="2">
                        Calidad (1-5)
                      </Field.Label>
                      <Select.Root
                        value={supplierData.quality_rating?.toString() || ''}
                        onValueChange={(details) => updateSupplierData({ 
                          quality_rating: details.value[0] ? parseInt(details.value[0]) : undefined 
                        })}
                        disabled={disabled}
                      >
                        <Select.Trigger>
                          <Select.ValueText placeholder="Calificar calidad..." />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item item="5">
                            <Select.ItemText>5 - Excelente ⭐⭐⭐⭐⭐</Select.ItemText>
                          </Select.Item>
                          <Select.Item item="4">
                            <Select.ItemText>4 - Muy Buena ⭐⭐⭐⭐</Select.ItemText>
                          </Select.Item>
                          <Select.Item item="3">
                            <Select.ItemText>3 - Buena ⭐⭐⭐</Select.ItemText>
                          </Select.Item>
                          <Select.Item item="2">
                            <Select.ItemText>2 - Regular ⭐⭐</Select.ItemText>
                          </Select.Item>
                          <Select.Item item="1">
                            <Select.ItemText>1 - Mala ⭐</Select.ItemText>
                          </Select.Item>
                        </Select.Content>
                      </Select.Root>
                    </Field.Root>
                  </Box>
                </Flex>
              </Stack>

              {/* Información útil */}
              <Card variant="subtle" padding="sm">
                <Card.Body>
                  <Text fontSize="xs" color="text.muted">
                    💡 <strong>Tip:</strong> Esta información te ayudará a rastrear compras, evaluar proveedores y mantener un historial completo de tu inventario.
                  </Text>
                </Card.Body>
              </CardWrapper>
            </Stack>
          </Collapsible.Content>
        </Collapsible.Root>
      </ChakraCard.Body>
    </ChakraCard.Root>
  );
};