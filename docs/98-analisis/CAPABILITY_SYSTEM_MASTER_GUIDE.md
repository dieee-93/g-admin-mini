# Capability System Master Guide
**G-Admin Mini v2.1 - Definitive Documentation with Corrected Criteria**

## 🎯 **Sistema de Capabilities - Fuente de la Verdad**

Este documento consolida toda la información del sistema de capabilities con el **criterio corregido** basado en feedback del usuario.

## ✅ **Criterio Definitivo**

### **Principio Fundamental: Flexibilidad > Restricción**

**Problema Original**: Mapeos demasiado restrictivos que perdían abstracción
**Solución**: Features **universales** y **flexibles** para múltiples tipos de negocio

### **Categorías de Features**

#### **1. Features Universales** (Todos los negocios)
```typescript
// Aplicar 'auto' o múltiples triggers amplios
UNIVERSAL_FEATURES = [
  'payment_gateway',        // Todos cobran
  'customer_management',    // Todos tienen clientes
  'notifications_system',   // Todos se comunican
  'digital_catalog',        // Todos muestran su oferta
  'inventory_tracking'      // Todos manejan "cosas"
];
```

#### **2. Features Flexibles** (Múltiples business models)
```typescript
'online_ordering': [
  'has_online_store',              // E-commerce asíncrono 24/7
  'sells_products_for_pickup',     // Restaurant take-away con horarios
  'sells_products_with_delivery',  // Delivery con horarios
  'sells_services_by_appointment'  // Service booking online
]
```

#### **3. Features Específicas** (Un solo uso claro)
```typescript
'kitchen_management': ['sells_products_for_onsite_consumption'], // Solo restaurants
'appointment_booking': ['sells_services_by_appointment']         // Solo servicios by appointment
```

## 🔧 **Mapeo de Shared Dependencies Correcto**

```typescript
export const SHARED_FEATURE_DEPENDENCIES: Record<string, BusinessCapability[]> = {
  // 💳 UNIVERSAL: Todos cobran
  'payment_gateway': [
    'sells_products',                // Cualquier venta de productos
    'sells_services',                // Cualquier venta de servicios
    'manages_events',                // Eventos con pago
    'manages_rentals',               // Alquileres
    'manages_subscriptions'          // Suscripciones
  ],

  // 👥 UNIVERSAL: Todos tienen clientes
  'customer_management': [
    'sells_products',                // Clientes que compran
    'sells_services',                // Clientes que contratan servicios
    'manages_events',                // Clientes de eventos
    'manages_rentals',               // Clientes de alquileres
    'loyalty_management',            // Programas de lealtad
    'is_b2b_focused'                // B2B clients
  ],

  // 🔔 UNIVERSAL: Todos se comunican
  'notifications_system': [
    'sells_products',                // Notificaciones de productos
    'sells_services',                // Notificaciones de servicios
    'manages_events',                // Event notifications
    'staff_management',              // Comunicación interna
    'has_online_store'              // Order updates
  ],

  // 📦 FLEXIBLE: Todos manejan "cosas"
  'inventory_tracking': [
    'sells_products',                // Productos físicos
    'sells_services',                // Supplies y herramientas
    'manages_events',                // Materiales y decoración
    'manages_rentals'                // Items para alquilar
  ],

  // 📊 FLEXIBLE: Analytics para negocios complejos
  'advanced_analytics': [
    'is_b2b_focused',               // B2B requiere métricas
    'sells_products',               // Analytics de productos
    'sells_services',               // Analytics de servicios
    'premium_tier'                  // Plan premium
  ]
};
```

## 📋 **Ejemplos de Abstracción Correcta**

### **Caso 1: Restaurant con Online Ordering**
```typescript
// ✅ CORRECTO: Restaurant puede tener online_ordering
capabilities: ['sells_products_for_onsite_consumption', 'sells_products_for_pickup']
activated_features: ['pos_system', 'kitchen_management', 'online_ordering', 'digital_catalog']

// Diferencia con e-commerce:
// - Restaurant: Horarios específicos, pickup/delivery coordinado con cocina
// - E-commerce: Asíncrono 24/7, fulfillment independiente
```

### **Caso 2: Peluquería con Tratamiento**
```typescript
// ✅ ABSTRACCIÓN CORRECTA: Service que usa supplies
capabilities: ['sells_services_by_appointment', 'staff_management']
activated_features: ['appointment_booking', 'supply_management', 'inventory_tracking', 'customer_profiles']

// Lógica: Es un servicio pero necesita materiales (tinturas, químicos)
// No es producto porque el valor está en la aplicación/servicio, no en el químico
```

### **Caso 3: Event Planning**
```typescript
// ✅ FLEXIBLE: Eventos necesitan múltiples capabilities
capabilities: ['manages_events', 'staff_management', 'manages_rentals']
activated_features: ['event_planning', 'staff_scheduling', 'event_inventory', 'rental_tracking', 'customer_management']

// Combina: Planificación + Personal + Equipos/Decoración + Clientes
```

## 🚨 **Casos Edge Identificados con Nuevo Criterio**

### **Caso 1: `staff_scheduling` vs `schedule_management`**
```typescript
// ❓ POSIBLE PROBLEMA: Redundancia o confusión
'staff_scheduling': ['staff_management'],           // Para empleados
'schedule_management': ['schedule_management'],     // ¿General?

// ✅ SOLUCIÓN: Clarificar diferencia o consolidar
'staff_scheduling': ['staff_management'],           // Horarios de empleados
'resource_scheduling': ['manages_events', 'manages_rentals'], // Horarios de recursos/equipos
'appointment_scheduling': ['sells_services_by_appointment']   // Horarios de servicios
```

### **Caso 2: `digital_catalog` vs `menu_management`**
```typescript
// ❓ POSIBLE PROBLEMA: ¿Son lo mismo o diferentes?
'digital_catalog': [...],  // Catálogo general
'menu_engineering': ['sells_products_for_onsite_consumption'], // Specific para restaurant

// ✅ ANÁLISIS: Diferentes niveles de sofisticación
// - digital_catalog: Mostrar productos/servicios básico
// - menu_engineering: Análisis de rentabilidad, optimización, psychology pricing
```

### **Caso 3: `inventory_tracking` vs `stock_optimization`**
```typescript
// ❓ POSIBLE PROBLEMA: Niveles de sofisticación
'inventory_tracking': [...],              // Universal - contar cosas
'stock_optimization': ['advanced_analytics'], // Avanzado - optimizar inventario

// ✅ CORRECTO: Diferentes niveles de la misma función
```

### **Caso 4: Features de Payment**
```typescript
// ❓ POSIBLE PROBLEMA: ¿Todos los payment features son universales?
'payment_gateway': 'auto',               // ✅ Universal - todos cobran
'payment_processing': [...],             // ¿Es diferente?
'payment_analytics': ['advanced_analytics'], // ¿O es específico para analytics?

// ✅ REVISAR: ¿Hay redundancia o son features complementarias?
```

### **Caso 5: Customer Features Granulares**
```typescript
// ❓ POSIBLE PROBLEMA: Demasiada granularidad
'customer_profiles': 'auto',             // Universal
'customer_analytics': ['customer_analytics'], // Específico
'customer_segmentation': ['marketing_tools'], // Marketing específico
'customer_loyalty': ['loyalty_management'],   // Loyalty específico

// ✅ PREGUNTA: ¿Deberían ser features separadas o niveles de una misma feature?
```

## 🔍 **Preguntas de Validación Pendientes**

### **1. Sobre Operations Module**
- ¿`real_time_monitoring` es universal o específico?
- ¿Un servicio simple necesita "operations" o es solo para negocios complejos?

### **2. Sobre Materials/Inventory**
- ¿`supply_management` vs `inventory_tracking` - cuál es la diferencia?
- ¿Un consultant que usa laptop necesita "materials"?

### **3. Sobre Scheduling**
- ¿`calendar_integration` es universal o específico?
- ¿Un retail simple necesita scheduling o solo para servicios/staff?

### **4. Sobre Analytics**
- ¿Cuál es el baseline de analytics que todos necesitan?
- ¿`cross_module_insights` es universal o premium?

## 📊 **Estado Actual vs Ideal**

### **Documentos Mantenidos** ✅
- `CORRECTED_MAPPING_CRITERIA.md` - Criterio y lecciones aprendidas
- `BUSINESS_MODEL_VALIDATION_TESTS.md` - Tests comprensivos
- `CAPABILITY_SYSTEM_MASTER_GUIDE.md` - Este documento (fuente de verdad)

### **Código Actualizado** ✅
- `moduleCapabilityMapping.ts` - Shared dependencies corregidas
- Features universales expandidas
- Criterio flexible aplicado

### **Próximos Pasos** 🔄
1. Validar casos edge identificados
2. Probar con debugger las correcciones
3. Revisar redundancias en features granulares
4. Definir niveles de sofisticación (básico/avanzado)

---

**Actualizado**: 2025-01-23
**Status**: ✅ Fuente de la Verdad Consolidada
**Criterio**: Flexible y Universal > Restrictivo
**Próximo**: Validar casos edge y probar implementación