# 🔍 CASH & FINANCIAL SYSTEM - RESEARCH ANALYSIS & VALIDATION

**Date**: 2025-12-09
**Research Sources**: ERP systems (SAP, Oracle, NetSuite), POS industry leaders, Financial compliance standards, Argentina AFIP requirements
**Purpose**: Validate and enrich cash management architecture proposal

---

## 📊 RESEARCH SUMMARY

### Sources Analyzed

1. **ERP Systems**: [Oracle NetSuite](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_164863634930.html), [SAP](https://www.actouch.com/erpdocs/financial-management/double-entry-accounting-system/), [Dynamics 365](https://learn.microsoft.com/en-us/dynamics365/commerce/cash-mgmt)
2. **POS Reconciliation**: [SolveXia](https://www.solvexia.com/glossary/pos-reconciliation), [ConnectPOS](https://www.connectpos.com/pos-reconciliation/), [Evention](https://www.eventionllc.com/pos-reconciliation-guide/)
3. **Payment Gateways**: [Stripe Architecture](https://newsletter.pragmaticengineer.com/p/designing-a-payment-system), [Square Engineering](https://multithreaded.stitchfix.com/blog/2017/06/26/patterns-of-soa-idempotency-key/)
4. **Restaurant Systems**: [SynergySuite](https://www.synergysuite.com/module/restaurant-cash-management/), [Restaurant365](https://www.restaurant365.com/inventory/cash-management/), [Toast POS](https://pos.toasttab.com/blog/restaurant-cash-management)
5. **Compliance & Audit**: [AuditBoard](https://auditboard.com/blog/what-is-an-audit-trail), [InScope](https://www.inscopehq.com/post/audit-trail-requirements-guidelines-for-compliance-and-best-practices)
6. **Bank Reconciliation**: [HighRadius](https://www.highradius.com/product/bank-reconciliation-software/), [Cashbook](https://www.cashbook.com/auto-matching-algorithms-in-accounts-reconciliation/)
7. **Argentina AFIP**: [AFIP RG 3561](https://servicios.infoleg.gob.ar/infolegInternet/anexos/220000-224999/223930/texact.htm), [EDICOM](https://edicomgroup.com/blog/electronic-invoice-argentina), [Storecove](https://www.storecove.com/blog/en/e-invoicing-in-argentina/)
8. **Event Sourcing**: [Mia-Platform](https://mia-platform.eu/blog/understanding-event-sourcing-and-cqrs-pattern/), [Arkency](https://blog.arkency.com/audit-log-with-event-sourcing/)
9. **Idempotency**: [Cockroach Labs](https://www.cockroachlabs.com/blog/idempotency-in-finance/), [Stripe Blog](https://stripe.com/blog/idempotency), [Modern Treasury](https://www.moderntreasury.com/journal/why-idempotency-matters-in-payments)
10. **Anomaly Detection**: [Built In](https://builtin.com/machine-learning/anomaly-detection-algorithms), [HighRadius](https://www.highradius.com/resources/Blog/transaction-data-anomaly-detection/)

---

## ✅ VALIDACIÓN DE LA PROPUESTA ORIGINAL

### 1. Double-Entry Accounting ✅ VALIDADO

**Propuesta Original**: Sistema de contabilidad de doble entrada con journal entries automáticos.

**Validación de la Industria**:
> "Double-entry accounting is the foundation of accurate financial management, ensuring that every transaction is recorded in two accounts to maintain balance" - [HashMicro](https://www.hashmicro.com/blog/double-entry-accounting/)

> "The double-entry system states that the sum of all transaction entries must be 0, providing end-to-end traceability and ensuring consistency throughout the payment cycle" - [Pragmatic Engineer](https://newsletter.pragmaticengineer.com/p/designing-a-payment-system)

**✅ Conclusión**: La arquitectura propuesta es correcta. Los ERPs modernos (NetSuite, SAP) usan exactamente este patrón.

---

### 2. Cash Sessions con Blind Counting ✅ VALIDADO

**Propuesta Original**: Cash sessions con blind counting para prevenir sesgo.

**Validación de la Industria**:
> "Blind closing is the process of closing the till after a cashier's shift and recording the collected amounts without knowing what the system amount should be, applied at big stores to prevent stealing from customers" - [Microsoft Dynamics 365](https://learn.microsoft.com/en-us/dynamics365/commerce/shift-drawer-management)

> "Systems provide complete visibility of which cashiers and managers were responsible for accounting errors through over/short status tracking" - [Restaurant365](https://www.restaurant365.com/inventory/cash-management/)

**✅ Conclusión**: Blind counting es una best practice estándar en retail y restaurantes.

---

### 3. EventBus Integration ✅ VALIDADO PARCIALMENTE

**Propuesta Original**: Integración event-driven entre sales, cash, shifts.

**Validación de la Industria**:
> "Event sourcing provides a complete audit trail where every change is recorded as an event, providing a full history of the system" - [Mia-Platform](https://mia-platform.eu/blog/understanding-event-sourcing-and-cqrs-pattern/)

> "For financial systems, audit-heavy domains, or complex business logic, event sourcing is transformative, providing complete history, perfect audit trail, and time travel debugging" - [RisingWave](https://risingwave.com/blog/mastering-cqrs-and-event-sourcing-for-modern-database-architecture/)

**⚠️ Mejora Necesaria**: La industria recomienda **Event Sourcing + CQRS** para sistemas financieros, no solo EventBus simple. Ver sección "Mejoras Propuestas" más abajo.

---

### 4. Variance Detection ✅ VALIDADO CON MEJORAS

**Propuesta Original**: Variance threshold fijo de $50.

**Validación de la Industria**:
> "Restaurant cash management systems can automatically notify managers when cash handling processes are not followed or when the disparity between cash inventory and cash sales crosses a set threshold" - [SynergySuite](https://www.synergysuite.com/module/restaurant-cash-management/)

> "Dynamic threshold estimation involves learning from past data what a good threshold looks like" - [Sinch](https://sinch.com/blog/dynamic-threshold-estimation-for-anomaly-detection/)

> "Z-scores calculate how far a data point is from the mean, in terms of standard deviations. If a data point has a Z-score that exceeds a certain threshold, it is flagged as an outlier" - [Built In](https://builtin.com/machine-learning/anomaly-detection-algorithms)

**⚠️ Mejora Necesaria**: El threshold fijo es válido pero primitivo. La industria usa **thresholds dinámicos** basados en:
- Desviación estándar histórica
- Varianza por turno/día de la semana
- Algoritmos de ML (Isolation Forest, Z-score)

---

### 5. Audit Trail ⚠️ INCOMPLETO

**Propuesta Original**: EventBus como audit trail + propuesta de tabla `cash_audit_log`.

**Validación de la Industria**:
> "Three foundational elements characterise effective accounting audit trails: comprehensive documentation, chronological ordering and immutability" - [AuditBoard](https://auditboard.com/blog/what-is-an-audit-trail)

> "Audit trails should include event records with time-stamps, user IDs, the program or command that initiated the event, and the result" - [InScope](https://www.inscopehq.com/post/audit-trail-requirements-guidelines-for-compliance-and-best-practices)

> "The immutable nature of events provides cryptographic-grade auditability where events can be digitally signed and their integrity verified, providing legal-grade evidence of what occurred and when" - [Arkency](https://blog.arkency.com/audit-log-with-event-sourcing/)

**🔴 Mejora Crítica**: Necesitamos:
1. **Inmutabilidad**: Los registros de auditoría no deben ser editables
2. **Firma digital**: Hash criptográfico de cada registro
3. **Chain of custody**: Cada evento enlazado al anterior (blockchain-like)
4. **Retención**: 7 años mínimo para compliance fiscal

---

### 6. Bank Reconciliation ❌ FALTANTE EN PROPUESTA ORIGINAL

**Propuesta Original**: Mencionado pero no implementado en detalle.

**Validación de la Industria**:
> "Payment gateway reconciliation ensures alignment across three crucial touchpoints: the order management system, the payment gateway's reports, and your bank statement" - [Optimus](https://optimus.tech/knowledge-base/payment-gateway-reconciliation-explained-or-optimus)

> "7-Eleven automated a three-way reconciliation for all 3,400+ store locations across two payment gateways, the Point of Sale (POS) system, and the bank statement. The bank reconciliation process took days and is now completed in minutes" - [SolveXia](https://www.solvexia.com/blog/what-is-payment-reconciliation)

> "AI-driven algorithms compare bank statement data with internal financial records and detect patterns, handle partial payments, and even account for slight variations in amounts (like bank fees)" - [HighRadius](https://www.highradius.com/product/transaction-matching-software/)

**🔴 Crítico**: Necesitamos implementar **Three-Way Reconciliation**:
```
POS/ERP (G-Admin) ⟷ Payment Gateway (Stripe/MercadoPago) ⟷ Bank Statement
```

---

### 7. Payment Gateway Integration ⚠️ INCOMPLETO

**Propuesta Original**: Solo CASH payments crean journal entries.

**Validación de la Industria**:
> "A payment system typically involves an API Gateway that accepts payment requests, a Transaction Processor for business logic, a Ledger that maintains financial records using double-entry bookkeeping" - [Dev.to](https://dev.to/sgchris/building-a-payment-system-stripes-architecture-for-financial-transactions-3mlg)

> "Integration systems can combine multiple payment processors like Stripe, PayPal, and CoinPayments" - [GitHub](https://github.com/byko-dev/payments_gateway)

> "An idempotency key is a unique value generated by the client that expires after a certain period, with UUIDs commonly used and recommended by companies like Stripe and PayPal" - [Cockroach Labs](https://www.cockroachlabs.com/blog/idempotency-in-finance/)

**🔴 Crítico**: Necesitamos:
1. **Idempotency keys** para prevenir duplicate charges
2. **Webhook handlers** para async payment confirmations
3. **Retry logic** con exponential backoff
4. **Journal entries para TODOS los payment methods** (CARD, QR, TRANSFER)

---

## 🆕 MEJORAS PROPUESTAS (Basadas en Research)

### 1. ⭐ Event Sourcing + CQRS Architecture

**Problema Actual**: EventBus simple sin persistencia de eventos.

**Solución de la Industria**:
> "Most serious systems including financial and banking systems do not emphasize the concept of current state or final state - for example, a bank account is not just a column in a table but the sum of all transactions that occurred with the account" - [Exato Software](https://exatosoftware.com/the-event-sourcing-pattern/)

> "Event sourcing provides temporal query capability - the ability to determine the state of the system at any point in time, and event replay - the capacity to reconstruct state by replaying events" - [Smily](https://www.smily.com/engineering/introduction-to-event-sourcing-and-cqrs)

**Propuesta Mejorada**:

```typescript
// Event Store Table (Append-only, immutable)
CREATE TABLE event_store (
  id BIGSERIAL PRIMARY KEY,
  event_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),

  -- Event identity
  aggregate_type TEXT NOT NULL,  -- 'CashSession', 'Sale', 'Payment'
  aggregate_id UUID NOT NULL,    -- Session ID, Sale ID, etc.
  event_type TEXT NOT NULL,      -- 'SessionOpened', 'PaymentReceived'
  event_version INT NOT NULL,    -- For schema evolution

  -- Event data
  event_data JSONB NOT NULL,     -- Full event payload
  metadata JSONB,                -- User, IP, timestamp, etc.

  -- Ordering
  sequence_number BIGINT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Immutability
  event_hash TEXT NOT NULL,      -- SHA-256 of (prev_hash + event_data)
  prev_event_hash TEXT,          -- Chain to previous event (blockchain-like)

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT event_store_sequence UNIQUE (aggregate_type, aggregate_id, sequence_number)
);

-- Read Model Tables (Projections - can be rebuilt from events)
CREATE TABLE cash_session_projection (
  id UUID PRIMARY KEY,
  -- Current state (rebuilt from events)
  status TEXT NOT NULL,
  starting_cash DECIMAL(12,2),
  cash_sales DECIMAL(12,2),
  -- ... etc
  last_event_sequence BIGINT NOT NULL,
  FOREIGN KEY (id, last_event_sequence)
    REFERENCES event_store(aggregate_id, sequence_number)
);
```

**Benefits**:
1. ✅ Complete audit trail by design (every change is an event)
2. ✅ Time travel: reconstruct state at any point in history
3. ✅ Event replay: rebuild projections if corrupted
4. ✅ Immutability: events never deleted, only appended
5. ✅ Cryptographic verification with event hashing chain

---

### 2. ⭐ Three-Way Reconciliation Service

**Problema Actual**: Solo reconciliación local (POS ⟷ Cash Session).

**Solución de la Industria**:
> "A complete reconciliation system must also account for complexities like refunds, chargebacks, and settlement delays. These are often processed separately by payment gateways and may appear in reports several days after the original transaction" - [SolveXia](https://www.solvexia.com/blog/what-is-payment-reconciliation)

**Propuesta Mejorada**:

```typescript
/**
 * Three-Way Reconciliation Service
 *
 * Matches:
 * 1. Internal Sales (G-Admin)
 * 2. Payment Gateway Reports (Stripe/MercadoPago)
 * 3. Bank Statements (CSV/OFX import)
 */

interface ReconciliationRecord {
  id: string;
  transaction_date: Date;

  // Source 1: Internal (G-Admin)
  internal_sale_id?: string;
  internal_amount?: number;
  internal_payment_method?: string;

  // Source 2: Gateway
  gateway_transaction_id?: string;
  gateway_amount?: number;
  gateway_fee?: number;
  gateway_net_amount?: number;
  gateway_status?: 'pending' | 'succeeded' | 'failed';

  // Source 3: Bank
  bank_transaction_id?: string;
  bank_amount?: number;
  bank_description?: string;

  // Matching
  match_status: 'matched' | 'partial' | 'unmatched' | 'conflict';
  match_confidence: number; // 0-100%
  variance?: number;

  // Resolution
  resolution_status?: 'pending' | 'approved' | 'rejected';
  resolution_notes?: string;
  resolved_by?: string;
  resolved_at?: Date;
}

export async function performThreeWayReconciliation(params: {
  startDate: Date;
  endDate: Date;
  paymentMethods?: string[];
  autoResolveThreshold?: number; // Auto-approve if variance < threshold
}) {
  // 1. Fetch internal sales
  const internalSales = await fetchInternalSales(params.startDate, params.endDate);

  // 2. Fetch gateway reports (Stripe, MercadoPago, etc.)
  const gatewayTransactions = await fetchGatewayTransactions(params);

  // 3. Fetch bank statements (imported by user or auto-fetched)
  const bankTransactions = await fetchBankTransactions(params);

  // 4. Match using fuzzy logic
  const matches = await smartMatcher({
    internal: internalSales,
    gateway: gatewayTransactions,
    bank: bankTransactions,
    matchingRules: [
      { field: 'amount', tolerance: 0.01 },
      { field: 'date', tolerance: '3 days' }, // Settlement delay
      { field: 'reference', similarity: 0.8 }
    ]
  });

  // 5. Calculate variances
  const variances = matches.filter(m => m.variance > params.autoResolveThreshold);

  // 6. Auto-resolve small variances
  const autoResolved = matches.filter(m =>
    m.match_status === 'matched' &&
    m.variance <= params.autoResolveThreshold
  );

  await bulkUpdateReconciliationStatus(autoResolved, 'approved');

  return {
    total: matches.length,
    matched: matches.filter(m => m.match_status === 'matched').length,
    partial: matches.filter(m => m.match_status === 'partial').length,
    unmatched: matches.filter(m => m.match_status === 'unmatched').length,
    autoResolved: autoResolved.length,
    requiresReview: variances.length,
    totalVariance: variances.reduce((sum, v) => sum + v.variance, 0)
  };
}
```

**Matching Algorithm** (inspirado en HighRadius y Cashbook):

```typescript
interface MatchingRule {
  field: 'amount' | 'date' | 'reference' | 'description';
  weight: number; // 0-1 (importance)
  tolerance?: number | string;
  similarity?: number; // For fuzzy text matching (0-1)
}

async function smartMatcher(params: {
  internal: Transaction[];
  gateway: Transaction[];
  bank: Transaction[];
  matchingRules: MatchingRule[];
}) {
  const matches: ReconciliationRecord[] = [];

  for (const internal of params.internal) {
    // Find potential gateway match
    const gatewayMatch = params.gateway.find(g => {
      const amountMatch = Math.abs(g.amount - internal.amount) <= 0.01;
      const dateMatch = Math.abs(g.date - internal.date) <= 3 * 86400000; // 3 days
      const refMatch = g.reference?.includes(internal.id);

      return amountMatch && dateMatch && (refMatch || true);
    });

    // Find potential bank match
    const bankMatch = params.bank.find(b => {
      if (!gatewayMatch) return false;

      // Bank should match gateway net amount (amount - fees)
      const netAmount = gatewayMatch.amount - (gatewayMatch.fee || 0);
      const amountMatch = Math.abs(b.amount - netAmount) <= 0.01;
      const dateMatch = Math.abs(b.date - gatewayMatch.settled_date) <= 86400000; // 1 day

      return amountMatch && dateMatch;
    });

    // Calculate match confidence using weighted rules
    const confidence = calculateMatchConfidence(internal, gatewayMatch, bankMatch, params.matchingRules);

    // Determine match status
    let status: ReconciliationRecord['match_status'];
    if (gatewayMatch && bankMatch) status = 'matched';
    else if (gatewayMatch || bankMatch) status = 'partial';
    else status = 'unmatched';

    // Calculate variance
    const variance = calculateVariance(internal, gatewayMatch, bankMatch);

    matches.push({
      id: generateId(),
      transaction_date: internal.date,
      internal_sale_id: internal.id,
      internal_amount: internal.amount,
      gateway_transaction_id: gatewayMatch?.id,
      gateway_amount: gatewayMatch?.amount,
      gateway_fee: gatewayMatch?.fee,
      bank_transaction_id: bankMatch?.id,
      bank_amount: bankMatch?.amount,
      match_status: status,
      match_confidence: confidence,
      variance
    });
  }

  return matches;
}
```

---

### 3. ⭐ Idempotency Key Pattern

**Problema Actual**: Sin protección contra duplicate transactions.

**Solución de la Industria**:
> "When performing a request, a client generates a unique ID to identify just that operation and sends it up to the server along with the normal payload. The server receives the ID and correlates it with the state of the request on its end" - [Stitch Fix](https://multithreaded.stitchfix.com/blog/2017/06/26/patterns-of-soa-idempotency-key/)

> "State machines keep track of the current status of any payment. State machines enforce the sequence of steps a payment can take, so that a payment cannot be processed twice" - [Modern Treasury](https://www.moderntreasury.com/journal/why-idempotency-matters-in-payments)

**Propuesta Mejorada**:

```typescript
// Idempotency Keys Table
CREATE TABLE idempotency_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Key identity
  idempotency_key TEXT UNIQUE NOT NULL,
  scope TEXT NOT NULL, -- 'payment', 'cash_session', 'journal_entry'
  user_id UUID NOT NULL,

  -- Request
  request_path TEXT NOT NULL,
  request_params JSONB NOT NULL,

  -- Response
  response_status INT,           -- HTTP status code
  response_body JSONB,

  -- State machine
  status TEXT NOT NULL,          -- 'started', 'processing', 'succeeded', 'failed'

  -- Locking (prevent concurrent execution)
  locked_at TIMESTAMPTZ,

  -- Expiration
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours',

  CONSTRAINT idempotency_keys_expired CHECK (expires_at > created_at)
);

CREATE INDEX idx_idempotency_keys_lookup ON idempotency_keys(idempotency_key, scope);
CREATE INDEX idx_idempotency_keys_expiration ON idempotency_keys(expires_at) WHERE status = 'processing';
```

**Service Implementation**:

```typescript
/**
 * Idempotent Payment Service
 * Inspired by Stripe's architecture
 */

export async function processPaymentIdempotent(params: {
  idempotencyKey: string;
  saleId: string;
  amount: number;
  paymentMethod: string;
  userId: string;
}) {
  // 1. Check if operation already executed
  const existing = await supabase
    .from('idempotency_keys')
    .select('*')
    .eq('idempotency_key', params.idempotencyKey)
    .eq('scope', 'payment')
    .single();

  if (existing.data) {
    // Already processed
    if (existing.data.status === 'succeeded') {
      return {
        success: true,
        payment: existing.data.response_body,
        fromCache: true
      };
    }

    if (existing.data.status === 'failed') {
      throw new Error(`Previous attempt failed: ${existing.data.response_body.error}`);
    }

    if (existing.data.status === 'processing') {
      // Another instance is processing, wait and retry
      await sleep(100);
      return processPaymentIdempotent(params); // Recursive retry
    }
  }

  // 2. Create idempotency key record (atomic)
  const { data: key, error } = await supabase
    .from('idempotency_keys')
    .insert({
      idempotency_key: params.idempotencyKey,
      scope: 'payment',
      user_id: params.userId,
      request_path: '/api/payments',
      request_params: params,
      status: 'processing',
      locked_at: new Date()
    })
    .single();

  if (error) {
    // Race condition: another instance created key first
    return processPaymentIdempotent(params); // Retry
  }

  try {
    // 3. Process payment (business logic)
    const payment = await processPaymentInternal({
      saleId: params.saleId,
      amount: params.amount,
      paymentMethod: params.paymentMethod
    });

    // 4. Mark as succeeded
    await supabase
      .from('idempotency_keys')
      .update({
        status: 'succeeded',
        response_status: 200,
        response_body: payment
      })
      .eq('id', key.id);

    return {
      success: true,
      payment,
      fromCache: false
    };

  } catch (error) {
    // 5. Mark as failed
    await supabase
      .from('idempotency_keys')
      .update({
        status: 'failed',
        response_status: 500,
        response_body: { error: error.message }
      })
      .eq('id', key.id);

    throw error;
  }
}
```

---

### 4. ⭐ Dynamic Variance Detection

**Problema Actual**: Threshold fijo de $50.

**Solución de la Industria**:
> "Dynamic threshold estimation involves learning from past data what a good threshold looks like. In practice, increasing the boundary by 50% – or multiplying the boundary by 1.5 – gave the best results" - [Sinch](https://sinch.com/blog/dynamic-threshold-estimation-for-anomaly-detection/)

> "Z-scores calculate how far a data point is from the mean, in terms of standard deviations. If a data point has a Z-score that exceeds a certain threshold, it is flagged as an outlier" - [Built In](https://builtin.com/machine-learning/anomaly-detection-algorithms)

**Propuesta Mejorada**:

```typescript
/**
 * Dynamic Variance Detection Service
 * Uses statistical methods to detect anomalies
 */

interface VarianceAnalysis {
  variance: number;
  severity: 'NORMAL' | 'WARNING' | 'ERROR' | 'CRITICAL';
  z_score: number;
  percentile: number;
  historical_avg: number;
  historical_stddev: number;
  recommendation: string;
}

export async function analyzeVariance(params: {
  sessionId: string;
  actualCash: number;
  expectedCash: number;
  locationId: string;
  userId: string;
}): Promise<VarianceAnalysis> {
  const variance = params.actualCash - params.expectedCash;

  // 1. Fetch historical variances (last 90 days)
  const { data: history } = await supabase
    .from('cash_sessions')
    .select('variance')
    .eq('money_location_id', params.locationId)
    .eq('status', 'CLOSED')
    .gte('closed_at', new Date(Date.now() - 90 * 86400000).toISOString())
    .order('closed_at', { ascending: false })
    .limit(100);

  if (!history || history.length < 10) {
    // Not enough data, use fixed thresholds
    return {
      variance,
      severity: Math.abs(variance) > 100 ? 'CRITICAL' :
                Math.abs(variance) > 50 ? 'ERROR' :
                Math.abs(variance) > 10 ? 'WARNING' : 'NORMAL',
      z_score: 0,
      percentile: 0,
      historical_avg: 0,
      historical_stddev: 0,
      recommendation: 'Insufficient historical data for dynamic analysis'
    };
  }

  // 2. Calculate statistical measures
  const variances = history.map(h => h.variance || 0);
  const mean = variances.reduce((sum, v) => sum + v, 0) / variances.length;
  const stddev = Math.sqrt(
    variances.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / variances.length
  );

  // 3. Calculate Z-score
  const z_score = stddev > 0 ? (variance - mean) / stddev : 0;

  // 4. Calculate percentile
  const sortedVariances = [...variances].sort((a, b) => Math.abs(a) - Math.abs(b));
  const percentile = (sortedVariances.filter(v => Math.abs(v) <= Math.abs(variance)).length / variances.length) * 100;

  // 5. Determine severity using Z-score
  let severity: VarianceAnalysis['severity'];
  if (Math.abs(z_score) > 3) severity = 'CRITICAL';      // > 3 std dev
  else if (Math.abs(z_score) > 2) severity = 'ERROR';    // > 2 std dev
  else if (Math.abs(z_score) > 1) severity = 'WARNING';  // > 1 std dev
  else severity = 'NORMAL';

  // 6. Generate recommendation
  let recommendation: string;
  if (severity === 'CRITICAL') {
    recommendation = `Variance is ${Math.abs(z_score).toFixed(1)}x higher than normal. Requires immediate supervisor review and investigation.`;
  } else if (severity === 'ERROR') {
    recommendation = `Variance is ${Math.abs(z_score).toFixed(1)}x higher than normal. Review cash handling procedures with cashier.`;
  } else if (severity === 'WARNING') {
    recommendation = `Variance is slightly elevated. Monitor for patterns.`;
  } else {
    recommendation = `Variance is within normal range. Session can be auto-approved.`;
  }

  // 7. Check for patterns (day of week, time of day)
  const dayOfWeek = new Date().getDay();
  const sameDayHistory = history.filter(h => new Date(h.closed_at).getDay() === dayOfWeek);
  if (sameDayHistory.length >= 5) {
    const sameDayMean = sameDayHistory.reduce((sum, h) => sum + (h.variance || 0), 0) / sameDayHistory.length;
    if (Math.abs(variance - sameDayMean) < stddev * 0.5) {
      recommendation += ` Note: Similar pattern observed on previous ${getDayName(dayOfWeek)}s.`;
    }
  }

  return {
    variance,
    severity,
    z_score,
    percentile,
    historical_avg: mean,
    historical_stddev: stddev,
    recommendation
  };
}

/**
 * Isolation Forest Algorithm for Anomaly Detection
 * (Advanced ML approach for production systems)
 */
export async function detectAnomaliesML(params: {
  locationId: string;
  lookbackDays?: number;
}) {
  // This would use a ML library like TensorFlow.js or call a Python microservice
  // For now, we'll use a simplified heuristic approach

  const lookback = params.lookbackDays || 90;
  const cutoff = new Date(Date.now() - lookback * 86400000);

  const { data: sessions } = await supabase
    .from('cash_sessions')
    .select('*')
    .eq('money_location_id', params.locationId)
    .gte('opened_at', cutoff.toISOString())
    .eq('status', 'CLOSED');

  // Feature extraction
  const features = sessions.map(s => ({
    variance: s.variance || 0,
    variance_percentage: ((s.variance || 0) / s.starting_cash) * 100,
    session_duration: (new Date(s.closed_at).getTime() - new Date(s.opened_at).getTime()) / 3600000, // hours
    cash_sales: s.cash_sales || 0,
    cash_drops: s.cash_drops || 0,
    drop_ratio: s.cash_drops / (s.cash_sales || 1),
    day_of_week: new Date(s.opened_at).getDay(),
    hour_of_day: new Date(s.opened_at).getHours()
  }));

  // Simplified anomaly scoring (in production, use proper Isolation Forest)
  const anomalies = features.filter(f => {
    // High variance
    if (Math.abs(f.variance) > 100) return true;

    // Excessive drops (> 80% of sales)
    if (f.drop_ratio > 0.8) return true;

    // Long session (> 16 hours)
    if (f.session_duration > 16) return true;

    // Unusual timing (outside business hours)
    if (f.hour_of_day < 6 || f.hour_of_day > 23) return true;

    return false;
  });

  return {
    totalSessions: sessions.length,
    anomaliesDetected: anomalies.length,
    anomalyRate: (anomalies.length / sessions.length) * 100,
    anomalies
  };
}
```

---

### 5. ⭐ Cash Drawer Accountability (Multi-User)

**Problema Actual**: No hay gestión de turnos con múltiples cajeros.

**Solución de la Industria**:
> "Many retailers prefer allowing only one user per shift to guarantee the highest level of accountability for cash, as that user can be held solely responsible for any discrepancies. The only way to ensure accountability and prevent theft is to assign one person at a time to handle the till" - [Retail Dogma](https://www.retaildogma.com/balancing-a-cash-drawer/)

> "To sign in to and use a shift that was opened by another user, a user must have the Allow multiple shift logon POS permission" - [Microsoft Dynamics 365](https://learn.microsoft.com/en-us/dynamics365/commerce/shift-drawer-management)

> "A till spot check is an audit procedure where a manager suddenly stops operations at a specific till, opens it and counts the amount, then compares that amount with the system amount" - [The CFO Club](https://thecfoclub.com/operational-finance/how-to-balance-cash-register/)

**Propuesta Mejorada**:

```typescript
/**
 * Multi-User Cash Drawer Accountability
 *
 * Tracks individual cashier responsibility within shared session
 */

// Schema Extension
CREATE TABLE cash_drawer_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Session reference
  cash_session_id UUID NOT NULL REFERENCES cash_sessions(id),

  -- Cashier
  cashier_id UUID NOT NULL REFERENCES auth.users(id),
  cashier_name TEXT NOT NULL,

  -- Shift details
  shift_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  shift_end TIMESTAMPTZ,

  -- Accountability
  starting_balance DECIMAL(12,2) NOT NULL,  -- When cashier took over
  ending_balance DECIMAL(12,2),              -- When cashier handed off
  sales_during_shift DECIMAL(12,2),
  refunds_during_shift DECIMAL(12,2),
  expected_ending_balance DECIMAL(12,2),
  variance DECIMAL(12,2),

  -- Spot checks (mid-shift audits)
  spot_checks JSONB DEFAULT '[]',

  -- Handover
  handed_to_cashier_id UUID REFERENCES auth.users(id),
  handover_verified_by UUID REFERENCES auth.users(id),
  handover_notes TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'audited'

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

// Service
export async function cashierShiftHandover(params: {
  sessionId: string;
  currentCashierId: string;
  nextCashierId: string;
  supervisorId: string; // Must verify handover
  actualCashCount: number;
}) {
  // 1. Close current cashier's shift
  const currentShift = await supabase
    .from('cash_drawer_logs')
    .select('*')
    .eq('cash_session_id', params.sessionId)
    .eq('cashier_id', params.currentCashierId)
    .eq('status', 'active')
    .single();

  if (!currentShift.data) {
    throw new Error('No active shift found for cashier');
  }

  // 2. Calculate expected balance
  const expected = currentShift.data.starting_balance +
                   currentShift.data.sales_during_shift -
                   currentShift.data.refunds_during_shift;

  const variance = params.actualCashCount - expected;

  // 3. Close current shift
  await supabase
    .from('cash_drawer_logs')
    .update({
      shift_end: new Date(),
      ending_balance: params.actualCashCount,
      expected_ending_balance: expected,
      variance: variance,
      handed_to_cashier_id: params.nextCashierId,
      handover_verified_by: params.supervisorId,
      status: 'completed'
    })
    .eq('id', currentShift.data.id);

  // 4. Open next cashier's shift
  const { data: nextShift } = await supabase
    .from('cash_drawer_logs')
    .insert({
      cash_session_id: params.sessionId,
      cashier_id: params.nextCashierId,
      cashier_name: await getCashierName(params.nextCashierId),
      starting_balance: params.actualCashCount, // Verified by supervisor
      status: 'active'
    })
    .single();

  // 5. Log audit event
  await logAuditEvent({
    event_type: 'CASHIER_HANDOVER',
    session_id: params.sessionId,
    metadata: {
      from_cashier: currentShift.data.cashier_name,
      to_cashier: nextShift.cashier_name,
      verified_by: await getSupervisorName(params.supervisorId),
      variance: variance,
      cash_count: params.actualCashCount
    }
  });

  // 6. Alert if variance detected
  if (Math.abs(variance) > 10) {
    await createAlert({
      type: 'HANDOVER_VARIANCE',
      severity: Math.abs(variance) > 50 ? 'ERROR' : 'WARNING',
      message: `Cashier handover variance: $${variance.toFixed(2)}`,
      cashier_id: params.currentCashierId,
      session_id: params.sessionId
    });
  }

  return {
    success: true,
    variance,
    nextShiftId: nextShift.id
  };
}

/**
 * Till Spot Check (Mid-shift audit)
 */
export async function performTillSpotCheck(params: {
  sessionId: string;
  cashierId: string;
  supervisorId: string;
  actualCount: number;
}) {
  const shift = await supabase
    .from('cash_drawer_logs')
    .select('*')
    .eq('cash_session_id', params.sessionId)
    .eq('cashier_id', params.cashierId)
    .eq('status', 'active')
    .single();

  if (!shift.data) {
    throw new Error('No active shift found');
  }

  // Calculate expected at this moment
  const expected = shift.data.starting_balance +
                   shift.data.sales_during_shift -
                   shift.data.refunds_during_shift;

  const variance = params.actualCount - expected;

  // Record spot check
  const spotCheck = {
    timestamp: new Date(),
    supervisor_id: params.supervisorId,
    expected: expected,
    actual: params.actualCount,
    variance: variance
  };

  const currentSpotChecks = shift.data.spot_checks || [];
  currentSpotChecks.push(spotCheck);

  await supabase
    .from('cash_drawer_logs')
    .update({
      spot_checks: currentSpotChecks
    })
    .eq('id', shift.data.id);

  // Alert if variance
  if (Math.abs(variance) > 5) {
    await createAlert({
      type: 'SPOT_CHECK_VARIANCE',
      severity: Math.abs(variance) > 20 ? 'ERROR' : 'WARNING',
      message: `Till spot check variance: $${variance.toFixed(2)}`,
      cashier_id: params.cashierId,
      session_id: params.sessionId,
      supervisor_id: params.supervisorId
    });
  }

  return {
    variance,
    recommendation: Math.abs(variance) > 20
      ? 'CRITICAL: Investigate immediately'
      : 'Monitor for patterns'
  };
}
```

---

## 🇦🇷 CONSIDERACIONES ESPECÍFICAS PARA ARGENTINA

### 1. AFIP Controlador Fiscal (RG 3561)

**Requisitos Legales**:
> "RG 3561 establishes requirements for subjects obligated to use 'Controlador Fiscal' (Fiscal Controller) equipment, which must be homologated by AFIP and provided exclusively by authorized supplier companies" - [AFIP InfoLEG](https://servicios.infoleg.gob.ar/infolegInternet/anexos/220000-224999/223930/texact.htm)

> "Taxpayers using new technology Fiscal Controllers must submit electronic reports weekly to AFIP" - [EDICOM](https://edicomgroup.com/blog/electronic-invoice-argentina)

> "For issuing receipts through Fiscal Controller equipment, businesses must comply with the obligations established in Resolution General 1415 and its modifications" - [AFIP RG 3561](https://www.argentina.gob.ar/sites/default/files/resolucion_general-3561-afip.pdf)

**Implicaciones para G-Admin Mini**:

```typescript
/**
 * Argentina Fiscal Controller Integration
 *
 * Implements RG 3561 compliance for electronic invoicing
 */

interface FiscalControllerConfig {
  type: 'HASAR' | 'EPSON' | 'OTHER';
  model: string;
  serialNumber: string;
  homologationCode: string; // Código de homologación AFIP
  lastReportSubmitted?: Date;
  nextReportDue?: Date;
}

interface AFIPComplianceRecord {
  id: string;
  transaction_type: 'SALE' | 'REFUND' | 'CASH_IN' | 'CASH_OUT';
  fiscal_document_type: 'FACTURA_A' | 'FACTURA_B' | 'FACTURA_C' | 'TICKET';
  fiscal_number: string; // Número de comprobante fiscal
  cae?: string; // Código de Autorización Electrónica (if using e-invoice)
  cae_expiration?: Date;
  qr_code?: string; // QR code for invoice verification
  controller_serial?: string;
  afip_report_included: boolean;
  report_submission_date?: Date;
}

// Service
export async function issueFiscalDocument(params: {
  saleId: string;
  amount: number;
  taxAmount: number;
  customerType: 'FINAL_CONSUMER' | 'MONOTRIBUTISTA' | 'RESPONSABLE_INSCRIPTO';
  customerCUIT?: string;
}) {
  // 1. Determine document type based on customer type and business category
  const docType = determineFiscalDocumentType(params.customerType);

  // 2. Generate document through fiscal controller
  const fiscalDoc = await sendToFiscalController({
    type: docType,
    amount: params.amount,
    tax: params.taxAmount,
    customer_cuit: params.customerCUIT
  });

  // 3. If using e-invoice, request CAE from AFIP
  let cae: string | undefined;
  let qrCode: string | undefined;

  if (docType === 'FACTURA_A' || docType === 'FACTURA_B') {
    const afipResponse = await requestCAEFromAFIP({
      document_type: docType,
      point_of_sale: await getBusinessPointOfSale(),
      amount: params.amount,
      tax: params.taxAmount,
      customer_cuit: params.customerCUIT
    });

    cae = afipResponse.cae;
    qrCode = generateAFIPQRCode({
      cae: cae,
      invoice_number: fiscalDoc.number,
      amount: params.amount
    });
  }

  // 4. Store compliance record
  await supabase.from('afip_compliance_records').insert({
    transaction_type: 'SALE',
    fiscal_document_type: docType,
    fiscal_number: fiscalDoc.number,
    cae: cae,
    cae_expiration: cae ? addDays(new Date(), 10) : undefined, // CAE válido 10 días
    qr_code: qrCode,
    controller_serial: fiscalDoc.controllerSerial,
    afip_report_included: false // Will be included in weekly report
  });

  // 5. Link to sale
  await supabase.from('sales').update({
    fiscal_document_number: fiscalDoc.number,
    fiscal_cae: cae
  }).eq('id', params.saleId);

  return {
    fiscalNumber: fiscalDoc.number,
    cae: cae,
    qrCode: qrCode,
    printData: fiscalDoc.printData
  };
}

/**
 * Weekly AFIP Report Submission (RG 3561 requirement)
 */
export async function submitWeeklyAFIPReport() {
  const weekAgo = new Date(Date.now() - 7 * 86400000);

  // 1. Fetch all fiscal documents from last week
  const { data: records } = await supabase
    .from('afip_compliance_records')
    .select('*')
    .gte('created_at', weekAgo.toISOString())
    .eq('afip_report_included', false);

  if (!records || records.length === 0) {
    logger.info('AFIP', 'No records to submit this week');
    return { submitted: false, reason: 'No records' };
  }

  // 2. Generate report in AFIP format (XML)
  const reportXML = generateAFIPReportXML({
    period_start: weekAgo,
    period_end: new Date(),
    records: records,
    controller_info: await getFiscalControllerConfig()
  });

  // 3. Submit to AFIP web service
  const submission = await submitToAFIPWebService({
    report_type: 'CONTROLADOR_FISCAL_SEMANAL',
    xml_data: reportXML,
    business_cuit: await getBusinessCUIT()
  });

  if (submission.success) {
    // 4. Mark records as included in report
    await supabase
      .from('afip_compliance_records')
      .update({
        afip_report_included: true,
        report_submission_date: new Date()
      })
      .in('id', records.map(r => r.id));

    // 5. Update fiscal controller config
    await supabase
      .from('fiscal_controller_config')
      .update({
        last_report_submitted: new Date(),
        next_report_due: addDays(new Date(), 7)
      });

    logger.info('AFIP', `Weekly report submitted successfully: ${records.length} records`);
  }

  return {
    submitted: submission.success,
    recordCount: records.length,
    submissionId: submission.id
  };
}
```

**Integration Requirements**:

1. **Hardware**: Support for fiscal controller brands:
   - HASAR (SMH/PT series)
   - EPSON (TM series with fiscal memory)
   - NCR, Olivetti, etc.

2. **Communication Protocols**:
   - Serial (RS-232)
   - USB
   - Network (TCP/IP for modern controllers)

3. **AFIP Web Services**:
   - CAE request (Authorization Code)
   - Weekly report submission
   - Homologation validation

4. **Storage**: 10 years retention as per AFIP requirements

---

### 2. Electronic Invoice Integration (Factura Electrónica)

**Requisitos**:
> "E-invoices are to be issued to the AFIP portal in XML format and must include a CAE code and follow AFIP's technical requirements. All e-invoices must also include a QR code" - [Storecove](https://www.storecove.com/blog/en/e-invoicing-in-argentina/)

> "Electronic invoicing is mandatory for all categories of companies, including individual taxpayers, and since April 2019 the electronic invoice has been mandatory for all companies including freelancers" - [Voxel](https://www.voxelgroup.net/compliance/guides/argentina/)

**Key Points**:

1. **CAE (Código de Autorización Electrónica)**:
   - Must be requested from AFIP for each invoice
   - Valid for 10 days
   - Required before issuing document to customer

2. **QR Code**:
   - Contains: CUIT, invoice type, POS, number, date, amount, currency, tax, CAE
   - Allows customer to verify invoice on AFIP website

3. **Document Types**:
   - **Factura A**: For Responsables Inscriptos (includes IVA separately)
   - **Factura B**: For Monotributistas and final consumers (IVA included)
   - **Factura C**: For exempt customers (no IVA)
   - **Ticket/Ticket Factura**: For small transactions

4. **Retention**: Both issuer and receiver must preserve invoices for 10 years

---

### 3. IVA (Tax) Calculation

**Argentina-specific**:
- Standard IVA rate: 21%
- Reduced rates: 10.5% (some foods, medicines), 27% (certain services)
- Tax base: Net amount (amount before IVA)

```typescript
const ARGENTINA_IVA_RATES = {
  STANDARD: 0.21,
  REDUCED: 0.105,
  INCREASED: 0.27,
  EXEMPT: 0
};

function calculateIVA(netAmount: number, category: string): number {
  const rate = ARGENTINA_IVA_RATES[category] || ARGENTINA_IVA_RATES.STANDARD;
  return netAmount * rate;
}
```

---

## 📋 CONTRASTE PROPUESTA ORIGINAL VS. RESEARCH

### Tabla Comparativa

| Aspecto | Propuesta Original | Research Industry | Veredicto | Acción |
|---------|-------------------|-------------------|-----------|--------|
| **Double-Entry Accounting** | ✅ Implementado | ✅ Best practice | ✅ VALIDADO | Mantener |
| **Cash Sessions** | ✅ Blind counting | ✅ Industry standard | ✅ VALIDADO | Mantener |
| **Variance Detection** | ⚠️ Threshold fijo $50 | ✅ Dynamic + ML | ⚠️ MEJORAR | Implementar thresholds dinámicos |
| **Audit Trail** | ⚠️ EventBus + tabla propuesta | ✅ Event Sourcing inmutable | 🔴 CRITICAL | Migrar a Event Sourcing |
| **Payment Reversals** | 🔴 TODO (stubs) | ✅ Required for compliance | 🔴 BLOCKER | Implementar URGENTE |
| **Multi-Payment Accounting** | 🔴 Solo CASH | ✅ All payment types | 🔴 BLOCKER | Implementar URGENTE |
| **Idempotency** | ❌ No existe | ✅ Critical for financial systems | 🔴 CRITICAL | Implementar |
| **Three-Way Reconciliation** | ❌ No propuesto | ✅ Industry standard | 🔴 CRITICAL | Agregar a roadmap |
| **Bank Statement Import** | ⚠️ Mencionado | ✅ CSV/OFX/BAI2 formats | ⚠️ MEJORAR | Implementar importers |
| **Multi-User Accountability** | ❌ No considerado | ✅ Shift handover best practice | ⚠️ IMPORTANTE | Agregar feature |
| **Dual Authorization** | ⚠️ Propuesto básico | ✅ Required for large variances | ⚠️ MEJORAR | Implementar workflow |
| **AFIP Integration** | ❌ No considerado | ✅ Legal requirement (Argentina) | 🔴 BLOCKER AR | Implementar fiscal controller |
| **Event Sourcing** | ❌ No propuesto | ✅ Recommended for finance | 🔴 ARCHITECTURAL | Migración gradual |
| **CQRS Pattern** | ❌ No propuesto | ✅ Often paired with Event Sourcing | ⚠️ OPCIONAL | Considerar para escala |

---

## 🎯 ROADMAP REVISADO (Con Research)

### Phase 0: AFIP Compliance (Argentina) 🇦🇷 [NUEVO]

**Priority**: 🔴 LEGAL BLOCKER for Argentina

**Duration**: 3-4 weeks

1. **Fiscal Controller Integration**
   - Hardware drivers (HASAR, EPSON)
   - Document emission (Factura A/B/C, Tickets)
   - Serial number tracking

2. **AFIP Web Service Integration**
   - CAE request system
   - XML generation for weekly reports
   - QR code generation

3. **Compliance Storage**
   - 10-year retention
   - Audit-proof storage
   - Export capabilities

**Acceptance Criteria**:
- [ ] Can emit Factura A/B/C with CAE
- [ ] Weekly reports submitted automatically
- [ ] All fiscal documents stored with 10-year retention
- [ ] QR codes generated and validated

---

### Phase 1: Critical Debt + Idempotency [ACTUALIZADO]

**Priority**: 🔴 CRITICAL

**Duration**: 2-3 weeks

1. **✅ Order Cancellation Reversal** (unchanged)

2. **✅ Payroll Cancellation Reversal** (unchanged)

3. **✅ Non-Cash Payment Accounting** (unchanged)

4. **⭐ Idempotency Key Implementation** [NUEVO]
   - Create `idempotency_keys` table
   - Implement idempotent payment service
   - Add UUID generation to client
   - 24-hour key expiration
   - Tests for duplicate detection

**Acceptance Criteria** (updated):
- [ ] All payment types create journal entries
- [ ] Cancellations reverse correctly
- [ ] No orphan transactions
- [ ] Idempotency prevents duplicate charges
- [ ] Tests passing with 90%+ coverage

---

### Phase 2: Event Sourcing Migration [NUEVO]

**Priority**: 🔴 ARCHITECTURAL FOUNDATION

**Duration**: 4-5 weeks

1. **Event Store Implementation**
   - Create `event_store` table with immutability
   - Implement event hashing chain (blockchain-like)
   - Event versioning for schema evolution
   - Aggregate snapshot mechanism

2. **Projection Builder**
   - Rebuild `cash_sessions` from events
   - Rebuild `journal_entries` from events
   - Automatic projection refresh

3. **Migration Strategy**
   - Dual-write period: write to both old + event store
   - Gradual cutover by module
   - Rollback plan

**Acceptance Criteria**:
- [ ] All financial events stored immutably
- [ ] Can reconstruct any session from events
- [ ] Event replay tested and working
- [ ] Zero data loss during migration
- [ ] Performance acceptable (< 100ms event write)

---

### Phase 3: Three-Way Reconciliation [NUEVO]

**Priority**: 🔴 OPERATIONAL EFFICIENCY

**Duration**: 3-4 weeks

1. **Payment Gateway Integration**
   - Stripe webhook handlers
   - MercadoPago API integration
   - Settlement delay handling
   - Fee extraction

2. **Bank Statement Import**
   - CSV parser (configurable columns)
   - OFX format support
   - BAI2 format support (for corporate accounts)
   - Automatic import scheduling

3. **Matching Engine**
   - Fuzzy matching by amount, date, reference
   - Confidence scoring
   - Manual review queue
   - Auto-approval for high confidence matches

4. **Reconciliation Dashboard**
   - Three-way match visualization
   - Variance drill-down
   - Export to Excel
   - Scheduled reports

**Acceptance Criteria**:
- [ ] 95%+ auto-match rate
- [ ] Bank statements imported automatically
- [ ] Payment gateway fees correctly extracted
- [ ] Reconciliation completed in < 5 minutes daily

---

### Phase 4: Security & Audit [ACTUALIZADO]

**Priority**: 🔴 COMPLIANCE

**Duration**: 2-3 weeks

1. **✅ Granular Permissions** (unchanged)

2. **✅ Audit Trail** (now redundant with Event Sourcing, simplify)
   - Audit log viewer component
   - Export capabilities
   - Retention policies

3. **✅ Session Tampering Prevention** (unchanged)

4. **⭐ Cryptographic Verification** [NUEVO]
   - Digital signatures for critical events
   - Event hash verification
   - Tamper detection alerts

**Acceptance Criteria**:
- [ ] Granular permissions enforced
- [ ] Event chain integrity verified
- [ ] Closed sessions immutable
- [ ] Audit log exportable for 7+ years

---

### Phase 5: Dynamic Variance Detection [ACTUALIZADO]

**Priority**: ⚠️ OPERATIONAL IMPROVEMENT

**Duration**: 2 weeks

1. **Statistical Analysis**
   - Z-score calculation
   - Historical trend analysis
   - Day-of-week patterns
   - Configurable thresholds per location

2. **ML-Based Anomaly Detection** [NUEVO]
   - Isolation Forest algorithm
   - Training on historical data
   - Real-time scoring
   - False positive tuning

3. **Auto-Approval Engine**
   - Dynamic threshold adjustment
   - Auto-close if variance < threshold
   - Confidence-based routing

**Acceptance Criteria**:
- [ ] 80%+ sessions auto-approved
- [ ] False positive rate < 5%
- [ ] Anomaly detection accuracy > 90%
- [ ] Thresholds configurable per location

---

### Phase 6: Multi-User Accountability [NUEVO]

**Priority**: ⚠️ OPERATIONAL EFFICIENCY

**Duration**: 2 weeks

1. **Cashier Shift Logs**
   - Individual accountability tracking
   - Shift handover workflow
   - Supervisor verification required

2. **Till Spot Checks**
   - Mid-shift audits
   - Surprise counts
   - Variance attribution

3. **Reporting**
   - Cashier performance reports
   - Variance by cashier
   - Pattern detection

**Acceptance Criteria**:
- [ ] Each cashier accountable for their shift
- [ ] Handover requires supervisor verification
- [ ] Spot checks reduce theft incidents
- [ ] Individual variance trends visible

---

### Phase 7: Multi-Currency [FUTURE]

(Unchanged, low priority for Argentina)

---

## 💡 RECOMENDACIONES FINALES

### Priorización Sugerida

**Para Argentina (Mercado Local)**:
1. 🔴 **Phase 0 (AFIP)** - BLOCKER legal
2. 🔴 **Phase 1 (Debt + Idempotency)** - BLOCKER operacional
3. 🔴 **Phase 2 (Event Sourcing)** - Foundation arquitectónico
4. 🔴 **Phase 3 (Reconciliation)** - Eficiencia operativa
5. ⚠️ **Phase 4 (Security)** - Compliance
6. ⚠️ **Phase 5 (Dynamic Variance)** - Mejora incremental
7. ⚠️ **Phase 6 (Multi-User)** - Feature nice-to-have

**Para Mercado Internacional**:
1. 🔴 **Phase 1 (Debt + Idempotency)**
2. 🔴 **Phase 2 (Event Sourcing)**
3. 🔴 **Phase 3 (Reconciliation)**
4. ⚠️ **Phase 4 (Security)**
5. ⚠️ **Phase 5 (Dynamic Variance)**

---

### Consideraciones Técnicas

1. **Event Sourcing es una migración grande**: Requiere cambio de mentalidad del equipo. Considerar:
   - Training en event sourcing patterns
   - Prototipo pequeño primero (cash sessions only)
   - Gradual rollout

2. **AFIP integration requiere conocimiento local**: Necesitarás:
   - Developer con experiencia en AFIP (o consultor)
   - Hardware fiscal controller para testing
   - Cuenta AFIP de testing

3. **Three-way reconciliation es complejo**: Considerar:
   - Empezar con two-way (POS ⟷ Gateway)
   - Agregar bank statement después
   - Usar vendor solutions (HighRadius, Cashbook) si budget permite

4. **ML para variance detection es overkill para MVP**: Empezar con statistical methods (Z-score) y agregar ML después si es necesario.

---

### Métricas de Éxito (Actualizadas)

**Financial Accuracy**:
- ✅ Cash variance rate < 2% of total sales (unchanged)
- ✅ Reconciliation success rate > 95% (unchanged)
- ⭐ Zero duplicate charges (nuevo - idempotency)
- ⭐ Event integrity verification: 100% (nuevo - event sourcing)

**Operational Efficiency**:
- ✅ Average session close time < 5 minutes (unchanged)
- ⭐ Reconciliation time: < 5 minutes (mejorado de "auto-reconciliation rate")
- ⭐ Three-way match rate: > 95% (nuevo)

**Security & Compliance**:
- ✅ 100% audit log coverage (unchanged)
- ⭐ Event chain integrity: 100% (nuevo - cryptographic verification)
- ⭐ AFIP compliance: 100% (nuevo - Argentina)

**User Satisfaction**:
- ✅ Cashier NPS > 8/10 (unchanged)
- ✅ Training time < 1 hour (unchanged)
- ⭐ Supervisor approval time: < 2 minutes (nuevo)

---

## 📚 FUENTES Y REFERENCIAS

### ERP & Financial Systems
- [Oracle NetSuite Cash Management](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/article_164863634930.html)
- [Microsoft Dynamics 365 Cash Management](https://learn.microsoft.com/en-us/dynamics365/commerce/cash-mgmt)
- [SAP Double-Entry Accounting](https://www.actouch.com/erpdocs/financial-management/double-entry-accounting-system/)

### POS & Reconciliation
- [SolveXia POS Reconciliation Guide](https://www.solvexia.com/glossary/pos-reconciliation)
- [ConnectPOS Reconciliation](https://www.connectpos.com/pos-reconciliation/)
- [Evention Multi-System POS Guide](https://www.eventionllc.com/pos-reconciliation-guide/)

### Restaurant Cash Management
- [SynergySuite Cash Management](https://www.synergysuite.com/module/restaurant-cash-management/)
- [Restaurant365 Cash Flow Software](https://www.restaurant365.com/inventory/cash-management/)
- [Toast POS Cash Management](https://pos.toasttab.com/blog/restaurant-cash-management)

### Payment Systems Architecture
- [Designing a Payment System (Pragmatic Engineer)](https://newsletter.pragmaticengineer.com/p/designing-a-payment-system)
- [Stripe Architecture](https://dev.to/sgchris/building-a-payment-system-stripes-architecture-for-financial-transactions-3mlg)
- [Idempotency in Finance (Cockroach Labs)](https://www.cockroachlabs.com/blog/idempotency-in-finance/)

### Event Sourcing & CQRS
- [Event Sourcing Pattern (Mia-Platform)](https://mia-platform.eu/blog/understanding-event-sourcing-and-cqrs-pattern/)
- [Audit Log with Event Sourcing (Arkency)](https://blog.arkency.com/audit-log-with-event-sourcing/)
- [RisingWave CQRS Guide](https://risingwave.com/blog/mastering-cqrs-and-event-sourcing-for-modern-database-architecture/)

### Bank Reconciliation
- [HighRadius Bank Reconciliation](https://www.highradius.com/product/bank-reconciliation-software/)
- [Cashbook Auto-Matching Algorithms](https://www.cashbook.com/auto-matching-algorithms-in-accounts-reconciliation/)

### Audit & Compliance
- [AuditBoard: What Is an Audit Trail](https://auditboard.com/blog/what-is-an-audit-trail)
- [InScope Audit Trail Requirements](https://www.inscopehq.com/post/audit-trail-requirements-guidelines-for-compliance-and-best-practices)

### Anomaly Detection
- [Built In: Anomaly Detection Algorithms](https://builtin.com/machine-learning/anomaly-detection-algorithms)
- [HighRadius Transaction Anomaly Detection](https://www.highradius.com/resources/Blog/transaction-data-anomaly-detection/)
- [Sinch Dynamic Threshold Estimation](https://sinch.com/blog/dynamic-threshold-estimation-for-anomaly-detection/)

### Argentina AFIP
- [AFIP RG 3561 (InfoLEG)](https://servicios.infoleg.gob.ar/infolegInternet/anexos/220000-224999/223930/texact.htm)
- [EDICOM E-Invoicing Argentina](https://edicomgroup.com/blog/electronic-invoice-argentina)
- [Storecove Argentina E-Invoicing](https://www.storecove.com/blog/en/e-invoicing-in-argentina/)

### Cash Handling Best Practices
- [Retail Dogma: Balancing Cash Drawer](https://www.retaildogma.com/balancing-a-cash-drawer/)
- [Shopify Cash Drawer Guide](https://www.shopify.com/retail/balancing-a-cash-drawer)

---

**Document Version**: 2.0 (Research-Enriched)
**Last Updated**: 2025-12-09
**Total Research Sources**: 40+
**Next Review**: After Phase 0 completion
