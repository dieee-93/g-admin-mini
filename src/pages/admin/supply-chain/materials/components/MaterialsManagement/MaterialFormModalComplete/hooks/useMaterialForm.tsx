import { useState, useEffect, useCallback, useMemo } from 'react';
import { Badge } from '@/shared/ui';
import { useMaterials } from '@/store/materialsStore';
import { useMaterialValidation } from '@/hooks';
import { logger } from '@/lib/logging';
import {
  type ItemFormData,
  type ItemType,
  type AllUnit,
  type MaterialItem,
  type SupplierFormData,
  isMeasurable,
  isCountable,
  isElaborated
} from '../../../../types';
import {
    CheckCircleIcon,
  } from '@heroicons/react/24/outline';
import {
    HStack,
    Spinner,
    Text,
} from '@/shared/ui';

export const useMaterialForm = () => {
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

  const updateFormData = useCallback((updates: Partial<ItemFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, [setFormData]);

  const handleFieldChange = useCallback((field: keyof ItemFormData) =>
    (value: unknown) => {
      setFormData(prev => ({ ...prev, [field]: value as ItemFormData[typeof field] }));
      validateField(field as string, value);
    }, [validateField, setFormData]
  );

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

  const [loadingStates, setLoadingStates] = useState({
    initializing: false,
    validating: false,
    calculating: false,
    savingToStock: false
  });

  const [successStates, setSuccessStates] = useState({
    itemCreated: false,
    stockAdded: false,
    validationPassed: false
  });

  const isEditMode = modalMode === 'edit';
  const isViewMode = modalMode === 'view';
  // Helper function to get unit from MaterialItem
  const getItemUnit = useCallback((item: MaterialItem): AllUnit => {
    if (isMeasurable(item)) return item.unit;
    if (isCountable(item)) return 'unidad';
    if (isElaborated(item)) return item.unit;
    return 'unidad' as AllUnit;
  }, []);

  useEffect(() => {
    if (formData.type === 'ELABORATED') {
      setAddToStockNow(true);
    } else if (formData.type === 'MEASURABLE' || formData.type === 'COUNTABLE') {
      setAddToStockNow(false);
    }
  }, [formData.type]);

  useEffect(() => {
    if (isModalOpen && currentItem) {
      const itemFormData: ItemFormData = {
        name: currentItem.name,
        type: currentItem.type,
        unit: getItemUnit(currentItem),
        initial_stock: currentItem.stock,
        unit_cost: currentItem.unit_cost || 0
      };

      if (isMeasurable(currentItem)) {
        itemFormData.category = currentItem.category;
      } else if (isCountable(currentItem)) {
        itemFormData.packaging = currentItem.packaging;
      } else if (isElaborated(currentItem)) {
        itemFormData.recipe_id = currentItem.recipe_id;
      }

      setFormData(itemFormData);
    } else if (isModalOpen) {
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
  }, [isModalOpen, currentItem, getItemUnit]);

  useEffect(() => {
    if (!isModalOpen) {
      clearValidation();
    }
  }, [isModalOpen, clearValidation]);

  const validateForm = useCallback(async () => {
    return await optimizedValidateForm();
  }, [optimizedValidateForm]);

  const handleSubmit = useCallback(async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    setIsSubmitting(true);
    setLoadingStates(prev => ({ ...prev, validating: true }));
    await new Promise(resolve => setTimeout(resolve, 300));
    setLoadingStates(prev => ({ ...prev, validating: false }));
    setSuccessStates(prev => ({ ...prev, validationPassed: true }));

    try {
      if (isEditMode && currentItem) {
        await updateItem(currentItem.id, formData as Partial<MaterialItem>);
        setSuccessStates(prev => ({ ...prev, itemCreated: true }));
      } else {
        if (addToStockNow) {
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
      
      await new Promise(resolve => setTimeout(resolve, 800));
      closeModal();
    } catch (error) {
      logger.error('MaterialsStore', 'Error al guardar:', error);
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

  const modalTitle = useMemo(() => {
    switch (modalMode) {
      case 'add': return 'Crear Nuevo Material';
      case 'edit': return 'Editar Material';
      case 'view': return 'Ver Material';
      default: return 'Material';
    }
  }, [modalMode]);

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
      <HStack>
        <CheckCircleIcon style={{ width: '16px', height: '16px' }} />
        <Text>
        {isEditMode ? 'Actualizar Item' : 
          addToStockNow ? 'Crear y Agregar a Stock' : 'Crear Item'
        }
        </Text>
      </HStack>
    );
  }, [loadingStates, isSubmitting, successStates, isEditMode, addToStockNow]);

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
    return { progress, currentStep };
  }, [isSubmitting, loadingStates, successStates, isEditMode]);

  const formStatusBadge = useMemo(() => {
    if (!formData.name || !formData.type) {
      return <Badge colorPalette="gray" variant="subtle">Incompleto</Badge>;
    }
    if (formData.type === 'MEASURABLE' && (!formData.category || !formData.unit)) {
      return <Badge colorPalette="blue" variant="subtle">Configura medición</Badge>;
    }
    if (formData.type === 'ELABORATED' && !formData.recipe_id) {
      return <Badge colorPalette="purple" variant="subtle">Crea una receta</Badge>;
    }
    if (validationState.hasErrors) {
      return <Badge colorPalette="red" variant="subtle">Con errores ({validationState.errorCount})</Badge>;
    }
    if (validationState.hasWarnings) {
      return <Badge colorPalette="orange" variant="subtle">Con advertencias</Badge>;
    }
    return <Badge colorPalette="green" variant="subtle">✓ Listo para guardar</Badge>;
  }, [formData, validationState]);

  return {
    formData,
    isSubmitting,
    loadingStates,
    successStates,
    addToStockNow,
    isEditMode,
    isViewMode,
    modalTitle,
    submitButtonContent,
    operationProgress,
    formStatusBadge,
    fieldErrors,
    fieldWarnings,
    validationState,
    modalMode,
    isModalOpen,
    alerts,
    alertSummary,
    updateFormData,
    handleFieldChange,
    handleNameChange,
    handleTypeChange,
    updateSupplierData,
    setAddToStockNow,
    handleSubmit,
    closeModal,
  };
};
