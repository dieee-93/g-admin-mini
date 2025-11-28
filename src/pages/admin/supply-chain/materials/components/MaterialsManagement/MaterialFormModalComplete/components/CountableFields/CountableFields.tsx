import { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Text,
  Switch,
  Alert,
  Flex
} from '@/shared/ui';
import { SelectField, InputField, CardWrapper } from '@/shared/ui';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { type ItemFormData } from '../../../../types';
import { CATEGORY_COLLECTION } from '../../constants';
import { CountableStockFields } from './CountableStockFields';

interface CountableFieldsProps {
  formData: ItemFormData;
  setFormData: (data: ItemFormData) => void;
  errors: Record<string, string>;
  disabled?: boolean;
  addToStockNow: boolean;
  setAddToStockNow: (value: boolean) => void;
}

export const CountableFields = ({
  formData,
  setFormData,
  errors,
  disabled = false,
  addToStockNow,
  setAddToStockNow
}: CountableFieldsProps) => {
  const [usePackaging, setUsePackaging] = useState(!!formData.packaging);
  const [packageQuantity, setPackageQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);

  useEffect(() => {
    if (formData.type === 'COUNTABLE' && !formData.unit) {
      setFormData({ ...formData, unit: 'unidad' });
    }
  }, [formData.type, formData.unit]); // ✅ FIX GAP 2: Remove formData, setFormData (causes infinite loop)

  useEffect(() => {
    if (!usePackaging) {
      setFormData((prev) => ({ ...prev, packaging: undefined }));
      setPackageQuantity(1);
    }
  }, [usePackaging, setFormData]); // ✅ FIX GAP 2: Use functional update, remove formData dep

  useEffect(() => {
    if (formData.packaging?.package_size && formData.initial_stock) {
      const calculatedPackages = Math.floor(formData.initial_stock / formData.packaging.package_size);
      if (calculatedPackages > 0) {
        setPackageQuantity(calculatedPackages);
      }
    }
  }, [formData.packaging, formData.initial_stock]);

  useEffect(() => {
    if (!usePackaging && formData.initial_stock && formData.unit_cost && formData.initial_stock > 0) {
      setUnitPrice(formData.unit_cost / formData.initial_stock);
    }
  }, [usePackaging, formData.initial_stock, formData.unit_cost]);

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
          Si vienen empaquetados, configura el packaging abajo para facilitar el conteo.
        </Alert.Description>
      </Alert.Root>

      {/* Packaging */}
      <CardWrapper variant="outline" w="full">
        <CardWrapper.Body>
          <Stack gap="4">
            <Flex justify="space-between" align="center">
              <Stack gap="1">
                <Text fontWeight="semibold">¿Viene empaquetado?</Text>
                <Text fontSize="sm" color="text.muted">
                  Activa si el item viene en cajas, bandejas, docenas, etc.
                </Text>
              </Stack>
              <Switch
                checked={usePackaging}
                onChange={(checked) => !disabled && setUsePackaging(checked)}
                disabled={disabled}
              />
            </Flex>

            {usePackaging && (
              <Stack gap="4" pt="4" borderTop="1px solid" borderColor="border">
                <Flex gap="4" direction={{ base: "column", md: "row" }}>
                  <Box flex="1">
                    <InputField
                      placeholder="ej: 30"
                      type="number"
                      value={formData.packaging?.package_size || ''}
                      onChange={(e) =>
                        !disabled && setFormData({
                          ...formData,
                          packaging: {
                            ...formData.packaging,
                            package_size: parseInt(e.target.value) || 0,
                            package_unit: formData.packaging?.package_unit || '',
                            display_mode: 'individual'
                          }
                        })
                      }
                      disabled={disabled}
                      height="44px"
                      fontSize="md"
                      px="3"
                    />
                  </Box>

                  <Box flex="1">
                    <InputField
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
                    />
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
        </CardWrapper.Body>
      </CardWrapper>

      {/* Stock Fields */}
      <CountableStockFields
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        disabled={disabled}
        addToStockNow={addToStockNow}
        setAddToStockNow={setAddToStockNow}
        usePackaging={usePackaging}
        packageQuantity={packageQuantity}
        setPackageQuantity={setPackageQuantity}
        unitPrice={unitPrice}
        setUnitPrice={setUnitPrice}
      />
    </Stack>
  );
};
