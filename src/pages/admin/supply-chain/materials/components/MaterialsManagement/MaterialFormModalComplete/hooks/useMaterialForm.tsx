import { useState, useEffect, useCallback, useMemo } from 'react';
import { Badge } from '@/shared/ui';
import { useMaterials } from '@/modules/materials/hooks';
import { useMaterialsActions } from '../../../../hooks/useMaterialsActions';
import { useMaterialValidation } from '@/modules/materials/hooks';
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

export interface UseMaterialFormParams {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit' | 'view';
  item: MaterialItem | null;
}

export const useMaterialForm = (params: UseMaterialFormParams) => {
  const { isOpen, onClose, mode, item: currentItem } = params;
  
  const { data: items = [] } = useMaterials();
  const { addItem, updateItem } = useMaterialsActions();
  
  // ⚠️ NO MORE Zustand subscriptions for UI state - passed via props!
  // const isModalOpen = useMaterialsStore((s) => s.isModalOpen); // ❌ REMOVED
  // const modalMode = useMaterialsStore((s) => s.modalMode); // ❌ REMOVED
  // const currentItem = useMaterialsStore((s) => s.currentItem); // ❌ REMOVED
  // const closeModal = useMaterialsStore((s) => s.closeModal); // ❌ REMOVED
  
  // ❌ REMOVED: No need to subscribe to alerts from store for modal
  // Only MaterialsAlerts component needs them
  // const alerts = useMaterialsStore((s) => s.alerts);
  // const alertSummary = useMaterialsStore((s) => s.alertSummary);
  
  const [formData, setFormData] = useState<ItemFormData>({
    id: undefined,
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
    validateForm: optimizedValidateForm,
    clearValidation
  } = useMaterialValidation(formData, items, {
    enableRealTime: true,
    debounceMs: 300,
    excludeId: currentItem?.id // Pass current ID to exclude from duplicate checks
  });

  // NO useEffect - let useMaterialValidation handle registration internally
  // We only sync on change, not on every render

  const updateFormData = useCallback((updates: Partial<ItemFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Validation will sync automatically via useMaterialValidation watching formData
  }, []); // ✅ Empty deps - setFormData is stable from useState

  const handleFieldChange = useCallback((field: keyof ItemFormData) =>
    (value: unknown) => {
      setFormData(prev => ({ ...prev, [field]: value as ItemFormData[typeof field] }));
      // Validation happens automatically via useMaterialValidation
    }, [] // ✅ Empty deps - setFormData is stable
  );

  const handleNameChange = useCallback((name: string) => {
    setFormData(prev => ({ ...prev, name }));
  }, []); // ✅ Empty deps - setFormData is stable

  const handleTypeChange = useCallback((type: ItemType) => {
    updateFormData({ 
      type, 
      unit: '' as AllUnit, 
      category: undefined,
      packaging: undefined,
      recipe_id: undefined
    });
  }, [updateFormData]);

  const updateSupplierData = useCallback((updates: Partial<SupplierFormData>) => {
    setFormData(prev => ({
      ...prev,
      supplier: {
        ...prev.supplier,
        ...updates
      }
    }));
  }, []); // ✅ Already correct - empty deps with updater function
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addToStockNow, setAddToStockNow] = useState(false);
  const [showEventSourcingConfirmation, setShowEventSourcingConfirmation] = useState(false);

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

  const isEditMode = mode === 'edit';
  const isViewMode = mode === 'view';
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
    if (isOpen && currentItem) {
      const itemFormData: ItemFormData = {
        id: currentItem.id,
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
        itemFormData.recipe_id = (currentItem as any).recipe_id;
      }

      setFormData(itemFormData);
    } else if (isOpen) {
      setFormData({
        id: undefined,
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
  }, [isOpen, currentItem, getItemUnit]);

  useEffect(() => {
    if (!isOpen) {
      clearValidation();
    }
  }, [isOpen, clearValidation]);

  const validateForm = useCallback(async () => {
    return await optimizedValidateForm();
  }, [optimizedValidateForm]);

  const handleSubmit = useCallback(async () => {
    console.log('🚀 [useMaterialForm] handleSubmit iniciado');
    console.log('📋 [useMaterialForm] formData:', formData);
    console.log('⚙️ [useMaterialForm] addToStockNow:', addToStockNow);
    console.log('✏️ [useMaterialForm] isEditMode:', isEditMode);
    
    const isValid = await validateForm();
    console.log('✅ [useMaterialForm] Validación resultado:', isValid);
    
    if (!isValid) {
      console.log('❌ [useMaterialForm] Validación falló, abortando submit');
      return;
    }

    // If adding to stock, show Event Sourcing confirmation first (don't set isSubmitting yet)
    if (addToStockNow && !isEditMode) {
      console.log('📦 [useMaterialForm] Mostrando confirmación de Event Sourcing');
      setShowEventSourcingConfirmation(true);
      return; // Exit early - confirmAndSubmit will handle the actual submission
    }

    console.log('💾 [useMaterialForm] Iniciando guardado...');
    // Only set loading states if we're actually submitting (not showing confirmation)
    setIsSubmitting(true);
    setLoadingStates(prev => ({ ...prev, validating: true }));
    await new Promise(resolve => setTimeout(resolve, 300));
    setLoadingStates(prev => ({ ...prev, validating: false }));
    setSuccessStates(prev => ({ ...prev, validationPassed: true }));

    try {
      if (isEditMode && currentItem) {
        console.log('✏️ [useMaterialForm] Modo edición, actualizando...');
        
        // 🧹 SANITIZE PAYLOAD FOR UPDATE
        // Remove fields that shouldn't be updated directly on the material table
        // unit_cost might be editable if moved to main config, but initial_stock is definitely not
        const { initial_stock, addToStockNow, unit_cost, ...cleanData } = formData as any;
        
        await updateItem(currentItem.id, cleanData as Partial<MaterialItem>);
        setSuccessStates(prev => ({ ...prev, itemCreated: true }));
      } else {
        if (addToStockNow) {
          console.log('📦 [useMaterialForm] Creando con stock inicial...');
          setLoadingStates(prev => ({ ...prev, savingToStock: true }));
          // 🔧 CRITICAL: Include addToStockNow flag in formData for backend
          await addItem({ ...formData, addToStockNow: true });
          setLoadingStates(prev => ({ ...prev, savingToStock: false }));
          setSuccessStates(prev => ({ 
            ...prev, 
            itemCreated: true, 
            stockAdded: true 
          }));
        } else {
          console.log('📝 [useMaterialForm] Creando sin stock...');
          const itemDataWithoutStock = {
            ...formData,
            initial_stock: 0,
            unit_cost: 0
          };
          await addItem(itemDataWithoutStock);
          setSuccessStates(prev => ({ ...prev, itemCreated: true }));
        }
      }
      
      console.log('✅ [useMaterialForm] Guardado exitoso, cerrando modal...');
      await new Promise(resolve => setTimeout(resolve, 800));
      onClose();
    } catch (error) {
      console.error('❌ [useMaterialForm] Error en handleSubmit:', error);
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
  }, [validateForm, isEditMode, currentItem, updateItem, formData, addToStockNow, addItem, onClose]);

  const confirmAndSubmit = useCallback(async () => {
    console.log('🚀 [confirmAndSubmit] Starting submission...');
    setShowEventSourcingConfirmation(false);
    
    setIsSubmitting(true);
    
    setLoadingStates(prev => ({ ...prev, validating: true }));
    await new Promise(resolve => setTimeout(resolve, 300));
    setLoadingStates(prev => ({ ...prev, validating: false }));
    setSuccessStates(prev => ({ ...prev, validationPassed: true }));

    try {
      console.log('🚀 [confirmAndSubmit] Calling addItem with formData:', formData);
      console.log('🚀 [confirmAndSubmit] addToStockNow:', addToStockNow);
      setLoadingStates(prev => ({ ...prev, savingToStock: true }));
      
      // 🔧 CRITICAL: Include addToStockNow flag in formData for backend
      const result = await addItem({ ...formData, addToStockNow: true });
      console.log('✅ [confirmAndSubmit] addItem returned:', result);
      
      setLoadingStates(prev => ({ ...prev, savingToStock: false }));
      setSuccessStates(prev => ({ 
        ...prev, 
        itemCreated: true, 
        stockAdded: true 
      }));
      
      console.log('✅ [confirmAndSubmit] Waiting before closing...');
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('✅ [confirmAndSubmit] Calling onClose...');
      onClose();
      console.log('✅ [confirmAndSubmit] Done!');
    } catch (error) {
      console.error('❌ [confirmAndSubmit] Error caught:', error);
      logger.error('MaterialsStore', 'Error al guardar:', error);
    } finally {
      console.log('🏁 [confirmAndSubmit] Finally block...');
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
  }, [formData, addItem, onClose]);

  const modalTitle = useMemo(() => {
    switch (mode) {
      case 'add': return 'Crear Nuevo Material';
      case 'edit': return 'Editar Material';
      case 'view': return 'Ver Material';
      default: return 'Material';
    }
  }, [mode]);

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
    // ❌ REMOVED: modalMode, isModalOpen, closeModal (now props)
    // ❌ REMOVED: alerts, alertSummary (not needed in modal)
    alertSummary: undefined, // Keep for backward compat, remove later
    showEventSourcingConfirmation,
    updateFormData,
    handleFieldChange,
    handleNameChange,
    handleTypeChange,
    updateSupplierData,
    setAddToStockNow,
    handleSubmit,
    confirmAndSubmit,
    setShowEventSourcingConfirmation,
  };
};
