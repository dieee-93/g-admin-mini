/**
 * BUSINESS CONFIGURATION PAGE
 * 
 * Configuración del perfil empresarial básico.
 * 
 * INTEGRACIÓN:
 * - appStore.settings: Datos compartidos del negocio
 * - capabilityStore.profile: Perfil del setup inicial
 * - Achievements: Validación de requirements (businessName, address)
 * 
 * REQUIREMENTS:
 * - takeaway_business_name: Configurar nombre del negocio
 * - takeaway_address: Configurar dirección del local
 * 
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import {
  ContentLayout,
  PageHeader,
  Section,
  FormSection,
  InputField,
  TextareaField,
  Button,
  Stack,
  HStack,
  Alert,
  Badge,
  Icon
} from '@/shared/ui';
import {
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAppStore } from '@/store/appStore';
import { useCapabilityStore } from '@/store/capabilityStore';
import { toaster } from '@/shared/ui/toaster';
import { logger } from '@/lib/logging';

interface BusinessFormData {
  businessName: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  logoUrl: string;
}

interface ValidationErrors {
  businessName?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export default function BusinessPage() {
  const appSettings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const capabilityProfile = useCapabilityStore((state) => state.profile);

  // Form state
  const [formData, setFormData] = useState<BusinessFormData>({
    businessName: '',
    address: '',
    contactPhone: '',
    contactEmail: '',
    logoUrl: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Initialize form with data from stores
  useEffect(() => {
    setFormData({
      businessName: appSettings.businessName || capabilityProfile?.businessName || '',
      address: appSettings.address || '',
      contactPhone: appSettings.contactPhone || capabilityProfile?.phone || '',
      contactEmail: appSettings.contactEmail || capabilityProfile?.email || '',
      logoUrl: appSettings.logoUrl || ''
    });
  }, [appSettings, capabilityProfile]);

  const handleFieldChange = (field: keyof BusinessFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Clear error for this field
    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Business name is required
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'El nombre del negocio es obligatorio';
    }

    // Address validation (required for TakeAway)
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es obligatoria para operaciones de TakeAway';
    }

    // Email validation (basic)
    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Email inválido';
    }

    // Phone validation (basic - allow various formats)
    if (formData.contactPhone && formData.contactPhone.length < 7) {
      newErrors.contactPhone = 'Teléfono inválido (mínimo 7 dígitos)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toaster.create({
        title: 'Errores de validación',
        description: 'Por favor corrige los errores antes de guardar',
        type: 'error',
        duration: 4000
      });
      return;
    }

    setIsSaving(true);

    try {
      // Update appStore (shared settings)
      updateSettings({
        businessName: formData.businessName.trim(),
        address: formData.address.trim(),
        contactPhone: formData.contactPhone.trim(),
        contactEmail: formData.contactEmail.trim(),
        logoUrl: formData.logoUrl.trim()
      });

      // Update capabilityStore profile (if exists)
      const capabilityStore = useCapabilityStore.getState();
      if (capabilityStore.profile) {
        // TODO: Add updateProfile action to capabilityStore
        // For now, profile updates will happen through the setup flow
        logger.info('Settings', 'Profile update needed - implement capabilityStore.updateProfile()');
      }

      logger.info('Settings', 'Business configuration saved', {
        businessName: formData.businessName,
        hasAddress: !!formData.address
      });

      setIsDirty(false);

      toaster.create({
        title: '✅ Configuración guardada',
        description: 'Los datos del negocio se actualizaron correctamente',
        type: 'success',
        duration: 3000
      });

      // TODO: Emit event for achievements system
      // eventBus.emit('business.config_updated', { fields: ['businessName', 'address'] });

    } catch (error) {
      logger.error('Settings', 'Failed to save business configuration', error);
      
      toaster.create({
        title: 'Error al guardar',
        description: 'No se pudo guardar la configuración. Intenta de nuevo.',
        type: 'error',
        duration: 4000
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      businessName: appSettings.businessName || '',
      address: appSettings.address || '',
      contactPhone: appSettings.contactPhone || '',
      contactEmail: appSettings.contactEmail || '',
      logoUrl: appSettings.logoUrl || ''
    });
    setErrors({});
    setIsDirty(false);
  };

  // Calculate completion status
  const requiredFieldsComplete = formData.businessName.trim() && formData.address.trim();
  const optionalFieldsComplete = formData.contactPhone.trim() && formData.contactEmail.trim();
  const completionPercentage = [
    formData.businessName.trim(),
    formData.address.trim(),
    formData.contactPhone.trim(),
    formData.contactEmail.trim()
  ].filter(Boolean).length * 25;

  return (
    <ContentLayout spacing="normal" data-testid="business-config-page">
      <PageHeader
        title="Configuración del Negocio"
        subtitle="Información básica y datos de contacto"
      />

      {/* Completion Status Alert */}
      {!requiredFieldsComplete && (
        <Alert
          status="warning"
          title="Configuración Incompleta"
        >
          Completa el nombre del negocio y la dirección para poder activar operaciones comerciales
          (TakeAway, E-commerce, etc.)
        </Alert>
      )}

      <Section
        title="Perfil Empresarial"
        description="Información que se mostrará a tus clientes y se usará en documentos"
      >
        <Stack gap="6">
          {/* Completion Badge */}
          <HStack justify="space-between">
            <Badge
              colorPalette={requiredFieldsComplete ? 'green' : 'orange'}
              size="lg"
            >
              <Icon
                icon={requiredFieldsComplete ? CheckCircleIcon : ExclamationTriangleIcon}
                size="sm"
              />
              {completionPercentage}% Completo
            </Badge>

            {isDirty && (
              <Badge colorPalette="blue" size="sm">
                Cambios sin guardar
              </Badge>
            )}
          </HStack>

          <FormSection
            title="Información Básica"
            description="Datos principales del negocio"
          >
            <Stack gap="4">
              {/* Business Name - REQUIRED */}
              <InputField
                label="Nombre del Negocio *"
                placeholder="Ej: Panadería El Buen Pan"
                value={formData.businessName}
                onChange={(e) => handleFieldChange('businessName')(e.target.value)}
                helperText="Nombre comercial que verán tus clientes"
                style={{
                  borderColor: errors.businessName ? 'var(--colors-error)' : undefined
                }}
              />
              {errors.businessName && (
                <Alert status="error" title={errors.businessName} size="sm" />
              )}

              {/* Address - REQUIRED for TakeAway */}
              <TextareaField
                label="Dirección del Local *"
                placeholder="Ej: Calle Mayor 123, Madrid, España"
                value={formData.address}
                onChange={(e) => handleFieldChange('address')(e.target.value)}
                helperText="Dirección completa donde los clientes pueden retirar pedidos o visitarte"
                rows={3}
                style={{
                  borderColor: errors.address ? 'var(--colors-error)' : undefined
                }}
              />
              {errors.address && (
                <Alert status="error" title={errors.address} size="sm" />
              )}
            </Stack>
          </FormSection>

          <FormSection
            title="Datos de Contacto"
            description="Información para que tus clientes puedan comunicarse"
          >
            <Stack gap="4">
              {/* Contact Phone */}
              <InputField
                label="Teléfono de Contacto"
                placeholder="Ej: +34 91 123 4567"
                value={formData.contactPhone}
                onChange={(e) => handleFieldChange('contactPhone')(e.target.value)}
                helperText="Teléfono principal del negocio"
                style={{
                  borderColor: errors.contactPhone ? 'var(--colors-error)' : undefined
                }}
              />
              {errors.contactPhone && (
                <Alert status="error" title={errors.contactPhone} size="sm" />
              )}

              {/* Contact Email */}
              <InputField
                label="Email de Contacto"
                placeholder="Ej: info@negocio.com"
                value={formData.contactEmail}
                onChange={(e) => handleFieldChange('contactEmail')(e.target.value)}
                helperText="Email principal del negocio"
                style={{
                  borderColor: errors.contactEmail ? 'var(--colors-error)' : undefined
                }}
              />
              {errors.contactEmail && (
                <Alert status="error" title={errors.contactEmail} size="sm" />
              )}
            </Stack>
          </FormSection>

          <FormSection
            title="Branding (Opcional)"
            description="Personalización visual del negocio"
          >
            <InputField
              label="URL del Logo"
              placeholder="Ej: https://example.com/logo.png"
              value={formData.logoUrl}
              onChange={(e) => handleFieldChange('logoUrl')(e.target.value)}
              helperText="URL pública de tu logo (opcional)"
            />
          </FormSection>

          {/* Action Buttons */}
          <HStack justify="end" gap="3">
            <Button
              variant="ghost"
              onClick={handleReset}
              disabled={!isDirty || isSaving}
              data-testid="business-reset-button"
            >
              Descartar Cambios
            </Button>
            <Button
              colorPalette="blue"
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              loading={isSaving}
              data-testid="business-save-button"
            >
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </HStack>
        </Stack>
      </Section>
    </ContentLayout>
  );
}
