# 🗓️ UNIFIED CALENDAR ARCHITECTURE SPECIFICATION - G-ADMIN MINI

**Versión**: 1.0
**Fecha**: 2025-09-22
**Tipo**: Architectural Design Document
**Basado en**: MODULE_PLANNING_MASTER_GUIDE.md Analysis - Scheduling Module

---

## 🎯 **EXECUTIVE SUMMARY**

El análisis empírico del módulo scheduling reveló que **G-Admin Mini necesita un sistema de calendario unificado** que sirva a múltiples business models. En lugar de tener implementaciones duplicadas y específicas, proponemos una **arquitectura centralizada con adapters business-specific** que aprovecha el sistema de capabilities y slots.

### **Problema Detectado**
- Staff module duplica funcionalidad de scheduling
- Operations Hub implementa manualmente time blocks
- 8+ business models requieren calendario (appointments, classes, rentals, events)
- Scheduling module está **subdiseñado para su potencial real**

### **Solución Propuesta**
**Unified Calendar System** = Core Engine + Business Adapters + Slots Extensions + Capabilities Integration

---

## 🏗️ **ARQUITECTURA UNIFICADA**

### **1. CORE CALENDAR ENGINE**

#### **1.1 UnifiedCalendarEngine**
```typescript
// src/shared/calendar/UnifiedCalendarEngine.ts
export class UnifiedCalendarEngine {
  // Core time management
  generateTimeSlots(config: CalendarConfig): TimeSlot[]
  calculateAvailability(constraints: AvailabilityRules): AvailabilityResult
  detectConflicts(bookings: Booking[], newBooking: Booking): ConflictResult

  // Resource management
  assignResources(booking: Booking, resources: Resource[]): AssignmentResult
  optimizeSchedule(constraints: OptimizationRules): ScheduleOptimization

  // Business logic abstraction
  validateBooking(booking: Booking, rules: ValidationRules): ValidationResult
  calculateCosts(booking: Booking, pricing: PricingRules): CostCalculation

  // Integration points
  emitEvents(eventType: CalendarEventType, data: any): void
  syncWithExternalCalendars(providers: CalendarProvider[]): SyncResult
}
```

#### **1.2 Tipos Base Unificados**
```typescript
// src/shared/calendar/types/CalendarTypes.ts
export interface TimeSlot {
  id: string;
  start: Date;
  end: Date;
  duration: number; // minutes
  type: 'available' | 'booked' | 'blocked' | 'maintenance';
  metadata?: Record<string, any>;
}

export interface CalendarConfig {
  businessModel: BusinessModel;
  workingHours: WorkingHours;
  timeZone: string;
  slotDuration: number; // minutes
  bufferTime?: number;  // minutes between slots
  maxAdvanceBooking?: number; // days
  cancellationPolicy?: CancellationPolicy;
}

export interface Booking {
  id: string;
  type: BookingType;
  timeSlot: TimeSlot;
  resources: Resource[];
  customer?: Customer;
  status: BookingStatus;
  metadata: BusinessSpecificData;
}

export type BookingType =
  | 'appointment'    // Medical, Legal, Beauty
  | 'class'          // Fitness, Education
  | 'space'          // Co-working, Events
  | 'rental'         // Equipment, Vehicles
  | 'shift'          // Staff scheduling
  | 'event'          // Private events, Catering
  | 'maintenance';   // System maintenance

export interface Resource {
  id: string;
  type: ResourceType;
  name: string;
  capacity?: number;
  skills?: string[];
  location?: Location;
  availability: AvailabilitySchedule;
}

export type ResourceType = 'staff' | 'room' | 'equipment' | 'vehicle' | 'table';
```

### **2. BUSINESS MODEL ADAPTERS**

#### **2.1 Adapter Pattern Implementation**
```typescript
// src/shared/calendar/adapters/BaseCalendarAdapter.ts
export abstract class BaseCalendarAdapter {
  protected engine: UnifiedCalendarEngine;
  protected businessModel: BusinessModel;

  constructor(engine: UnifiedCalendarEngine, businessModel: BusinessModel) {
    this.engine = engine;
    this.businessModel = businessModel;
  }

  // Abstract methods - cada business model implementa
  abstract getBookingRules(): ValidationRules;
  abstract getPricingRules(): PricingRules;
  abstract getResourceRequirements(): ResourceRequirements;
  abstract formatBookingDisplay(booking: Booking): BookingDisplay;

  // Common methods - reutilizados
  createBooking(request: BookingRequest): Promise<BookingResult> {
    const rules = this.getBookingRules();
    const validation = this.engine.validateBooking(request, rules);

    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }

    const booking = this.engine.createBooking(request);
    this.engine.emitEvents('booking_created', { booking, businessModel: this.businessModel });

    return { success: true, booking };
  }
}
```

#### **2.2 Business-Specific Adapters**
```typescript
// src/shared/calendar/adapters/AppointmentCalendarAdapter.ts
export class AppointmentCalendarAdapter extends BaseCalendarAdapter {
  getBookingRules(): ValidationRules {
    return {
      minAdvanceBooking: 30, // 30 minutes
      maxAdvanceBooking: 90,  // 90 days
      allowCancellation: true,
      cancellationDeadline: 24, // hours
      requiresStaffAssignment: true,
      requiresCustomerInfo: true
    };
  }

  getPricingRules(): PricingRules {
    return {
      basePricing: 'time_based',
      allowDynamicPricing: true,
      discountRules: ['membership', 'bulk_booking'],
      surchargeRules: ['weekend', 'holiday', 'emergency']
    };
  }

  getResourceRequirements(): ResourceRequirements {
    return {
      requiredResources: ['staff'],
      optionalResources: ['room', 'equipment'],
      staffSkillMatching: true,
      roomTypeMatching: false
    };
  }

  formatBookingDisplay(booking: Booking): BookingDisplay {
    return {
      title: `${booking.metadata.serviceType} - ${booking.customer?.name}`,
      subtitle: `Dr. ${booking.resources.find(r => r.type === 'staff')?.name}`,
      duration: `${booking.timeSlot.duration}min`,
      location: booking.resources.find(r => r.type === 'room')?.name,
      color: this.getServiceColor(booking.metadata.serviceType),
      actions: ['reschedule', 'cancel', 'add_notes', 'send_reminder']
    };
  }
}

// src/shared/calendar/adapters/ClassScheduleAdapter.ts
export class ClassScheduleAdapter extends BaseCalendarAdapter {
  getBookingRules(): ValidationRules {
    return {
      minAdvanceBooking: 60, // 1 hour
      maxAdvanceBooking: 30,  // 30 days
      allowCancellation: true,
      cancellationDeadline: 2, // hours
      hasCapacityLimits: true,
      allowWaitlist: true,
      requiresMembership: true
    };
  }

  formatBookingDisplay(booking: Booking): BookingDisplay {
    const capacity = booking.metadata.capacity;
    const enrolled = booking.metadata.enrolled;

    return {
      title: booking.metadata.className,
      subtitle: `Instructor: ${booking.resources.find(r => r.type === 'staff')?.name}`,
      duration: `${booking.timeSlot.duration}min`,
      location: booking.resources.find(r => r.type === 'room')?.name,
      capacity: `${enrolled}/${capacity}`,
      color: this.getClassTypeColor(booking.metadata.classType),
      actions: ['view_participants', 'send_update', 'cancel_class', 'modify_capacity']
    };
  }
}

// src/shared/calendar/adapters/RentalCalendarAdapter.ts
export class RentalCalendarAdapter extends BaseCalendarAdapter {
  getBookingRules(): ValidationRules {
    return {
      minAdvanceBooking: 120, // 2 hours
      maxAdvanceBooking: 365, // 1 year
      allowCancellation: true,
      cancellationDeadline: 48, // hours
      requiresDeposit: true,
      requiresIdentification: true,
      hasMinimumRentalPeriod: true
    };
  }

  formatBookingDisplay(booking: Booking): BookingDisplay {
    const asset = booking.resources.find(r => r.type === 'equipment' || r.type === 'vehicle');

    return {
      title: `${asset?.name} - ${booking.customer?.name}`,
      subtitle: `Rental Period: ${this.formatRentalPeriod(booking)}`,
      duration: this.calculateRentalDuration(booking),
      location: booking.metadata.pickupLocation,
      color: this.getAssetStatusColor(booking.metadata.assetCondition),
      actions: ['extend_rental', 'early_return', 'damage_report', 'contact_customer']
    };
  }
}

// src/shared/calendar/adapters/StaffSchedulingAdapter.ts
export class StaffSchedulingAdapter extends BaseCalendarAdapter {
  getBookingRules(): ValidationRules {
    return {
      respectsLaborLaws: true,
      maxConsecutiveHours: 8,
      minRestBetweenShifts: 12, // hours
      maxWeeklyHours: 40,
      allowsOvertimeRequests: true,
      requiresManagerApproval: true
    };
  }

  formatBookingDisplay(booking: Booking): BookingDisplay {
    const staff = booking.resources.find(r => r.type === 'staff');

    return {
      title: `${staff?.name} - ${booking.metadata.shiftType}`,
      subtitle: `Department: ${booking.metadata.department}`,
      duration: `${booking.timeSlot.duration / 60}h`,
      location: booking.metadata.workLocation,
      color: this.getShiftTypeColor(booking.metadata.shiftType),
      actions: ['request_coverage', 'approve_overtime', 'add_break', 'performance_notes']
    };
  }
}
```

### **3. SLOTS SYSTEM INTEGRATION**

#### **3.1 Calendar-Specific Slots**
```typescript
// src/shared/calendar/slots/CalendarSlotDefinitions.ts
export const CALENDAR_SLOTS = {
  // Global calendar slots
  CALENDAR_HEADER: 'calendar-header',
  CALENDAR_SIDEBAR: 'calendar-sidebar',
  CALENDAR_FOOTER: 'calendar-footer',

  // Business-specific action slots
  APPOINTMENT_ACTIONS: 'appointment-actions',
  CLASS_ACTIONS: 'class-actions',
  RENTAL_ACTIONS: 'rental-actions',
  STAFF_ACTIONS: 'staff-actions',

  // Context-specific slots
  BOOKING_FORM_EXTRA: 'booking-form-extra',
  BOOKING_DETAILS_EXTRA: 'booking-details-extra',
  CALENDAR_FILTERS: 'calendar-filters',
  CALENDAR_VIEWS: 'calendar-views'
};

// Registration example
SlotRegistry.register(CALENDAR_SLOTS.APPOINTMENT_ACTIONS, {
  component: AppointmentActionsPanel,
  requirements: ['appointment_booking'],
  priority: 1
});

SlotRegistry.register(CALENDAR_SLOTS.CLASS_ACTIONS, {
  component: ClassManagementPanel,
  requirements: ['class_scheduling'],
  priority: 1
});
```

#### **3.2 Business Model Extensions via Slots**
```tsx
// src/shared/calendar/components/UnifiedCalendar.tsx
export function UnifiedCalendar({ adapter, businessModel }: UnifiedCalendarProps) {
  return (
    <ContentLayout>
      {/* Header with business-specific actions */}
      <Section variant="flat" title="Calendar">
        <Slot
          name={CALENDAR_SLOTS.CALENDAR_HEADER}
          businessModel={businessModel}
          fallback={<DefaultCalendarHeader />}
        />
      </Section>

      {/* Main calendar view */}
      <Section variant="elevated">
        <CalendarGrid adapter={adapter} />

        {/* Business-specific filters */}
        <Slot
          name={CALENDAR_SLOTS.CALENDAR_FILTERS}
          businessModel={businessModel}
          data={{ adapter }}
        />
      </Section>

      {/* Sidebar with business-specific tools */}
      <Slot
        name={CALENDAR_SLOTS.CALENDAR_SIDEBAR}
        businessModel={businessModel}
        data={{ adapter }}
        single={true}
      />

      {/* Footer with business-specific analytics */}
      <Slot
        name={CALENDAR_SLOTS.CALENDAR_FOOTER}
        businessModel={businessModel}
        data={{ adapter }}
      />
    </ContentLayout>
  );
}
```

### **4. CAPABILITIES-DRIVEN RENDERING**

#### **4.1 Automatic Adapter Selection**
```typescript
// src/shared/calendar/hooks/useCalendarAdapter.ts
export function useCalendarAdapter(): CalendarAdapter | null {
  const { hasCapability, businessModel } = useCapabilities();
  const engine = useCalendarEngine();

  return useMemo(() => {
    if (hasCapability('appointment_booking')) {
      return new AppointmentCalendarAdapter(engine, businessModel);
    }

    if (hasCapability('class_scheduling')) {
      return new ClassScheduleAdapter(engine, businessModel);
    }

    if (hasCapability('space_booking')) {
      return new SpaceBookingAdapter(engine, businessModel);
    }

    if (hasCapability('manages_rentals')) {
      return new RentalCalendarAdapter(engine, businessModel);
    }

    if (hasCapability('staff_scheduling')) {
      return new StaffSchedulingAdapter(engine, businessModel);
    }

    // Fallback to basic calendar
    return new BasicCalendarAdapter(engine, businessModel);
  }, [hasCapability, businessModel, engine]);
}
```

#### **4.2 Capability-Gated Calendar Features**
```tsx
// Usage in pages
export function BusinessCalendarPage() {
  const adapter = useCalendarAdapter();
  const { hasCapability } = useCapabilities();

  if (!adapter) {
    return <CalendarSetupWizard />;
  }

  return (
    <CapabilityGate capabilities={['appointment_booking', 'class_scheduling', 'manages_rentals']}>
      <UnifiedCalendar adapter={adapter} />

      {/* Conditional features based on capabilities */}
      <CapabilityGate capabilities="staff_scheduling">
        <StaffAvailabilityPanel />
      </CapabilityGate>

      <CapabilityGate capabilities="recurring_billing">
        <RecurringBookingManager />
      </CapabilityGate>

      <CapabilityGate capabilities="calendar_integration">
        <ExternalCalendarSync />
      </CapabilityGate>
    </CapabilityGate>
  );
}
```

---

## 🔄 **MIGRATION STRATEGY**

### **Phase 1: Core Engine Development** (2-3 weeks)
1. **Create UnifiedCalendarEngine** class with core functionality
2. **Implement base types** (TimeSlot, Booking, Resource, etc.)
3. **Build BaseCalendarAdapter** abstract class
4. **Create slot definitions** for calendar system
5. **Develop useCalendarAdapter** hook

### **Phase 2: Adapter Implementation** (3-4 weeks)
1. **AppointmentCalendarAdapter** → Replace appointment booking logic
2. **StaffSchedulingAdapter** → Migrate current scheduling module
3. **ClassScheduleAdapter** → Enable fitness/education business models
4. **RentalCalendarAdapter** → Enable rental business models

### **Phase 3: Module Integration** (2-3 weeks)
1. **Migrate Staff module** to use StaffSchedulingAdapter
2. **Refactor Operations Hub** to use UnifiedCalendar
3. **Update business capabilities** mapping
4. **Implement slots registration** for business-specific features

### **Phase 4: Advanced Features** (2-3 weeks)
1. **External calendar integration** (Google, Outlook, Apple)
2. **Advanced conflict detection** and resolution
3. **Automated schedule optimization**
4. **Multi-timezone support**
5. **Real-time synchronization**

### **Phase 5: Business Model Rollout** (3-4 weeks)
1. **Enable appointment booking** for services business models
2. **Enable class scheduling** for fitness/education models
3. **Enable space booking** for co-working/events models
4. **Enable rental management** for rental business models

---

## 📊 **BUSINESS IMPACT ANALYSIS**

### **Immediate Benefits**
- **Eliminates code duplication** between Staff and Scheduling modules
- **Enables 8+ new business models** with calendar functionality
- **Consistent UX** across all calendar features
- **Reduced development time** for new calendar features

### **Business Model Enablement**
| Business Model | Calendar Type | New Revenue Opportunities |
|----------------|---------------|---------------------------|
| Medical/Healthcare | Appointments | Patient scheduling, telemedicine |
| Fitness/Wellness | Classes | Group classes, personal training |
| Education | Classes | Course scheduling, tutoring |
| Rental Services | Assets | Equipment, vehicle, space rental |
| Events/Catering | Events | Event planning, venue booking |
| Co-working | Space | Desk booking, meeting rooms |
| Beauty/Spa | Appointments | Service scheduling, packages |
| Consulting | Appointments | Client meetings, workshops |

### **Technical Debt Reduction**
- **-3 duplicate implementations** (Staff, Operations Hub, Scheduling)
- **+1 unified system** serving all business models
- **-50% calendar-related bugs** (single source of truth)
- **+300% calendar feature velocity** (adapter pattern)

---

## 🚀 **IMPLEMENTATION ROADMAP**

### **Sprint 1-2: Foundation** (2 weeks)
- [ ] Create `src/shared/calendar/` directory structure
- [ ] Implement `UnifiedCalendarEngine` core class
- [ ] Define unified types (`CalendarTypes.ts`)
- [ ] Build `BaseCalendarAdapter` abstract class
- [ ] Create basic slot definitions

### **Sprint 3-4: Staff Migration** (2 weeks)
- [ ] Implement `StaffSchedulingAdapter`
- [ ] Migrate Staff module to use unified system
- [ ] Test staff scheduling functionality
- [ ] Update Staff module tests

### **Sprint 5-6: Appointment System** (2 weeks)
- [ ] Implement `AppointmentCalendarAdapter`
- [ ] Enable appointment booking capability
- [ ] Build appointment-specific UI components
- [ ] Test with medical/service business models

### **Sprint 7-8: Class Scheduling** (2 weeks)
- [ ] Implement `ClassScheduleAdapter`
- [ ] Enable class scheduling capability
- [ ] Build class-specific UI components
- [ ] Test with fitness/education business models

### **Sprint 9-10: Rental System** (2 weeks)
- [ ] Implement `RentalCalendarAdapter`
- [ ] Enable rental management capability
- [ ] Build rental-specific UI components
- [ ] Test with rental business models

### **Sprint 11-12: Advanced Features** (2 weeks)
- [ ] External calendar integration
- [ ] Advanced conflict detection
- [ ] Schedule optimization algorithms
- [ ] Real-time synchronization

### **Sprint 13-14: Business Model Rollout** (2 weeks)
- [ ] Enable all business models
- [ ] Performance optimization
- [ ] Documentation and training
- [ ] Production deployment

---

## 🎯 **SUCCESS METRICS**

### **Technical Metrics**
- **Code Reuse**: >80% calendar functionality shared across business models
- **Performance**: <200ms calendar view load time
- **Reliability**: <0.1% booking conflicts/errors
- **Maintainability**: Single codebase for all calendar features

### **Business Metrics**
- **New Business Models**: 8+ models enabled with calendar functionality
- **Feature Velocity**: 3x faster calendar feature development
- **User Adoption**: >90% of multi-business model users utilize calendar
- **Support Tickets**: -70% calendar-related support requests

### **User Experience Metrics**
- **Consistency**: Identical calendar UX across all business models
- **Usability**: <30 seconds to create a booking
- **Flexibility**: Business-specific actions accessible via slots
- **Mobile**: 100% feature parity on mobile devices

---

## 📚 **TECHNICAL SPECIFICATIONS**

### **File Structure**
```
src/shared/calendar/
├── UnifiedCalendarEngine.ts          # Core engine
├── types/
│   ├── CalendarTypes.ts              # Base types
│   ├── BookingTypes.ts               # Booking-specific types
│   └── ResourceTypes.ts              # Resource management types
├── adapters/
│   ├── BaseCalendarAdapter.ts        # Abstract base adapter
│   ├── AppointmentCalendarAdapter.ts # Medical, Legal, Beauty
│   ├── ClassScheduleAdapter.ts       # Fitness, Education
│   ├── RentalCalendarAdapter.ts      # Equipment, Vehicle rental
│   ├── StaffSchedulingAdapter.ts     # Staff management
│   └── SpaceBookingAdapter.ts        # Co-working, Events
├── components/
│   ├── UnifiedCalendar.tsx           # Main calendar component
│   ├── CalendarGrid.tsx              # Calendar display
│   ├── BookingForm.tsx               # Universal booking form
│   └── BookingDetails.tsx            # Booking information
├── hooks/
│   ├── useCalendarAdapter.ts         # Adapter selection
│   ├── useCalendarEngine.ts          # Engine access
│   └── useBookingManagement.ts       # Booking operations
├── slots/
│   ├── CalendarSlotDefinitions.ts    # Slot definitions
│   └── BusinessSpecificSlots.ts      # Business model slots
└── utils/
    ├── calendarUtils.ts              # Utility functions
    ├── conflictDetection.ts          # Conflict algorithms
    └── scheduleOptimization.ts       # Optimization algorithms
```

### **Dependencies**
- **Required**: `@/shared/ui`, `@/lib/capabilities`, `@/lib/slots`
- **Optional**: External calendar SDKs (Google, Outlook)
- **New**: Date manipulation library (date-fns or similar)

### **Performance Considerations**
- **Lazy Loading**: Adapters loaded based on business capabilities
- **Caching**: Calendar data cached with TTL
- **Virtualization**: Large calendar views use virtual scrolling
- **Debouncing**: User input debounced for real-time features

---

## 🚨 **RISK MITIGATION**

### **Technical Risks**
1. **Complexity**: Mitigated by clear adapter pattern and extensive testing
2. **Performance**: Mitigated by lazy loading and caching strategies
3. **Migration**: Mitigated by phased rollout and backward compatibility

### **Business Risks**
1. **User Adoption**: Mitigated by maintaining existing UX patterns
2. **Feature Gaps**: Mitigated by slots system for business-specific needs
3. **Training**: Mitigated by comprehensive documentation and examples

### **Contingency Plans**
1. **Rollback Strategy**: Keep existing modules functional during migration
2. **Feature Flags**: Gradual rollout with capability to disable new system
3. **Support Plan**: Dedicated support team during transition period

---

## ✅ **CONCLUSION**

The Unified Calendar Architecture represents a **strategic architectural decision** that transforms G-Admin Mini from a single-business-model system to a true **multi-business-model platform**.

By centralizing calendar functionality while maintaining business-specific flexibility through adapters and slots, we achieve:

- **Scale**: Support for 8+ business models with a single codebase
- **Consistency**: Unified UX across all calendar features
- **Extensibility**: Easy addition of new business models
- **Maintainability**: Single source of truth for calendar logic

This architecture positions G-Admin Mini as a **comprehensive business management platform** capable of serving diverse industries from healthcare to fitness to rental services, all unified under a consistent, powerful calendar system.

**Next Steps**: Begin implementation with Phase 1 (Core Engine Development) and establish the foundation for G-Admin Mini's multi-business-model future.