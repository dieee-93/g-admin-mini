import React, { useState } from 'react';
import { 
  ContentLayout,
  FormSection,
  Section,
  PageHeader,
  Button, 
  Stack,
  InputField,
  SelectField,
  Typography
} from '@/shared/ui';
import { useBusinessCapabilities } from '@/store/businessCapabilitiesStore';

interface BasicBusinessInfoFormProps {
  onComplete: (data: BasicBusinessData) => void;
  onBack: () => void;
}

interface BasicBusinessData {
  businessName: string;
  businessType: string; // Rubro informativo
  email: string;
  phone: string;
  country: string;
  currency: string;
}

export function BasicBusinessInfoForm({ onComplete, onBack }: BasicBusinessInfoFormProps) {
  const { profile, getOperationalTier, updateBasicInfo } = useBusinessCapabilities();
  
  const [formData, setFormData] = useState<BasicBusinessData>({
    businessName: profile?.businessName || '',
    businessType: profile?.businessType || 'restaurant',
    email: profile?.email || '',
    phone: profile?.phone || '',
    country: profile?.country || 'Argentina',
    currency: profile?.currency || 'ARS',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BasicBusinessData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BasicBusinessData, string>> = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'El nombre del negocio es requerido';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Actualizar el store con la información básica
      updateBasicInfo(formData);
      
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onComplete(formData);
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof BasicBusinessData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const currentTier = getOperationalTier();

  // Opciones para los selects
  const businessTypeOptions = [
    { value: 'restaurant', label: 'Restaurante' },
    { value: 'cafe', label: 'Café/Bar' },
    { value: 'bakery', label: 'Panadería' },
    { value: 'catering', label: 'Catering' },
    { value: 'food_truck', label: 'Food Truck' },
    { value: 'hotel', label: 'Hotel/Hostal' },
    { value: 'retail', label: 'Comercio Minorista' },
    { value: 'manufacturing', label: 'Manufactura' },
    { value: 'services', label: 'Servicios' },
    { value: 'other', label: 'Otro' }
  ];

  const countryOptions = [
    { value: 'Argentina', label: 'Argentina' },
    { value: 'Chile', label: 'Chile' },
    { value: 'Uruguay', label: 'Uruguay' },
    { value: 'Paraguay', label: 'Paraguay' },
    { value: 'Bolivia', label: 'Bolivia' },
    { value: 'Peru', label: 'Perú' },
    { value: 'Colombia', label: 'Colombia' },
    { value: 'Ecuador', label: 'Ecuador' },
    { value: 'Mexico', label: 'México' },
    { value: 'España', label: 'España' }
  ];

  const currencyOptions = [
    { value: 'ARS', label: 'Peso Argentino (ARS)' },
    { value: 'USD', label: 'Dólar Estadounidense (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'CLP', label: 'Peso Chileno (CLP)' },
    { value: 'UYU', label: 'Peso Uruguayo (UYU)' },
    { value: 'PYG', label: 'Guaraní (PYG)' },
    { value: 'BOB', label: 'Boliviano (BOB)' },
    { value: 'PEN', label: 'Sol Peruano (PEN)' },
    { value: 'COP', label: 'Peso Colombiano (COP)' },
    { value: 'MXN', label: 'Peso Mexicano (MXN)' }
  ];

  return (
    <ContentLayout spacing="normal" className="setup-fade-in">
      <Stack gap="lg" align="stretch">
        
        {/* Header */}
        <PageHeader
          title="Información Básica del Negocio"
          subtitle="Completá los datos esenciales para finalizar la configuración"
        />

        {/* Status del Tier */}
        <Section 
          variant="flat" 
          style={{ 
            background: `linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(34, 197, 94, 0.1) 100%)`,
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}
        >
          <Stack direction="row" align="center" gap="sm" justify="center">
            <Typography variant="medium" color="green.700">
              🎯 Tu configuración: <strong>{currentTier}</strong>
            </Typography>
          </Stack>
        </Section>

        {/* Formulario Principal */}
        <Section variant="elevated">
          <FormSection 
            title="Datos de tu Negocio"
            description="Esta información aparecerá en facturas y comunicaciones oficiales"
          >
            <Stack gap="lg" align="stretch">
              
              {/* Información Principal */}
              <Stack direction="row" gap="lg">
                <InputField
                  label="Nombre del Negocio *"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  placeholder="Ej: Restaurante El Buen Sabor"
                  error={errors.businessName}
                  required
                  flex={2}
                />
                
                <SelectField
                  label="Rubro *"
                  value={formData.businessType}
                  onChange={(value) => handleInputChange('businessType', Array.isArray(value) ? value[0] : value)}
                  options={businessTypeOptions}
                  flex={1}
                />
              </Stack>

              {/* Contacto */}
              <Stack direction="row" gap="lg">
                <InputField
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contacto@negocio.com"
                  error={errors.email}
                  required
                  flex={1}
                />
                
                <InputField
                  label="Teléfono *"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+54 11 1234-5678"
                  error={errors.phone}
                  required
                  flex={1}
                />
              </Stack>

              {/* Configuración Regional */}
              <Stack direction="row" gap="lg">
                <SelectField
                  label="País *"
                  value={formData.country}
                  onChange={(value) => handleInputChange('country', Array.isArray(value) ? value[0] : value)}
                  options={countryOptions}
                  flex={1}
                />
                
                <SelectField
                  label="Moneda *"
                  value={formData.currency}
                  onChange={(value) => handleInputChange('currency', Array.isArray(value) ? value[0] : value)}
                  options={currencyOptions}
                  flex={1}
                />
              </Stack>
            </Stack>
          </FormSection>
        </Section>

        {/* Información Adicional */}
        <Section variant="flat" style={{ background: 'rgba(59, 130, 246, 0.05)' }}>
          <Stack gap="sm" align="center" textAlign="center">
            <Typography variant="medium" fontSize="sm" color="blue.700">
              ⚡ ¡Casi terminamos!
            </Typography>
            <Typography variant="muted" fontSize="sm">
              Una vez que completes estos datos, tu plataforma estará lista para usar. 
              Podrás personalizar más detalles desde la configuración.
            </Typography>
          </Stack>
        </Section>

        {/* Navigation */}
        <Section variant="flat">
          <Stack direction="row" justify="space-between" align="center">
            <Button 
              variant="outline" 
              onClick={onBack}
              className="setup-interactive"
            >
              ← Volver a Capacidades
            </Button>
            
            <Button
              variant="solid"
              size="lg"
              onClick={handleSubmit}
              loading={isSubmitting}
              className="setup-interactive"
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
              }}
            >
              {isSubmitting ? 'Finalizando...' : 'Completar Configuración →'}
            </Button>
          </Stack>
        </Section>
      </Stack>
    </ContentLayout>
  );
}

export type { BasicBusinessData, BasicBusinessInfoFormProps };