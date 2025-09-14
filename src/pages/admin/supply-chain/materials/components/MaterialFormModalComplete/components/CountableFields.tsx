import { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Text,
  Input,
  Alert,
  CardWrapper ,
  Field,
  Switch,
  Flex,
  NumberInput,
  RadioGroup,
  HStack
} from '@chakra-ui/react';
import { SelectField } from '@/shared/ui';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { type ItemFormData } from '../../../types';
import { CATEGORY_COLLECTION } from '../constants';
import { CountableStockFields } from './CountableFields/CountableStockFields';

interface CountableFieldsProps {
  formData: ItemFormData;
  setFormData: (data: ItemFormData) => void;
  errors: Record<string, string>;
  disabled?: boolean;
  addToStockNow: boolean;
  setAddToStockNow: (value: boolean) => void;
}

// Tipos de configuración de stock
type StockConfigType = 'none' | 'individual' | 'packages';

export const CountableFields = ({ 
  formData, 
  setFormData, 
  errors,
  disabled = false,
  addToStockNow,
  setAddToStockNow
}: CountableFieldsProps) => {
  const [stockConfigType, setStockConfigType] = useState<StockConfigType>('none');
  const [packageQuantity, setPackageQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);

  // Auto-set unit for countable items
  useEffect(() => {
    if (formData.type === 'COUNTABLE' && !formData.unit) {
      setFormData({ ...formData, unit: 'unidad' });
    }
  }, [formData.type]);

  // Handle stock config type changes
  useEffect(() => {
    switch (stockConfigType) {
      case 'none':
        setAddToStockNow(false);
        setFormData({ 
          ...formData, 
          packaging: undefined,
          initial_stock: 0,
          unit_cost: 0
        });
        break;
      case 'individual':
        setAddToStockNow(true);
        setFormData({ ...formData, packaging: undefined });
        break;
      case 'packages':
        setAddToStockNow(true);
        // Keep existing packaging if any
        break;
    }
  }, [stockConfigType]);

  // Auto-calculate from packaging
  useEffect(() => {
    if (stockConfigType === 'packages' && formData.packaging?.package_size && packageQuantity > 0) {
      const totalUnits = packageQuantity * formData.packaging.package_size;
      setFormData({ 
        ...formData, 
        initial_stock: totalUnits 
      });
    }
  }, [stockConfigType, packageQuantity, formData.packaging]);

  // Initialize stock config type based on current state
  useEffect(() => {
    if (!addToStockNow) {
      setStockConfigType('none');
    } else if (formData.packaging?.package_size) {
      setStockConfigType('packages');
    } else {
      setStockConfigType('individual');
    }
  }, []);

  return (
    <Stack gap="6" w="full">
      {/* Business Category */}
      <Box w="full">
        <SelectField
          label="Categoría del Producto"
          placeholder="¿A qué categoría pertenece?"
          collection={CATEGORY_COLLECTION}
          value={formData.category ? [formData.category] : []}
          onValueChange={(details) => 
            setFormData({ 
              ...formData, 
              category: details.value[0]
            })
          }
          disabled={disabled}
          error={errors.category}
          required
          height="44px"
          noPortal={true}
        />
      </Box>

      {/* Info sobre contables */}
      <Alert.Root status="info" variant="subtle">
        <Alert.Indicator>
          <InformationCircleIcon style={{ width: '16px', height: '16px' }} />
        </Alert.Indicator>
        <Alert.Description>
          Items contables se miden en <strong>unidades individuales</strong>. 
          Puedes crearlos sin stock inicial o agregar stock de diferentes maneras.
        </Alert.Description>
      </Alert.Root>

      {/* Nueva configuración unificada */}
      <CardWrapper .Root variant="outline" w="full">
        <CardWrapper .Body>
          <Stack gap="4">
            <Box>
              <Text fontWeight="semibold" mb="3">Configuración de Stock Inicial</Text>
              <RadioGroup.Root
                value={stockConfigType}
                onValueChange={(details) => setStockConfigType(details.value as StockConfigType)}
                disabled={disabled}
              >
                <Stack gap="3">
                  <RadioGroup.Item value="none">
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemControl />
                    <RadioGroup.ItemText>
                      <Stack gap="1">
                        <Text fontWeight="medium">Solo crear el item (sin stock inicial)</Text>
                        <Text fontSize="sm" color="text.muted">
                          Crea el item en el catálogo sin agregar stock al inventario
                        </Text>
                      </Stack>
                    </RadioGroup.ItemText>
                  </RadioGroup.Item>

                  <RadioGroup.Item value="individual">
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemControl />
                    <RadioGroup.ItemText>
                      <Stack gap="1">
                        <Text fontWeight="medium">Agregar por unidades individuales</Text>
                        <Text fontSize="sm" color="text.muted">
                          Ideal para items sueltos o cuando no vienen empaquetados
                        </Text>
                      </Stack>
                    </RadioGroup.ItemText>
                  </RadioGroup.Item>

                  <RadioGroup.Item value="packages">
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemControl />
                    <RadioGroup.ItemText>
                      <Stack gap="1">
                        <Text fontWeight="medium">Agregar por paquetes/cajas</Text>
                        <Text fontSize="sm" color="text.muted">
                          Para items que vienen empaquetados (cajas, bandejas, docenas, etc.)
                        </Text>
                      </Stack>
                    </RadioGroup.ItemText>
                  </RadioGroup.Item>
                </Stack>
              </RadioGroup.Root>
            </Box>

            {/* Configuración de packaging - Solo cuando se selecciona packages */}
            {stockConfigType === 'packages' && (
              <Stack gap="4" pt="4" borderTop="1px solid" borderColor="border">
                <Text fontWeight="medium" color="blue.700">
                  📦 Configuración de Packaging
                </Text>
                
                <Flex gap="4" direction={{ base: "column", md: "row" }}>
                  <Box flex="1">
                    <Field.Root>
                      <Field.Label>Unidades por paquete</Field.Label>
                      <NumberInput.Root
                        value={formData.packaging?.package_size?.toString() || ''}
                        onValueChange={(details) => 
                          !disabled && setFormData({ 
                            ...formData, 
                            packaging: {
                              ...formData.packaging,
                              package_size: parseInt(details.value) || 0,
                              package_unit: formData.packaging?.package_unit || '',
                              display_mode: 'individual'
                            }
                          })
                        }
                        min={1}
                        disabled={disabled}
                      >
                        <NumberInput.Control>
                          <NumberInput.IncrementTrigger />
                          <NumberInput.DecrementTrigger />
                        </NumberInput.Control>
                        <NumberInput.Input 
                          placeholder="ej: 30"
                          height="44px"
                          fontSize="md"
                          px="3"
                          borderRadius="md"
                        />
                      </NumberInput.Root>
                    </Field.Root>
                  </Box>
                  
                  <Box flex="1">
                    <Field.Root>
                      <Field.Label>Tipo de paquete</Field.Label>
                      <Input
                        placeholder="ej: bandeja, caja, docena"
                        value={formData.packaging?.package_unit || ''}
                        onChange={(e) => 
                          !disabled && setFormData({ 
                            ...formData, 
                            packaging: {
                              ...formData.packaging,
                              package_size: formData.packaging?.package_size || 0,
                              package_unit: e.target.value,
                              display_mode: 'individual'
                            }
                          })
                        }
                        disabled={disabled}
                        height="44px"
                        fontSize="md"
                        px="3"
                        borderRadius="md"
                      />
                    </Field.Root>
                  </Box>
                </Flex>
                
                {formData.packaging?.package_size && formData.packaging?.package_unit && (
                  <Alert.Root status="success" variant="subtle">
                    <Alert.Indicator>
                      <InformationCircleIcon style={{ width: '16px', height: '16px' }} />
                    </Alert.Indicator>
                    <Alert.Description>
                      <Text>
                        <strong>Configuración:</strong> {formData.packaging.package_size} unidades por {formData.packaging.package_unit}
                        <br />
                        <strong>Ejemplo:</strong> Si tienes 3 {formData.packaging.package_unit}s = {3 * formData.packaging.package_size} unidades
                      </Text>
                    </Alert.Description>
                  </Alert.Root>
                )}
              </Stack>
            )}
          </Stack>
        </CardWrapper .Body>
      </CardWrapper .Root>

      {/* Stock Fields - Solo cuando se selecciona agregar stock */}
      {stockConfigType !== 'none' && (
        <CountableStockFields
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          disabled={disabled}
          addToStockNow={addToStockNow}
          setAddToStockNow={setAddToStockNow}
          usePackaging={stockConfigType === 'packages'}
          packageQuantity={packageQuantity}
          setPackageQuantity={setPackageQuantity}
          unitPrice={unitPrice}
          setUnitPrice={setUnitPrice}
        />
      )}
    </Stack>
  );
};
