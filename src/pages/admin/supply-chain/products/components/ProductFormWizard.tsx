/**
 * PRODUCT FORM WIZARD
 *
 * Formulario principal tipo wizard con navegación paso a paso.
 * Integra todas las secciones del formulario de productos de forma dinámica
 * según el tipo de producto seleccionado y las capabilities activas.
 *
 * Features:
 * - Navegación paso a paso (Prev/Next)
 * - Progress indicator
 * - Validación antes de avanzar
 * - Capability-driven (respeta CapabilityStore)
 * - State management centralizado
 * - Auto-save draft (opcional)
 *
 * @design PRODUCTS_FORM_ARCHITECTURE.md
 */

import { useState, useEffect } from 'react';
import {
  Stack,
  HStack,
  Button,
  Text,
  Box,
  Heading,
  Alert,
  Progress,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  SelectField,
  createListCollection,
  CardWrapper
} from '@/shared/ui';
import { useVisibleFormSections } from '../config/formSectionsRegistry';
import { validateProduct } from '../services/productFormValidation';
import type {
  ProductFormData,
  ProductType,
  ValidationError,
  ProductTypeTemplate
} from '../types/productForm';
import { useAvailableProductTypes } from '../hooks/useAvailableProductTypes';

interface ProductFormWizardProps {
  /**
   * Producto a editar (undefined para crear nuevo)
   */
  initialData?: ProductFormData;

  /**
   * Callback al completar el formulario
   */
  onSubmit: (data: ProductFormData) => Promise<void>;

  /**
   * Callback al cancelar
   */
  onCancel?: () => void;

  /**
   * Modo readonly
   */
  readOnly?: boolean;
}

export function ProductFormWizard({
  initialData,
  onSubmit,
  onCancel,
  readOnly = false
}: ProductFormWizardProps) {
  // Available product types (capability-driven)
  const availableTypes = useAvailableProductTypes();

  // Form state
  const [productType, setProductType] = useState<ProductType>(
    initialData?.product_type || 'physical_product'
  );

  const [formData, setFormData] = useState<ProductFormData>(
    initialData || {
      product_type: productType,
      basic_info: {
        name: '',
        active: true
      },
      pricing: {
        price: 0
      }
    }
  );

  // Wizard state
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get visible sections based on product type
  const visibleSections = useVisibleFormSections(productType);
  const currentSection = visibleSections[currentSectionIndex];

  // Safety check: If no visible sections or invalid index, show loading/error
  if (!visibleSections || visibleSections.length === 0) {
    return (
      <Alert.Root status="warning">
        <Alert.Indicator />
        <Alert.Description>
          No hay secciones disponibles para este tipo de producto.
          Verifica que las capabilities necesarias estén activas.
        </Alert.Description>
      </Alert.Root>
    );
  }

  if (!currentSection) {
    return (
      <Alert.Root status="error">
        <Alert.Indicator />
        <Alert.Description>
          Error: Sección no encontrada (índice: {currentSectionIndex})
        </Alert.Description>
      </Alert.Root>
    );
  }

  // Update product type in form data when changed
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      product_type: productType
    }));
  }, [productType]);

  // Progress calculation
  const progress = ((currentSectionIndex + 1) / visibleSections.length) * 100;

  // Handle section data change
  const handleSectionChange = (sectionData: Partial<ProductFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...sectionData
    }));

    // Clear errors for changed fields
    setValidationErrors(prev =>
      prev.filter(error => !error.field.startsWith(currentSection.id))
    );
  };

  // Validate current section
  const validateCurrentSection = (): boolean => {
    const result = validateProduct(formData, productType);

    // Filter errors for current section only
    const sectionErrors = result.errors.filter(error =>
      error.section === currentSection.id || error.field.startsWith(currentSection.id)
    );

    if (sectionErrors.length > 0) {
      setValidationErrors(sectionErrors);
      return false;
    }

    setValidationErrors([]);
    return true;
  };

  // Navigate to next section
  const handleNext = () => {
    // Validate current section before advancing
    if (!validateCurrentSection()) {
      return;
    }

    if (currentSectionIndex < visibleSections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Navigate to previous section
  const handlePrev = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Jump to specific section
  const handleJumpToSection = (index: number) => {
    // Validate all sections up to target
    for (let i = currentSectionIndex; i < index; i++) {
      const tempIndex = currentSectionIndex;
      setCurrentSectionIndex(i);
      if (!validateCurrentSection()) {
        setCurrentSectionIndex(tempIndex);
        return;
      }
    }

    setCurrentSectionIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit form
  const handleSubmit = async () => {
    // Validate entire form
    const result = validateProduct(formData, productType);

    if (!result.isValid) {
      setValidationErrors(result.errors);

      // Jump to first section with errors
      const firstErrorSection = result.errors[0]?.section;
      if (firstErrorSection) {
        const errorSectionIndex = visibleSections.findIndex(s => s.id === firstErrorSection);
        if (errorSectionIndex !== -1) {
          setCurrentSectionIndex(errorSectionIndex);
        }
      }

      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Success handled by parent
    } catch (error) {
      console.error('Error submitting form:', error);
      // Error handling could be improved with toaster
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle product type change
  const handleProductTypeChange = (newType: ProductType) => {
    setProductType(newType);
    setCurrentSectionIndex(0); // Reset to first section
    setValidationErrors([]);
  };

  // Create collection for product type selector
  const productTypeCollection = createListCollection({
    items: availableTypes.map(type => ({
      label: type.label,
      value: type.type
    }))
  });

  // Render current section component
  const renderCurrentSection = () => {
    const SectionComponent = currentSection.component;
    const sectionId = currentSection.id;

    // Get section-specific data
    const sectionData = formData[sectionId as keyof ProductFormData] || {};

    // Handle section-specific onChange
    const handleSectionDataChange = (data: any) => {
      handleSectionChange({
        [sectionId]: data
      });
    };

    return (
      <SectionComponent
        data={sectionData}
        onChange={handleSectionDataChange}
        errors={validationErrors}
        readOnly={readOnly}
      />
    );
  };

  const isFirstSection = currentSectionIndex === 0;
  const isLastSection = currentSectionIndex === visibleSections.length - 1;

  return (
    <Stack gap="6">
      {/* Header */}
      <Box>
        <Heading size="lg" mb={2}>
          {initialData ? 'Editar Producto' : 'Nuevo Producto'}
        </Heading>
        <Text color="gray.600">
          Completa la información del producto paso a paso
        </Text>
      </Box>

      {/* Product Type Selector (only for new products) */}
      {!initialData && !readOnly && (
        <CardWrapper>
          <CardWrapper.Body>
            <Stack gap={3}>
              <Text fontWeight="medium">Tipo de producto</Text>
              <SelectField
                placeholder="Selecciona el tipo de producto"
                collection={productTypeCollection}
                value={[productType]}
                onValueChange={(details) => {
                  const selected = details.value[0] as ProductType;
                  handleProductTypeChange(selected);
                }}
              />
              {availableTypes.find(t => t.type === productType)?.description && (
                <Alert.Root status="info">
                  <Alert.Indicator />
                  <Alert.Description>
                    {availableTypes.find(t => t.type === productType)?.description}
                  </Alert.Description>
                </Alert.Root>
              )}
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>
      )}

      {/* Progress Indicator */}
      <Box>
        <HStack justify="space-between" mb={2}>
          <Text fontSize="sm" fontWeight="medium">
            Paso {currentSectionIndex + 1} de {visibleSections.length}
          </Text>
          <Text fontSize="sm" color="gray.600">
            {Math.round(progress)}% completado
          </Text>
        </HStack>
        <Progress value={progress} size="sm" colorPalette="blue" />
      </Box>

      {/* Section Navigation Breadcrumbs */}
      <Box>
        <HStack gap={2} flexWrap="wrap">
          {visibleSections.map((section, index) => {
            const isActive = index === currentSectionIndex;
            const isCompleted = index < currentSectionIndex;
            const hasErrors = validationErrors.some(
              error => error.section === section.id
            );

            return (
              <Button
                key={section.id}
                size="sm"
                variant={isActive ? 'solid' : 'outline'}
                colorPalette={hasErrors ? 'red' : isCompleted ? 'green' : 'gray'}
                onClick={() => handleJumpToSection(index)}
                disabled={readOnly}
              >
                {section.label}
                {hasErrors && ' ⚠️'}
                {isCompleted && !hasErrors && ' ✓'}
              </Button>
            );
          })}
        </HStack>
      </Box>

      {/* Current Section Card */}
      <CardWrapper>
        <CardWrapper.Header>
          <Heading size="md">{currentSection.label}</Heading>
        </CardWrapper.Header>

        <CardWrapper.Body>
          {/* Validation Errors Alert */}
          {validationErrors.length > 0 && (
            <Alert.Root status="error" mb={4}>
              <Alert.Indicator />
              <Box>
                <Alert.Title>Errores de validación</Alert.Title>
                <Alert.Description>
                  <Stack gap={1} mt={2}>
                    {validationErrors.map((error, index) => (
                      <Text key={index} fontSize="sm">
                        • {error.message}
                      </Text>
                    ))}
                  </Stack>
                </Alert.Description>
              </Box>
            </Alert.Root>
          )}

          {/* Section Content */}
          {renderCurrentSection()}
        </CardWrapper.Body>

        <CardWrapper.Footer>
          <HStack justify="space-between" width="full">
            {/* Previous Button */}
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={isFirstSection || readOnly}
            >
              ← Anterior
            </Button>

            <HStack gap="2">
              {/* Cancel Button */}
              {onCancel && (
                <Button
                  variant="ghost"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              )}

              {/* Next/Submit Button */}
              {isLastSection ? (
                <Button
                  colorPalette="blue"
                  onClick={handleSubmit}
                  loading={isSubmitting}
                  disabled={readOnly}
                >
                  {readOnly ? 'Cerrar' : initialData ? 'Actualizar Producto' : 'Crear Producto'}
                </Button>
              ) : (
                <Button
                  colorPalette="blue"
                  onClick={handleNext}
                  disabled={readOnly}
                >
                  Siguiente →
                </Button>
              )}
            </HStack>
          </HStack>
        </CardWrapper.Footer>
      </CardWrapper>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <CardWrapper>
          <CardWrapper.Body>
            <Text fontSize="xs" fontFamily="mono">
              Current Section: {currentSection.id} | Product Type: {productType} |
              Visible Sections: {visibleSections.length} |
              Errors: {validationErrors.length}
            </Text>
          </CardWrapper.Body>
        </CardWrapper>
      )}
    </Stack>
  );
}
