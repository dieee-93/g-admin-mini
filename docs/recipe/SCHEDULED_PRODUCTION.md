# PRODUCCIÓN PROGRAMADA - DISEÑO COMPLETO

> **Feature**: Programación de producción de materiales elaborados con alertas inteligentes
> **Integración**: Reutiliza sistemas de Alertas, Notificaciones y Scheduling existentes

---

## 🎯 VISIÓN GENERAL

Permite programar la producción de materiales elaborados para fechas/horas futuras, con:
- ✅ **Validación de stock** al programar y al ejecutar
- ✅ **Alertas inteligentes** antes de la producción
- ✅ **Producción recurrente** (ej: "todos los días a las 6am")
- ✅ **Integración con Scheduling** (visualización en calendario)
- ✅ **Notificaciones configurables** según reglas
- ✅ **Gestión completa** (crear, editar, cancelar, reprogramar)

---

## 📋 FLUJO DE NEGOCIO (Caso del Usuario)

```
1. Usuario detecta: "Falta stock de Relleno de Carne"
   ↓
2. Abre MaterialFormModal → Tipo: ELABORATED
   ↓
3. Define receta (harina, carne, especias)
   ↓
4. Opciones de producción:
   ○ Solo definir receta
   ○ Producir ahora (10 batches)
   ● Programar producción
     - Fecha: 2025-12-25
     - Hora: 06:00
     - Batches: 50
     - Recurrente: Todos los días
   ↓
5. Sistema valida:
   ✓ Hay stock suficiente para 50 batches (warning si no)
   ✓ No hay conflictos de recursos
   ✓ Personal disponible (opcional)
   ↓
6. Se crea tarea programada en Scheduling
   ↓
7. Sistema recuerda y alerta:
   - 1 hora antes: "Producción en 1 hora"
   - 30 min antes: "Verificar materiales disponibles"
   - Al momento: "Iniciar producción programada"
   ↓
8. Usuario ejecuta o reprograma:
   - [Ejecutar ahora] → Consume stock, genera material
   - [Reprogramar] → Cambia fecha/hora
   - [Cancelar] → Elimina tarea
   ↓
9. Si se ejecuta:
   - ✓ Valida stock nuevamente (crítico)
   - ✓ Consume materiales
   - ✓ Genera material elaborado
   - ✓ Registra ejecución
   - ✓ Si es recurrente → programa siguiente
```

---

## 🏗️ ARQUITECTURA

### Estructura de Módulos

```
src/modules/recipe/
├── types/
│   ├── production.ts              # 🆕 ProductionSchedule types
│   └── recurrence.ts              # 🆕 Recurrence pattern types
│
├── services/
│   ├── productionScheduleApi.ts   # 🆕 API de producción programada
│   └── recurrenceEngine.ts        # 🆕 Cálculo de recurrencias
│
├── alerts/                         # 🆕 Sistema de alertas
│   ├── rules.ts                   # Reglas de alertas
│   ├── engine.ts                  # SmartAlertsEngine instance
│   └── adapter.ts                 # Adapter para producción
│
├── hooks/
│   ├── useProductionSchedules.ts  # 🆕 CRUD de schedules
│   ├── useProductionAlerts.ts     # 🆕 Alertas de producción
│   └── useRecurrencePreview.ts    # 🆕 Preview de recurrencia
│
└── components/
    └── ProductionScheduling/       # 🆕 UI de programación
        ├── ProductionOptionsSection.tsx
        ├── RecurrenceConfigModal.tsx
        ├── ProductionScheduleCalendar.tsx
        └── ProductionTaskCard.tsx
```

---

## 📐 TIPOS Y SCHEMAS

### ProductionSchedule

```typescript
// src/modules/recipe/types/production.ts

export interface ProductionSchedule {
  id: string
  recipeId: string
  recipeName: string

  // 🗓️ Timing
  scheduledFor: Date
  estimatedDuration: number  // minutos
  timezone: string

  // 📦 Cantidades
  batches: number
  outputQuantity: number
  outputUnit: string

  // 📋 Inputs (snapshot al momento de programar)
  expectedInputs: {
    itemId: string
    itemName: string
    quantity: number
    unit: string
    availableStock: number  // Stock al momento de programar
    unitCost: number
  }[]
  expectedCost: number

  // 🔄 Recurrencia
  isRecurring: boolean
  recurrencePattern?: RecurrencePattern
  recurrenceEndDate?: Date
  parentScheduleId?: string  // Si fue generado por recurrencia

  // 📊 Estado
  status: 'scheduled' | 'pending_approval' | 'in_progress' | 'completed' | 'cancelled' | 'failed'

  // ✅ Validaciones
  validations: {
    hasStock: boolean
    hasCapacity: boolean
    hasStaff: boolean
    hasEquipment: boolean
    lastValidatedAt: Date
  }

  // 🔔 Notificaciones
  notificationConfig: {
    notifyBefore: number[]      // [60, 30, 15] minutos antes
    notifyOnCompletion: boolean
    notifyOnFailure: boolean
    recipients: string[]        // User IDs
  }

  // 👤 Asignación
  assignedTo?: string           // User ID (opcional)
  assignedTeam?: string         // Team ID (opcional)

  // 📝 Notas
  notes?: string
  tags?: string[]

  // 🎯 Ejecución
  executionId?: string          // Recipe execution ID
  actualStartTime?: Date
  actualEndTime?: Date
  actualCost?: number
  actualYield?: number
  actualDuration?: number

  // 🔁 Reprogramación
  rescheduledFrom?: string      // Si fue reprogramado
  rescheduledTo?: string        // Si se reprogramó a otro
  rescheduledReason?: string

  // 📅 Audit
  createdAt: Date
  createdBy: string
  updatedAt: Date
  cancelledAt?: Date
  cancelledBy?: string
  cancelledReason?: string
}

export type CreateProductionScheduleInput = Pick<
  ProductionSchedule,
  'recipeId' | 'scheduledFor' | 'batches' | 'isRecurring' | 'recurrencePattern' | 'notificationConfig' | 'assignedTo' | 'notes'
>
```

### RecurrencePattern

```typescript
// src/modules/recipe/types/recurrence.ts

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  interval: number  // Cada X días/semanas/meses

  // Para 'weekly'
  daysOfWeek?: DayOfWeek[]  // [1, 2, 3] = Lun, Mar, Mie

  // Para 'monthly'
  dayOfMonth?: number  // 1-31
  weekOfMonth?: number  // 1-4 (primera semana, segunda, etc.)
  dayOfWeekInMonth?: DayOfWeek  // "segundo martes del mes"

  // Límites
  endDate?: Date
  occurrences?: number  // Máximo de ocurrencias

  // Exclusiones
  excludeDates?: Date[]  // Fechas a saltar
  excludeHolidays?: boolean

  // Time
  time: string  // "06:00" (HH:mm)
}

export enum DayOfWeek {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 7
}

export interface RecurrencePreview {
  nextOccurrences: Date[]  // Próximas 10 ocurrencias
  totalOccurrences: number
  endDate: Date
}
```

---

## 🗄️ BASE DE DATOS

### Tabla: production_schedules

```sql
CREATE TABLE production_schedules (
  -- Identity
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE RESTRICT,
  recipe_name VARCHAR(255) NOT NULL,  -- Denormalizado para performance

  -- Timing
  scheduled_for TIMESTAMPTZ NOT NULL,
  estimated_duration INTEGER,  -- minutos
  timezone VARCHAR(50) DEFAULT 'UTC',

  -- Cantidades
  batches INTEGER NOT NULL DEFAULT 1 CHECK (batches > 0),
  output_quantity NUMERIC(10, 4) NOT NULL,
  output_unit VARCHAR(50) NOT NULL,

  -- Inputs snapshot (JSONB)
  expected_inputs JSONB NOT NULL,
  expected_cost NUMERIC(10, 4) NOT NULL,

  -- Recurrencia
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern JSONB,
  recurrence_end_date TIMESTAMPTZ,
  parent_schedule_id UUID REFERENCES production_schedules(id) ON DELETE SET NULL,

  -- Estado
  status VARCHAR(20) DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'pending_approval', 'in_progress', 'completed', 'cancelled', 'failed')),

  -- Validaciones (JSONB)
  validations JSONB DEFAULT '{"hasStock": true, "hasCapacity": true, "hasStaff": true, "hasEquipment": true}'::jsonb,
  last_validated_at TIMESTAMPTZ,

  -- Notificaciones (JSONB)
  notification_config JSONB DEFAULT '{"notifyBefore": [60, 30], "notifyOnCompletion": true, "notifyOnFailure": true}'::jsonb,

  -- Asignación
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_team UUID REFERENCES teams(id) ON DELETE SET NULL,

  -- Notas
  notes TEXT,
  tags TEXT[],

  -- Ejecución
  execution_id UUID REFERENCES recipe_executions(id) ON DELETE SET NULL,
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  actual_cost NUMERIC(10, 4),
  actual_yield NUMERIC(5, 2),
  actual_duration INTEGER,

  -- Reprogramación
  rescheduled_from UUID REFERENCES production_schedules(id) ON DELETE SET NULL,
  rescheduled_to UUID REFERENCES production_schedules(id) ON DELETE SET NULL,
  rescheduled_reason TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES users(id) ON DELETE SET NULL,
  cancelled_reason TEXT
);

-- Indexes
CREATE INDEX idx_production_schedules_recipe
  ON production_schedules(recipe_id);

CREATE INDEX idx_production_schedules_scheduled_for
  ON production_schedules(scheduled_for);

CREATE INDEX idx_production_schedules_status
  ON production_schedules(status);

CREATE INDEX idx_production_schedules_assigned_to
  ON production_schedules(assigned_to);

CREATE INDEX idx_production_schedules_recurring
  ON production_schedules(is_recurring)
  WHERE is_recurring = TRUE;

CREATE INDEX idx_production_schedules_upcoming
  ON production_schedules(scheduled_for, status)
  WHERE status IN ('scheduled', 'pending_approval');

-- Updated timestamp trigger
CREATE TRIGGER set_production_schedules_updated_at
  BEFORE UPDATE ON production_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔔 SISTEMA DE ALERTAS (Integración con SmartAlertsEngine)

### Reglas de Alertas

```typescript
// src/modules/recipe/alerts/rules.ts

import type { SmartAlertRule } from '@/shared/alerts/types'
import type { ProductionSchedule } from '../types/production'

/**
 * REGLAS DE ALERTAS PARA PRODUCCIÓN PROGRAMADA
 * Reutilizan SmartAlertsEngine existente
 */

// 🔴 CRÍTICAS (Priority 90-100)

export const PRODUCTION_UPCOMING_CRITICAL: SmartAlertRule<ProductionSchedule> = {
  id: 'production-upcoming-critical',
  name: 'Producción Inminente sin Stock',
  description: 'Producción programada en menos de 1 hora sin stock suficiente',
  priority: 100,

  condition: (schedule) => {
    const timeUntil = schedule.scheduledFor.getTime() - Date.now()
    const isUpcoming = timeUntil <= 60 * 60 * 1000 && timeUntil > 0
    const hasNoStock = !schedule.validations.hasStock
    const isActive = schedule.status === 'scheduled'

    return isActive && isUpcoming && hasNoStock
  },

  severity: 'critical',

  title: (schedule) => `⚠️ Producción sin materiales: ${schedule.recipeName}`,

  description: (schedule) => {
    const timeUntil = Math.round((schedule.scheduledFor.getTime() - Date.now()) / 60000)
    return `Producción programada en ${timeUntil} minutos pero faltan materiales. Revisa el stock o cancela la producción.`
  },

  metadata: (schedule) => ({
    scheduleId: schedule.id,
    recipeId: schedule.recipeId,
    scheduledFor: schedule.scheduledFor.toISOString(),
    missingInputs: schedule.expectedInputs.filter(input => input.availableStock < input.quantity * schedule.batches),
    relatedUrl: `/admin/operations/production/schedules/${schedule.id}`
  }),

  actions: (schedule) => [
    {
      label: 'Ver Detalles',
      variant: 'primary',
      action: () => navigateTo(`/admin/operations/production/schedules/${schedule.id}`)
    },
    {
      label: 'Cancelar Producción',
      variant: 'destructive',
      action: async () => {
        await cancelProductionSchedule(schedule.id, 'Sin materiales disponibles')
      },
      autoResolve: true
    }
  ],

  persistent: true
}

export const PRODUCTION_EQUIPMENT_CONFLICT: SmartAlertRule<ProductionSchedule> = {
  id: 'production-equipment-conflict',
  name: 'Conflicto de Equipamiento',
  description: 'Equipamiento necesario no disponible',
  priority: 95,

  condition: (schedule) => {
    return schedule.status === 'scheduled' && !schedule.validations.hasEquipment
  },

  severity: 'critical',

  title: (schedule) => `🔧 Conflicto de equipamiento: ${schedule.recipeName}`,

  description: (schedule) =>
    `El equipamiento necesario para la producción de ${schedule.recipeName} no está disponible el ${formatDate(schedule.scheduledFor)}.`,

  persistent: true
}

// 🟠 ALTAS (Priority 70-89)

export const PRODUCTION_UPCOMING_WARNING: SmartAlertRule<ProductionSchedule> = {
  id: 'production-upcoming-warning',
  name: 'Producción Próxima',
  description: 'Recordatorio de producción programada',
  priority: 80,

  condition: (schedule) => {
    const timeUntil = schedule.scheduledFor.getTime() - Date.now()
    const notifyTimes = schedule.notificationConfig.notifyBefore || [60, 30]

    // Check if we're within any notification window
    const isInNotificationWindow = notifyTimes.some(minutes => {
      const windowStart = minutes * 60 * 1000
      const windowEnd = (minutes - 5) * 60 * 1000  // 5 min window
      return timeUntil <= windowStart && timeUntil > windowEnd
    })

    return schedule.status === 'scheduled' && isInNotificationWindow
  },

  severity: 'high',

  title: (schedule) => {
    const timeUntil = Math.round((schedule.scheduledFor.getTime() - Date.now()) / 60000)
    return `⏰ Producción en ${timeUntil} minutos: ${schedule.recipeName}`
  },

  description: (schedule) =>
    `Producción de ${schedule.batches} batches programada para ${formatTime(schedule.scheduledFor)}. Verifica materiales y equipo.`,

  metadata: (schedule) => ({
    scheduleId: schedule.id,
    recipeId: schedule.recipeId,
    batches: schedule.batches,
    estimatedCost: schedule.expectedCost
  }),

  actions: (schedule) => [
    {
      label: 'Verificar Stock',
      variant: 'primary',
      action: async () => {
        await validateProductionStock(schedule.id)
      }
    },
    {
      label: 'Iniciar Ahora',
      variant: 'secondary',
      action: async () => {
        await executeProductionSchedule(schedule.id)
      },
      autoResolve: true
    }
  ],

  persistent: false,
  autoExpire: 15  // Auto-expire en 15 minutos
}

export const PRODUCTION_STAFF_UNAVAILABLE: SmartAlertRule<ProductionSchedule> = {
  id: 'production-staff-unavailable',
  name: 'Personal No Disponible',
  description: 'Personal asignado no disponible para producción',
  priority: 75,

  condition: (schedule) => {
    return schedule.status === 'scheduled' &&
           schedule.assignedTo &&
           !schedule.validations.hasStaff
  },

  severity: 'high',

  title: (schedule) => `👤 Personal no disponible: ${schedule.recipeName}`,

  description: (schedule) =>
    `El personal asignado no está disponible para la producción del ${formatDate(schedule.scheduledFor)}.`,

  persistent: true
}

// 🟡 MEDIAS (Priority 50-69)

export const PRODUCTION_LOW_STOCK_WARNING: SmartAlertRule<ProductionSchedule> = {
  id: 'production-low-stock-warning',
  name: 'Stock Bajo para Producción',
  description: 'Stock justo para la producción programada',
  priority: 60,

  condition: (schedule) => {
    if (schedule.status !== 'scheduled') return false

    // Check if any input has stock < required + 20% buffer
    return schedule.expectedInputs.some(input => {
      const required = input.quantity * schedule.batches
      const withBuffer = required * 1.2
      return input.availableStock >= required && input.availableStock < withBuffer
    })
  },

  severity: 'medium',

  title: (schedule) => `⚠️ Stock ajustado: ${schedule.recipeName}`,

  description: (schedule) => {
    const tightInputs = schedule.expectedInputs.filter(input => {
      const required = input.quantity * schedule.batches
      const withBuffer = required * 1.2
      return input.availableStock >= required && input.availableStock < withBuffer
    })

    return `Stock suficiente pero ajustado para: ${tightInputs.map(i => i.itemName).join(', ')}. Considera reabastecer.`
  },

  persistent: true
}

export const PRODUCTION_COST_VARIANCE: SmartAlertRule<ProductionSchedule> = {
  id: 'production-cost-variance',
  name: 'Variación de Costo',
  description: 'Costo actual difiere significativamente del estimado',
  priority: 55,

  condition: (schedule) => {
    if (!schedule.actualCost || schedule.status !== 'completed') return false

    const variance = Math.abs(schedule.actualCost - schedule.expectedCost) / schedule.expectedCost
    return variance > 0.15  // Más del 15% de variación
  },

  severity: 'medium',

  title: (schedule) => `💰 Variación de costo: ${schedule.recipeName}`,

  description: (schedule) => {
    const variance = ((schedule.actualCost! - schedule.expectedCost) / schedule.expectedCost * 100).toFixed(1)
    return `Costo real ${variance}% ${variance > 0 ? 'mayor' : 'menor'} que el estimado ($${schedule.expectedCost.toFixed(2)} → $${schedule.actualCost!.toFixed(2)})`
  },

  persistent: true
}

// 🔵 BAJAS (Priority 20-49)

export const PRODUCTION_RECURRING_NEXT: SmartAlertRule<ProductionSchedule> = {
  id: 'production-recurring-next',
  name: 'Siguiente Producción Recurrente',
  description: 'Próxima ocurrencia de producción recurrente programada',
  priority: 40,

  condition: (schedule) => {
    if (!schedule.isRecurring || schedule.status !== 'scheduled') return false

    const timeUntil = schedule.scheduledFor.getTime() - Date.now()
    const isIn24Hours = timeUntil <= 24 * 60 * 60 * 1000 && timeUntil > 0

    return isIn24Hours
  },

  severity: 'info',

  title: (schedule) => `🔄 Producción recurrente mañana: ${schedule.recipeName}`,

  description: (schedule) =>
    `Producción recurrente programada para ${formatDateTime(schedule.scheduledFor)}. ${schedule.batches} batches.`,

  persistent: false,
  autoExpire: 60  // 1 hora
}

// Export all rules
export const PRODUCTION_ALERT_RULES: SmartAlertRule<ProductionSchedule>[] = [
  PRODUCTION_UPCOMING_CRITICAL,
  PRODUCTION_EQUIPMENT_CONFLICT,
  PRODUCTION_UPCOMING_WARNING,
  PRODUCTION_STAFF_UNAVAILABLE,
  PRODUCTION_LOW_STOCK_WARNING,
  PRODUCTION_COST_VARIANCE,
  PRODUCTION_RECURRING_NEXT
]
```

### Engine Setup

```typescript
// src/modules/recipe/alerts/engine.ts

import { SmartAlertsEngine } from '@/lib/alerts/SmartAlertsEngine'
import { PRODUCTION_ALERT_RULES } from './rules'
import type { ProductionSchedule } from '../types/production'

/**
 * Motor de alertas inteligentes para producción programada
 * Reutiliza SmartAlertsEngine del sistema
 */
export const productionAlertsEngine = new SmartAlertsEngine<ProductionSchedule>({
  rules: PRODUCTION_ALERT_RULES,
  context: 'production',
  circuitBreakerInterval: 3000,  // 3 segundos entre evaluaciones
  maxAlertsPerEvaluation: 50,
  debug: false
})
```

### Hook de Alertas

```typescript
// src/modules/recipe/hooks/useProductionAlerts.ts

import { useEffect, useCallback } from 'react'
import { useAlertsActions } from '@/shared/alerts/hooks/useAlerts'
import { productionAlertsEngine } from '../alerts/engine'
import { useProductionSchedules } from './useProductionSchedules'

/**
 * Hook para gestionar alertas de producción programada
 * Integra con SmartAlertsEngine existente
 */
export function useProductionAlerts() {
  const { actions } = useAlertsActions()
  const { data: schedules = [], isLoading } = useProductionSchedules({
    status: ['scheduled', 'pending_approval', 'in_progress']
  })

  // Evaluar alertas cuando cambien los schedules
  const evaluateAlerts = useCallback(async () => {
    if (isLoading || schedules.length === 0) return

    try {
      // 1. Clear previous production alerts
      await actions.clearAll({ context: 'production' })

      // 2. Evaluar con engine
      const alerts = productionAlertsEngine.evaluate(schedules)

      // 3. Crear alertas en batch
      if (alerts.length > 0) {
        await actions.bulkCreate(alerts)
      }

      console.log(`[ProductionAlerts] Evaluated ${schedules.length} schedules, generated ${alerts.length} alerts`)
    } catch (error) {
      console.error('[ProductionAlerts] Error evaluating alerts:', error)
    }
  }, [schedules, isLoading, actions])

  // Auto-evaluate on schedules change (throttled by circuit breaker)
  useEffect(() => {
    evaluateAlerts()
  }, [evaluateAlerts])

  // Re-evaluate manually
  const refreshAlerts = useCallback(() => {
    return evaluateAlerts()
  }, [evaluateAlerts])

  return {
    refreshAlerts,
    isEvaluating: isLoading
  }
}
```

---

## 🔔 REGLAS DE NOTIFICACIÓN (notification_rules)

### Configuración en DB

```sql
-- Agregar reglas de notificación para producción programada
INSERT INTO notification_rules (
  rule_key,
  category,
  name,
  description,
  is_enabled,
  severity,
  notify_email,
  notify_push,
  notify_sms,
  notify_in_app,
  conditions,
  recipient_roles
) VALUES
  -- Producción próxima (1 hora antes)
  (
    'production.schedule.upcoming',
    'production',
    'Producción Programada Próxima',
    'Notificar 1 hora antes de la producción programada',
    TRUE,
    'info',
    FALSE,
    TRUE,
    FALSE,
    TRUE,
    '{"minutesBefore": 60}'::jsonb,
    ARRAY['production_manager', 'chef', 'kitchen_staff']
  ),

  -- Falta de stock crítico
  (
    'production.schedule.no_stock',
    'production',
    'Producción sin Materiales',
    'Notificar cuando una producción programada no tiene stock',
    TRUE,
    'critical',
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    '{"checkStockBeforeMinutes": 60}'::jsonb,
    ARRAY['production_manager', 'inventory_manager', 'purchasing']
  ),

  -- Producción completada
  (
    'production.schedule.completed',
    'production',
    'Producción Completada',
    'Notificar cuando se completa una producción programada',
    TRUE,
    'info',
    FALSE,
    TRUE,
    FALSE,
    TRUE,
    '{}'::jsonb,
    ARRAY['production_manager']
  ),

  -- Producción fallida
  (
    'production.schedule.failed',
    'production',
    'Producción Fallida',
    'Notificar cuando falla una producción programada',
    TRUE,
    'error',
    TRUE,
    TRUE,
    FALSE,
    TRUE,
    '{}'::jsonb,
    ARRAY['production_manager', 'operations_manager']
  ),

  -- Producción recurrente creada
  (
    'production.schedule.recurring_created',
    'production',
    'Nueva Producción Recurrente',
    'Notificar cuando se crea una producción recurrente',
    TRUE,
    'info',
    TRUE,
    FALSE,
    FALSE,
    TRUE,
    '{}'::jsonb,
    ARRAY['production_manager']
  );
```

---

## 🔄 MOTOR DE RECURRENCIA

### RecurrenceEngine

```typescript
// src/modules/recipe/services/recurrenceEngine.ts

import type { RecurrencePattern, RecurrencePreview } from '../types/recurrence'

/**
 * Motor para calcular ocurrencias de patrones de recurrencia
 */
export class RecurrenceEngine {
  /**
   * Calcula las próximas N ocurrencias de un patrón
   */
  static calculateNext(
    pattern: RecurrencePattern,
    startDate: Date,
    count: number = 10
  ): Date[] {
    const occurrences: Date[] = []
    let currentDate = new Date(startDate)

    while (occurrences.length < count) {
      const nextDate = this.getNextOccurrence(currentDate, pattern)

      if (!nextDate) break

      // Check end conditions
      if (pattern.endDate && nextDate > pattern.endDate) break
      if (pattern.occurrences && occurrences.length >= pattern.occurrences) break

      // Check exclusions
      if (this.isExcluded(nextDate, pattern)) {
        currentDate = nextDate
        continue
      }

      occurrences.push(nextDate)
      currentDate = nextDate
    }

    return occurrences
  }

  /**
   * Calcula la siguiente ocurrencia desde una fecha
   */
  private static getNextOccurrence(
    from: Date,
    pattern: RecurrencePattern
  ): Date | null {
    const next = new Date(from)
    const [hours, minutes] = pattern.time.split(':').map(Number)

    next.setHours(hours, minutes, 0, 0)

    switch (pattern.frequency) {
      case 'daily':
        next.setDate(next.getDate() + pattern.interval)
        break

      case 'weekly':
        // Find next matching day of week
        const currentDay = next.getDay()
        const targetDays = pattern.daysOfWeek || []

        // Convert Sunday (0) to 7 for easier calculation
        const currentDayAdjusted = currentDay === 0 ? 7 : currentDay

        // Find next day in targetDays
        let daysToAdd = 0
        for (let i = 1; i <= 7; i++) {
          const checkDay = ((currentDayAdjusted + i - 1) % 7) + 1
          if (targetDays.includes(checkDay)) {
            daysToAdd = i
            break
          }
        }

        if (daysToAdd === 0) return null
        next.setDate(next.getDate() + daysToAdd)
        break

      case 'monthly':
        if (pattern.dayOfMonth) {
          // Specific day of month
          next.setMonth(next.getMonth() + pattern.interval)
          next.setDate(pattern.dayOfMonth)
        } else if (pattern.weekOfMonth && pattern.dayOfWeekInMonth) {
          // Nth weekday of month (e.g., "second Tuesday")
          next.setMonth(next.getMonth() + pattern.interval)
          this.setNthWeekday(next, pattern.weekOfMonth, pattern.dayOfWeekInMonth)
        }
        break

      case 'custom':
        // Custom logic (extensible)
        break
    }

    return next
  }

  /**
   * Verifica si una fecha está excluida
   */
  private static isExcluded(date: Date, pattern: RecurrencePattern): boolean {
    // Check explicit exclusions
    if (pattern.excludeDates?.some(excluded =>
      this.isSameDay(date, excluded)
    )) {
      return true
    }

    // Check holidays (si excludeHolidays es true)
    if (pattern.excludeHolidays && this.isHoliday(date)) {
      return true
    }

    return false
  }

  /**
   * Verifica si es día festivo (integrar con sistema de holidays si existe)
   */
  private static isHoliday(date: Date): boolean {
    // TODO: Integrar con sistema de holidays
    // Por ahora, retorna false
    return false
  }

  /**
   * Helper: Set date to Nth weekday of month
   */
  private static setNthWeekday(date: Date, week: number, dayOfWeek: number): void {
    date.setDate(1)  // Start of month

    // Find first occurrence of dayOfWeek
    while (date.getDay() !== (dayOfWeek === 7 ? 0 : dayOfWeek)) {
      date.setDate(date.getDate() + 1)
    }

    // Add weeks
    date.setDate(date.getDate() + (week - 1) * 7)
  }

  /**
   * Helper: Check if two dates are same day
   */
  private static isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate()
  }

  /**
   * Genera preview de recurrencia
   */
  static generatePreview(
    pattern: RecurrencePattern,
    startDate: Date
  ): RecurrencePreview {
    const nextOccurrences = this.calculateNext(pattern, startDate, 10)

    let totalOccurrences = 0
    let endDate = new Date(startDate)

    if (pattern.occurrences) {
      totalOccurrences = pattern.occurrences
      const allOccurrences = this.calculateNext(pattern, startDate, pattern.occurrences)
      endDate = allOccurrences[allOccurrences.length - 1] || endDate
    } else if (pattern.endDate) {
      endDate = pattern.endDate
      // Calculate total by iterating until endDate
      let current = new Date(startDate)
      while (current <= endDate) {
        const next = this.getNextOccurrence(current, pattern)
        if (!next || next > endDate) break
        if (!this.isExcluded(next, pattern)) {
          totalOccurrences++
        }
        current = next
      }
    } else {
      totalOccurrences = Infinity
      endDate = new Date('2099-12-31')  // "Sin fin"
    }

    return {
      nextOccurrences,
      totalOccurrences,
      endDate
    }
  }
}
```

---

## 🎨 COMPONENTES UI

### ProductionOptionsSection

```typescript
// src/modules/recipe/components/ProductionScheduling/ProductionOptionsSection.tsx

import { useState, useCallback } from 'react'
import { Stack, Box, Radio, RadioGroup, Input, Button, Alert, Typography } from '@/shared/ui'
import { SectionCard } from '../RecipeBuilder/components/SectionCard'
import { ValidatedField } from '../RecipeBuilder/components/ValidatedField'
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'
import { RecurrenceConfigModal } from './RecurrenceConfigModal'
import { ProductionValidationPreview } from './ProductionValidationPreview'
import type { RecurrencePattern } from '../../types/recurrence'

interface ProductionOptionsSectionProps {
  recipe: Partial<Recipe>
  onChange: (options: ProductionOptions) => void
}

export function ProductionOptionsSection(props: ProductionOptionsSectionProps) {
  const { recipe, onChange } = props

  const [mode, setMode] = useState<'none' | 'immediate' | 'scheduled'>('none')
  const [batches, setBatches] = useState(1)
  const [scheduledDate, setScheduledDate] = useState<Date>()
  const [scheduledTime, setScheduledTime] = useState('06:00')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>()
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false)

  // Validación de stock
  const { validateStock, validation, isValidating } = useProductionValidation()

  useEffect(() => {
    if (mode === 'scheduled' && scheduledDate && recipe.inputs?.length > 0) {
      validateStock({
        recipeId: recipe.id,
        batches,
        scheduledFor: combineDateAndTime(scheduledDate, scheduledTime)
      })
    }
  }, [mode, scheduledDate, scheduledTime, batches, recipe.inputs])

  const handleModeChange = useCallback((newMode: string) => {
    setMode(newMode as typeof mode)
    onChange({
      mode: newMode,
      batches: mode === 'none' ? undefined : batches,
      scheduledFor: mode === 'scheduled' ? combineDateAndTime(scheduledDate, scheduledTime) : undefined,
      isRecurring,
      recurrencePattern: isRecurring ? recurrencePattern : undefined
    })
  }, [batches, scheduledDate, scheduledTime, isRecurring, recurrencePattern])

  return (
    <>
      <SectionCard title="Opciones de Producción" icon={CalendarIcon}>
        <RadioGroup value={mode} onChange={handleModeChange}>
          <Stack gap="4">
            {/* Opción 1: Solo definir */}
            <Radio value="none">
              <Stack gap="1">
                <Typography variant="body" size="sm" weight="medium">
                  Solo definir receta
                </Typography>
                <Typography variant="body" size="xs" color="text.secondary">
                  Guarda la receta sin producir. No consume stock.
                </Typography>
              </Stack>
            </Radio>

            {/* Opción 2: Producir ahora */}
            <Radio value="immediate">
              <Stack gap="2" w="full">
                <Stack gap="1">
                  <Typography variant="body" size="sm" weight="medium">
                    Producir ahora
                  </Typography>
                  <Typography variant="body" size="xs" color="text.secondary">
                    Ejecuta la producción inmediatamente. Consume stock al guardar.
                  </Typography>
                </Stack>

                {mode === 'immediate' && (
                  <Box ml="6">
                    <ValidatedField label="Batches a producir">
                      <Input
                        type="number"
                        min={1}
                        value={batches}
                        onChange={(e) => setBatches(Number(e.target.value))}
                        w="150px"
                      />
                    </ValidatedField>
                  </Box>
                )}
              </Stack>
            </Radio>

            {/* Opción 3: Programar */}
            <Radio value="scheduled">
              <Stack gap="3" w="full">
                <Stack gap="1">
                  <Typography variant="body" size="sm" weight="medium">
                    Programar producción
                  </Typography>
                  <Typography variant="body" size="xs" color="text.secondary">
                    Crea una tarea programada. Consume stock al ejecutar.
                  </Typography>
                </Stack>

                {mode === 'scheduled' && (
                  <Stack ml="6" gap="3">
                    {/* Fecha y hora */}
                    <SimpleGrid columns={2} gap="3">
                      <ValidatedField label="Fecha">
                        <Input
                          type="date"
                          value={scheduledDate?.toISOString().split('T')[0]}
                          onChange={(e) => setScheduledDate(new Date(e.target.value))}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </ValidatedField>

                      <ValidatedField label="Hora">
                        <Input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                        />
                      </ValidatedField>
                    </SimpleGrid>

                    {/* Batches */}
                    <ValidatedField label="Batches a producir">
                      <Input
                        type="number"
                        min={1}
                        value={batches}
                        onChange={(e) => setBatches(Number(e.target.value))}
                        w="150px"
                      />
                    </ValidatedField>

                    {/* Recurrencia */}
                    <Box>
                      <Flex align="center" gap="2">
                        <Switch
                          checked={isRecurring}
                          onChange={(e) => setIsRecurring(e.target.checked)}
                        />
                        <Typography variant="body" size="sm">
                          Producción recurrente
                        </Typography>
                      </Flex>

                      {isRecurring && (
                        <Button
                          size="sm"
                          variant="outline"
                          mt="2"
                          onClick={() => setShowRecurrenceModal(true)}
                        >
                          <ClockIcon className="w-4 h-4" />
                          {recurrencePattern ? 'Editar recurrencia' : 'Configurar recurrencia'}
                        </Button>
                      )}

                      {recurrencePattern && (
                        <Box mt="2" p="2" bg="blue.50" borderRadius="md">
                          <Typography variant="body" size="xs" color="blue.700">
                            {formatRecurrencePattern(recurrencePattern)}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Validación de stock */}
                    {validation && (
                      <ProductionValidationPreview
                        validation={validation}
                        isLoading={isValidating}
                      />
                    )}
                  </Stack>
                )}
              </Stack>
            </Radio>
          </Stack>
        </RadioGroup>

        {/* Preview de consumo */}
        {mode !== 'none' && recipe.inputs?.length > 0 && (
          <Alert.Root status="info" variant="subtle" mt="4">
            <Alert.Icon />
            <Alert.Content>
              <Alert.Title>
                {mode === 'immediate' ? 'Se consumirá' : 'Se consumirá al ejecutar'}
              </Alert.Title>
              <Alert.Description>
                <Stack gap="1" mt="2">
                  {recipe.inputs.map(input => (
                    <Typography key={input.id} variant="body" size="xs">
                      • {input.item.name}: <strong>{input.quantity * batches} {input.unit}</strong>
                      {validation?.inputs.find(v => v.itemId === input.item.id)?.hasStock === false && (
                        <Typography as="span" color="red.600" ml="2">
                          (⚠️ Stock insuficiente)
                        </Typography>
                      )}
                    </Typography>
                  ))}
                </Stack>
                <Typography variant="body" size="xs" mt="2" weight="medium">
                  Costo estimado: ${(recipe.expectedCost * batches).toFixed(2)}
                </Typography>
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}
      </SectionCard>

      {/* Modal de recurrencia */}
      {showRecurrenceModal && (
        <RecurrenceConfigModal
          isOpen={showRecurrenceModal}
          onClose={() => setShowRecurrenceModal(false)}
          initialPattern={recurrencePattern}
          baseDate={combineDateAndTime(scheduledDate, scheduledTime)}
          onSave={(pattern) => {
            setRecurrencePattern(pattern)
            setShowRecurrenceModal(false)
          }}
        />
      )}
    </>
  )
}
```

---

## 📋 RESUMEN DE INTEGRACIÓN

### Sistemas Reutilizados

1. **✅ SmartAlertsEngine** (`/lib/alerts/SmartAlertsEngine.ts`)
   - 7 reglas de alertas definidas
   - Circuit breaker configurado
   - Auto-evaluación con throttling

2. **✅ Sistema de Notificaciones** (`notification_rules` table)
   - 5 reglas pre-configuradas
   - Canales: email, push, SMS, in-app
   - Roles recipients configurables

3. **✅ Scheduling Module** (integración pendiente)
   - Tareas programadas en calendar
   - ProductionTaskCard component
   - schedulingAlertsAdapter

4. **✅ Hooks de Alertas** (`useAlerts`, `useAlertsActions`)
   - Crear/resolver/dismiss alertas
   - Filtrado por contexto
   - Badges automáticos

---

## 🎯 PRÓXIMOS PASOS

1. **Fase 1**: Implementar tipos y DB schema (production_schedules)
2. **Fase 2**: API y hooks (useProductionSchedules)
3. **Fase 3**: RecurrenceEngine
4. **Fase 4**: Sistema de alertas (rules + engine + hook)
5. **Fase 5**: UI (ProductionOptionsSection)
6. **Fase 6**: Integración con Scheduling
7. **Fase 7**: Testing completo

---

**Estimación**: 1-1.5 semanas de implementación incremental
**Beneficio**: Feature diferenciadora que reutiliza sistemas existentes correctamente
