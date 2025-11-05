# 🚀 IMPLEMENTATION ROADMAP - DISTRIBUTED FEATURES
## E-commerce, Appointments, B2B Sales

**Fecha**: 2025-01-15
**Estado**: 📋 READY TO IMPLEMENT
**Basado en**: `ARCHITECTURAL_DECISIONS_CORRECTED.md`
**Principio**: Features por FUNCIÓN, no por capability

---

## 📋 TABLA DE CONTENIDOS

1. [Executive Summary](#executive-summary)
2. [Implementation Priorities](#implementation-priorities)
3. [Appointments Implementation](#appointments-implementation)
4. [B2B Sales Implementation](#b2b-sales-implementation)
5. [E-commerce Implementation](#e-commerce-implementation)
6. [Testing Strategy](#testing-strategy)
7. [Deployment Plan](#deployment-plan)

---

## 🎯 EXECUTIVE SUMMARY

### Features a Implementar

| Capability | Features | Módulos Afectados | Estimado |
|------------|----------|-------------------|----------|
| **Appointments** | 6 features | 5 módulos + Customer App | 5 semanas |
| **B2B Sales** | 8 features | 5 módulos | 5 semanas |
| **E-commerce** | 6 features | 4 módulos + Customer App | 10 semanas |
| **TOTAL** | **20 features** | **9 módulos** | **20 semanas** |

### Módulos Afectados

1. Products Module - Catalog config
2. Sales Module - Order management
3. Finance Module - Payment processing
4. Scheduling Module - Availability
5. Staff Module - Professional config
6. Customers Module - Corporate data
7. Settings Module - Workflows
8. Backend Services - Async processing
9. Customer App - Frontend interfaces

---

## 📊 IMPLEMENTATION PRIORITIES

### Recomendación: Orden de Implementación

```
FASE 1: Appointments (5 semanas) ⭐ RECOMENDADO PRIMERO
  ↓
FASE 2: B2B Sales (5 semanas)
  ↓
FASE 3: E-commerce (10 semanas)
```

### Razones del Orden

**¿Por qué Appointments primero?**
- ✅ Menor complejidad técnica
- ✅ No requiere Customer App complejo (solo booking)
- ✅ Reutiliza calendario de Scheduling existente
- ✅ Permite validar principio de distribución
- ✅ Quick wins para el equipo

**¿Por qué B2B segundo?**
- ✅ Complejidad media
- ✅ Workflows útiles para E-commerce después
- ✅ Pricing tiers reutilizables
- ✅ No depende de Customer App

**¿Por qué E-commerce último?**
- ⚠️ Mayor complejidad
- ⚠️ Requiere Customer App completo (cart, checkout, catalog)
- ⚠️ Depende de payment gateway
- ⚠️ Async processing complejo
- ✅ Se beneficia de work previo (workflows, pricing)

---

## 📅 APPOINTMENTS IMPLEMENTATION

**Duración**: 5 semanas (200 horas)
**Prioridad**: 🔴 ALTA - Implementar primero

### Week 1: Customer App - Booking Interface

#### Objetivos
- Crear estructura Customer App
- Implementar flujo de booking completo
- Integración básica con backend

#### Deliverables

**1.1 Estructura de Customer App**
```
src/pages/app/
├── booking/
│   ├── page.tsx                    // Main booking page
│   ├── components/
│   │   ├── ServiceSelection.tsx    // Browse services
│   │   ├── ProfessionalSelection.tsx // Choose professional
│   │   ├── CalendarPicker.tsx      // Date/time picker
│   │   ├── BookingConfirmation.tsx // Review + confirm
│   │   └── BookingHistory.tsx      // Past appointments
│   ├── hooks/
│   │   ├── useServices.ts
│   │   ├── useProfessionals.ts
│   │   ├── useAvailability.ts
│   │   └── useBooking.ts
│   └── services/
│       └── bookingApi.ts
├── appointments/
│   ├── page.tsx                    // My appointments
│   ├── components/
│   │   ├── AppointmentCard.tsx
│   │   └── AppointmentActions.tsx
│   └── [id]/
│       ├── page.tsx                // Appointment detail
│       └── cancel/
│           └── page.tsx            // Cancellation
└── layout.tsx                      // Customer app layout
```

**1.2 Database Schema Updates**
```sql
-- Add appointment-specific fields to sales table
ALTER TABLE sales
  ADD COLUMN scheduled_time TIMESTAMPTZ,
  ADD COLUMN assigned_staff_id UUID REFERENCES employees(id),
  ADD COLUMN service_id UUID REFERENCES products(id),
  ADD COLUMN cancellation_reason TEXT,
  ADD COLUMN cancelled_at TIMESTAMPTZ;

CREATE INDEX idx_sales_scheduled_time ON sales(scheduled_time);
CREATE INDEX idx_sales_assigned_staff ON sales(assigned_staff_id);

-- Appointment slots (for blocking time)
CREATE TABLE appointment_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES employees(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'available', -- 'available', 'booked', 'blocked'
  appointment_id UUID REFERENCES sales(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(staff_id, date, start_time)
);

CREATE INDEX idx_slots_staff_date ON appointment_slots(staff_id, date);
CREATE INDEX idx_slots_status ON appointment_slots(status);
```

**1.3 TypeScript Types**
```typescript
// src/types/appointment.ts

export interface AppointmentBookingData {
  service_id: string;
  staff_id?: string; // Optional if service doesn't require specific professional
  scheduled_time: string;
  customer_id: string;
  notes?: string;
}

export interface AppointmentSlot {
  id: string;
  staff_id: string;
  staff_name: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'available' | 'booked' | 'blocked';
  appointment_id?: string;
}

export interface ServiceWithAvailability extends Product {
  duration_minutes: number;
  available_professionals: Staff[];
  next_available_slot?: AppointmentSlot;
}
```

**1.4 Customer Booking Flow**
```typescript
// pages/app/booking/page.tsx

export default function BookingPage() {
  const [step, setStep] = useState<'service' | 'professional' | 'time' | 'confirm'>('service');
  const [booking, setBooking] = useState<Partial<AppointmentBookingData>>({});

  const { data: services } = useServices();
  const { data: professionals } = useProfessionals(booking.service_id);
  const { data: slots } = useAvailability(booking.service_id, booking.staff_id);

  const handleConfirmBooking = async () => {
    try {
      // Create appointment (creates Sale with order_type: 'APPOINTMENT')
      const appointment = await bookingApi.createAppointment(booking);

      // Navigate to confirmation
      navigate(`/app/appointments/${appointment.id}`);

      notify.success({
        title: 'Appointment booked!',
        description: `Your appointment is confirmed for ${format(booking.scheduled_time, 'PPP')}`,
      });
    } catch (error) {
      notify.error({
        title: 'Booking failed',
        description: error.message,
      });
    }
  };

  return (
    <Container maxW="4xl" py="8">
      <Stack direction="column" gap="6">
        {/* Progress indicator */}
        <Steps currentStep={step}>
          <Step label="Service" />
          <Step label="Professional" />
          <Step label="Date & Time" />
          <Step label="Confirm" />
        </Steps>

        {/* Step content */}
        {step === 'service' && (
          <ServiceSelection
            services={services}
            onSelect={(service) => {
              setBooking({ ...booking, service_id: service.id });
              setStep('professional');
            }}
          />
        )}

        {step === 'professional' && (
          <ProfessionalSelection
            professionals={professionals}
            onSelect={(professional) => {
              setBooking({ ...booking, staff_id: professional.id });
              setStep('time');
            }}
            onSkip={() => setStep('time')} // Allow any available professional
          />
        )}

        {step === 'time' && (
          <CalendarPicker
            slots={slots}
            onSelect={(slot) => {
              setBooking({ ...booking, scheduled_time: slot.start_time });
              setStep('confirm');
            }}
          />
        )}

        {step === 'confirm' && (
          <BookingConfirmation
            booking={booking}
            onConfirm={handleConfirmBooking}
            onBack={() => setStep('time')}
          />
        )}
      </Stack>
    </Container>
  );
}
```

**1.5 API Service**
```typescript
// pages/app/booking/services/bookingApi.ts

class BookingAPI {
  async createAppointment(data: AppointmentBookingData): Promise<Sale> {
    // 1. Validate slot availability
    const slot = await this.checkSlotAvailability(
      data.staff_id,
      data.scheduled_time
    );

    if (!slot || slot.status !== 'available') {
      throw new Error('Selected time slot is no longer available');
    }

    // 2. Get service details
    const service = await productsApi.getById(data.service_id);

    // 3. Create sale with appointment type
    const { data: sale, error } = await supabase
      .from('sales')
      .insert({
        customer_id: data.customer_id,
        order_type: 'APPOINTMENT',
        scheduled_time: data.scheduled_time,
        assigned_staff_id: data.staff_id,
        service_id: data.service_id,
        order_status: 'CONFIRMED',
        payment_status: 'PENDING',
        notes: data.notes,
      })
      .select()
      .single();

    if (error) throw error;

    // 4. Create sale items
    await supabase.from('sale_items').insert({
      sale_id: sale.id,
      product_id: service.id,
      quantity: 1,
      unit_price: service.price,
      total_price: service.price,
    });

    // 5. Book the slot
    await supabase
      .from('appointment_slots')
      .update({
        status: 'booked',
        appointment_id: sale.id,
      })
      .eq('id', slot.id);

    // 6. Emit event
    eventBus.emit('appointment.booked', {
      appointmentId: sale.id,
      customerId: data.customer_id,
      staffId: data.staff_id,
      scheduledTime: data.scheduled_time,
    });

    return sale;
  }

  async checkSlotAvailability(
    staffId: string,
    scheduledTime: string
  ): Promise<AppointmentSlot | null> {
    const { data } = await supabase
      .from('appointment_slots')
      .select('*')
      .eq('staff_id', staffId)
      .eq('start_time', scheduledTime)
      .eq('status', 'available')
      .single();

    return data;
  }

  async cancelAppointment(
    appointmentId: string,
    reason: string
  ): Promise<void> {
    // Update sale
    await supabase
      .from('sales')
      .update({
        order_status: 'CANCELLED',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', appointmentId);

    // Release slot
    await supabase
      .from('appointment_slots')
      .update({
        status: 'available',
        appointment_id: null,
      })
      .eq('appointment_id', appointmentId);

    // Emit event
    eventBus.emit('appointment.cancelled', { appointmentId, reason });
  }
}

export const bookingApi = new BookingAPI();
```

**Estimado Week 1**: 40-45 horas

---

### Week 2: Sales Module - Appointments Management

#### Objetivos
- Crear tab Appointments en Sales
- Vista de calendario de appointments
- CRUD operations para admin
- Integración con Customer bookings

#### Deliverables

**2.1 Appointments Tab Component**
```typescript
// sales/components/AppointmentsTab.tsx

export function AppointmentsTab() {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', selectedDate],
    queryFn: () =>
      salesApi.getOrders({
        order_type: 'APPOINTMENT',
        date: format(selectedDate, 'yyyy-MM-dd'),
      }),
  });

  const handleReschedule = async (appointmentId: string, newTime: string) => {
    try {
      await salesApi.updateAppointment(appointmentId, {
        scheduled_time: newTime,
      });
      queryClient.invalidateQueries(['appointments']);
      notify.success({ title: 'Appointment rescheduled' });
    } catch (error) {
      notify.error({ title: 'Failed to reschedule', description: error.message });
    }
  };

  const handleCancel = async (appointmentId: string) => {
    const reason = await prompt('Cancellation reason:');
    if (!reason) return;

    try {
      await bookingApi.cancelAppointment(appointmentId, reason);
      queryClient.invalidateQueries(['appointments']);
      notify.success({ title: 'Appointment cancelled' });
    } catch (error) {
      notify.error({ title: 'Failed to cancel', description: error.message });
    }
  };

  return (
    <Stack direction="column" gap="4">
      {/* Header */}
      <Stack direction="row" justify="space-between" align="center">
        <Heading size="lg">Appointments</Heading>

        <Stack direction="row" gap="2">
          <SegmentedControl
            value={view}
            onChange={setView}
            items={[
              { value: 'calendar', label: 'Calendar' },
              { value: 'list', label: 'List' },
            ]}
          />
          <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
            Today
          </Button>
        </Stack>
      </Stack>

      {/* View switcher */}
      {view === 'calendar' ? (
        <AppointmentsCalendarView
          appointments={appointments}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onReschedule={handleReschedule}
          onCancel={handleCancel}
        />
      ) : (
        <AppointmentsTable
          data={appointments}
          isLoading={isLoading}
          onReschedule={handleReschedule}
          onCancel={handleCancel}
        />
      )}
    </Stack>
  );
}
```

**2.2 Calendar View Component**
```typescript
// sales/components/AppointmentsCalendarView.tsx

export function AppointmentsCalendarView({
  appointments,
  selectedDate,
  onDateChange,
  onReschedule,
  onCancel,
}: AppointmentsCalendarViewProps) {
  const timeSlots = useMemo(() => {
    // Generate 15-min slots from 8am to 8pm
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
      for (let min = 0; min < 60; min += 15) {
        slots.push({ hour, minute: min });
      }
    }
    return slots;
  }, []);

  const appointmentsByTime = useMemo(() => {
    return appointments.reduce((acc, apt) => {
      const time = format(new Date(apt.scheduled_time), 'HH:mm');
      if (!acc[time]) acc[time] = [];
      acc[time].push(apt);
      return acc;
    }, {} as Record<string, Sale[]>);
  }, [appointments]);

  return (
    <Stack direction="row" gap="4" height="600px">
      {/* Date picker sidebar */}
      <Box width="300px">
        <Calendar
          value={selectedDate}
          onChange={onDateChange}
          highlightedDates={getAppointmentDates(appointments)}
        />

        <Box mt="4">
          <AppointmentsSummary appointments={appointments} />
        </Box>
      </Box>

      {/* Timeline grid */}
      <Box flex="1" overflowY="auto">
        <Grid templateColumns="80px 1fr" gap="0">
          {timeSlots.map(({ hour, minute }) => {
            const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            const aptsAtTime = appointmentsByTime[time] || [];

            return (
              <Fragment key={time}>
                {/* Time label */}
                <Box
                  borderTop="1px solid"
                  borderColor="gray.200"
                  py="2"
                  px="2"
                  fontSize="sm"
                  color="gray.600"
                >
                  {minute === 0 ? `${hour}:00` : ''}
                </Box>

                {/* Appointments slot */}
                <Box
                  borderTop="1px solid"
                  borderColor="gray.200"
                  py="1"
                  px="2"
                  minH="40px"
                >
                  {aptsAtTime.map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onReschedule={onReschedule}
                      onCancel={onCancel}
                      compact
                    />
                  ))}
                </Box>
              </Fragment>
            );
          })}
        </Grid>
      </Box>
    </Stack>
  );
}
```

**2.3 Add Tab to Sales Page**
```typescript
// sales/page.tsx

export default function SalesPage() {
  const hasAppointments = useCapabilityStore((state) =>
    state.hasCapability('appointment_based')
  );

  return (
    <ContentLayout>
      <Tabs defaultValue="pos">
        <TabsList>
          <TabsTrigger value="pos">POS</TabsTrigger>
          <TabsTrigger value="online">Online Orders</TabsTrigger>
          {hasAppointments && (
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          )}
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pos">
          <POSInterface />
        </TabsContent>

        <TabsContent value="online">
          <OnlineOrdersTab />
        </TabsContent>

        {hasAppointments && (
          <TabsContent value="appointments">
            <AppointmentsTab />
          </TabsContent>
        )}

        <TabsContent value="analytics">
          <SalesAnalytics />
        </TabsContent>
      </Tabs>
    </ContentLayout>
  );
}
```

**Estimado Week 2**: 40-45 horas

---

### Week 3: Scheduling Module - Availability Configuration

#### Objetivos
- Configuración de reglas de disponibilidad
- Business hours para appointments
- Professional-specific availability
- Booking rules (buffer, advance time)

#### Deliverables

**3.1 Availability Rules Component**
```typescript
// scheduling/components/AvailabilityRulesConfig.tsx

export function AvailabilityRulesConfig() {
  const { data: rules, isLoading } = useQuery({
    queryKey: ['availability-rules'],
    queryFn: availabilityApi.getRules,
  });

  const { mutate: updateRules } = useMutation({
    mutationFn: availabilityApi.updateRules,
    onSuccess: () => {
      queryClient.invalidateQueries(['availability-rules']);
      notify.success({ title: 'Availability rules updated' });
    },
  });

  return (
    <Stack direction="column" gap="6">
      <Section title="Business Hours" variant="elevated">
        <Alert status="info" mb="4">
          Define when appointments can be booked
        </Alert>

        <BusinessHoursConfig
          hours={rules?.businessHours}
          onChange={(hours) => updateRules({ businessHours: hours })}
        />
      </Section>

      <Section title="Booking Rules" variant="elevated">
        <Stack direction="column" gap="4">
          <Field label="Minimum advance booking">
            <Input
              type="number"
              value={rules?.minAdvanceHours}
              onChange={(e) =>
                updateRules({ minAdvanceHours: Number(e.target.value) })
              }
              suffix="hours"
            />
            <FieldHelp>
              Customers must book at least this many hours in advance
            </FieldHelp>
          </Field>

          <Field label="Maximum advance booking">
            <Input
              type="number"
              value={rules?.maxAdvanceDays}
              onChange={(e) =>
                updateRules({ maxAdvanceDays: Number(e.target.value) })
              }
              suffix="days"
            />
            <FieldHelp>
              Customers can book up to this many days in advance
            </FieldHelp>
          </Field>

          <Field label="Buffer time between appointments">
            <Input
              type="number"
              value={rules?.bufferMinutes}
              onChange={(e) =>
                updateRules({ bufferMinutes: Number(e.target.value) })
              }
              suffix="minutes"
            />
            <FieldHelp>
              Time gap between consecutive appointments for setup/cleanup
            </FieldHelp>
          </Field>
        </Stack>
      </Section>

      <Section title="Professional Availability" variant="elevated">
        <ProfessionalAvailability
          professionals={professionals}
          onUpdate={handleUpdateProfessionalAvailability}
        />
      </Section>
    </Stack>
  );
}
```

**3.2 Database Schema for Rules**
```sql
-- Availability rules (global)
CREATE TABLE availability_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES business_profiles(id),

  -- Business hours (JSONB)
  business_hours JSONB NOT NULL, -- { monday: { open, close }, ... }

  -- Booking rules
  min_advance_hours INTEGER DEFAULT 2,
  max_advance_days INTEGER DEFAULT 30,
  buffer_minutes INTEGER DEFAULT 15,

  -- Cancellation policy
  cancellation_hours_notice INTEGER DEFAULT 24,
  allow_online_cancellation BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id)
);

-- Professional availability (overrides)
CREATE TABLE professional_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES employees(id),

  -- Weekly schedule (JSONB) - can override business hours
  weekly_schedule JSONB, -- { monday: { open, close }, ... }

  -- Specific date overrides
  date_overrides JSONB, -- { '2025-01-20': 'off', '2025-01-21': { open, close } }

  -- Buffer time (override global)
  buffer_minutes INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(staff_id)
);
```

**3.3 Add Tab to Scheduling Page**
```typescript
// scheduling/page.tsx

export default function SchedulingPage() {
  const hasAppointments = useCapabilityStore((state) =>
    state.hasCapability('appointment_based')
  );

  return (
    <ContentLayout>
      <Tabs defaultValue="shifts">
        <TabsList>
          <TabsTrigger value="shifts">Staff Shifts</TabsTrigger>
          <TabsTrigger value="time-off">Time Off</TabsTrigger>
          {hasAppointments && (
            <TabsTrigger value="availability">Appointment Availability</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="shifts">
          <ShiftsManagement />
        </TabsContent>

        <TabsContent value="time-off">
          <TimeOffManagement />
        </TabsContent>

        {hasAppointments && (
          <TabsContent value="availability">
            <AvailabilityRulesConfig />
          </TabsContent>
        )}
      </Tabs>
    </ContentLayout>
  );
}
```

**Estimado Week 3**: 35-40 horas

---

### Week 4: Staff + Products Configuration

#### Objetivos
- Staff: Professional profiles for appointments
- Products: Service configuration (duration, policies)

#### Deliverables

**4.1 Staff Appointment Settings**
```typescript
// staff/components/StaffFormModal.tsx

<Collapsible
  title="Appointment Settings"
  condition={hasCapability('appointment_based')}
>
  <Stack direction="column" gap="4">
    <Checkbox
      name="accepts_appointments"
      label="Accept appointments"
      description="Allow customers to book appointments with this professional"
    />

    {watch('accepts_appointments') && (
      <>
        <Field label="Services Provided">
          <MultiSelect
            name="services_provided"
            placeholder="Select services..."
            options={servicesOptions}
          />
          <FieldHelp>
            Services this professional can perform
          </FieldHelp>
        </Field>

        <Field label="Buffer time between appointments">
          <Input
            name="booking_buffer_minutes"
            type="number"
            defaultValue={15}
            suffix="minutes"
          />
          <FieldHelp>
            Time needed between appointments (overrides global setting)
          </FieldHelp>
        </Field>

        <Checkbox
          name="allow_online_booking"
          label="Allow online booking"
          description="Customers can book online with this professional"
          defaultChecked
        />

        <Field label="Maximum appointments per day">
          <Input
            name="max_appointments_per_day"
            type="number"
            defaultValue={8}
          />
        </Field>
      </>
    )}
  </Stack>
</Collapsible>
```

**4.2 Service (Product) Appointment Settings**
```typescript
// products/components/ServiceFormModal.tsx
// (Only shown when product type is 'service')

<Section title="Appointment Settings">
  <Stack direction="column" gap="4">
    <Field label="Service Duration" required>
      <Input
        name="duration_minutes"
        type="number"
        placeholder="60"
        suffix="minutes"
      />
      <FieldHelp>
        How long this service takes (including buffer time)
      </FieldHelp>
    </Field>

    <Field label="Preparation Time">
      <Input
        name="preparation_time"
        type="number"
        defaultValue={0}
        suffix="minutes"
      />
      <FieldHelp>
        Time needed before service starts (setup, client consultation)
      </FieldHelp>
    </Field>

    <Checkbox
      name="requires_specific_professional"
      label="Customer must select professional"
      description="Don't allow 'any available' - customer picks specific person"
    />

    <Field label="Cancellation Policy">
      <Select name="cancellation_policy">
        <option value="flexible">Flexible - Cancel anytime</option>
        <option value="24h_notice">24 hours notice required</option>
        <option value="48h_notice">48 hours notice required</option>
        <option value="strict">No cancellations</option>
      </Select>
    </Field>

    <Field label="Online booking">
      <Checkbox
        name="available_for_online_booking"
        label="Allow customers to book online"
        defaultChecked
      />
    </Field>
  </Stack>
</Section>
```

**4.3 Database Schema Updates**
```sql
-- Add to employees table
ALTER TABLE employees
  ADD COLUMN accepts_appointments BOOLEAN DEFAULT false,
  ADD COLUMN services_provided UUID[] DEFAULT '{}',
  ADD COLUMN booking_buffer_minutes INTEGER DEFAULT 15,
  ADD COLUMN allow_online_booking BOOLEAN DEFAULT true,
  ADD COLUMN max_appointments_per_day INTEGER DEFAULT 8;

-- Add to products table (for services)
ALTER TABLE products
  ADD COLUMN duration_minutes INTEGER,
  ADD COLUMN preparation_time INTEGER DEFAULT 0,
  ADD COLUMN requires_specific_professional BOOLEAN DEFAULT false,
  ADD COLUMN cancellation_policy VARCHAR(50) DEFAULT 'flexible',
  ADD COLUMN available_for_online_booking BOOLEAN DEFAULT true;

CREATE INDEX idx_products_bookable ON products(available_for_online_booking)
  WHERE type = 'service';
```

**Estimado Week 4**: 35-40 horas

---

### Week 5: Reminders Service + Testing

#### Objetivos
- Backend reminder service
- Email/SMS notifications
- Integration testing
- End-to-end testing

#### Deliverables

**5.1 Appointment Reminder Service**
```typescript
// src/services/appointmentReminders.ts

import { CronJob } from 'cron';
import { addDays, isBefore, differenceInHours } from 'date-fns';
import { emailService } from './emailService';
import { smsService } from './smsService';
import { eventBus } from '@/lib/events';

interface ReminderRule {
  hours_before: number;
  channels: ('email' | 'sms' | 'push')[];
}

class AppointmentReminderService {
  private job: CronJob;
  private reminderRules: ReminderRule[] = [
    { hours_before: 24, channels: ['email'] },
    { hours_before: 2, channels: ['sms', 'push'] },
  ];

  constructor() {
    // Run every hour
    this.job = new CronJob('0 * * * *', () => this.checkReminders());
    this.job.start();

    console.log('[AppointmentReminders] Service started');
  }

  private async checkReminders() {
    console.log('[AppointmentReminders] Checking for pending reminders...');

    for (const rule of this.reminderRules) {
      await this.sendRemindersForRule(rule);
    }
  }

  private async sendRemindersForRule(rule: ReminderRule) {
    const targetTime = addDays(new Date(), rule.hours_before / 24);

    // Get appointments that:
    // 1. Are scheduled around the target time
    // 2. Haven't been reminded yet for this rule
    // 3. Are confirmed (not cancelled)
    const { data: appointments, error } = await supabase
      .from('sales')
      .select(`
        *,
        customer:customers(*),
        staff:employees(*),
        service:products(*)
      `)
      .eq('order_type', 'APPOINTMENT')
      .eq('order_status', 'CONFIRMED')
      .gte('scheduled_time', targetTime.toISOString())
      .lte('scheduled_time', addHours(targetTime, 1).toISOString())
      .is(`reminder_sent_${rule.hours_before}h`, null);

    if (error) {
      console.error('[AppointmentReminders] Query error:', error);
      return;
    }

    if (appointments.length === 0) {
      console.log(`[AppointmentReminders] No reminders for ${rule.hours_before}h rule`);
      return;
    }

    console.log(
      `[AppointmentReminders] Sending ${appointments.length} reminders (${rule.hours_before}h before)`
    );

    for (const appointment of appointments) {
      await this.sendReminder(appointment, rule);
    }
  }

  private async sendReminder(appointment: Sale, rule: ReminderRule) {
    const { customer, staff, service } = appointment;

    try {
      // Email
      if (rule.channels.includes('email') && customer.email) {
        await emailService.send({
          to: customer.email,
          template: 'appointment_reminder',
          data: {
            customerName: customer.name,
            serviceName: service.name,
            professionalName: staff.name,
            scheduledTime: appointment.scheduled_time,
            duration: service.duration_minutes,
            cancellationLink: `${process.env.APP_URL}/app/appointments/${appointment.id}/cancel`,
            rescheduleLink: `${process.env.APP_URL}/app/appointments/${appointment.id}/reschedule`,
          },
        });
      }

      // SMS
      if (rule.channels.includes('sms') && customer.phone && customer.accepts_sms) {
        await smsService.send({
          to: customer.phone,
          message: `Reminder: ${service.name} ${rule.hours_before === 24 ? 'tomorrow' : 'in 2 hours'} at ${format(
            new Date(appointment.scheduled_time),
            'HH:mm'
          )} with ${staff.name}. Reply CANCEL to cancel.`,
        });
      }

      // Push notification
      if (rule.channels.includes('push') && customer.push_token) {
        await pushService.send({
          token: customer.push_token,
          title: 'Appointment Reminder',
          body: `${service.name} ${rule.hours_before === 24 ? 'tomorrow' : 'soon'} at ${format(
            new Date(appointment.scheduled_time),
            'HH:mm'
          )}`,
          data: {
            type: 'appointment_reminder',
            appointmentId: appointment.id,
          },
        });
      }

      // Mark reminder as sent
      await supabase
        .from('sales')
        .update({
          [`reminder_sent_${rule.hours_before}h`]: new Date().toISOString(),
        })
        .eq('id', appointment.id);

      // EventBus
      eventBus.emit('appointment.reminder.sent', {
        appointmentId: appointment.id,
        customerId: customer.id,
        hoursBefore: rule.hours_before,
        channels: rule.channels,
      });

      console.log(
        `[AppointmentReminders] Sent reminder for appointment ${appointment.id} (${rule.hours_before}h)`
      );
    } catch (error) {
      console.error(
        `[AppointmentReminders] Failed to send reminder for ${appointment.id}:`,
        error
      );
    }
  }

  // Manually trigger reminders (for testing)
  public async sendTestReminder(appointmentId: string) {
    const { data: appointment } = await supabase
      .from('sales')
      .select(`*, customer:customers(*), staff:employees(*), service:products(*)`)
      .eq('id', appointmentId)
      .single();

    if (appointment) {
      await this.sendReminder(appointment, {
        hours_before: 24,
        channels: ['email'],
      });
    }
  }

  public stop() {
    this.job.stop();
    console.log('[AppointmentReminders] Service stopped');
  }
}

export const appointmentReminderService = new AppointmentReminderService();
```

**5.2 Bootstrap Service**
```typescript
// src/services/index.ts

import { appointmentReminderService } from './appointmentReminders';
import { asyncOrderProcessor } from './asyncOrderProcessor';

// Start services on app init
export function bootstrapServices() {
  console.log('[Services] Bootstrapping background services...');

  // Services auto-start in their constructors
  // Just import them to trigger initialization
  appointmentReminderService;
  asyncOrderProcessor;

  console.log('[Services] All services started');
}
```

```typescript
// src/main.tsx or src/App.tsx

import { bootstrapServices } from './services';

// Bootstrap services on app start
bootstrapServices();
```

**5.3 Testing Strategy**

**Unit Tests**
```typescript
// __tests__/appointmentReminders.test.ts

describe('AppointmentReminderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send email reminder 24h before appointment', async () => {
    const tomorrow = addDays(new Date(), 1);
    const appointment = createMockAppointment({ scheduled_time: tomorrow });

    await appointmentReminderService.sendTestReminder(appointment.id);

    expect(emailService.send).toHaveBeenCalledWith(
      expect.objectContaining({
        template: 'appointment_reminder',
      })
    );
  });

  it('should not send reminder if already sent', async () => {
    const appointment = createMockAppointment({
      reminder_sent_24h: new Date().toISOString(),
    });

    await appointmentReminderService.checkReminders();

    expect(emailService.send).not.toHaveBeenCalled();
  });
});
```

**Integration Tests**
```typescript
// __tests__/appointmentFlow.test.ts

describe('Appointment Booking Flow', () => {
  it('should complete full booking flow', async () => {
    // 1. Customer selects service
    const service = await productsApi.getServices()[0];

    // 2. Customer selects professional
    const professional = await staffApi.getProfessionalsForService(service.id)[0];

    // 3. Customer selects time slot
    const slots = await bookingApi.getAvailableSlots(service.id, professional.id);
    const slot = slots[0];

    // 4. Customer confirms booking
    const appointment = await bookingApi.createAppointment({
      service_id: service.id,
      staff_id: professional.id,
      scheduled_time: slot.start_time,
      customer_id: mockCustomer.id,
    });

    // Assertions
    expect(appointment.order_type).toBe('APPOINTMENT');
    expect(appointment.order_status).toBe('CONFIRMED');

    // Verify slot is now booked
    const updatedSlot = await supabase
      .from('appointment_slots')
      .select('*')
      .eq('id', slot.id)
      .single();

    expect(updatedSlot.data.status).toBe('booked');
    expect(updatedSlot.data.appointment_id).toBe(appointment.id);
  });
});
```

**E2E Tests (Playwright)**
```typescript
// e2e/appointments.spec.ts

test('customer can book appointment', async ({ page }) => {
  await page.goto('/app/booking');

  // Select service
  await page.click('text=Haircut');
  await page.click('button:has-text("Continue")');

  // Select professional
  await page.click('text=John Doe');
  await page.click('button:has-text("Continue")');

  // Select date/time
  await page.click('[data-testid="calendar-day-tomorrow"]');
  await page.click('text=10:00 AM');
  await page.click('button:has-text("Continue")');

  // Confirm booking
  await page.fill('[name="notes"]', 'First time customer');
  await page.click('button:has-text("Confirm Booking")');

  // Verify success
  await expect(page.locator('text=Appointment booked!')).toBeVisible();
});
```

**Estimado Week 5**: 45-50 horas

---

### Appointments Summary

**Total Duration**: 5 semanas (200 horas)

**Features Implemented**: 6/6
- ✅ `scheduling_appointment_booking`
- ✅ `scheduling_calendar_management`
- ✅ `scheduling_reminder_system`
- ✅ `scheduling_availability_rules`
- ✅ `customer_online_reservation`
- ✅ `customer_reservation_reminders`

**Módulos Updated**: 5
- ✅ Sales (Appointments tab)
- ✅ Scheduling (Availability config)
- ✅ Staff (Professional settings)
- ✅ Products (Service settings)
- ✅ Customer App (Booking interface)

**Backend Services**: 1
- ✅ appointmentReminderService

---

## 🏢 B2B SALES IMPLEMENTATION

**Duración**: 5 semanas (200 horas)
**Prioridad**: 🟠 MEDIA - Implementar segundo

### Week 1: Sales - Quotes System

#### Database Schema
```sql
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),

  -- Status flow: draft → submitted → approved → converted → expired → rejected
  status VARCHAR(20) DEFAULT 'draft',

  -- Items
  items JSONB NOT NULL,

  -- Pricing
  subtotal NUMERIC(12, 2) NOT NULL,
  tax_amount NUMERIC(12, 2) DEFAULT 0,
  discount_amount NUMERIC(12, 2) DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL,

  -- Validity
  valid_until DATE NOT NULL,

  -- Approval workflow
  requires_approval BOOLEAN DEFAULT false,
  approval_level_required INTEGER DEFAULT 0,
  current_approval_level INTEGER DEFAULT 0,

  -- Conversion
  converted_to_order_id UUID REFERENCES sales(id),
  converted_at TIMESTAMPTZ,

  -- Notes
  notes TEXT,
  terms_and_conditions TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE quote_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id),
  approval_level INTEGER NOT NULL,
  approver_id UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  comments TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quotes_customer ON quotes(customer_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_valid_until ON quotes(valid_until);
```

#### Components
```typescript
// sales/components/QuotesTab.tsx
// sales/components/QuoteFormModal.tsx
// sales/components/QuoteApprovalPipeline.tsx
// sales/components/QuoteViewer.tsx (PDF preview)
```

**Estimado**: 40-45 horas

---

### Week 2: Products - Bulk & Tiered Pricing

#### Database Schema
```sql
CREATE TABLE pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  rule_type VARCHAR(20) NOT NULL, -- 'bulk', 'tiered', 'customer_tier'

  -- Bulk pricing (quantity-based)
  min_quantity INTEGER,
  max_quantity INTEGER,
  discount_type VARCHAR(20), -- 'percentage', 'fixed_amount'
  discount_value NUMERIC(12, 2),

  -- Tiered pricing (customer tier)
  customer_tier VARCHAR(50), -- 'bronze', 'silver', 'gold', 'platinum'

  -- Custom price
  custom_price NUMERIC(12, 2),

  -- Dates
  valid_from DATE,
  valid_until DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pricing_product ON pricing_rules(product_id);
CREATE INDEX idx_pricing_type ON pricing_rules(rule_type);
```

#### Components
```typescript
// products/components/ProductFormModal.tsx
//   ├── BulkPricingSection
//   └── TieredPricingSection

// products/components/PricingRulesManager.tsx
```

**Estimado**: 35-40 horas

---

### Week 3: Finance - Corporate Accounts & Credit

#### Database Schema
```sql
CREATE TABLE corporate_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),

  -- Credit terms
  credit_limit NUMERIC(12, 2) DEFAULT 0,
  credit_used NUMERIC(12, 2) DEFAULT 0,
  payment_terms VARCHAR(50) DEFAULT 'net_30', -- net_30, net_60, net_90, immediate

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, suspended, closed

  -- Billing
  billing_cycle VARCHAR(20) DEFAULT 'monthly', -- weekly, monthly, quarterly
  billing_day INTEGER DEFAULT 1,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(customer_id)
);
```

#### Components
```typescript
// finance/billing/components/CorporateAccountsTab.tsx
// finance/billing/components/CreditLinesManager.tsx
// finance/billing/components/PaymentTermsConfig.tsx
```

**Estimado**: 35-40 horas

---

### Week 4: Settings - Approval Workflows

#### Components
```typescript
// settings/pages/workflows/page.tsx
// settings/components/WorkflowBuilder.tsx
// settings/components/WorkflowsList.tsx
```

**Estimado**: 40-45 horas

---

### Week 5: Integration + Testing

- Quote-to-Order conversion
- Pricing calculation engine
- Approval notifications
- Integration tests
- E2E tests

**Estimado**: 45-50 horas

---

## 🛒 E-COMMERCE IMPLEMENTATION

**Duración**: 10 semanas (400 horas)
**Prioridad**: 🟡 BAJA - Implementar último

### Fases

1. **Weeks 1-2**: Products online catalog settings
2. **Weeks 3-4**: Customer App (cart, checkout, catalog UI)
3. **Weeks 5-6**: Sales online orders management
4. **Week 7**: Finance payment gateway integration
5. **Week 8**: Backend async order processor
6. **Weeks 9-10**: Testing + integration

Ver documento `ARCHITECTURAL_DECISIONS_CORRECTED.md` para specs detalladas.

---

## 🧪 TESTING STRATEGY

### Unit Tests
- Component testing (React Testing Library)
- Service testing (Vitest)
- Coverage target: 70%+

### Integration Tests
- API integration
- Database operations
- EventBus communication

### E2E Tests
- User flows (Playwright)
- Critical paths
- Cross-browser testing

### Performance Tests
- Load testing
- Booking concurrency
- Database query optimization

---

## 🚀 DEPLOYMENT PLAN

### Pre-deployment
- [ ] Feature flags configured
- [ ] Database migrations ready
- [ ] Environment variables set
- [ ] Email templates created
- [ ] SMS provider configured

### Deployment Steps
1. Run database migrations
2. Deploy backend services
3. Deploy frontend
4. Enable feature flags gradually
5. Monitor logs/metrics

### Post-deployment
- [ ] Smoke tests
- [ ] Monitor error rates
- [ ] Check background jobs
- [ ] Verify reminders working

---

## 📊 SUCCESS METRICS

### Appointments
- Booking conversion rate
- Cancellation rate
- No-show rate
- Reminder effectiveness

### B2B
- Quote-to-order conversion
- Average deal size
- Approval time
- Credit utilization

### E-commerce
- Cart abandonment rate
- Online order volume
- Payment success rate
- Async processing latency

---

## 📚 REFERENCES

- `ARCHITECTURAL_DECISIONS_CORRECTED.md` - Decisiones arquitectónicas
- `FEATURE_TO_MODULE_MAPPING.md` - Mapeo features → módulos
- `CLAUDE.md` - Design system y patterns
- `FeatureRegistry.ts` - Features registry

---

**FIN DEL ROADMAP**

Este documento provee todo lo necesario para implementar las 20 features distribuidas correctamente por función.

**Próxima sesión**: Comenzar con Appointments Week 1
