# 🏗️ DECISIONES ARQUITECTÓNICAS CORREGIDAS
## Aplicando "Features por FUNCIÓN, NO por Capability"

**Fecha**: 2025-01-15
**Estado**: ✅ ANÁLISIS COMPLETO
**Principio aplicado**: Features se organizan por su **función real** en el sistema, no por la capability que las activa

---

## 🎯 PRINCIPIO FUNDAMENTAL

### ❌ INCORRECTO (Enfoque por Capability)
```
capability: async_operations
  → Crear módulo /admin/ecommerce
  → Agrupar TODO lo relacionado con async

Problema: Mezcla funciones muy diferentes
- Cart management (UI de venta)
- Catalog online (gestión de productos)
- Payment gateway (procesamiento de pagos)
- Async processing (backend scheduling)
```

### ✅ CORRECTO (Enfoque por Función)
```
Analizar cada feature individualmente:
- ¿Cuál es su FUNCIÓN real en el sistema?
- ¿Dónde está la lógica principal?
- ¿Qué módulo maneja naturalmente esta operación?

Resultado: Features distribuidas por función
- Cart/Checkout → Sales (función: venta)
- Catalog → Products (función: gestión de productos)
- Payment Gateway → Finance (función: procesamiento financiero)
- Async Processing → Backend service (función: scheduling)
```

---

## 📊 CASO 1: E-COMMERCE / ASYNC OPERATIONS

### Features Identificadas (6 features)

| Feature ID | Nombre | Domain | Función Real |
|------------|--------|--------|--------------|
| `sales_catalog_ecommerce` | Catálogo E-commerce | SALES | Gestión de productos online |
| `sales_async_order_processing` | Procesamiento Asincrónico | SALES | Backend scheduling |
| `sales_online_payment_gateway` | Gateway de Pagos Online | SALES | Procesamiento de pagos |
| `sales_cart_management` | Gestión de Carrito | SALES | Carrito de compras |
| `sales_checkout_process` | Proceso de Checkout | SALES | Flujo de compra |
| `sales_multicatalog_management` | Gestión Multi-Catálogo | SALES | Catálogos múltiples |

### Análisis por Función

#### Feature 1: `sales_catalog_ecommerce`
**Función real**: Catálogo de productos con features web-specific (SEO, reviews, image galleries)

**Dónde vive**:
- ❌ **NO** en Sales (Sales vende, no gestiona catálogo)
- ✅ **SÍ** en Products/Catalog (`/admin/supply-chain/products`)

**Razón**:
- Products maneja todo el catálogo (gastronómicos, retail, services)
- E-commerce catalog es solo una "vista" diferente del mismo catálogo
- Función: **Gestión de productos**, no venta

**Implementación**:
```typescript
// products/components/ProductFormModal.tsx
<Field label="E-commerce Settings" condition={hasCapability('async_operations')}>
  <Checkbox name="available_online">Available in Online Store</Checkbox>
  <Input name="seo_title" label="SEO Title" />
  <Input name="seo_description" label="Meta Description" />
  <ImageGallery name="online_images" maxFiles={10} />
  <RichTextEditor name="product_description_long" />
</Field>
```

---

#### Feature 2: `sales_cart_management` + `sales_checkout_process`
**Función real**: Flujo de venta online (UI de compra)

**Dónde vive**:
- ✅ **SÍ** en Sales (`/admin/operations/sales`)
- Razón: Cart/Checkout son **interfaces de venta**, igual que POS

**Pero NO como "E-commerce Module" separado**:
- ❌ NO crear `/admin/ecommerce`
- ✅ SÍ crear componentes dentro de Sales

**Implementación**:
```typescript
// sales/components/OnlineOrders/
├── OnlineOrdersList.tsx          // Vista de órdenes online
├── CartSimulator.tsx              // Simular cart de cliente (admin view)
├── OnlinePaymentStatus.tsx        // Estado de pagos online
└── AsyncOrdersQueue.tsx           // Cola de procesamiento

// sales/page.tsx
<Tabs>
  <Tab value="pos">POS</Tab>
  <Tab value="online" condition={hasCapability('async_operations')}>
    Online Orders
  </Tab>
  <Tab value="analytics">Analytics</Tab>
</Tabs>
```

**Vista de usuario (Customer App)**:
```typescript
// src/pages/app/shop/
├── ProductCatalog.tsx
├── ShoppingCart.tsx
├── Checkout.tsx
└── OrderTracking.tsx
```

**Separación clara**:
- **Admin Sales** = Ver órdenes online, gestionar pagos, cancelar
- **Customer App** = Hacer compras (cart, checkout, pago)

---

#### Feature 3: `sales_online_payment_gateway`
**Función real**: Procesamiento de pagos digitales (Mercado Pago, Stripe)

**Dónde vive**:
- ❌ **NO** en Sales (Sales registra venta, no procesa pagos)
- ✅ **SÍ** en Finance > Payment Integrations (`/admin/finance/payment-integrations`)

**Razón**:
- Finance maneja TODO lo relacionado con dinero (billing, fiscal, payments)
- Payment gateway es **configuración financiera**, no operación de venta
- Same place donde están: AFIP, invoicing, payment methods

**Implementación**:
```typescript
// finance/payment-integrations/page.tsx
<Section title="Payment Gateways">
  <PaymentGatewayCard
    provider="mercadopago"
    status={mpConfig.status}
    onConfigure={openMPConfig}
  />
  <PaymentGatewayCard
    provider="stripe"
    status={stripeConfig.status}
    onConfigure={openStripeConfig}
  />
  <PaymentGatewayCard
    provider="paypal"
    status="inactive"
    onConfigure={openPayPalConfig}
  />
</Section>

// finance/payment-integrations/components/
├── MercadoPagoConfig.tsx
├── StripeConfig.tsx
├── PayPalConfig.tsx
└── WebhooksManager.tsx
```

**Sales usa el gateway configurado**:
```typescript
// sales/services/paymentService.ts
import { paymentGatewayApi } from '@/pages/admin/finance/payment-integrations/services';

async function processOnlinePayment(orderId: string, amount: number) {
  const gateway = await paymentGatewayApi.getActiveGateway();

  if (gateway.provider === 'mercadopago') {
    return await mercadopagoService.createPayment(orderId, amount);
  }
  // ...
}
```

---

#### Feature 4: `sales_async_order_processing`
**Función real**: Procesar pedidos fuera de horario (scheduling backend)

**Dónde vive**:
- ❌ **NO** en Sales UI (es lógica de backend, no UI)
- ✅ **SÍ** en Backend Service (`src/services/asyncOrderProcessor.ts`)

**Razón**:
- No tiene UI dedicada (es background job)
- Es un servicio que corre automáticamente
- EventBus-driven

**Implementación**:
```typescript
// src/services/asyncOrderProcessor.ts
class AsyncOrderProcessor {
  constructor() {
    // Listen to order events
    eventBus.on('sales.order.created', this.handleNewOrder);
  }

  private async handleNewOrder(event: OrderCreatedEvent) {
    const order = event.order;

    // Check if order is async (outside business hours)
    if (order.order_type === 'ASYNC' || this.isOutsideBusinessHours()) {
      // Queue for processing
      await this.queueOrder(order);

      // Notify customer
      await notificationService.send({
        to: order.customer_id,
        type: 'order_queued',
        data: { orderId: order.id, estimatedProcessing: '9:00 AM' }
      });
    } else {
      // Process immediately
      await this.processOrder(order);
    }
  }

  private async queueOrder(order: Sale) {
    await supabase.from('order_queue').insert({
      order_id: order.id,
      scheduled_for: this.getNextBusinessHourStart(),
      status: 'queued'
    });
  }
}

// Bootstrap on app start
export const asyncOrderProcessor = new AsyncOrderProcessor();
```

**Monitoring UI** (opcional):
```typescript
// sales/components/AsyncOrdersQueue.tsx
export function AsyncOrdersQueue() {
  const { data: queuedOrders } = useQuery({
    queryKey: ['order-queue'],
    queryFn: () => supabase.from('order_queue').select('*').eq('status', 'queued')
  });

  return (
    <Section title="Queued Orders">
      <Alert status="info">
        {queuedOrders.length} orders queued for processing at 9:00 AM
      </Alert>
      <Table data={queuedOrders} />
    </Section>
  );
}
```

---

#### Feature 5: `sales_multicatalog_management`
**Función real**: Gestionar catálogos separados (online vs onsite)

**Dónde vive**:
- ✅ **SÍ** en Products/Catalog (`/admin/supply-chain/products`)

**Razón**:
- Gestión de catálogo = función de Products module
- Online catalog vs Onsite catalog = configuración del producto

**Implementación**:
```typescript
// products/types.ts
export interface Product {
  id: string;
  name: string;
  // ...

  // 🆕 Catalog availability
  available_onsite: boolean;        // Show in POS
  available_online: boolean;        // Show in e-commerce
  online_only: boolean;             // Exclusive to online
  onsite_only: boolean;             // Exclusive to onsite

  // Online-specific data (only if available_online = true)
  online_name?: string;             // Different name for web
  online_description?: string;      // Long description for web
  online_images?: string[];         // Image gallery
  seo_title?: string;
  seo_description?: string;
}
```

```typescript
// products/components/ProductFormModal.tsx
<Section title="Availability">
  <Stack direction="row" gap="4">
    <Checkbox
      name="available_onsite"
      label="Available in Store (POS)"
      defaultChecked={true}
    />
    <Checkbox
      name="available_online"
      label="Available Online (E-commerce)"
      disabled={!hasCapability('async_operations')}
    />
  </Stack>

  {watch('available_online') && (
    <Collapsible>
      <Section title="Online Settings">
        <Input name="online_name" label="Online Display Name" />
        <RichTextEditor name="online_description" />
        <ImageGallery name="online_images" />
        {/* SEO fields */}
      </Section>
    </Collapsible>
  )}
</Section>
```

---

### ✅ DECISIÓN FINAL: E-COMMERCE

**NO crear módulo `/admin/ecommerce`**

**Distribuir features por función**:

1. **Catalog Management** → Products Module
   - `sales_catalog_ecommerce` → Products
   - `sales_multicatalog_management` → Products
   - Implementación: Product form con online settings section

2. **Order Management** → Sales Module
   - `sales_cart_management` → Sales (admin view de carts)
   - `sales_checkout_process` → Customer App (no admin)
   - Implementación: "Online Orders" tab en Sales

3. **Payment Processing** → Finance Module
   - `sales_online_payment_gateway` → Finance > Payment Integrations
   - Implementación: Gateway config en Finance

4. **Async Processing** → Backend Service
   - `sales_async_order_processing` → Service layer
   - Implementación: Background job + EventBus
   - Monitoring: AsyncOrdersQueue component en Sales

---

## 📅 CASO 2: APPOINTMENTS / APPOINTMENT-BASED SERVICES

### Features Identificadas (6 features)

| Feature ID | Nombre | Domain | Función Real |
|------------|--------|--------|--------------|
| `scheduling_appointment_booking` | Reserva de Citas | SCHEDULING | Agendar citas |
| `scheduling_calendar_management` | Gestión de Calendario | SCHEDULING | Calendario |
| `scheduling_reminder_system` | Sistema de Recordatorios | SCHEDULING | Notificaciones |
| `scheduling_availability_rules` | Reglas de Disponibilidad | SCHEDULING | Config de horarios |
| `customer_online_reservation` | Reservas Online | CUSTOMER | Portal web |
| `customer_reservation_reminders` | Recordatorios de Reserva | CUSTOMER | Notificaciones |

### Confusión Detectada

**Problema**: "Scheduling" actualmente = Staff Shifts, NO appointments de clientes

```typescript
// Current: src/pages/admin/resources/scheduling/
└── Staff shift scheduling (empleados)
    - Turnos de trabajo
    - Time-off requests
    - Labor scheduling
```

**GAP**: Appointments de clientes NO tienen módulo

---

### Análisis: ¿Appointments es módulo separado?

#### Pregunta: ¿Qué es un "Appointment"?

**Definición**: Reserva de tiempo con un profesional para un servicio

**Casos de uso**:
- Peluquería: Cita con estilista para corte de pelo
- Barbería: Cita para afeitado + corte
- Spa: Cita para masaje
- Clínica: Cita con doctor
- Taller mecánico: Cita para service
- Veterinaria: Cita para consulta

**Características**:
- Cliente selecciona servicio
- Cliente selecciona profesional (opcional)
- Cliente selecciona fecha/hora
- Sistema valida disponibilidad
- Sistema envía confirmación + recordatorios

---

#### Opción A: Appointments como módulo independiente ❌

```
/admin/operations/appointments
├── Calendar view
├── Booking form
├── Service selection
├── Professional assignment
└── Reminders config
```

**Problemas**:
1. Duplica funcionalidad de Scheduling (calendario)
2. Duplica funcionalidad de Sales (crear orden)
3. Duplica funcionalidad de Staff (asignar profesional)
4. Fragmentación: appointment data separado de sales/orders

---

#### Opción B: Appointments distribuido por función ✅

**Análisis de funciones**:

| Función | Dónde vive | Razón |
|---------|------------|-------|
| **Booking UI** | Customer App | Clientes hacen reservas |
| **Calendar Management** | Scheduling Module | Ya existe calendario |
| **Service Selection** | Products/Services | Ya existe catálogo |
| **Professional Assignment** | Staff Module | Staff maneja profesionales |
| **Order Creation** | Sales Module | Appointment → Sale |
| **Reminders** | Notification System | EventBus service |

---

### ✅ DECISIÓN FINAL: APPOINTMENTS

**NO crear módulo `/admin/appointments`**

**Distribuir features por función**:

#### 1. Customer App: Booking Interface
```typescript
// src/pages/app/booking/
├── ServiceSelection.tsx       // Browse available services
├── ProfessionalSelection.tsx  // Choose professional (optional)
├── CalendarPicker.tsx         // Select date/time
├── BookingConfirmation.tsx    // Review + confirm
└── BookingHistory.tsx         // Customer's past appointments

// Flow:
Customer → Selects Service → Selects Professional → Picks Time → Confirms
  ↓
Creates Sale with:
  - order_type: 'APPOINTMENT'
  - scheduled_time: selected datetime
  - assigned_staff_id: selected professional
  - service_id: selected service
```

#### 2. Sales Module: Appointment Orders Management
```typescript
// sales/components/AppointmentsTab.tsx
export function AppointmentsTab() {
  const { data: appointments } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => salesApi.getOrders({ order_type: 'APPOINTMENT' })
  });

  return (
    <Section title="Appointments">
      <AppointmentsCalendarView
        appointments={appointments}
        onReschedule={handleReschedule}
        onCancel={handleCancel}
        onComplete={handleComplete}
      />

      <AppointmentsTable
        data={appointments}
        columns={['customer', 'service', 'professional', 'scheduled_time', 'status']}
      />
    </Section>
  );
}
```

```typescript
// sales/page.tsx
<Tabs>
  <Tab value="pos">POS</Tab>
  <Tab value="online">Online Orders</Tab>
  <Tab value="appointments" condition={hasCapability('appointment_based')}>
    Appointments
  </Tab>
  <Tab value="analytics">Analytics</Tab>
</Tabs>
```

#### 3. Scheduling Module: Availability Configuration
```typescript
// scheduling/components/AvailabilityRulesConfig.tsx
export function AvailabilityRulesConfig() {
  const { data: rules } = useQuery({
    queryKey: ['availability-rules'],
    queryFn: availabilityApi.getRules
  });

  return (
    <Section title="Appointment Availability">
      <Alert status="info">
        Configure when appointments can be booked
      </Alert>

      <Stack direction="column" gap="4">
        {/* Business hours */}
        <BusinessHoursConfig rules={rules.businessHours} />

        {/* Professional-specific availability */}
        <ProfessionalAvailability staff={professionals} />

        {/* Booking rules */}
        <BookingRulesConfig
          minAdvanceBooking={rules.minAdvanceBooking}
          maxAdvanceBooking={rules.maxAdvanceBooking}
          bufferTime={rules.bufferTime}
        />
      </Stack>
    </Section>
  );
}
```

```typescript
// scheduling/page.tsx (existing)
<Tabs>
  <Tab value="shifts">Staff Shifts</Tab>
  <Tab value="time-off">Time Off</Tab>
  <Tab value="availability" condition={hasCapability('appointment_based')}>
    Appointment Availability
  </Tab>
</Tabs>
```

#### 4. Staff Module: Professional Profiles
```typescript
// staff/components/StaffFormModal.tsx
<Section title="Appointment Settings" condition={hasCapability('appointment_based')}>
  <Checkbox
    name="accepts_appointments"
    label="Accept appointments"
  />

  {watch('accepts_appointments') && (
    <Stack direction="column" gap="3">
      <MultiSelect
        name="services_provided"
        label="Services Provided"
        options={servicesOptions}
      />

      <Input
        name="booking_buffer_minutes"
        label="Buffer time between appointments (minutes)"
        type="number"
        defaultValue={15}
      />

      <Checkbox
        name="allow_online_booking"
        label="Allow customers to book online"
        defaultChecked={true}
      />
    </Stack>
  )}
</Section>
```

#### 5. Products Module: Service Configuration
```typescript
// products/components/ServiceFormModal.tsx (for service-type products)
<Section title="Appointment Settings">
  <Input
    name="duration_minutes"
    label="Service Duration (minutes)"
    type="number"
    required
  />

  <Input
    name="preparation_time"
    label="Preparation Time (minutes)"
    type="number"
    defaultValue={0}
  />

  <Checkbox
    name="requires_specific_professional"
    label="Customer must select professional"
  />

  <Select
    name="cancellation_policy"
    label="Cancellation Policy"
    options={['flexible', '24h_notice', '48h_notice', 'strict']}
  />
</Section>
```

#### 6. Notification Service: Reminders (Backend)
```typescript
// src/services/appointmentReminders.ts
class AppointmentReminderService {
  constructor() {
    // Run daily check
    this.scheduleDaily();
  }

  private async checkUpcomingAppointments() {
    const tomorrow = addDays(new Date(), 1);

    const appointments = await salesApi.getOrders({
      order_type: 'APPOINTMENT',
      scheduled_time: tomorrow,
      status: 'CONFIRMED'
    });

    for (const appointment of appointments) {
      await this.sendReminder(appointment);
    }
  }

  private async sendReminder(appointment: Sale) {
    const customer = appointment.customer;
    const professional = appointment.assigned_staff;

    // Email
    await emailService.send({
      to: customer.email,
      template: 'appointment_reminder',
      data: {
        customerName: customer.name,
        serviceName: appointment.service.name,
        professionalName: professional.name,
        scheduledTime: appointment.scheduled_time,
        cancellationLink: `/app/appointments/${appointment.id}/cancel`
      }
    });

    // SMS (optional)
    if (customer.phone && customer.accepts_sms) {
      await smsService.send({
        to: customer.phone,
        message: `Reminder: ${appointment.service.name} tomorrow at ${format(appointment.scheduled_time, 'HH:mm')} with ${professional.name}`
      });
    }

    // EventBus
    eventBus.emit('appointment.reminder.sent', {
      appointmentId: appointment.id,
      customerId: customer.id
    });
  }
}

export const appointmentReminderService = new AppointmentReminderService();
```

---

### Resumen: Appointments Distribuido

| Feature | Módulo | Componente |
|---------|--------|-----------|
| Booking UI | Customer App | `/app/booking/*` |
| Appointments Management | Sales | `AppointmentsTab.tsx` |
| Availability Rules | Scheduling | `AvailabilityRulesConfig.tsx` |
| Professional Config | Staff | `StaffFormModal` (appointment section) |
| Service Config | Products | `ServiceFormModal` (appointment section) |
| Reminders | Backend Service | `appointmentReminderService.ts` |

**Ventajas**:
- ✅ DRY: No duplica calendario, staff, services
- ✅ Coherente: Appointment es tipo de Sale
- ✅ Mantenible: Lógica en lugares naturales
- ✅ Escalable: Fácil agregar nuevas features

---

## 🏢 CASO 3: B2B / CORPORATE SALES

### Features Identificadas (8 features)

| Feature ID | Nombre | Domain | Función Real |
|------------|--------|--------|--------------|
| `sales_bulk_pricing` | Precios por Volumen | SALES | Pricing rules |
| `sales_quote_generation` | Generación de Cotizaciones | SALES | Quotes |
| `sales_contract_management` | Gestión de Contratos | SALES | Contracts |
| `sales_tiered_pricing` | Precios Diferenciados | SALES | Pricing tiers |
| `sales_approval_workflows` | Flujos de Aprobación | SALES | Approval pipeline |
| `sales_quote_to_order` | Cotización a Orden | SALES | Quote → Order |
| `finance_corporate_accounts` | Cuentas Corporativas | FINANCE | Account mgmt |
| `finance_credit_management` | Gestión de Crédito | FINANCE | Credit lines |

### Análisis: Usuario ya había decidido correctamente

En `CONTINUITY_PROMPT.md`:

> **B2B Sales - NO módulo monolítico**, distribuir features en Sales, Customers, Finance, Products

### ✅ DECISIÓN CONFIRMADA: B2B Distribuido

**NO crear módulo `/admin/b2b`**

**Distribuir features por función**:

#### 1. Sales Module: Quotes & Orders
```typescript
// sales/components/QuotesTab.tsx
export function QuotesTab() {
  return (
    <Section title="B2B Quotes">
      <QuotesList />
      <QuoteFormModal />
      <QuoteApprovalPipeline />
    </Section>
  );
}

// sales/page.tsx
<Tabs>
  <Tab value="pos">POS</Tab>
  <Tab value="quotes" condition={hasCapability('corporate_sales')}>
    Quotes
  </Tab>
  <Tab value="contracts" condition={hasCapability('corporate_sales')}>
    Contracts
  </Tab>
</Tabs>
```

#### 2. Products Module: Bulk & Tiered Pricing
```typescript
// products/components/ProductFormModal.tsx
<Section title="B2B Pricing" condition={hasCapability('corporate_sales')}>
  <BulkPricingRules
    rules={product.bulk_pricing}
    onUpdate={handleBulkPricingUpdate}
  />

  <TieredPricingConfig
    tiers={product.pricing_tiers}
    onUpdate={handleTiersUpdate}
  />
</Section>
```

#### 3. Finance Module: Corporate Accounts & Credit
```typescript
// finance/billing/components/CorporateAccountsTab.tsx
export function CorporateAccountsTab() {
  return (
    <Section title="Corporate Accounts">
      <CorporateAccountsList />
      <CreditLinesManager />
      <PaymentTermsConfig />
    </Section>
  );
}
```

#### 4. Customers Module: Corporate Customer Data
```typescript
// customers/components/CustomerFormModal.tsx
<Section title="Corporate Info" condition={customer.is_corporate}>
  <Input name="tax_id" label="Tax ID / CUIT" />
  <Input name="business_name" label="Business Name" />
  <Select name="customer_tier" label="Customer Tier" />
  <Input name="credit_limit" label="Credit Limit" type="number" />
  <Select name="payment_terms" label="Payment Terms" />
</Section>
```

#### 5. Settings Module: Approval Workflows
```typescript
// settings/pages/workflows/page.tsx
export function WorkflowsPage() {
  return (
    <ContentLayout>
      <Section title="Approval Workflows">
        <ApprovalWorkflowBuilder
          workflows={workflows}
          onCreate={handleCreateWorkflow}
        />

        <WorkflowsList
          workflows={workflows}
          onEdit={handleEditWorkflow}
        />
      </Section>
    </ContentLayout>
  );
}
```

---

## 📋 RESUMEN DE DECISIONES

### E-commerce / Async Operations

| Feature | Ubicación | Razón |
|---------|-----------|-------|
| Catalog Management | Products Module | Gestión de productos |
| Cart/Checkout Admin View | Sales Module (Online Orders tab) | Gestión de ventas |
| Payment Gateway Config | Finance Module | Procesamiento financiero |
| Async Processing | Backend Service | Background job |
| Customer Cart/Checkout UI | Customer App | Frontend de clientes |

**Módulos afectados**: 4 (Products, Sales, Finance, Customer App)

---

### Appointments / Appointment-Based

| Feature | Ubicación | Razón |
|---------|-----------|-------|
| Booking UI | Customer App | Frontend de clientes |
| Appointments Management | Sales Module (Appointments tab) | Gestión de órdenes |
| Availability Rules | Scheduling Module | Configuración de calendario |
| Professional Config | Staff Module | Configuración de empleados |
| Service Config | Products Module | Configuración de servicios |
| Reminders | Backend Service | Notificaciones automáticas |

**Módulos afectados**: 5 (Sales, Scheduling, Staff, Products, Customer App)

---

### B2B / Corporate Sales

| Feature | Ubicación | Razón |
|---------|-----------|-------|
| Quotes & Contracts | Sales Module | Gestión de ventas B2B |
| Bulk/Tiered Pricing | Products Module | Configuración de productos |
| Corporate Accounts | Finance Module | Cuentas corporativas |
| Credit Management | Finance Module | Líneas de crédito |
| Corporate Customer Data | Customers Module | Datos de clientes B2B |
| Approval Workflows | Settings Module | Configuración de workflows |

**Módulos afectados**: 4 (Sales, Products, Finance, Customers, Settings)

---

## 🎓 LECCIONES APRENDIDAS

### Patrón Identificado: Capabilities NO dictan arquitectura

**Correcto**:
```
Capability = Feature flag (activa/desactiva funcionalidad)
Module = Contenedor por FUNCIÓN (agrupa features relacionadas)

E-commerce capability activa:
  - Products: online catalog fields
  - Sales: online orders tab
  - Finance: payment gateway
  - Backend: async processor
```

**Incorrecto**:
```
Capability = Module

E-commerce capability activa:
  - /admin/ecommerce module (monolith)
    - Catalog ❌ (es función de Products)
    - Payments ❌ (es función de Finance)
    - Cart ✅ (podría estar aquí)
    - Orders ❌ (es función de Sales)
```

---

### Cómo Decidir Ubicación de Features

**Pregunta 1**: ¿Cuál es la función real?
- Ejemplo: `sales_online_payment_gateway`
- Función: Configurar pasarelas de pago
- Respuesta: Finance (gestión financiera)

**Pregunta 2**: ¿Qué módulo maneja naturalmente esta operación?
- Ejemplo: `scheduling_appointment_booking`
- Operación: Crear orden programada para un servicio
- Respuesta: Sales (crear orden) + Customer App (UI booking)

**Pregunta 3**: ¿Dónde está la entidad principal en DB?
- Ejemplo: `sales_cart_management`
- Entidad: `carts` table
- Respuesta: Sales (manage orders) + Customer App (UI)

**Pregunta 4**: ¿Hay módulo existente que haga algo similar?
- Ejemplo: `scheduling_availability_rules`
- Similar: Staff shift availability
- Respuesta: Scheduling (ya tiene calendario + availability logic)

---

## 🚀 IMPLEMENTACIÓN RECOMENDADA

### Prioridad 1: Appointments (Más simple)
1. Week 1: Customer App booking UI
2. Week 2: Sales appointments tab
3. Week 3: Scheduling availability config
4. Week 4: Staff + Products appointment settings
5. Week 5: Reminders service + testing

**Estimado**: 5 semanas

---

### Prioridad 2: B2B (Ya parcialmente decidido)
1. Week 1: Sales quotes tab + quote form
2. Week 2: Products bulk/tiered pricing
3. Week 3: Finance corporate accounts
4. Week 4: Settings approval workflows
5. Week 5: Quote-to-order flow + testing

**Estimado**: 5 semanas

---

### Prioridad 3: E-commerce (Más complejo)
1. Week 1-2: Products online catalog settings
2. Week 3-4: Customer App (cart, checkout, catalog)
3. Week 5-6: Sales online orders tab
4. Week 7: Finance payment gateway
5. Week 8: Backend async processor
6. Week 9-10: Testing + integration

**Estimado**: 10 semanas

---

## ✅ PRÓXIMOS PASOS

1. **Actualizar SALES_ARCHITECTURE_DECISION.md**
   - Eliminar propuesta de tabs por capability
   - Documentar distribución correcta

2. **Actualizar CONTINUITY_PROMPT.md**
   - Marcar decisiones como RESUELTAS
   - Agregar links a este documento

3. **Actualizar FEATURE_TO_MODULE_MAPPING.md**
   - Actualizar ubicación de features
   - Reflejar decisiones de este documento

4. **Crear plan de implementación**
   - Seleccionar prioridad (Appointments, B2B, o E-commerce)
   - Crear roadmap detallado

---

**FIN DEL DOCUMENTO**

Este documento resuelve:
- ✅ E-commerce/Async Operations → Distribuido (4 módulos)
- ✅ Appointments → Distribuido (5 módulos)
- ✅ B2B/Corporate Sales → Distribuido (5 módulos)

Total features distribuidas: **20 features** correctamente ubicadas por función.
