import {
  Box,
  Button,
  Container,
  Badge,
  Alert,
  Dialog,
  Flex,
  Progress,
  Stack,
  Text
} from '@chakra-ui/react';
import {
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useMaterialForm } from './hooks/useMaterialForm';
import { TypeSelector } from './components/TypeSelector';
import { MeasurableFields } from './components/MeasurableFields';
import { CountableFields } from './components/CountableFields';
import { ElaboratedFields } from './components/ElaboratedFields';
import { ValidatedField } from './components/FormSections/ValidatedField';
import { SupplierFields } from './components/SupplierFields';

export const MaterialFormDialog = () => {
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
    isModalOpen,
    alertSummary,
    handleNameChange,
    handleTypeChange,
    updateFormData,
    updateSupplierData,
    setAddToStockNow,
    handleSubmit,
    closeModal,
    addToStockNow,
    formStatusBadge,
  } = useMaterialForm();

  return (
    <Dialog.Root 
      open={isModalOpen} 
      onOpenChange={(details) => !details.open && !isSubmitting && closeModal()}
      size={{ base: "full", md: "xl" }}
      closeOnEscape={!isSubmitting}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content
          maxW={{ base: "100%", md: "800px" }}
          maxH={{ base: "100vh", md: "90vh" }}
          w="full"
          overflowY="auto"
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
                {alertSummary.hasCritical && (
                  <Alert.Root status="error" variant="subtle">
                    <Alert.Indicator>
                      <ExclamationTriangleIcon style={{ width: '20px', height: '20px' }} />
                    </Alert.Indicator>
                    <Alert.Title>Atención: Stock crítico detectado</Alert.Title>
                    <Alert.Description>
                      Hay {alertSummary.critical} items con stock crítico. Considera agregarlos a tu lista de compras.
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

                <Box w="full">
                  <ValidatedField
                    label="Nombre del Item"
                    value={formData.name}
                    onChange={handleNameChange}
                    onValidate={() => {}}
                    field="name"
                    error={fieldErrors.name}
                    warning={fieldWarnings.name}
                    isValidating={false}
                    placeholder="Ej: Harina 0000, Huevos, Relleno de carne..."
                    required={true}
                    disabled={isViewMode}
                  />
                </Box>

                {!isViewMode && (
                  <TypeSelector
                    value={formData.type}
                    onChange={handleTypeChange}
                    errors={fieldErrors}
                    disabled={isViewMode}
                  />
                )}

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
                    setFormData={updateFormData} 
                    errors={fieldErrors}
                    disabled={isViewMode}
                    addToStockNow={addToStockNow}
                    setAddToStockNow={setAddToStockNow}
                  />
                )}
                
                {formData.type === 'ELABORATED' && (
                  <ElaboratedFields 
                    formData={formData} 
                    setFormData={updateFormData} 
                  />
                )}

                {addToStockNow && formData.type && (
                  <SupplierFields
                    supplierData={formData.supplier || {}}
                    updateSupplierData={updateSupplierData}
                    fieldErrors={fieldErrors}
                    disabled={isViewMode}
                    isVisible={addToStockNow}
                  />
                )}

                {operationProgress && (
                  <Box w="full" mt="4">
                    <Stack gap="2">
                      <Flex justify="space-between" align="center">
                        <Text fontSize="sm" color="text.muted">{operationProgress.currentStep}</Text>
                        <Text fontSize="sm" color="text.muted">{operationProgress.progress}%</Text>
                      </Flex>
                      <Progress.Root value={operationProgress.progress} size="sm" colorPalette="blue">
                        <Progress.Track>
                          <Progress.Range />
                        </Progress.Track>
                      </Progress.Root>
                    </Stack>
                  </Box>
                )}

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
                      colorPalette={isSubmitting ? "gray" : "blue"}
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
