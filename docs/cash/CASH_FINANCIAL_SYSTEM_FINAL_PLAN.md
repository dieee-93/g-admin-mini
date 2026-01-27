# 💰 CASH & FINANCIAL SYSTEM - PLAN EJECUTABLE FINAL

**Project**: G-Admin Mini
**Date**: 2025-12-10 (Updated)
**Status**: Ready to implement - DB Schema Updated ✅
**Scope**: Precision ✅, Analytics ⚠️, Argentina dual economy ⚠️, Operational flows ✅

---

## 🎯 RESUMEN EJECUTIVO (ACTUALIZADO)

### Documentos Relacionados

Este plan es parte de un conjunto de 3 documentos:

1. **FINANCE_DOMAIN_AUDIT.md** ✅ - Auditoría completa del dominio Finance
   - 7 módulos Finance identificados
   - Matriz EventBus completa (30+ eventos)
   - 5 gaps críticos documentados
   - Payment methods flow analysis

2. **CASH_OPERATIONAL_FLOWS.md** ✅ - Diseño operativo basado en investigación
   - Investigación de Toast POS, Square, Dynamics 365, Maxirest
   - Modelo: Individual Accountability (1 empleado = 1 caja)
   - Coordinación: Semi-Acoplado (Shift ⟷ Cash)
   - 5 flujos detallados con diagramas
   - UI/UX mockups

3. **CASH_FINANCIAL_SYSTEM_FINAL_PLAN.md** ✅ - Este documento (implementación técnica)

### Cambios Aplicados en DB (2025-12-10)

✅ **cash_sessions** extendida:
- `employee_id` → Responsable individual de la caja
- `shift_id` → Link al turno operacional
- `approved_by` → Manager que aprobó cierre

✅ **shift_payments** (nueva tabla):
- Tracking de CARD/TRANSFER/QR a nivel shift
- Atribución por empleado para métricas

✅ **operation_locks** (nueva tabla):
- Idempotency para prevenir duplicados
- Client-generated UUIDs

✅ **operational_shifts** extendida:
- `cash_total`, `card_total`, `transfer_total`, `qr_total`
- Denormalización para performance

---

## 📋 ESTADO ACTUAL DEL CÓDIGO (Análisis Completo)

### ✅ LO QUE YA FUNCIONA BIEN

#### 1. **Precisión Financiera** ✅ PERFECTO
**Ubicación**: `src/business-logic/shared/decimalUtils.ts`

```typescript
// YA TIENES esto implementado:
import { DecimalUtils, TaxDecimal, FinancialDecimal } from '@/business-logic/shared/decimalUtils';

// 4 dominios configurados:
- tax (10 decimales)
- inventory (3 decimales)
- financial (2 decimales)
- recipe (4 decimales)

// Funciones seguras:
DecimalUtils.fromValue(amount, 'financial')
DecimalUtils.add(a, b, 'financial')
DecimalUtils.subtract(a, b, 'financial')
DecimalUtils.multiply(a, b, 'financial')
DecimalUtils.divide(a, b, 'financial')
DecimalUtils.isZero(value)
```

**Usado en**:
- ✅ `cashSessionService.ts` - línea 147-174
- ✅ `journalService.ts` - línea 44-51
- ✅ `taxCalculationService.ts` - línea 119-155
- ✅ 100+ archivos más

**Conclusión**: ✅ **NO TOCAR - Ya está perfecto**

---

#### 2. **Tax Engine (Argentina)** ✅ COMPLETO
**Ubicación**: `src/pages/admin/operations/sales/services/taxCalculationService.ts`

```typescript
// YA TIENES:
export const TAX_RATES = {
  IVA: {
    GENERAL: 0.21,        // 21% Argentina
    REDUCIDO: 0.105,      // 10.5%
    EXENTO: 0.0
  },
  INGRESOS_BRUTOS: {
    CABA: 0.03,
    BUENOS_AIRES: 0.035,
    CORDOBA: 0.04
  }
};

class TaxCalculationService {
  calculateTaxesForAmount(amount, config)      // Single amount
  calculateTaxesForItems(items, config)        // Shopping cart
  reverseTaxCalculation(finalAmount)           // Reverse engineering
  getTaxSummaryForPeriod(salesData)            // Reports
}
```

**Features**:
- ✅ Soporta IVA 21%, 10.5%, exento
- ✅ Ingresos Brutos por jurisdicción
- ✅ `taxIncludedInPrice: true` (Argentina)
- ✅ Rounding at the end (no intermediate rounding)
- ✅ Usa TaxDecimal correctamente

**Conclusión**: ✅ **NO TOCAR - Ya está completo**

---

#### 3. **Cash Sessions & Journal Entries** ✅ IMPLEMENTADO

```typescript
// src/modules/cash/services/cashSessionService.ts
- openCashSession(input, userId)              ✅
- closeCashSession(sessionId, input, userId)   ✅ con blind counting
- recordCashSale(locationId, amount)          ✅
- getAllActiveSessions()                      ✅

// src/modules/cash/services/journalService.ts
- createJournalEntry(input, userId)           ✅ double-entry
- validateJournalBalance(lines)               ✅ sum = 0
- generateEntryNumber(type)                   ✅ JE-YYYY-NNNNNN

// src/modules/cash/handlers/salesPaymentHandler.ts
- handleSalesPaymentCompleted                 ✅ CASH only
- handleSalesOrderCancelled                   🔴 TODO (stub)
```

**Conclusión**: ✅ **Core funciona, solo falta reversiones**

---

#### 4. **Analytics Engines** ✅ BÁSICO

```typescript
// YA TIENES varios engines:
- src/shared/services/AnalyticsEngine.ts              // RFM, Trends
- src/pages/admin/operations/sales/services/SalesIntelligenceEngine.ts
- src/pages/admin/supply-chain/materials/services/abcAnalysisEngine.ts
- src/pages/admin/resources/staff/services/staffPerformanceAnalyticsEngine.ts
- src/pages/admin/resources/staff/services/realTimeLaborCostEngine.ts
```

**Conclusión**: ⚠️ **Tienes engines básicos, falta dashboard unificado**

---

### 🔴 LO QUE FALTA (Gaps Críticos)

#### 1. **Order/Payroll Cancellation Reversal** 🔴 BLOCKER
**Ubicación**:
- `src/modules/cash/handlers/salesPaymentHandler.ts:199-223`
- `src/modules/cash/handlers/payrollHandler.ts:164-190`

**Problema**: Funciones son stubs vacíos:
```typescript
export const handleSalesOrderCancelled: EventHandler = async (event) => {
  // TODO: Implementar lógica de reversa
};
```

**Impacto**: Si cancelas una venta con pago CASH, el dinero queda registrado pero no se puede reversar.

---

#### 2. **Non-Cash Payments Not Accounting** 🔴 BLOCKER
**Ubicación**: `src/modules/cash/handlers/salesPaymentHandler.ts:54-59`

```typescript
// Solo procesar pagos en efectivo
if (payload.paymentMethod !== 'CASH') {
  logger.debug('CashModule', 'Skipping non-cash payment', {
    paymentMethod: payload.paymentMethod,
  });
  return;  // ← CARD/TRANSFER/QR no se contabilizan
}
```

**Impacto**: Pagos con tarjeta/transferencia NO crean journal entries automáticamente.

---

#### 3. **Idempotency** ❌ NO EXISTE
**Impacto**: Si la red falla y el usuario intenta cerrar caja 2 veces, se procesa 2 veces.

---

#### 4. **Dual Recording (Formal/Informal)** ❌ NO EXISTE
**Impacto**: No puedes distinguir ventas con factura vs. sin factura (realidad Argentina).

---

#### 5. **Dashboard Real-Time** ⚠️ PARCIAL
**Impacto**: Tienes widgets individuales pero no dashboard consolidado con KPIs críticos.

---

## 🎯 PLAN EJECUTABLE (Basado en Tus Prioridades)

### Tus Restricciones
- ✅ Querés soportar dual economy (formal + informal)
- ✅ Priorizas precision (✅ ya OK) y analytics
- ❌ NO tienes equipo para Event Sourcing (4-5 weeks)
- ❌ NO tienes presupuesto para partnerships
- ❌ AFIP compliance no es blocker para launch

### Plan Incremental: 3 Phases

---

## 📦 PHASE 1: Quick Wins (1-2 semanas)

### 1.1 Payment Reversals ✅ CRITICAL

**Archivo**: `src/modules/cash/handlers/salesPaymentHandler.ts`

```typescript
/**
 * Handler para sales.order_cancelled
 * Reversa el journal entry original
 */
export const handleSalesOrderCancelled: EventHandler = async (event) => {
  const { payload } = event;

  logger.info('CashModule', '♻️ Reversing sale payment', {
    saleId: payload.saleId,
    amount: payload.amount,
  });

  try {
    // 1. Buscar journal entry original
    const { data: originalEntry } = await supabase
      .from('journal_entries')
      .select(`
        *,
        lines:journal_lines(*)
      `)
      .eq('reference_id', payload.saleId)
      .eq('reference_type', 'SALE')
      .single();

    if (!originalEntry) {
      logger.warn('CashModule', 'Original journal entry not found', {
        saleId: payload.saleId
      });
      return;
    }

    // 2. Crear entry reverso (invertir todos los signos)
    const reversalLines = originalEntry.lines.map(line => ({
      account_code: line.account_code,
      money_location_id: line.money_location_id,
      amount: -line.amount,  // ← Invertir signo
      description: `REVERSA: ${line.description}`
    }));

    await createJournalEntry(
      {
        entry_type: 'SALE_REVERSAL',
        transaction_date: payload.timestamp,
        reference_id: payload.saleId,
        reference_type: 'SALE_REVERSAL',
        external_reference: originalEntry.entry_number,
        description: `REVERSA de venta ${payload.saleId}`,
        lines: reversalLines
      },
      event.userId || 'system'
    );

    // 3. Actualizar cash session (restar de cash_sales, sumar a cash_refunds)
    const cashDrawer = await getMoneyLocationByCode('DRAWER-001');
    if (cashDrawer) {
      const activeSession = await getActiveCashSession(cashDrawer.id);
      if (activeSession) {
        await recordCashRefund(cashDrawer.id, payload.amount);
        logger.info('CashModule', 'Cash refund recorded', {
          sessionId: activeSession.id,
          amount: payload.amount
        });
      }
    }

    // 4. Emit event
    await EventBus.emit(
      'cash.refund.recorded',
      {
        saleId: payload.saleId,
        amount: payload.amount,
        timestamp: new Date().toISOString()
      },
      'CashModule'
    );

    logger.info('CashModule', 'Sale reversal completed successfully');

  } catch (error) {
    logger.error('CashModule', 'Failed to reverse sale', { error, saleId: payload.saleId });
    throw error;
  }
};
```

**Nueva función helper**:
```typescript
// En cashSessionService.ts
export async function recordCashRefund(
  moneyLocationId: string,
  amount: number
): Promise<void> {
  const session = await getActiveCashSession(moneyLocationId);

  if (!session) {
    throw new Error('No active cash session for refund');
  }

  const refundDec = DecimalUtils.fromValue(amount, 'financial');
  const currentRefunds = DecimalUtils.fromValue(session.cash_refunds || 0, 'financial');
  const newRefunds = DecimalUtils.add(currentRefunds, refundDec, 'financial');

  await supabase
    .from('cash_sessions')
    .update({
      cash_refunds: DecimalUtils.toNumber(newRefunds)
    })
    .eq('id', session.id);
}
```

**Testing**:
```typescript
// __tests__/cash-reversals.test.ts
describe('Sales Reversals', () => {
  it('should reverse cash sale correctly', async () => {
    // 1. Create sale
    const sale = await createSale({ amount: 100, paymentMethod: 'CASH' });

    // 2. Verify journal entry created
    const entries = await getJournalEntries({ referenceId: sale.id });
    expect(entries).toHaveLength(1);
    expect(entries[0].lines).toHaveLength(3);  // Cash + Revenue + Tax

    // 3. Cancel sale
    await EventBus.emit('sales.order_cancelled', {
      saleId: sale.id,
      amount: 100,
      timestamp: new Date()
    });

    // 4. Verify reversal entry created
    const reversalEntries = await getJournalEntries({
      referenceType: 'SALE_REVERSAL',
      externalReference: entries[0].entry_number
    });
    expect(reversalEntries).toHaveLength(1);

    // 5. Verify cash session updated
    const session = await getActiveCashSession(drawerId);
    expect(session.cash_refunds).toBe(100);
  });
});
```

**Tiempo**: 2-3 días
**Impacto**: 🔴 CRITICAL - Sin esto no puedes corregir errores

---

### 1.2 Non-Cash Payment Accounting ✅ CRITICAL

**Decisión de Diseño** (basado en CASH_OPERATIONAL_FLOWS.md):
- **CASH** → va a `cash_sessions` individual del empleado
- **NO-CASH (CARD/TRANSFER/QR)** → va a `shift_payments` (nivel shift)
- **Atribución** → por empleado para métricas/comisiones
- **Journal Entry** → se crea para TODOS los payment methods

**Archivo**: `src/modules/cash/handlers/salesPaymentHandler.ts`

```typescript
// MODIFICAR función existente para soportar ALL payment methods
export const handleSalesPaymentCompleted: EventHandler<PaymentCompletedEvent> =
  async (event) => {
    const { payload } = event;

    logger.info('CashModule', '💰 Received sales.payment.completed event', {
      paymentId: payload.paymentId,
      amount: payload.amount,
      paymentMethod: payload.paymentMethod,
    });

    try {
      // Determinar cuenta según payment method
      let accountCode: string;
      let moneyLocationId: string | undefined;

      switch (payload.paymentMethod) {
        case 'CASH':
          accountCode = '1.1.01.001';  // Cash Drawer
          const cashDrawer = await getMoneyLocationByCode('DRAWER-001');
          moneyLocationId = cashDrawer?.id;

          // Solo CASH actualiza sesión
          if (cashDrawer) {
            const activeSession = await getActiveCashSession(cashDrawer.id);
            if (activeSession) {
              await recordCashSale(cashDrawer.id, payload.amount);
            }
          }
          break;

        case 'CARD':
        case 'TRANSFER':
        case 'QR':
          accountCode = '1.1.03.001';  // Bank Account (settlement cuenta)
          // No money location para non-cash

          // ✅ NUEVO: Registrar en shift_payments
          const activeShift = await getActiveShift(payload.businessId);
          if (activeShift) {
            await supabase.from('shift_payments').insert({
              shift_id: activeShift.id,
              sale_id: payload.saleId,
              employee_id: payload.employeeId,
              payment_method: payload.paymentMethod,
              amount: payload.amount,
              reference: payload.reference
            });
          }
          break;

        default:
          logger.warn('CashModule', 'Unknown payment method', {
            paymentMethod: payload.paymentMethod
          });
          return;
      }

      // Obtener cuentas
      const paymentAccount = await getAccountByCode(accountCode);
      const revenueAccount = await getAccountByCode('4.1');
      const taxAccount = await getAccountByCode('2.1.02');

      if (!paymentAccount || !revenueAccount || !taxAccount) {
        logger.error('CashModule', 'Required accounts not found');
        return;
      }

      // Calcular IVA usando TaxService existente
      const taxCalc = taxService.reverseTaxCalculation(payload.amount);

      // Crear journal entry (TODOS los payment methods)
      await createJournalEntry(
        {
          entry_type: 'SALE',
          transaction_date: payload.timestamp,
          reference_id: payload.saleId || payload.paymentId,
          reference_type: 'SALE',
          external_reference: payload.reference,
          description: `Venta ${payload.paymentMethod} ${payload.saleId ? `#${payload.saleId}` : ''}`,
          cash_session_id: payload.paymentMethod === 'CASH' ? activeSession?.id : undefined,
          lines: [
            {
              // Débito: Payment account aumenta
              account_code: paymentAccount.code,
              money_location_id: moneyLocationId,
              amount: -taxCalc.totalAmount,
              description: `${payload.paymentMethod} recibido`,
            },
            {
              // Crédito: Revenue
              account_code: revenueAccount.code,
              amount: taxCalc.subtotal,
              description: 'Ingreso por venta',
            },
            {
              // Crédito: Tax Payable
              account_code: taxAccount.code,
              amount: taxCalc.ivaAmount,
              description: 'IVA 21%',
            },
          ],
        },
        event.userId || 'system'
      );

      logger.info('CashModule', 'Payment accounting completed', {
        paymentMethod: payload.paymentMethod,
        journalCreated: true
      });

    } catch (error) {
      logger.error('CashModule', 'Failed to process payment', { error });
      throw error;
    }
  };
```

**Tiempo**: 1-2 días
**Impacto**: 🔴 CRITICAL - Sin esto no tienes contabilidad completa

---

### 1.3 Idempotency Simple ✅ HIGH

**Schema**:
```sql
-- migrations/add_idempotency_locks.sql
CREATE TABLE operation_locks (
  id TEXT PRIMARY KEY,              -- UUID generado por cliente
  operation_type TEXT NOT NULL,     -- 'close_session', 'payment', etc.
  status TEXT NOT NULL,             -- 'processing', 'completed', 'failed'

  -- Request data (for debugging)
  request_params JSONB NOT NULL,
  user_id UUID REFERENCES auth.users(id),

  -- Result
  result JSONB,
  error_message TEXT,

  -- Timing
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours',

  -- Indexes
  CONSTRAINT operation_locks_status_check CHECK (status IN ('processing', 'completed', 'failed'))
);

CREATE INDEX idx_operation_locks_status ON operation_locks(status);
CREATE INDEX idx_operation_locks_expires ON operation_locks(expires_at) WHERE status = 'processing';
```

**Service**:
```typescript
// src/lib/idempotency/IdempotencyService.ts
import { supabase } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';

export interface IdempotentOperation<T> {
  operationId: string;
  operationType: string;
  operation: () => Promise<T>;
  userId?: string;
  params?: Record<string, unknown>;
}

export class IdempotencyService {
  /**
   * Execute operation idempotently
   * If operation already completed, return cached result
   * If operation in progress, wait and retry
   */
  static async execute<T>(config: IdempotentOperation<T>): Promise<T> {
    const { operationId, operationType, operation, userId, params } = config;

    // 1. Check if operation already exists
    const { data: existing } = await supabase
      .from('operation_locks')
      .select('*')
      .eq('id', operationId)
      .single();

    if (existing) {
      if (existing.status === 'completed') {
        // Already completed, return cached result
        logger.info('IdempotencyService', 'Returning cached result', {
          operationId,
          operationType
        });
        return existing.result as T;
      }

      if (existing.status === 'failed') {
        throw new Error(`Operation previously failed: ${existing.error_message}`);
      }

      if (existing.status === 'processing') {
        // Another process is handling this, wait and retry
        logger.info('IdempotencyService', 'Operation in progress, waiting', {
          operationId
        });
        await this.sleep(100);
        return this.execute(config);  // Recursive retry
      }
    }

    // 2. Create lock (atomic operation)
    const { error: lockError } = await supabase
      .from('operation_locks')
      .insert({
        id: operationId,
        operation_type: operationType,
        status: 'processing',
        request_params: params || {},
        user_id: userId
      });

    if (lockError) {
      // Race condition: another process created lock first, retry
      logger.debug('IdempotencyService', 'Race condition detected, retrying', {
        operationId
      });
      return this.execute(config);
    }

    // 3. Execute operation
    try {
      const result = await operation();

      // 4. Mark as completed
      await supabase
        .from('operation_locks')
        .update({
          status: 'completed',
          result: result as any,
          completed_at: new Date().toISOString()
        })
        .eq('id', operationId);

      logger.info('IdempotencyService', 'Operation completed successfully', {
        operationId,
        operationType
      });

      return result;

    } catch (error) {
      // 5. Mark as failed
      await supabase
        .from('operation_locks')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : String(error),
          completed_at: new Date().toISOString()
        })
        .eq('id', operationId);

      logger.error('IdempotencyService', 'Operation failed', {
        operationId,
        error
      });

      throw error;
    }
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup expired locks (run daily)
   */
  static async cleanupExpired(): Promise<void> {
    const { data, error } = await supabase
      .from('operation_locks')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) {
      logger.error('IdempotencyService', 'Failed to cleanup expired locks', { error });
    } else {
      logger.info('IdempotencyService', 'Cleaned up expired locks', { count: data?.length });
    }
  }
}
```

**Uso en cashSessionService**:
```typescript
// Modificar closeCashSession
export async function closeCashSession(
  sessionId: string,
  input: CloseCashSessionInput,
  userId: string,
  operationId?: string  // ← Nuevo parámetro opcional
): Promise<CashSessionRow> {

  // Si no hay operationId, ejecutar normalmente (backwards compatible)
  if (!operationId) {
    return closeCashSessionInternal(sessionId, input, userId);
  }

  // Con operationId, usar idempotency
  return IdempotencyService.execute({
    operationId,
    operationType: 'close_cash_session',
    operation: () => closeCashSessionInternal(sessionId, input, userId),
    userId,
    params: { sessionId, input }
  });
}

// Función interna (la lógica actual)
async function closeCashSessionInternal(
  sessionId: string,
  input: CloseCashSessionInput,
  userId: string
): Promise<CashSessionRow> {
  // ... código actual sin cambios
}
```

**Cliente genera UUID**:
```typescript
// En UI (CloseSessionModal.tsx)
import { v4 as uuidv4 } from 'uuid';

const handleCloseSession = async () => {
  const operationId = uuidv4();  // Genera UUID en cliente

  try {
    await closeCashSession(sessionId, formData, userId, operationId);
    // Success
  } catch (error) {
    // Si falla, puede retry con mismo operationId
    await closeCashSession(sessionId, formData, userId, operationId);
  }
};
```

**Tiempo**: 2-3 días
**Impacto**: 🔴 HIGH - Previene duplicate operations

---

### 1.4 Dual Recording (Formal/Informal) ✅ ARGENTINA

**Schema Extension**:
```sql
-- migrations/add_dual_economy_support.sql

-- Extender sales table
ALTER TABLE sales
  ADD COLUMN fiscal_status TEXT DEFAULT 'FORMAL' CHECK (fiscal_status IN ('FORMAL', 'INFORMAL')),
  ADD COLUMN fiscal_document_type TEXT,  -- 'FACTURA_A', 'FACTURA_B', 'TICKET', null
  ADD COLUMN fiscal_document_number TEXT,
  ADD COLUMN fiscal_cae TEXT,            -- CAE de AFIP (si aplica)
  ADD COLUMN fiscal_qr_code TEXT;        -- QR code de factura

-- Extender cash_sessions
ALTER TABLE cash_sessions
  ADD COLUMN formal_cash_sales DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN informal_cash_sales DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN formal_cash_refunds DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN informal_cash_refunds DECIMAL(12,2) DEFAULT 0;

-- Backward compatibility: migrar cash_sales existentes a formal
UPDATE cash_sessions
SET formal_cash_sales = cash_sales,
    informal_cash_sales = 0
WHERE formal_cash_sales = 0;

CREATE INDEX idx_sales_fiscal_status ON sales(fiscal_status);
```

**Service Extension**:
```typescript
// Extender cashSessionService.ts
export async function recordCashSale(
  moneyLocationId: string,
  amount: number,
  fiscalStatus: 'FORMAL' | 'INFORMAL' = 'FORMAL'  // ← Nuevo parámetro
): Promise<void> {
  const session = await getActiveCashSession(moneyLocationId);

  if (!session) {
    throw new Error('No active cash session');
  }

  const amountDec = DecimalUtils.fromValue(amount, 'financial');

  // Actualizar campo correcto según fiscal status
  const field = fiscalStatus === 'FORMAL' ? 'formal_cash_sales' : 'informal_cash_sales';
  const currentSales = DecimalUtils.fromValue(session[field] || 0, 'financial');
  const newSales = DecimalUtils.add(currentSales, amountDec, 'financial');

  await supabase
    .from('cash_sessions')
    .update({
      [field]: DecimalUtils.toNumber(newSales),
      // También actualizar total para backward compatibility
      cash_sales: DecimalUtils.toNumber(
        DecimalUtils.add(
          DecimalUtils.fromValue(session.formal_cash_sales || 0, 'financial'),
          DecimalUtils.fromValue(session.informal_cash_sales || 0, 'financial'),
          'financial'
        )
      )
    })
    .eq('id', session.id);
}

// Nueva función: Get reports separados
export async function getCashSessionReport(sessionId: string) {
  const session = await getCashSession(sessionId);

  return {
    // Formal (con factura)
    formal: {
      sales: session.formal_cash_sales || 0,
      refunds: session.formal_cash_refunds || 0,
      net: (session.formal_cash_sales || 0) - (session.formal_cash_refunds || 0)
    },

    // Informal (sin factura)
    informal: {
      sales: session.informal_cash_sales || 0,
      refunds: session.informal_cash_refunds || 0,
      net: (session.informal_cash_sales || 0) - (session.informal_cash_refunds || 0)
    },

    // Total (caja física)
    total: {
      sales: session.cash_sales || 0,
      refunds: session.cash_refunds || 0,
      net: (session.cash_sales || 0) - (session.cash_refunds || 0)
    }
  };
}
```

**UI: Disclaimer Legal**:
```typescript
// src/pages/admin/finance/cash/components/DualEconomyDisclaimer.tsx
import { Alert, AlertTitle, AlertDescription } from '@chakra-ui/react';

export const DualEconomyDisclaimer = () => (
  <Alert status="warning" variant="left-accent" mb={4}>
    <AlertTitle>⚠️ Aviso Legal - Cumplimiento Fiscal</AlertTitle>
    <AlertDescription>
      G-Admin permite registrar ventas informales (sin factura) <strong>solo para análisis interno y control de caja física</strong>.
      <br/><br/>
      <strong>Es responsabilidad del usuario</strong> cumplir con AFIP/ARCA:
      <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
        <li>Emitir factura electrónica por ventas sujetas a IVA</li>
        <li>Mantener Controlador Fiscal habilitado (si aplica)</li>
        <li>Declarar todos los ingresos en formularios fiscales</li>
      </ul>
      <br/>
      G-Admin <strong>NO se hace responsable</strong> del uso indebido de esta funcionalidad.
    </AlertDescription>
  </Alert>
);
```

**UI: Toggle en Sales**:
```typescript
// En SaleFormModal
const [fiscalStatus, setFiscalStatus] = useState<'FORMAL' | 'INFORMAL'>('FORMAL');

<FormControl>
  <FormLabel>¿Emitir factura?</FormLabel>
  <RadioGroup value={fiscalStatus} onChange={setFiscalStatus}>
    <Stack direction="row">
      <Radio value="FORMAL">Sí (con factura)</Radio>
      <Radio value="INFORMAL">No (sin factura)</Radio>
    </Stack>
  </RadioGroup>

  {fiscalStatus === 'INFORMAL' && (
    <FormHelperText color="orange.500">
      ⚠️ Esta venta NO será declarada ante AFIP. Solo para uso interno.
    </FormHelperText>
  )}
</FormControl>
```

**Tiempo**: 2-3 días
**Impacto**: 🟡 MEDIUM - Nice to have para Argentina, no urgente

---

## 📦 PHASE 2: Analytics Dashboard (2 semanas)

### 2.1 Dashboard Consolidado con KPIs

**Usar engines existentes + agregar real-time**:

```typescript
// src/pages/admin/core/dashboard/components/CashFlowDashboard.tsx
import { useEffect, useState } from 'react';
import { AnalyticsEngine } from '@/shared/services/AnalyticsEngine';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

interface CashKPIs {
  // Today
  todaySales: number;
  todayCashIn: number;
  todayVariance: number;

  // Session
  activeSessionsCount: number;
  longestOpenSession: number;  // hours

  // Trends (vs. yesterday)
  salesTrend: 'up' | 'down' | 'stable';
  salesTrendPercent: number;
}

export const CashFlowDashboard = () => {
  const [kpis, setKPIs] = useState<CashKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKPIs();

    // Refresh every 30 seconds
    const interval = setInterval(loadKPIs, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadKPIs = async () => {
    try {
      // Usar AnalyticsEngine existente
      const today = new Date().toISOString().split('T')[0];
      const { data: todaySessions } = await supabase
        .from('cash_sessions')
        .select('*')
        .gte('opened_at', `${today}T00:00:00`)
        .order('opened_at', { ascending: false });

      // Calcular KPIs
      const todaySales = todaySessions?.reduce(
        (sum, s) => DecimalUtils.add(sum, DecimalUtils.fromValue(s.cash_sales || 0, 'financial'), 'financial'),
        DecimalUtils.fromValue(0, 'financial')
      ).toNumber() || 0;

      const todayVariance = todaySessions?.reduce(
        (sum, s) => DecimalUtils.add(sum, DecimalUtils.fromValue(s.variance || 0, 'financial'), 'financial'),
        DecimalUtils.fromValue(0, 'financial')
      ).toNumber() || 0;

      const activeCount = todaySessions?.filter(s => s.status === 'OPEN').length || 0;

      // Trend vs. yesterday
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const { data: yesterdaySessions } = await supabase
        .from('cash_sessions')
        .select('cash_sales')
        .gte('opened_at', `${yesterday}T00:00:00`)
        .lt('opened_at', `${today}T00:00:00`);

      const yesterdaySales = yesterdaySessions?.reduce(
        (sum, s) => sum + (s.cash_sales || 0),
        0
      ) || 0;

      const trendPercent = yesterdaySales > 0
        ? ((todaySales - yesterdaySales) / yesterdaySales) * 100
        : 0;

      const trend = Math.abs(trendPercent) < 5 ? 'stable'
        : trendPercent > 0 ? 'up' : 'down';

      setKPIs({
        todaySales,
        todayCashIn: todaySales,  // Simplificado
        todayVariance,
        activeSessionsCount: activeCount,
        longestOpenSession: 0,  // TODO: calculate
        salesTrend: trend,
        salesTrendPercent: Math.abs(trendPercent)
      });

    } catch (error) {
      logger.error('Dashboard', 'Failed to load KPIs', { error });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <Grid templateColumns="repeat(4, 1fr)" gap={4}>
      <StatCard
        label="Ventas Hoy"
        value={`$${kpis?.todaySales.toFixed(2)}`}
        trend={kpis?.salesTrend}
        trendValue={`${kpis?.salesTrendPercent.toFixed(1)}% vs. ayer`}
      />
      <StatCard
        label="Varianza Hoy"
        value={`$${Math.abs(kpis?.todayVariance || 0).toFixed(2)}`}
        status={Math.abs(kpis?.todayVariance || 0) > 50 ? 'error' : 'success'}
      />
      <StatCard
        label="Cajas Abiertas"
        value={kpis?.activeSessionsCount.toString() || '0'}
      />
      <StatCard
        label="Caja más Antigua"
        value={`${kpis?.longestOpenSession}h`}
      />
    </Grid>
  );
};
```

**Tiempo**: 4-5 días
**Impacto**: 🟡 MEDIUM - Mejora UX, no crítico

---

## 📦 PHASE 3: Mejoras Futuras (Backlog)

Estas NO son urgentes, puedes hacerlas cuando tengas tiempo/equipo:

1. **Three-Way Reconciliation** (3-4 weeks)
   - Match POS ⟷ Gateway ⟷ Bank
   - Requiere integración con payment gateways

2. **Dynamic Variance Detection** (1-2 weeks)
   - Z-score calculation
   - Historical pattern analysis

3. **AFIP Integration** (3-4 weeks)
   - Controlador Fiscal
   - CAE request
   - Weekly reports

4. **Event Sourcing** (4-5 weeks) ❌ **NO RECOMIENDO** sin equipo grande

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Phase 1 (1-2 semanas)
- [ ] Payment Reversals (sales + payroll)
- [ ] Non-Cash Payment Accounting
- [ ] Idempotency Service
- [ ] Dual Recording (opcional)
- [ ] Tests (90%+ coverage)

### Phase 2 (2 semanas)
- [ ] Dashboard consolidado con KPIs
- [ ] Real-time refresh (30s polling)
- [ ] Trend indicators
- [ ] Mobile responsive

### Deploy Checklist
- [ ] Database migrations tested
- [ ] Rollback plan documented
- [ ] Monitoring configured
- [ ] Feature flags ready

---

## 📊 MÉTRICAS DE ÉXITO

**Financial Accuracy**:
- ✅ Zero duplicate transactions (idempotency)
- ✅ All payment types accounted (CASH + non-CASH)
- ✅ Reversals work correctly

**Operational Efficiency**:
- ✅ Dashboard loads < 2 seconds
- ✅ KPIs update every 30 seconds
- ✅ 95%+ users find dashboard useful

---

## 🚨 LO QUE **NO** VAMOS A HACER (Simplificación)

❌ **Event Sourcing** - Demasiado grande (4-5 weeks), no tienes equipo
❌ **Three-Way Reconciliation** - No urgente, puede esperar
❌ **ML Variance Detection** - Overkill, threshold fijo funciona
❌ **AFIP Integration completa** - No es blocker para launch
❌ **Multi-Currency** - No es prioritario ahora

---

## 🏗️ INTEGRACIÓN OPERATIVA (Resumen)

### Coordinación Shift ⟷ Cash (Ver CASH_OPERATIONAL_FLOWS.md)

**Modelo Elegido**: **Semi-Acoplado con UX Inteligente**

```
ABRIR SHIFT:
├─ Manager abre shift operacional
├─ Sistema sugiere: "¿Abrir caja principal?" (CTA prominente)
├─ Manager decide cuándo/cuántas cajas abrir
└─ Cada empleado firma digitalmente al recibir su caja

DURANTE SHIFT:
├─ CASH → va a cash_session del empleado (individual)
├─ NO-CASH → va a shift_payments (nivel shift)
└─ Empleado es responsable de SU caja, NO de otras

CERRAR SHIFT:
├─ Validación: TODAS las cajas deben estar cerradas
├─ Blocker si hay cajas abiertas (línea 193-206 en shiftService.ts)
└─ Solo después → shift puede cerrarse con resumen consolidado
```

**Arqueo del Turno** = Suma de arqueos individuales de cada caja

---

## 📚 DOCUMENTOS RELACIONADOS

### Ejecutables

1. **FINANCE_DOMAIN_AUDIT.md** ✅ - Auditoría completa (lectura requerida)
2. **CASH_OPERATIONAL_FLOWS.md** ✅ - Diseño operativo (lectura requerida)
3. **CASH_FINANCIAL_SYSTEM_FINAL_PLAN.md** ✅ - Este documento (implementación)

### Research (Archivados - NO ejecutables)

- `CASH_FINANCIAL_INTEGRATION_MASTER_PROMPT.md` - Research inicial
- `CASH_SYSTEM_RESEARCH_ANALYSIS_2025.md` - Validación industry
- `CASH_SYSTEM_DEEP_DIVE_PRECISION_TAX_ANALYTICS.md` - Deep dive técnico

---

**Document Version**: 2.0 FINAL (Updated with Operational Flows)
**Last Updated**: 2025-12-10
**Status**: Ready to implement - DB Schema Ready ✅
**Estimated Effort**: 3-4 weeks total (Phase 1 + Phase 2)
**Database Changes**: Applied ✅ (employee_id, shift_id, shift_payments, operation_locks)
