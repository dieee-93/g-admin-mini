# PROMPT: Implementación del Ecosistema Completo de Pagos - G-Admin Mini

**Fecha**: 2025-12-29
**Contexto**: Post-implementación de Opción B (sale_payments como Single Source of Truth)
**Objetivo**: Implementar TODO el ecosistema de procesamiento de pagos (UI, integraciones, configuración)

---

## 🎯 CONTEXTO: LO QUE YA ESTÁ IMPLEMENTADO

### ✅ BASE DE DATOS (100% Completado)
- **Migraciones SQL aplicadas en producción**:
  - `improve_sale_payments_schema_v2`: Enums, columnas, índices, vistas
  - `create_payment_triggers_v2`: 6 triggers automáticos funcionando
- **Arquitectura**: sale_payments como Single Source of Truth
- **Features**:
  - ✅ State machine (11 estados: INITIATED → AUTHORIZED → SETTLED, etc.)
  - ✅ Idempotencia (prevención de duplicados)
  - ✅ Linked transactions (refunds vía parent_payment_id)
  - ✅ Denormalización automática (triggers actualizan caches)
  - ✅ Audit trail inmutable (status_history)

### ✅ BACKEND HANDLERS (100% Completado)
- **salesPaymentHandler.ts**: Completamente refactorizado
  - ✅ Idempotencia check (líneas 102-126)
  - ✅ Crea registros en sale_payments con todos los campos (líneas 267-300)
  - ✅ Refunds con linked transactions (líneas 420-607)
  - ✅ Soporte para CASH, CARD, TRANSFER, QR

### ✅ TYPESCRIPT TYPES (100% Completado)
- Types regenerados desde Supabase
- Enums disponibles: `payment_status`, `payment_transaction_type`

---

## ❌ LO QUE FALTA: ECOSISTEMA COMPLETO DE PAGOS

Esta es la **MISSION** de esta sesión: implementar TODA la capa de aplicación para procesar pagos.

---

## 📋 FASE 1: INVESTIGACIÓN Y ARQUITECTURA

### A. Contextos de Pago a Soportar

#### 1. **POS (Point of Sale) - Staff/Admin**
- **Usuarios**: Empleados, cajeros, administradores
- **Ubicación**: Local físico / Restaurant / Retail
- **Dispositivos**:
  - Terminal de POS (touch screen)
  - POSNET para tarjetas
  - QR code display
  - Cash drawer
- **Flujos**:
  - Payment en persona (card present)
  - Cash inmediato
  - Split tender (pago combinado)
  - Propinas
  - Descuentos/promociones

#### 2. **E-Commerce - Cliente Final**
- **Usuarios**: Clientes comprando online
- **Ubicación**: Web app / Mobile app
- **Dispositivos**: Desktop, mobile, tablet
- **Flujos**:
  - Card not present (CNP)
  - Redirect a pasarela (Mercado Pago, etc.)
  - Wallet digital (Apple Pay, Google Pay)
  - QR estático/dinámico
  - Link de pago

#### 3. **Self-Service Kiosk / QR Menu**
- **Usuarios**: Clientes en local pero auto-servicio
- **Ubicación**: Restaurant, cafe, retail
- **Dispositivos**: Tablet, smartphone del cliente
- **Flujos**:
  - Scan QR → ver menú → pagar
  - Híbrido: presencial + digital

### B. Arquitecturas Investigadas

#### 🇦🇷 **Mercado Pago (Argentina - PRIORITARIO)**

**Docs**: [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/en/docs/checkout-api/overview)

**Opciones de Integración**:

1. **Checkout Pro** (Redirect):
   - Mercado Pago hostea el checkout completo
   - Cliente redirigido a página de Mercado Pago
   - Retorna a tu app después del pago
   - ✅ Más simple, menos código
   - ❌ Cliente sale de tu sitio

2. **Checkout API** (In-site):
   - Checkout completo en tu sitio
   - Tokenización de tarjetas
   - Experiencia seamless
   - ✅ Cliente nunca sale de tu app
   - ❌ Más complejo, requiere PCI compliance

3. **QR Code**:
   - QR estático (mismo QR para todo)
   - QR dinámico (QR único por transacción)
   - Interoperable con todas las wallets argentinas

**Payment Methods Soportados**:
- Credit/Debit cards
- Mercado Pago Wallet
- Rapipago (cash)
- Pago Fácil (cash)
- Installments without card

**API Flow**:
```typescript
// 1. Crear preferencia de pago
POST /checkout/preferences
{
  items: [{ title, quantity, unit_price }],
  back_urls: { success, failure, pending },
  notification_url: "https://myapp.com/webhooks/mercadopago"
}

// 2. Recibir init_point (URL de checkout)
// 3. Redirigir cliente a init_point
// 4. Webhook notifica resultado
POST /webhooks/mercadopago
{
  type: "payment",
  data: { id: "payment_id" }
}

// 5. Verificar pago
GET /v1/payments/{payment_id}
```

**Fuente**: [Mercado Pago Checkout API](https://www.mercadopago.com.ar/developers/en/docs/checkout-api/overview)

---

#### 🇦🇷 **POSNET + QR Interoperable (Argentina)**

**Docs**: [POSNET QR Integration](https://newsroom.fiserv.com/news-releases/news-release-details/argentinian-consumers-can-quickly-and-conveniently-make/)

**Características**:
- Terminal POSNET muestra QR code
- Interoperable con CUALQUIER wallet argentina
- Arquitectura abierta
- Flujo: Terminal → Coelsa → Bank → Confirmation

**QR Interoperable**:
- Estándar regulatorio argentino
- TODOS los payment providers deben soportarlo
- Cliente escanea con cualquier app bancaria
- Transferencia instantánea (Transferencias 3.0)
- Irrevocable, 24/7

**Implementación**:
```typescript
// Dynamic QR (via POS terminal API)
POST /pos/terminal/generate-qr
{
  amount: 100.00,
  description: "Order #123",
  tax_info: { ... }
}

// Response: QR code image/data
// Display en terminal
// Cliente escanea
// Webhook confirma pago
```

**Fuente**:
- [POSNET QR Launch](https://newsroom.fiserv.com/news-releases/news-release-details/argentinian-consumers-can-quickly-and-conveniently-make/)
- [QR Interoperable Standard](https://docs.cdpi.dev/technical-notes/digital-payment-networks/interoperable-qr-code)

---

#### 🌎 **Arquitectura Multi-Tenant**

**Patrón investigado**: [Multi-Gateway Orchestration](https://medium.com/@himanshusingour7/how-we-built-a-payment-module-supporting-6-payment-gateways-per-tenant-for-8-lakh-users-ba1e393a78d7)

**Principios**:
1. **Tenant-Specific Config**: Cada negocio configura sus propias pasarelas
2. **Orchestration Layer**: Lógica central decide qué gateway usar
3. **State Machine Owner**: App owns state, gateways son execution engines
4. **Runtime Configuration**: Config cargada dinámicamente por tenant

**Arquitectura**:
```
┌─────────────────────────────────────────┐
│  ORCHESTRATION LAYER (G-Admin Mini)    │
│  - Owns Payment State Machine          │
│  - Decides which gateway to use         │
│  - Handles retries, failures            │
│  - Manages idempotency                  │
└─────────────────────────────────────────┘
           │
           ├─────────────┬─────────────┬──────────────┐
           ▼             ▼             ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
    │Mercado   │  │  Stripe  │  │  POSNET  │  │  Modo    │
    │  Pago    │  │          │  │          │  │          │
    └──────────┘  └──────────┘  └──────────┘  └──────────┘
```

**Database Schema**:
```sql
-- Tabla: payment_methods_config (YA EXISTE)
CREATE TABLE payment_methods_config (
  id UUID PRIMARY KEY,
  business_profile_id UUID,

  -- Gateway info
  gateway_provider TEXT, -- 'mercadopago', 'stripe', 'posnet', etc.
  payment_type TEXT, -- 'CARD', 'QR', 'CASH', 'TRANSFER'

  -- Display
  display_name TEXT,
  is_enabled BOOLEAN DEFAULT true,

  -- Config (encrypted)
  credentials JSONB, -- API keys, merchant IDs, etc.
  settings JSONB, -- Gateway-specific settings

  -- Metadata
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Fuente**: [Multi-Gateway Payment Module](https://medium.com/@himanshusingour7/how-we-built-a-payment-module-supporting-6-payment-gateways-per-tenant-for-8-lakh-users-ba1e393a78d7)

---

### C. Separación Admin vs Customer

**Patrón investigado**: [Payment Gateway Architecture](https://www.unipaas.com/blog/payment-gateway-architecture)

**Dos Endpoints Diferentes**:

1. **Admin/Backend** (`queryUrl`):
   - Verificar transacciones
   - Procesar refunds
   - Gestionar suscripciones
   - Ver reportes
   - Configurar gateway

2. **Customer/Frontend** (`paymentsUrl`):
   - Checkout page (iframe)
   - Tokenización de tarjetas
   - Redirect flows
   - Payment confirmation

**Ejemplo Implementación**:
```typescript
// Admin: Configuración de gateway
// Ruta: /admin/finance-integrations?tab=payment-methods
interface PaymentMethodConfig {
  provider: 'mercadopago' | 'stripe' | 'posnet';
  credentials: {
    publicKey: string;    // Visible en frontend
    privateKey: string;   // Solo backend (encrypted)
  };
  settings: {
    captureMode: 'auto' | 'manual';
    currency: 'ARS';
    webhookUrl: string;
  };
}

// Customer: Procesamiento de pago
// Ruta: /checkout o /pay
interface PaymentRequest {
  amount: Decimal;
  paymentMethodId: string; // FK a payment_methods_config
  orderId: string;
  customerId: string;
}
```

**Fuente**: [Payment Gateway Architecture](https://www.unipaas.com/blog/payment-gateway-architecture)

---

## 📋 FASE 2: ARQUITECTURA DEL PROYECTO

### Settings Architecture (v3.0)

**Documento**: `docs/settings/SETTINGS_ARCHITECTURE.md`

**Principios**:
- ✅ **High Cohesion**: Configs viven dentro de su módulo
- ✅ **DDD Bounded Context**: Cada módulo es completo (operaciones + configs)
- ❌ **NO centralized hub**: Settings solo para cross-module configs

**Payment Methods Location**:
```
Finance-Integrations Module
├─ Tab 1: Overview
├─ Tab 2: ⚙️ Payment Methods (10 configs)
│   ├─ Enable/Disable methods
│   ├─ Configure gateways (API keys)
│   ├─ Set default method
│   └─ Webhook configuration
└─ Tab 3: ⚙️ Gateway Settings
    ├─ Mercado Pago config
    ├─ Stripe config
    ├─ POSNET config
    └─ Test mode toggle
```

**Ruta**: `/admin/finance-integrations?tab=payment-methods`

**Estado actual** (según SETTINGS_ARCHITECTURE.md):
- ✅ **Phase 5 COMPLETADO**: Payment Methods migrado a Finance-Integrations
- ⚠️ **paymentsStore LEGACY**: Necesita migración a TanStack Query
- ❌ **UI no implementada**: Solo estructura, sin funcionalidad

---

## 📋 FASE 3: TAREAS DE IMPLEMENTACIÓN

### 🎯 PRIORIDAD 1: Migración de paymentsStore a TanStack Query

**Blocker**: `paymentsStore` tiene server state mezclado (payment methods, gateways)

**Tarea**:
1. Leer `src/store/paymentsStore.ts`
2. Identificar qué data es server state
3. Crear hooks TanStack Query:
   ```typescript
   // src/modules/finance-integrations/hooks/usePaymentMethods.ts
   export function usePaymentMethods() {
     return useQuery({
       queryKey: ['payment-methods'],
       queryFn: async () => {
         const { data } = await supabase
           .from('payment_methods_config')
           .select('*')
           .eq('business_profile_id', currentBusinessId);
         return data;
       }
     });
   }

   export function useUpdatePaymentMethod() {
     const queryClient = useQueryClient();
     return useMutation({
       mutationFn: async ({ id, updates }) => {
         return await supabase
           .from('payment_methods_config')
           .update(updates)
           .eq('id', id);
       },
       onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
       }
     });
   }
   ```

4. Deprecar `paymentsStore`

**Estimado**: 2-3 horas

---

### 🎯 PRIORIDAD 2: UI de Configuración de Payment Methods

**Ubicación**: `/admin/finance-integrations?tab=payment-methods`

**Componentes a crear**:

1. **PaymentMethodsTab.tsx**:
   - Lista de métodos de pago configurados
   - Botón "Add Payment Method"
   - Enable/Disable toggle por método
   - Edit/Delete actions

2. **PaymentMethodConfigModal.tsx**:
   - Form para configurar gateway
   - Campos según provider (Mercado Pago, Stripe, POSNET)
   - Validación de API keys
   - Test connection button

3. **PaymentMethodCard.tsx**:
   - Card para cada método
   - Status indicator (enabled/disabled, test/live)
   - Quick actions

**Wireframe**:
```
┌─────────────────────────────────────────────────────┐
│  Finance Integrations > Payment Methods            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
│  │ Mercado Pago │  │   Stripe     │  │   Add    │ │
│  │              │  │              │  │   New    │ │
│  │ ✅ Enabled   │  │ ❌ Disabled  │  │  Method  │ │
│  │ 🟢 Live      │  │ 🟡 Test      │  └──────────┘ │
│  │              │  │              │                │
│  │ [Edit] [⋮]   │  │ [Edit] [⋮]   │                │
│  └──────────────┘  └──────────────┘                │
│                                                     │
│  Configuration:                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ Default Payment Method: [Mercado Pago ▼]     │ │
│  │ Auto-Capture Payments:  [✓]                  │ │
│  │ Enable Test Mode:       [ ]                  │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Estimado**: 4-6 horas

---

### 🎯 PRIORIDAD 3: Checkout Flow - Customer (E-Commerce)

**Ubicación**: `/checkout` (ruta pública)

**Componentes**:

1. **CheckoutPage.tsx**:
   - Cart summary
   - Customer info form
   - Payment method selector
   - Place order button

2. **PaymentMethodSelector.tsx**:
   - Radio buttons para cada método habilitado
   - Logos de los métodos
   - Instrucciones por método

3. **PaymentProcessor.tsx**:
   - Switch según método elegido
   - Mercado Pago → Redirect flow
   - Card → Tokenization form
   - QR → Display QR code
   - Cash → Instructions

**Flow**:
```typescript
// 1. Customer selecciona productos → Cart
// 2. Click "Checkout"
// 3. Llenar info de envío
// 4. Elegir método de pago
// 5. Procesar según método:

if (method === 'mercadopago') {
  // Crear preferencia
  const preference = await createMercadoPagoPreference({
    items: cart.items,
    customer: customerData,
    backUrls: {
      success: '/checkout/success',
      failure: '/checkout/failure'
    }
  });

  // Redirigir
  window.location.href = preference.init_point;
}

if (method === 'card') {
  // Tokenizar tarjeta
  const token = await tokenizeCard(cardData);

  // Procesar pago
  const payment = await processCardPayment({
    token,
    amount,
    orderId
  });

  // Actualizar UI
  showPaymentStatus(payment.status);
}

if (method === 'qr') {
  // Generar QR
  const qr = await generateQRCode({
    amount,
    orderId,
    description
  });

  // Mostrar QR
  displayQRCode(qr.image);

  // Poll status
  pollPaymentStatus(qr.paymentId);
}
```

**Estimado**: 8-12 horas

---

### 🎯 PRIORIDAD 4: POS Payment Processing

**Ubicación**: `/admin/operations/sales` (módulo de ventas)

**Componentes a modificar**:

1. **ModernPaymentProcessor.tsx** (ya existe):
   - Integrar con payment gateways reales
   - Actualmente es placeholder/mockup

2. **PaymentMethodSelection.tsx**:
   - Mostrar solo métodos habilitados para el negocio
   - Cargar desde `payment_methods_config`

3. **POS Terminal Integration**:
   - Para CARD: Comunicar con terminal POSNET
   - Para QR: Display QR en pantalla
   - Para CASH: Direct recording

**Flow POS**:
```typescript
// En POS (presencial)
if (method === 'card') {
  // Enviar a terminal POSNET
  const terminalResponse = await posnetTerminal.processPayment({
    amount,
    invoiceNumber: saleId
  });

  // Terminal procesa
  // Cliente inserta/tap tarjeta
  // Respuesta automática

  if (terminalResponse.approved) {
    // Crear sale_payment con authorization_code
    await createSalePayment({
      amount,
      payment_type: 'CARD',
      status: 'AUTHORIZED', // Luego CAPTURED en batch
      metadata: {
        terminal_id: terminalResponse.terminalId,
        authorization_code: terminalResponse.authCode,
        card_brand: terminalResponse.cardBrand
      }
    });
  }
}

if (method === 'qr') {
  // Generar QR interoperable
  const qr = await generateInteroperableQR({ amount, saleId });

  // Mostrar en pantalla del POS
  displayOnPOSScreen(qr.image);

  // Cliente escanea con su app bancaria
  // Webhook confirma pago
  // Actualizar status automáticamente
}
```

**Estimado**: 6-8 horas

---

### 🎯 PRIORIDAD 5: Webhook Handlers

**Necesario para**: Confirmar pagos asíncronos (Mercado Pago, QR, etc.)

**Endpoints a crear**:

1. **/api/webhooks/mercadopago**:
   ```typescript
   export async function POST(request: Request) {
     const body = await request.json();

     // Verificar signature (seguridad)
     if (!verifyMercadoPagoSignature(body, signature)) {
       return new Response('Invalid signature', { status: 401 });
     }

     // Obtener payment info
     const payment = await mercadopago.payment.get(body.data.id);

     // Actualizar sale_payment
     await supabase
       .from('sale_payments')
       .update({
         status: mapMercadoPagoStatus(payment.status),
         metadata: { ...payment }
       })
       .eq('metadata->external_id', payment.id);

     return new Response('OK', { status: 200 });
   }
   ```

2. **/api/webhooks/qr-interoperable**:
   ```typescript
   // Similar flow para QR payments
   ```

**Estimado**: 3-4 horas

---

### 🎯 PRIORIDAD 6: Testing & Security

**Tasks**:

1. **PCI-DSS Compliance**:
   - ✅ NO almacenar CVV
   - ✅ NO almacenar full card number
   - ✅ Usar tokenization
   - ✅ SSL/TLS en todas las requests

2. **Idempotency Testing**:
   - Test retry scenarios
   - Verify no duplicates

3. **Webhook Security**:
   - Signature verification
   - Rate limiting
   - Replay attack prevention

4. **Test Mode**:
   - Toggle test/live per gateway
   - Visual indicator en UI

**Estimado**: 4-6 horas

---

## 📊 ROADMAP COMPLETO

### Phase 1: Foundation (6-8 horas)
- ✅ Migrar paymentsStore a TanStack Query
- ✅ UI de configuración de Payment Methods
- ✅ CRUD de payment_methods_config

### Phase 2: E-Commerce Checkout (10-14 horas)
- ✅ Customer checkout flow
- ✅ Mercado Pago integration
- ✅ QR code payments
- ✅ Card tokenization
- ✅ Webhook handlers

### Phase 3: POS Integration (8-12 horas)
- ✅ POS payment processing
- ✅ POSNET terminal integration
- ✅ QR display on POS
- ✅ Split tender support

### Phase 4: Testing & Security (6-8 horas)
- ✅ PCI-DSS compliance
- ✅ Security testing
- ✅ Integration testing
- ✅ User acceptance testing

**TOTAL ESTIMADO**: 30-42 horas (~5-7 días de trabajo)

---

## 🔍 PREGUNTAS PARA ACLARAR ANTES DE EMPEZAR

### 1. **Separación Customer App**:
- ¿Van a ser dos apps separadas (admin + customer)?
- ¿O una app con rutas públicas (`/public/*`)?
- ¿O user con rol "CUSTOMER"?

**Recomendación investigada**:
- **Opción A**: Rutas separadas en misma app (`/admin/*` y `/shop/*` o `/menu/*`)
  - ✅ Simplicidad de deployment
  - ✅ Share auth, database, backend
  - ❌ Bundle size más grande

- **Opción B**: Apps separadas
  - ✅ Bundle size optimizado
  - ✅ Deploy independiente
  - ❌ Más complejidad de infraestructura

**Fuente**: [Multi-Tenant Architecture](https://dashdevs.com/blog/how-to-develop-multi-tenant-app/)

### 2. **Payment Gateways Prioritarios**:
- ¿Mercado Pago es obligatorio? (Recomendado para Argentina)
- ¿POSNET físico existe o es simulación?
- ¿Stripe también o solo Argentina?

### 3. **POS Físico**:
- ¿Hay hardware real (terminal POSNET, QR display)?
- ¿O es software-only (web-based POS)?

### 4. **Testing**:
- ¿Hay cuenta de Mercado Pago para testing?
- ¿Credentials disponibles o usar modo sandbox?

---

## 📚 REFERENCIAS COMPLETAS

### Payment Gateway Integration
- [Mercado Pago API Docs](https://www.mercadopago.com.ar/developers/en/docs/checkout-api/overview)
- [Payment Gateway Architecture](https://www.unipaas.com/blog/payment-gateway-architecture)
- [Multi-Gateway Orchestration](https://medium.com/@himanshusingour7/how-we-built-a-payment-module-supporting-6-payment-gateways-per-tenant-for-8-lakh-users-ba1e393a78d7)

### E-Commerce vs POS
- [Ecommerce Payment Processing Guide](https://www.checkout.com/blog/guide-to-ecommerce-payment-processing)
- [POS Integration Guide](https://neklo.com/blog/ecommerce-pos-integration)

### Argentina-Specific
- [POSNET QR Launch](https://newsroom.fiserv.com/news-releases/news-release-details/argentinian-consumers-can-quickly-and-conveniently-make/)
- [QR Interoperable Standard](https://docs.cdpi.dev/technical-notes/digital-payment-networks/interoperable-qr-code)
- [Argentina Payment Landscape](https://www.rapyd.net/blog/argentina-payments-guide/)
- [Top Payment Gateways Argentina](https://www.rebill.com/en/blog/payment-gateways-argentina)

### UI/UX Best Practices
- [Payment Gateway UI/UX Design](https://www.enkash.com/resources/blog/best-practices-for-payment-gateway-ui-ux-design)
- [Mobile Checkout Optimization](https://www.checkout.com/blog/guide-to-ecommerce-payment-processing)

### Security
- [PCI-DSS Compliance](https://www.pcisecuritystandards.org/)
- [Payment Tokenization](https://blog.rsisecurity.com/how-to-meet-tokenization-pci-dss-requirements/)

---

## 🚀 CÓMO USAR ESTE PROMPT EN LA PRÓXIMA SESIÓN

1. **Copia y pega** este documento completo al inicio de la nueva sesión
2. **Responde** las preguntas de la sección "Preguntas para aclarar"
3. **Elige** por qué fase empezar (recomendado: Phase 1)
4. **Solicita** implementación paso a paso

**Ejemplo**:
> "Vamos a implementar el ecosistema de pagos. Empecemos por Phase 1: Migración de paymentsStore a TanStack Query. Primero lee el archivo `src/store/paymentsStore.ts` y analiza qué necesita migrarse."

---

**Creado**: 2025-12-29
**Autor**: Research basada en 40+ fuentes de industria
**Status**: ✅ Listo para implementar
