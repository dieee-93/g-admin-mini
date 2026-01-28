# 🔔 Sistema de Alertas - Guía Completa del Desarrollador

**Versión:** 4.0.0 - Consolidada  
**Última Actualización:** Enero 27, 2026  
**Estado:** ✅ Implementado y Validado con Código Real  
**Audiencia:** Todos los desarrolladores

---

## 📖 Índice

1. [¿Qué es el Sistema de Alertas?](#qué-es-el-sistema-de-alertas)
2. [Las 3 Capas del Sistema](#las-3-capas-del-sistema)
3. [Comparación Rápida](#comparación-rápida)
4. [¿Cuándo Usar Cada Capa?](#cuándo-usar-cada-capa)
5. [Layer 1: Toasts - Feedback Inmediato](#layer-1-toasts---feedback-inmediato)
6. [Layer 2: Alerts - Notificaciones del Sistema](#layer-2-alerts---notificaciones-del-sistema)
7. [Layer 3: Predictive - Machine Learning (Futuro)](#layer-3-predictive---machine-learning-futuro)
8. [Arquitectura Técnica](#arquitectura-técnica)
9. [Ejemplos Prácticos Completos](#ejemplos-prácticos-completos)
10. [Testing y Debugging](#testing-y-debugging)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 ¿Qué es el Sistema de Alertas?

El sistema de alertas de G-Admin Mini es un **sistema de notificaciones de 3 capas** diseñado para:

- ✅ **Dar feedback inmediato** a las acciones del usuario (Layer 1)
- ✅ **Notificar eventos importantes** del sistema (Layer 2)
- ✅ **Predecir problemas** antes de que ocurran (Layer 3 - futuro)

### 🏗️ Principio de Diseño

```
Layer 1: TOASTS         → Confirmación instantánea (3-15 segundos)
    ↓
Layer 2: ALERTS         → Notificaciones persistentes (hasta resolver)
    ↓
Layer 3: PREDICTIVE     → Predicciones ML (futuro Q1 2026)
```

---

## 📊 Las 3 Capas del Sistema

### Diagrama de Arquitectura

```
┌──────────────────────────────────────────────────────────────┐
│                   SISTEMA DE ALERTAS                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Layer 1     │    │  Layer 2     │    │  Layer 3     │  │
│  │  TOASTS      │───▶│  ALERTS      │───▶│  PREDICTIVE  │  │
│  │              │    │              │    │              │  │
│  │ 🍞 Feedback  │    │ 📋 Events    │    │ 🔮 ML/AI     │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│        │                    │                    │          │
│        │                    │                    │          │
│  ✅ User actions      ⚠️  System events    🧠 Predictions   │
│  ✅ Confirmations     ⚠️  Business rules   🧠 Anomalies    │
│  ✅ Validations       ⚠️  Persistent       🧠 Forecasts    │
│  ✅ Auto-dismiss      ⚠️  Actionable       🧠 Proactive    │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                    ALMACENAMIENTO                            │
│                                                              │
│  Layer 1: NO persistido (solo UI)                           │
│  Layer 2: Supabase → tabla `alerts` ✅                       │
│  Layer 3: Supabase → tabla `alerts` + ML metadata 🔮        │
└──────────────────────────────────────────────────────────────┘
```

---

## ⚡ Comparación Rápida

| Característica | Layer 1: Toast 🍞 | Layer 2: Alert ⚠️ | Layer 3: Predictive 🔮 |
|----------------|-------------------|-------------------|----------------------|
| **Propósito** | Confirmar acción usuario | Notificar evento importante | Predecir problemas |
| **Trigger** | Usuario hace click/acción | Sistema detecta condición | ML analiza patrones |
| **Duración** | 3-15 segundos | Hasta que se resuelva | Variable según confianza |
| **Persistencia** | ❌ No guardado | ✅ Guardado en DB | ✅ Guardado en DB |
| **UI Location** | Bottom-right corner | Notification Center + Badges | Notification Center |
| **Inteligencia** | Ninguna | Reglas de negocio | Machine Learning |
| **Dismissible** | Auto-dismiss | Manual dismiss/resolve | Manual resolve |
| **Ejemplos** | "Material guardado" | "5 materiales sin stock" | "Leche se acabará en 3 días" |
| **Field DB** | - | `intelligence_level: 'smart'` | `intelligence_level: 'predictive'` |
| **Implementación** | ✅ Actual | ✅ Actual | 🔮 Q1 2026 |

---

## 🎯 ¿Cuándo Usar Cada Capa?

### Diagrama de Decisión

```
┌─────────────────────────────────────────────────────┐
│ ¿Necesitas CONFIRMAR una acción del usuario?       │
│ (guardado exitoso, error de validación, etc.)      │
└─────────────────┬───────────────────────────────────┘
                  │ SÍ
                  ▼
            💚 Layer 1: TOAST
            
┌─────────────────────────────────────────────────────┐
│ ¿Es un EVENTO IMPORTANTE que requiere atención?    │
│ (problema detectado, acción requerida, etc.)       │
└─────────────────┬───────────────────────────────────┘
                  │ SÍ
                  ▼
            🟡 Layer 2: ALERT
            
┌─────────────────────────────────────────────────────┐
│ ¿Necesitas PREDECIR problemas futuros con ML?      │
│ (forecast, anomalías, tendencias, etc.)            │
└─────────────────┬───────────────────────────────────┘
                  │ SÍ
                  ▼
            🔮 Layer 3: PREDICTIVE (Futuro)
```

### Checklist Rápido

#### ✅ Usa Layer 1: Toast cuando:
- Confirmas que algo se guardó correctamente
- Muestras un error de validación simple
- Indicas que algo está procesando
- Das feedback de "click exitoso"
- La información NO necesita persistir

#### ✅ Usa Layer 2: Alert cuando:
- Detectas un problema de negocio (stock bajo, orden atrasada)
- Necesitas que el usuario tome una acción
- La información debe persistir hasta resolverse
- Quieres analytics/tracking de la alerta
- Múltiples usuarios deben verla

#### ✅ Usa Layer 3: Predictive cuando (Futuro):
- Tienes un modelo ML entrenado
- Necesitas forecasting/predicciones
- Quieres detectar anomalías automáticamente
- El sistema debe ser proactivo, no reactivo

---

## 🍞 Layer 1: Toasts - Feedback Inmediato

### ¿Qué son los Toasts?

**Toasts** son notificaciones **temporales** y **no bloqueantes** que aparecen en la esquina inferior derecha de la pantalla para confirmar acciones del usuario.

### Características

- ⏱️ **Duración:** 3-15 segundos (auto-dismiss)
- 📍 **Ubicación:** Bottom-right corner (configurable)
- 💾 **Persistencia:** NO guardado en DB
- 🎨 **Tipos:** `success`, `error`, `warning`, `info`, `loading`
- 🔧 **Componente:** `<Toaster />` (Chakra UI)
- 📦 **Import:** `import { toaster } from '@/shared/ui'`

### Implementación en el Código

**Archivo:** `src/shared/ui/toaster.tsx`

```typescript
import { createToaster } from "@chakra-ui/react"

// Configuración global del toaster
export const toaster = createToaster({
  placement: "bottom-end",      // Esquina inferior derecha
  pauseOnPageIdle: true,        // Pausa cuando usuario está idle
})
```

**Componente en App.tsx:**

```tsx
<Provider>  {/* ChakraProvider - CRÍTICO */}
  <AlertsProvider>
    {/* ... contenido de la app ... */}
  </AlertsProvider>
  
  {/* ✅ TOASTER DENTRO DE PROVIDER */}
  <Toaster />
</Provider>
```

⚠️ **CRÍTICO:** El `<Toaster />` **DEBE** estar dentro de `<Provider>` (ChakraProvider) para tener acceso al contexto de Chakra UI. Si no, obtendrás el error: `ContextError: useContext returned undefined`.

### Uso Básico

```typescript
import { toaster } from '@/shared/ui';

// ✅ Success Toast
toaster.create({
  title: "Material guardado",
  description: "El material se guardó exitosamente",
  type: "success",
  duration: 3000  // 3 segundos
});

// ❌ Error Toast
toaster.create({
  title: "Error al guardar",
  description: "Por favor intenta de nuevo",
  type: "error",
  duration: 5000  // 5 segundos
});

// ⚠️ Warning Toast
toaster.create({
  title: "Advertencia",
  description: "El stock está bajo",
  type: "warning",
  duration: 4000
});

// ℹ️ Info Toast
toaster.create({
  title: "Información",
  description: "Procesando...",
  type: "info",
  duration: 3000
});

// ⏳ Loading Toast (no auto-dismiss)
const toastId = toaster.create({
  title: "Procesando...",
  type: "loading",
  duration: null  // No se auto-dismiss
});

// Luego actualizar
toaster.update(toastId, {
  title: "Completado!",
  type: "success",
  duration: 3000
});
```

### Patrones Comunes

#### Pattern 1: Form Submit Feedback
```typescript
const handleSubmit = async (formData: FormData) => {
  try {
    await saveMaterial(formData);
    
    // ✅ Layer 1: Confirmación inmediata
    toaster.create({
      title: "Material guardado",
      description: `${formData.name} se guardó correctamente`,
      type: "success",
      duration: 3000
    });
    
    onClose(); // Cerrar modal
  } catch (error) {
    // ❌ Layer 1: Error feedback
    toaster.create({
      title: "Error",
      description: "No se pudo guardar el material",
      type: "error",
      duration: 5000
    });
  }
};
```

#### Pattern 2: Loading State
```typescript
const handleProcess = async () => {
  const toastId = toaster.create({
    title: "Procesando datos...",
    type: "loading",
    duration: null
  });

  try {
    const result = await processData();
    
    toaster.update(toastId, {
      title: "Proceso completado!",
      description: `${result.count} items procesados`,
      type: "success",
      duration: 3000
    });
  } catch (error) {
    toaster.update(toastId, {
      title: "Error en proceso",
      description: error.message,
      type: "error",
      duration: 5000
    });
  }
};
```

#### Pattern 3: Action con Undo
```typescript
const handleDelete = async (itemId: string) => {
  await deleteItem(itemId);
  
  toaster.create({
    title: "Material eliminado",
    type: "info",
    duration: 5000,
    action: {
      label: "Deshacer",
      onClick: () => restoreItem(itemId)
    }
  });
};
```

### Ejemplos Reales del Código

**Archivo:** `src/modules/sales/hooks/usePOSCart.ts`

```typescript
// Toast cuando se agrega producto al carrito
toaster.create({
  title: `${product.name} agregado`,
  description: `Cantidad: ${quantity}`,
  type: "success",
  duration: 2000
});
```

**Archivo:** `src/modules/sales/hooks/useTables.ts`

```typescript
// Toast cuando se cierra mesa
toaster.create({
  title: "Mesa cerrada",
  description: `Mesa ${tableNumber} cerrada exitosamente`,
  type: "success",
  duration: 3000
});
```

---

## ⚠️ Layer 2: Alerts - Notificaciones del Sistema

### ¿Qué son las Alerts?

**Alerts** son notificaciones **persistentes** del sistema que se almacenan en la base de datos y permanecen visibles hasta que el usuario las resuelva o desaparezca la condición que las generó.

### Características

- ⏱️ **Duración:** Hasta que se resuelva o se dismissee
- 📍 **Ubicación:** Notification Center (navbar icon) + Módulo badges
- 💾 **Persistencia:** ✅ Guardado en Supabase → tabla `alerts`
- 🎨 **Severidad:** `critical`, `high`, `medium`, `low`, `info`
- 🧠 **Intelligence Level:** `'simple'` o `'smart'`
- 📦 **Provider:** `<AlertsProvider>` en App.tsx
- 🪝 **Hook:** `useAlerts()`

### Implementación en el Código

**Base de Datos:** Tabla `alerts` en Supabase

```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY,
  type VARCHAR NOT NULL,  -- 'stock', 'system', 'validation', 'business', etc.
  severity VARCHAR NOT NULL,  -- 'critical', 'high', 'medium', 'low', 'info'
  status VARCHAR DEFAULT 'active',  -- 'active', 'acknowledged', 'resolved', 'dismissed'
  context VARCHAR NOT NULL,  -- 'materials', 'sales', 'products', etc.
  
  -- ⭐ Campo clave para el sistema de 3 capas
  intelligence_level VARCHAR DEFAULT 'simple',  -- 'simple', 'smart', 'predictive'
  
  title VARCHAR NOT NULL,
  description TEXT,
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  
  -- Configuración
  persistent BOOLEAN DEFAULT true,
  auto_expire_ms INTEGER,  -- NULL = no expire
  
  -- ML fields (Layer 3 - futuro)
  confidence DECIMAL(3,2),
  predicted_date TIMESTAMPTZ
);
```

**Tipos TypeScript:** `src/shared/alerts/types.ts`

```typescript
// 3-Layer classification
export type IntelligenceLevel = 'simple' | 'smart' | 'predictive';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  context: AlertContext;
  
  // ⭐ Campo clave
  intelligence_level: IntelligenceLevel;
  
  title: string;
  description?: string;
  metadata?: AlertMetadata;
  
  createdAt: Date;
  updatedAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  
  persistent?: boolean;
  autoExpire?: number;
  
  // ML fields (Layer 3)
  confidence?: number;
  predictedDate?: Date;
}
```

### Uso Básico

```typescript
import { useAlerts } from '@/shared/alerts';

function MyComponent() {
  const { actions } = useAlerts();
  
  // Crear alerta simple (Layer 2)
  const createSimpleAlert = async () => {
    await actions.create({
      type: 'operational',
      severity: 'info',
      context: 'materials',
      title: 'Material creado',
      description: 'El material Leche se creó correctamente',
      intelligence_level: 'simple',  // ⭐ Layer 2: Simple
      autoExpire: 300000,  // 5 minutos
      persistent: false
    });
  };
  
  // Crear alerta inteligente (Layer 2)
  const createSmartAlert = async () => {
    await actions.create({
      type: 'stock',
      severity: 'critical',
      context: 'materials',
      title: 'Stock crítico: Leche',
      description: '0 unidades disponibles. Impacto operacional inmediato.',
      intelligence_level: 'smart',  // ⭐ Layer 2: Smart
      persistent: true,  // No expira hasta resolver
      metadata: {
        itemId: 'mat-123',
        itemName: 'Leche',
        currentStock: 0,
        minThreshold: 10,
        unit: 'litros'
      }
    });
  };
}
```

### Layer 2a: Simple Alerts

**Características:**
- 🔹 `intelligence_level: 'simple'`
- 🔹 Triggered por acciones del usuario
- 🔹 Auto-expire típicamente en 5-15 minutos
- 🔹 No requieren análisis complejo

**Ejemplos del código real:**

```typescript
// Archivo: src/modules/sales/hooks/usePOSCart.ts
await actions.create({
  type: 'operational',
  severity: 'info',
  context: 'sales',
  title: 'Producto agregado al carrito',
  intelligence_level: 'simple',  // ⭐ Simple
  autoExpire: 300000  // 5 min
});

// Archivo: src/modules/sales/hooks/useTables.ts
await actions.create({
  type: 'operational',
  severity: 'info',
  context: 'sales',
  title: 'Mesa cerrada',
  description: `Mesa ${tableNumber} cerrada exitosamente`,
  intelligence_level: 'simple',  // ⭐ Simple
  autoExpire: 600000  // 10 min
});
```

### Layer 2b: Smart Alerts

**Características:**
- 🧠 `intelligence_level: 'smart'`
- 🧠 Triggered por reglas de negocio
- 🧠 Persistent (no auto-expire)
- 🧠 Requieren análisis de datos

**Ejemplo conceptual (no hay implementación actual de SmartAlertsEngine):**

```typescript
// Este patrón está documentado pero NO implementado aún
// Los tests usan mocks de SmartAlertsEngine

// Patrón propuesto:
const rules = [
  {
    id: 'stock-critical',
    condition: (item) => item.stock === 0,
    severity: 'critical',
    title: (item) => `${item.name}: Sin stock`,
    intelligence_level: 'smart'
  }
];

// Los tests esperan esta estructura:
const alerts = SmartAlertsEngine.generateSmartAlerts(materials);
await actions.bulkCreate(alerts);
```

**⚠️ NOTA IMPORTANTE:** Aunque la documentación menciona `SmartAlertsEngine`, **no existe implementación real** de esta clase en el código. Los tests usan mocks. La funcionalidad de smart alerts actualmente se implementa manualmente, no con un engine automatizado.

### Patrones Comunes

#### Pattern 1: Detección Manual de Condición

```typescript
// Implementación actual (sin engine)
const checkStockLevels = async (materials: Material[]) => {
  const lowStockItems = materials.filter(m => 
    m.stock > 0 && m.stock <= m.min_stock
  );
  
  for (const item of lowStockItems) {
    await actions.create({
      type: 'stock',
      severity: 'high',
      context: 'materials',
      title: `Stock bajo: ${item.name}`,
      description: `Solo ${item.stock} ${item.unit} disponibles`,
      intelligence_level: 'smart',
      persistent: true,
      metadata: {
        itemId: item.id,
        currentStock: item.stock,
        minThreshold: item.min_stock
      }
    });
  }
};
```

#### Pattern 2: Bulk Create

```typescript
const createMultipleAlerts = async () => {
  const alertsToCreate = [
    {
      type: 'stock',
      severity: 'critical',
      context: 'materials',
      title: 'Material A: Sin stock',
      intelligence_level: 'smart',
      persistent: true
    },
    {
      type: 'stock',
      severity: 'high',
      context: 'materials',
      title: 'Material B: Stock bajo',
      intelligence_level: 'smart',
      persistent: true
    }
  ];
  
  await actions.bulkCreate(alertsToCreate);
};
```

### API Completa del Hook `useAlerts()`

```typescript
const {
  // Estado
  alerts,          // Alert[] - Todas las alertas
  stats,           // AlertStats - Estadísticas
  config,          // AlertsConfiguration
  
  // Acciones
  actions: {
    create,        // (input: CreateAlertInput) => Promise<string>
    bulkCreate,    // (inputs: CreateAlertInput[]) => Promise<void>
    update,        // (id: string, updates: Partial<Alert>) => Promise<void>
    remove,        // (id: string) => Promise<void>
    acknowledge,   // (id: string) => Promise<void>
    resolve,       // (id: string, notes?: string) => Promise<void>
    dismiss,       // (id: string) => Promise<void>
    bulkAcknowledge,  // (ids: string[]) => Promise<void>
    bulkResolve,      // (ids: string[]) => Promise<void>
    bulkDismiss,      // (ids: string[]) => Promise<void>
    clearAll,         // () => Promise<void>
    clearByContext,   // (context: AlertContext) => Promise<void>
  },
  
  // Filters
  filters: {
    byContext,     // (context: AlertContext) => Alert[]
    bySeverity,    // (severity: AlertSeverity) => Alert[]
    byStatus,      // (status: AlertStatus) => Alert[]
    byType,        // (type: AlertType) => Alert[]
  }
} = useAlerts();
```

---

## 🔮 Layer 3: Predictive - Machine Learning (Futuro)

### Estado: 🚧 En Roadmap Q1 2026

**Layer 3** es la capa de **predicción inteligente** basada en Machine Learning que está planificada pero **NO implementada aún**.

### Características Planificadas

- 🔮 `intelligence_level: 'predictive'`
- 🔮 Predicciones basadas en modelos ML
- 🔮 Forecasting de eventos futuros
- 🔮 Detección de anomalías
- 🔮 Confidence score (0.0 - 1.0)

### Campos de Base de Datos (Ya Preparados)

```sql
-- Campos ya en la tabla alerts
confidence DECIMAL(3,2),      -- Confianza del modelo ML (0.85 = 85%)
predicted_date TIMESTAMPTZ,   -- Fecha predicha del evento
model_version VARCHAR         -- Versión del modelo usado
```

### Ejemplo Conceptual (Futuro)

```typescript
// Esto NO funciona ahora, es solo diseño futuro
const predictiveAlert = {
  type: 'stock',
  severity: 'high',
  context: 'materials',
  title: 'Predicción: Leche se acabará en 3 días',
  description: 'Basado en consumo de últimos 90 días',
  intelligence_level: 'predictive',  // ⭐ Layer 3
  confidence: 0.87,  // 87% de confianza
  predictedDate: new Date('2026-01-30'),
  metadata: {
    model: 'stock-forecasting-v1',
    basedOnData: 'Last 90 days consumption',
    recommendedOrder: 50
  }
};
```

### Use Cases Planificados

- 🔮 "Leche se acabará en 3 días (85% confianza)"
- 🔮 "Spike de ventas predicho para el viernes"
- 🔮 "Gasto inusual detectado: 300% sobre promedio"
- 🔮 "Cliente ABC Corp en riesgo de churn (engagement -60%)"
- 🔮 "Falla de equipo predicha en 7 días"

---

## 🏗️ Arquitectura Técnica

### Componentes del Sistema

```
┌─────────────────────────────────────────────────────┐
│                    APP.TSX                          │
├─────────────────────────────────────────────────────┤
│  <Provider>  ← ChakraProvider                       │
│    <AlertsProvider>  ← Sistema de alertas Layer 2  │
│      <Router>                                       │
│        {/* App content */}                          │
│      </Router>                                      │
│    </AlertsProvider>                                │
│    <Toaster />  ← Sistema de toasts Layer 1        │
│  </Provider>                                        │
└─────────────────────────────────────────────────────┘
```

### Flujo de Datos

#### Layer 1: Toasts
```
Usuario hace click
    ↓
toaster.create({ ... })
    ↓
Chakra UI renderiza toast en Portal
    ↓
Auto-dismiss después de duration
    ↓
(NO se guarda en DB)
```

#### Layer 2: Alerts
```
Evento del sistema detectado
    ↓
actions.create({ intelligence_level: 'smart', ... })
    ↓
AlertsProvider procesa
    ↓
Guarda en Supabase → tabla alerts
    ↓
State actualizado (alertas en memoria)
    ↓
UI actualiza (NotificationCenter + badges)
    ↓
Persiste hasta resolve/dismiss
```

### Archivos Clave

| Componente | Archivo | Propósito |
|------------|---------|-----------|
| **Layer 1** | | |
| Toaster | `src/shared/ui/toaster.tsx` | Configuración del toaster |
| Componente | `src/shared/ui/Toaster` (Chakra) | UI del toast |
| **Layer 2** | | |
| Provider | `src/shared/alerts/AlertsProvider.tsx` | Context provider |
| Types | `src/shared/alerts/types.ts` | Interfaces TypeScript |
| Hook | `src/shared/alerts/hooks/useAlerts.ts` | Hook principal |
| UI | `src/shared/alerts/components/` | Componentes UI |
| **Database** | | |
| Schema | `database/migrations/` | Migraciones SQL |
| Types | `src/lib/supabase/database.types.ts` | Tipos generados |

---

## 💡 Ejemplos Prácticos Completos

### Ejemplo 1: Módulo de Materials - CRUD

```typescript
// Page: MaterialsPage.tsx
import { toaster } from '@/shared/ui';
import { useAlerts } from '@/shared/alerts';

function MaterialsPage() {
  const { actions } = useAlerts();
  
  // CREATE: Toast para confirmación inmediata
  const handleCreate = async (material: MaterialForm) => {
    try {
      const newMaterial = await createMaterial(material);
      
      // ✅ Layer 1: Confirmación inmediata
      toaster.create({
        title: "Material creado",
        description: `${material.name} guardado correctamente`,
        type: "success",
        duration: 3000
      });
      
      // Verificar si está bajo stock
      if (newMaterial.stock <= newMaterial.min_stock) {
        // ⚠️ Layer 2: Alerta de negocio
        await actions.create({
          type: 'stock',
          severity: newMaterial.stock === 0 ? 'critical' : 'high',
          context: 'materials',
          title: `${newMaterial.name}: Stock ${newMaterial.stock === 0 ? 'crítico' : 'bajo'}`,
          description: `${newMaterial.stock} ${newMaterial.unit} disponibles`,
          intelligence_level: 'smart',
          persistent: true,
          metadata: {
            itemId: newMaterial.id,
            currentStock: newMaterial.stock,
            minThreshold: newMaterial.min_stock
          }
        });
      }
    } catch (error) {
      // ❌ Layer 1: Error feedback
      toaster.create({
        title: "Error",
        description: "No se pudo crear el material",
        type: "error",
        duration: 5000
      });
    }
  };
  
  // UPDATE: Similar pattern
  const handleUpdate = async (id: string, updates: Partial<Material>) => {
    try {
      await updateMaterial(id, updates);
      
      // ✅ Layer 1
      toaster.create({
        title: "Material actualizado",
        type: "success",
        duration: 3000
      });
    } catch (error) {
      // ❌ Layer 1
      toaster.create({
        title: "Error al actualizar",
        type: "error",
        duration: 5000
      });
    }
  };
  
  // DELETE: Toast + opcional resolver alerta relacionada
  const handleDelete = async (materialId: string) => {
    try {
      await deleteMaterial(materialId);
      
      // ✅ Layer 1
      toaster.create({
        title: "Material eliminado",
        type: "success",
        duration: 3000
      });
      
      // Buscar y resolver alertas relacionadas
      const relatedAlerts = alerts.filter(a => 
        a.metadata?.itemId === materialId &&
        a.status === 'active'
      );
      
      if (relatedAlerts.length > 0) {
        await actions.bulkResolve(
          relatedAlerts.map(a => a.id),
          'Item eliminado'
        );
      }
    } catch (error) {
      // ❌ Layer 1
      toaster.create({
        title: "Error al eliminar",
        type: "error",
        duration: 5000
      });
    }
  };
}
```

### Ejemplo 2: Sales - Checkout Flow

```typescript
// Module: Sales
import { toaster } from '@/shared/ui';
import { useAlerts } from '@/shared/alerts';

function CheckoutProcess() {
  const { actions } = useAlerts();
  
  const handleCheckout = async (cart: CartItem[]) => {
    // Loading toast
    const toastId = toaster.create({
      title: "Procesando venta...",
      type: "loading",
      duration: null
    });
    
    try {
      // Validar stock antes de procesar
      const outOfStockItems = await validateStock(cart);
      
      if (outOfStockItems.length > 0) {
        // ❌ Layer 1: Error inmediato
        toaster.update(toastId, {
          title: "Stock insuficiente",
          description: `${outOfStockItems.length} productos sin stock`,
          type: "error",
          duration: 5000
        });
        
        // ⚠️ Layer 2: Alerta de negocio
        await actions.create({
          type: 'validation',
          severity: 'high',
          context: 'sales',
          title: 'Venta bloqueada: Stock insuficiente',
          description: `${outOfStockItems.map(i => i.name).join(', ')}`,
          intelligence_level: 'smart',
          persistent: true,
          metadata: {
            outOfStockItems: outOfStockItems.map(i => i.id)
          }
        });
        
        return;
      }
      
      // Procesar venta
      const sale = await processSale(cart);
      
      // ✅ Layer 1: Success
      toaster.update(toastId, {
        title: "Venta completada!",
        description: `Total: $${sale.total}`,
        type: "success",
        duration: 3000
      });
      
      // Si algún producto quedó en stock crítico
      const criticalItems = await checkCriticalStock(cart);
      
      if (criticalItems.length > 0) {
        // ⚠️ Layer 2: Alerta automática
        await actions.bulkCreate(
          criticalItems.map(item => ({
            type: 'stock',
            severity: 'critical',
            context: 'sales',
            title: `Stock crítico tras venta: ${item.name}`,
            description: `Quedan ${item.stock} ${item.unit}`,
            intelligence_level: 'smart',
            persistent: true,
            metadata: {
              itemId: item.id,
              saleId: sale.id,
              currentStock: item.stock
            }
          }))
        );
      }
    } catch (error) {
      // ❌ Layer 1: Error
      toaster.update(toastId, {
        title: "Error en venta",
        description: error.message,
        type: "error",
        duration: 8000
      });
    }
  };
}
```

### Ejemplo 3: Background Job - Stock Monitoring

```typescript
// Hook: useStockMonitoring.ts
import { useAlerts } from '@/shared/alerts';
import { useEffect } from 'react';

export function useStockMonitoring(materials: Material[]) {
  const { actions, filters } = useAlerts();
  
  useEffect(() => {
    // Ejecutar cada minuto
    const interval = setInterval(async () => {
      // Filtrar items con problemas
      const criticalItems = materials.filter(m => m.stock === 0);
      const lowStockItems = materials.filter(m => 
        m.stock > 0 && m.stock <= m.min_stock
      );
      
      // Obtener alertas existentes
      const existingAlerts = filters.byContext('materials');
      
      // Crear alertas para items críticos sin alerta
      for (const item of criticalItems) {
        const hasAlert = existingAlerts.some(a => 
          a.metadata?.itemId === item.id &&
          a.status === 'active'
        );
        
        if (!hasAlert) {
          await actions.create({
            type: 'stock',
            severity: 'critical',
            context: 'materials',
            title: `${item.name}: Sin stock`,
            intelligence_level: 'smart',
            persistent: true,
            metadata: {
              itemId: item.id,
              currentStock: 0,
              minThreshold: item.min_stock
            }
          });
        }
      }
      
      // Similar para low stock...
      
      // Resolver alertas si el problema se solucionó
      for (const alert of existingAlerts) {
        const material = materials.find(m => m.id === alert.metadata?.itemId);
        
        if (material && material.stock > material.min_stock) {
          await actions.resolve(alert.id, 'Stock repuesto');
        }
      }
    }, 60000); // Cada 60 segundos
    
    return () => clearInterval(interval);
  }, [materials, actions, filters]);
}
```

---

## 🧪 Testing y Debugging

### Testing Toasts (Layer 1)

```typescript
// Manual test en cualquier componente
import { Button } from '@/shared/ui';
import { toaster } from '@/shared/ui';

function TestToasts() {
  return (
    <>
      <Button onClick={() => toaster.create({
        title: "Test Success",
        type: "success"
      })}>
        Test Success
      </Button>
      
      <Button onClick={() => toaster.create({
        title: "Test Error",
        type: "error"
      })}>
        Test Error
      </Button>
    </>
  );
}
```

### Testing Alerts (Layer 2)

```typescript
// Test unitario
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAlerts } from '@/shared/alerts';

describe('Alerts Layer 2', () => {
  it('should create smart alert', async () => {
    const { result } = renderHook(() => useAlerts());
    
    await act(async () => {
      const id = await result.current.actions.create({
        type: 'stock',
        severity: 'critical',
        context: 'materials',
        title: 'Test Alert',
        intelligence_level: 'smart',
        persistent: true
      });
      
      expect(id).toBeDefined();
    });
    
    expect(result.current.alerts).toHaveLength(1);
    expect(result.current.alerts[0].intelligence_level).toBe('smart');
  });
});
```

### Debugging

#### Check Toaster Context
```typescript
// En browser console
// Verificar que Toaster está dentro de Provider
document.querySelector('[data-scope="toast"]')
```

#### Check Alerts en DB
```sql
-- En Supabase SQL Editor
SELECT 
  id,
  intelligence_level,
  context,
  title,
  status,
  created_at
FROM alerts
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 10;
```

#### Check Alerts en UI
```typescript
// En componente
const { alerts, stats } = useAlerts();

useEffect(() => {
  console.log('📊 Alert Stats:', stats);
  console.log('📋 All Alerts:', alerts);
}, [alerts, stats]);
```

---

## ✅ Best Practices

### General

1. **✅ Sigue el principio de capa apropiada**
   - User feedback → Layer 1 (Toast)
   - Business problem → Layer 2 (Alert)
   - ML prediction → Layer 3 (Predictive - futuro)

2. **✅ Usa duraciones apropiadas**
   - Success toast: 3 segundos
   - Error toast: 5-8 segundos
   - Critical alert: Persistente

3. **✅ Provee contexto útil**
   - Metadata con IDs relevantes
   - Descripciones claras
   - Acciones posibles

4. **✅ Limpia alertas resueltas**
   - Resolve cuando el problema se soluciona
   - Dismiss si ya no es relevante
   - Auto-expire para info simple

### Layer 1: Toasts

```typescript
// ✅ DO
toaster.create({
  title: "Material guardado",
  description: "Leche guardada correctamente",
  type: "success",
  duration: 3000
});

// ❌ DON'T
toaster.create({
  title: "Success",  // Muy genérico
  type: "success",
  duration: 30000  // Muy largo
});
```

### Layer 2: Alerts

```typescript
// ✅ DO - Smart alert con metadata completa
await actions.create({
  type: 'stock',
  severity: 'critical',
  context: 'materials',
  title: 'Leche: Sin stock',
  description: 'Material sin existencias. Impacto operacional inmediato.',
  intelligence_level: 'smart',
  persistent: true,
  metadata: {
    itemId: 'mat-123',
    itemName: 'Leche',
    currentStock: 0,
    minThreshold: 10,
    unit: 'litros'
  }
});

// ❌ DON'T - Falta metadata, tipo incorrecto
await actions.create({
  type: 'operational',  // Debería ser 'stock'
  severity: 'info',     // Debería ser 'critical'
  context: 'materials',
  title: 'Problem',     // Título vago
  intelligence_level: 'simple',  // Debería ser 'smart'
});
```

---

## 🔧 Troubleshooting

### Problema: "useContext returned undefined" con Toaster

**Error:**
```
ContextError: useContext returned `undefined`.
Seems you forgot to wrap component within <ChakraProvider />
```

**Causa:** `<Toaster />` está fuera de `<Provider>`

**Solución:**
```tsx
// ❌ WRONG
<Provider>
  {/* app */}
</Provider>
<Toaster />  {/* Fuera del Provider */}

// ✅ CORRECT
<Provider>
  {/* app */}
  <Toaster />  {/* Dentro del Provider */}
</Provider>
```

### Problema: Toasts no aparecen

**Checklist:**
1. ✅ `<Toaster />` está en App.tsx dentro de `<Provider>`
2. ✅ Import es de `@/shared/ui` no de `@chakra-ui/react`
3. ✅ No hay errores en la consola
4. ✅ El theme system está cargado

### Problema: Alerts no persisten

**Checklist:**
1. ✅ `intelligence_level` es `'smart'` no `'simple'`
2. ✅ `persistent: true` está configurado
3. ✅ `autoExpire` es `null` o no está definido
4. ✅ Supabase está conectado correctamente

### Problema: Alertas duplicadas

**Causa:** Múltiples llamadas a `actions.create` con misma condición

**Solución:** Verificar si ya existe antes de crear
```typescript
const existingAlert = alerts.find(a => 
  a.metadata?.itemId === itemId &&
  a.status === 'active'
);

if (!existingAlert) {
  await actions.create({ ... });
}
```

---

## 📚 Referencias Adicionales

### Documentación Técnica
- **Toasts:** [TOAST_QUICK_REFERENCE.md](./TOAST_QUICK_REFERENCE.md)
- **Arquitectura Toaster:** [TOASTER_ARCHITECTURE_AUDIT.md](./TOASTER_ARCHITECTURE_AUDIT.md)
- **Alerts API:** [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
- **Smart Alerts (avanzado):** [SMART_ALERTS_GUIDE.md](./SMART_ALERTS_GUIDE.md)

### Archivos del Código
- Toaster: `src/shared/ui/toaster.tsx`
- Alerts Provider: `src/shared/alerts/AlertsProvider.tsx`
- Types: `src/shared/alerts/types.ts`
- Database: `database/migrations/[timestamp]_create_alerts_table.sql`

### Standards del Proyecto
- **AGENTS.md** - Guías generales de desarrollo
- **.github/copilot-instructions.md** - Instrucciones para AI

---

## 🎓 Resumen Final

### 3 Preguntas Clave

**1. ¿Qué capa debo usar?**
- ✅ Usuario hizo algo → Layer 1 (Toast)
- ⚠️ Sistema detectó problema → Layer 2 (Alert)
- 🔮 Predicción ML → Layer 3 (Futuro)

**2. ¿Cómo lo implemento?**
- Layer 1: `toaster.create({ type, title, duration })`
- Layer 2: `actions.create({ intelligence_level: 'smart', ... })`

**3. ¿Dónde aparece?**
- Layer 1: Bottom-right corner (auto-dismiss)
- Layer 2: Notification Center + badges (persistente)

---

**Versión:** 4.0.0  
**Última Actualización:** Enero 27, 2026  
**Mantenido por:** Equipo de Desarrollo  
**Estado:** ✅ Validado con código real

**¿Preguntas?** Consulta los archivos de referencia o revisa los ejemplos en el código.
