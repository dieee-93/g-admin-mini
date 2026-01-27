# 💎 CASH SYSTEM DEEP DIVE: Precisión, Impuestos, Analytics & Economía Informal

**Date**: 2025-12-09
**Focus**: Investigación profunda en 4 áreas críticas + Argentina's informal economy

---

## 🎯 CONCEPTOS SIMPLES EXPLICADOS

### ¿Qué es Event Sourcing?

**Analogía simple**: Es como un libro de contabilidad antiguo donde **nunca se borran los registros**.

**Tradicional (Base de datos normal)**:
```
Cuenta Bancaria: $1,000
```
Si depositas $100:
```
Cuenta Bancaria: $1,100  ← Sobrescribió el valor anterior
```
❌ **Problema**: No sabes cómo llegaste a $1,100. Si alguien hackea y cambia el valor, no hay prueba.

**Event Sourcing**:
```
Evento 1: Cuenta creada - $1,000
Evento 2: Depósito - +$100
Evento 3: Retiro - -$50
Evento 4: Depósito - +$200
```
Balance actual = suma de todos los eventos = $1,250

✅ **Ventajas**:
- **Audit trail perfecto**: Ves cada cambio que pasó
- **Time travel**: Puedes ver el balance en cualquier fecha del pasado
- **Inmutable**: Nadie puede cambiar eventos pasados sin que se note
- **Debugging**: Si algo falla, puedes reproducir paso a paso

**¿Por qué es crítico para finanzas?**
> "For financial systems, event sourcing is transformative, providing complete history, perfect audit trail, and time travel debugging" - [RisingWave](https://risingwave.com/blog/mastering-cqrs-and-event-sourcing-for-modern-database-architecture/)

---

### ¿Qué es Idempotency?

**Analogía simple**: Es como presionar el botón de "Enviar" 100 veces pero que solo se procese 1 vez.

**Problema sin idempotency**:
```
Usuario: "Comprar pizza $10" [CLIC]
Red falla, usuario no ve confirmación
Usuario: "Comprar pizza $10" [CLIC de nuevo]
Red falla otra vez
Usuario: "Comprar pizza $10" [CLIC 3 veces más]

Resultado: 5 pizzas compradas, $50 cobrados ❌
```

**Con idempotency**:
```
Usuario genera ID único: "abc-123-def"
Request 1: "Comprar pizza $10" [ID: abc-123-def] → Procesado ✅
Request 2: "Comprar pizza $10" [ID: abc-123-def] → Ya existe, ignora
Request 3: "Comprar pizza $10" [ID: abc-123-def] → Ya existe, ignora

Resultado: 1 pizza comprada, $10 cobrados ✅
```

**¿Por qué es crítico?**
> "State machines enforce the sequence of steps a payment can take, so that a payment cannot be processed twice" - [Modern Treasury](https://www.moderntreasury.com/journal/why-idempotency-matters-in-payments)

**En tu sistema**: Sin esto, si la red falla y el cajero intenta cerrar la caja de nuevo, podrías registrar 2 cierres, 2 journal entries, duplicar todo.

---

### ¿Qué es Three-Way Reconciliation?

**Analogía simple**: Es como cotejar 3 cuadernos diferentes para asegurarte que todos digan lo mismo.

**Los 3 "cuadernos"**:
1. **Tu POS (G-Admin)**: Dice "Vendí $1,000 hoy"
2. **Payment Gateway (MercadoPago/Stripe)**: Dice "Recibí $950 (desconté $50 de comisión)"
3. **Banco**: Dice "Te depositaron $950"

**Proceso de reconciliación**:
```
✅ G-Admin: $1,000 (venta bruta)
✅ Gateway: $950 (neto después de fees)
✅ Banco: $950 (depositado)

Match perfecto ✅
```

**Problema sin reconciliación**:
```
❌ G-Admin: $1,000
❌ Gateway: $900 (¿dónde están $50?)
❌ Banco: $850 (¿y otros $50?)

¿Dónde se perdieron $150? Sin sistema, investigar manualmente lleva HORAS.
```

**¿Por qué es crítico?**
> "7-Eleven automated a three-way reconciliation for all 3,400+ store locations. The bank reconciliation process took days and is now completed in minutes" - [SolveXia](https://www.solvexia.com/blog/what-is-payment-reconciliation)

---

### ¿Qué es Bank Reconciliation?

**Analogía simple**: Es como revisar el extracto bancario vs. tu propio registro de gastos.

**Tu registro (G-Admin)**:
```
Lunes: Vendí $500 con tarjeta
Martes: Vendí $300 con tarjeta
Miércoles: Vendí $200 con tarjeta
Total esperado: $1,000
```

**Extracto bancario**:
```
Miércoles: +$500 (settlement de lunes)
Jueves: +$300 (settlement de martes)
Viernes: +$200 (settlement de miércoles)
Total recibido: $1,000 ✅
```

**¿Por qué las fechas no coinciden?**: Los bancos demoran 1-3 días en depositar (settlement delay).

**Sin reconciliación automática**: Tienes que hacer este match MANUALMENTE cada mes.

**Con reconciliación automática**: El sistema lo hace en segundos y te alerta si algo no cuadra.

---

## 💰 1. PRECISIÓN FINANCIERA

### El Problema Mortal: Floating Point

**Error Real de un Banco**:
> "A German retail bank's mortgage calculation system used standard floating point arithmetic for compound interest. Over 5 years, the accumulated errors meant some customers overpaid by hundreds of euros, while others underpaid. The bank faced a **€12 million** correction and regulatory fines" - [Medium](https://medium.com/@sohail_saifii/the-floating-point-standard-thats-silently-breaking-financial-software-7f7e93430dbb)

### ¿Por Qué Pasa Esto?

```javascript
// En computadoras, esto pasa:
0.1 + 0.2 === 0.3  // FALSE ❌
0.1 + 0.2 === 0.30000000000000004  // TRUE ✅

// Ejemplo real:
let price = 1.40;
let quantity = 165;
let total = price * quantity;
console.log(total);  // 230.99999999999997 ❌ (debería ser 231)
```

**¿Por qué?**
> "Floating-point numbers in computers are binary (base 2), which means there are some base-10 numbers that can't be represented exactly when converting between the two. 0.1, 0.2 and 0.3 cannot be precisely represented in base 2 floating-point" - [Evan Jones](https://www.evanjones.ca/floating-point-money.html)

### Soluciones de la Industria

#### ✅ Opción 1: Decimal Types

```typescript
import Decimal from 'decimal.js';

// ❌ MALO (Floating Point)
const subtotal = 10.50;
const tax = 0.21;
const total = subtotal * (1 + tax);  // 12.704999999999998 ❌

// ✅ BUENO (Decimal)
const subtotal = new Decimal(10.50);
const tax = new Decimal(0.21);
const total = subtotal.times(tax.plus(1));  // 12.71 ✅
```

**Tu código actual YA USA Decimal.js** en varios lugares:
- `src/modules/cash/services/cashSessionService.ts`
- `src/pages/admin/finance-billing/services/index.ts`

✅ **Conclusión**: Estás bien en esto, solo asegúrate de usarlo en TODAS las operaciones financieras.

#### ✅ Opción 2: Integer Storage (Stripe/Square/PayPal)

> "Financial systems store all currency in the units of the fractional currency (meaning they store all US Dollars and Euros in cents). For example, $12.34 will be stored as the integer 1234" - [Modern Treasury](https://www.moderntreasury.com/journal/floats-dont-work-for-storing-cents)

```typescript
// Almacenar en centavos
const amountInCents = 1234;  // Representa $12.34

// Para mostrar:
const displayAmount = amountInCents / 100;  // $12.34

// Para calcular tax:
const taxInCents = Math.round(amountInCents * 0.21);  // 259 centavos = $2.59
const totalInCents = amountInCents + taxInCents;  // 1493 centavos = $14.93
```

**Ventaja**: Todos los cálculos son integers (enteros), **cero riesgo de floating point errors**.

**Desventaja**: Más verboso, tienes que convertir siempre.

### Recomendación para G-Admin

**Opción híbrida**:
1. **Storage**: Integers en base de datos (centavos)
2. **Business Logic**: Decimal.js para cálculos
3. **Display**: Formateo con `.toFixed(2)`

```typescript
// Service layer
export function calculateSaleTotal(items: SaleItem[]): number {
  let totalCents = 0;

  items.forEach(item => {
    const priceCents = Math.round(item.price * 100);
    const quantityCents = item.quantity;
    totalCents += priceCents * quantityCents;
  });

  return totalCents;  // Return in cents
}

// UI layer
const totalDollars = totalCents / 100;
const formatted = `$${totalDollars.toFixed(2)}`;
```

### Testing de Precisión

```typescript
// Test suite
describe('Financial Precision', () => {
  it('should handle decimal calculations correctly', () => {
    const subtotal = new Decimal('10.50');
    const tax = new Decimal('0.21');
    const result = subtotal.times(tax.plus(1));

    expect(result.toFixed(2)).toBe('12.71');
  });

  it('should not accumulate rounding errors over 1000 transactions', () => {
    let total = new Decimal(0);

    for (let i = 0; i < 1000; i++) {
      total = total.plus(new Decimal('0.01'));
    }

    expect(total.toFixed(2)).toBe('10.00');  // Not 9.99 or 10.01
  });
});
```

---

## 📊 2. ANALYTICS & REPORTING

### Tendencias 2025

> "AI-Powered Predictions, Unified Commerce Views, and Employee-Facing Analytics via mobile are reshaping retail industry metrics tracking" - [Dotnet Report](https://dotnetreport.com/blogs/retail-kpi-dashboards/)

> "Cloud-based POS systems are now the foundation of data flow, with **63% of restaurants** currently using these systems to get real-time insights" - [Delaget](https://www.delaget.com/restaurant-management-software/kpi-dashboard/)

### KPIs Críticos para G-Admin

#### Restaurant/Retail KPIs

**Sales & Revenue**:
```typescript
interface SalesKPIs {
  // Daily
  grossSales: number;              // Total sales before discounts/refunds
  netSales: number;                // After discounts/refunds
  averageCheckSize: number;        // Total sales / # transactions
  salesPerHour: number;            // Peak hour analysis

  // Growth
  salesGrowth: number;             // % vs. previous period
  compStoreGrowth: number;         // Same-store sales growth

  // Mix
  salesByCategory: Record<string, number>;
  salesByPaymentMethod: Record<string, number>;
}
```

**Labor & Costs**:
```typescript
interface LaborKPIs {
  laborCostPercentage: number;     // Labor cost / sales (target: 25-35%)
  salesPerLaborHour: number;       // Sales / total labor hours
  overtimePercentage: number;      // Overtime hours / total hours

  // Staffing
  staffTurnoverRate: number;       // Resignations / avg employees
  averageHourlyWage: number;
  scheduleAdherence: number;       // Actual vs. scheduled hours
}
```

**Inventory & COGS**:
```typescript
interface InventoryKPIs {
  cogsPercentage: number;          // COGS / sales (target: 28-35% restaurant)
  inventoryTurnover: number;       // COGS / avg inventory
  foodWaste: number;               // $ wasted per period
  variancePercentage: number;      // (Actual - theoretical) / theoretical

  // Stock
  stockoutRate: number;            // % of time out of stock
  overstock: number;               // $ in excess inventory
}
```

**Cash & Finance**:
```typescript
interface FinanceKPIs {
  cashVariance: number;            // Expected vs. actual cash
  cashDropFrequency: number;       // # drops per day
  bankDepositTiming: number;       // Hours from close to deposit

  // Reconciliation
  reconciliationTime: number;      // Minutes to reconcile
  unmatchedTransactions: number;   // Count of unmatched
  varianceToleranceRate: number;   // % within tolerance

  // Profitability
  grossProfitMargin: number;       // (Sales - COGS) / Sales
  netProfitMargin: number;         // Net profit / Sales
  ebitda: number;                  // Earnings before interest, tax, depreciation
}
```

**Customer Experience**:
```typescript
interface CustomerKPIs {
  customerCount: number;           // Daily foot traffic
  repeatCustomerRate: number;      // % returning customers
  averageWaitTime: number;         // Minutes (restaurant)
  orderAccuracy: number;           // % orders correct

  // Loyalty
  loyaltyMemberCount: number;
  loyaltyRedemptionRate: number;
  nps: number;                     // Net Promoter Score
}
```

### Real-Time Dashboard Architecture

```typescript
/**
 * Real-Time Analytics Engine
 * Inspired by Restaurant365, Toast POS, Square
 */

interface DashboardConfig {
  refreshInterval: number;         // Seconds (30-60 for real-time)
  dataSources: DataSource[];       // POS, inventory, labor, etc.
  kpis: KPIDefinition[];
  alerts: AlertRule[];
}

interface DataSource {
  id: string;
  type: 'POS' | 'INVENTORY' | 'LABOR' | 'CASH' | 'EXTERNAL';
  connectionString?: string;
  refreshRate: number;             // How often to poll
  transformPipeline?: Transform[];
}

interface KPIDefinition {
  id: string;
  name: string;
  category: 'SALES' | 'LABOR' | 'INVENTORY' | 'CASH' | 'CUSTOMER';

  // Calculation
  formula: string;                 // e.g., "SUM(sales) / COUNT(transactions)"
  dataSources: string[];           // Which sources to use
  granularity: 'REALTIME' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

  // Display
  format: 'CURRENCY' | 'PERCENTAGE' | 'NUMBER' | 'TIME';
  visualization: 'LINE' | 'BAR' | 'PIE' | 'GAUGE' | 'TABLE';

  // Benchmarks
  target?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
}

interface AlertRule {
  kpiId: string;
  condition: 'ABOVE' | 'BELOW' | 'EQUAL' | 'CHANGE_PCT';
  threshold: number;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  notifyChannels: ('EMAIL' | 'SMS' | 'PUSH' | 'DASHBOARD')[];
}

// Example: Real-time sales monitor
const salesMonitor: KPIDefinition = {
  id: 'real_time_sales',
  name: 'Hourly Sales',
  category: 'SALES',
  formula: 'SUM(amount) WHERE created_at >= NOW() - INTERVAL 1 HOUR',
  dataSources: ['pos'],
  granularity: 'REALTIME',
  format: 'CURRENCY',
  visualization: 'GAUGE',
  target: 500,  // $500/hour target
  warningThreshold: 300,  // Warn if < $300/hour
  criticalThreshold: 150  // Alert if < $150/hour
};

// Real-time calculation engine
export class AnalyticsEngine {
  private cache: Map<string, any> = new Map();
  private subscriptions: Map<string, Set<(value: any) => void>> = new Map();

  async calculateKPI(kpi: KPIDefinition): Promise<number> {
    // Check cache first
    const cached = this.getCachedValue(kpi.id);
    if (cached && !this.isStale(cached, kpi.granularity)) {
      return cached.value;
    }

    // Fetch fresh data
    const dataSets = await this.fetchDataSources(kpi.dataSources);

    // Apply formula (simplified - in reality use a proper expression engine)
    const value = this.evaluateFormula(kpi.formula, dataSets);

    // Cache result
    this.cacheValue(kpi.id, value, kpi.granularity);

    // Notify subscribers (real-time updates)
    this.notifySubscribers(kpi.id, value);

    // Check alerts
    await this.checkAlerts(kpi, value);

    return value;
  }

  // WebSocket support for real-time updates
  subscribe(kpiId: string, callback: (value: any) => void) {
    if (!this.subscriptions.has(kpiId)) {
      this.subscriptions.set(kpiId, new Set());
    }
    this.subscriptions.get(kpiId)!.add(callback);
  }

  private notifySubscribers(kpiId: string, value: any) {
    const subscribers = this.subscriptions.get(kpiId);
    if (subscribers) {
      subscribers.forEach(callback => callback(value));
    }
  }
}
```

### Propuesta: Analytics Module para G-Admin

```typescript
/**
 * G-Admin Analytics Module
 *
 * Provides real-time KPI tracking, dashboards, and alerts
 */

// File: src/modules/analytics/manifest.tsx
export const analyticsManifest: ModuleManifest = {
  id: 'analytics',
  name: 'Analytics & Reporting',
  version: '1.0.0',

  requiredFeatures: [],
  optionalFeatures: [
    'analytics_realtime_dashboard',
    'analytics_advanced_reporting',
    'analytics_predictive_ai'
  ],

  hooks: {
    provide: [
      'dashboard.widgets',      // KPI widgets
      'reports.generators',     // Custom reports
      'analytics.alerts'        // Alert system
    ],
    consume: [
      'sales.transaction_completed',
      'cash.session_closed',
      'inventory.stock_updated',
      'staff.clock_in_out'
    ]
  },

  setup: async (registry) => {
    // Subscribe to all business events
    const { eventBus } = await import('@/lib/events');
    const { updateKPIs } = await import('./services/analyticsService');

    // Real-time KPI updates
    eventBus.subscribe('sales.transaction_completed', async (event) => {
      await updateKPIs({
        type: 'SALES',
        timestamp: new Date(),
        value: event.payload.amount
      });
    });

    // Register dashboard widgets
    const { SalesKPIWidget } = await import('./components/SalesKPIWidget');
    const { CashFlowWidget } = await import('./components/CashFlowWidget');

    registry.addAction('dashboard.widgets', () => <SalesKPIWidget />, 'analytics', 10);
    registry.addAction('dashboard.widgets', () => <CashFlowWidget />, 'analytics', 20);
  }
};
```

---

## 💸 3. IMPUESTOS & TAX AUTOMATION

### Tax Engines de la Industria

**Líderes del mercado**:
1. **Stripe Tax**: 100+ países, 99.999% uptime, real-time calculation
2. **Vertex**: VAT/GST automation, 600+ product types
3. **Avalara/Sphere**: AI-native, 12,000+ jurisdictions
4. **NetSuite SuiteTax**: 110 países, monthly updates

> "Tax engines work to support accounting, ERP, e-commerce, invoicing and point-of-sale systems to ensure complex indirect tax calculations involving several pieces of information are done properly and efficiently" - [VATCalc](https://www.vatcalc.com/global/what-is-a-tax-engine-for-vat-gst-determination-why-vat-calculator-is-the-best-in-the-market/)

### Argentina: Dos Regímenes Fiscales

#### Monotributo (Simplified)

**Quién**:
> "Monotributo is suitable for independent consultants with smaller-scale operations or those looking for a simple tax system" - [Deel](https://www.deel.com/blog/sole-proprietorship-argentina/)

**Características**:
- Income limit: ~$13,400 USD/year (services) o ~$19,000 (goods)
- Pago único mensual que incluye:
  - Income tax
  - VAT
  - Pension
  - Health insurance
- Categorías A-K según facturación
- Registro en 15 minutos online

**Ventajas**:
- ✅ Simple: Un solo pago
- ✅ Rápido: Setup instantáneo
- ✅ Barato: Cuota fija mensual

**Desventajas**:
- ❌ Límite de ingresos
- ❌ No puedes deducir gastos
- ❌ No emites factura completa (solo ticket)

#### Responsable Inscripto (General Regime)

**Quién**:
> "If choosing régimen general (Autónomo), you must register as 'responsable inscripto' in AFIP" - [Remote](https://remote.com/blog/contractor-management/set-up-as-independent-contractor-argentina)

**Características**:
- Sin límite de facturación
- Debes emitir Factura A/B/C con CAE
- Obligaciones:
  - Income tax sobre ganancias netas
  - IVA 21% (o 10.5%/27% especiales)
  - Aportes jubilatorios
  - Obra social

**Ventajas**:
- ✅ Sin límite de ingresos
- ✅ Deduces gastos
- ✅ Factura completa (mejor imagen)

**Desventajas**:
- ❌ Más complejo
- ❌ Más impuestos si ganas bien
- ❌ Declaraciones mensuales

### Tax Calculation Engine para G-Admin

```typescript
/**
 * Argentina Tax Engine
 * Handles Monotributo and Responsable Inscripto regimes
 */

interface TaxProfile {
  businessId: string;
  regime: 'MONOTRIBUTO' | 'RESPONSABLE_INSCRIPTO' | 'EXENTO';

  // Monotributo specific
  category?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K';
  annualRevenueLimit?: number;

  // Responsable Inscripto specific
  defaultTaxRate?: number;  // 0.21 for standard VAT
  taxExemptions?: string[];

  // Common
  cuit: string;
  fiscalYear: string;
}

interface TaxCalculation {
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  total: number;
  taxBreakdown: TaxBreakdownItem[];
}

interface TaxBreakdownItem {
  taxType: 'IVA' | 'IIBB' | 'MUNICIPAL' | 'OTHER';
  rate: number;
  base: number;
  amount: number;
}

export class ArgentinaTaxEngine {
  private profile: TaxProfile;

  constructor(profile: TaxProfile) {
    this.profile = profile;
  }

  /**
   * Calculate tax for a sale
   */
  calculateSaleTax(params: {
    subtotal: number;
    items: Array<{
      category: string;
      amount: number;
    }>;
    customerType: 'FINAL_CONSUMER' | 'MONOTRIBUTISTA' | 'RESPONSABLE_INSCRIPTO';
  }): TaxCalculation {
    if (this.profile.regime === 'MONOTRIBUTO') {
      // Monotributo: No separas el IVA en la factura
      return {
        subtotal: params.subtotal,
        taxAmount: 0,  // IVA ya incluido en el precio
        taxRate: 0,
        total: params.subtotal,
        taxBreakdown: []
      };
    }

    // Responsable Inscripto: Calcular IVA
    const taxRate = this.getTaxRate(params.items, params.customerType);
    const taxAmount = params.subtotal * taxRate;
    const total = params.subtotal + taxAmount;

    return {
      subtotal: params.subtotal,
      taxAmount: taxAmount,
      taxRate: taxRate,
      total: total,
      taxBreakdown: [{
        taxType: 'IVA',
        rate: taxRate,
        base: params.subtotal,
        amount: taxAmount
      }]
    };
  }

  private getTaxRate(items: Array<{ category: string; amount: number }>, customerType: string): number {
    // Standard rate
    const STANDARD_IVA = 0.21;
    const REDUCED_IVA = 0.105;    // Foods, medicines
    const INCREASED_IVA = 0.27;   // Certain services

    // Simplified: Check if all items are same category
    // In production, calculate weighted average
    const categories = new Set(items.map(i => i.category));

    if (categories.has('FOOD')) {
      return REDUCED_IVA;
    }

    if (categories.has('LUXURY_SERVICE')) {
      return INCREASED_IVA;
    }

    return STANDARD_IVA;
  }

  /**
   * Check if business is still eligible for Monotributo
   */
  async checkMonotributoEligibility(): Promise<{
    eligible: boolean;
    currentRevenue: number;
    limit: number;
    recommendation?: string;
  }> {
    if (this.profile.regime !== 'MONOTRIBUTO') {
      return { eligible: false, currentRevenue: 0, limit: 0 };
    }

    // Fetch revenue from last 12 months
    const revenue = await this.getAnnualRevenue();
    const limit = this.profile.annualRevenueLimit || 0;

    if (revenue > limit) {
      return {
        eligible: false,
        currentRevenue: revenue,
        limit: limit,
        recommendation: `Excediste el límite de Monotributo. Debes pasarte a Responsable Inscripto antes del ${this.getNextSemesterDate()}`
      };
    }

    if (revenue > limit * 0.8) {
      return {
        eligible: true,
        currentRevenue: revenue,
        limit: limit,
        recommendation: `Estás cerca del límite (${((revenue/limit)*100).toFixed(0)}%). Considera pasarte a Responsable Inscripto pronto.`
      };
    }

    return {
      eligible: true,
      currentRevenue: revenue,
      limit: limit
    };
  }

  private getNextSemesterDate(): string {
    const now = new Date();
    const month = now.getMonth();

    // Monotributo review: Feb 5 and Aug 5
    if (month < 1) return 'Feb 5';
    if (month < 7) return 'Aug 5';
    return 'Feb 5 (next year)';
  }

  private async getAnnualRevenue(): Promise<number> {
    // Query sales from last 12 months
    // Implementation depends on your database structure
    return 0;  // Placeholder
  }
}

// Usage
const taxEngine = new ArgentinaTaxEngine({
  businessId: 'business-123',
  regime: 'RESPONSABLE_INSCRIPTO',
  cuit: '20-12345678-9',
  defaultTaxRate: 0.21,
  fiscalYear: '2025'
});

const taxCalc = taxEngine.calculateSaleTax({
  subtotal: 1000,
  items: [{ category: 'FOOD', amount: 1000 }],
  customerType: 'FINAL_CONSUMER'
});

console.log(taxCalc);
// { subtotal: 1000, taxAmount: 105, taxRate: 0.105, total: 1105, ... }
```

---

## 🌑 4. ECONOMÍA INFORMAL EN ARGENTINA (El Tema Crítico)

### La Realidad

> "Based on the International Labour Organisation (ILO) definition, in 2023, **50% of employment in Argentina was in the informal sector**" - [European Parliament](https://www.europarl.europa.eu/thinktank/en/document/EPRS_BRI(2016)589783)

> "National data sources suggest that at the end of 2024, informal employment concerned about **42% of total workers**. Additionally, **informal workers earn on average 60% less than formal workers**" - [OECD](https://www.oecd.org/en/publications/2025/10/expanding-social-protection-and-addressing-informality-in-latin-america_9a502cb3/full-report/strengthening-incentives-for-formalisation-in-argentina_ad162bdd.html)

### Por Qué Trabajan en Negro

**Costos de formalización**:
- Impuestos: 21% IVA + income tax + aportes (30-40% total)
- Burocracia: Trámites, contadores, tiempo
- Rigidez laboral: Difícil despedir, altas indemnizaciones
- Inflación: Devaluación constante, incertidumbre

**Incentivos informales**:
- Cash = no trazable
- Precios más competitivos
- Flexibilidad operativa
- Supervivencia en crisis

### Digitalization & Enforcement

> "Argentina has undergone significant digital transformation. Every invoice must be issued through AFIP/ARCA systems, each with a unique tracking code, and the tax authority now sees transactions in real time. **VAT evasion dropped to 42% in 2023, the lowest level in more than twenty years**" - [VATCalc](https://www.vatcalc.com/argentina/argentina-tackles-vat-gap-through-digitalisation/)

**Herramientas de AFIP/ARCA**:
- Factura Electrónica obligatoria
- Controlador Fiscal
- QR codes en facturas (validación ciudadana)
- Cruces de datos en tiempo real

### El Dilema del Desarrollador de Software

**Realidad del mercado argentino**:
1. Muchos negocios operan 100% en negro (sin facturar nada)
2. Otros son mixtos: facturan solo parte (ej: 30% blanco, 70% negro)
3. Pocos son 100% formales

**Tu pregunta implícita**: *¿G-Admin debe facilitar operaciones informales?*

### ⚖️ Consideraciones Legales y Éticas

**Riesgo Legal**:
> "The Federal Tax Authority (AFIP) issues CUIT numbers, audits electronic invoices and applies VAT or Gross Turnover withholding when funds clear" - [GetOnTop](https://www.getontop.com/blog/how-to-account-and-pay-in-argentina)

Si tu software **facilita activamente** evasión fiscal, podrías tener:
- Responsabilidad legal (cómplice de evasión)
- Multas a la empresa
- Cierre del negocio
- Problemas personales

**Riesgo de Reputación**:
- Bancos/investors no querrán asociarse
- Imposible levantar funding serio
- Problemas al crecer internacionalmente

### 🎯 Solución Propuesta: "Gray Area Support"

**Estrategia**: No facilites evasión, pero sé realista con la informalidad.

#### Opción 1: Dual Recording (Separado)

```typescript
/**
 * Dual Economy Tracking (Argentina Reality)
 *
 * Tracks formal (white) and informal (gray) separately
 * WITHOUT mixing them or facilitating evasion
 */

interface SaleRecord {
  id: string;
  amount: number;

  // Formal tracking
  fiscal_status: 'FORMAL' | 'INFORMAL';

  // If FORMAL
  fiscal_document_type?: 'FACTURA_A' | 'FACTURA_B' | 'TICKET';
  fiscal_document_number?: string;
  cae?: string;  // AFIP authorization

  // If INFORMAL
  internal_note?: string;  // "No se solicitó factura"

  // Both
  payment_method: 'CASH' | 'CARD' | 'TRANSFER';
  created_at: Date;
}

// Cash session también dual
interface CashSession {
  id: string;

  // Formal cash (con factura)
  formal_cash_sales: number;
  formal_cash_refunds: number;

  // Informal cash (sin factura)
  informal_cash_sales: number;
  informal_cash_refunds: number;

  // Total cash (para cuadrar caja física)
  total_cash: number;  // = formal + informal

  status: 'OPEN' | 'CLOSED';
}

// Reports separados
export async function getFormalSalesReport(period: DateRange) {
  // Solo ventas con factura
  const sales = await supabase
    .from('sales')
    .select('*')
    .eq('fiscal_status', 'FORMAL')
    .gte('created_at', period.start)
    .lte('created_at', period.end);

  return {
    total: sales.data.reduce((sum, s) => sum + s.amount, 0),
    count: sales.data.length,
    avgTicket: sales.data.reduce((sum, s) => sum + s.amount, 0) / sales.data.length
  };
}

export async function getInformalSalesReport(period: DateRange) {
  // Solo ventas sin factura (para análisis interno)
  const sales = await supabase
    .from('sales')
    .select('*')
    .eq('fiscal_status', 'INFORMAL')
    .gte('created_at', period.start)
    .lte('created_at', period.end);

  return {
    total: sales.data.reduce((sum, s) => sum + s.amount, 0),
    count: sales.data.length,
    avgTicket: sales.data.reduce((sum, s) => sum + s.amount, 0) / sales.data.length,
    warning: 'Estas ventas NO están declaradas ante AFIP. Solo para uso interno.'
  };
}
```

**Ventajas**:
- ✅ Transparencia: El dueño ve ambos números
- ✅ Legal: No mezclas formal con informal
- ✅ Auditable: Si AFIP inspecciona, muestras solo formal
- ✅ Realista: Aceptas que existe informalidad

**Desventajas**:
- ⚠️ Podría considerarse facilitación (zona gris)
- ⚠️ Requiere discipline del usuario

#### Opción 2: "No Ask, No Tell"

```typescript
/**
 * Standard POS - No distingue formal/informal
 *
 * El sistema simplemente registra ventas.
 * Es responsabilidad del dueño decidir qué facturar.
 */

interface Sale {
  id: string;
  amount: number;
  payment_method: string;

  // Usuario decide después si facturar o no
  fiscal_document_number?: string;  // null = no facturó
}

// El sistema NO pregunta "¿es formal o informal?"
// Solo registra la venta
```

**Ventajas**:
- ✅ Legalmente más seguro para ti
- ✅ Usuario tiene flexibilidad total
- ✅ Más simple

**Desventajas**:
- ❌ No ayudas con compliance
- ❌ Usuario podría mezclar todo mal

#### Opción 3: "Formal Only" (Ideal pero Irreal)

```typescript
/**
 * Strict Compliance Mode
 *
 * TODAS las ventas deben tener factura
 */

interface Sale {
  id: string;
  amount: number;
  fiscal_document_number: string;  // REQUIRED
  cae: string;  // REQUIRED from AFIP
}

// No permite vender sin facturar
```

**Ventajas**:
- ✅ Legalmente perfecto
- ✅ Full compliance
- ✅ Apto para inversores/bancos

**Desventajas**:
- ❌ 50% del mercado argentino no lo usará
- ❌ No competitivo vs. otros POS
- ❌ Irrealista para pequeños negocios

### 🎯 Recomendación Final

**Para Argentina**: **Opción 1 (Dual Recording)** con disclaimers legales claros.

**Implementación**:

```typescript
// Feature flag por país
export const COUNTRY_CONFIG = {
  AR: {
    allowInformalTracking: true,  // Argentina reality
    separateFormalInformal: true,
    showComplianceWarnings: true,
    requireFiscalController: true  // Legal requirement
  },
  US: {
    allowInformalTracking: false,  // All sales must be formal
    separateFormalInformal: false,
    showComplianceWarnings: false,
    requireFiscalController: false
  },
  MX: {
    allowInformalTracking: true,  // Similar to Argentina
    separateFormalInformal: true,
    showComplianceWarnings: true,
    requireFiscalController: false  // SAT has different system
  }
};

// Disclaimer en UI
const ComplianceDisclaimer = () => (
  <Alert severity="warning">
    <AlertTitle>Aviso Legal - Cumplimiento Fiscal</AlertTitle>
    <Typography>
      G-Admin permite registrar ventas informales (sin factura) solo para
      <strong> análisis interno y control de caja física</strong>.
      <br/><br/>
      ⚠️ <strong>Es responsabilidad del usuario cumplir con AFIP/ARCA</strong>:
      <ul>
        <li>Emitir factura electrónica por todas las ventas sujetas a IVA</li>
        <li>Mantener Controlador Fiscal habilitado</li>
        <li>Declarar todos los ingresos en formularios fiscales</li>
      </ul>
      G-Admin NO se hace responsable del uso indebido de esta funcionalidad.
    </Typography>
  </Alert>
);
```

### Alternativa: Partnership con AFIP-Compliant Services

En vez de construir todo, integra con:
- **Facturador electrónico certificado** (ej: FacturaYa, TiendaNube Facturacion)
- **Controlador Fiscal as a Service** (cloud-based)
- **Contable.ar o similar** (tax filing automation)

Así tú solo te encargas del POS, ellos del compliance.

---

## 📊 MÉTRICAS DE ÉXITO (Actualizadas)

### Precisión Financiera
- ✅ Zero floating-point errors
- ✅ Rounding errors < $0.01 per 1000 transactions
- ✅ Decimal.js used in 100% of financial calculations

### Tax Compliance (Argentina)
- ✅ 100% of formal sales have CAE from AFIP
- ✅ Weekly reports submitted on time
- ✅ Monotributo eligibility checked every semester
- ⚠️ Informal sales < 30% of total (target: reduce over time)

### Analytics Performance
- ✅ Dashboard load time < 2 seconds
- ✅ Real-time KPIs update < 5 seconds
- ✅ Report generation < 30 seconds
- ✅ 95%+ uptime

### User Adoption (Analytics)
- ✅ 80%+ users check dashboard daily
- ✅ 50%+ users customize KPIs
- ✅ 90%+ find insights actionable

---

## 🚨 RIESGOS Y MITIGACIONES

### Riesgo 1: Facilitación de Evasión Fiscal

**Probabilidad**: Media (si implementas dual tracking)
**Impacto**: Alto (legal, reputacional)

**Mitigación**:
1. ✅ Disclaimers legales claros en UI
2. ✅ Logs de auditoría (quién marcó ventas como informales)
3. ✅ Límite: No más de X% informal (ej: 40%)
4. ✅ Consulta legal con abogado tributario argentino

### Riesgo 2: Precisión Financiera

**Probabilidad**: Baja (si usas Decimal.js)
**Impacto**: Crítico (pérdidas financieras)

**Mitigación**:
1. ✅ Test suite exhaustivo para cálculos
2. ✅ Code review obligatorio en cambios financieros
3. ✅ Monitoring de variances (alertar si > threshold)

### Riesgo 3: Performance de Analytics en Escala

**Probabilidad**: Alta (al crecer)
**Impacto**: Medio (UX degradada)

**Mitigación**:
1. ✅ Pre-agregación de KPIs (cron jobs nocturnos)
2. ✅ Cache con Redis/Memcached
3. ✅ Materialized views en PostgreSQL
4. ✅ Read replicas para analytics

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Precisión
- [ ] Auditar todo el código que hace cálculos financieros
- [ ] Reemplazar `number` con `Decimal` donde sea necesario
- [ ] Crear test suite de precisión (100+ test cases)
- [ ] Documentar: "Never use floating point for money"

### Impuestos (Argentina)
- [ ] Implementar `ArgentinaTaxEngine`
- [ ] Soporte para Monotributo y Responsable Inscripto
- [ ] Checker de elegibilidad semestral
- [ ] Integración con facturador electrónico (opcional)

### Analytics
- [ ] Definir top 20 KPIs para G-Admin
- [ ] Implementar `AnalyticsEngine` con cache
- [ ] Dashboard con widgets configurables
- [ ] Alertas por threshold
- [ ] Export a Excel/PDF

### Economía Informal
- [ ] ⚠️ **Consulta legal**: Habla con abogado tributario
- [ ] Decidir: Opción 1, 2 o 3
- [ ] Si Opción 1: Implementar dual tracking
- [ ] Disclaimers legales en toda la UI
- [ ] Audit logs completos

---

## 📚 FUENTES

### Precisión Financiera
- [Evan Jones: Floating Point for Money](https://www.evanjones.ca/floating-point-money.html)
- [Medium: Floating Point Breaking Financial Software](https://medium.com/@sohail_saifii/the-floating-point-standard-thats-silently-breaking-financial-software-7f7e93430dbb)
- [Modern Treasury: Why Integers](https://www.moderntreasury.com/journal/floats-dont-work-for-storing-cents)

### Analytics & KPIs
- [Dotnet Report: Retail KPI Dashboards](https://dotnetreport.com/blogs/retail-kpi-dashboards/)
- [Delaget: Restaurant KPI Dashboard](https://www.delaget.com/restaurant-management-software/kpi-dashboard/)
- [MarketMan: Restaurant KPIs](https://www.marketman.com/blog/restaurant-kpis-key-metrics-every-franchise-should-measure)

### Tax Automation
- [Stripe Tax](https://stripe.com/tax)
- [VATCalc: What is a Tax Engine](https://www.vatcalc.com/global/what-is-a-tax-engine-for-vat-gst-determination-why-vat-calculator-is-the-best-in-the-market/)
- [NetSuite Tax Management](https://www.netsuite.com/portal/products/erp/financial-management/finance-accounting/tax-management-software.shtml)

### Argentina Tax Regimes
- [Deel: Monotributo Registration](https://www.deel.com/blog/sole-proprietorship-argentina/)
- [Remote: Independent Contractor Argentina](https://remote.com/blog/contractor-management/set-up-as-independent-contractor-argentina)
- [PWC: Argentina Tax Administration](https://taxsummaries.pwc.com/argentina/individual/tax-administration)

### Economía Informal Argentina
- [European Parliament: Latin America's Informal Economy](https://www.europarl.europa.eu/thinktank/en/document/EPRS_BRI(2016)589783)
- [OECD: Argentina Informality](https://www.oecd.org/en/publications/2025/10/expanding-social-protection-and-addressing-informality-in-latin-america_9a502cb3/full-report/strengthening-incentives-for-formalisation-in-argentina_ad162bdd.html)
- [VATCalc: Argentina Tackles VAT Gap](https://www.vatcalc.com/argentina/argentina-tackles-vat-gap-through-digitalisation/)
- [GetOnTop: Accounting in Argentina](https://www.getontop.com/blog/how-to-account-and-pay-in-argentina)

---

**Document Version**: 1.0
**Last Updated**: 2025-12-09
**Next Review**: Después de consulta legal
