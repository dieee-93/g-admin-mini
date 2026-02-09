import {
  Box,
  Button,
  Alert,
  Stack,
  Dialog,
  Flex,
  Text,
  Progress,
  SimpleGrid,
  Textarea,
  Input,
  SelectField,
  Switch,
  IconButton
} from '@/shared/ui';
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  Cog6ToothIcon,
  CubeIcon,
  UserIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useState, useMemo, useCallback } from 'react';
import { HookPoint } from '@/lib/modules/HookPoint';
import type { Supplier } from '@/pages/admin/supply-chain/suppliers/types/supplierTypes';
import type { MaterialItem } from '@/pages/admin/supply-chain/materials/types';
import { BrandSelectField } from '@/pages/admin/supply-chain/shared/brands';
import { useMaterialForm } from './hooks/useMaterialForm';
import { useMaterialFormValidation } from '../../../hooks/useMaterialFormValidation';
import { TypeSelector } from './components/TypeSelector';
import { MeasurableFields } from './components/MeasurableFields';
import { CountableFields } from './components/CountableFields';
import { ElaboratedFields } from './components/ElaboratedFields';
import { ValidatedField } from './components/FormSections/ValidatedField';
import { SupplierFields } from './components/SupplierFields';
import { SectionCard } from './components/SectionCard';
import { StockInitialFields, CountableStockFields } from './components/StockInitialFields';
import { EventSourcingConfirmation } from './components/EventSourcingConfirmation';
import { ValidationSummaryAlert } from './components/ValidationSummaryAlert';
import { MaterialFormProgressIndicator } from './components/MaterialFormProgressIndicator';
import { CATEGORY_COLLECTION } from './constants';
import { EquipmentSelectorInline } from '@/shared/components/EquipmentSelectorInline';
import type { ProductionEquipmentUsage } from '@/shared/components/EquipmentSelector';

export interface MaterialFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit' | 'view';
  item: MaterialItem | null;
  readOnly?: boolean;
}

export const MaterialFormDialog = (props: MaterialFormDialogProps) => {
  const { isOpen, onClose, mode, item } = props;
  
  const {
    formData,
    isSubmitting,
    isViewMode,
    modalTitle,
    submitButtonContent,
    operationProgress,
    fieldErrors,
    fieldWarnings,
    validationState,
    alertSummary,
    handleNameChange,
    handleTypeChange,
    updateFormData,
    updateSupplierData,
    setAddToStockNow,
    handleSubmit,
    addToStockNow,
    formStatusBadge,
    showEventSourcingConfirmation,
    setShowEventSourcingConfirmation,
    confirmAndSubmit,
  } = useMaterialForm({ isOpen, onClose, mode, item });

  // 🆕 NEW: Validation hook for UI feedback
  // Pass formData even if undefined - the hook handles it
  const { validation, getValidationSummary } = useMaterialFormValidation(formData || undefined);

  // Local states for CountableFields packaging
  const [packageQuantity, setPackageQuantity] = useState(1);
  const usePackaging = !!formData.packaging?.package_size;

  // Wizard mode state
  const [showSupplierWizard, setShowSupplierWizard] = useState(false);
  const [showEquipmentSelector, setShowEquipmentSelector] = useState(false);

  // ⚡ PERFORMANCE: Memoize Dialog callbacks to prevent context re-renders
  const handleOpenChange = useCallback((details: { open: boolean }) => {
    if (!details.open && !isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  // ⚡ PERFORMANCE: Memoize EventSourcingConfirmation onClose callback
  const handleEventSourcingClose = useCallback(() => {
    setShowEventSourcingConfirmation(false);
  }, [setShowEventSourcingConfirmation]);

  // ⚡ PERFORMANCE: Memoize type-specific fields with granular dependencies
  const typeSpecificFields = useMemo(() => {
    if (formData.type === 'MEASURABLE') {
      // Pass formData for now to maintain compatibility, but child uses memo
      return (
        <MeasurableFields
          formData={formData}
          updateFormData={updateFormData}
          fieldErrors={fieldErrors as Record<string, string>}
          disabled={isViewMode || mode === 'edit'}
        />
      );
    }

    if (formData.type === 'COUNTABLE') {
      return (
        <CountableFields
          formData={formData}
          setFormData={updateFormData}
          errors={fieldErrors as Record<string, string>}
          disabled={isViewMode || mode === 'edit'}
        />
      );
    }

    if (formData.type === 'ELABORATED') {
      return (
        <ElaboratedFields
          formData={formData}
          setFormData={updateFormData}
          isEditMode={mode === 'edit'}
          onRequestEquipmentSelector={() => setShowEquipmentSelector(true)}
        />
      );
    }

    return null;
  }, [
    formData,
    updateFormData,
    fieldErrors,
    isViewMode
  ]);

  // Handler when supplier is created in wizard
  const handleSupplierCreated = (supplier: Supplier) => {
    updateSupplierData({
      supplier_id: supplier.id,
      supplier_name: supplier.name
    });
    setShowSupplierWizard(false);
  };

  // Handler when equipment is selected
  const handleEquipmentSelected = useCallback((equipment: ProductionEquipmentUsage) => {
    updateFormData({
      production_config: {
        ...formData.production_config,
        equipment_usage: [
          ...(formData.production_config?.equipment_usage || []),
          equipment
        ],
        equipment_cost: (formData.production_config?.equipment_cost || 0) + equipment.total_cost
      }
    });
    setShowEquipmentSelector(false);
  }, [formData.production_config, updateFormData]);

  // DEBUG: Check field errors
  console.log('🔍 [MaterialFormDialog] fieldErrors:', fieldErrors);

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={handleOpenChange}
      size={{ base: "full", md: "xl" }}
      scrollBehavior="inside"
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Flex align="center" gap="2">
              {(showSupplierWizard || showEquipmentSelector) && (
                <IconButton
                  aria-label="Volver"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowSupplierWizard(false);
                    setShowEquipmentSelector(false);
                  }}
                  mr="2"
                >
                  <ArrowLeftIcon style={{ width: '16px', height: '16px' }} />
                </IconButton>
              )}
              <Dialog.Title>
                {showSupplierWizard ? (
                  <Flex align="center" gap="2" fontSize="lg">
                    <Text color="gray.500" fontWeight="medium">Nuevo Material</Text>
                    <Text color="gray.400">/</Text>
                    <Text fontWeight="bold">Crear Proveedor</Text>
                  </Flex>
                ) : showEquipmentSelector ? (
                  <Flex align="center" gap="2" fontSize="lg">
                    <Text color="gray.500" fontWeight="medium">Nuevo Material</Text>
                    <Text color="gray.400">/</Text>
                    <Text fontWeight="bold">Agregar Equipamiento</Text>
                  </Flex>
                ) : (
                  modalTitle
                )}
              </Dialog.Title>
            </Flex>
          </Dialog.Header>
          <Dialog.CloseTrigger />

          <Dialog.Body
            css={{
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'var(--chakra-colors-gray-100)',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'var(--chakra-colors-gray-400)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: 'var(--chakra-colors-gray-500)',
              },
            }}
          >
            {/* 🆕 SEMANTIC HTML: Form element for accessibility and Enter key support */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              id="material-form"
            >
              <Stack gap="5">
              {/* Wizard Mode: Supplier Creation */}
              {showSupplierWizard ? (
                <HookPoint
                  name="suppliers.form-content"
                  data={{
                    onSuccess: handleSupplierCreated,
                    onCancel: () => setShowSupplierWizard(false),
                    supplier: null
                  }}
                  fallback={
                    <Alert.Root status="info">
                      <Alert.Indicator>
                        <InformationCircleIcon style={{ width: '20px', height: '20px' }} />
                      </Alert.Indicator>
                      <Alert.Title>Módulo no disponible</Alert.Title>
                      <Alert.Description>
                        El módulo de proveedores no está disponible. Contacta al administrador.
                      </Alert.Description>
                    </Alert.Root>
                  }
                />
              ) : showEquipmentSelector ? (
                /* Wizard Mode: Equipment Selection */
                <EquipmentSelectorInline
                  onSelect={handleEquipmentSelected}
                  onCancel={() => setShowEquipmentSelector(false)}
                  selectedEquipmentIds={formData.production_config?.equipment_usage?.map(eq => eq.equipment_id) || []}
                />
              ) : (
                <>
                  {alertSummary?.hasCritical && (
                    <Alert.Root status="error" variant="subtle">
                      <Alert.Indicator>
                        <ExclamationTriangleIcon style={{ width: '20px', height: '20px' }} />
                      </Alert.Indicator>
                      <Alert.Title>Atención: Stock crítico detectado</Alert.Title>
                      <Alert.Description>
                        Hay {alertSummary?.critical || 0} items con stock crítico. Considera agregarlos a tu lista de compras.
                      </Alert.Description>
                    </Alert.Root>
                  )}

                  <Flex
                    justify="space-between"
                    align={{ base: "flex-start", md: "center" }}
                    direction={{ base: "column", md: "row" }}
                    gap={{ base: "3", md: "0" }}
                  >
                    <Stack gap="1">
                      <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold">
                        {modalTitle}
                      </Text>
                    </Stack>
                    {formStatusBadge}
                  </Flex>

                  {/* New 4-Section Layout: Basic | Config | Stock | Supplier */}
                  <Stack gap={{ base: "5", md: "6" }} w="full">
                    {/* SECTION 1: Información Básica */}
                    <SectionCard
                      title="Información Básica"
                      icon={<InformationCircleIcon style={{ width: '20px', height: '20px' }} />}
                    >
                      <Stack gap={{ base: "4", md: "5" }}>
                        {/* Row 1: Name + Category */}
                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: "4", md: "5" }}>
                          <ValidatedField
                            label={
                              <>
                                Nombre del Item <Text as="span" color="red.500">*</Text>
                              </>
                            }
                            value={formData.name}
                            onChange={handleNameChange}
                            onValidate={() => { }}
                            field="name"
                            error={fieldErrors.name}
                            warning={fieldWarnings.name}
                            isValidating={false}
                            placeholder="Ej: Harina 0000, Huevos tipo A, Sal fina, Relleno de carne..."
                            required={true}
                            disabled={isViewMode}
                            data-testid="material-name-input"
                          />

                          <Box>
                            <SelectField
                              label="Categoría del Producto"
                              placeholder="¿A qué categoría pertenece?"
                              collection={CATEGORY_COLLECTION}
                              value={formData.category ? [formData.category] : []}
                              onValueChange={(details) => {
                                console.log('🔍 [MaterialFormDialog] Category onValueChange:', details);
                                console.log('🔍 [MaterialFormDialog] Selected value:', details.value[0]);
                                updateFormData({ category: details.value[0] });
                              }}
                              disabled={isViewMode}
                              error={fieldErrors.category}
                              height="44px"
                              noPortal={true}
                              data-testid="material-category-select"
                            />
                          </Box>
                        </SimpleGrid>

                        {/* Row 2: Brand */}
                        <BrandSelectField
                          value={formData.brand_id}
                          onChange={(value) => updateFormData({ brand_id: value })}
                          disabled={isViewMode}
                        />

                        {/* Row 3: Description */}
                        <Box>
                          <Text fontSize="sm" fontWeight="medium" mb="1.5">
                            Descripción (opcional)
                          </Text>
                          <Textarea
                            value={formData.description || ''}
                            onChange={(e) => updateFormData({ description: e.target.value })}
                            placeholder="Detalla características importantes: tamaño, color, especificaciones técnicas..."
                            disabled={isViewMode}
                            rows={3}
                            _hover={{ borderColor: "blue.400" }}
                            _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                          />
                        </Box>
                      </Stack>
                    </SectionCard>

                    {/* SECTION 2: Configuración */}
                    <SectionCard
                      title="Configuración"
                      icon={<Cog6ToothIcon style={{ width: '20px', height: '20px' }} />}
                    >
                      <Stack gap={{ base: "4", md: "5" }}>
                        {/* Type Selector First - Locked in Edit Mode */}
                        {!isViewMode && (
                          <TypeSelector
                            value={formData.type || ''}
                            onChange={handleTypeChange}
                            errors={fieldErrors as Record<string, string>}
                            disabled={isViewMode || mode === 'edit'}
                          />
                        )}

                        {/* ⚡ Type-Specific Fields (Memoized for performance) */}
                        {typeSpecificFields}

                        {/* Stock Switch - Only for MEASURABLE & COUNTABLE - HIDDEN IN EDIT MODE */}
                        {mode !== 'edit' && formData.type && formData.type !== 'ELABORATED' && (
                          <Box mt="3" pt="3" borderTop="1px solid" borderColor="gray.300">
                            <Flex justify="space-between" align="center" gap="4">
                              <Stack gap="1" flex="1">
                                <Text fontWeight="600" fontSize="md" color="gray.900">Agregar al inventario ahora</Text>
                                <Text fontSize="sm" color="gray.600" lineHeight="1.4">
                                  Si está marcado, se agregará stock inmediatamente al crear el item
                                </Text>
                              </Stack>
                              <Switch
                                checked={addToStockNow}
                                onChange={(checked) => !isViewMode && setAddToStockNow(checked)}
                                disabled={isViewMode}
                                size="lg"
                                data-testid="add-stock-switch"
                              />
                            </Flex>
                          </Box>
                        )}
                      </Stack>
                    </SectionCard>

                    {/* SECTION 3: Stock Inicial - Only for MEASURABLE & COUNTABLE */}
                    {addToStockNow && formData.type && formData.type !== 'ELABORATED' && (
                      <SectionCard
                        title="Stock Inicial"
                        icon={<CubeIcon style={{ width: '20px', height: '20px' }} />}
                      >
                        {formData.type === 'COUNTABLE' ? (
                          <CountableStockFields
                            formData={formData}
                            setFormData={(data) => {
                              Object.keys(data).forEach(key => {
                                updateFormData({ [key]: data[key as keyof typeof data] });
                              });
                            }}
                            errors={fieldErrors as Record<string, string>}
                            disabled={isViewMode}
                            usePackaging={usePackaging}
                            packageQuantity={packageQuantity}
                            setPackageQuantity={setPackageQuantity}
                          />
                        ) : (
                          <StockInitialFields
                            formData={formData}
                            updateFormData={updateFormData}
                            fieldErrors={fieldErrors as Record<string, string>}
                            disabled={isViewMode}
                          />
                        )}
                      </SectionCard>
                    )}

                    {/* SECTION 4: Proveedor - Only for MEASURABLE & COUNTABLE */}
                    {addToStockNow && formData.type && formData.type !== 'ELABORATED' && (
                      <SectionCard
                        title="Información del Proveedor"
                        icon={<UserIcon style={{
                          width: '20px', height: '20px'
                        }} />}
                      >
                        <SupplierFields
                          supplierData={formData.supplier || {}}
                          updateSupplierData={updateSupplierData}
                          fieldErrors={fieldErrors as Record<string, string>}
                          disabled={isViewMode}
                          isVisible={addToStockNow}
                          onCreateNew={() => setShowSupplierWizard(true)}
                        />
                      </SectionCard>
                    )}
                  </Stack>

                  {operationProgress && (
                    <Box w="full" mt="5">
                      <Stack gap="2">
                        <Flex justify="space-between" align="center">
                          <Text fontSize="sm" color="gray.600" fontWeight="500">{operationProgress.currentStep}</Text>
                          <Text fontSize="sm" color="gray.900" fontWeight="600">{operationProgress.progress}%</Text>
                        </Flex>
                        <Progress.Root value={operationProgress.progress} size="md" colorPalette="blue">
                          <Progress.Track>
                            <Progress.Range />
                          </Progress.Track>
                        </Progress.Root>
                      </Stack>
                    </Box>
                  )}

                  {!isViewMode && (
                    <>
                      {/* 🆕 VALIDATION SUMMARY: Show errors and warnings */}
                      <ValidationSummaryAlert
                        errors={getValidationSummary()}
                        warnings={validation.warnings}
                      />

                      <Flex
                        gap="3"
                        pt="5"
                        justify={{ base: "stretch", md: "flex-end" }}
                        direction={{ base: "column-reverse", md: "row" }}
                        borderTop="1px solid"
                        borderColor="gray.300"
                      >
                        <Button
                          type="button"
                          variant="outline"
                          onClick={onClose}
                          disabled={isSubmitting}
                          size="lg"
                          style={{ width: "100%", minWidth: "120px" }}
                        >
                          Cancelar
                        </Button>

                        <Button
                          type="submit"
                          form="material-form"
                          colorPalette="blue"
                          variant="solid"
                          disabled={!validation.canSubmit || isSubmitting}
                          size="lg"
                          style={{ width: "100%", minWidth: "140px" }}
                          fontWeight="600"
                          data-testid="submit-material"
                        >
                          {isSubmitting ? "Guardando..." : submitButtonContent}
                        </Button>
                      </Flex>
                    </>
                  )}

                  {isViewMode && (
                    <Flex gap="3" pt="5" justify={{ base: "stretch", md: "flex-end" }} borderTop="1px solid" borderColor="gray.300">
                      <Button
                        variant="outline"
                        onClick={onClose}
                        size="lg"
                        style={{ width: "100%", minWidth: "120px" }}
                      >
                        Cerrar
                      </Button>
                    </Flex>
                  )}
                </>
              )}
              </Stack>
            </form>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>

      {/* Event Sourcing Confirmation Modal - Opens on top like SupplierFormDialog */}
      <EventSourcingConfirmation
        isOpen={showEventSourcingConfirmation}
        onClose={handleEventSourcingClose}
        onConfirm={confirmAndSubmit}
        formData={formData}
        isSubmitting={isSubmitting}
      />
    </Dialog.Root>
  );
};
