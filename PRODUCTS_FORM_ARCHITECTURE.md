# Products Form Architecture - Technical Design

**Date**: 2025-01-08
**Purpose**: Arquitectura técnica del formulario de productos respetando el sistema de capabilities

---

## 🏗️ DECISIONES ARQUITECTÓNICAS CLAVE

### ✅ Decisión A: Product Types - 5 Tipos Fundamentales

```typescript
type ProductType =
  | 'physical_product'  // Retail, comida preparada
  | 'service'           // Servicios profesionales
  | 'rental'            // Alquiler de assets
  | 'digital'           // Productos digitales
  | 'membership'        // Membresías recurrentes
```

**Razón para separar Physical vs Service**:
- Diferente comportamiento de inventario (genera stock vs no genera)
- Diferentes validaciones (materials casi obligatorio vs staff casi obligatorio)
- UX más clara: "¿Producto o servicio?" es más intuitivo
- Pricing model diferente

---

### ✅ Decisión B: NO Hard-coded Conditionals - Usar Capability System

**❌ MAL - Viola arquitectura**:
```tsx
// NUNCA hacer esto
{capabilities.includes('memberships') && (
  <MembershipTemplate />
)}
```

**✅ BIEN - Usar CapabilityStore + FeatureRegistry**:
```tsx
import { useCapabilityStore } from '@/store/capabilityStore'

function ProductTemplateSelector() {
  // Obtener capabilities desde el store centralizado
  const activeCapabilities = useCapabilityStore(state =>
    state.profile.selectedCapabilities
  )

  // Computar templates disponibles basado en capabilities
  const availableTemplates = useAvailableProductTypes(activeCapabilities)

  return (
    <TemplateGrid>
      {availableTemplates.map(template => (
        <TemplateCard key={template.type} {...template} />
      ))}
    </TemplateGrid>
  )
}
```

---

## 🎯 ARQUITECTURA: Hook de Disponibilidad de Templates

### Hook: `useAvailableProductTypes`

```typescript
// src/pages/admin/supply-chain/products/hooks/useAvailableProductTypes.ts

import { useMemo } from 'react'
import { useCapabilityStore } from '@/store/capabilityStore'
import type { BusinessCapabilityId } from '@/config/BusinessModelRegistry'

export interface ProductTypeTemplate {
  type: ProductType
  label: string
  icon: string
  description: string
  examples: string[]
  enabled: boolean
  requiredCapabilities: BusinessCapabilityId[]
  recommendedCapabilities?: BusinessCapabilityId[]
}

/**
 * Determina qué tipos de productos están disponibles
 * basado en las capabilities activas del negocio
 */
export function useAvailableProductTypes(): ProductTypeTemplate[] {
  const activeCapabilities = useCapabilityStore(state =>
    state.profile.selectedCapabilities
  )

  return useMemo(() => {
    const templates: ProductTypeTemplate[] = []

    // TEMPLATE 1: Physical Product
    // Disponible si hay materials O production O staff
    if (
      activeCapabilities.includes('materials') ||
      activeCapabilities.includes('production') ||
      activeCapabilities.includes('staff')
    ) {
      templates.push({
        type: 'physical_product',
        label: 'Producto Físico',
        icon: '📦',
        description: 'Artículos tangibles que vendes o produces',
        examples: ['Comida preparada', 'Retail', 'Productos ensamblados'],
        enabled: true,
        requiredCapabilities: [],  // Al menos una de las arriba
        recommendedCapabilities: ['materials', 'production']
      })
    }

    // TEMPLATE 2: Service
    // Disponible si hay staff O scheduling
    if (
      activeCapabilities.includes('staff') ||
      activeCapabilities.includes('scheduling')
    ) {
      templates.push({
        type: 'service',
        label: 'Servicio',
        icon: '💼',
        description: 'Servicios profesionales que ofreces',
        examples: ['Consultas', 'Tratamientos', 'Reparaciones'],
        enabled: true,
        requiredCapabilities: ['staff'],  // Staff es casi obligatorio
        recommendedCapabilities: ['scheduling']
      })
    }

    // TEMPLATE 3: Asset Rental
    // Solo disponible si assets capability está activa
    if (activeCapabilities.includes('assets')) {
      templates.push({
        type: 'rental',
        label: 'Alquiler de Activo',
        icon: '🚗',
        description: 'Alquiler de equipos, espacios o vehículos',
        examples: ['Autos', 'Salas', 'Herramientas'],
        enabled: true,
        requiredCapabilities: ['assets', 'scheduling'],
        recommendedCapabilities: []
      })
    }

    // TEMPLATE 4: Digital Product
    // Solo disponible si digital_products capability está activa
    if (activeCapabilities.includes('digital_products')) {
      templates.push({
        type: 'digital',
        label: 'Producto Digital',
        icon: '💻',
        description: 'Contenido digital descargable o accesible',
        examples: ['Cursos online', 'Ebooks', 'Descargas'],
        enabled: true,
        requiredCapabilities: ['digital_products'],
        recommendedCapabilities: []
      })
    }

    // TEMPLATE 5: Membership
    // Solo disponible si memberships capability está activa
    if (activeCapabilities.includes('memberships')) {
      templates.push({
        type: 'membership',
        label: 'Membresía',
        icon: '🎫',
        description: 'Acceso recurrente a servicios o espacios',
        examples: ['Gym', 'Club', 'Subscripción'],
        enabled: true,
        requiredCapabilities: ['memberships'],
        recommendedCapabilities: ['scheduling']
      })
    }

    return templates
  }, [activeCapabilities])
}
```

---

## 🎨 ARQUITECTURA: Componente Template Selector

```tsx
// src/pages/admin/supply-chain/products/components/ProductTypeSelector.tsx

import { Stack, Heading, Text, SimpleGrid } from '@chakra-ui/react'
import { useAvailableProductTypes } from '../hooks/useAvailableProductTypes'
import type { ProductType } from '../types'

interface ProductTypeSelectorProps {
  onSelectType: (type: ProductType) => void
}

export function ProductTypeSelector({ onSelectType }: ProductTypeSelectorProps) {
  const availableTypes = useAvailableProductTypes()

  // Si no hay tipos disponibles, mostrar mensaje
  if (availableTypes.length === 0) {
    return (
      <EmptyState
        title="No hay capabilities activas"
        description="Activa capabilities en configuración para crear productos"
      />
    )
  }

  return (
    <Stack gap={6}>
      <Stack gap={2}>
        <Heading size="lg">Nuevo Producto</Heading>
        <Text color="gray.600">
          Selecciona el tipo de producto que deseas crear
        </Text>
      </Stack>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
        {availableTypes.map(template => (
          <ProductTypeCard
            key={template.type}
            template={template}
            onClick={() => onSelectType(template.type)}
          />
        ))}
      </SimpleGrid>
    </Stack>
  )
}

interface ProductTypeCardProps {
  template: ProductTypeTemplate
  onClick: () => void
}

function ProductTypeCard({ template, onClick }: ProductTypeCardProps) {
  return (
    <Card
      cursor="pointer"
      onClick={onClick}
      _hover={{ borderColor: 'purple.500', shadow: 'md' }}
      transition="all 0.2s"
    >
      <CardBody>
        <Stack gap={3}>
          <Text fontSize="3xl">{template.icon}</Text>
          <Heading size="md">{template.label}</Heading>
          <Text fontSize="sm" color="gray.600">
            {template.description}
          </Text>
          <Stack gap={1}>
            <Text fontSize="xs" fontWeight="bold" color="gray.500">
              Ejemplos:
            </Text>
            <Text fontSize="xs" color="gray.500">
              {template.examples.join(', ')}
            </Text>
          </Stack>
        </Stack>
      </CardBody>
    </Card>
  )
}
```

---

## 🧩 ARQUITECTURA: Form Sections Registry

Para mantener consistencia y extensibilidad, necesitamos un **registry de secciones**:

```typescript
// src/pages/admin/supply-chain/products/config/formSectionsRegistry.ts

import type { ProductType } from '../types'
import type { BusinessCapabilityId } from '@/config/BusinessModelRegistry'

export interface FormSection {
  id: string
  label: string
  component: React.ComponentType<any>
  requiredCapabilities?: BusinessCapabilityId[]
  visibilityRule: (type: ProductType, caps: BusinessCapabilityId[]) => boolean
}

/**
 * Registry de todas las secciones disponibles del formulario
 */
export const FORM_SECTIONS_REGISTRY: Record<string, FormSection> = {
  // Secciones universales (siempre visibles)
  basic_info: {
    id: 'basic_info',
    label: 'Información Básica',
    component: BasicInfoSection,
    visibilityRule: () => true  // Siempre visible
  },

  pricing: {
    id: 'pricing',
    label: 'Precio',
    component: PricingSection,
    visibilityRule: () => true  // Siempre visible
  },

  // Secciones condicionales
  materials: {
    id: 'materials',
    label: 'Materiales/Ingredientes',
    component: MaterialsSection,
    requiredCapabilities: ['materials'],
    visibilityRule: (type, caps) => {
      // Visible para physical_product y service (si cap activa)
      if (!caps.includes('materials')) return false
      return ['physical_product', 'service', 'rental'].includes(type)
    }
  },

  staff: {
    id: 'staff',
    label: 'Personal',
    component: StaffSection,
    requiredCapabilities: ['staff'],
    visibilityRule: (type, caps) => {
      if (!caps.includes('staff')) return false
      return ['physical_product', 'service', 'rental'].includes(type)
    }
  },

  booking: {
    id: 'booking',
    label: 'Reservas',
    component: BookingSection,
    requiredCapabilities: ['scheduling'],
    visibilityRule: (type, caps) => {
      if (!caps.includes('scheduling')) return false

      // SIEMPRE para rental
      if (type === 'rental') return true

      // Opcional para service
      if (type === 'service') return true

      // Opcional para membership
      if (type === 'membership') return true

      return false
    }
  },

  production: {
    id: 'production',
    label: 'Producción',
    component: ProductionSection,
    requiredCapabilities: ['production'],
    visibilityRule: (type, caps) => {
      if (!caps.includes('production')) return false
      return type === 'physical_product'  // Solo para productos físicos
    }
  },

  digital_delivery: {
    id: 'digital_delivery',
    label: 'Entrega Digital',
    component: DigitalDeliverySection,
    requiredCapabilities: ['digital_products'],
    visibilityRule: (type, caps) => {
      if (!caps.includes('digital_products')) return false
      return type === 'digital'
    }
  },

  asset_config: {
    id: 'asset_config',
    label: 'Configuración de Activo',
    component: AssetConfigSection,
    requiredCapabilities: ['assets'],
    visibilityRule: (type, caps) => {
      if (!caps.includes('assets')) return false
      return type === 'rental'
    }
  },

  rental_terms: {
    id: 'rental_terms',
    label: 'Términos de Alquiler',
    component: RentalTermsSection,
    requiredCapabilities: ['assets'],
    visibilityRule: (type, caps) => {
      if (!caps.includes('assets')) return false
      return type === 'rental'
    }
  },

  recurring_config: {
    id: 'recurring_config',
    label: 'Configuración Recurrente',
    component: RecurringConfigSection,
    requiredCapabilities: ['memberships'],
    visibilityRule: (type, caps) => {
      if (!caps.includes('memberships')) return false
      return type === 'membership'
    }
  }
}

/**
 * Hook para obtener las secciones visibles según tipo y capabilities
 */
export function useVisibleFormSections(
  productType: ProductType
): FormSection[] {
  const activeCapabilities = useCapabilityStore(state =>
    state.profile.selectedCapabilities
  )

  return useMemo(() => {
    return Object.values(FORM_SECTIONS_REGISTRY).filter(section =>
      section.visibilityRule(productType, activeCapabilities)
    )
  }, [productType, activeCapabilities])
}
```

---

## 🎯 ARQUITECTURA: Formulario Dinámico

```tsx
// src/pages/admin/supply-chain/products/components/ProductFormModal/index.tsx

import { useState } from 'react'
import { Dialog, Stack } from '@chakra-ui/react'
import { useVisibleFormSections } from '../../config/formSectionsRegistry'
import type { ProductType } from '../../types'

interface ProductFormModalProps {
  productType: ProductType
  onClose: () => void
  onSave: (data: ProductFormData) => void
}

export function ProductFormModal({
  productType,
  onClose,
  onSave
}: ProductFormModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({})

  // Obtener secciones visibles según tipo y capabilities
  const visibleSections = useVisibleFormSections(productType)

  const handleSubmit = () => {
    // Validar
    const errors = validateProduct(formData, productType)
    if (errors.length > 0) {
      showErrors(errors)
      return
    }

    // Guardar
    onSave(formData)
  }

  return (
    <Dialog open onClose={onClose} size="xl">
      <DialogContent>
        <DialogHeader>
          Nuevo Producto - {getProductTypeLabel(productType)}
        </DialogHeader>

        <DialogBody>
          <Stack gap={6}>
            {/* Renderizar secciones dinámicamente */}
            {visibleSections.map(section => {
              const SectionComponent = section.component
              return (
                <SectionComponent
                  key={section.id}
                  data={formData}
                  onChange={setFormData}
                />
              )
            })}
          </Stack>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button colorPalette="purple" onClick={handleSubmit}>
            Crear Producto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

## 🔄 EXTENSIBILIDAD: HookPoints para Módulos Externos

Para casos futuros donde otros módulos quieran inyectar secciones:

```typescript
// En ProductFormModal, después de secciones nativas:

<HookPoint
  name="products.form.sections"
  data={{
    productType,
    formData,
    onChange: setFormData,
    activeCapabilities
  }}
/>
```

Esto permite que, por ejemplo, el módulo de **Finance** pueda inyectar una sección de "Pricing Avanzado" sin modificar el código de Products.

---

## ✅ VENTAJAS DE ESTA ARQUITECTURA

1. **Respeta sistema de capabilities**: Usa CapabilityStore, no hard-coded checks
2. **Single source of truth**: Capabilities definen disponibilidad
3. **Extensible**: Fácil agregar nuevos tipos o secciones
4. **Testeable**: Funciones puras, fácil de unit test
5. **Type-safe**: TypeScript garantiza consistencia
6. **Performance**: useMemo previene re-renders innecesarios
7. **Mantenible**: Registry centralizado de secciones
8. **Hook Points**: Permite inyección de módulos externos

---

## 📊 DIAGRAMA DE FLUJO

```
Usuario click "Nuevo Producto"
    ↓
ProductTypeSelector
    ↓
useAvailableProductTypes()
    ├→ Obtiene activeCapabilities desde CapabilityStore
    ├→ Computa templates disponibles
    └→ Retorna solo templates habilitados
    ↓
Usuario selecciona tipo (ej: 'service')
    ↓
ProductFormModal recibe productType='service'
    ↓
useVisibleFormSections('service')
    ├→ Obtiene activeCapabilities
    ├→ Filtra FORM_SECTIONS_REGISTRY
    └→ Retorna solo secciones visibles
    ↓
Renderiza secciones dinámicamente
    ├→ BasicInfoSection (siempre)
    ├→ PricingSection (siempre)
    ├→ StaffSection (si staff cap activa)
    ├→ BookingSection (si scheduling cap activa)
    └→ ... más según rules
```

---

## 🎯 PRÓXIMOS PASOS

1. Implementar `useAvailableProductTypes` hook
2. Crear `ProductTypeSelector` component
3. Crear `FORM_SECTIONS_REGISTRY`
4. Implementar secciones individuales:
   - BasicInfoSection
   - MaterialsSection
   - StaffSection
   - BookingSection
   - etc.
5. Implementar sistema de validaciones por tipo

---

**Esta arquitectura es extensible, respeta nuestro sistema de capabilities, y está preparada para casos híbridos futuros.**
