import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Container,
  Badge,
  Alert,
  Dialog,
  Field,
  Spinner,
  Text,
  Stack,
  HStack,
  Flex,
  Progress,
  Portal
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

// Components
import { TypeSelector } from './components/TypeSelector';
import { MeasurableFields } from './components/MeasurableFields';
import { CountableFields } from './components/CountableFields';
import { ElaboratedFields } from './components/ElaboratedFields';
import { ValidatedField } from './components/FormSections/ValidatedField';
import { SupplierFields } from './components/SupplierFields';

// Store & Hooks
import { useMaterials } from '@/store/materialsStore';
import { useMaterialValidation } from '@/hooks';

// Types
import {
  type ItemFormData,
  type ItemType,
  type AllUnit,
  type MaterialItem,
  type SupplierFormData,
  isMeasurable,
  isCountable,
  isElaborated
} from '../../types';

interface MaterialFormDialogProps {
  // Se maneja internamente con el store
}

export const MaterialFormDialog = () => {
  const { 
    isModalOpen, 
    modalMode, 
    currentItem, 
    closeModal,
    addItem,
    updateItem,
    alerts,
    alertSummary,
    items
  } = useMaterials();
  
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    type: '' as ItemType,
    unit: '' as AllUnit,
    initial_stock: 0,
    unit_cost: 0,
    supplier: {
      purchase_date: new Date().toISOString().split('T')[0]
    }
  });

  // Optimized validation hook with real-time feedback
  const {
    fieldErrors,
    fieldWarnings,
    validationState,
    validateField,
    validateForm: optimizedValidateForm,
    clearValidation
  } = useMaterialValidation(formData, items, {
    enableRealTime: true,
    debounceMs: 300
  });

  // Memoized form data update function to prevent cascading re-renders
  const updateFormData = useCallback((updates: Partial<ItemFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, [setFormData]);

  // Optimized field update handlers with validation
  const handleFieldChange = useCallback((field: keyof ItemFormData) => 
    (value: unknown) => {
      setFormData(prev => ({ ...prev, [field]: value as any }));
      validateField(field as string, value as any);
    }, [validateField, setFormData]
  );

  // Memoized handlers for form updates
  const handleNameChange = useCallback((name: string) => {
    handleFieldChange('name')(name);
  }, [handleFieldChange]);

  const handleTypeChange = useCallback((type: ItemType) => {
    updateFormData({ 
      type, 
      unit: '' as AllUnit, 
      category: undefined,
      packaging: undefined,
      recipe_id: undefined
    });
    validateField('type', type);
  }, [updateFormData, validateField]);

  const updateSupplierData = useCallback((updates: Partial<SupplierFormData>) => {
    setFormData(prev => ({
      ...prev,
      supplier: {
        ...prev.supplier,
        ...updates
      }
    }));
  }, []);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addToStockNow, setAddToStockNow] = useState(false);

  // Enhanced loading states for better UX feedback
  const [loadingStates, setLoadingStates] = useState({
    initializing: false,
    validating: false,
    calculating: false,
    savingToStock: false
  });

  // Success states for visual confirmation
  const [successStates, setSuccessStates] = useState({
    itemCreated: false,
    stockAdded: false,
    validationPassed: false
  });

  const isEditMode = modalMode === 'edit';
  const isViewMode = modalMode === 'view';

  // Para ELABORATED siempre se agrega a stock
  useEffect(() => {
    if (formData.type === 'ELABORATED') {
      setAddToStockNow(true);
    } else if (formData.type === 'MEASURABLE' || formData.type === 'COUNTABLE') {
      setAddToStockNow(false);
    }
  }, [formData.type]);

  // Initialize form when modal opens
  useEffect(() => {
    if (isModalOpen && currentItem) {
      // Pre-fill form with current item data
      const itemFormData: ItemFormData = {
        name: currentItem.name,
        type: currentItem.type,
        unit: getItemUnit(currentItem),
        initial_stock: currentItem.stock,
        unit_cost: currentItem.unit_cost || 0
      };

      // Add type-specific data
      if (isMeasurable(currentItem)) {
        itemFormData.category = currentItem.category;
      } else if (isCountable(currentItem)) {
        itemFormData.packaging = currentItem.packaging;
      } else if (isElaborated(currentItem)) {
        itemFormData.recipe_id = currentItem.recipe_id;
      }

      setFormData(itemFormData);
    } else if (isModalOpen) {
      // Reset form for new item
      setFormData({
        name: '',
        type: '' as ItemType,
        unit: '' as AllUnit,
        initial_stock: 0,
        unit_cost: 0,
        supplier: {
          purchase_date: new Date().toISOString().split('T')[0]
        }
      });
    }
  }, [isModalOpen, currentItem]);

  // Clear validation when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      clearValidation();
    }
  }, [isModalOpen, clearValidation]);

  // Memoized helper function to get item unit
  const getItemUnit = useCallback((item: MaterialItem): AllUnit => {
    if (isMeasurable(item)) return item.unit;
    if (isCountable(item)) return 'unidad';
    if (isElaborated(item)) return item.unit;
    return 'unidad' as AllUnit;
  }, []);

  // Enhanced form status badge with real-time validation
  const formStatusBadge = useMemo(() => {
    
    if (!formData.name || !formData.type) {
      return <Badge colorPalette="gray" variant="subtle">Incompleto</Badge>;
    }
    
    if (formData.type === 'MEASURABLE' && (!formData.category || !formData.unit)) {
      return <Badge colorPalette="blue" variant="subtle">Configura medición</Badge>;
    }
    
    if (formData.type === 'ELABORATED') {
      if (!formData.recipe_id) {
        return <Badge colorPalette="purple" variant="subtle">Crea una receta</Badge>;
      }
    }
    
    if (validationState.hasErrors) {
      return <Badge colorPalette="red" variant="subtle">Con errores ({validationState.errorCount})</Badge>;
    }
    
    if (validationState.hasWarnings) {
      return <Badge colorPalette="orange" variant="subtle">Con advertencias</Badge>;
    }
    
    return <Badge colorPalette="green" variant="subtle">✓ Listo para guardar</Badge>;
  }, [formData.name, formData.type, formData.category, formData.unit, formData.recipe_id, validationState]);

  // Use optimized validation function
  const validateForm = useCallback(async () => {
    return await optimizedValidateForm();
  }, [optimizedValidateForm]);

  // Enhanced submit handler with progressive feedback
  const handleSubmit = useCallback(async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    setIsSubmitting(true);
    
    // Step 1: Validation feedback
    setLoadingStates(prev => ({ ...prev, validating: true }));
    
    // Simulate validation time for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    setLoadingStates(prev => ({ ...prev, validating: false }));
    setSuccessStates(prev => ({ ...prev, validationPassed: true }));

    try {
      if (isEditMode && currentItem) {
        // Step 2: Updating item
        await updateItem(currentItem.id, formData as Partial<MaterialItem>);
        setSuccessStates(prev => ({ ...prev, itemCreated: true }));
      } else {
        // Step 2: Creating item
        if (addToStockNow) {
          // Step 3: Adding to stock
          setLoadingStates(prev => ({ ...prev, savingToStock: true }));
          
          await addItem(formData);
          
          setLoadingStates(prev => ({ ...prev, savingToStock: false }));
          setSuccessStates(prev => ({ 
            ...prev, 
            itemCreated: true, 
            stockAdded: true 
          }));
        } else {
          const itemDataWithoutStock = {
            ...formData,
            initial_stock: 0,
            unit_cost: 0
          };
          await addItem(itemDataWithoutStock);
          setSuccessStates(prev => ({ ...prev, itemCreated: true }));
        }
      }
      
      // Success delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      closeModal();
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsSubmitting(false);
      setLoadingStates({
        initializing: false,
        validating: false,
        calculating: false,
        savingToStock: false
      });
      setSuccessStates({
        itemCreated: false,
        stockAdded: false,
        validationPassed: false
      });
    }
  }, [validateForm, isEditMode, currentItem, updateItem, formData, addToStockNow, addItem, closeModal]);

  // Memoized title
  const modalTitle = useMemo(() => {
    switch (modalMode) {
      case 'add': return 'Crear Nuevo Material';
      case 'edit': return 'Editar Material';
      case 'view': return 'Ver Material';
      default: return 'Material';
    }
  }, [modalMode]);

  // Progressive loading indicator for submit button
  const submitButtonContent = useMemo(() => {
    if (loadingStates.validating) {
      return (
        <HStack gap="2">
          <Spinner size="sm" />
          <Text>Validando...</Text>
        </HStack>
      );
    }
    
    if (loadingStates.savingToStock) {
      return (
        <HStack gap="2">
          <Spinner size="sm" />
          <Text>Agregando a stock...</Text>
        </HStack>
      );
    }
    
    if (isSubmitting) {
      return (
        <HStack gap="2">
          <Spinner size="sm" />
          <Text>{isEditMode ? 'Actualizando...' : 'Creando...'}</Text>
        </HStack>
      );
    }

    if (successStates.itemCreated && successStates.stockAdded) {
      return (
        <HStack gap="2">
          <CheckCircleIcon style={{ width: '16px', height: '16px' }} />
          <Text>¡Completado!</Text>
        </HStack>
      );
    }

    return (
      <>
        <CheckCircleIcon style={{ width: '16px', height: '16px' }} />
        {isEditMode ? 'Actualizar Item' : 
          addToStockNow ? 'Crear y Agregar a Stock' : 'Crear Item'
        }
      </>
    );
  }, [loadingStates, isSubmitting, successStates, isEditMode, addToStockNow]);

  // Operation progress indicator
  const operationProgress = useMemo(() => {
    if (!isSubmitting) return null;

    let progress = 0;
    let currentStep = "";

    if (loadingStates.validating) {
      progress = 25;
      currentStep = "Validando formulario";
    } else if (successStates.validationPassed && !successStates.itemCreated) {
      progress = 50;
      currentStep = isEditMode ? "Actualizando material" : "Creando material";
    } else if (loadingStates.savingToStock) {
      progress = 75;
      currentStep = "Agregando al inventario";
    } else if (successStates.itemCreated) {
      progress = 100;
      currentStep = "¡Operación completada!";
    }

    return (
      <Box w="full" mt="4">
        <Stack gap="2">
          <Flex justify="space-between" align="center">
            <Text fontSize="sm" color="fg.muted">{currentStep}</Text>
            <Text fontSize="sm" color="fg.muted">{progress}%</Text>
          </Flex>
          <Progress.Root value={progress} size="sm" colorPalette="blue">
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        </Stack>
      </Box>
    );
  }, [isSubmitting, loadingStates, successStates, isEditMode]);

  return (
    <Dialog.Root 
      open={isModalOpen} 
      onOpenChange={(details: { open: boolean }) => !details.open && !isSubmitting && closeModal()}
      size={{ base: "full", md: "xl" }}
      closeOnEscape={!isSubmitting}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content
          maxW={{ base: "100%", md: "800px" }}
          maxH={{ base: "100vh", md: "90vh" }}
          w="full"
          overflowY="visible"
          borderRadius={{ base: "0", md: "lg" }}
          m={{ base: "0", md: "4" }}
        >
          <Dialog.CloseTrigger />
          <Dialog.Header>
            <Dialog.Title>{modalTitle}</Dialog.Title>
          </Dialog.Header>
          
          <Dialog.Body p={{ base: "4", md: "6" }}>
            <Container maxW="full" p="0">
              <Stack gap={{ base: "4", md: "6" }} w="full">
                {/* Banner de alertas críticas */}
                {alertSummary.hasCritical && (
                  <Alert.Root status="error" variant="subtle">
                    <Alert.Indicator>
                      <ExclamationTriangleIcon style={{ width: '20px', height: '20px' }} />
                    </Alert.Indicator>
                    <Alert.Title>Atención: Stock crítico detectado</Alert.Title>
                    <Alert.Description>
                      Hay {alertSummary.critical} items con stock crítico. 
                      Considera agregarlos a tu lista de compras.
                    </Alert.Description>
                  </Alert.Root>
                )}

                {/* Header con estado */}
                <Flex 
                  justify="space-between" 
                  align={{ base: "flex-start", md: "center" }}
                  direction={{ base: "column", md: "row" }}
                  gap={{ base: "3", md: "0" }}
                >
                  <Stack gap="1">
                    <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold">
                      {isEditMode ? 'Editar Item' : 'Crear Nuevo Item'}
                    </Text>
                    {alertSummary.hasWarning && !alertSummary.hasCritical && (
                      <Text fontSize="sm" color="fg.warning">
                        💡 {alerts.length} items necesitan reposición
                      </Text>
                    )}
                  </Stack>
                  {formStatusBadge}
                </Flex>

                {/* Nombre del item */}
                <Box w="full">
                  <ValidatedField
                    label="Nombre del Item"
                    value={formData.name}
                    onChange={handleNameChange}
                    onValidate={validateField}
                    field="name"
                    error={fieldErrors.name}
                    warning={fieldWarnings.name}
                    isValidating={false}
                    placeholder="Ej: Harina 0000, Huevos, Relleno de carne..."
                    required={true}
                    disabled={isViewMode}
                  />
                </Box>

                {/* Selector de tipo */}
                {!isViewMode && (
                  <TypeSelector
                    value={formData.type}
                    onChange={handleTypeChange}
                    errors={fieldErrors}
                    disabled={isViewMode}
                  />
                )}

                {/* Campos específicos por tipo */}
                {formData.type === 'MEASURABLE' && (
                  <MeasurableFields 
                    formData={formData} 
                    updateFormData={updateFormData} 
                    fieldErrors={fieldErrors}
                    disabled={isViewMode}
                    addToStockNow={addToStockNow}
                    setAddToStockNow={setAddToStockNow} 
                  />
                )}
                
                {formData.type === 'COUNTABLE' && (
                  <CountableFields 
                    formData={formData} 
                    setFormData={setFormData} 
                    errors={fieldErrors}
                    disabled={isViewMode}
                    addToStockNow={addToStockNow}
                    setAddToStockNow={setAddToStockNow}
                  />
                )}
                
                {formData.type === 'ELABORATED' && (
                  <ElaboratedFields 
                    formData={formData} 
                    setFormData={setFormData} 
                  />
                )}

                {/* Sección de proveedor - Solo cuando se va a agregar stock */}
                {addToStockNow && formData.type && (
                  <SupplierFields
                    supplierData={formData.supplier || {}}
                    updateSupplierData={updateSupplierData}
                    fieldErrors={fieldErrors}
                    disabled={isViewMode}
                    isVisible={addToStockNow}
                  />
                )}

                {/* Operation progress indicator */}
                {operationProgress}

                {/* Botones de acción */}
                {!isViewMode && (
                  <Flex 
                    gap="3" 
                    pt="4" 
                    justify={{ base: "stretch", md: "flex-end" }}
                    direction={{ base: "column-reverse", md: "row" }}
                    borderTop="1px solid" 
                    borderColor="border"
                  >
                    <Button 
                      variant="outline" 
                      onClick={closeModal}
                      disabled={isSubmitting}
                      height="44px"
                      fontSize="md"
                      px="6"
                      w={{ base: "full", md: "auto" }}
                    >
                      Cancelar
                    </Button>
                    
                    <Button 
                      colorPalette={successStates.itemCreated ? "green" : "blue"}
                      onClick={handleSubmit}
                      disabled={
                        !formData.name || 
                        !formData.type || 
                        isSubmitting || 
                        validationState.hasErrors
                      }
                      height="44px"
                      fontSize="md"
                      px="6"
                      w={{ base: "full", md: "auto" }}
                    >
                      {submitButtonContent}
                    </Button>
                  </Flex>
                )}

                {isViewMode && (
                  <Flex gap="3" pt="4" justify={{ base: "stretch", md: "flex-end" }} borderTop="1px solid" borderColor="border">
                    <Button
                      variant="outline"
                      onClick={closeModal}
                      height="44px"
                      fontSize="md"
                      px="6"
                      w={{ base: "full", md: "auto" }}
                    >
                      Cerrar
                    </Button>
                  </Flex>
                )}
              </Stack>
            </Container>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
