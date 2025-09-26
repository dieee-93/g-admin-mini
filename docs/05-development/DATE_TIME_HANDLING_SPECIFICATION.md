# 🕒 DATE & TIME HANDLING SPECIFICATION - G-ADMIN MINI

**Versión**: 1.0
**Fecha**: 2025-09-22
**Aplicable a**: Unified Calendar System + Todos los módulos

---

## 🎯 **OBJETIVOS**

Establecer estándares consistentes para el manejo de fechas y horas en G-Admin Mini, especialmente para el nuevo Unified Calendar System, garantizando:

- **Consistencia** en almacenamiento de datos
- **Precisión** en cálculos temporales
- **Compatibilidad** con Supabase/PostgreSQL
- **Experiencia de usuario** óptima
- **Soporte multi-timezone** futuro

---

## 📊 **ANÁLISIS DEL ESTADO ACTUAL**

### **✅ PATTERNS EXISTENTES IDENTIFICADOS**
```typescript
// Formato actual en scheduling module
interface Shift {
  date: string;        // "2025-09-22" (YYYY-MM-DD)
  start_time: string;  // "14:30" (HH:MM)
  end_time: string;    // "18:00" (HH:MM)
  created_at: string;  // ISO string from Supabase
}
```

### **📈 VENTAJAS DEL ENFOQUE ACTUAL**
- ✅ Simplicidad en tipos de datos
- ✅ Compatibilidad con inputs HTML5
- ✅ Separación clara fecha vs hora
- ✅ Lectura humana fácil

### **⚠️ LIMITACIONES DETECTADAS**
- ❌ No maneja timezones explícitamente
- ❌ Cálculos complejos requieren conversiones
- ❌ Riesgo de inconsistencias en multi-ubicación
- ❌ No aprovecha capacidades de PostgreSQL timestamptz

---

## 🏗️ **ESPECIFICACIÓN TÉCNICA UNIFICADA**

### **1. PRINCIPIOS FUNDAMENTALES**

#### **🌍 UTC-First Strategy**
- **Storage**: Todo en UTC en la base de datos
- **Processing**: Cálculos en UTC
- **Display**: Conversión a timezone local solo para UI

#### **📦 Type Safety**
- **TypeScript types** específicos para cada contexto
- **Validation** en runtime para dates críticas
- **Null safety** para campos opcionales

#### **🔄 Backward Compatibility**
- **Mantener** formatos existentes donde sea posible
- **Migración gradual** a nuevos tipos
- **Adapters** para conectar old/new systems

### **2. TIPOS DE DATOS ESTÁNDAR**

```typescript
// src/shared/calendar/types/DateTimeTypes.ts

// ===============================
// CORE DATE/TIME TYPES
// ===============================

/**
 * ISO Date string in YYYY-MM-DD format
 * Used for date-only contexts (scheduling, availability)
 */
export type ISODateString = string & { __brand: 'ISODate' };

/**
 * ISO Time string in HH:MM format (24-hour)
 * Used for time-only contexts
 */
export type ISOTimeString = string & { __brand: 'ISOTime' };

/**
 * Full ISO DateTime string with timezone
 * Used for precise timestamps
 */
export type ISODateTimeString = string & { __brand: 'ISODateTime' };

/**
 * Duration in minutes
 * Used for time calculations and intervals
 */
export type DurationMinutes = number & { __brand: 'DurationMinutes' };

// ===============================
// BUSINESS CONTEXT TYPES
// ===============================

/**
 * Time slot for scheduling contexts
 * Balances simplicity with precision
 */
export interface TimeSlot {
  date: ISODateString;
  startTime: ISOTimeString;
  endTime: ISOTimeString;
  duration: DurationMinutes;
  timezone?: string; // IANA timezone (optional for now)
}

/**
 * Precise timestamp for audit/logging
 * Full precision with timezone
 */
export interface PreciseTimestamp {
  timestamp: ISODateTimeString;
  timezone: string; // IANA timezone
  utcOffset: number; // Offset in minutes
}

/**
 * Availability window (recurring)
 * Used for staff availability, business hours
 */
export interface AvailabilityWindow {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  startTime: ISOTimeString;
  endTime: ISOTimeString;
  timezone?: string;
}

/**
 * Date range for filtering/reporting
 */
export interface DateRange {
  startDate: ISODateString;
  endDate: ISODateString;
  includeTime?: boolean;
}
```

### **3. UTILITY FUNCTIONS**

```typescript
// src/shared/calendar/utils/dateTimeUtils.ts

/**
 * Creates branded date string from Date object
 */
export function createISODateString(date: Date): ISODateString {
  return date.toISOString().split('T')[0] as ISODateString;
}

/**
 * Creates branded time string from Date object
 */
export function createISOTimeString(date: Date): ISOTimeString {
  return date.toTimeString().slice(0, 5) as ISOTimeString;
}

/**
 * Combines date and time into full timestamp
 */
export function combineDateTime(
  date: ISODateString,
  time: ISOTimeString,
  timezone?: string
): ISODateTimeString {
  const dateTime = new Date(`${date}T${time}:00${timezone ? '' : 'Z'}`);
  return dateTime.toISOString() as ISODateTimeString;
}

/**
 * Calculates duration between two times
 */
export function calculateDuration(
  startTime: ISOTimeString,
  endTime: ISOTimeString
): DurationMinutes {
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);

  let diff = (end.getTime() - start.getTime()) / (1000 * 60);

  // Handle overnight shifts
  if (diff < 0) {
    diff += 24 * 60; // Add 24 hours
  }

  return diff as DurationMinutes;
}

/**
 * Validates time slot for conflicts
 */
export function validateTimeSlot(slot: TimeSlot): ValidationResult {
  const duration = calculateDuration(slot.startTime, slot.endTime);

  if (duration <= 0) {
    return { isValid: false, error: 'End time must be after start time' };
  }

  if (duration > 24 * 60) {
    return { isValid: false, error: 'Duration cannot exceed 24 hours' };
  }

  return { isValid: true };
}

/**
 * Converts to user's local timezone for display
 */
export function formatForUser(
  dateTime: ISODateTimeString,
  userTimezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone
): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: userTimezone,
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(dateTime));
}

/**
 * Database-safe timestamp for Supabase
 */
export function toSupabaseTimestamp(date: Date): string {
  return date.toISOString(); // Always UTC for Supabase
}

/**
 * Current timestamp in UTC
 */
export function nowUTC(): ISODateTimeString {
  return new Date().toISOString() as ISODateTimeString;
}
```

### **4. SUPABASE INTEGRATION PATTERNS**

```typescript
// src/shared/calendar/database/dateTimeSchema.ts

/**
 * Database schema patterns for calendar system
 */
export interface CalendarEventDB {
  id: string;

  // Date/time fields - always store in UTC
  start_datetime: string;  // timestamptz in PostgreSQL
  end_datetime: string;    // timestamptz in PostgreSQL

  // Duration for quick calculations
  duration_minutes: number;

  // Timezone for user context (optional)
  timezone?: string;      // IANA timezone name

  // Audit fields
  created_at: string;     // Supabase auto-generated
  updated_at: string;     // Supabase auto-updated
}

/**
 * Recurring pattern for schedules
 */
export interface RecurringPatternDB {
  id: string;

  // Pattern definition
  frequency: 'daily' | 'weekly' | 'monthly';
  interval_value: number; // Every N days/weeks/months

  // Days of week (for weekly patterns)
  days_of_week?: number[]; // [1,2,3,4,5] for Mon-Fri

  // Time components
  start_time: string;     // HH:MM format
  end_time: string;       // HH:MM format
  duration_minutes: number;

  // Date boundaries
  valid_from: string;     // Date only (YYYY-MM-DD)
  valid_until?: string;   // Date only (YYYY-MM-DD)

  timezone: string;       // IANA timezone
}
```

### **5. API PATTERNS**

```typescript
// src/shared/calendar/api/dateTimeAPI.ts

/**
 * API patterns for date/time operations
 */
export class DateTimeAPI {

  /**
   * Creates time slot with proper validation
   */
  async createTimeSlot(slot: {
    date: ISODateString;
    startTime: ISOTimeString;
    endTime: ISOTimeString;
    resourceId: string;
    timezone?: string;
  }) {
    // Validate slot
    const validation = validateTimeSlot(slot);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Convert to UTC for storage
    const startDateTime = combineDateTime(slot.date, slot.startTime, slot.timezone);
    const endDateTime = combineDateTime(slot.date, slot.endTime, slot.timezone);

    return supabase
      .from('calendar_events')
      .insert({
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        duration_minutes: calculateDuration(slot.startTime, slot.endTime),
        timezone: slot.timezone || 'UTC',
        resource_id: slot.resourceId
      });
  }

  /**
   * Queries events for date range
   */
  async getEventsInRange(range: DateRange, timezone?: string) {
    const startUTC = combineDateTime(range.startDate, '00:00' as ISOTimeString);
    const endUTC = combineDateTime(range.endDate, '23:59' as ISOTimeString);

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .gte('start_datetime', startUTC)
      .lte('end_datetime', endUTC)
      .order('start_datetime');

    if (error) throw error;

    // Convert back to user timezone if specified
    return data?.map(event => ({
      ...event,
      displayDateTime: timezone
        ? formatForUser(event.start_datetime as ISODateTimeString, timezone)
        : event.start_datetime
    }));
  }
}
```

---

## 🚀 **IMPLEMENTATION STRATEGY**

### **Phase 1: Foundation (Current Sprint)**
1. ✅ Create `src/shared/calendar/types/DateTimeTypes.ts`
2. ✅ Create `src/shared/calendar/utils/dateTimeUtils.ts`
3. ✅ Create validation functions
4. ✅ Create Supabase integration patterns

### **Phase 2: UnifiedCalendarEngine Integration**
1. Use new types in UnifiedCalendarEngine
2. Implement business adapters with consistent date handling
3. Create migration utilities for existing data

### **Phase 3: Legacy Module Migration**
1. Update Staff module to use new utilities
2. Update Scheduling module to use unified patterns
3. Create adapter layer for backward compatibility

### **Phase 4: Advanced Features**
1. Multi-timezone support
2. Daylight saving time handling
3. International date formats
4. Advanced recurring patterns

---

## 📋 **MIGRATION GUIDELINES**

### **For Existing Code**
```typescript
// ❌ Old pattern
const shift = {
  date: "2025-09-22",
  start_time: "14:30",
  end_time: "18:00"
};

// ✅ New pattern (with adapter for compatibility)
const shift = {
  date: "2025-09-22" as ISODateString,
  startTime: "14:30" as ISOTimeString,
  endTime: "18:00" as ISOTimeString,
  duration: calculateDuration("14:30" as ISOTimeString, "18:00" as ISOTimeString)
};

// ✅ Adapter function for smooth migration
function adaptLegacyShift(legacy: LegacyShift): TimeSlot {
  return {
    date: legacy.date as ISODateString,
    startTime: legacy.start_time as ISOTimeString,
    endTime: legacy.end_time as ISOTimeString,
    duration: calculateDuration(
      legacy.start_time as ISOTimeString,
      legacy.end_time as ISOTimeString
    )
  };
}
```

### **Database Migration**
```sql
-- Add new columns while maintaining existing ones
ALTER TABLE shifts
ADD COLUMN start_datetime timestamptz,
ADD COLUMN end_datetime timestamptz,
ADD COLUMN duration_minutes integer,
ADD COLUMN timezone text DEFAULT 'UTC';

-- Populate new columns from existing data
UPDATE shifts
SET
  start_datetime = (date || ' ' || start_time)::timestamptz,
  end_datetime = (date || ' ' || end_time)::timestamptz,
  duration_minutes = EXTRACT(EPOCH FROM (
    (date || ' ' || end_time)::timestamptz -
    (date || ' ' || start_time)::timestamptz
  )) / 60;
```

---

## ✅ **VALIDATION CHECKLIST**

### **Before Implementation**
- [ ] ✅ Type safety verified with TypeScript strict mode
- [ ] ✅ Utility functions unit tested
- [ ] ✅ Supabase integration patterns validated
- [ ] ✅ Performance impact assessed
- [ ] ✅ Backward compatibility maintained

### **During Implementation**
- [ ] All new date/time operations use branded types
- [ ] Database operations use UTC consistently
- [ ] User interfaces display localized times
- [ ] Validation functions prevent invalid states
- [ ] Migration path preserves existing data

### **Testing Requirements**
- [ ] Unit tests for all utility functions
- [ ] Integration tests with Supabase
- [ ] Edge case testing (overnight shifts, DST transitions)
- [ ] Performance testing for large date ranges
- [ ] Timezone accuracy validation

---

## 🎯 **SUCCESS METRICS**

### **Technical Metrics**
- **Zero** date-related runtime errors
- **100%** type safety for date operations
- **< 50ms** date calculation performance
- **Zero** data loss in migrations

### **User Experience Metrics**
- **Consistent** date display across all modules
- **Accurate** timezone handling
- **Intuitive** time input/selection
- **Reliable** scheduling operations

---

**🚀 NEXT STEPS**: Implement this specification starting with DateTimeTypes.ts and dateTimeUtils.ts in the Unified Calendar System foundation.