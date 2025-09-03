import React, { useState } from 'react';
import { 
  ContentLayout,
  FormSection,
  Section,
  StatsSection,
  CardWrapper, 
  CardHeader, 
  CardBody,
  Button, 
  Heading,
  VStack,
  HStack,
  InputField,
  SelectField,
  NumberField,
  Stack,
  Typography,
  Badge,
  Icon
} from '@/shared/ui';

interface BusinessDataFormProps {
  onComplete: (data: BusinessData) => void;
  onBack: () => void;
}

interface BusinessData {
  // Información de la empresa
  businessName: string;
  businessType: string;
  taxId: string;
  phone: string;
  email: string;
  website?: string;
  
  // Dirección
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  
  // Configuración operativa
  currency: string;
  timezone: string;
  defaultLanguage: string;
  
  // Configuración inicial de inventario
  defaultUnit: string;
  lowStockThreshold: number;
  autoReorderEnabled: boolean;
}

// Definir los pasos del formulario
const FORM_STEPS = [
  {
    id: 'business',
    title: 'Información del Negocio',
    subtitle: 'Datos básicos de tu empresa',
    icon: '🏢',
    fields: ['businessName', 'businessType', 'taxId', 'phone', 'email', 'website']
  },
  {
    id: 'location',
    title: 'Ubicación',
    subtitle: 'Dirección de tu negocio',
    icon: '📍',
    fields: ['address', 'city', 'state', 'country', 'postalCode']
  },
  {
    id: 'settings',
    title: 'Configuración',
    subtitle: 'Preferencias operativas e inventario',
    icon: '⚙️',
    fields: ['currency', 'timezone', 'defaultLanguage', 'defaultUnit', 'lowStockThreshold']
  }
] as const;

export function BusinessDataForm({ onComplete, onBack }: BusinessDataFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<BusinessData>({
    businessName: '',
    businessType: 'restaurant',
    taxId: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: 'Argentina',
    postalCode: '',
    currency: 'ARS',
    timezone: 'America/Argentina/Buenos_Aires',
    defaultLanguage: 'es',
    defaultUnit: 'kg',
    lowStockThreshold: 10,
    autoReorderEnabled: false
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BusinessData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const validateCurrentStep = (): boolean => {
    const currentStepData = FORM_STEPS[currentStep];
    const newErrors: Partial<Record<keyof BusinessData, string>> = {};

    // Validar solo los campos del paso actual
    currentStepData.fields.forEach(field => {
      const value = formData[field];
      
      switch (field) {
        case 'businessName':
          if (!String(value).trim()) {
            newErrors.businessName = 'El nombre del negocio es requerido';
          }
          break;
        case 'email':
          if (!String(value).trim()) {
            newErrors.email = 'El email es requerido';
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
            newErrors.email = 'El email no es válido';
          }
          break;
        case 'phone':
          if (!String(value).trim()) {
            newErrors.phone = 'El teléfono es requerido';
          }
          break;
        case 'address':
          if (!String(value).trim()) {
            newErrors.address = 'La dirección es requerida';
          }
          break;
        case 'city':
          if (!String(value).trim()) {
            newErrors.city = 'La ciudad es requerida';
          }
          break;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCompleteForm = (): boolean => {
    const newErrors: Partial<Record<keyof BusinessData, string>> = {};

    if (!formData.businessName.trim()) newErrors.businessName = 'El nombre del negocio es requerido';
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    if (!formData.phone.trim()) newErrors.phone = 'El teléfono es requerido';
    if (!formData.address.trim()) newErrors.address = 'La dirección es requerida';
    if (!formData.city.trim()) newErrors.city = 'La ciudad es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < FORM_STEPS.length - 1) {
      setIsTransitioning(true);
      await new Promise(resolve => setTimeout(resolve, 200));
      setCurrentStep(prev => prev + 1);
      setIsTransitioning(false);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = async () => {
    if (currentStep > 0) {
      setIsTransitioning(true);
      await new Promise(resolve => setTimeout(resolve, 200));
      setCurrentStep(prev => prev - 1);
      setIsTransitioning(false);
    } else {
      onBack();
    }
  };

  const handleSubmit = async () => {
    if (!validateCompleteForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      onComplete(formData);
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof BusinessData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

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
    { value: 'Venezuela', label: 'Venezuela' },
    { value: 'Brasil', label: 'Brasil' },
    { value: 'Mexico', label: 'México' },
    { value: 'España', label: 'España' },
    { value: 'Estados Unidos', label: 'Estados Unidos' }
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

  const timezoneOptions = [
    { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
    { value: 'America/Santiago', label: 'Santiago (GMT-3/GMT-4)' },
    { value: 'America/Montevideo', label: 'Montevideo (GMT-3)' },
    { value: 'America/Asuncion', label: 'Asunción (GMT-3)' },
    { value: 'America/La_Paz', label: 'La Paz (GMT-4)' },
    { value: 'America/Lima', label: 'Lima (GMT-5)' },
    { value: 'America/Bogota', label: 'Bogotá (GMT-5)' },
    { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)' },
    { value: 'Europe/Madrid', label: 'Madrid (GMT+1)' },
    { value: 'America/New_York', label: 'Nueva York (GMT-5/GMT-4)' }
  ];

  const languageOptions = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
    { value: 'pt', label: 'Português' }
  ];

  const unitOptions = [
    { value: 'kg', label: 'Kilogramos (kg)' },
    { value: 'g', label: 'Gramos (g)' },
    { value: 'l', label: 'Litros (l)' },
    { value: 'ml', label: 'Mililitros (ml)' },
    { value: 'units', label: 'Unidades' },
    { value: 'dozen', label: 'Docenas' },
    { value: 'boxes', label: 'Cajas' },
    { value: 'bags', label: 'Bolsas' }
  ];

  const currentStepData = FORM_STEPS[currentStep];
  const progressPercentage = ((currentStep + 1) / FORM_STEPS.length) * 100;

  return (
    <ContentLayout spacing="normal">
      <VStack gap="lg" align="stretch">
        {/* Progress Header */}
        <Section variant="flat">
          <VStack gap="md" align="stretch">
            <HStack justify="space-between" align="center">
              <VStack align="start" gap="xs">
                <Heading size="lg">Configuración del Negocio</Heading>
                <Typography variant="muted">
                  Paso {currentStep + 1} de {FORM_STEPS.length}: {currentStepData.title}
                </Typography>
              </VStack>
              <Badge variant="outline" size="lg">
                {Math.round(progressPercentage)}% completado
              </Badge>
            </HStack>
            
            {/* Progress Bar */}
            <Stack direction="row" gap="xs" align="center">
              {FORM_STEPS.map((step, index) => (
                <HStack key={step.id} gap="xs" flex={1}>
                  <Stack 
                    direction="row" 
                    align="center" 
                    gap="xs" 
                    opacity={index <= currentStep ? 1 : 0.5}
                    fontSize="sm"
                  >
                    <Typography 
                      variant={index === currentStep ? "default" : index < currentStep ? "success" : "muted"}
                      fontWeight={index === currentStep ? "medium" : "normal"}
                    >
                      {step.icon} {step.title}
                    </Typography>
                  </Stack>
                  {index < FORM_STEPS.length - 1 && (
                    <Stack 
                      height="2px" 
                      bg={index < currentStep ? "blue.500" : "gray.200"} 
                      flex={1}
                      borderRadius="full"
                    />
                  )}
                </HStack>
              ))}
            </Stack>
          </VStack>
        </Section>

        {/* Form Content */}
        <Section 
          variant="elevated" 
          title={`${currentStepData.icon} ${currentStepData.title}`}
          subtitle={currentStepData.subtitle}
        >
          <Stack 
            opacity={isTransitioning ? 0.6 : 1}
            transform={isTransitioning ? "translateY(10px)" : "translateY(0)"}
            transition="all 0.2s ease"
            gap="lg"
          >
            {/* Step Content */}
            {renderStepContent()}
          </Stack>
        </Section>

        {/* Navigation */}
        <Section variant="flat">
          <HStack justify="space-between" align="center">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={isTransitioning}
            >
              ← {currentStep === 0 ? 'Volver' : 'Anterior'}
            </Button>
            
            <HStack gap="sm">
              <Typography variant="muted" fontSize="sm">
                Paso {currentStep + 1} de {FORM_STEPS.length}
              </Typography>
              
              <Button
                variant="solid"
                onClick={handleNext}
                loading={isSubmitting}
                disabled={isTransitioning}
                size="lg"
              >
                {currentStep === FORM_STEPS.length - 1 ? (
                  isSubmitting ? 'Guardando...' : 'Completar Configuración'
                ) : (
                  'Continuar →'
                )}
              </Button>
            </HStack>
          </HStack>
        </Section>
      </VStack>
    </ContentLayout>
  );

  function renderStepContent() {
    switch (currentStep) {
      case 0: // Business Info
        return (
          <VStack gap="lg" align="stretch">
            <Stack direction="row" gap="lg">
              <InputField
                label="Nombre del Negocio *"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                placeholder="Ej: Restaurante El Buen Sabor"
                error={errors.businessName}
                required
                flex={1}
              />
              
              <SelectField
                label="Tipo de Negocio *"
                value={formData.businessType}
                onChange={(value) => handleInputChange('businessType', Array.isArray(value) ? value[0] : value)}
                options={businessTypeOptions}
                flex={1}
              />
            </Stack>

            <Stack direction="row" gap="lg">
              <InputField
                label="CUIT/RUT/Tax ID"
                value={formData.taxId}
                onChange={(e) => handleInputChange('taxId', e.target.value)}
                placeholder="20-12345678-9"
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
                label="Sitio Web (Opcional)"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.mi-negocio.com"
                flex={1}
              />
            </Stack>
          </VStack>
        );

      case 1: // Location
        return (
          <VStack gap="lg" align="stretch">
            <InputField
              label="Dirección *"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Av. Corrientes 1234"
              error={errors.address}
              required
            />

            <Stack direction="row" gap="lg">
              <InputField
                label="Ciudad *"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Buenos Aires"
                error={errors.city}
                required
                flex={2}
              />
              
              <InputField
                label="Provincia/Estado"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="CABA"
                flex={1}
              />
            </Stack>
            
            <Stack direction="row" gap="lg">
              <SelectField
                label="País"
                value={formData.country}
                onChange={(value) => handleInputChange('country', Array.isArray(value) ? value[0] : value)}
                options={countryOptions}
                flex={2}
              />
              
              <InputField
                label="Código Postal"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                placeholder="C1001AAP"
                flex={1}
              />
            </Stack>
          </VStack>
        );

      case 2: // Settings
        return (
          <VStack gap="lg" align="stretch">
            <Stack direction="row" gap="lg">
              <SelectField
                label="Moneda *"
                value={formData.currency}
                onChange={(value) => handleInputChange('currency', Array.isArray(value) ? value[0] : value)}
                options={currencyOptions}
                flex={1}
              />
              
              <SelectField
                label="Zona Horaria"
                value={formData.timezone}
                onChange={(value) => handleInputChange('timezone', Array.isArray(value) ? value[0] : value)}
                options={timezoneOptions}
                flex={1}
              />
              
              <SelectField
                label="Idioma"
                value={formData.defaultLanguage}
                onChange={(value) => handleInputChange('defaultLanguage', Array.isArray(value) ? value[0] : value)}
                options={languageOptions}
                flex={1}
              />
            </Stack>
            
            <Stack direction="row" gap="lg">
              <SelectField
                label="Unidad de Medida por Defecto"
                value={formData.defaultUnit}
                onChange={(value) => handleInputChange('defaultUnit', Array.isArray(value) ? value[0] : value)}
                options={unitOptions}
                flex={1}
              />
              
              <NumberField
                label="Umbral de Stock Bajo"
                value={formData.lowStockThreshold}
                onChange={(value) => handleInputChange('lowStockThreshold', value || 10)}
                min={1}
                max={100}
                flex={1}
              />
            </Stack>
          </VStack>
        );

      default:
        return null;
    }
  }
}

export type { BusinessData };
