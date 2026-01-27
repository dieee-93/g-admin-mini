# Log de Decisiones - Sistema de Manejo de Dinero

**Fecha**: 27 de Diciembre, 2025
**Contexto**: Auditoría y refactorización del sistema de manejo de dinero

---

## 📝 Resumen de la Discusión

Este documento registra todas las decisiones tomadas durante la auditoría y diseño del sistema de manejo de dinero para G-Admin Mini. Cada decisión incluye:
- **Problema identificado**
- **Opciones consideradas**
- **Decisión tomada**
- **Justificación**
- **Fuentes de investigación**

---

## DECISIÓN #1: Payment Methods Configurables

### Problema
Los payment methods estaban parcialmente hardcoded en el código, con referencias inconsistentes:
- `PaymentType` enum en `sales/types.ts`
- Strings literales en handlers (`'CASH'`, `'CARD'`, `'TRANSFER'`, `'QR'`)
- Tabla `payment_methods_config` referenciada pero no existente

### Opciones Consideradas

**Opción A**: Mantener hardcoded con enum
```typescript
enum PaymentMethod {
  CASH, CARD, TRANSFER, QR
}
```
- ✅ Pros: Simple, type-safe
- ❌ Contras: No flexible, cambios requieren deploy

**Opción B**: Configurables en DB ← **ELEGIDA**
```sql
CREATE TABLE payment_methods_config (
  code VARCHAR(50), name TEXT, is_active BOOLEAN
);
```
- ✅ Pros: Flexible, admin puede habilitar/deshabilitar, multi-país
- ❌ Contras: Más complejo, requiere UI admin

### Decisión Tomada
**Opción B - Configurables en DB**

### Justificación
1. **Flexibilidad regional**: Argentina tiene métodos específicos (QR MODO, QR MercadoPago)
2. **Configuración sin deploy**: Admin puede activar/desactivar métodos
3. **Preparación multi-país**: Facilita expansión a otros mercados
4. **Infraestructura ya existe**: `paymentsApi.ts` ya está implementado

### Acción Requerida
- Crear migration para `payment_methods_config` y `payment_gateways`
- Seed data con métodos para Argentina
- Conectar `ModernPaymentProcessor` con DB

---

## DECISIÓN #2: IVA Nacional vs Ingresos Brutos Provincial

### Problema
No estaba claro si los impuestos varían por provincia o son uniformes en Argentina.

### Investigación Realizada
**Búsqueda web**: "Argentina IVA tasas por provincia 2025"
**Fuentes**:
- [IVA Argentina 2025](https://calculadoriva.com/blog/iva-argentina-2025-tasas-afip)
- [Ingresos Brutos por Provincia](https://www.infobae.com/economia/2025/01/26/ranking-de-ingresos-brutos-provincia-por-provincia)

### Hallazgos
**IVA (Impuesto al Valor Agregado)**:
- ✅ **Nacional** - Administrado por AFIP
- ✅ **Uniforme** - Mismas tasas en todo el país
- Tasas: 21% (general), 10.5% (reducido), 27% (lujo)

**Ingresos Brutos** (Gross Income Tax):
- ✅ **Provincial** - Cada provincia tiene autonomía
- ✅ **Variable** - Tasas diferentes por jurisdicción
- Ejemplos:
  - CABA: 1-8% según actividad
  - Buenos Aires: 9% (servicios financieros)
  - Córdoba: 9% (servicios financieros)

### Decisión Tomada
**Sistema híbrido**:
- IVA: Configurable pero con default nacional (raramente cambia)
- Ingresos Brutos: Configurable por location (obligatorio para multi-location)

### Implementación
```sql
CREATE TABLE fiscal_config_by_location (
  location_id UUID,
  iva_general_rate NUMERIC(5,4) DEFAULT 0.21,  -- Nacional
  ingresos_brutos_rate NUMERIC(5,4),           -- Provincial
  jurisdiction TEXT -- 'CABA', 'BUENOS_AIRES'
);
```

---

## DECISIÓN #3: Cash Sessions - Individual vs Compartida

### Problema
No estaba definido si múltiples cajeros pueden usar la misma caja (cash drawer).

### Investigación Realizada
**Búsqueda web**: "POS cash drawer sessions multiple cashiers industry standard"
**Fuentes**:
- [Cash Drawer Management - POS Highway](https://www.poshighway.com/blog/cash-drawer-management-cycle-counts-reconcilation-activation-and-closing/)
- [Microsoft Dynamics 365 - Shift Management](https://learn.microsoft.com/en-us/dynamics365/commerce/shift-drawer-management)

### Hallazgos - Industry Standards

**Single User Per Shift** (Preferred):
> "Many retailers prefer to allow only one user per shift, to help guarantee the highest level of accountability for the cash in the cash drawer. If only one user is allowed to use the till that is associated with a shift, that user can be held solely responsible for any discrepancies."

**Multiple Users Per Shift** (Alternative):
> "Some retailers are willing to sacrifice the level of accountability that single-user shifts provide and to allow more than one user per shift. This is typical when there are more users than available registers."

### Decisión Tomada
**1 Cajero = 1 Cash Session** (default)

Con opción configurable para shared sessions en casos especiales.

### Justificación
1. **Accountability**: Responsabilidad individual clara
2. **Fraud Prevention**: Reduce robo interno
3. **Audit Trail**: Facilita investigación de discrepancias
4. **Industry Standard**: Es la práctica recomendada

### Implementación
```typescript
// Validar al abrir sesión
const existingSession = await getActiveCashSession(money_location_id);
if (existingSession && !config.allow_shared_sessions) {
  throw new Error('Ya hay una sesión activa en esta caja');
}
```

---

## DECISIÓN #4: Venta CASH sin Cash Session

### Problema
¿Qué hacer si un cajero intenta recibir efectivo sin tener cash session abierta?

### Opciones Consideradas

**Opción A**: Permitir y crear "floating cash"
- ❌ Riesgo de dinero sin accountability
- ❌ Problemas de reconciliación

**Opción B**: Bloquear venta ← **ELEGIDA**
- ✅ Fuerza accountability
- ✅ Previene fraude
- ✅ Garantiza reconciliación

### Decisión Tomada
**Opción B - Bloquear pagos CASH sin session**

### Justificación
**¿Qué pasa en el mundo real sin session?**
1. Cajero recibe $1,000 en efectivo
2. No hay registro en cash_session
3. Al final del día: ¿De dónde salió ese dinero?
4. Imposible reconciliar
5. Oportunidad de fraude

### Implementación
```typescript
// Backend validation
if (paymentMethod === 'CASH') {
  const activeSession = await getActiveCashSession(location);
  if (!activeSession) {
    throw new PaymentValidationError(
      'No hay caja abierta. Abra una sesión primero.'
    );
  }
}

// UI
<PaymentMethodButton
  method="CASH"
  disabled={!activeCashSession}
  tooltip="Debe abrir una caja primero"
/>
```

**Nota**: Payments NO-CASH (CARD/QR/TRANSFER) NO requieren cash session.

---

## DECISIÓN #5: Shifts Obligatorios

### Problema
¿Los shifts son obligatorios para todas las operaciones?

### Decisión Tomada
**SÍ, obligatorios** excepto para e-commerce 24/7.

### Justificación
1. **Agregación de métricas**: Ventas por turno
2. **Reporting**: Performance por turno/equipo
3. **Cash sessions vinculadas**: Ya diseñado en DB (`cash_sessions.shift_id`)
4. **Gestión operativa**: Facilita planning y staffing

### Casos Especiales
- **E-commerce 24/7**: No requiere shift (ventas online)
- **Auto-vending**: Sin staff, no requiere shift

### Implementación
```typescript
// Validar al abrir cash session
const activeShift = await getActiveShift(location_id);
if (!activeShift && !isOnlineOnly) {
  throw new Error('No hay turno activo. Abra un turno primero.');
}
```

---

## DECISIÓN #6: Cash Session Vinculada a Shift

### Problema
¿Debe cash session estar siempre vinculada a un shift?

### Decisión Tomada
**SÍ, obligatoriamente vinculada**

### Justificación
1. **Ya diseñado en DB**: Campo `shift_id` existe en `cash_sessions`
2. **Reporting simplificado**: Suma de cash_sessions = cash_total del shift
3. **Coherencia operativa**: Un turno agrupa todas las operaciones del período

### Implementación
```sql
ALTER TABLE cash_sessions
  ALTER COLUMN shift_id SET NOT NULL;  -- Make it required
```

---

## DECISIÓN #7: Reconciliación Bancaria

### Problema
¿Cómo reconciliar pagos digitales (CARD/QR) con settlements bancarios?

### Investigación Realizada
**Búsqueda web**: "bank reconciliation payment gateway settlement automated"
**Fuentes**:
- [Payment Reconciliation 101 - Stripe](https://stripe.com/resources/more/payment-reconciliation-101)
- [Multi-Gateway Settlement - Optimus](https://optimus.tech/blog/multi-gateway-settlement-reconciliation-simplifying-complex-payment-ecosystems)

### Hallazgos
**Qué implica reconciliación**:
1. **Settlement Tracking**: Rastrear depósitos del gateway
2. **Transaction Matching**: Emparejar ventas POS con settlements
3. **Discrepancy Detection**: Encontrar diferencias (fees, chargebacks)

**Desafíos**:
> "Each payment gateway provides transaction data in different formats and settlement cycles, which makes matching records complex. Companies can lose 5% or more of revenue annually due to inefficiencies and errors in payment processing and reconciliation." - McKinsey

### Decisión Tomada
**Implementación en 3 fases**:

**Fase 1 (MVP)**: Manual Reconciliation
- Dashboard con settlements pendientes
- Matching manual por ADMINISTRADOR

**Fase 2**: Automated Matching
- Webhooks de gateways (MercadoPago, MODO)
- Auto-matching de transactions → settlements
- Alertas automáticas de discrepancias

**Fase 3**: Bank Feed Integration
- Conectar cuenta bancaria (Plaid/similar)
- Reconciliación completa automated

### Implementación Fase 1
```sql
CREATE TABLE payment_settlements (
  gateway_id UUID,
  settlement_date DATE,
  expected_amount NUMERIC,
  actual_amount NUMERIC,
  fees_amount NUMERIC,
  status TEXT CHECK (status IN ('PENDING', 'SETTLED', 'FAILED'))
);
```

---

## DECISIÓN #8: Consolidar Tax Calculation Service

### Problema Identificado
**Duplicación completa** del código de cálculo de impuestos:
- `src/modules/cash/services/taxCalculationService.ts` (427 líneas)
- `src/modules/finance-fiscal/services/taxCalculationService.ts` (467 líneas)

**Riesgo**:
- Cambios en uno no se reflejan en otro
- Posibles inconsistencias en cálculos
- Mantenimiento duplicado

### Decisión Tomada
**Consolidar en un único servicio**:
- **Source of truth**: `src/modules/finance-fiscal/services/taxCalculationService.ts`
- **Eliminar**: `src/modules/cash/services/taxCalculationService.ts`
- **Actualizar imports**: Todos apuntan a finance-fiscal

### Justificación
1. **DRY Principle**: Don't Repeat Yourself
2. **Single Source of Truth**: Un solo lugar para lógica fiscal
3. **Separation of Concerns**: Fiscal logic pertenece a finance-fiscal

### Patrón de Arquitectura
```
src/modules/
  ├── finance-fiscal/  ← Owner de lógica fiscal
  │   └── services/
  │       └── taxCalculationService.ts  ← SOURCE OF TRUTH
  │
  ├── cash/            ← Consumer de lógica fiscal
  │   └── handlers/
  │       └── salesPaymentHandler.ts
  │           import { taxService } from '@/modules/finance-fiscal/services'
  │
  └── sales/           ← Consumer de lógica fiscal
      └── services/
          └── saleApi.ts
              import { taxService } from '@/modules/finance-fiscal/services'
```

---

## DECISIÓN #9: Roles y Permisos para Cash

### Problema
No estaba definido quién puede hacer qué con las cash sessions.

### Decisión Tomada
Basado en `docs/permissions/ROLES.md`:

**OPERADOR (Cajero)**:
- ✅ Abrir su propia cash session
- ✅ Cerrar su propia cash session
- ✅ Ver su propia session
- ❌ Ver sessions de otros
- ❌ Void transactions
- ❌ Aprobar discrepancias

**SUPERVISOR (Encargado)**:
- ✅ Todas las de OPERADOR
- ✅ Ver todas las sessions del turno
- ✅ Aprobar cierres con discrepancias
- ✅ Void transactions
- ✅ Abrir/cerrar shifts
- ❌ Configurar sistema

**ADMINISTRADOR (Dueño)**:
- ✅ Full access
- ✅ Configurar payment methods
- ✅ Configurar fiscal settings
- ✅ Ver reportes financieros completos
- ✅ Delete historical records (solo correcciones)

---

## DECISIÓN #10: Payment Gateway Integration

### Problema
No había claridad sobre el estado de las integraciones con MercadoPago, MODO, etc.

### Auditoría Realizada
**Código existente**:
- ✅ `paymentsApi.ts` - API completa para CRUD de payment methods
- ✅ Tipos TypeScript definidos
- ❌ Tablas DB no existen (no hay migrations)
- ❌ No hay código de SDK de MercadoPago/MODO
- ❌ No hay webhook handlers

**Búsqueda web**: "MercadoPago Argentina integration webhook 2025"
**Fuente**: [MercadoPago Webhooks](https://www.mercadopago.com.ar/developers/en/docs/wallet-connect/additional-content/your-integrations/notifications/webhooks)

### Decisión Tomada
**Implementación incremental**:

**Fase 1**: Infraestructura base
- Crear tablas `payment_methods_config`, `payment_gateways`
- Seed con métodos offline (CASH, BANK_TRANSFER)

**Fase 2**: MercadoPago integration
- SDK de MercadoPago
- Webhook listener
- QR Code generation

**Fase 3**: MODO integration
- Similar a MercadoPago

**Fase 4**: Terminal POS (CARD)
- Integración con terminales físicas

---

## DECISIÓN #11: Arquitectura de Módulos

### Problema
Usuario mencionó que `business-logic/` es código viejo y el patrón actual es diferente.

### Investigación Realizada
```bash
src/
  ├── business-logic/  ← Código legacy (inventory, operations, scheduling)
  └── modules/         ← Patrón actual
      ├── cash/
      │   ├── services/
      │   ├── handlers/
      │   └── types/
      └── finance-fiscal/
```

### Decisión Tomada
**NO mover a business-logic**

Seguir patrón actual:
- Lógica de negocio **dentro** de cada módulo (`modules/*/services/`)
- Vista en `pages/`

### Justificación
1. **Patrón establecido**: Es cómo está estructurado actualmente
2. **Encapsulación**: Cada módulo es self-contained
3. **Mantenibilidad**: Más fácil encontrar código relacionado

---

## DECISIÓN #12: Fix Import Roto

### Bug Encontrado
```typescript
// src/modules/cash/handlers/salesPaymentHandler.ts:18
import { calculateTaxFromTotal, TAX_RATES } from '../services/taxCalculationService';
```

**Problema**: La función `calculateTaxFromTotal` NO EXISTE.

### Decisión Tomada
**Reemplazar con función existente**:

```typescript
// Antes (ROTO)
const taxBreakdown = calculateTaxFromTotal(payload.amount, TAX_RATES.IVA_GENERAL);

// Después (CORRECTO)
const taxBreakdown = taxService.reverseTaxCalculation(payload.amount, {
  ivaRate: TAX_RATES.IVA.GENERAL
});
```

---

## 📊 Resumen de Impacto

### Cambios en Base de Datos
- ✅ 4 nuevas tablas
- ✅ 0 tablas modificadas
- ✅ 0 tablas eliminadas

### Cambios en Código
- ✅ 1 bug fix crítico (import roto)
- ✅ 1 duplicación eliminada (taxCalculationService)
- ✅ 3 nuevos hooks (usePaymentMethods, useSettlements, useFiscalConfig)

### Nuevas Features
- ✅ Payment methods configurables
- ✅ Reconciliación básica
- ✅ Validación de cash session
- ✅ Dashboard de settlements

---

## 📅 Timeline de Implementación

### Semana 1: Fundación
- Día 1-2: Fixes críticos
- Día 3-4: Migrations
- Día 5: Seed data

### Semana 2: Payment Methods
- Día 1-2: Backend integration
- Día 3-4: UI Admin
- Día 5: Testing

### Semana 3: Validaciones
- Día 1-2: Cash session validation
- Día 3-4: UX improvements
- Día 5: Testing

### Semana 4: Reconciliación
- Día 1-2: Settlements table & API
- Día 3-4: Dashboard
- Día 5: Webhooks (MercadoPago)

---

## ✅ Aprobaciones Requeridas

- [ ] Tech Lead: Arquitectura general
- [ ] Product Owner: Features y priorización
- [ ] Finance Manager: Fiscal compliance
- [ ] DevOps: Infraestructura (webhooks, secrets)

---

**Última actualización**: 27 de Diciembre, 2025
**Próxima revisión**: Después de aprobaciones
