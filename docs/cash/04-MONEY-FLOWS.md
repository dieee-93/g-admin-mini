# 💸 MONEY FLOWS - Cash Management System

**Versión**: 1.0.0
**Contexto**: Argentina - Ejemplos Prácticos

---

## 📋 ÍNDICE

1. [Flujo 1: Venta en Efectivo](#flujo-1-venta-en-efectivo)
2. [Flujo 2: Cash Drop (Retiro Parcial)](#flujo-2-cash-drop-retiro-parcial)
3. [Flujo 3: Depósito Bancario](#flujo-3-depósito-bancario)
4. [Flujo 4: Pago a Proveedor](#flujo-4-pago-a-proveedor)
5. [Flujo 5: Liquidación de Sueldos](#flujo-5-liquidación-de-sueldos)
6. [Flujo 6: Cierre de Caja (Arqueo)](#flujo-6-cierre-de-caja-arqueo)
7. [Flujo 7: Transferencia entre Cuentas](#flujo-7-transferencia-entre-cuentas)

---

## 💵 FLUJO 1: VENTA EN EFECTIVO

### Escenario
Cliente compra productos por **$1,000** (incluye IVA 21%) y paga en efectivo.

### Desglose
- Subtotal: $826.45
- IVA (21%): $173.55
- **Total: $1,000.00**

### Paso 1: Sales Module Procesa Venta

```typescript
// src/pages/admin/operations/sales/services/saleApi.ts
const sale = await processSale({
  customer_id: 'cust-123',
  items: [
    { product_id: 'prod-456', quantity: 2, unit_price: 413.22 }
  ],
  payment_method: 'CASH',
  location_id: 'loc-001'
});

// Emitir evento
await EventBus.emit('sales.payment.completed', {
  saleId: sale.id,
  amount: 1000,
  paymentMethod: 'CASH',
  customerId: 'cust-123',
  timestamp: new Date().toISOString()
}, 'SalesModule');
```

### Paso 2: Cash Module Escucha y Procesa

```typescript
// src/modules/cash/handlers/salesPaymentHandler.ts
EventBus.on('sales.payment.completed', async (event) => {
  const { saleId, amount, paymentMethod } = event.payload;

  // Solo procesar efectivo
  if (paymentMethod !== 'CASH') return;

  // Obtener sesión activa
  const session = await getActiveCashSession();

  // Crear journal entry (doble entrada)
  await createJournalEntry({
    entryType: 'SALE',
    referenceId: saleId,
    referenceType: 'SALE',
    transactionDate: new Date(),
    cashSessionId: session.id,
    lines: [
      {
        // Débito: Caja aumenta
        accountCode: '1.1.01.001', // Cash Drawer
        moneyLocationId: session.money_location_id,
        amount: '-1000.00' // Negativo = Débito
      },
      {
        // Crédito: Ingresos por ventas
        accountCode: '4.1', // Sales Revenue
        amount: '+826.45' // Positivo = Crédito
      },
      {
        // Crédito: IVA a pagar
        accountCode: '2.1.02', // Tax Payable
        amount: '+173.55'
      }
    ]
  });

  // Actualizar cash_session
  await updateCashSession(session.id, {
    cash_sales: session.cash_sales + 1000
  });
});
```

### Paso 3: Base de Datos

**Tabla `journal_entries`:**
```
id: je-001
entry_number: JE-2025-000123
entry_type: SALE
transaction_date: 2025-01-24
reference_id: sale-456
reference_type: SALE
cash_session_id: session-789
is_posted: true
```

**Tabla `journal_lines`:**
```
Line 1:
  journal_entry_id: je-001
  account_id: (1.1.01.001 - Cash Drawer)
  money_location_id: drawer-001
  amount: -1000.00  → Débito

Line 2:
  journal_entry_id: je-001
  account_id: (4.1 - Sales Revenue)
  amount: +826.45  → Crédito

Line 3:
  journal_entry_id: je-001
  account_id: (2.1.02 - Tax Payable)
  amount: +173.55  → Crédito

SUMA: -1000.00 + 826.45 + 173.55 = 0 ✅
```

**Tabla `cash_sessions`:**
```
id: session-789
money_location_id: drawer-001
starting_cash: 5000.00
cash_sales: 1000.00  ← Actualizado
status: OPEN
```

### Resultado Final

| Cuenta | Antes | Movimiento | Después |
|--------|-------|------------|---------|
| Cash Drawer (1.1.01.001) | $5,000.00 | +$1,000.00 | $6,000.00 |
| Sales Revenue (4.1) | $0.00 | +$826.45 | $826.45 |
| Tax Payable (2.1.02) | $0.00 | +$173.55 | $173.55 |

---

## 🏦 FLUJO 2: CASH DROP (RETIRO PARCIAL)

### Escenario
Hay mucho efectivo en la caja ($15,000). El cajero retira **$10,000** y lo lleva a la Caja Fuerte por seguridad.

### Paso 1: UI - Cajero Inicia Cash Drop

```typescript
// src/modules/cash/components/CashDropModal.tsx
async function handleCashDrop() {
  await cashDropService.create({
    fromMoneyLocationId: 'drawer-001',
    toMoneyLocationId: 'safe-001',
    amount: 10000,
    cashSessionId: activeSession.id,
    userId: currentUser.id,
    notes: 'Retiro parcial por exceso de efectivo'
  });
}
```

### Paso 2: Service Crea Journal Entry

```typescript
// src/modules/cash/services/cashDropService.ts
export async function createCashDrop(data) {
  await createJournalEntry({
    entryType: 'CASH_DROP',
    referenceId: data.cashSessionId,
    referenceType: 'CASH_SESSION',
    transactionDate: new Date(),
    cashSessionId: data.cashSessionId,
    description: data.notes,
    lines: [
      {
        // Débito: Caja Fuerte aumenta
        accountCode: '1.1.01.002', // Safe
        moneyLocationId: data.toMoneyLocationId,
        amount: '-10000.00'
      },
      {
        // Crédito: Caja Registradora disminuye
        accountCode: '1.1.01.001', // Cash Drawer
        moneyLocationId: data.fromMoneyLocationId,
        amount: '+10000.00'
      }
    ]
  });

  // Actualizar cash_session
  await updateCashSession(data.cashSessionId, {
    cash_drops: activeSession.cash_drops + 10000
  });

  // Emitir evento
  await EventBus.emit('cash.drop.completed', {
    from: 'Cash Drawer',
    to: 'Safe',
    amount: 10000,
    sessionId: data.cashSessionId
  }, 'CashModule');
}
```

### Paso 3: Journal Lines

```
Line 1:
  account: Safe (1.1.01.002)
  money_location: safe-001
  amount: -10000.00  → Débito (Safe aumenta)

Line 2:
  account: Cash Drawer (1.1.01.001)
  money_location: drawer-001
  amount: +10000.00  → Crédito (Drawer disminuye)

SUMA: -10000 + 10000 = 0 ✅
```

### Resultado Final

| Cuenta | Antes | Movimiento | Después |
|--------|-------|------------|---------|
| Cash Drawer | $15,000.00 | -$10,000.00 | $5,000.00 |
| Safe | $50,000.00 | +$10,000.00 | $60,000.00 |

---

## 🏛️ FLUJO 3: DEPÓSITO BANCARIO

### Escenario
La Caja Fuerte tiene **$60,000** acumulados. Se decide depositar **$50,000** en el banco.

### Paso 1: UI - Tesorero Inicia Depósito

```typescript
// src/modules/cash/components/BankDepositModal.tsx
async function handleBankDeposit() {
  await bankDepositService.create({
    fromMoneyLocationId: 'safe-001',
    toBankId: 'bank-001',
    amount: 50000,
    depositReference: 'DEP-2025-001',
    depositDate: new Date(),
    userId: currentUser.id
  });
}
```

### Paso 2: Service Crea Journal Entry

```typescript
// src/modules/cash/services/bankDepositService.ts
export async function createBankDeposit(data) {
  await createJournalEntry({
    entryType: 'DEPOSIT',
    referenceId: data.depositReference,
    referenceType: 'BANK_DEPOSIT',
    transactionDate: data.depositDate,
    externalReference: data.depositReference,
    lines: [
      {
        // Débito: Banco aumenta
        accountCode: '1.1.01.003', // Bank Account
        moneyLocationId: data.toBankId,
        amount: '-50000.00'
      },
      {
        // Crédito: Caja Fuerte disminuye
        accountCode: '1.1.01.002', // Safe
        moneyLocationId: data.fromMoneyLocationId,
        amount: '+50000.00'
      }
    ]
  });

  await EventBus.emit('cash.deposit.recorded', {
    from: 'Safe',
    to: 'Banco Galicia',
    amount: 50000,
    reference: data.depositReference
  }, 'CashModule');
}
```

### Resultado Final

| Cuenta | Antes | Movimiento | Después |
|--------|-------|------------|---------|
| Safe | $60,000.00 | -$50,000.00 | $10,000.00 |
| Banco Galicia | $100,000.00 | +$50,000.00 | $150,000.00 |

---

## 🏭 FLUJO 4: PAGO A PROVEEDOR

### Escenario
Se aprobó una orden de compra de materiales por **$30,000**. Se paga al proveedor desde el banco.

### Paso 1: Materials Module Emite Evento

```typescript
// src/pages/admin/supply-chain/materials/services/inventoryApi.ts
await EventBus.emit('materials.purchase.approved', {
  supplierOrderId: order.id,
  supplierId: supplier.id,
  total: 30000,
  paymentTerms: 'IMMEDIATE',
  dueDate: new Date()
}, 'MaterialsModule');
```

### Paso 2: Cash Module Registra Cuenta por Pagar

```typescript
// src/modules/cash/handlers/materialsHandler.ts
EventBus.on('materials.purchase.approved', async (event) => {
  const { supplierOrderId, supplierId, total } = event.payload;

  // Crear journal entry para cuenta por pagar
  await createJournalEntry({
    entryType: 'PURCHASE',
    referenceId: supplierOrderId,
    referenceType: 'SUPPLIER_ORDER',
    lines: [
      {
        // Débito: COGS (Costo de Ventas)
        accountCode: '5.1',
        amount: '-30000.00'
      },
      {
        // Crédito: Cuenta por Pagar
        accountCode: '2.1.01', // Accounts Payable
        amount: '+30000.00'
      }
    ]
  });
});
```

### Paso 3: UI - Contadora Procesa Pago

```typescript
// src/modules/cash/services/supplierPaymentService.ts
async function paySupplier(supplierId, amount, fromBankId) {
  await createJournalEntry({
    entryType: 'PAYMENT',
    referenceId: supplierId,
    referenceType: 'SUPPLIER',
    lines: [
      {
        // Débito: Cuenta por Pagar disminuye
        accountCode: '2.1.01',
        amount: '-30000.00'
      },
      {
        // Crédito: Banco disminuye
        accountCode: '1.1.01.003',
        moneyLocationId: fromBankId,
        amount: '+30000.00'
      }
    ]
  });

  await EventBus.emit('cash.supplier.paid', {
    supplierId,
    amount: 30000,
    bankId: fromBankId
  }, 'CashModule');
}
```

### Resultado Final (2 Journal Entries)

**Entry 1 - Registro de Compra:**

| Cuenta | Movimiento |
|--------|------------|
| COGS (5.1) | +$30,000 (Gasto) |
| Accounts Payable (2.1.01) | +$30,000 (Deuda) |

**Entry 2 - Pago:**

| Cuenta | Antes | Movimiento | Después |
|--------|-------|------------|---------|
| Accounts Payable | $30,000.00 | -$30,000.00 | $0.00 |
| Banco Galicia | $150,000.00 | -$30,000.00 | $120,000.00 |

---

## 👨‍💼 FLUJO 5: LIQUIDACIÓN DE SUELDOS

### Escenario
Fin de mes. Se liquidan **$264,000** de sueldos a 5 empleados desde el banco.

### Paso 1: Staff Module Procesa Nómina

```typescript
// src/pages/admin/resources/staff/services/staffApi.ts
const payroll = await processPayroll({
  periodId: 'period-202501',
  employees: [
    { id: 'emp-1', grossAmount: 150000, netAmount: 120000, deductions: 30000 },
    { id: 'emp-2', grossAmount: 180000, netAmount: 144000, deductions: 36000 }
    // ... más empleados
  ],
  totalGross: 330000,
  totalNet: 264000,
  totalDeductions: 66000,
  paymentDate: '2025-01-31'
});

await EventBus.emit('staff.payroll.processed', {
  payrollPeriodId: payroll.id,
  totalNet: 264000,
  paymentDate: '2025-01-31',
  employeeCount: 5
}, 'StaffModule');
```

### Paso 2: Cash Module Registra Pago

```typescript
// src/modules/cash/handlers/payrollHandler.ts
EventBus.on('staff.payroll.processed', async (event) => {
  const { payrollPeriodId, totalNet, paymentDate } = event.payload;

  const payrollBank = await getPayrollBankAccount();

  await createJournalEntry({
    entryType: 'PAYROLL',
    referenceId: payrollPeriodId,
    referenceType: 'PAYROLL_PERIOD',
    transactionDate: new Date(paymentDate),
    lines: [
      {
        // Débito: Gasto de Personal
        accountCode: '5.2', // Payroll Expense
        amount: '-264000.00'
      },
      {
        // Crédito: Banco disminuye
        accountCode: '1.1.01.003',
        moneyLocationId: payrollBank.id,
        amount: '+264000.00'
      }
    ]
  });

  await EventBus.emit('cash.payroll.recorded', {
    payrollPeriodId,
    amount: totalNet
  }, 'CashModule');
});
```

### Resultado Final

| Cuenta | Antes | Movimiento | Después |
|--------|-------|------------|---------|
| Payroll Expense (5.2) | $0.00 | +$264,000.00 | $264,000.00 |
| Banco Galicia | $120,000.00 | -$264,000.00 | -$144,000.00 ⚠️ |

**⚠️ ALERTA**: Banco en negativo. Necesita fondos.

---

## 🔍 FLUJO 6: CIERRE DE CAJA (ARQUEO)

### Escenario
Fin del turno. El cajero debe cerrar la caja y contar el efectivo.

### Estado al Inicio del Turno

**Cash Session (session-789):**
```
starting_cash: $5,000.00
cash_sales: $18,500.00      (de ventas)
cash_refunds: $500.00        (devoluciones)
cash_in: $0.00               (entradas extras)
cash_out: $200.00            (gastos menores)
cash_drops: $10,000.00       (retiro a caja fuerte)
```

### Paso 1: Sistema Calcula Esperado

```typescript
// src/modules/cash/services/cashSessionService.ts
function calculateExpectedCash(session) {
  const expected = DecimalUtils.add(
    session.starting_cash,
    DecimalUtils.subtract(
      DecimalUtils.add(session.cash_sales, session.cash_in, 'financial'),
      DecimalUtils.add(
        DecimalUtils.add(session.cash_refunds, session.cash_out, 'financial'),
        session.cash_drops,
        'financial'
      ),
      'financial'
    ),
    'financial'
  );

  return expected;
}

// Cálculo:
// Esperado = 5000 + (18500 + 0) - (500 + 200 + 10000)
// Esperado = 5000 + 18500 - 10700
// Esperado = $12,800.00
```

### Paso 2: Cajero Cuenta Efectivo (Cierre Ciego)

**IMPORTANTE**: El sistema NO le muestra al cajero cuánto debería haber. Esto evita manipulación.

```typescript
// src/modules/cash/components/CloseCashSessionModal.tsx
function CloseCashSessionModal({ session }) {
  const [actualCash, setActualCash] = useState('');

  return (
    <Dialog>
      <Dialog.Header>Cierre de Caja</Dialog.Header>
      <Dialog.Body>
        <Alert status="info">
          Por favor, cuente el efectivo en la caja y registre el monto total.
          NO se le mostrará el monto esperado hasta después de registrar.
        </Alert>

        <Field label="Efectivo Contado (ARS)" required>
          <InputField
            type="number"
            value={actualCash}
            onChange={(e) => setActualCash(e.target.value)}
            placeholder="Ej: 12785.50"
            autoFocus
          />
        </Field>
      </Dialog.Body>
      <Dialog.Footer>
        <Button onClick={() => handleClose(actualCash)}>
          Cerrar Caja
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}
```

### Paso 3: Sistema Calcula Diferencia

```typescript
async function closeCashSession(sessionId, actualCash) {
  const session = await getSession(sessionId);
  const expected = calculateExpectedCash(session);
  const variance = DecimalUtils.subtract(actualCash, expected, 'financial');

  // Actualizar sesión
  await supabase.from('cash_sessions').update({
    expected_cash: DecimalUtils.toNumber(expected),
    actual_cash: actualCash,
    variance: DecimalUtils.toNumber(variance),
    status: DecimalUtils.abs(variance).toNumber() > 50 ? 'DISCREPANCY' : 'CLOSED',
    closed_at: new Date()
  }).eq('id', sessionId);

  // Si hay diferencia, crear ajuste contable
  if (!DecimalUtils.isZero(variance)) {
    await createVarianceAdjustment(session, variance);
  }

  return { expected, actual: actualCash, variance };
}
```

### Paso 4: Resultado del Arqueo

**Escenario A: Sin Diferencia**
```
Esperado: $12,800.00
Contado:  $12,800.00
Diferencia: $0.00 ✅

Status: CLOSED
```

**Escenario B: Con Faltante**
```
Esperado: $12,800.00
Contado:  $12,785.00
Diferencia: -$15.00 ⚠️

Status: DISCREPANCY
```

### Paso 5: Journal Entry por Diferencia

```typescript
// Si hay faltante (-$15)
await createJournalEntry({
  entryType: 'ADJUSTMENT',
  referenceId: sessionId,
  referenceType: 'CASH_SESSION',
  description: 'Ajuste por diferencia en arqueo',
  lines: [
    {
      // Débito: Diferencias de Caja (gasto)
      accountCode: '5.9', // Cash Variance
      amount: '+15.00' // Positivo porque es gasto
    },
    {
      // Crédito: Caja se ajusta al real
      accountCode: '1.1.01.001',
      moneyLocationId: 'drawer-001',
      amount: '-15.00' // Negativo porque es crédito
    }
  ]
});

// Si hay sobrante (+$15), invertir los signos
```

### Resultado Final

| Cuenta | Antes | Ajuste | Después |
|--------|-------|--------|---------|
| Cash Drawer | $12,800.00 | -$15.00 | $12,785.00 |
| Cash Variance (Gasto) | $0.00 | +$15.00 | $15.00 |

---

## 🔄 FLUJO 7: TRANSFERENCIA ENTRE CUENTAS

### Escenario
Se necesita mover **$5,000** del Banco a la Caja Fuerte para hacer pagos en efectivo.

### Journal Entry

```typescript
await createJournalEntry({
  entryType: 'TRANSFER',
  description: 'Retiro de efectivo para pagos',
  lines: [
    {
      // Débito: Caja Fuerte aumenta
      accountCode: '1.1.01.002',
      moneyLocationId: 'safe-001',
      amount: '-5000.00'
    },
    {
      // Crédito: Banco disminuye
      accountCode: '1.1.01.003',
      moneyLocationId: 'bank-001',
      amount: '+5000.00'
    }
  ]
});
```

### Resultado

| Cuenta | Antes | Movimiento | Después |
|--------|-------|------------|---------|
| Safe | $10,000.00 | +$5,000.00 | $15,000.00 |
| Banco Galicia | -$144,000.00 | -$5,000.00 | -$149,000.00 |

---

## 📊 RESUMEN DE MOVIMIENTOS

### Saldos Finales (Después de Todos los Flujos)

| Cuenta | Código | Tipo | Saldo Final |
|--------|--------|------|-------------|
| **ACTIVOS** | | | |
| Caja Registradora | 1.1.01.001 | Asset | $12,785.00 |
| Caja Fuerte | 1.1.01.002 | Asset | $15,000.00 |
| Banco Galicia | 1.1.01.003 | Asset | -$149,000.00 ⚠️ |
| **PASIVOS** | | | |
| Cuentas por Pagar | 2.1.01 | Liability | $0.00 |
| IVA a Pagar | 2.1.02 | Liability | $173.55 |
| **INGRESOS** | | | |
| Ventas | 4.1 | Income | $826.45 |
| **GASTOS** | | | |
| COGS | 5.1 | Expense | $30,000.00 |
| Sueldos | 5.2 | Expense | $264,000.00 |
| Diferencias de Caja | 5.9 | Expense | $15.00 |

### Balance Check

```
ACTIVOS = PASIVOS + PATRIMONIO + INGRESOS - GASTOS

$12,785 + $15,000 - $149,000 = $173.55 + $826.45 - $294,015

-$121,215 = -$292,989.55 ❌

⚠️ El banco necesita inyección de capital urgente
```

---

## 🎯 VALIDACIONES AUTOMÁTICAS

### Validación 1: Journal Entry Balance

```typescript
// Cada journal entry DEBE balancear a 0
function validateJournalBalance(lines) {
  const sum = lines.reduce((total, line) => {
    return DecimalUtils.add(total, line.amount, 'financial');
  }, DecimalUtils.fromValue(0, 'financial'));

  if (!DecimalUtils.isZero(sum)) {
    throw new Error(`Journal entry does not balance. Sum: ${sum.toString()}`);
  }
}
```

### Validación 2: Cash Session Límites

```typescript
// Alertar si excede límite
function checkCashLimit(session, moneyLocation) {
  const currentCash = calculateCurrentCash(session);

  if (moneyLocation.max_cash_limit &&
      currentCash > moneyLocation.max_cash_limit) {
    await EventBus.emit('cash.balance.exceeded', {
      sessionId: session.id,
      currentCash,
      limit: moneyLocation.max_cash_limit,
      excess: currentCash - moneyLocation.max_cash_limit
    }, 'CashModule');
  }
}
```

### Validación 3: Balance Bajo

```typescript
// Alertar si saldo bajo
function checkLowBalance(moneyLocation) {
  const balance = await getAccountBalance(moneyLocation.account_id);

  if (balance < 1000) {
    await EventBus.emit('cash.balance.low', {
      moneyLocationId: moneyLocation.id,
      currentBalance: balance,
      threshold: 1000
    }, 'CashModule');
  }
}
```

---

## 📚 GLOSARIO DE CONCEPTOS

| Término | Definición |
|---------|------------|
| **Débito** | Aumenta Activos y Gastos. En journal_lines: amount negativo |
| **Crédito** | Aumenta Pasivos, Patrimonio e Ingresos. En journal_lines: amount positivo |
| **Cash Drop** | Retiro parcial de efectivo de caja a caja fuerte |
| **Arqueo** | Conteo físico del efectivo al cerrar caja |
| **Cierre Ciego** | Arqueo sin mostrar el monto esperado al cajero |
| **Varianza** | Diferencia entre efectivo esperado y contado |
| **Journal Entry** | Transacción contable con múltiples líneas |
| **Money Location** | Contenedor físico/virtual de dinero |
| **Chart of Accounts** | Catálogo jerárquico de cuentas contables |

---

**Última actualización**: 2025-01-24
**Próximo**: [05-MODULE-INTEGRATION.md](./05-MODULE-INTEGRATION.md)
