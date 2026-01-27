# Investigación: Arquitectura de Sistemas de Pago - Estándares de la Industria

**Fecha**: 2025-12-29
**Objetivo**: Determinar la mejor arquitectura y estrategia para manejar pagos, medios de pago, y cash management en G-Admin Mini basándose en mejores prácticas de la industria.

---

## 📋 Resumen Ejecutivo

Esta investigación analiza cómo los principales ERPs (SAP, Oracle, NetSuite) y sistemas POS de la industria manejan:
- Múltiples métodos de pago (cash, card, transfer, QR)
- Reconciliación de transacciones
- Cash management y cash sessions
- Contabilidad de doble entrada
- Auditoría y compliance
- Seguridad (PCI-DSS)

### Hallazgos Clave

1. **Single Source of Truth**: Los sistemas empresariales exitosos mantienen UNA tabla como fuente de verdad para pagos
2. **Denormalización Estratégica**: Los totales agregados (por turno, sesión de caja) se denormalizan solo para performance
3. **Inmutabilidad**: Las transacciones financieras NUNCA se modifican, solo se revierten con nuevas transacciones
4. **Idempotencia**: Crítica para prevenir pagos duplicados (92% reducción en Airbnb)
5. **Event Sourcing**: Patrón recomendado para sistemas financieros que requieren audit trail completo

---

## 🏗️ Arquitecturas de Sistemas de Pago en ERPs Líderes

### SAP Payment Processing

**Arquitectura Core:**
- **Payment Processing Engine**: Componente centralizado que maneja todos los pagos
- **Vendor Master Data**: Información de proveedores y métodos de pago
- **Payment Medium Formats**: SEPA XML, IDoc, EDI configurables por región
- **Transaction F110**: Procesa propuestas de pago, crea medios de pago, postea en GL

**Flujo de Procesamiento:**
```
1. Authorization → Valida fondos durante creación de orden
2. Payment Proposal → Basado en vendor data y fechas de vencimiento
3. Payment Media Creation → Genera archivos de pago
4. GL Posting → Registra en contabilidad
5. Bank Statement Processing → Concilia con extractos bancarios
```

**Insights:**
- ✅ Separación clara entre autorización y captura
- ✅ Batch processing para optimizar transferencias bancarias
- ✅ Integración con múltiples payment providers (Stripe, Adyen, Worldpay)
- ✅ Composable architecture para seleccionar partners específicos

**Fuente**: [SAP Payment Processing - SAPinsider](https://sapinsider.org/topic/sap-finance/sap-payment-processing/)

---

### Oracle ERP Payments

**Arquitectura Core:**
- **Oracle Payments Engine**: Motor de captura y desembolso de fondos
- **Trading Community Architecture (TCA)**: Repositorio de datos de pago
- **Payment Instruments**: Tarjetas de crédito, cuentas bancarias
- **Dual Processing Model**: Online y Offline

**Modelos de Procesamiento:**

1. **Online Processing**:
   - Transacciones enviadas inmediatamente al payment system
   - Resultados devueltos en tiempo real al producto fuente

2. **Offline Processing**:
   - Información guardada en Oracle Payments DB
   - Transmisión posterior a payment systems
   - Autorizaciones online + settlements en batch offline

**Gateway vs Processor Model:**
- **Gateway Model**: Transacciones individuales enviadas en tiempo real
- **Processor Model**: Autorizaciones online, settlements en batch

**Insights:**
- ✅ Flexibilidad entre procesamiento online/offline según necesidad
- ✅ Centralización de payment instruments para reutilización
- ✅ Batch settlements para optimizar costos

**Fuente**: [Oracle Payments Implementation Guide](https://docs.oracle.com/cd/E26401_01/doc.122/e48768/T387353T387356.htm)

---

### NetSuite Payment Processing

**Arquitectura Core:**
- **Payment Processing Profiles**: Configuración por gateway
- **Gateway Integration Layer**: Conecta AR/AP con payment systems
- **Transaction Routing**: Formatea y enruta requests de autorización

**Flujo de Procesamiento:**
```
1. NetSuite → Authorization Request → Payment Gateway
2. Gateway → Formats Transaction → Payment Processor
3. Processor → Contacts Issuing Bank → Authorization Result
4. Gateway → Returns Result → NetSuite
5. End of Day → Capture Request → Batch to Issuing Bank
```

**Payment Operations Soportadas:**
- Authorization (hold de fondos)
- Capture (transferencia efectiva)
- Sale (auth + capture en un paso)
- Refund
- Credit
- Void

**Insights:**
- ✅ Separación entre authorization y capture permite gestión de inventario
- ✅ Batch capture al final del día optimiza fees de procesamiento
- ✅ Multiple profiles permiten diferentes gateways por tipo de negocio

**Fuente**: [NetSuite Payment Processing](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/preface_4289351924.html)

---

## 💳 Manejo de Múltiples Métodos de Pago (Split Tender)

### Qué es Split Tender

Pago mediante combinación de métodos, conocido como **split tender transaction**:
- Útil cuando clientes tienen limitaciones en un método de pago
- Ejemplo: $60 total → $30 efectivo + $30 tarjeta
- El POS registra cada monto separadamente bajo su tipo de pago respectivo

**Fuente**: [Split Tender Payment in POS - ConnectPOS](https://www.connectpos.com/split-tender-payment-in-pos/)

### Arquitectura POS para Multi-Tender

**Semi-Integrated Payment Architecture** (más común):
- Datos sensibles de tarjeta permanecen en software del payment provider
- NUNCA entran al POS o sistemas del merchant
- Cumple PCI-DSS sin necesidad de certificar toda la aplicación

**Capacidades Requeridas del POS:**
- ✅ Soporte para flexible tender types
- ✅ Procesamiento simultáneo de múltiples métodos
- ✅ Registro separado de cada payment method en una transacción
- ✅ Reconciliación por tipo de tender al final del día

**Métodos de Pago Comunes:**
- Credit/Debit Cards
- NFC Contactless (Apple Pay, Google Pay)
- Gift Cards
- Rewards Points
- Cash
- QR Codes / Mobile Wallets

**Insights:**
- ✅ Cada payment method debe registrarse individualmente
- ✅ Los totales por método se usan para reconciliación de turno
- ✅ Semi-integrated architecture reduce scope de PCI compliance

**Fuente**: [Payment Methods in POS - ConnectPOS](https://www.connectpos.com/split-tender-payment-in-pos/)

---

## 🔄 Reconciliación de Pagos y Cash Management

### Payment Reconciliation Architecture

**Componentes del Sistema:**
1. **Data Collection Layer**: Colecta pagos de múltiples fuentes (bancos, gateways, lockbox)
2. **Data Standardization**: Extrae y normaliza datos para integración con ERP
3. **Matching Engine**: AI-powered + rule-based matching automático
4. **ERP Synchronization**: Real-time sync con sistemas financieros

**Automated Matching:**
- Pagos automáticamente matched contra invoices abiertas
- Algoritmos AI + reglas reducen excepciones
- High auto-match rates aceleran AR process

**Beneficios Reportados:**
- 35% reducción en tiempos de reconciliación
- 25% mejora en eficiencia de procesos financieros

**Fuente**: [Automated Payment Reconciliation - Tipalti](https://tipalti.com/ap-automation/automated-payment-reconciliation/)

---

### Cash Drawer Management Best Practices

#### Timing y Frecuencia

1. **Shift Reconciliation**: Después de cada turno de cajero
2. **Daily Reconciliation**: Al cierre de cada día de negocio
3. **Designated Times**: Tiempos específicos para reconciliación aseguran consistencia

**Fuente**: [Cash Drawer Management - POS Highway](https://www.poshighway.com/blog/cash-drawer-management-cycle-counts-reconcilation-activation-and-closing/)

#### Starting Cash (Float Management)

**Best Practice:**
- Iniciar cada día con la MISMA cantidad de efectivo
- Mismo monto en cada till
- Facilita detección de overages/shortages al final del día

**Activación de Drawer:**
- Cajero cuenta y declara coins, rolls, bills al inicio de sesión
- Sistema registra starting cash amount
- Base para calcular discrepancias al cierre

**Fuente**: [Cash Float Management - ConnectPOS](https://www.connectpos.com/how-to-manage-cash-float-in-pos/)

#### Proceso de Reconciliación

```
1. Cashier Count:
   - Cajero cuenta efectivo al final del turno
   - Determina overage o shortage

2. Manager Reconciliation:
   - Manager reconcilia el count
   - Verifica que payments tendered = amounts entered

3. Variance Analysis:
   - Si hay discrepancia → investigación
   - Documentación de razón
```

**Fuente**: [POS Reconciliation Guide - GOFTX](https://goftx.com/blog/pos-reconciliation-guide/)

#### Cash Drops y Security

**Prevención de Exceso de Efectivo:**
- Realizar cash drops regulares a caja fuerte segura
- Registrar cada cash drop con precisión
- Evita discrepancias al final del día
- Reduce riesgo de robo

#### Accountability y Access Control

**One User Per Shift (Recomendado):**
- Solo UN usuario por turno
- Máximo nivel de accountability
- Usuario únicamente responsable por discrepancias
- Facilita auditoría

**Fuente**: [Shift and Cash Drawer Management - Microsoft Dynamics 365](https://learn.microsoft.com/en-us/dynamics365/commerce/shift-drawer-management)

#### Integración Tecnológica

**POS Software Benefits:**
- Detección automática de discrepancias
- Conecta cash drawer con sales records
- Identifica variaciones en tiempo real
- Permite corrección rápida

---

## 🔐 Seguridad y PCI-DSS Compliance

### Tokenization Requirements

**Qué es Tokenization:**
- Proceso donde información sensible de pago se reemplaza con tokens
- Tokens NO pueden revertirse matemáticamente para recuperar datos originales
- Tokens almacenados en secure token vault (PCI-DSS compliant)
- Datos sensibles permanecen fuera de sistemas operacionales

**PCI DSS Stipulations:**
- Uso de index tokens para encriptar elementos sensibles de CHD
- Primary Account Numbers (PANs) reemplazados con valores "surrogate"
- Tokenization asegura CHD reemplazando PANs con valores sin sentido

**Fuente**: [PCI DSS Tokenization - RSI Security](https://blog.rsisecurity.com/how-to-meet-tokenization-pci-dss-requirements/)

### Key Storage y Security Requirements

**Requirement 3 - Protección de CHD Storage:**
- Organizaciones deben asegurar TODAS las formas de CHD storage
- Prevenir exposición no autorizada
- Mínimo 112-bits de effective key strength
- Proper key management practices
- AES-256 o encryption methods equivalentes

**Token Vault Security:**
- Strict controls en vault con datos originales
- Cryptographic key management
- Secure deletion policies
- Logging mechanisms para rastrear acceso y anomalías
- Regular penetration testing

**Fuente**: [PCI DSS Encryption Requirements - Evervault](https://evervault.com/blog/encryption-requirements-for-PCI-compliance-2025)

### Compliance Deadlines 2025

- **March 31, 2025**: Full compliance con existing requirements (MANDATORIO)
- **March 31, 2026**: Future-dated requirements se vuelven mandatorios

### Benefits de Tokenization

**Reduced Compliance Scope:**
- Al reemplazar PANs con tokens, scope de PCI DSS se reduce significativamente
- Menos recursos para compliance audits
- Ahorro en tiempo y dinero

**IMPORTANTE:**
- ⚠️ Tokenization NO reemplaza necesidad de cumplir PCI DSS requirements
- ⚠️ Si outsourcing tokenization, provider debe adherir a PCI DSS
- ⚠️ Revisar attestations de compliance anualmente

**Fuente**: [PCI DSS 4.0.1 Compliance Guide - UpGuard](https://www.upguard.com/blog/pci-compliance)

---

## 🗄️ Patrones de Base de Datos para Sistemas de Pago

### 1. Single Source of Truth Pattern

**Principio Core:**
> Una tabla principal como fuente de verdad, otras tablas son caches denormalizados

**Implementación:**
```sql
-- ✅ FUENTE DE VERDAD
CREATE TABLE sale_payments (
  id UUID PRIMARY KEY,
  sale_id UUID REFERENCES sales(id),
  journal_entry_id UUID REFERENCES journal_entries(id),

  -- Método de pago
  payment_method_id UUID REFERENCES payment_methods_config(id),
  payment_type TEXT, -- 'CASH', 'CARD', 'TRANSFER', 'QR'

  -- Montos
  amount NUMERIC(15,4) NOT NULL,

  -- Context operacional
  cash_session_id UUID REFERENCES cash_sessions(id),  -- Solo si es CASH
  shift_id UUID REFERENCES operational_shifts(id),    -- Siempre

  -- Idempotencia
  idempotency_key UUID UNIQUE NOT NULL,

  -- Estado de transacción
  status TEXT, -- 'AUTHORIZED', 'CAPTURED', 'SETTLED', 'REFUNDED', 'VOIDED'

  -- Metadata específica del método
  metadata JSONB,  -- { terminal_id, card_brand, transaction_id, etc }

  -- Audit trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ❌ CACHES DENORMALIZADOS (para performance)
ALTER TABLE cash_sessions ADD COLUMN
  cash_sales NUMERIC(15,4) DEFAULT 0;  -- Actualizado por trigger

ALTER TABLE operational_shifts ADD COLUMN
  cash_total NUMERIC(12,2) DEFAULT 0,
  card_total NUMERIC(12,2) DEFAULT 0,
  transfer_total NUMERIC(12,2) DEFAULT 0,
  qr_total NUMERIC(12,2) DEFAULT 0;  -- Actualizados por trigger
```

**Ventajas:**
- ✅ Una única fuente de verdad para auditoría
- ✅ Consistencia garantizada
- ✅ Queries simples (no múltiples JOINs)
- ✅ Fácil extender con nuevos payment methods

**Fuente**: [Database Design Patterns for Payment Systems - LinkedIn](https://www.linkedin.com/advice/3/what-some-database-design-patterns-payment-systems-uwevc)

---

### 2. Event Sourcing Pattern

**Principio Core:**
> Cada transacción se almacena como evento inmutable en event stream

**Implementación:**
```sql
CREATE TABLE payment_events (
  event_id UUID PRIMARY KEY,
  transaction_id UUID NOT NULL,
  account_id UUID NOT NULL,

  -- Event data
  event_type TEXT, -- 'PAYMENT_INITIATED', 'PAYMENT_AUTHORIZED', 'PAYMENT_CAPTURED', etc
  amount NUMERIC(15,4),
  currency TEXT,

  -- State
  status TEXT,

  -- Metadata
  metadata JSONB,

  -- Immutability
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Audit
  created_by UUID
);

-- Index para reconstruir estado
CREATE INDEX idx_payment_events_transaction
  ON payment_events(transaction_id, timestamp);
```

**Reconstrucción de Estado:**
```sql
-- Obtener estado actual de una transacción
SELECT
  transaction_id,
  SUM(amount) FILTER (WHERE event_type = 'PAYMENT_CAPTURED') as captured_amount,
  SUM(amount) FILTER (WHERE event_type = 'PAYMENT_REFUNDED') as refunded_amount,
  ARRAY_AGG(event_type ORDER BY timestamp) as event_history
FROM payment_events
WHERE transaction_id = 'xxx'
GROUP BY transaction_id;
```

**Ventajas:**
- ✅ **Audit Trail Completo**: Cada cambio registrado como evento
- ✅ **Reconstrucción Temporal**: Puedes ver estado en cualquier momento
- ✅ **Inmutabilidad**: Eventos nunca se modifican o borran
- ✅ **Debugging**: Puedes replay events para debugging
- ✅ **Compliance**: Ideal para regulaciones financieras

**Desventajas:**
- ❌ Queries más complejos (necesitas reconstruir estado)
- ❌ Más espacio de almacenamiento
- ❌ Curva de aprendizaje para el equipo

**Uso en la Industria:**
> "Event Sourcing es especialmente bueno en dominios donde audit trails completos son esenciales - servicios financieros, healthcare, ambientes regulatorios requieren registros históricos comprehensivos que sistemas tradicionales tienen dificultad de proveer."

**Fuente**: [Event Sourcing Pattern - Microsoft Azure](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing)

---

### 3. Idempotency Key Pattern

**Principio Core:**
> Cada payment request tiene una idempotency key única para prevenir duplicados

**Crítico para Sistemas de Pago:**
> "Ensuring that every transaction is processed exactly once is crucial, as double-charging a customer or missing a payment can instantly damage trust."

**Implementación:**
```sql
CREATE TABLE payment_requests (
  idempotency_key UUID PRIMARY KEY,

  -- Request data
  request_payload JSONB NOT NULL,
  request_hash TEXT NOT NULL,

  -- Processing state
  status TEXT, -- 'PROCESSING', 'COMPLETED', 'FAILED'

  -- Result
  payment_id UUID REFERENCES sale_payments(id),
  response_payload JSONB,

  -- Timing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ, -- Keys expire after period

  -- Unique constraint on hash to detect true duplicates
  CONSTRAINT unique_request_hash UNIQUE (request_hash)
);
```

**Workflow de Procesamiento:**
```sql
-- 1. Cliente genera idempotency key
const idempotencyKey = uuidv4();

-- 2. Backend verifica si ya existe
SELECT status, payment_id, response_payload
FROM payment_requests
WHERE idempotency_key = $1;

-- Si existe:
--   - COMPLETED → Retornar mismo resultado
--   - PROCESSING → Retornar 409 Conflict (retry later)
--   - FAILED → Permitir retry

-- 3. Si no existe, crear y procesar
BEGIN;
  INSERT INTO payment_requests (idempotency_key, request_payload, status)
  VALUES ($1, $2, 'PROCESSING');

  -- Procesar pago...

  UPDATE payment_requests
  SET status = 'COMPLETED',
      payment_id = $result_id,
      response_payload = $response,
      completed_at = NOW()
  WHERE idempotency_key = $1;
COMMIT;
```

**Database Constraints - PostgreSQL:**
```sql
-- Upsert operation para garantizar no duplicados
INSERT INTO payments (idempotency_key, amount, customer_id)
VALUES ($1, $2, $3)
ON CONFLICT (idempotency_key) DO NOTHING
RETURNING id;
```

**Atomic Database Transactions:**
> "Critically, these two things must happen atomically, typically by wrapping them in a database transaction. Either the message gets processed and its idempotency key gets persisted. Or, the transaction gets rolled back and no changes are applied at all."

**Key Generation Best Practices:**
- Usar data que varía naturalmente con cada request (timestamps, unique order IDs)
- Clientes generan random strings con high entropy para evitar colisiones
- Keys deben expirar después de período específico

**Resultados en la Industria:**
> "Over two years, this strategy reduced duplicate payments by 92%" - Airbnb Engineering

**Fuente**:
- [Idempotency in Finance - CockroachDB](https://www.cockroachlabs.com/blog/idempotency-in-finance/)
- [Avoiding Double Payments - Airbnb Engineering](https://medium.com/airbnb-engineering/avoiding-double-payments-in-a-distributed-payments-system-2981f6b070bb)

---

### 4. Double-Entry Accounting Pattern

**Principio Core:**
> Cada transacción financiera requiere al menos dos entradas: debit y credit (total debits = total credits)

**Implementación:**
```sql
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY,
  entry_type TEXT, -- 'SALE', 'REFUND', 'CASH_DROP', etc
  description TEXT,

  -- Reference to source transaction
  source_type TEXT, -- 'sale_payment', 'cash_drop', etc
  source_id UUID,

  -- Inmutability
  is_reversed BOOLEAN DEFAULT FALSE,
  reversed_by_entry_id UUID REFERENCES journal_entries(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

CREATE TABLE journal_lines (
  id UUID PRIMARY KEY,
  journal_entry_id UUID REFERENCES journal_entries(id),

  -- Account
  account_code TEXT, -- '1.1.01' (Cash), '4.1' (Revenue), etc

  -- Amount (positive = debit, negative = credit)
  amount NUMERIC(15,4) NOT NULL,

  -- Metadata
  description TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Constraint: Total debits = Total credits
CREATE FUNCTION validate_journal_entry_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT SUM(amount) FROM journal_lines WHERE journal_entry_id = NEW.journal_entry_id) != 0 THEN
    RAISE EXCEPTION 'Journal entry must balance (debits = credits)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_balanced_entry
  AFTER INSERT OR UPDATE ON journal_lines
  FOR EACH ROW
  EXECUTE FUNCTION validate_journal_entry_balance();
```

**Ejemplo - Venta con Pago en Efectivo:**
```sql
-- Sale: $100 (includes $21 IVA)

INSERT INTO journal_entries (id, entry_type, description, source_type, source_id)
VALUES ('entry-1', 'SALE', 'Sale #123 - Cash Payment', 'sale_payment', 'payment-1');

INSERT INTO journal_lines (journal_entry_id, account_code, amount, description) VALUES
  ('entry-1', '1.1.01', 100.00, 'Cash received'),           -- DEBIT: Cash
  ('entry-1', '4.1',   -79.00, 'Revenue'),                  -- CREDIT: Revenue
  ('entry-1', '2.1.02', -21.00, 'IVA collected');           -- CREDIT: IVA Payable
```

**Ejemplo - Refund:**
```sql
-- Original entry is REVERSED, not deleted or modified

-- 1. Mark original as reversed
UPDATE journal_entries
SET is_reversed = TRUE, reversed_by_entry_id = 'entry-2'
WHERE id = 'entry-1';

-- 2. Create REVERSING entry (opposite amounts)
INSERT INTO journal_entries (id, entry_type, description, source_type, source_id)
VALUES ('entry-2', 'REFUND', 'Refund for Sale #123', 'refund', 'refund-1');

INSERT INTO journal_lines (journal_entry_id, account_code, amount, description) VALUES
  ('entry-2', '1.1.01', -100.00, 'Cash refunded'),          -- CREDIT: Cash
  ('entry-2', '4.1',     79.00, 'Revenue reversal'),        -- DEBIT: Revenue
  ('entry-2', '2.1.02',  21.00, 'IVA reversal');            -- DEBIT: IVA Payable
```

**Best Practices:**
- ✅ Siempre registrar debits antes que credits
- ✅ Usar nombres de cuentas y números consistentes
- ✅ Double-check entries para accuracy
- ✅ Revisar entries para errores
- ✅ Total debits SIEMPRE = total credits

**Inmutabilidad de Journal Entries:**
> "Journals should be immutable - once posted, they can't be edited (only reversed). When adjustments are needed, there are two approaches: completely reverse the ledger transaction by creating a new ledger transaction with the opposite amount."

**Common Mistakes to Avoid:**
- ❌ Fallar en registrar transactions promptly → cash flow issues
- ❌ Delays → missed payments, late fees, strained supplier relationships
- ❌ Modificar journal entries existentes → usar reversal entries

**Fuente**:
- [Double-Entry Accounting - NetSuite](https://www.netsuite.com/portal/resource/articles/accounting/double-entry-accounting.shtml)
- [Immutable Ledger Design - Modern Treasury](https://www.moderntreasury.com/journal/enforcing-immutability-in-your-double-entry-ledger)

---

## 🔄 Transaction Lifecycle y State Machine

### Estados de Transacción

**Estado Machine Estándar** (basado en PayPal, Authorize.Net, Stripe):

```
AUTHORIZED → SUBMITTED_FOR_SETTLEMENT → SETTLING → SETTLED
    ↓                    ↓
  VOIDED              VOIDED
                        ↓
                   REFUNDED (después de SETTLED)
```

### Definiciones de Estados

#### 1. AUTHORIZED
- **Significado**: Processor autorizó la transacción
- **Comportamiento**: Autorización coloca fondos en hold con banco del cliente
- **Timing**: Tienes 30 días para capture, recomendado dentro de 72 horas
- **Acciones Permitidas**: Void, Capture

**Fuente**: [Transaction Statuses - Authorize.Net](https://support.authorize.net/knowledgebase/article/000001360/en-us)

#### 2. SUBMITTED_FOR_SETTLEMENT (Captured)
- **Significado**: Transacción enviada para settlement
- **Comportamiento**: Se incluirá en próximo settlement batch
- **Timing**: En daily batch close, fondos autorizados se incluyen en batch
- **Acciones Permitidas**: Void (antes de settlement)

#### 3. SETTLING
- **Significado**: Transacción en proceso de settlement
- **Comportamiento**: Estado transitorio
- **Acciones Permitidas**: Ninguna (wait for completion)

#### 4. SETTLED
- **Significado**: Transacción aprobada y successfully settled
- **Comportamiento**: Fondos depositados en available balance del merchant
- **Acciones Permitidas**: Refund
- **Timing**: Generalmente 2-3 días business después de capture

**Fuente**: [Transaction Types and Statuses - Payrix](https://resource.payrix.com/docs/transactions-types-and-statuses)

#### 5. VOIDED
- **Significado**: Transacción cancelada antes de settlement
- **Comportamiento**: Fondos released back to customer
- **Cuándo se puede Void**: Status = AUTHORIZED, SUBMITTED_FOR_SETTLEMENT, o SETTLEMENT_PENDING
- **Restricción**: Solo transacciones unsettled pueden ser voided

> "Only transactions in an unsettled state can be voided. If the transaction you wish to void has already been settled, it cannot be voided."

#### 6. REFUNDED
- **Significado**: Fondos retornados a customer después de settlement
- **Comportamiento**: Crea nueva transacción de refund
- **Cuándo**: Status = CAPTURED o SETTLED
- **Nota**: No se puede "undo" una transacción settled, se debe crear refund transaction

> "Instead, you need to issue a refund transaction to return funds to the customer's card or bank account."

**Fuente**: [Payment Statuses - PayPal Braintree](https://developer.paypal.com/braintree/docs/reference/general/statuses)

---

### Implementación del State Machine

```sql
CREATE TYPE payment_status AS ENUM (
  'INITIATED',
  'AUTHORIZED',
  'SUBMITTED_FOR_SETTLEMENT',
  'SETTLING',
  'SETTLED',
  'VOIDED',
  'REFUND_PENDING',
  'REFUNDED',
  'FAILED',
  'CHARGEBACK_PENDING',
  'CHARGEDBACK'
);

CREATE TABLE sale_payments (
  id UUID PRIMARY KEY,
  -- ... other fields ...

  status payment_status NOT NULL DEFAULT 'INITIATED',

  -- State transitions log
  status_history JSONB DEFAULT '[]'::jsonb,

  -- Timestamps for each state
  initiated_at TIMESTAMPTZ DEFAULT NOW(),
  authorized_at TIMESTAMPTZ,
  submitted_for_settlement_at TIMESTAMPTZ,
  settled_at TIMESTAMPTZ,
  voided_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);

-- Function para validar state transitions
CREATE FUNCTION validate_payment_status_transition()
RETURNS TRIGGER AS $$
DECLARE
  valid_transition BOOLEAN := FALSE;
BEGIN
  -- Definir transiciones válidas
  valid_transition := CASE
    WHEN OLD.status = 'INITIATED' AND NEW.status IN ('AUTHORIZED', 'FAILED') THEN TRUE
    WHEN OLD.status = 'AUTHORIZED' AND NEW.status IN ('SUBMITTED_FOR_SETTLEMENT', 'VOIDED', 'FAILED') THEN TRUE
    WHEN OLD.status = 'SUBMITTED_FOR_SETTLEMENT' AND NEW.status IN ('SETTLING', 'VOIDED') THEN TRUE
    WHEN OLD.status = 'SETTLING' AND NEW.status IN ('SETTLED', 'FAILED') THEN TRUE
    WHEN OLD.status = 'SETTLED' AND NEW.status IN ('REFUND_PENDING', 'CHARGEBACK_PENDING') THEN TRUE
    WHEN OLD.status = 'REFUND_PENDING' AND NEW.status = 'REFUNDED' THEN TRUE
    WHEN OLD.status = 'CHARGEBACK_PENDING' AND NEW.status = 'CHARGEDBACK' THEN TRUE
    ELSE FALSE
  END;

  IF NOT valid_transition THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
  END IF;

  -- Log transition in history
  NEW.status_history := OLD.status_history || jsonb_build_object(
    'from', OLD.status,
    'to', NEW.status,
    'timestamp', NOW(),
    'changed_by', current_user
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_payment_status_transitions
  BEFORE UPDATE OF status ON sale_payments
  FOR EACH ROW
  EXECUTE FUNCTION validate_payment_status_transition();
```

---

## 💸 Refunds, Chargebacks y Reversals

### Tipos de Reversals

**1. Authorization Reversal**
- **Cuándo**: ANTES del settlement
- **Quién**: Merchant
- **Efecto**: Cancela autorización, libera fondos inmediatamente
- **En DB**: Status → VOIDED

**2. Refund**
- **Cuándo**: DESPUÉS del settlement
- **Quién**: Merchant (voluntario)
- **Efecto**: Mueve fondos de vuelta a customer
- **Timing**: 2-7 días business
- **En DB**: Nueva transacción tipo REFUND

**3. Chargeback**
- **Cuándo**: DESPUÉS del settlement
- **Quién**: Customer (disputa)
- **Efecto**: Fondos removidos de merchant + fees
- **Lifecycle**: 30-120 días
- **En DB**: Status → CHARGEBACK_PENDING → CHARGEDBACK

**Fuente**: [Payment Reversals - ReverseLogix](https://www.reverselogix.com/industry-updates/payment-reversals-refund-chargeback-reversal-transaction/)

---

### Chargeback Lifecycle

```
Day 1-7:    Customer raises dispute with issuing bank
Day 8-30:   Issuing bank reviews and forwards to acquirer
Day 31-60:  Merchant provides evidence to defend
Day 61-120: Resolution, refund, or arbitration
```

**Possible Outcomes:**
- Merchant wins → Payment gets `ChargebackReversedExternally` status
- Merchant loses → Payment stays `CHARGEDBACK`, funds not returned
- Arbitration → Card network makes final decision

**Fuente**: [Chargeback Lifecycle - Chargeflow](https://www.chargeflow.io/blog/chargeback-life-cycle)

---

### Database Design para Refunds

**IMPORTANTE:**
> "Financial transactions transition through multiple stages before they're finalized, and they're never really finalized either, since transactions can usually be reversed through refunds or credit card chargebacks, many months later sometimes."

**Pattern Recomendado: Linked Transactions**

```sql
CREATE TABLE sale_payments (
  id UUID PRIMARY KEY,
  sale_id UUID REFERENCES sales(id),

  -- Linking
  parent_payment_id UUID REFERENCES sale_payments(id), -- Para refunds
  refund_for_payment_id UUID REFERENCES sale_payments(id), -- Reverse link

  -- Type
  transaction_type TEXT, -- 'PAYMENT', 'REFUND', 'CHARGEBACK'

  amount NUMERIC(15,4) NOT NULL,
  status payment_status,

  -- ... other fields
);

-- Cuando se crea un refund:
INSERT INTO sale_payments (
  id,
  sale_id,
  parent_payment_id, -- Link to original payment
  transaction_type,
  amount, -- Negative amount
  status
) VALUES (
  'refund-1',
  'sale-123',
  'payment-1', -- Original payment
  'REFUND',
  -100.00, -- Negative
  'REFUND_PENDING'
);

-- Update original payment
UPDATE sale_payments
SET refund_for_payment_id = 'refund-1'
WHERE id = 'payment-1';
```

**Queries para Analysis:**
```sql
-- Net amount for a sale (payments - refunds)
SELECT
  sale_id,
  SUM(amount) FILTER (WHERE transaction_type = 'PAYMENT') as total_payments,
  SUM(amount) FILTER (WHERE transaction_type = 'REFUND') as total_refunds,
  SUM(amount) as net_amount
FROM sale_payments
WHERE sale_id = 'sale-123'
GROUP BY sale_id;
```

**Fuente**: [Data Models for Financial Transactions - Jessy](https://www.jessym.com/articles/data-models-for-financial-transactions)

---

## 📊 Arquitectura Recomendada para G-Admin Mini

### Análisis de Opciones

Basado en la investigación de industria, hay 3 arquitecturas principales a considerar:

#### OPCIÓN A: Arquitectura Actual (Inconsistente) ❌

```
CASH      → cash_sessions.cash_sales + sale_payments + journal_entry
NO-CASH   → shift_payments + sale_payments + journal_entry
```

**Problemas Identificados:**
- ❌ **Duplicación**: Mismo pago en 2-3 tablas
- ❌ **Inconsistencia**: CASH se maneja diferente que otros métodos
- ❌ **Source of Truth Unclear**: ¿Cuál es la fuente correcta?
- ❌ **Complejidad**: Más tablas = más código de sync
- ❌ **No sigue estándares**: SAP, Oracle, NetSuite usan single source

---

#### OPCIÓN B: sale_payments como Single Source of Truth ✅ RECOMENDADA

```
TODOS LOS PAYMENTS → sale_payments (SINGLE SOURCE OF TRUTH)
                      ├─ payment_type: 'CASH' | 'CARD' | 'TRANSFER' | 'QR'
                      ├─ journal_entry_id: (contabilidad)
                      ├─ status: state machine completo
                      └─ idempotency_key: prevención de duplicados

cash_sessions.cash_sales     → DENORMALIZADO (cache)
operational_shifts.totals    → DENORMALIZADO (cache)
shift_payments              → ❌ ELIMINAR (redundante)
```

**Ventajas:**
- ✅ **Single Source of Truth**: sale_payments es LA verdad (como NetSuite, SAP)
- ✅ **Consistencia**: Todos los métodos se manejan igual
- ✅ **Simplicidad**: Una tabla, una lógica
- ✅ **Estándar de Industria**: Sigue patrón de ERPs líderes
- ✅ **Auditable**: Todos los pagos rastreables desde un lugar
- ✅ **Idempotencia**: Previene duplicados (92% reducción como Airbnb)
- ✅ **State Machine**: Maneja authorization → capture → settlement
- ✅ **Refunds/Chargebacks**: Linked transactions como práctica estándar

**Denormalización para Performance:**
```sql
-- cash_sessions.cash_sales es un CACHE (actualizado por trigger)
CREATE TRIGGER sync_cash_session_on_payment
  AFTER INSERT ON sale_payments
  FOR EACH ROW
  WHEN (NEW.payment_type = 'CASH')
  EXECUTE FUNCTION update_cash_session_total();

-- operational_shifts.totals son CACHES (actualizados por trigger)
CREATE TRIGGER sync_shift_totals_on_payment
  AFTER INSERT ON sale_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_shift_totals();
```

**Basado en:**
- SAP Payment Processing (centralización)
- Oracle Payments (single repository)
- NetSuite (payment transaction como core)
- Industry best practices (single source of truth)

---

#### OPCIÓN C: Event Sourcing + CQRS ⚠️ AVANZADO

```
TODOS LOS PAYMENTS → payment_events (immutable event log)
                      ├─ PAYMENT_INITIATED
                      ├─ PAYMENT_AUTHORIZED
                      ├─ PAYMENT_CAPTURED
                      ├─ PAYMENT_SETTLED
                      └─ PAYMENT_REFUNDED

sale_payments        → VISTA MATERIALIZADA (agrupación de eventos)
cash_sessions        → VISTA MATERIALIZADA
journal_entries      → Generados desde eventos
```

**Ventajas:**
- ✅ **Audit Trail Perfecto**: Cada cambio es un evento inmutable
- ✅ **Debugging Superior**: Replay events para debugging
- ✅ **Compliance**: Ideal para regulaciones financieras
- ✅ **Temporal Queries**: Estado en cualquier punto en el tiempo
- ✅ **Self-Healing**: Sistema puede reconstruir estado desde eventos

**Desventajas:**
- ❌ **Complejidad Alta**: Curva de aprendizaje significativa
- ❌ **Performance Queries**: Necesita reconstruir estado
- ❌ **Storage**: Más espacio (cada evento permanece forever)
- ❌ **Team Training**: Equipo necesita entender Event Sourcing

**Cuándo Usar:**
> "Event Sourcing excels in domains where complete audit trails are essential - financial services, healthcare, and regulatory environments often require comprehensive historical records that traditional systems struggle to provide."

**Recomendación:**
- 🟡 Considerar para FUTURO si compliance/audit requirements aumentan
- 🟡 No recomendado para MVP o sistemas simples
- 🟡 Requiere expertise en CQRS/Event Sourcing

---

### 🎯 RECOMENDACIÓN FINAL: OPCIÓN B (MEJORADA)

**Razones:**
1. ✅ Sigue estándares de industria (SAP, Oracle, NetSuite)
2. ✅ Balance perfecto entre simplicidad y robustez
3. ✅ Ya existe tabla `sale_payments` en DB
4. ✅ Permite evolución futura a Event Sourcing si es necesario
5. ✅ Team puede implementar sin curva de aprendizaje alta

---

## 🗄️ Schema de Base de Datos Recomendado

### Tablas Core

```sql
-- ============================================
-- FUENTE DE VERDAD: SALE PAYMENTS
-- ============================================
CREATE TABLE sale_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE RESTRICT,
  journal_entry_id UUID REFERENCES journal_entries(id),

  -- Payment Method
  payment_method_id UUID REFERENCES payment_methods_config(id),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('CASH', 'CARD', 'TRANSFER', 'QR', 'OTHER')),

  -- Amounts
  amount NUMERIC(15,4) NOT NULL CHECK (amount != 0),
  currency TEXT NOT NULL DEFAULT 'ARS',

  -- Transaction Type
  transaction_type TEXT NOT NULL DEFAULT 'PAYMENT' CHECK (transaction_type IN ('PAYMENT', 'REFUND', 'CHARGEBACK')),

  -- Linking (for refunds/chargebacks)
  parent_payment_id UUID REFERENCES sale_payments(id),

  -- Operational Context
  cash_session_id UUID REFERENCES cash_sessions(id),
  shift_id UUID NOT NULL REFERENCES operational_shifts(id),

  -- Transaction Lifecycle
  status payment_status NOT NULL DEFAULT 'INITIATED',
  status_history JSONB DEFAULT '[]'::jsonb,

  -- Timestamps por estado
  initiated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  authorized_at TIMESTAMPTZ,
  captured_at TIMESTAMPTZ,
  submitted_for_settlement_at TIMESTAMPTZ,
  settled_at TIMESTAMPTZ,
  voided_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,

  -- Idempotency (CRÍTICO)
  idempotency_key UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),

  -- Payment-specific metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  -- Ejemplos de metadata:
  -- CARD: { terminal_id, card_brand, last_4_digits, authorization_code, settlement_batch_id }
  -- TRANSFER: { bank_name, reference_number, transfer_date }
  -- QR: { qr_provider, transaction_id, qr_code }

  -- Audit trail
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),

  -- Constraints
  CONSTRAINT positive_payment_or_negative_refund
    CHECK (
      (transaction_type = 'PAYMENT' AND amount > 0) OR
      (transaction_type IN ('REFUND', 'CHARGEBACK') AND amount < 0)
    ),

  CONSTRAINT cash_requires_session
    CHECK (
      (payment_type = 'CASH' AND cash_session_id IS NOT NULL) OR
      (payment_type != 'CASH')
    )
);

-- Indexes para performance
CREATE INDEX idx_sale_payments_sale ON sale_payments(sale_id);
CREATE INDEX idx_sale_payments_shift ON sale_payments(shift_id);
CREATE INDEX idx_sale_payments_session ON sale_payments(cash_session_id) WHERE cash_session_id IS NOT NULL;
CREATE INDEX idx_sale_payments_status ON sale_payments(status);
CREATE INDEX idx_sale_payments_type ON sale_payments(payment_type);
CREATE INDEX idx_sale_payments_created ON sale_payments(created_at DESC);
CREATE UNIQUE INDEX idx_sale_payments_idempotency ON sale_payments(idempotency_key);

-- Partial index para transactions que necesitan settlement
CREATE INDEX idx_sale_payments_pending_settlement
  ON sale_payments(payment_type, created_at)
  WHERE status IN ('AUTHORIZED', 'SUBMITTED_FOR_SETTLEMENT');

COMMENT ON TABLE sale_payments IS 'Single source of truth for all payment transactions. Each payment method (CASH, CARD, TRANSFER, QR) is recorded here.';
COMMENT ON COLUMN sale_payments.idempotency_key IS 'Ensures exactly-once processing of payment requests. Client should generate and include in retry attempts.';
COMMENT ON COLUMN sale_payments.metadata IS 'Payment method-specific data. Structure varies by payment_type.';
COMMENT ON COLUMN sale_payments.status_history IS 'Immutable log of all status transitions for audit trail.';
```

---

### Denormalización para Performance

```sql
-- ============================================
-- CACHES DENORMALIZADOS
-- ============================================

-- Cash Sessions: Cache de totales de efectivo
ALTER TABLE cash_sessions ADD COLUMN IF NOT EXISTS
  cash_sales NUMERIC(15,4) DEFAULT 0,
  cash_refunds NUMERIC(15,4) DEFAULT 0,
  net_cash NUMERIC(15,4) GENERATED ALWAYS AS (cash_sales + cash_refunds) STORED;

COMMENT ON COLUMN cash_sessions.cash_sales IS 'DENORMALIZED: Sum of CASH payments. Updated by trigger from sale_payments.';
COMMENT ON COLUMN cash_sessions.cash_refunds IS 'DENORMALIZED: Sum of CASH refunds. Updated by trigger from sale_payments.';

-- Operational Shifts: Cache de totales por método
ALTER TABLE operational_shifts ADD COLUMN IF NOT EXISTS
  cash_total NUMERIC(12,2) DEFAULT 0,
  card_total NUMERIC(12,2) DEFAULT 0,
  transfer_total NUMERIC(12,2) DEFAULT 0,
  qr_total NUMERIC(12,2) DEFAULT 0,
  other_total NUMERIC(12,2) DEFAULT 0;

COMMENT ON COLUMN operational_shifts.cash_total IS 'DENORMALIZED: Sum of CASH payments in this shift. Updated by trigger.';
```

---

### Triggers para Mantener Denormalización

```sql
-- ============================================
-- TRIGGER 1: Actualizar cash_sessions
-- ============================================
CREATE OR REPLACE FUNCTION sync_cash_session_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo procesar si es pago en CASH
  IF NEW.payment_type = 'CASH' AND NEW.cash_session_id IS NOT NULL THEN
    UPDATE cash_sessions
    SET
      cash_sales = cash_sales + CASE
        WHEN NEW.transaction_type = 'PAYMENT' THEN NEW.amount
        ELSE 0
      END,
      cash_refunds = cash_refunds + CASE
        WHEN NEW.transaction_type IN ('REFUND', 'CHARGEBACK') THEN NEW.amount
        ELSE 0
      END
    WHERE id = NEW.cash_session_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_cash_session
  AFTER INSERT ON sale_payments
  FOR EACH ROW
  EXECUTE FUNCTION sync_cash_session_totals();

COMMENT ON FUNCTION sync_cash_session_totals() IS
  'Maintains denormalized cash_sales and cash_refunds in cash_sessions table. ' ||
  'This is a CACHE for performance - sale_payments remains the source of truth.';

-- ============================================
-- TRIGGER 2: Actualizar operational_shifts
-- ============================================
CREATE OR REPLACE FUNCTION sync_shift_payment_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo contar PAYMENTS, no REFUNDS (refunds se manejan en columnas separadas o se restan)
  IF NEW.transaction_type = 'PAYMENT' THEN
    UPDATE operational_shifts
    SET
      cash_total = cash_total + CASE WHEN NEW.payment_type = 'CASH' THEN NEW.amount ELSE 0 END,
      card_total = card_total + CASE WHEN NEW.payment_type = 'CARD' THEN NEW.amount ELSE 0 END,
      transfer_total = transfer_total + CASE WHEN NEW.payment_type = 'TRANSFER' THEN NEW.amount ELSE 0 END,
      qr_total = qr_total + CASE WHEN NEW.payment_type = 'QR' THEN NEW.amount ELSE 0 END,
      other_total = other_total + CASE WHEN NEW.payment_type = 'OTHER' THEN NEW.amount ELSE 0 END
    WHERE id = NEW.shift_id;
  ELSIF NEW.transaction_type IN ('REFUND', 'CHARGEBACK') THEN
    -- Refunds son negativos, entonces restamos (o sumamos el valor negativo)
    UPDATE operational_shifts
    SET
      cash_total = cash_total + CASE WHEN NEW.payment_type = 'CASH' THEN NEW.amount ELSE 0 END,
      card_total = card_total + CASE WHEN NEW.payment_type = 'CARD' THEN NEW.amount ELSE 0 END,
      transfer_total = transfer_total + CASE WHEN NEW.payment_type = 'TRANSFER' THEN NEW.amount ELSE 0 END,
      qr_total = qr_total + CASE WHEN NEW.payment_type = 'QR' THEN NEW.amount ELSE 0 END,
      other_total = other_total + CASE WHEN NEW.payment_type = 'OTHER' THEN NEW.amount ELSE 0 END
    WHERE id = NEW.shift_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_shift_totals
  AFTER INSERT ON sale_payments
  FOR EACH ROW
  EXECUTE FUNCTION sync_shift_payment_totals();

COMMENT ON FUNCTION sync_shift_payment_totals() IS
  'Maintains denormalized payment totals by type in operational_shifts table. ' ||
  'This is a CACHE for quick shift reconciliation - sale_payments remains the source of truth.';

-- ============================================
-- TRIGGER 3: Validar transiciones de estado
-- ============================================
CREATE OR REPLACE FUNCTION validate_payment_status_transition()
RETURNS TRIGGER AS $$
DECLARE
  valid_transition BOOLEAN := FALSE;
  old_status TEXT := OLD.status::TEXT;
  new_status TEXT := NEW.status::TEXT;
BEGIN
  -- Si es INSERT, permitir solo INITIATED
  IF TG_OP = 'INSERT' THEN
    IF NEW.status != 'INITIATED' THEN
      RAISE EXCEPTION 'New payments must have status INITIATED';
    END IF;
    RETURN NEW;
  END IF;

  -- Si el status no cambió, permitir (UPDATE de otros campos)
  IF old_status = new_status THEN
    RETURN NEW;
  END IF;

  -- Validar transiciones permitidas
  valid_transition := CASE
    WHEN old_status = 'INITIATED' AND new_status IN ('AUTHORIZED', 'FAILED') THEN TRUE
    WHEN old_status = 'AUTHORIZED' AND new_status IN ('SUBMITTED_FOR_SETTLEMENT', 'VOIDED', 'FAILED') THEN TRUE
    WHEN old_status = 'SUBMITTED_FOR_SETTLEMENT' AND new_status IN ('SETTLING', 'VOIDED') THEN TRUE
    WHEN old_status = 'SETTLING' AND new_status IN ('SETTLED', 'FAILED') THEN TRUE
    WHEN old_status = 'SETTLED' AND new_status IN ('REFUND_PENDING', 'CHARGEBACK_PENDING') THEN TRUE
    WHEN old_status = 'REFUND_PENDING' AND new_status = 'REFUNDED' THEN TRUE
    WHEN old_status = 'CHARGEBACK_PENDING' AND new_status = 'CHARGEDBACK' THEN TRUE
    ELSE FALSE
  END;

  IF NOT valid_transition THEN
    RAISE EXCEPTION 'Invalid payment status transition from % to %', old_status, new_status;
  END IF;

  -- Log transition en status_history
  NEW.status_history := OLD.status_history || jsonb_build_object(
    'from', old_status,
    'to', new_status,
    'timestamp', NOW(),
    'changed_by', current_user
  );

  -- Actualizar timestamp correspondiente
  CASE new_status
    WHEN 'AUTHORIZED' THEN NEW.authorized_at := NOW();
    WHEN 'SUBMITTED_FOR_SETTLEMENT' THEN NEW.submitted_for_settlement_at := NOW();
    WHEN 'SETTLED' THEN NEW.settled_at := NOW();
    WHEN 'VOIDED' THEN NEW.voided_at := NOW();
    WHEN 'REFUNDED' THEN NEW.refunded_at := NOW();
    ELSE NULL;
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_payment_status_transitions
  BEFORE UPDATE OF status ON sale_payments
  FOR EACH ROW
  EXECUTE FUNCTION validate_payment_status_transition();

COMMENT ON FUNCTION validate_payment_status_transition() IS
  'Enforces valid state machine transitions for payment status. ' ||
  'Prevents invalid transitions and maintains audit trail in status_history.';

-- ============================================
-- TRIGGER 4: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sale_payments_updated_at
  BEFORE UPDATE ON sale_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

### Vistas Útiles para Queries

```sql
-- ============================================
-- VISTA: Payment Summary por Sale
-- ============================================
CREATE VIEW v_sale_payment_summary AS
SELECT
  sale_id,
  COUNT(*) FILTER (WHERE transaction_type = 'PAYMENT') as payment_count,
  COUNT(*) FILTER (WHERE transaction_type = 'REFUND') as refund_count,
  SUM(amount) FILTER (WHERE transaction_type = 'PAYMENT') as total_payments,
  SUM(amount) FILTER (WHERE transaction_type = 'REFUND') as total_refunds,
  SUM(amount) as net_amount,
  jsonb_object_agg(
    payment_type,
    amount
  ) FILTER (WHERE transaction_type = 'PAYMENT') as payments_by_type,
  MAX(created_at) as last_payment_at
FROM sale_payments
GROUP BY sale_id;

-- ============================================
-- VISTA: Shift Payment Summary
-- ============================================
CREATE VIEW v_shift_payment_summary AS
SELECT
  shift_id,
  payment_type,
  COUNT(*) as transaction_count,
  SUM(amount) FILTER (WHERE transaction_type = 'PAYMENT') as total_payments,
  SUM(amount) FILTER (WHERE transaction_type = 'REFUND') as total_refunds,
  SUM(amount) as net_amount,
  ARRAY_AGG(DISTINCT status) as statuses
FROM sale_payments
GROUP BY shift_id, payment_type;

-- ============================================
-- VISTA: Payments Pending Settlement
-- ============================================
CREATE VIEW v_payments_pending_settlement AS
SELECT
  id,
  sale_id,
  payment_type,
  amount,
  status,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - created_at))/3600 as hours_since_authorization
FROM sale_payments
WHERE status IN ('AUTHORIZED', 'SUBMITTED_FOR_SETTLEMENT')
  AND payment_type IN ('CARD', 'QR', 'TRANSFER') -- NO CASH (cash se settle inmediatamente)
ORDER BY created_at ASC;

COMMENT ON VIEW v_payments_pending_settlement IS
  'Payments that need to be captured/settled. Used for batch settlement processing.';
```

---

## 🔄 Flujos de Proceso Recomendados

### Flujo 1: Procesar Venta con Múltiples Métodos de Pago

```typescript
async function processSale(saleData: {
  items: SaleItem[],
  total: Decimal,
  paymentMethods: PaymentMethod[],
  currentShift: Shift,
  currentCashSession?: CashSession
}): Promise<Sale> {

  // 1. Validar que suma de payments = total
  const paymentsTotal = saleData.paymentMethods.reduce(
    (sum, pm) => sum.plus(pm.amount),
    new Decimal(0)
  );

  if (!paymentsTotal.equals(saleData.total)) {
    throw new Error('Payment amounts must equal sale total');
  }

  // 2. Crear la venta (en transaction)
  const result = await db.transaction(async (trx) => {

    // 2a. Crear sale record
    const sale = await trx.insert(sales).values({
      total: saleData.total,
      shift_id: saleData.currentShift.id,
      // ... other fields
    }).returning();

    // 2b. Procesar cada payment method
    for (const paymentMethod of saleData.paymentMethods) {

      // Calcular tax breakdown para journal entry
      const taxBreakdown = calculateTaxes(paymentMethod.amount);

      // Crear journal entry (contabilidad de doble entrada)
      const journalEntry = await trx.insert(journal_entries).values({
        entry_type: 'SALE',
        description: `Sale ${sale.id} - ${paymentMethod.type} payment`,
        source_type: 'sale_payment',
      }).returning();

      await trx.insert(journal_lines).values([
        {
          journal_entry_id: journalEntry.id,
          account_code: getAccountCodeForPaymentType(paymentMethod.type), // 1.1.01 (Cash), 1.1.02 (Card), etc
          amount: paymentMethod.amount, // DEBIT
          description: `${paymentMethod.type} received`
        },
        {
          journal_entry_id: journalEntry.id,
          account_code: '4.1', // Revenue
          amount: taxBreakdown.subtotal.negated(), // CREDIT
          description: 'Revenue'
        },
        {
          journal_entry_id: journalEntry.id,
          account_code: '2.1.02', // IVA Payable
          amount: taxBreakdown.taxAmount.negated(), // CREDIT
          description: 'IVA collected'
        }
      ]);

      // Generar idempotency key (client-side en producción)
      const idempotencyKey = generateIdempotencyKey(
        sale.id,
        paymentMethod.type,
        paymentMethod.amount
      );

      // Verificar si ya existe (prevenir duplicados)
      const existing = await trx.select()
        .from(sale_payments)
        .where(eq(sale_payments.idempotency_key, idempotencyKey))
        .limit(1);

      if (existing.length > 0) {
        // Ya existe, retornar existing (idempotencia)
        continue;
      }

      // Crear sale_payment (FUENTE DE VERDAD)
      const salePayment = await trx.insert(sale_payments).values({
        sale_id: sale.id,
        journal_entry_id: journalEntry.id,
        payment_type: paymentMethod.type,
        payment_method_id: paymentMethod.method_id,
        amount: paymentMethod.amount,
        shift_id: saleData.currentShift.id,
        cash_session_id: paymentMethod.type === 'CASH'
          ? saleData.currentCashSession?.id
          : null,
        status: 'INITIATED',
        idempotency_key: idempotencyKey,
        metadata: paymentMethod.metadata,
        transaction_type: 'PAYMENT'
      }).returning();

      // 2c. Procesamiento específico por tipo de pago
      if (paymentMethod.type === 'CASH') {
        // CASH: Inmediatamente SETTLED (no requiere autorización externa)
        await trx.update(sale_payments)
          .set({
            status: 'SETTLED',
            settled_at: new Date()
          })
          .where(eq(sale_payments.id, salePayment.id));

        // Trigger sync_cash_session_totals se ejecuta automáticamente

      } else if (paymentMethod.type === 'CARD') {
        // CARD: Autorizar con payment gateway
        const authResult = await authorizeCardPayment({
          amount: paymentMethod.amount,
          cardToken: paymentMethod.metadata.card_token,
          // ... other params
        });

        if (authResult.approved) {
          await trx.update(sale_payments)
            .set({
              status: 'AUTHORIZED',
              authorized_at: new Date(),
              metadata: {
                ...paymentMethod.metadata,
                authorization_code: authResult.authCode,
                terminal_id: authResult.terminalId
              }
            })
            .where(eq(sale_payments.id, salePayment.id));

          // Nota: Capture se hace en batch al final del día
        } else {
          await trx.update(sale_payments)
            .set({ status: 'FAILED' })
            .where(eq(sale_payments.id, salePayment.id));

          throw new Error(`Card authorization failed: ${authResult.message}`);
        }

      } else if (paymentMethod.type === 'TRANSFER' || paymentMethod.type === 'QR') {
        // TRANSFER/QR: Inicialmente AUTHORIZED, webhook confirmará settlement
        await trx.update(sale_payments)
          .set({
            status: 'AUTHORIZED',
            authorized_at: new Date()
          })
          .where(eq(sale_payments.id, salePayment.id));

        // Webhook handler actualizará a SETTLED cuando banco confirme
      }

      // 2d. Emitir evento (para otros módulos)
      await EventBus.emit('sales.payment.completed', {
        saleId: sale.id,
        paymentId: salePayment.id,
        amount: paymentMethod.amount,
        paymentType: paymentMethod.type,
        status: salePayment.status
      });
    }

    return sale;
  });

  return result;
}
```

**Notas Importantes:**
- ✅ **Idempotencia**: Cada payment tiene idempotency_key único
- ✅ **Transaction**: Todo en una DB transaction para atomicidad
- ✅ **Double-Entry**: Cada payment genera journal entry balanceado
- ✅ **State Machine**: Status transitions siguen reglas validadas por trigger
- ✅ **Denormalización Automática**: Triggers actualizan caches en cash_sessions y operational_shifts

---

### Flujo 2: Batch Settlement al Final del Día

```typescript
async function processDailyBatchSettlement(shiftId: string): Promise<SettlementResult> {

  // 1. Obtener payments AUTHORIZED que necesitan settlement
  const paymentsToSettle = await db.select()
    .from(sale_payments)
    .where(
      and(
        eq(sale_payments.shift_id, shiftId),
        eq(sale_payments.status, 'AUTHORIZED'),
        inArray(sale_payments.payment_type, ['CARD', 'QR', 'TRANSFER'])
      )
    );

  if (paymentsToSettle.length === 0) {
    return { message: 'No payments to settle', count: 0 };
  }

  // 2. Agrupar por payment gateway
  const paymentsByGateway = groupBy(paymentsToSettle, 'metadata.gateway_id');

  const results = [];

  // 3. Procesar batch por cada gateway
  for (const [gatewayId, payments] of Object.entries(paymentsByGateway)) {

    // 3a. Marcar como SUBMITTED_FOR_SETTLEMENT
    await db.update(sale_payments)
      .set({
        status: 'SUBMITTED_FOR_SETTLEMENT',
        submitted_for_settlement_at: new Date()
      })
      .where(inArray(sale_payments.id, payments.map(p => p.id)));

    // 3b. Enviar batch al gateway
    const batchRequest = {
      batch_id: generateBatchId(),
      gateway_id: gatewayId,
      transactions: payments.map(p => ({
        payment_id: p.id,
        authorization_code: p.metadata.authorization_code,
        amount: p.amount
      }))
    };

    try {
      const batchResult = await submitBatchToGateway(batchRequest);

      results.push({
        gateway_id: gatewayId,
        batch_id: batchResult.batch_id,
        payment_count: payments.length,
        total_amount: payments.reduce((sum, p) => sum + p.amount, 0),
        status: 'SUBMITTED'
      });

      // 3c. Actualizar metadata con batch_id
      await db.update(sale_payments)
        .set({
          metadata: sql`metadata || jsonb_build_object('settlement_batch_id', ${batchResult.batch_id})`
        })
        .where(inArray(sale_payments.id, payments.map(p => p.id)));

    } catch (error) {
      // Log error pero continuar con otros gateways
      logger.error('Batch settlement failed', { gatewayId, error });

      results.push({
        gateway_id: gatewayId,
        status: 'FAILED',
        error: error.message
      });
    }
  }

  // 4. Emitir evento
  await EventBus.emit('payments.batch_settlement.completed', {
    shift_id: shiftId,
    results
  });

  return {
    message: 'Batch settlement processed',
    count: paymentsToSettle.length,
    results
  };
}
```

**Webhook Handler para Confirmar Settlement:**
```typescript
async function handlePaymentSettlementWebhook(webhookData: {
  gateway_id: string,
  batch_id: string,
  settled_transactions: Array<{
    payment_id: string,
    settled_amount: Decimal,
    settlement_date: Date
  }>
}): Promise<void> {

  for (const transaction of webhookData.settled_transactions) {

    // Verificar que payment existe y está en estado correcto
    const payment = await db.select()
      .from(sale_payments)
      .where(eq(sale_payments.id, transaction.payment_id))
      .limit(1);

    if (!payment || payment.status !== 'SUBMITTED_FOR_SETTLEMENT') {
      logger.warn('Invalid payment for settlement', { payment_id: transaction.payment_id });
      continue;
    }

    // Actualizar a SETTLED
    await db.update(sale_payments)
      .set({
        status: 'SETTLED',
        settled_at: transaction.settlement_date,
        metadata: sql`metadata || jsonb_build_object('settled_amount', ${transaction.settled_amount})`
      })
      .where(eq(sale_payments.id, transaction.payment_id));

    // Emitir evento
    await EventBus.emit('sales.payment.settled', {
      payment_id: transaction.payment_id,
      settled_amount: transaction.settled_amount,
      settlement_date: transaction.settlement_date
    });
  }
}
```

---

### Flujo 3: Procesar Refund

```typescript
async function processRefund(refundData: {
  original_payment_id: string,
  refund_amount: Decimal,
  reason: string,
  current_user_id: string
}): Promise<Refund> {

  // 1. Validar payment original
  const originalPayment = await db.select()
    .from(sale_payments)
    .where(eq(sale_payments.id, refundData.original_payment_id))
    .limit(1);

  if (!originalPayment) {
    throw new Error('Original payment not found');
  }

  if (originalPayment.status !== 'SETTLED') {
    throw new Error('Can only refund SETTLED payments. Use VOID for unsettled payments.');
  }

  // 2. Validar monto
  const alreadyRefunded = await db.select()
    .from(sale_payments)
    .where(
      and(
        eq(sale_payments.parent_payment_id, refundData.original_payment_id),
        eq(sale_payments.transaction_type, 'REFUND')
      )
    );

  const totalRefunded = alreadyRefunded.reduce((sum, r) => sum.plus(r.amount.abs()), new Decimal(0));
  const maxRefundable = new Decimal(originalPayment.amount).minus(totalRefunded);

  if (refundData.refund_amount.greaterThan(maxRefundable)) {
    throw new Error(`Refund amount exceeds maximum refundable: ${maxRefundable}`);
  }

  // 3. Procesar refund (en transaction)
  const result = await db.transaction(async (trx) => {

    // 3a. Crear reversing journal entry
    const reversingEntry = await trx.insert(journal_entries).values({
      entry_type: 'REFUND',
      description: `Refund for Sale ${originalPayment.sale_id}`,
      source_type: 'refund',
    }).returning();

    // Calcular tax breakdown del refund
    const taxBreakdown = calculateTaxes(refundData.refund_amount);

    await trx.insert(journal_lines).values([
      {
        journal_entry_id: reversingEntry.id,
        account_code: getAccountCodeForPaymentType(originalPayment.payment_type),
        amount: refundData.refund_amount.negated(), // CREDIT (opposite of original)
        description: `${originalPayment.payment_type} refunded`
      },
      {
        journal_entry_id: reversingEntry.id,
        account_code: '4.1', // Revenue
        amount: taxBreakdown.subtotal, // DEBIT (opposite of original)
        description: 'Revenue reversal'
      },
      {
        journal_entry_id: reversingEntry.id,
        account_code: '2.1.02', // IVA Payable
        amount: taxBreakdown.taxAmount, // DEBIT (opposite of original)
        description: 'IVA reversal'
      }
    ]);

    // 3b. Crear refund payment record
    const refundPayment = await trx.insert(sale_payments).values({
      sale_id: originalPayment.sale_id,
      journal_entry_id: reversingEntry.id,
      payment_type: originalPayment.payment_type,
      payment_method_id: originalPayment.payment_method_id,
      amount: refundData.refund_amount.negated(), // NEGATIVE amount
      shift_id: originalPayment.shift_id,
      cash_session_id: originalPayment.cash_session_id, // Same session if CASH
      status: 'INITIATED',
      transaction_type: 'REFUND',
      parent_payment_id: refundData.original_payment_id, // Link to original
      idempotency_key: generateIdempotencyKey('refund', originalPayment.id, refundData.refund_amount),
      metadata: {
        reason: refundData.reason,
        original_payment_id: originalPayment.id
      }
    }).returning();

    // 3c. Procesamiento específico por tipo
    if (originalPayment.payment_type === 'CASH') {
      // CASH: Refund inmediato
      await trx.update(sale_payments)
        .set({
          status: 'REFUNDED',
          refunded_at: new Date()
        })
        .where(eq(sale_payments.id, refundPayment.id));

      // Trigger sync_cash_session_totals actualizará automáticamente

    } else if (originalPayment.payment_type === 'CARD') {
      // CARD: Procesar refund con gateway
      const refundResult = await processCardRefund({
        original_transaction_id: originalPayment.metadata.transaction_id,
        amount: refundData.refund_amount
      });

      if (refundResult.approved) {
        await trx.update(sale_payments)
          .set({
            status: 'REFUNDED',
            refunded_at: new Date(),
            metadata: {
              ...refundPayment.metadata,
              gateway_refund_id: refundResult.refund_id
            }
          })
          .where(eq(sale_payments.id, refundPayment.id));
      } else {
        await trx.update(sale_payments)
          .set({ status: 'FAILED' })
          .where(eq(sale_payments.id, refundPayment.id));

        throw new Error(`Refund failed: ${refundResult.message}`);
      }
    }

    // 3d. Actualizar original payment
    await trx.update(sale_payments)
      .set({
        status: 'REFUND_PENDING', // Or keep as SETTLED, depends on business logic
        metadata: sql`metadata || jsonb_build_object('refund_payment_id', ${refundPayment.id})`
      })
      .where(eq(sale_payments.id, originalPayment.id));

    // 3e. Emitir evento
    await EventBus.emit('sales.payment.refunded', {
      original_payment_id: originalPayment.id,
      refund_payment_id: refundPayment.id,
      refund_amount: refundData.refund_amount,
      reason: refundData.reason
    });

    return refundPayment;
  });

  return result;
}
```

**Notas:**
- ✅ **Linked Transactions**: Refund linked a original via `parent_payment_id`
- ✅ **Negative Amount**: Refunds tienen amount negativo
- ✅ **Reversing Entry**: Journal entry con amounts opuestos al original
- ✅ **Validación**: No permite refunds mayores al amount disponible
- ✅ **Denormalización**: Triggers actualizan caches automáticamente

---

## 📊 Queries Comunes

### Query 1: Total Recibido por Cajero Hoy (CASH)

```sql
-- Simple query desde source of truth
SELECT SUM(amount) as total_cash_received
FROM sale_payments
WHERE payment_type = 'CASH'
  AND cash_session_id = :session_id
  AND transaction_type = 'PAYMENT'; -- Solo payments, no refunds

-- O usar el cache denormalizado (más rápido)
SELECT cash_sales
FROM cash_sessions
WHERE id = :session_id;
```

### Query 2: Desglose de Ventas por Método en Turno

```sql
-- Desde source of truth
SELECT
  payment_type,
  COUNT(*) FILTER (WHERE transaction_type = 'PAYMENT') as payment_count,
  COUNT(*) FILTER (WHERE transaction_type = 'REFUND') as refund_count,
  SUM(amount) FILTER (WHERE transaction_type = 'PAYMENT') as total_payments,
  SUM(amount) FILTER (WHERE transaction_type = 'REFUND') as total_refunds,
  SUM(amount) as net_amount
FROM sale_payments
WHERE shift_id = :shift_id
GROUP BY payment_type;

-- O usar cache denormalizado (más rápido)
SELECT
  cash_total,
  card_total,
  transfer_total,
  qr_total,
  other_total
FROM operational_shifts
WHERE id = :shift_id;
```

### Query 3: Payments Pendientes de Settlement

```sql
SELECT
  id,
  payment_type,
  amount,
  status,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - created_at))/3600 as hours_pending
FROM sale_payments
WHERE status IN ('AUTHORIZED', 'SUBMITTED_FOR_SETTLEMENT')
  AND payment_type IN ('CARD', 'QR', 'TRANSFER')
ORDER BY created_at ASC;
```

### Query 4: Audit Trail de un Payment

```sql
SELECT
  id,
  status,
  status_history,
  initiated_at,
  authorized_at,
  settled_at,
  metadata
FROM sale_payments
WHERE id = :payment_id;

-- Extraer status history readable
SELECT
  jsonb_array_elements(status_history) as transition
FROM sale_payments
WHERE id = :payment_id;
```

### Query 5: Reconciliación de Cash Session

```sql
SELECT
  cs.id as session_id,
  cs.starting_cash,
  cs.cash_sales, -- Denormalized cache

  -- Verify cache contra source of truth
  (
    SELECT COALESCE(SUM(amount), 0)
    FROM sale_payments
    WHERE cash_session_id = cs.id
      AND payment_type = 'CASH'
      AND transaction_type = 'PAYMENT'
  ) as cash_sales_verified,

  (
    SELECT COALESCE(SUM(amount), 0)
    FROM sale_payments
    WHERE cash_session_id = cs.id
      AND payment_type = 'CASH'
      AND transaction_type = 'REFUND'
  ) as cash_refunds,

  cs.cash_drops,
  cs.expected_closing_cash,
  cs.actual_closing_cash,
  (cs.actual_closing_cash - cs.expected_closing_cash) as variance
FROM cash_sessions cs
WHERE cs.id = :session_id;
```

---

## 🔐 Consideraciones de Seguridad

### 1. PCI-DSS Compliance

**NUNCA ALMACENAR:**
- ❌ Full card number (solo últimos 4 dígitos)
- ❌ CVV/CVC
- ❌ PIN

**SIEMPRE USAR:**
- ✅ Tokenization para card data
- ✅ Semi-integrated payment architecture
- ✅ PCI-compliant payment gateway

**Implementación:**
```typescript
// ❌ INCORRECTO - Nunca hacer esto
const payment = {
  card_number: '4111111111111111',
  cvv: '123',
  expiry: '12/25'
};

// ✅ CORRECTO - Usar tokenization
const tokenResult = await paymentGateway.tokenizeCard({
  card_number: cardData.number,
  cvv: cardData.cvv,
  expiry: cardData.expiry
});

const payment = {
  payment_type: 'CARD',
  amount: amount,
  metadata: {
    card_token: tokenResult.token, // Token, no card number
    last_4_digits: cardData.number.slice(-4),
    card_brand: tokenResult.card_brand,
    // No CVV, no full number
  }
};
```

### 2. Idempotency Keys - Seguridad contra Duplicados

```typescript
// Client genera idempotency key
const idempotencyKey = crypto.randomUUID();

// En cada retry, usa el MISMO key
await fetch('/api/payments', {
  method: 'POST',
  headers: {
    'X-Idempotency-Key': idempotencyKey
  },
  body: JSON.stringify(paymentData)
});

// Server verifica
const existing = await db.select()
  .from(payment_requests)
  .where(eq(payment_requests.idempotency_key, idempotencyKey));

if (existing.length > 0) {
  if (existing[0].status === 'COMPLETED') {
    // Retornar mismo resultado (idempotencia)
    return existing[0].response_payload;
  } else if (existing[0].status === 'PROCESSING') {
    // Ya se está procesando, retry later
    throw new ConflictError('Payment already processing');
  }
}
```

### 3. Audit Trail Inmutable

```sql
-- ❌ NUNCA hacer UPDATE directo de amounts
UPDATE sale_payments SET amount = 100 WHERE id = 'xxx';

-- ✅ SIEMPRE crear nueva transacción de reversal
INSERT INTO sale_payments (
  transaction_type,
  parent_payment_id,
  amount,
  -- ...
) VALUES (
  'REFUND',
  'original-payment-id',
  -100, -- Negative
  -- ...
);
```

### 4. Access Control

```sql
-- Row-Level Security (RLS) en Supabase
CREATE POLICY "Users can only view payments from their location"
  ON sale_payments
  FOR SELECT
  USING (
    shift_id IN (
      SELECT id FROM operational_shifts
      WHERE location_id = auth.jwt()->>'location_id'
    )
  );
```

---

## 📚 Conclusiones y Recomendaciones

### ✅ Arquitectura Recomendada: OPCIÓN B

**sale_payments como Single Source of Truth + Denormalización Estratégica**

### Razones:

1. **Estándares de Industria**: SAP, Oracle, NetSuite usan este patrón
2. **Simplicidad vs Robustez**: Balance perfecto
3. **Idempotencia**: Previene duplicados (92% reducción en Airbnb)
4. **State Machine**: Maneja lifecycle completo de transacciones
5. **Audit Trail**: Status history inmutable
6. **Performance**: Caches denormalizados para queries rápidos
7. **Extensibilidad**: Fácil agregar nuevos payment methods
8. **Team Readiness**: No requiere expertise en Event Sourcing

### Cambios Necesarios:

1. ✅ Eliminar `shift_payments` (redundante con sale_payments)
2. ✅ Agregar campos a `sale_payments`:
   - `idempotency_key`
   - `status` (enum)
   - `transaction_type` ('PAYMENT' | 'REFUND' | 'CHARGEBACK')
   - `parent_payment_id` (para refunds)
   - `status_history` (JSONB)
3. ✅ Crear triggers para denormalización
4. ✅ Implementar status transition validation
5. ✅ Migrar lógica existente

### Migración Path:

```sql
-- Phase 1: Add new columns to sale_payments
ALTER TABLE sale_payments ADD COLUMN IF NOT EXISTS
  idempotency_key UUID UNIQUE DEFAULT gen_random_uuid(),
  status payment_status DEFAULT 'SETTLED', -- Existing payments considered settled
  transaction_type TEXT DEFAULT 'PAYMENT',
  parent_payment_id UUID REFERENCES sale_payments(id),
  status_history JSONB DEFAULT '[]'::jsonb;

-- Phase 2: Migrate data from shift_payments (if any)
-- ... migration script ...

-- Phase 3: Create triggers
-- ... (triggers from schema section) ...

-- Phase 4: Drop shift_payments
DROP TABLE IF EXISTS shift_payments;
```

---

## 📖 Referencias y Fuentes

### Payment Processing Architecture
- [How to Build a Scalable Payments System - CockroachDB](https://www.cockroachlabs.com/blog/cockroachdb-payments-system-architecture/)
- [Design a Payment System - System Design Handbook](https://www.systemdesignhandbook.com/guides/design-a-payment-system/)
- [Database Design Patterns for Payment Systems - LinkedIn](https://www.linkedin.com/advice/3/what-some-database-design-patterns-payment-systems-uwevc)

### ERP Payment Systems
- [SAP Payment Processing - SAPinsider](https://sapinsider.org/topic/sap-finance/sap-payment-processing/)
- [Oracle Payments Implementation Guide](https://docs.oracle.com/cd/E26401_01/doc.122/e48768/T387353T387356.htm)
- [NetSuite Payment Processing](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/preface_4289351924.html)

### POS and Multi-Tender
- [Split Tender Payment in POS - ConnectPOS](https://www.connectpos.com/split-tender-payment-in-pos/)
- [Payment Methods in POS - ConnectPOS](https://www.connectpos.com/split-tender-payment-in-pos/)

### Cash Management
- [Cash Drawer Management - POS Highway](https://www.poshighway.com/blog/cash-drawer-management-cycle-counts-reconcilation-activation-and-closing/)
- [Cash Float Management - ConnectPOS](https://www.connectpos.com/how-to-manage-cash-float-in-pos/)
- [Shift and Cash Drawer Management - Microsoft Dynamics 365](https://learn.microsoft.com/en-us/dynamics365/commerce/shift-drawer-management)

### Payment Reconciliation
- [Automated Payment Reconciliation - Tipalti](https://tipalti.com/ap-automation/automated-payment-reconciliation/)
- [POS Reconciliation Guide - GOFTX](https://goftx.com/blog/pos-reconciliation-guide/)

### Security (PCI-DSS)
- [PCI DSS Tokenization - RSI Security](https://blog.rsisecurity.com/how-to-meet-tokenization-pci-dss-requirements/)
- [PCI DSS Encryption Requirements - Evervault](https://evervault.com/blog/encryption-requirements-for-PCI-compliance-2025)
- [PCI DSS 4.0.1 Compliance Guide - UpGuard](https://www.upguard.com/blog/pci-compliance)

### Idempotency
- [Idempotency in Finance - CockroachDB](https://www.cockroachlabs.com/blog/idempotency-in-finance/)
- [Avoiding Double Payments - Airbnb Engineering](https://medium.com/airbnb-engineering/avoiding-double-payments-in-a-distributed-payments-system-2981f6b070bb)
- [Idempotency in Payment Processing - IEEE](https://www.computer.org/publications/tech-news/trends/idempotency-in-payment-processing-architecture)

### Double-Entry Accounting
- [Double-Entry Accounting - NetSuite](https://www.netsuite.com/portal/resource/articles/accounting/double-entry-accounting.shtml)
- [Immutable Ledger Design - Modern Treasury](https://www.moderntreasury.com/journal/enforcing-immutability-in-your-double-entry-ledger)

### Event Sourcing & CQRS
- [Event Sourcing Pattern - Microsoft Azure](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing)
- [CQRS and Event Sourcing for Instant Payments - Icon Solutions](https://iconsolutions.com/blog/cqrs-event-sourcing/)

### Transaction Lifecycle
- [Transaction Statuses - PayPal Braintree](https://developer.paypal.com/braintree/docs/reference/general/statuses)
- [Transaction Types and Statuses - Payrix](https://resource.payrix.com/docs/transactions-types-and-statuses)
- [Transaction Statuses - Authorize.Net](https://support.authorize.net/knowledgebase/article/000001360/en-us)

### Refunds & Chargebacks
- [Payment Reversals - ReverseLogix](https://www.reverselogix.com/industry-updates/payment-reversals-refund-chargeback-reversal-transaction/)
- [Chargeback Lifecycle - Chargeflow](https://www.chargeflow.io/blog/chargeback-life-cycle/)
- [Data Models for Financial Transactions - Jessy](https://www.jessym.com/articles/data-models-for-financial-transactions)

### Payment Settlement
- [Payment Settlement Process - IXOPAY](https://www.ixopay.com/blog/what-is-the-payment-settlement-process-how-does-it-work)
- [Settlement in Payment Gateway - Worldline](https://worldline.com/en-in/home/main-navigation/resources/blogs/2023/how-does-the-settlement-process-work-in-a-payment-gateway)

---

## 🎯 Próximos Pasos

1. **Revisar con el equipo** esta investigación y arquitectura propuesta
2. **Validar** que la arquitectura recomendada cumple todos los requirements
3. **Planear migración** de arquitectura actual a la recomendada
4. **Implementar** cambios de schema en DB
5. **Crear migration scripts** para data existente
6. **Actualizar handlers y services** para usar nueva arquitectura
7. **Testing exhaustivo** de flujos de pago
8. **Documentar** APIs y flujos para el equipo

---

**Documento generado**: 2025-12-29
**Investigación realizada por**: Claude (Anthropic)
**Para proyecto**: G-Admin Mini
