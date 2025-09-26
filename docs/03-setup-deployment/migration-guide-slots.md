# 🚀 Guía de Migración: Sistema de Slots G-Admin v3.2

> **Versión**: 3.2 - Slots System Implementation
> **Fecha**: 2025-09-22
> **Tipo**: Major Update - Refactoring Arquitectónico

**📋 Índice de Migración:**
- [✅ Cambios Implementados](#-cambios-implementados)
- [🔄 Migración de Componentes](#-migración-de-componentes)
- [🚨 Breaking Changes](#-breaking-changes)
- [🛠️ APIs Principales](#-apis-principales)
- [📚 Referencias](#-referencias)

## ✅ **¿Qué se implementó?**

### **1. Sistema de Slots Completo**
- **SlotRegistry**: Core del sistema para registrar/desregistrar componentes
- **Slot Component**: React component para renderizar slots dinámicamente
- **Utilidades**: Helpers para simplificar el uso del sistema

### **2. businessCapabilitiesStore Simplificado**
- ❌ **Eliminado**: `businessDNA`, `selectedCapabilities`, `enabledFeatures` (duplicación)
- ✅ **Mantenido**: `profile.capabilities` como única fuente de verdad
- ✅ **Agregado**: Métodos computados dinámicos (`getEnabledFeatures()`, etc.)

### **3. useCapabilities Simplificado**
- ❌ **Eliminado**: Cache complejo, lazy loading, telemetría (over-engineering)
- ✅ **Simplificado**: Usa directamente `getEnabledFeatures()` del store
- ✅ **Mantenido**: API limpia para componentes

## 🔄 **Cómo migrar tus componentes**

### **ANTES (con condicionales):**
```tsx
function MaterialRow({ material }) {
  const { hasCapability } = useCapabilities();

  return (
    <div>
      <span>{material.name}</span>
      {hasCapability('has_suppliers') && (
        <SupplierInfo supplier={material.supplier} />
      )}
      {hasCapability('has_analytics') && (
        <AnalyticsButton material={material} />
      )}
      {hasCapability('has_orders') && (
        <QuickOrderButton material={material} />
      )}
    </div>
  );
}
```

### **DESPUÉS (con slots):**
```tsx
import { Slot } from '@/lib/slots';

function MaterialRow({ material }) {
  return (
    <div>
      <span>{material.name}</span>
      <Slot name="material-supplier" data={{ material }} single />
      <Slot name="material-analytics" data={{ material }} single />
      <Slot name="material-actions" data={{ material }} gap={2} />
    </div>
  );
}
```

### **Registro de Módulos:**
```tsx
// En cada módulo (suppliers, analytics, etc.)
import { registerModuleSlots } from '@/lib/slots';

// Registrar al inicializar el módulo
registerModuleSlots('suppliers', [
  {
    slotName: 'material-supplier',
    component: SupplierInfoComponent,
    requirements: ['has_suppliers']
  }
]);
```

## 🎯 **Beneficios Inmediatos**

### **1. Eliminación de Condicionales**
- **Antes**: Condicionales esparcidos por toda la app
- **Después**: Lógica centralizada en el registry

### **2. Escalabilidad**
- **Antes**: Agregar módulo = tocar múltiples archivos
- **Después**: Agregar módulo = registrar slots

### **3. Performance**
- **Antes**: Estado duplicado + cache complejo
- **Después**: Una sola fuente de verdad, computación dinámica

### **4. Mantenibilidad**
- **Antes**: Lógica hardcodeada en múltiples lugares
- **Después**: Sistema declarativo y modular

## 🛠️ **APIs Principales**

### **Slot Component**
```tsx
<Slot
  name="slot-name"           // Nombre único del slot
  data={{ entity }}          // Datos para componentes
  single={true}              // Solo primer componente
  fallback={<Fallback />}    // Si no hay componentes
  additionalRequirements={[]} // Capacidades extra
/>
```

### **Registro de Slots**
```tsx
import { slotRegistry } from '@/lib/slots';

slotRegistry.register(
  'slot-name',                    // Nombre del slot
  ComponentToRender,              // Componente React
  ['required_capability'],        // Capacidades requeridas
  {
    moduleId: 'my-module',        // ID del módulo
    priority: 10,                 // Prioridad (mayor = primero)
    id: 'unique-id'               // ID único del componente
  }
);
```

### **Hook de Capacidades**
```tsx
import { useCapabilities } from '@/lib/capabilities';

const {
  hasCapability,           // Verificar capacidad individual
  hasAllCapabilities,      // Verificar múltiples (AND)
  hasAnyCapability,        // Verificar múltiples (OR)
  activeCapabilities,      // Lista de capacidades activas
  setCapability           // Cambiar capacidad
} = useCapabilities();
```

## 🚨 **Breaking Changes**

### **businessCapabilitiesStore**
```tsx
// ❌ YA NO EXISTE:
store.businessDNA
store.selectedCapabilities
store.enabledFeatures

// ✅ USAR AHORA:
store.profile.capabilities        // Estado
store.getEnabledFeatures()       // Computed
store.getDashboardModules()      // Computed
store.getRelevantTutorials()     // Computed
```

### **useCapabilities Hook**
```tsx
// ❌ YA NO EXISTE:
cacheStats
preloadCapability
isCapabilityLoaded
getRequiredModules

// ✅ API SIMPLIFICADA:
hasCapability, hasAllCapabilities, hasAnyCapability
activeCapabilities, enabledModules
setCapability
```

## 🔧 **Inicialización**

### **En tu App.tsx:**
```tsx
import { initializeSlotSystem } from '@/lib/slots';

function App() {
  useEffect(() => {
    initializeSlotSystem();
  }, []);

  return <YourApp />;
}
```

### **En cada módulo:**
```tsx
// modules/suppliers/index.ts
import { createModuleSlots } from '@/lib/slots';

const suppliers = createModuleSlots('suppliers');

// Registrar slots al cargar el módulo
suppliers.register('material-supplier', SupplierComponent, ['has_suppliers']);
suppliers.register('product-supplier', ProductSupplierComponent, ['has_suppliers']);
```

## 🎯 **Próximos Pasos**

1. **Migra componentes uno por uno** de condicionales a slots
2. **Registra slots de módulos existentes** (materials, products, sales, etc.)
3. **Usa el sistema para nuevos módulos** siguiendo el patrón establecido

## ❓ **FAQs**

**¿Puedo usar slots y condicionales al mismo tiempo?**
Sí, es perfectamente compatible durante la migración.

**¿El sistema de logros sigue funcionando?**
Sí, se simplificó pero mantiene la funcionalidad completa.

**¿Perdí funcionalidad de cache/performance?**
Para 20 módulos el cache era overkill. Si necesitas optimización específica, se puede agregar selectivamente.

**¿Cómo debug el sistema de slots?**
```tsx
import { debugSlots } from '@/lib/slots/utils';
debugSlots(); // Solo en development
```

## 📚 **Referencias**

### Documentación Relacionada
- **[🏢 Capacidades de Negocio](../02-architecture/business-capabilities.md)** - Arquitectura completa del sistema
- **[🧠 Module Planning Guide](../05-development/MODULE_PLANNING_MASTER_GUIDE.md)** - Metodología para nuevos módulos
- **[🎨 Component Library](../05-development/component-library.md)** - Sistema de diseño
- **[🧪 Testing Guide](../05-development/testing-guide.md)** - Testing del sistema de slots

### Código de Referencia
- **`src/lib/slots/`** - Implementación completa del sistema
- **`src/lib/capabilities/`** - Sistema de capacidades integrado
- **`src/store/businessCapabilitiesStore.ts`** - Store simplificado
- **`src/lib/slots/examples/`** - Ejemplos de implementación

### Próximos Pasos
1. **Implementar slots** en módulos existentes uno por uno
2. **Registrar componentes** usando `registerModuleSlots()`
3. **Migrar condicionales** a sistema de slots gradualmente
4. **Crear nuevos módulos** siguiendo el patrón de slots desde el inicio

---

**✅ Migración completada** - El sistema está listo para uso en producción.

Para soporte adicional, consulta la [documentación principal](../README.md) o el [sistema de capacidades](../02-architecture/business-capabilities.md).