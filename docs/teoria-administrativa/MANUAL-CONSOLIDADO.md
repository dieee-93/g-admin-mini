# MANUAL CONSOLIDADO DE TEORÍA ADMINISTRATIVA
## Comprehensive ERP Costing and Pricing Manual

**Versión:** 1.0  
**Última actualización:** 2025-01-06  
**Documento:** 09/09 del Manual de Teoría Administrativa  
**Estado:** ✅ COMPLETADO

---

## 📋 Sobre Este Manual

Este manual consolida **8 documentos de investigación exhaustiva** (13,000+ líneas) sobre teoría administrativa, contabilidad de costos, pricing y gestión para sistemas ERP multi-industria.

### Propósito

Servir como **referencia rápida y guía de implementación** para:
- Desarrolladores de G-Admin Mini ERP
- Gerentes de producto
- Implementadores de sistemas
- Consultores de negocios
- Estudiantes de administración

### Alcance

**Industrias cubiertas:**
- Manufacturing (Manufactura)
- Retail (Comercio minorista)
- Food Service (Gastronomía)
- Professional Services (Servicios profesionales)
- Construction (Construcción)
- Healthcare (Salud)

**Temas cubiertos:**
- Fundamentos de costeo
- Métodos de valuación de inventario
- Sistemas de costeo (Absorption, ABC, Standard, Lean)
- Pricing strategies
- Margin management
- Tax compliance
- Arquitectura de sistemas multi-modelo

---

## 📚 Estructura de la Documentación Completa

| Doc | Título | Líneas | Estado |
|-----|--------|--------|--------|
| 01 | Fundamentos de Costeo | 1,000+ | ✅ |
| 02 | Costeo en Gastronomía | 1,850+ | ✅ |
| 03 | Costeo de Servicios Profesionales | 2,100+ | ✅ |
| 04 | Márgenes y Pricing | 2,400+ | ✅ |
| 05 | Impuestos y Compliance | 2,000+ | ✅ |
| 06 | Sistemas Multi-Modelo | 2,300+ | ✅ |
| 07 | Matriz Conceptos-Industrias | 1,500+ | ✅ |
| 08 | INDEX (Roadmap) | 150+ | ✅ |
| **09** | **MANUAL-CONSOLIDADO** | **1,800+** | **✅** |
| **TOTAL** | | **14,300+** | **100%** |

---

## Tabla de Contenidos del Manual Consolidado

1. [Executive Summary](#1-executive-summary)
2. [Quick Reference: Formulas](#2-quick-reference-formulas)
3. [Key Concepts Index](#3-key-concepts-index)
4. [Industry Quick Guides](#4-industry-quick-guides)
5. [Glossary of Terms](#5-glossary-of-terms)
6. [Bibliography](#6-bibliography)
7. [Implementation Roadmap for G-Admin Mini](#7-implementation-roadmap-for-g-admin-mini)

---

# 1. EXECUTIVE SUMMARY

## 1.1 Documento 01: Fundamentos de Costeo

**Ubicación:** `01-FUNDAMENTOS-COSTEO.md` (1,000+ líneas)

### Resumen

Cubre los principios fundamentales de contabilidad de costos aplicables a todas las industrias. Establece la base teórica necesaria para comprender sistemas de costeo más avanzados.

### Conceptos Clave

**Tipos de Costos:**
- **Fijos:** No varían con volumen (ej: renta, salarios)
- **Variables:** Cambian proporcionalmente con volumen (ej: materiales, comisiones)
- **Directos:** Rastreables a producto específico
- **Indirectos:** No rastreables directamente (overhead)

**Sistemas de Costeo:**
- **Absorption Costing:** Incluye todos los costos (GAAP required)
- **Variable Costing:** Solo costos variables (gestión interna)
- **ABC (Activity-Based):** Asigna overhead por actividades
- **Standard Costing:** Usa costos predeterminados
- **Lean Costing:** Backflushing, no WIP tracking

**Métodos de Valuación de Inventario:**
- **FIFO:** First In, First Out
- **LIFO:** Last In, First Out (US only, IFRS no permite)
- **Weighted Average:** Promedio ponderado
- **Specific Identification:** Identificación específica

### Aplicaciones

Todos los conceptos son aplicables a las 6 industrias estudiadas, con variaciones en énfasis según la naturaleza del negocio.

### Fórmulas Principales

```
Cost of Goods Sold (COGS) = Beginning Inventory + Purchases - Ending Inventory

Total Product Cost = Direct Materials + Direct Labor + Manufacturing Overhead

Prime Cost = Direct Materials + Direct Labor

Conversion Cost = Direct Labor + Manufacturing Overhead
```

---

## 1.2 Documento 02: Costeo en Gastronomía

**Ubicación:** `02-COSTEO-GASTRONOMIA.md` (1,850+ líneas)

### Resumen

Especialización en food service: costeo de recetas, food cost management, menu engineering, beverage cost, prime cost, y gestión de inventario perecedero.

### Conceptos Clave

**Food Cost:**
- **Actual Food Cost:** Inventario inicial + compras - inventario final
- **Theoretical Food Cost:** Suma de recipe costs por unidades vendidas
- **Food Cost Variance:** Diferencia entre actual y theoretical (indica desperdicio, robo, over-portioning)

**Recipe Costing:**
- Precisión de 6 decimales (ya implementado en G-Admin Mini con Decimal.js)
- Costeo por ingrediente (AP cost → EP cost via yield %)
- Actualización automática cuando cambian precios

**Menu Engineering (Método Kasavana & Smith):**

Clasificación en matriz 2x2:
- **Stars:** Alta popularidad + Alto margen → MANTENER
- **Plowhorses:** Alta popularidad + Bajo margen → AUMENTAR PRECIO
- **Puzzles:** Baja popularidad + Alto margen → PROMOCIONAR
- **Dogs:** Baja popularidad + Bajo margen → ELIMINAR

**Prime Cost:**
```
Prime Cost = Food Cost + Beverage Cost + Labor Cost
Target: <60% de ventas (idealmente 55-58%)
```

### Métricas Críticas

| Métrica | Fórmula | Target |
|---------|---------|--------|
| Food Cost % | (Food Cost / Food Sales) × 100 | 28-35% |
| Beverage Cost % | (Bev Cost / Bev Sales) × 100 | 18-24% |
| Labor Cost % | (Labor Cost / Total Sales) × 100 | 25-35% |
| Prime Cost % | ((Food+Bev+Labor) / Sales) × 100 | <60% |
| Contribution Margin | Selling Price - Food Cost | Varía |

### Aplicaciones

Restaurantes, cafeterías, catering, hoteles, cafeterías corporativas, food trucks, central kitchens.

---

## 1.3 Documento 03: Costeo de Servicios Profesionales

**Ubicación:** `03-COSTEO-SERVICIOS.md` (2,100+ líneas)

### Resumen

Servicios profesionales (consultoría, legal, contable, IT, arquitectura): billable hours, utilization rate, overhead allocation, project costing, y pricing strategies.

### Conceptos Clave

**Las 4 I's de los Servicios:**
1. **Intangibility:** No se pueden tocar o almacenar
2. **Inseparability:** Producción y consumo simultáneos
3. **Heterogeneity:** Cada entrega es única
4. **Perishability:** No se puede inventariar

**Billable Hours:**

```
Utilization Rate = (Billable Hours / Total Available Hours) × 100
Target: 70-80% para profesionales

Realization Rate = (Actual Revenue / Potential Revenue) × 100
Target: 90-95%

Effective Rate = Standard Rate × Realization Rate
```

**Hourly Rate Calculation (Cost-Plus):**

```
Total Annual Cost per Employee = Salary + Benefits + Overhead allocation
Available Billable Hours = (Work days - PTO - training) × hours/day
Target Utilization Rate = 75% (typical)

Billable Hours = Available Hours × Utilization Rate

Hourly Cost = Total Annual Cost / Billable Hours
Hourly Rate = Hourly Cost × (1 + Desired Margin %)
```

**Overhead Allocation:**
- **Direct:** Overhead rate × direct labor hours
- **ABC:** Por actividad (project mgmt, admin, BD)
- **Percentage of Direct Labor:** Overhead % × direct labor cost

### Project Costing

**Work Breakdown Structure (WBS):**
```
Project
├── Phase 1: Discovery
│   ├── Task 1.1: Interviews (40h × $150 = $6,000)
│   └── Task 1.2: Analysis (30h × $180 = $5,400)
├── Phase 2: Design
└── Phase 3: Implementation
```

**Earned Value Management (EVM):**
```
Budget at Completion (BAC) = Total project budget
Planned Value (PV) = Planned % complete × BAC
Earned Value (EV) = Actual % complete × BAC
Actual Cost (AC) = Actual costs incurred

Cost Variance (CV) = EV - AC (positive is good)
Schedule Variance (SV) = EV - PV (positive is ahead)
Cost Performance Index (CPI) = EV / AC (>1 is good)
Estimate at Completion (EAC) = BAC / CPI
```

### Métricas de Performance

| Métrica | Fórmula | Benchmark |
|---------|---------|-----------|
| Revenue per Employee | Total Revenue / # Employees | $150K-$250K |
| Profit per Partner | Net Profit / # Partners | $200K-$500K |
| Utilization Rate | Billable Hours / Available Hours | 70-80% |
| Realization Rate | Actual Revenue / Potential Revenue | 90-95% |
| Overhead Rate | Overhead / Direct Labor Cost | 100-200% |

---

## 1.4 Documento 04: Márgenes y Pricing

**Ubicación:** `04-MARGENES-PRICING.md` (2,400+ líneas)

### Resumen

Estrategias de pricing, tipos de márgenes, break-even analysis, CVP analysis, elasticidad de precio, y margin management.

### Tipos de Márgenes

| Tipo | Fórmula | Uso |
|------|---------|-----|
| **Gross Margin** | ((Revenue - COGS) / Revenue) × 100 | Eficiencia producción |
| **Net Margin** | (Net Profit / Revenue) × 100 | Rentabilidad total |
| **Contribution Margin** | ((Revenue - Variable Costs) / Revenue) × 100 | Decisiones corto plazo |
| **Operating Margin** | (Operating Income / Revenue) × 100 | Eficiencia operativa |
| **EBITDA Margin** | (EBITDA / Revenue) × 100 | Cash flow operativo |

### Markup vs Margin (CRÍTICO)

**NO son lo mismo:**

```
Markup = ((Price - Cost) / Cost) × 100
Margin = ((Price - Cost) / Price) × 100

Conversiones:
Margin = (Markup / (100 + Markup)) × 100
Markup = (Margin / (100 - Margin)) × 100
```

**Tabla de Conversión Rápida:**

| Margin | Markup | Ejemplo (Costo $100) |
|--------|--------|----------------------|
| 20% | 25% | Precio = $125 |
| 25% | 33% | Precio = $133 |
| 30% | 43% | Precio = $143 |
| 40% | 67% | Precio = $167 |
| 50% | 100% | Precio = $200 |

### Break-Even Analysis

```
Break-Even Units = Fixed Costs / Contribution Margin per Unit

Break-Even Sales $ = Fixed Costs / Contribution Margin Ratio

Margin of Safety = (Actual Sales - Break-Even Sales) / Actual Sales

Target Profit Units = (Fixed Costs + Target Profit) / CM per Unit
```

**Ejemplo:**
```
Fixed Costs: $100,000
Variable Cost per Unit: $40
Selling Price: $100
Contribution Margin: $60 per unit

Break-Even = $100,000 / $60 = 1,667 units
Para profit de $50K = ($100K + $50K) / $60 = 2,500 units
```

### Estrategias de Pricing

**1. Cost-Plus Pricing**
```
Price = Cost × (1 + Markup %)
```
- Pro: Simple, asegura margen
- Contra: Ignora valor percibido y competencia

**2. Value-Based Pricing**
```
Price = Value to Customer - (Customer wants reasonable deal)
```
- Pro: Maximiza revenue
- Contra: Difícil cuantificar valor

**3. Competitive Pricing**
- Match, premium, o discount vs competencia
- Requiere monitoreo constante

**4. Dynamic Pricing**
- Ajuste en tiempo real según demanda
- Común en: airlines, hotels, e-commerce

**5. Psychological Pricing**
- $9.99 en vez de $10.00
- Precios que terminan en 9, 7, 5

**6. Bundle Pricing**
```
Bundle Price < Sum of Individual Prices
```
- Aumenta valor percibido
- Mueve productos de baja rotación

### Price Elasticity

```
Price Elasticity of Demand (PED) = (% Change in Quantity) / (% Change in Price)

PED > 1: Elastic (sensible a precio)
PED < 1: Inelastic (no sensible a precio)
PED = 1: Unit elastic
```

**Optimal Price (elasticity-based):**
```
P* = (MC × PED) / (PED + 1)

Donde:
P* = Optimal price
MC = Marginal cost
PED = Price elasticity (en valor absoluto)
```

---

## 1.5 Documento 05: Impuestos y Compliance

**Ubicación:** `05-IMPUESTOS-COMPLIANCE.md` (2,000+ líneas)

### Resumen

Sistemas de impuestos (VAT/IVA vs Sales Tax), inventory valuation para tax, COGS deductible, depreciation, impuestos específicos por industria, transfer pricing.

### VAT/IVA vs Sales Tax

| Aspecto | VAT (IVA) | Sales Tax |
|---------|-----------|-----------|
| **Aplicación** | Cada etapa de producción | Solo venta final |
| **Recuperación** | Crédito fiscal en cada etapa | No recuperable |
| **Países** | Europa, Latam, Asia-Pacific | USA (estatal), Canadá (GST) |
| **Complejidad** | Mayor (muchos formularios) | Menor |
| **Cascada** | No (por crédito fiscal) | Puede ocurrir |

**Mecanismo IVA:**

```
Manufacturer:
  Vende a Wholesaler: $100 + $21 IVA = $121
  IVA Output: $21
  IVA Input: $0
  IVA a pagar: $21

Wholesaler:
  Compra de Manufacturer: $100 + $21 IVA
  Vende a Retailer: $150 + $31.50 IVA = $181.50
  IVA Output: $31.50
  IVA Input: $21
  IVA a pagar: $10.50

Retailer:
  Compra de Wholesaler: $150 + $31.50 IVA
  Vende a Consumer: $200 + $42 IVA = $242
  IVA Output: $42
  IVA Input: $31.50
  IVA a pagar: $10.50

Total IVA recaudado: $21 + $10.50 + $10.50 = $42 (21% de $200)
```

### Inventory Valuation para Tax

**FIFO vs LIFO (USA):**

**Inflación:**
- FIFO → Higher ending inventory → Lower COGS → Higher taxable income
- LIFO → Lower ending inventory → Higher COGS → Lower taxable income

**LIFO Reserve:**
```
LIFO Reserve = FIFO Inventory Value - LIFO Inventory Value
Tax Savings = LIFO Reserve × Tax Rate
```

**IMPORTANTE:** IFRS no permite LIFO. Solo GAAP (USA).

### COGS para Tax

**Qué se incluye (UNICAP Rules - USA):**
- Direct materials
- Direct labor
- Factory overhead (rent, utilities, depreciation)
- **Indirect costs:** Purchasing, warehousing, quality control
- **Administrative overhead:** NO (excepto lo directamente relacionado)

```
Tax COGS = Beginning Inventory + Purchases + Manufacturing Overhead - Ending Inventory
```

### Depreciation

**Métodos:**

1. **Straight-Line:**
```
Annual Depreciation = (Cost - Salvage Value) / Useful Life
```

2. **Declining Balance (200%):**
```
Year 1: Cost × (2 / Useful Life)
Year 2: (Cost - Year 1 Dep) × (2 / Useful Life)
```

3. **MACRS (USA tax):**
- 3, 5, 7, 10, 15, 20 year property
- Tablas IRS predefinidas
- Half-year convention

**Section 179 (USA):**
- Expense hasta $1,160,000 (2023) en año de compra
- Phase-out después de $2,890,000 en purchases
- Solo property usado >50% en negocio

**Bonus Depreciation (USA):**
- 100% en primer año (2023, bajando gradualmente)
- Aplica después de Section 179

### Transfer Pricing

**Arm's Length Principle:**
> Precio entre partes relacionadas debe ser igual al precio entre partes independientes en circunstancias comparables.

**Métodos:**

1. **Comparable Uncontrolled Price (CUP):** Precio de transacción comparable
2. **Resale Price Method:** Precio de reventa - margen apropiado
3. **Cost Plus Method:** Costo + markup apropiado
4. **Transactional Net Margin Method (TNMM):** Margen neto comparable
5. **Profit Split Method:** Dividir profit según contribución

---

## 1.6 Documento 06: Sistemas Multi-Modelo

**Ubicación:** `06-SISTEMAS-MULTI-MODELO.md` (2,300+ líneas)

### Resumen

Arquitectura de sistemas ERP multi-industria: job vs process vs hybrid costing, data models flexibles, inventory valuation implementation, overhead allocation, integration points.

### Job vs Process vs Hybrid Costing

**Job Costing:**
- Cada trabajo/proyecto es único
- Costos rastreados por job
- **Industrias:** Construction, professional services, custom manufacturing

**Process Costing:**
- Producción continua de unidades idénticas
- Costos promediados sobre todas las unidades
- **Industrias:** Chemicals, oil refining, food processing

**Hybrid Costing:**
- Combinación de ambos
- **Ejemplo:** Cars (process para componentes, job para personalización)

**Comparación:**

| Aspecto | Job Costing | Process Costing |
|---------|-------------|-----------------|
| Producción | Custom, unique | Mass, homogeneous |
| Cost tracking | Por job | Por proceso/departamento |
| WIP | Por job | Por proceso |
| Unit cost | Cada job diferente | Promedio del período |
| Industrias | Construction, consulting | Chemicals, food |

### Data Model para Multi-Modelo

**Core Entities (SQL Schema):**

```sql
-- Cost Object: Puede ser producto, proyecto, orden, etc.
CREATE TABLE cost_objects (
  id UUID PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'product', 'job', 'project', 'service'
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(50), -- 'manufacturing', 'retail', 'food_service', etc.
  costing_method VARCHAR(50), -- 'standard', 'actual', 'average', 'fifo'
  status VARCHAR(50),
  metadata JSONB, -- Campos flexibles específicos por industria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Cost Components
CREATE TABLE cost_components (
  id UUID PRIMARY KEY,
  cost_object_id UUID REFERENCES cost_objects(id),
  type VARCHAR(50) NOT NULL, -- 'material', 'labor', 'overhead'
  category VARCHAR(100), -- 'direct_material', 'indirect_labor', etc.
  description TEXT,
  quantity DECIMAL(19,6),
  unit_of_measure VARCHAR(50),
  unit_cost DECIMAL(19,6),
  total_cost DECIMAL(19,6),
  date DATE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Overhead Pools
CREATE TABLE overhead_pools (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50), -- 'manufacturing', 'administrative', 'selling'
  allocation_method VARCHAR(50), -- 'direct_labor_hours', 'machine_hours', 'abc'
  period_start DATE,
  period_end DATE,
  budgeted_amount DECIMAL(19,6),
  actual_amount DECIMAL(19,6),
  metadata JSONB
);

-- Overhead Allocation
CREATE TABLE overhead_allocations (
  id UUID PRIMARY KEY,
  overhead_pool_id UUID REFERENCES overhead_pools(id),
  cost_object_id UUID REFERENCES cost_objects(id),
  allocation_base_quantity DECIMAL(19,6), -- Ej: 100 labor hours
  allocation_rate DECIMAL(19,6), -- Ej: $25 per hour
  allocated_amount DECIMAL(19,6), -- 100 × $25 = $2,500
  allocation_date DATE,
  metadata JSONB
);

-- Inventory Transactions (para FIFO, LIFO, Average)
CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY,
  item_id UUID REFERENCES items(id),
  transaction_type VARCHAR(50), -- 'receipt', 'issue', 'adjustment'
  quantity DECIMAL(19,6),
  unit_cost DECIMAL(19,6),
  total_cost DECIMAL(19,6),
  transaction_date TIMESTAMP,
  reference_type VARCHAR(50), -- 'purchase_order', 'production_order', etc.
  reference_id UUID,
  location_id UUID,
  metadata JSONB
);

-- FIFO Layers (para inventory valuation)
CREATE TABLE inventory_layers (
  id UUID PRIMARY KEY,
  item_id UUID REFERENCES items(id),
  location_id UUID,
  quantity_remaining DECIMAL(19,6),
  unit_cost DECIMAL(19,6),
  receipt_date TIMESTAMP,
  reference_transaction_id UUID REFERENCES inventory_transactions(id),
  status VARCHAR(50), -- 'active', 'depleted'
  metadata JSONB
);

-- Items (productos, materiales, servicios)
CREATE TABLE items (
  id UUID PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50), -- 'raw_material', 'finished_good', 'service', etc.
  valuation_method VARCHAR(50), -- 'fifo', 'lifo', 'average', 'standard'
  standard_cost DECIMAL(19,6),
  current_average_cost DECIMAL(19,6),
  industry_specific_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Recipes (para food service)
CREATE TABLE recipes (
  id UUID PRIMARY KEY,
  code VARCHAR(100) UNIQUE,
  name VARCHAR(255) NOT NULL,
  yield_quantity DECIMAL(19,6),
  yield_uom VARCHAR(50),
  portion_size DECIMAL(19,6),
  portions_per_recipe INT,
  recipe_cost DECIMAL(19,6), -- Calculado
  cost_per_portion DECIMAL(19,6), -- Calculado
  metadata JSONB,
  version INT DEFAULT 1,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id),
  item_id UUID REFERENCES items(id),
  quantity DECIMAL(19,6),
  unit_of_measure VARCHAR(50),
  cost DECIMAL(19,6), -- Calculado basado en item cost
  sequence INT,
  notes TEXT
);

-- Projects (para services y construction)
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  code VARCHAR(100) UNIQUE,
  name VARCHAR(255) NOT NULL,
  client_id UUID,
  project_type VARCHAR(50), -- 'fixed_price', 'time_and_materials', 'retainer'
  budget_amount DECIMAL(19,6),
  quoted_amount DECIMAL(19,6),
  actual_cost DECIMAL(19,6), -- Calculado
  actual_revenue DECIMAL(19,6),
  start_date DATE,
  end_date DATE,
  status VARCHAR(50),
  metadata JSONB
);

CREATE TABLE project_tasks (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  wbs_code VARCHAR(100), -- Work Breakdown Structure
  name VARCHAR(255),
  budgeted_hours DECIMAL(10,2),
  actual_hours DECIMAL(10,2),
  budgeted_cost DECIMAL(19,6),
  actual_cost DECIMAL(19,6),
  status VARCHAR(50)
);

CREATE TABLE time_entries (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  task_id UUID REFERENCES project_tasks(id),
  employee_id UUID,
  hours DECIMAL(10,2),
  billable_hours DECIMAL(10,2),
  hourly_cost DECIMAL(19,6),
  hourly_rate DECIMAL(19,6), -- Billing rate
  entry_date DATE,
  status VARCHAR(50), -- 'draft', 'submitted', 'approved', 'billed'
  notes TEXT
);
```

### Flexible Schema Design: JSONB

**Por qué JSONB:**
- Campos específicos por industria sin alterar schema
- Queries performantes (GIN indexes)
- Evolución sin migrations

**Ejemplo:**

```sql
-- Manufacturing item
{
  "manufacturing": {
    "bom_id": "uuid",
    "routing_id": "uuid",
    "production_type": "make_to_stock",
    "lead_time_days": 10
  }
}

-- Food service item
{
  "food_service": {
    "category": "protein",
    "allergens": ["gluten", "dairy"],
    "shelf_life_days": 7,
    "storage_temp_f": 38,
    "yield_percentage": 85.5
  }
}

-- Retail item
{
  "retail": {
    "sku": "ABC-123",
    "barcode": "1234567890123",
    "vendor_code": "VENDOR-A",
    "seasonality": "summer",
    "size": "M",
    "color": "blue"
  }
}
```

### Inventory Valuation: FIFO Implementation

**Algoritmo FIFO:**

```javascript
// Pseudocode for FIFO issue
function issueFIFO(itemId, quantityToIssue) {
  let remainingQty = quantityToIssue;
  let totalCost = 0;
  
  // Get active layers ordered by receipt_date (oldest first)
  const layers = getActiveLayers(itemId, orderBy: 'receipt_date ASC');
  
  for (const layer of layers) {
    if (remainingQty === 0) break;
    
    const qtyFromLayer = Math.min(remainingQty, layer.quantity_remaining);
    const costFromLayer = qtyFromLayer * layer.unit_cost;
    
    totalCost += costFromLayer;
    remainingQty -= qtyFromLayer;
    
    // Update layer
    updateLayer(layer.id, {
      quantity_remaining: layer.quantity_remaining - qtyFromLayer,
      status: (layer.quantity_remaining - qtyFromLayer === 0) ? 'depleted' : 'active'
    });
  }
  
  if (remainingQty > 0) {
    throw new Error('Insufficient inventory');
  }
  
  return {
    totalCost: totalCost,
    unitCost: totalCost / quantityToIssue
  };
}
```

**Trigger para mantener Average Cost:**

```sql
CREATE OR REPLACE FUNCTION update_average_cost()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transaction_type = 'receipt' THEN
    UPDATE items
    SET current_average_cost = (
      (current_average_cost * on_hand_quantity + NEW.total_cost) 
      / (on_hand_quantity + NEW.quantity)
    ),
    on_hand_quantity = on_hand_quantity + NEW.quantity
    WHERE id = NEW.item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_average_cost
AFTER INSERT ON inventory_transactions
FOR EACH ROW
EXECUTE FUNCTION update_average_cost();
```

### Integration Points

**1. GL Integration:**
```
Inventory Receipt → Dr. Inventory, Cr. AP
Inventory Issue → Dr. COGS, Cr. Inventory
Manufacturing Overhead Applied → Dr. WIP, Cr. Overhead Applied
```

**2. Procurement to Pay:**
```
Purchase Requisition → Purchase Order → Receipt → Invoice → Payment
Cost flows: PO → Receipt (inventory) → Invoice (AP) → Payment (Cash)
```

**3. Order to Cash:**
```
Sales Order → Pick → Ship → Invoice → Payment
Cost recognition: Ship → COGS (inventory issued)
Revenue recognition: Ship (if FOB shipping point) or Delivery (if FOB destination)
```

**4. Manufacturing:**
```
Production Order → Material Issue → Labor Booking → Overhead Application → Completion
Cost accumulation: WIP account → Finished Goods (on completion)
```

---

## 1.7 Documento 07: Matriz Conceptos-Industrias

**Ubicación:** `MATRIZ-CONCEPTOS-INDUSTRIAS.md` (1,500+ líneas)

### Resumen

Matrices comparativas consolidadas para las 6 industrias: métodos de costeo aplicables, estructura de costos, inventory valuation, pricing strategies, benchmarks de márgenes, KPIs críticos, y requerimientos de ERP.

### Matriz: Costing Methods por Industria

| Industry | Primary Method | Secondary | Inventory Valuation |
|----------|---------------|-----------|---------------------|
| **Manufacturing** | Standard, Actual | ABC, Lean | FIFO, Std Cost, Avg |
| **Retail** | Retail Method | Weighted Avg | FIFO, Weighted Avg |
| **Food Service** | Recipe Costing | Portion Control | FIFO (obligatorio) |
| **Professional Services** | Project/Job | Time & Materials | N/A (no inventory) |
| **Construction** | Job Costing | % Completion | Specific ID |
| **Healthcare** | DRG-based | RVU-based | FIFO, Average |

### Cost Structure Breakdown (% of Total Cost)

| Component | Mfg | Retail | Food | Services | Construction | Healthcare |
|-----------|-----|--------|------|----------|--------------|-----------|
| **Materials/COGS** | 40-50% | 60-70% | 28-35% | 5-10% | 40-50% | 20-30% |
| **Labor** | 20-30% | 10-15% | 25-35% | 60-75% | 30-40% | 40-50% |
| **Overhead** | 20-30% | 15-20% | 30-35% | 20-25% | 15-20% | 25-35% |
| **Other** | 5-10% | 5-10% | 5-10% | 5-10% | 5-10% | 5-10% |

### Margin Benchmarks

| Industry | Gross Margin | Net Margin |
|----------|--------------|------------|
| **Manufacturing** | 25-40% | 5-15% |
| **Retail** | 25-50% | 2-10% |
| **Food Service (Full)** | 60-70% | 3-9% |
| **Food Service (Quick)** | 55-65% | 6-12% |
| **Professional Services** | 40-60% | 15-25% |
| **Construction** | 20-35% | 3-8% |
| **Healthcare** | 35-55% | 5-15% |

### Critical KPIs por Industria

**Manufacturing:**
- Overall Equipment Effectiveness (OEE) = Availability × Performance × Quality (Target: >85%)
- Inventory Turnover = COGS / Avg Inventory (Target: 6-12×)
- Manufacturing Cycle Time = Production time / Units (Minimize)
- Scrap Rate = Scrap Cost / Total Production Cost (Target: <5%)

**Retail:**
- Inventory Turnover = COGS / Avg Inventory (Target: 8-12×)
- Gross Margin Return on Investment (GMROI) = Gross Margin $ / Avg Inventory (Target: >$3)
- Sales per Square Foot = Total Sales / Sq Ft (Varies by category)
- Shrinkage % = (Book Inv - Physical Inv) / Sales (Target: <2%)

**Food Service:**
- Food Cost % = Food Cost / Food Sales (Target: 28-35%)
- Prime Cost % = (Food + Bev + Labor) / Sales (Target: <60%)
- Table Turnover = Covers / Tables / Day (Maximize)
- Revenue per Available Seat Hour (RevPASH) = Revenue / (Seats × Hours)

**Professional Services:**
- Utilization Rate = Billable Hours / Available Hours (Target: 70-80%)
- Realization Rate = Actual Revenue / Potential Revenue (Target: 90-95%)
- Revenue per Employee (Target: $150K-$250K)
- Project Profitability = (Revenue - Cost) / Revenue (Target: >25%)

**Construction:**
- % Complete = Actual Cost / Budget (for % completion method)
- Cost Performance Index (CPI) = EV / AC (Target: ≥1.0)
- Schedule Performance Index (SPI) = EV / PV (Target: ≥1.0)
- Change Order % = Change Orders / Original Contract (Monitor closely)

**Healthcare:**
- Cost per Patient Day = Total Costs / Patient Days
- Revenue per Relative Value Unit (RVU)
- Case Mix Index = Sum of DRG weights / # discharges
- Operating Margin = Operating Income / Revenue (Target: 3-5%)

---

# 2. QUICK REFERENCE: FORMULAS

## 2.1 Cost Accounting Fundamentals

### Basic Cost Formulas

```
Total Product Cost = Direct Materials + Direct Labor + Manufacturing Overhead

Prime Cost = Direct Materials + Direct Labor

Conversion Cost = Direct Labor + Manufacturing Overhead

Cost of Goods Manufactured (COGM) = 
  Beginning WIP 
  + Direct Materials Used 
  + Direct Labor 
  + Manufacturing Overhead Applied 
  - Ending WIP

Cost of Goods Sold (COGS) = 
  Beginning Finished Goods Inventory 
  + Cost of Goods Manufactured 
  - Ending Finished Goods Inventory

OR (for retail/service):
COGS = Beginning Inventory + Purchases - Ending Inventory
```

### Overhead Rate

```
Predetermined Overhead Rate = Estimated Overhead / Estimated Allocation Base

Overhead Applied = Predetermined Rate × Actual Allocation Base

Overhead Variance = Actual Overhead - Applied Overhead
  (Underapplied if positive, Overapplied if negative)
```

### Unit Cost

```
Unit Cost = Total Cost / Number of Units

Standard Cost = Standard Qty × Standard Price (for each component)

Actual Cost = Actual Qty × Actual Price
```

---

## 2.2 Inventory Valuation

### FIFO (First In, First Out)

```
COGS = Cost of oldest inventory first
Ending Inventory = Cost of most recent purchases
```

### LIFO (Last In, First Out)

```
COGS = Cost of newest inventory first
Ending Inventory = Cost of oldest purchases

LIFO Reserve = FIFO Inventory Value - LIFO Inventory Value
```

### Weighted Average

```
Weighted Average Cost = Total Cost of Goods Available / Total Units Available

COGS = Units Sold × Weighted Average Cost
Ending Inventory = Units Remaining × Weighted Average Cost
```

### Moving Average

```
New Average Cost = (Existing Inventory Value + New Purchase Value) / 
                   (Existing Inventory Qty + New Purchase Qty)

(Recalculated after each receipt)
```

---

## 2.3 Food Service / Gastronomy

### Food Cost

```
Food Cost $ = Beginning Inventory + Purchases - Ending Inventory

Food Cost % = (Food Cost $ / Food Sales $) × 100
Target: 28-35%

Theoretical Food Cost = Σ (Recipe Cost × Units Sold)

Food Cost Variance = Actual Food Cost - Theoretical Food Cost
Variance % = (Variance / Theoretical Food Cost) × 100
```

### Recipe Costing

```
Ingredient Cost = (Purchase Price / Purchase Unit) × Recipe Quantity

Recipe Cost = Σ (All Ingredient Costs)

Cost per Portion = Recipe Cost / Number of Portions

Menu Price (simple) = Cost per Portion / Target Food Cost %
Example: $5 cost / 0.30 = $16.67 (round to $16.95)
```

### Yield Analysis

```
Yield % = (Edible Portion Weight / As-Purchased Weight) × 100

Edible Portion Cost = AP Cost / Yield %

Waste % = 100% - Yield %
```

### Prime Cost

```
Prime Cost = Food Cost + Beverage Cost + Labor Cost

Prime Cost % = (Prime Cost / Total Sales) × 100
Target: <60% (ideally 55-58%)
```

### Menu Engineering

```
Popularity Index = (Item Sales Count / Total Sales Count) × 100

Average Popularity = 100% / Number of Menu Items

High Popularity = Above Average
Low Popularity = Below Average

Contribution Margin = Selling Price - Food Cost

Average CM = Total CM / Total Items Sold

Classification:
- Stars: High Popularity + High CM
- Plowhorses: High Popularity + Low CM
- Puzzles: Low Popularity + High CM
- Dogs: Low Popularity + Low CM
```

### Beverage/Pour Cost

```
Pour Cost % = (Beverage Cost / Beverage Sales) × 100
Target: 18-24%

Drink Cost = (Bottle Cost / Ounces per Bottle) × Ounces per Drink

Example: $20 bottle / 25.4 oz × 1.5 oz = $1.18 per drink
```

### Inventory Turnover

```
Inventory Turnover = Cost of Goods Sold / Average Inventory

Days of Inventory = 365 / Inventory Turnover

Par Stock = (Average Daily Usage × Lead Time) + Safety Stock
```

---

## 2.4 Professional Services

### Billable Hours

```
Total Available Hours = (Work Days - PTO - Holidays - Training) × Hours per Day

Billable Hours Target = Total Available Hours × Target Utilization Rate

Utilization Rate = (Actual Billable Hours / Total Available Hours) × 100
Target: 70-80%

Realization Rate = (Actual Revenue / Potential Revenue) × 100
Potential Revenue = Billable Hours × Standard Rate
Target: 90-95%

Effective Rate = Standard Rate × Realization Rate
```

### Hourly Rate Calculation

```
Cost-Plus Method:
  Annual Cost per Employee = Salary + Benefits + Allocated Overhead
  Billable Hours = Available Hours × Utilization Rate
  Hourly Cost = Annual Cost / Billable Hours
  Hourly Rate = Hourly Cost × (1 + Desired Margin %)

Target Income Method:
  Hourly Rate = (Salary + Benefits + Overhead + Target Profit) / Billable Hours

Market-Based Method:
  Hourly Rate = Market Rate (based on surveys/competition)
  Verify: Rate × Billable Hours > Total Cost + Desired Profit
```

### Overhead Rate

```
Overhead Rate = Total Overhead / Total Direct Labor Cost

Example: $500K overhead / $1M labor = 50%

Overhead Allocation = Direct Labor Cost × Overhead Rate
```

### Project Performance

```
Budget at Completion (BAC) = Total Project Budget

Planned Value (PV) = Planned % Complete × BAC

Earned Value (EV) = Actual % Complete × BAC

Actual Cost (AC) = Actual costs incurred to date

Cost Variance (CV) = EV - AC
  (Positive = Under budget, Negative = Over budget)

Schedule Variance (SV) = EV - PV
  (Positive = Ahead, Negative = Behind)

Cost Performance Index (CPI) = EV / AC
  (>1 = Under budget, <1 = Over budget)

Schedule Performance Index (SPI) = EV / PV
  (>1 = Ahead, <1 = Behind)

Estimate at Completion (EAC) = BAC / CPI

Estimate to Complete (ETC) = EAC - AC

Variance at Completion (VAC) = BAC - EAC
```

### Performance Metrics

```
Revenue per Employee = Total Revenue / Number of Employees
Target: $150K-$250K (varies by service type)

Profit per Partner = Net Profit / Number of Partners
Target: $200K-$500K

Project Profitability % = ((Project Revenue - Project Cost) / Project Revenue) × 100
```

---

## 2.5 Margins & Pricing

### Margin Types

```
Gross Margin $ = Revenue - Cost of Goods Sold

Gross Margin % = (Gross Margin $ / Revenue) × 100

Contribution Margin $ = Revenue - Variable Costs

Contribution Margin % = (Contribution Margin $ / Revenue) × 100

Contribution Margin per Unit = Selling Price - Variable Cost per Unit

Operating Margin = (Operating Income / Revenue) × 100
Operating Income = Gross Profit - Operating Expenses

Net Margin = (Net Profit / Revenue) × 100

EBITDA Margin = (EBITDA / Revenue) × 100
EBITDA = Earnings Before Interest, Taxes, Depreciation, Amortization
```

### Markup vs Margin

```
Markup % = ((Selling Price - Cost) / Cost) × 100

Margin % = ((Selling Price - Cost) / Selling Price) × 100

Convert Margin to Markup:
Markup = Margin / (100 - Margin) × 100

Convert Markup to Margin:
Margin = Markup / (100 + Markup) × 100

Calculate Price from Cost and Markup:
Price = Cost × (1 + Markup%)

Calculate Price from Cost and Margin:
Price = Cost / (1 - Margin%)
```

**Quick Reference Table:**

| Cost | Margin 20% | Margin 30% | Margin 40% | Margin 50% |
|------|-----------|-----------|-----------|-----------|
| | Markup 25% | Markup 43% | Markup 67% | Markup 100% |
| $100 | $125 | $143 | $167 | $200 |
| $500 | $625 | $714 | $833 | $1,000 |
| $1,000 | $1,250 | $1,429 | $1,667 | $2,000 |

### Break-Even Analysis

```
Contribution Margin Ratio = Contribution Margin / Sales

Break-Even Point (units) = Fixed Costs / Contribution Margin per Unit

Break-Even Point (dollars) = Fixed Costs / Contribution Margin Ratio

Margin of Safety (units) = Actual Sales Units - Break-Even Units

Margin of Safety (%) = (Margin of Safety Units / Actual Sales Units) × 100

Target Profit Units = (Fixed Costs + Target Profit) / CM per Unit

Target Profit Sales $ = (Fixed Costs + Target Profit) / CM Ratio
```

### Operating Leverage

```
Degree of Operating Leverage (DOL) = Contribution Margin / Operating Income

% Change in Operating Income = DOL × % Change in Sales

High DOL = High fixed costs relative to variable → More risk, more reward
Low DOL = Low fixed costs relative to variable → Less risk, less reward
```

### Price Elasticity

```
Price Elasticity of Demand (PED) = 
  (% Change in Quantity Demanded) / (% Change in Price)

OR:

PED = ((Q2 - Q1) / Q1) / ((P2 - P1) / P1)

Interpretation:
  PED > 1: Elastic (demand sensitive to price)
  PED < 1: Inelastic (demand not sensitive to price)
  PED = 1: Unit elastic

Optimal Price (with elasticity):
P* = (Marginal Cost × |PED|) / (|PED| - 1)
```

---

## 2.6 Tax & Compliance

### VAT/IVA

```
VAT Output = Sales × VAT Rate

VAT Input = Purchases × VAT Rate

VAT Payable = VAT Output - VAT Input

Net Sales (excluding VAT) = Gross Sales / (1 + VAT Rate)

Example: $121 gross with 21% VAT
Net Sales = $121 / 1.21 = $100
VAT = $21
```

### COGS for Tax

```
Tax COGS = Beginning Inventory + Purchases + Freight In 
           + Manufacturing Overhead - Ending Inventory

Inventory Must Include (UNICAP):
- Direct materials
- Direct labor
- Indirect labor
- Factory overhead
- Purchasing costs
- Warehousing costs
- Quality control
```

### Depreciation

**Straight-Line:**
```
Annual Depreciation = (Cost - Salvage Value) / Useful Life Years
```

**Double Declining Balance (200%):**
```
Rate = 2 / Useful Life
Year 1 Depreciation = Cost × Rate
Year 2 Depreciation = (Cost - Year 1 Dep) × Rate
Continue until book value = salvage value
```

**Units of Production:**
```
Depreciation per Unit = (Cost - Salvage) / Total Estimated Units
Annual Depreciation = Units Produced × Depreciation per Unit
```

### LIFO Reserve

```
LIFO Reserve = FIFO Inventory Value - LIFO Inventory Value

Tax Benefit of LIFO = LIFO Reserve × Tax Rate

(Higher LIFO reserve = more tax savings in inflationary environment)
```

---

## 2.7 Performance Metrics

### Manufacturing

```
Overall Equipment Effectiveness (OEE) = 
  Availability × Performance × Quality

Availability = (Operating Time / Planned Production Time) × 100

Performance = (Actual Output / Theoretical Max Output) × 100

Quality = (Good Units / Total Units) × 100

Target OEE: >85%

Inventory Turnover = COGS / Average Inventory
Target: 6-12× (varies by industry)

Days Inventory Outstanding (DIO) = 365 / Inventory Turnover

Manufacturing Cycle Efficiency = 
  Value-Added Time / Total Manufacturing Cycle Time
```

### Retail

```
Inventory Turnover = COGS / Average Inventory
Target: 8-12×

Gross Margin Return on Investment (GMROI) = 
  Gross Margin $ / Average Inventory Cost
Target: >$3 (means $3 gross margin per $1 inventory)

Sales per Square Foot = Annual Sales / Total Sq Ft

Sell-Through Rate = (Units Sold / Units Received) × 100

Shrinkage % = ((Book Inventory - Physical Inventory) / Sales) × 100
Target: <2%
```

### Food Service

```
Revenue per Available Seat Hour (RevPASH) = 
  Total Revenue / (Number of Seats × Operating Hours)

Table Turnover Rate = Total Covers / Number of Tables / Day

Labor Cost % = (Labor Cost / Total Sales) × 100
Target: 25-35%

Average Check = Total Sales / Number of Covers

Food Waste % = (Food Waste $ / Food Purchases $) × 100
Target: <5%
```

### Services

```
Utilization Rate = (Billable Hours / Available Hours) × 100
Target: 70-80%

Revenue per FTE (Full-Time Equivalent) = Total Revenue / FTE Count

Gross Margin per FTE = Gross Margin $ / FTE Count

Client Acquisition Cost (CAC) = Sales & Marketing Expense / New Clients

Client Lifetime Value (CLV) = Avg Annual Revenue × Avg Client Lifespan × Margin %

CLV to CAC Ratio (Target: >3:1)
```

### Healthcare

```
Cost per Patient Day = Total Operating Costs / Total Patient Days

Revenue per Relative Value Unit (RVU) = Total Revenue / Total RVUs

Case Mix Index = Σ DRG Weights / Number of Discharges
(Higher = more complex cases)

Operating Margin = (Operating Revenue - Operating Expenses) / Operating Revenue
Target: 3-5%

Full-Time Equivalent per Occupied Bed = Total FTEs / Average Daily Census
```

---

# 3. KEY CONCEPTS INDEX

> Alphabetical index of key concepts with document references

**A**
- **ABC (Activity-Based Costing)** → Doc 01 (Section 5.3), Doc 06 (Section 8.2)
- **Absorption Costing** → Doc 01 (Section 5.1)
- **Actual Costing** → Doc 01 (Section 5.6), Doc 06 (Section 7.3)
- **Allocation Base** → Doc 01 (Section 6.2)
- **Arm's Length Principle** → Doc 05 (Section 9.1)
- **As-Purchased (AP)** → Doc 02 (Section 4.3)

**B**
- **Billable Hours** → Doc 03 (Section 4)
- **Break-Even Analysis** → Doc 04 (Section 4)
- **Budget at Completion (BAC)** → Doc 03 (Section 10.3), Doc 06 (Section 3.2)
- **Bundle Pricing** → Doc 04 (Section 6.7)

**C**
- **Capacity Planning** → Doc 03 (Section 4.4)
- **Case Mix Index** → Doc 07 (Healthcare KPIs)
- **COGS (Cost of Goods Sold)** → Doc 01, Doc 05 (Section 5)
- **Contribution Margin** → Doc 04 (Section 2.3)
- **Conversion Cost** → Doc 01 (Section 7)
- **Cost Center** → Doc 06 (Section 9.2)
- **Cost Driver** → Doc 01 (Section 6.2)
- **Cost Object** → Doc 01, Doc 06 (Section 6.1)
- **Cost Performance Index (CPI)** → Doc 03 (Section 10.3)
- **Cost Pool** → Doc 01 (Section 6.1)
- **Cost-Plus Pricing** → Doc 04 (Section 6.1)
- **CVP Analysis (Cost-Volume-Profit)** → Doc 04 (Section 5)

**D**
- **Days Inventory Outstanding (DIO)** → Doc 07
- **Depreciation** → Doc 05 (Section 7)
- **Direct Costs** → Doc 01 (Section 3.3)
- **DRG (Diagnosis-Related Group)** → Doc 07 (Healthcare)
- **Dynamic Pricing** → Doc 04 (Section 6.8)

**E**
- **Earned Value (EV)** → Doc 03 (Section 10.3), Doc 06 (Section 3.2)
- **EBITDA Margin** → Doc 04 (Section 2.5)
- **Edible Portion (EP)** → Doc 02 (Section 4.3)
- **Elasticity (Price)** → Doc 04 (Section 7)
- **EVM (Earned Value Management)** → Doc 03 (Section 10.3)

**F**
- **FIFO (First In, First Out)** → Doc 01 (Section 4.1), Doc 06 (Section 7.1)
- **Fixed Costs** → Doc 01 (Section 3.1)
- **Food Cost %** → Doc 02 (Section 2)
- **Four I's (Services)** → Doc 03 (Section 2)

**G**
- **GMROI (Gross Margin Return on Investment)** → Doc 07 (Retail KPIs)
- **Gross Margin** → Doc 04 (Section 2.1)

**H**
- **Heterogeneity** → Doc 03 (Section 2.3)
- **Hourly Rate Calculation** → Doc 03 (Section 5)
- **Hybrid Costing** → Doc 06 (Section 2.3)

**I**
- **Indirect Costs** → Doc 01 (Section 3.4)
- **Inseparability** → Doc 03 (Section 2.2)
- **Intangibility** → Doc 03 (Section 2.1)
- **Inventory Turnover** → Doc 02 (Section 10.3), Doc 07
- **IVA (Impuesto al Valor Agregado)** → Doc 05 (Section 2.1, 3)

**J**
- **Job Costing** → Doc 06 (Section 2.1)

**K**
- **Kasavana & Smith Method** → Doc 02 (Section 8.1)

**L**
- **Labor Cost %** → Doc 02 (Section 7), Doc 07
- **Lean Costing** → Doc 01 (Section 5.5)
- **LIFO (Last In, First Out)** → Doc 01 (Section 4.2), Doc 05 (Section 4.1)
- **LIFO Reserve** → Doc 05 (Section 4.1)

**M**
- **MACRS** → Doc 05 (Section 7.3)
- **Margin of Safety** → Doc 04 (Section 4.4)
- **Markup vs Margin** → Doc 04 (Section 3)
- **Menu Engineering** → Doc 02 (Section 8)
- **Moving Average** → Doc 06 (Section 7.4)

**N**
- **Net Margin** → Doc 04 (Section 2.2)

**O**
- **OEE (Overall Equipment Effectiveness)** → Doc 07 (Manufacturing KPIs)
- **Operating Leverage** → Doc 04 (Section 5.2)
- **Operating Margin** → Doc 04 (Section 2.4)
- **Overhead Allocation** → Doc 01 (Section 6), Doc 03 (Section 9), Doc 06 (Section 8)
- **Overhead Rate** → Doc 03 (Section 9.3)

**P**
- **Par Stock** → Doc 02 (Section 10.1)
- **Penetration Pricing** → Doc 04 (Section 6.4)
- **Perishability** → Doc 03 (Section 2.4)
- **Portion Control** → Doc 02 (Section 5)
- **Pour Cost** → Doc 02 (Section 6.2)
- **Price Elasticity** → Doc 04 (Section 7)
- **Prime Cost** → Doc 01 (Section 7), Doc 02 (Section 7)
- **Process Costing** → Doc 06 (Section 2.2)
- **Profit Center** → Doc 06 (Section 9.3)
- **Psychological Pricing** → Doc 04 (Section 6.6)

**R**
- **Realization Rate** → Doc 03 (Section 4.3)
- **Recipe Costing** → Doc 02 (Section 3)
- **Revenue per Employee** → Doc 03 (Section 11.1)
- **RevPASH (Revenue per Available Seat Hour)** → Doc 02 (Section 13), Doc 07
- **RVU (Relative Value Unit)** → Doc 07 (Healthcare)

**S**
- **Sales Tax** → Doc 05 (Section 2.2)
- **Section 179 Deduction** → Doc 05 (Section 7.3)
- **Shrinkage** → Doc 02 (Section 11.3), Doc 07 (Retail)
- **Skimming Pricing** → Doc 04 (Section 6.5)
- **Specific Identification** → Doc 01 (Section 4.4)
- **Standard Costing** → Doc 01 (Section 5.4), Doc 06 (Section 7.2)

**T**
- **Table Turnover** → Doc 02 (Section 13), Doc 07
- **Theoretical Food Cost** → Doc 02 (Section 2.2)
- **Transfer Pricing** → Doc 05 (Section 9)

**U**
- **UNICAP (Uniform Capitalization)** → Doc 05 (Section 5.2)
- **Utilization Rate** → Doc 03 (Section 4.2)

**V**
- **Value-Based Pricing** → Doc 03 (Section 7), Doc 04 (Section 6.3)
- **Variable Costing** → Doc 01 (Section 5.2)
- **Variable Costs** → Doc 01 (Section 3.2)
- **VAT (Value Added Tax)** → Doc 05 (Section 2.1, 3)

**W**
- **WBS (Work Breakdown Structure)** → Doc 03 (Section 10.1), Doc 06 (Section 3.1)
- **Weighted Average** → Doc 01 (Section 4.3), Doc 06 (Section 7.1)

**Y**
- **Yield %** → Doc 02 (Section 4.2)

---

# 4. INDUSTRY QUICK GUIDES

## 4.1 Manufacturing Quick Guide

### Characteristics
- **Production Type:** Make-to-stock, Make-to-order, Engineer-to-order
- **Inventory:** Raw materials, WIP, Finished goods
- **Cost Structure:** 40-50% materials, 20-30% labor, 20-30% overhead

### Primary Costing Methods
1. **Standard Costing** (most common)
   - Set standard costs for materials, labor, overhead
   - Track variances (price, quantity, efficiency)
   - Good for budgeting and control

2. **Actual Costing**
   - Use actual costs as incurred
   - More accurate but administratively complex
   - Good for custom/job shop manufacturing

3. **ABC (Activity-Based Costing)**
   - Allocate overhead by activities
   - More accurate product costs
   - Complex to maintain

### Inventory Valuation
- **FIFO** or **Weighted Average** (most common)
- **Standard Cost** (for budgeting)
- **LIFO** (USA only, tax advantage in inflation)

### Key Formulas

```
Bill of Materials (BOM) Cost = Σ (Component Qty × Component Cost)

Standard Product Cost = Standard Material + Standard Labor + Standard Overhead

Material Variance:
  Price Variance = (Actual Price - Standard Price) × Actual Qty
  Quantity Variance = (Actual Qty - Standard Qty) × Standard Price

Labor Variance:
  Rate Variance = (Actual Rate - Standard Rate) × Actual Hours
  Efficiency Variance = (Actual Hours - Standard Hours) × Standard Rate

Overhead Variance = Actual Overhead - Applied Overhead
```

### Critical KPIs
- **OEE (Overall Equipment Effectiveness):** Target >85%
- **Inventory Turnover:** 6-12× per year
- **Manufacturing Cycle Time:** Minimize
- **Scrap Rate:** <5%
- **On-Time Delivery:** >95%

### Pricing Strategy
- **Cost-Plus:** Most common (cost + 20-50% markup)
- **Competitive:** Match market for commodity products
- **Value-Based:** For innovative/differentiated products

### Margins (Typical)
- **Gross Margin:** 25-40%
- **Operating Margin:** 10-20%
- **Net Margin:** 5-15%

### ERP Requirements
- **BOM Management:** Multi-level BOMs, engineering change orders
- **Routing:** Work centers, operations, cycle times
- **MRP/MPS:** Material Requirements Planning
- **Shop Floor Control:** Work orders, labor tracking
- **Quality Management:** Inspections, non-conformance
- **Cost Accounting:** Standard costs, variance analysis
- **Inventory:** Multi-location, lot/serial tracking

### Tax Considerations
- **UNICAP Rules:** Capitalize indirect costs into inventory
- **Depreciation:** MACRS for equipment, Section 179 available
- **R&D Credit:** If developing new products

---

## 4.2 Retail Quick Guide

### Characteristics
- **Business Model:** Buy finished goods, resell to consumers
- **Inventory:** Finished goods only (no production)
- **Cost Structure:** 60-70% COGS, 10-15% labor, 15-20% overhead

### Primary Costing Methods
1. **Retail Inventory Method**
   - Track at retail prices, convert to cost
   - Common for department stores

2. **Weighted Average**
   - Average cost of all units available
   - Simple, smooth out price fluctuations

3. **FIFO**
   - First in, first out
   - Matches physical flow (especially perishables)

### Inventory Valuation
- **FIFO** or **Weighted Average** (most common)
- **Specific Identification** (for high-value items like jewelry, cars)

### Key Formulas

```
Retail Inventory Method:
  Cost-to-Retail Ratio = Cost of Goods Available / Retail Value of Goods Available
  Ending Inventory at Cost = Ending Inventory at Retail × Cost-to-Retail Ratio

Markup:
  Initial Markup % = ((Retail Price - Cost) / Cost) × 100
  Maintained Markup % = (Gross Margin / Net Sales) × 100

Inventory Metrics:
  Inventory Turnover = COGS / Average Inventory
  Days Inventory Outstanding = 365 / Inventory Turnover
  GMROI = Gross Margin $ / Average Inventory Investment
```

### Critical KPIs
- **Inventory Turnover:** 8-12× (varies by category)
- **GMROI:** >$3 (earn $3 gross margin per $1 inventory)
- **Sales per Square Foot:** Varies widely by category
- **Shrinkage %:** <2% (theft, damage, errors)
- **Sell-Through Rate:** Target >80% per season

### Pricing Strategy
- **Keystone Pricing:** 2× wholesale cost (50% margin)
- **Competitive Pricing:** Match or beat competitors
- **Psychological Pricing:** $9.99 instead of $10.00
- **Promotional Pricing:** Discounts, BOGO, etc.

### Margins (Typical)
- **Gross Margin:** 25-50% (varies by category)
  - Grocery: 20-25%
  - Apparel: 40-50%
  - Electronics: 15-25%
- **Net Margin:** 2-10%

### ERP Requirements
- **POS Integration:** Real-time sales capture
- **Multi-Location Inventory:** Store, warehouse, in-transit
- **Replenishment:** Auto-reorder based on min/max
- **Pricing Management:** Multi-tier pricing, promotions
- **CRM:** Customer loyalty, purchase history
- **E-commerce Integration:** Omnichannel inventory
- **Vendor Management:** Purchase orders, receiving

### Tax Considerations
- **Sales Tax:** Collect and remit to states
- **Nexus:** Physical or economic presence triggers tax obligation
- **Inventory Valuation:** FIFO or Average (IFRS no LIFO)
- **Shrinkage:** Deductible when identified

---

## 4.3 Food Service / Gastronomy Quick Guide

### Characteristics
- **Service Type:** Full-service, quick-service, fast-casual, catering
- **Inventory:** Highly perishable (days or hours)
- **Cost Structure:** 28-35% food cost, 25-35% labor, 30-35% other

### Primary Costing Methods
1. **Recipe Costing** (essential)
   - Cost each ingredient (6 decimal precision)
   - Calculate cost per portion
   - Update when ingredient prices change

2. **Actual vs Theoretical Food Cost**
   - Actual = Inventory method
   - Theoretical = Recipe costs × units sold
   - Variance = waste, theft, over-portioning

### Inventory Valuation
- **FIFO** (mandatory in practice due to perishability)
- **Perpetual Inventory** (daily tracking)

### Key Formulas

```
Food Cost % = (Food Cost $ / Food Sales $) × 100
Target: 28-35%

Prime Cost = Food Cost + Beverage Cost + Labor Cost
Prime Cost % = (Prime Cost / Total Sales) × 100
Target: <60% (ideally 55-58%)

Recipe Cost = Σ (Ingredient Qty × Ingredient Cost)
Cost per Portion = Recipe Cost / Portions per Recipe

Menu Price = Cost per Portion / Target Food Cost %

Yield % = (Edible Portion / As-Purchased) × 100
EP Cost = AP Cost / Yield %

Pour Cost % = (Beverage Cost / Beverage Sales) × 100
Target: 18-24%

Inventory Turnover = Food Cost / Average Inventory
Target: 30-40× per year (weekly or bi-weekly)
```

### Menu Engineering (Kasavana & Smith)

**Matrix:**
|  | **High Margin** | **Low Margin** |
|---|---|---|
| **High Popularity** | **Stars** (Promote) | **Plowhorses** (Raise price) |
| **Low Popularity** | **Puzzles** (Market more) | **Dogs** (Remove) |

**Metrics:**
- Popularity = Item count / Total items (compare to average)
- Contribution Margin = Selling Price - Food Cost

### Critical KPIs
- **Food Cost %:** 28-35%
- **Beverage Cost %:** 18-24%
- **Labor Cost %:** 25-35%
- **Prime Cost %:** <60%
- **Table Turnover:** Maximize (varies by type)
- **RevPASH:** Revenue per Available Seat Hour
- **Average Check:** Total sales / covers

### Pricing Strategy
- **Food Cost % Method:** Price = Cost / Target %
- **Contribution Margin:** Focus on $ per item, not just %
- **Competitive Pricing:** Match local market
- **Psychological Pricing:** $12.95 instead of $13.00
- **Menu Engineering:** Optimize mix of stars, plowhorses, puzzles

### Margins (Typical)
- **Gross Margin (Food):** 65-72% (inverse of food cost %)
- **Gross Margin (Beverage):** 76-82%
- **Net Margin:** 3-12% (full-service 3-9%, quick-service 6-12%)

### ERP Requirements
- **Recipe Management:** Ingredients, yields, costs
- **Menu Engineering:** Popularity, CM analysis
- **Inventory Management:** FIFO, par stock, expiration dates
- **Purchasing:** Vendor pricing, purchase orders
- **POS Integration:** Sales by item, server, time
- **Labor Scheduling:** Based on forecasted covers
- **Waste Tracking:** Identify and reduce waste

### Tax Considerations
- **Sales Tax/VAT:** Vary by jurisdiction (dine-in vs takeout)
- **Alcohol Taxes:** Excise taxes, special licenses
- **Tip Reporting:** Required for employees
- **FIFO Mandatory:** Matches physical flow and tax requirement

---

## 4.4 Professional Services Quick Guide

### Characteristics
- **Service Delivery:** Knowledge-based, labor-intensive
- **Inventory:** None (services can't be stored)
- **Cost Structure:** 60-75% labor, 20-25% overhead, 5-10% materials

### Primary Costing Methods
1. **Project/Job Costing**
   - Track costs by project
   - WBS (Work Breakdown Structure)
   - Labor hours × rates

2. **Time & Materials**
   - Bill actual time + expenses
   - Markup on costs

3. **Fixed-Fee**
   - Agree price upfront
   - Profit = Price - Actual Cost

### Key Formulas

```
Utilization Rate = (Billable Hours / Available Hours) × 100
Target: 70-80%

Realization Rate = (Actual Revenue / Potential Revenue) × 100
Potential Revenue = Billable Hours × Standard Rate
Target: 90-95%

Effective Hourly Rate = Actual Revenue / Billable Hours

Hourly Rate (Cost-Plus):
  Annual Cost = Salary + Benefits + Overhead Allocation
  Billable Hours = Available Hours × Utilization Rate
  Hourly Cost = Annual Cost / Billable Hours
  Hourly Rate = Hourly Cost / (1 - Desired Margin %)

Overhead Rate = Total Overhead / Total Direct Labor Cost

Project Profitability = (Project Revenue - Project Cost) / Project Revenue

Revenue per Employee = Total Revenue / FTE Count
Target: $150K-$250K

Earned Value Management:
  CPI = Earned Value / Actual Cost (>1 = under budget)
  SPI = Earned Value / Planned Value (>1 = ahead of schedule)
  EAC = Budget at Completion / CPI
```

### Critical KPIs
- **Utilization Rate:** 70-80%
- **Realization Rate:** 90-95%
- **Revenue per Employee:** $150K-$250K
- **Profit per Partner:** $200K-$500K
- **Project Profitability:** >25%
- **Client Retention Rate:** >90%

### Pricing Strategy
1. **Hourly Billing:** Cost-plus or market rate
2. **Fixed-Fee:** Scope + estimate + risk premium
3. **Retainer:** Monthly fee for ongoing access
4. **Value-Based:** Price on value delivered, not hours
5. **Contingency:** % of outcome (legal settlements, etc.)

### Margins (Typical)
- **Gross Margin:** 40-60%
- **Net Margin:** 15-25%

### Service Delivery Models
- **Staff Augmentation:** Supply skilled resources (hourly)
- **Project-Based:** Defined scope, deliverables (fixed or T&M)
- **Managed Services:** Ongoing operations (monthly fee)
- **Outcome-Based:** Payment tied to results

### ERP Requirements
- **Project Management:** WBS, tasks, milestones
- **Time Tracking:** Billable vs non-billable by project/task
- **Expense Tracking:** Client reimbursable expenses
- **Resource Planning:** Skills, availability, allocation
- **Billing:** Time & materials, fixed-fee, retainers
- **CRM:** Opportunities, proposals, contracts
- **Performance Analytics:** Utilization, realization, profitability

### Tax Considerations
- **No Inventory Issues:** Services not capitalized
- **Revenue Recognition:** % completion or delivered
- **Deductible Expenses:** Salaries, rent, marketing, T&E
- **State Taxes:** Nexus where work performed
- **1099 Contractors:** Track and report

---

## 4.5 Construction Quick Guide

### Characteristics
- **Project Type:** Commercial, residential, infrastructure
- **Duration:** Weeks to years
- **Cost Structure:** 40-50% materials, 30-40% labor, 15-20% overhead

### Primary Costing Methods
1. **Job Costing** (essential)
   - Each project is a job
   - Track costs by cost code (CSI MasterFormat)

2. **% Completion Method** (revenue recognition)
   - Recognize revenue as work progresses
   - Matches revenue to costs incurred

### Inventory Valuation
- **Specific Identification** (materials purchased for specific job)
- **FIFO** or **Average** for common materials

### Key Formulas

```
Job Costing:
  Total Job Cost = Materials + Labor + Equipment + Subcontractors + Overhead

% Completion Method:
  % Complete = Actual Costs to Date / Estimated Total Costs
  Revenue to Recognize = % Complete × Contract Price
  
  OR (if milestones):
  % Complete = Milestones Achieved / Total Milestones

Cost Performance Index (CPI) = Earned Value / Actual Cost
Target: ≥1.0 (on or under budget)

Schedule Performance Index (SPI) = Earned Value / Planned Value
Target: ≥1.0 (on or ahead of schedule)

Estimate at Completion (EAC) = Budget at Completion / CPI

Change Order % = Change Order Amount / Original Contract Amount
(Monitor closely for profitability)
```

### Critical KPIs
- **Gross Profit Margin:** 15-30%
- **CPI (Cost Performance Index):** ≥1.0
- **SPI (Schedule Performance Index):** ≥1.0
- **Change Order %:** Monitor (can be positive or negative)
- **Safety Incidents:** Zero (OSHA compliance)
- **Rework %:** <5%

### Pricing Strategy
- **Cost-Plus:** Cost + fixed fee or % markup
- **Lump Sum/Fixed Price:** Total price for scope
- **Unit Price:** Price per unit (sq ft, linear ft, etc.)
- **Time & Materials:** Hourly rate + materials markup

### Margins (Typical)
- **Gross Margin:** 20-35%
- **Net Margin:** 3-8%

### Cost Code Structure (CSI MasterFormat)
```
Division 01: General Requirements
Division 02: Existing Conditions
Division 03: Concrete
Division 04: Masonry
Division 05: Metals
Division 06: Wood, Plastics
... up to Division 48
```

### ERP Requirements
- **Job Costing:** Multi-level (project > phase > cost code)
- **Estimating:** Takeoff, historical data, unit costs
- **Subcontractor Management:** Bids, contracts, pay apps
- **Equipment Tracking:** Owned, rented, utilization
- **Change Order Management:** Track scope changes
- **% Completion Revenue Recognition**
- **Document Management:** Drawings, RFIs, submittals
- **Compliance:** Certified payroll, prevailing wage

### Tax Considerations
- **Revenue Recognition:** % completion or completed contract
- **UNICAP:** Capitalize indirect costs
- **Depreciation:** Equipment (MACRS, Section 179)
- **Retainage:** Tax treatment (accrue when earned)

---

## 4.6 Healthcare Quick Guide

### Characteristics
- **Service Type:** Inpatient, outpatient, emergency, specialty
- **Reimbursement:** Medicare, Medicaid, private insurance, self-pay
- **Cost Structure:** 40-50% labor, 20-30% supplies, 25-35% overhead

### Primary Costing Methods
1. **DRG (Diagnosis-Related Group)**
   - Medicare reimbursement by diagnosis
   - Fixed payment per case
   - Must manage costs under DRG rate

2. **RVU (Relative Value Unit)**
   - Physician services pricing
   - Based on work, practice expense, malpractice

3. **Cost-to-Charge Ratio**
   - Allocate costs based on charges
   - Common for departmental costing

### Key Formulas

```
Cost per Patient Day = Total Operating Costs / Total Patient Days

Revenue per RVU = Total Professional Revenue / Total RVUs

Case Mix Index (CMI) = Σ DRG Weights / Number of Discharges
(Higher CMI = more complex/costly cases)

Operating Margin = (Operating Revenue - Operating Expenses) / Operating Revenue
Target: 3-5%

FTE per Occupied Bed = Total FTEs / Average Daily Census

Length of Stay (LOS) = Total Patient Days / Discharges
(Monitor against benchmarks for each DRG)

Cost-to-Charge Ratio = Total Costs / Total Charges
(Use to allocate costs to departments/services)
```

### Critical KPIs
- **Operating Margin:** 3-5%
- **Days Cash on Hand:** >60 days
- **Accounts Receivable Days:** <60 days
- **Cost per Case:** By DRG (benchmark against peers)
- **CMI (Case Mix Index):** Track complexity
- **Readmission Rate:** <15% (quality and cost)
- **Patient Satisfaction:** HCAHPS scores

### Pricing Strategy
- **Chargemaster:** Published charge list (often 3-5× cost)
- **Negotiated Rates:** Payer contracts (% of charges or case rates)
- **DRG Rates:** Medicare/Medicaid (fixed by government)
- **Self-Pay:** Sliding scale, discounts

### Margins (Typical)
- **Gross Margin:** 35-55% (before adjustments/write-offs)
- **Net Margin (after adjustments):** 5-15%
- **Operating Margin:** 3-5%

### Reimbursement Models
1. **Fee-for-Service:** Pay per procedure/visit
2. **DRG/Case Rate:** Fixed payment per admission
3. **Capitation:** Fixed $ per member per month
4. **Value-Based:** Quality metrics + cost control
5. **Bundled Payment:** One payment for episode of care

### ERP Requirements
- **Patient Accounting:** Admissions, charges, billing
- **Revenue Cycle Management:** Claims, denials, collections
- **Cost Accounting:** Department, procedure, DRG
- **Clinical Documentation:** EMR/EHR integration
- **Supply Chain:** Medical/surgical supplies, pharmaceuticals
- **Compliance:** HIPAA, Stark Law, Anti-Kickback
- **Decision Support:** Profitability by DRG, payer, physician

### Tax Considerations
- **Non-Profit Status:** 501(c)(3) tax-exempt (most hospitals)
- **Unrelated Business Income Tax (UBIT):** On non-exempt activities
- **Charity Care:** Provide and document for tax-exempt status
- **Depreciation:** Buildings, equipment (if for-profit)

---

# 5. GLOSSARY OF TERMS

### A

**ABC (Activity-Based Costing):** Costing method that allocates overhead based on activities performed rather than simple volume measures. More accurate but more complex than traditional costing.

**Absorption Costing:** Costing method that includes all manufacturing costs (DM, DL, variable OH, fixed OH) in product cost. Required by GAAP for external reporting.

**Actual Costing:** System that uses actual costs incurred (not predetermined or standard costs). More accurate but administratively complex.

**Allocation Base:** The measure used to allocate overhead costs to products or services (e.g., direct labor hours, machine hours, sales dollars).

**Arm's Length Principle:** Tax principle requiring that transactions between related parties use prices that would be charged between unrelated parties.

**As-Purchased (AP):** Weight or quantity of food product as purchased from supplier, before any processing or waste removal.

**As-Served (AS) / Edible Portion (EP):** Weight or quantity of food product after processing, trimming, cooking—ready to serve.

### B

**BAC (Budget at Completion):** Total budgeted cost for a project. Used in Earned Value Management.

**Billable Hours:** Hours that can be charged to clients. Excludes internal time (admin, training, PTO).

**Bill of Materials (BOM):** List of raw materials, components, and quantities needed to manufacture a product.

**Break-Even Point:** Sales level (units or dollars) at which total revenue equals total costs. No profit, no loss.

**Bundle Pricing:** Selling multiple products/services together at a price lower than the sum of individual prices.

### C

**Capitation:** Payment method where provider receives fixed amount per patient per period, regardless of services provided.

**Case Mix Index (CMI):** Average DRG weight of all patients. Higher CMI indicates more complex/resource-intensive cases.

**COGS (Cost of Goods Sold):** Cost of inventory sold during a period. Calculated as Beginning Inventory + Purchases - Ending Inventory.

**Contribution Margin:** Revenue minus variable costs. Represents amount available to cover fixed costs and profit.

**Contribution Margin Ratio:** Contribution Margin / Revenue. Used in break-even and CVP analysis.

**Conversion Cost:** Direct Labor + Manufacturing Overhead. Cost to convert raw materials into finished goods.

**Cost Center:** Organizational unit (department) where costs are tracked but revenue is not measured.

**Cost Driver:** Activity that causes costs to be incurred (e.g., number of setups, number of orders processed).

**Cost Object:** Anything for which costs are measured and assigned (product, service, project, department).

**Cost of Goods Manufactured (COGM):** Total cost of products completed during a period. Transfers from WIP to Finished Goods.

**Cost Performance Index (CPI):** Earned Value / Actual Cost. Measures cost efficiency. >1 is under budget, <1 is over budget.

**Cost Pool:** Grouping of individual overhead costs (e.g., factory utilities, depreciation) before allocation.

**Cost-Plus Pricing:** Pricing strategy where price = cost + desired profit (expressed as markup % or margin %).

**CVP (Cost-Volume-Profit) Analysis:** Analysis of relationship between costs, volume, and profit. Used for planning and decision-making.

### D

**Days Inventory Outstanding (DIO):** 365 / Inventory Turnover. Average number of days inventory is held before sale.

**Depreciation:** Systematic allocation of asset cost over its useful life. Methods: straight-line, declining balance, units of production.

**Direct Costs:** Costs that can be directly traced to a cost object (e.g., direct materials, direct labor).

**Direct Labor:** Labor directly involved in production of goods or delivery of services.

**Direct Materials:** Raw materials that become part of finished product and can be traced to it.

**DRG (Diagnosis-Related Group):** Medicare payment classification. Hospitals paid fixed amount per case based on diagnosis.

**Dynamic Pricing:** Pricing that changes in real-time based on demand, time, inventory levels, or customer.

### E

**Earned Value (EV):** Actual % complete × Budget at Completion. Measures work accomplished in dollar terms.

**EBITDA:** Earnings Before Interest, Taxes, Depreciation, and Amortization. Proxy for operating cash flow.

**Edible Portion (EP):** See As-Served (AS).

**Elasticity (Price):** Measure of how demand responds to price changes. Elastic (>1) = sensitive to price. Inelastic (<1) = not sensitive.

**ERP (Enterprise Resource Planning):** Integrated software system managing business processes (finance, operations, HR, etc.).

**EVM (Earned Value Management):** Project management technique using planned value, earned value, and actual cost to assess performance.

### F

**FIFO (First In, First Out):** Inventory valuation assuming oldest inventory is sold first. Results in lower COGS (higher profit) during inflation.

**Fixed Costs:** Costs that don't change with volume in the short term (e.g., rent, salaries, insurance).

**Food Cost %:** (Food Cost $ / Food Sales $) × 100. Key metric in food service. Target: 28-35%.

**Four I's (Services):** Intangibility, Inseparability, Heterogeneity, Perishability. Characteristics that distinguish services from products.

**FTE (Full-Time Equivalent):** Measure of staffing. 1 FTE = full-time employee (e.g., 2,080 hours/year). Part-time employees count as fractions.

### G

**GAAP (Generally Accepted Accounting Principles):** US accounting standards. Requires absorption costing for external reporting.

**GMROI (Gross Margin Return on Investment):** Gross Margin $ / Average Inventory Investment. Measures profit earned per dollar invested in inventory.

**Gross Margin:** (Revenue - COGS) / Revenue. Percentage of sales remaining after direct costs.

### H

**Heterogeneity:** Service characteristic—each service delivery is unique and variable.

**Hourly Rate:** Price charged per hour of service. Calculated using cost-plus, market-based, or target income methods.

**Hybrid Costing:** Combination of job costing and process costing. Used when production has both custom and standardized elements.

### I

**IFRS (International Financial Reporting Standards):** Global accounting standards. Used in 140+ countries. Does NOT allow LIFO.

**Indirect Costs (Overhead):** Costs that cannot be directly traced to a cost object. Must be allocated.

**Inseparability:** Service characteristic—production and consumption happen simultaneously.

**Intangibility:** Service characteristic—services cannot be touched, stored, or inventoried.

**Inventory Turnover:** COGS / Average Inventory. Measures how many times inventory is sold and replaced during a period.

**IVA (Impuesto al Valor Agregado):** Spanish for VAT. See VAT.

### J

**Job Costing:** Costing system that tracks costs by individual job or project. Used when each product/service is unique.

**JSONB:** PostgreSQL data type for storing JSON data. Allows flexible schema design while maintaining query performance.

### K

**Kasavana & Smith Method:** Menu engineering framework classifying menu items into Stars, Plowhorses, Puzzles, Dogs based on popularity and contribution margin.

**Keystone Pricing:** Retail pricing strategy: price = 2× wholesale cost (results in 50% margin).

**KPI (Key Performance Indicator):** Metric used to evaluate success in achieving objectives.

### L

**Labor Cost %:** (Labor Cost / Sales) × 100. Critical metric in service and food service industries.

**Lean Costing:** Simplified costing for lean manufacturing. Uses backflushing, eliminates detailed WIP tracking.

**LIFO (Last In, First Out):** Inventory valuation assuming newest inventory is sold first. Allowed only in US GAAP, not IFRS. Results in higher COGS (lower profit) during inflation, providing tax benefit.

**LIFO Reserve:** FIFO Inventory Value - LIFO Inventory Value. Cumulative difference. Tax savings = LIFO Reserve × Tax Rate.

**LOS (Length of Stay):** Average number of days patients stay in hospital. Tracked by DRG.

### M

**MACRS (Modified Accelerated Cost Recovery System):** US tax depreciation system. Provides accelerated depreciation for tax purposes.

**Manufacturing Overhead:** All manufacturing costs except direct materials and direct labor (e.g., factory rent, utilities, depreciation, indirect labor).

**Margin:** (Price - Cost) / Price. Expressed as percentage.

**Margin of Safety:** Actual Sales - Break-Even Sales. Buffer before reaching break-even point.

**Markup:** (Price - Cost) / Cost. Expressed as percentage.

**Menu Engineering:** Analytical tool to evaluate menu item performance based on popularity and profitability.

**Moving Average:** Inventory costing method where average cost is recalculated after each purchase.

**MRP (Material Requirements Planning):** System for planning material purchases and production based on demand forecasts and BOMs.

### N

**Net Margin:** (Net Profit / Revenue) × 100. Bottom-line profitability after all expenses.

**Nexus:** Connection between business and tax jurisdiction sufficient to require tax compliance.

### O

**OEE (Overall Equipment Effectiveness):** Availability × Performance × Quality. Measures manufacturing productivity. Target: >85%.

**Operating Leverage:** Degree to which business uses fixed costs. High fixed costs = high operating leverage = more risk/reward.

**Operating Margin:** (Operating Income / Revenue) × 100. Profitability from core operations, before interest and taxes.

**Overhead:** See Indirect Costs.

**Overhead Rate:** Total Overhead / Allocation Base. Used to apply overhead to products/jobs.

### P

**Par Stock:** Target inventory level. Amount needed between deliveries plus safety stock.

**Penetration Pricing:** Setting low initial price to gain market share quickly.

**Perishability:** Service characteristic—services cannot be stored for later sale.

**% Completion Method:** Revenue recognition method for long-term contracts. Recognize revenue as work progresses.

**POS (Point of Sale):** System for recording sales transactions. Critical for retail and food service.

**Portion Control:** Standardizing serving sizes to control costs and ensure consistency.

**Pour Cost:** (Beverage Cost / Beverage Sales) × 100. Key metric for bars/restaurants. Target: 18-24%.

**Prime Cost:** Direct Materials + Direct Labor. OR (food service): Food Cost + Beverage Cost + Labor Cost.

**Process Costing:** Costing system for mass production of identical units. Costs averaged across all units.

**Profit Center:** Organizational unit where both costs and revenues are tracked. Profitability measured.

**Psychological Pricing:** Pricing to influence customer perception (e.g., $9.99 instead of $10.00).

### R

**Realization Rate:** (Actual Revenue / Potential Revenue) × 100. Measures discounting and write-offs in professional services. Target: 90-95%.

**Recipe Costing:** Process of calculating total cost of a recipe by summing costs of all ingredients.

**Retainer:** Fixed periodic fee (usually monthly) for ongoing access to services.

**Revenue per Employee:** Total Revenue / Number of Employees. Productivity metric for service businesses.

**RevPASH (Revenue per Available Seat Hour):** Total Revenue / (Seats × Operating Hours). Productivity metric for restaurants.

**RVU (Relative Value Unit):** Measure of physician work, practice expense, and malpractice risk. Used for Medicare physician payment.

### S

**Sales Tax:** Tax on final sale to consumer. Charged by retailer, remitted to state/local government. Not recoverable.

**Schedule Performance Index (SPI):** Earned Value / Planned Value. Measures schedule efficiency. >1 is ahead, <1 is behind.

**Section 179:** US tax code allowing immediate expensing of certain asset purchases (up to $1.16M in 2023).

**Shrinkage:** Inventory loss due to theft, damage, spoilage, or errors. (Book Inventory - Physical Inventory).

**Skimming Pricing:** Setting high initial price, then lowering over time. Used for innovative products.

**Specific Identification:** Inventory valuation tracking actual cost of each specific item. Used for unique, high-value items.

**Standard Costing:** Costing system using predetermined costs. Variances analyzed to control operations.

**Stars (Menu Engineering):** Items with high popularity AND high contribution margin. Maintain and promote.

### T

**Table Turnover:** Number of times a table is occupied during a period. Covers / Tables / Time Period.

**Theoretical Food Cost:** Σ (Recipe Cost × Units Sold). What food cost SHOULD be based on sales mix and recipes.

**Time & Materials (T&M):** Pricing model billing actual hours worked plus expenses, often with markup.

**Transfer Pricing:** Pricing for transactions between related entities (e.g., subsidiaries of same parent company).

### U

**UNICAP (Uniform Capitalization):** US tax rule requiring certain indirect costs to be capitalized into inventory rather than expensed.

**Utilization Rate:** (Billable Hours / Total Available Hours) × 100. Measures productivity in professional services. Target: 70-80%.

### V

**Value-Based Pricing:** Setting price based on perceived value to customer rather than cost or competition.

**Variable Costing:** Costing method including only variable manufacturing costs in product cost. Fixed overhead expensed as period cost. Not GAAP-compliant for external reporting.

**Variable Costs:** Costs that change proportionally with volume (e.g., direct materials, sales commissions).

**Variance:** Difference between actual and standard (or budgeted) amounts. Analyzed to identify issues.

**VAT (Value Added Tax):** Multi-stage tax on value added at each production/distribution stage. Businesses recover VAT paid on inputs via credit mechanism. Used in 140+ countries.

### W

**WBS (Work Breakdown Structure):** Hierarchical decomposition of project into phases, deliverables, and tasks.

**Weighted Average:** Inventory costing method: Total Cost Available / Total Units Available.

**WIP (Work in Process):** Partially completed products in manufacturing. Between raw materials and finished goods.

### Y

**Yield %:** (Edible Portion / As-Purchased) × 100. Percentage of purchased food that is usable after processing/trimming.

---

# 6. BIBLIOGRAPHY

## Books and Academic Texts

1. **Horngren, C., Datar, S., & Rajan, M.** (2015). *Cost Accounting: A Managerial Emphasis* (15th ed.). Pearson.
   - Foundational textbook on cost accounting principles

2. **Drury, C.** (2018). *Management and Cost Accounting* (10th ed.). Cengage Learning.
   - Comprehensive coverage of costing systems

3. **Labensky, S., Hause, A., & Martel, P.** (2018). *On Cooking: A Textbook of Culinary Fundamentals* (6th ed.). Pearson.
   - Recipe costing and food service operations

4. **Dopson, L. & Hayes, D.** (2019). *Food and Beverage Cost Control* (7th ed.). Wiley.
   - Detailed coverage of restaurant costing

5. **Kasavana, M. & Smith, D.** (1982). *Menu Engineering: A Practical Guide to Menu Analysis*. Hospitality Publications.
   - Original menu engineering methodology

6. **Maister, D.** (2003). *Managing the Professional Service Firm*. Free Press.
   - Professional services management and pricing

7. **Nagle, T., Hogan, J., & Zale, J.** (2016). *The Strategy and Tactics of Pricing* (6th ed.). Routledge.
   - Comprehensive pricing strategies

## Standards and Professional Organizations

8. **AICPA (American Institute of CPAs)**
   - Cost accounting standards
   - https://www.aicpa.org

9. **IFRS Foundation**
   - International Financial Reporting Standards
   - https://www.ifrs.org

10. **FASB (Financial Accounting Standards Board)**
    - US GAAP standards
    - https://www.fasb.org

11. **IRS (Internal Revenue Service)**
    - Tax regulations (UNICAP, MACRS, Section 179)
    - https://www.irs.gov

12. **OECD Transfer Pricing Guidelines**
    - International transfer pricing standards
    - https://www.oecd.org

## Industry Associations

13. **National Restaurant Association**
    - Industry benchmarks and best practices
    - https://restaurant.org

14. **APICS (Association for Supply Chain Management)**
    - Inventory and production management
    - https://www.apics.org

15. **PMI (Project Management Institute)**
    - Project costing and EVM standards
    - https://www.pmi.org

16. **Professional Services Council (PSC)**
    - Professional services benchmarks
    - https://www.pscouncil.org

## Online Resources

17. **Investopedia**
    - Financial and accounting definitions
    - https://www.investopedia.com

18. **Corporate Finance Institute (CFI)**
    - Financial analysis and costing tutorials
    - https://corporatefinanceinstitute.com

19. **Restaurant365 Blog**
    - Restaurant costing best practices
    - https://www.restaurant365.com/blog

20. **Deltek Clarity Blog**
    - Professional services metrics
    - https://www.deltek.com/en/learn/blogs

## ERP Vendor Documentation

21. **SAP Documentation**
    - Product Costing (CO-PC)
    - https://help.sap.com

22. **Oracle ERP Cloud Documentation**
    - Cost Management
    - https://docs.oracle.com

23. **Microsoft Dynamics 365 Documentation**
    - Supply Chain Management - Costing
    - https://docs.microsoft.com/dynamics365

24. **Odoo Documentation**
    - Manufacturing and Inventory
    - https://www.odoo.com/documentation

25. **NetSuite SuiteAnswers**
    - Financial Management
    - https://docs.oracle.com/en/cloud/saas/netsuite

## Software and Tools Referenced

26. **PostgreSQL Documentation** (for JSONB, triggers)
    - https://www.postgresql.org/docs/

27. **Decimal.js Library** (for precision arithmetic)
    - https://github.com/MikeMcl/decimal.js/

---

# 7. IMPLEMENTATION ROADMAP FOR G-ADMIN MINI

## 7.1 Current State Assessment

### What G-Admin Mini Already Has ✅

1. **Decimal.js Integration**
   - 6 decimal precision for financial calculations
   - Critical for recipe costing and professional services hourly rates

2. **Multi-tenant Architecture**
   - Support for multiple companies/organizations
   - Foundation for multi-industry support

3. **Database (PostgreSQL)**
   - JSONB support for flexible schemas
   - Triggers for complex calculations
   - Transaction support for financial integrity

### What Needs to Be Built 🚧

Based on 14,300+ lines of research, prioritized implementation roadmap:

---

## 7.2 Implementation Phases

### PHASE 1: CORE COSTING FOUNDATION (Months 1-3)

**Priority: CRITICAL**

#### 1.1 Item Master & Inventory

**Tables:**
```sql
items
  - id, code, name, type
  - valuation_method (fifo, average, standard)
  - standard_cost, current_average_cost
  - industry_specific_data (JSONB)

inventory_transactions
  - item_id, transaction_type, quantity
  - unit_cost, total_cost, transaction_date
  - reference (PO, sales order, production order)

inventory_layers (for FIFO)
  - item_id, quantity_remaining, unit_cost
  - receipt_date, status
```

**Features:**
- ✅ FIFO inventory valuation (algorithm from Doc 06)
- ✅ Weighted Average (trigger-based auto-calculation)
- ✅ Multi-location inventory tracking
- ✅ Lot/serial number tracking (optional)

**Deliverables:**
- Item creation/management UI
- Inventory transaction recording
- Real-time cost calculation
- Basic inventory reports (on-hand, valuation)

---

#### 1.2 Cost Components & Overhead

**Tables:**
```sql
cost_objects
  - id, type (product, job, project, service)
  - costing_method, industry

cost_components
  - cost_object_id, type (material, labor, overhead)
  - quantity, unit_cost, total_cost

overhead_pools
  - name, type, allocation_method
  - budgeted_amount, actual_amount

overhead_allocations
  - overhead_pool_id, cost_object_id
  - allocation_base_quantity, rate, allocated_amount
```

**Features:**
- ✅ Track direct materials, direct labor, overhead by cost object
- ✅ Overhead pool definition and allocation
- ✅ Support multiple allocation methods (direct labor hours, machine hours, ABC)

**Deliverables:**
- Cost object creation
- Cost component entry
- Overhead pool setup
- Allocation engine (automated)

---

#### 1.3 Basic Pricing & Margins

**Features:**
- ✅ Markup vs Margin calculation (with conversion - Doc 04)
- ✅ Cost-plus pricing
- ✅ Gross margin calculation
- ✅ Price list management (customer, date-effective)

**Deliverables:**
- Pricing calculator UI
- Price list management
- Margin analysis report

---

### PHASE 2: INDUSTRY-SPECIFIC MODULES (Months 4-6)

**Priority: HIGH**

#### 2.1 Food Service Module

**Tables:**
```sql
recipes
  - code, name, yield_quantity, portions_per_recipe
  - recipe_cost (calculated), cost_per_portion

recipe_ingredients
  - recipe_id, item_id, quantity, uom
  - cost (calculated from item cost)

menu_items
  - recipe_id, selling_price
  - food_cost_percent (calculated)
  - popularity_index, contribution_margin
  - classification (star, plowhorse, puzzle, dog)
```

**Features:**
- ✅ Recipe costing (6 decimal precision)
- ✅ Auto-update recipe costs when ingredient prices change
- ✅ Yield % calculation
- ✅ Portion control
- ✅ Menu engineering (Kasavana & Smith method - Doc 02)
- ✅ Food cost % tracking (actual vs theoretical)
- ✅ Prime cost calculation

**Deliverables:**
- Recipe builder UI
- Menu engineering matrix report
- Food cost variance report
- Prime cost dashboard

---

#### 2.2 Professional Services Module

**Tables:**
```sql
projects
  - code, name, client_id
  - project_type (fixed_price, T&M, retainer)
  - budget_amount, quoted_amount

project_tasks
  - project_id, wbs_code, name
  - budgeted_hours, budgeted_cost

time_entries
  - project_id, task_id, employee_id
  - hours, billable_hours
  - hourly_cost, hourly_rate
  - status (draft, approved, billed)

employees
  - hourly_cost, standard_billing_rate
  - utilization_target
```

**Features:**
- ✅ Project/job costing
- ✅ Time tracking (billable vs non-billable)
- ✅ WBS (Work Breakdown Structure)
- ✅ Utilization rate calculation
- ✅ Realization rate calculation
- ✅ EVM (Earned Value Management) - Doc 03

**Deliverables:**
- Project creation & WBS builder
- Time entry UI (mobile-friendly)
- Utilization dashboard
- Project profitability report
- EVM performance metrics

---

#### 2.3 Retail Module

**Features:**
- ✅ SKU/barcode management
- ✅ Multi-location inventory
- ✅ GMROI calculation
- ✅ Shrinkage tracking
- ✅ Sales per square foot (if tracking store size)

**Deliverables:**
- POS integration (API)
- Retail inventory management
- Shrinkage report
- GMROI analysis

---

#### 2.4 Manufacturing Module (Basic)

**Tables:**
```sql
boms (Bill of Materials)
  - parent_item_id, component_item_id
  - quantity, uom, sequence

production_orders
  - item_id, quantity_to_produce
  - standard_cost, actual_cost
  - status

production_transactions
  - production_order_id, type (material_issue, labor, completion)
  - item_id, quantity, cost
```

**Features:**
- ✅ BOM management (multi-level)
- ✅ Production order costing
- ✅ Standard cost vs actual cost variance
- ✅ Material issue tracking

**Deliverables:**
- BOM builder UI
- Production order creation
- Variance analysis report

---

### PHASE 3: ADVANCED FEATURES (Months 7-9)

**Priority: MEDIUM**

#### 3.1 Advanced Pricing

**Features:**
- ✅ Break-even analysis (Doc 04)
- ✅ CVP (Cost-Volume-Profit) analysis
- ✅ Price elasticity modeling
- ✅ Discount impact analysis
- ✅ Dynamic pricing rules (optional)

**Deliverables:**
- Break-even calculator
- Scenario modeling tool
- Pricing strategy simulator

---

#### 3.2 Tax & Compliance

**Tables:**
```sql
tax_jurisdictions
  - name, type (VAT, sales_tax)
  - rate, effective_date

tax_transactions
  - transaction_id, jurisdiction_id
  - taxable_amount, tax_amount
  - input_tax (VAT), output_tax (VAT)
```

**Features:**
- ✅ VAT/IVA calculation with input tax credit (Doc 05)
- ✅ Sales tax calculation (multi-jurisdiction)
- ✅ Tax reports (by jurisdiction, period)

**Deliverables:**
- Tax setup UI
- Automated tax calculation on transactions
- VAT return report
- Sales tax report by jurisdiction

---

#### 3.3 Transfer Pricing (for multi-entity)

**Features:**
- ✅ Inter-company transaction tracking
- ✅ Arm's length pricing validation
- ✅ Transfer pricing documentation

**Deliverables:**
- Transfer pricing setup
- Inter-company invoicing
- TP documentation report

---

### PHASE 4: ANALYTICS & REPORTING (Months 10-12)

**Priority: HIGH**

#### 4.1 KPI Dashboards

**By Industry:**

**Manufacturing:**
- OEE (Overall Equipment Effectiveness)
- Inventory turnover
- Scrap rate
- Cost variance analysis

**Retail:**
- GMROI
- Inventory turnover
- Shrinkage %
- Sales per sq ft

**Food Service:**
- Food cost %
- Prime cost %
- Menu engineering matrix
- Table turnover, RevPASH

**Professional Services:**
- Utilization rate
- Realization rate
- Revenue per employee
- Project profitability

**Deliverables:**
- Industry-specific dashboard templates
- Customizable KPI widgets
- Drill-down capabilities
- Export to Excel/PDF

---

#### 4.2 Advanced Reporting

**Features:**
- ✅ Multi-dimensional analysis (by product, customer, region, time)
- ✅ Profitability analysis (by product line, customer, channel)
- ✅ Trend analysis
- ✅ Budget vs actual comparison

**Deliverables:**
- Report builder (drag-and-drop)
- Scheduled reports (email)
- Data export (CSV, Excel, PDF)

---

#### 4.3 Forecasting & Planning

**Features:**
- ✅ Sales forecasting (based on historical data)
- ✅ Inventory planning (MRP-lite)
- ✅ Capacity planning (services)
- ✅ Budget creation and tracking

**Deliverables:**
- Forecasting engine
- Budget module
- What-if scenario modeling

---

## 7.3 Technical Architecture Decisions

### Database Schema Strategy

**Hybrid Approach (Recommended):**

1. **Core tables:** Strongly typed (traditional relational)
   - items, transactions, projects, recipes
   - Ensures data integrity, supports complex queries

2. **Industry-specific data:** JSONB fields
   - `items.industry_specific_data`
   - `cost_objects.metadata`
   - Flexibility without schema changes

**Example:**
```sql
CREATE TABLE items (
  id UUID PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50), -- 'raw_material', 'finished_good', 'service'
  valuation_method VARCHAR(50), -- 'fifo', 'average', 'standard'
  standard_cost DECIMAL(19,6),
  current_average_cost DECIMAL(19,6),
  
  -- Industry-specific data stored as JSONB
  industry_specific_data JSONB,
  /*
  Examples:
  Manufacturing: {"bom_id": "...", "routing_id": "...", "lead_time_days": 10}
  Food Service: {"category": "protein", "allergens": ["gluten"], "shelf_life_days": 7, "yield_percentage": 85.5}
  Retail: {"sku": "ABC-123", "barcode": "...", "vendor_code": "..."}
  */
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- GIN index for fast JSONB queries
CREATE INDEX idx_items_industry_data ON items USING GIN (industry_specific_data);

-- Example query:
SELECT * FROM items 
WHERE industry_specific_data->>'category' = 'protein'
  AND (industry_specific_data->'allergens')::jsonb ? 'gluten';
```

---

### Calculation Engine

**Use PostgreSQL Functions + Triggers:**

**Example: Auto-update average cost:**
```sql
CREATE OR REPLACE FUNCTION update_moving_average()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transaction_type = 'receipt' THEN
    UPDATE items
    SET current_average_cost = (
      (COALESCE(current_average_cost, 0) * COALESCE(quantity_on_hand, 0) + NEW.total_cost)
      / (COALESCE(quantity_on_hand, 0) + NEW.quantity)
    ),
    quantity_on_hand = COALESCE(quantity_on_hand, 0) + NEW.quantity,
    updated_at = NOW()
    WHERE id = NEW.item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_moving_average
AFTER INSERT ON inventory_transactions
FOR EACH ROW
EXECUTE FUNCTION update_moving_average();
```

**Example: Auto-update recipe cost when ingredient cost changes:**
```sql
CREATE OR REPLACE FUNCTION update_recipe_costs()
RETURNS TRIGGER AS $$
BEGIN
  -- Update all recipe_ingredients that use this item
  UPDATE recipe_ingredients
  SET cost = quantity * NEW.current_average_cost,
      updated_at = NOW()
  WHERE item_id = NEW.id;
  
  -- Update recipe total costs
  UPDATE recipes r
  SET recipe_cost = (
    SELECT SUM(cost) FROM recipe_ingredients WHERE recipe_id = r.id
  ),
  cost_per_portion = (
    SELECT SUM(cost) / NULLIF(portions_per_recipe, 0) 
    FROM recipe_ingredients WHERE recipe_id = r.id
  ),
  updated_at = NOW()
  WHERE id IN (
    SELECT DISTINCT recipe_id FROM recipe_ingredients WHERE item_id = NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_recipe_costs
AFTER UPDATE OF current_average_cost ON items
FOR EACH ROW
WHEN (OLD.current_average_cost IS DISTINCT FROM NEW.current_average_cost)
EXECUTE FUNCTION update_recipe_costs();
```

---

### API Design

**RESTful + GraphQL Hybrid:**

**REST for simple CRUD:**
```
GET    /api/items
POST   /api/items
GET    /api/items/:id
PATCH  /api/items/:id
DELETE /api/items/:id
```

**GraphQL for complex queries (analytics, dashboards):**
```graphql
query FoodCostAnalysis($dateFrom: Date!, $dateTo: Date!) {
  foodService {
    actualFoodCost(period: {from: $dateFrom, to: $dateTo}) {
      amount
      percentage
    }
    theoreticalFoodCost(period: {from: $dateFrom, to: $dateTo}) {
      amount
      percentage
    }
    variance {
      amount
      percentage
      causes
    }
    menuEngineering {
      stars { name, popularity, contributionMargin }
      plowhorses { name, popularity, contributionMargin }
      puzzles { name, popularity, contributionMargin }
      dogs { name, popularity, contributionMargin }
    }
  }
}
```

---

### Frontend Architecture

**Industry Module System:**

```
src/
├── modules/
│   ├── core/
│   │   ├── items/
│   │   ├── inventory/
│   │   ├── pricing/
│   │   └── reports/
│   ├── food-service/
│   │   ├── recipes/
│   │   ├── menu-engineering/
│   │   ├── food-cost/
│   │   └── dashboards/
│   ├── professional-services/
│   │   ├── projects/
│   │   ├── time-tracking/
│   │   ├── utilization/
│   │   └── evm/
│   ├── retail/
│   │   ├── pos/
│   │   ├── shrinkage/
│   │   └── gmroi/
│   └── manufacturing/
│       ├── bom/
│       ├── production/
│       └── variance/
└── shared/
    ├── components/
    ├── hooks/
    └── utils/
```

**Module Registry:**
```typescript
// Each industry module registers itself
const foodServiceModule: IndustryModule = {
  id: 'food-service',
  name: 'Food Service & Gastronomy',
  icon: 'restaurant',
  routes: [
    { path: '/recipes', component: RecipeList },
    { path: '/menu-engineering', component: MenuEngineering },
  ],
  dashboardWidgets: [
    FoodCostWidget,
    PrimeCostWidget,
    MenuEngineeringWidget,
  ],
  reports: [
    { id: 'food-cost-variance', name: 'Food Cost Variance', component: FoodCostReport },
    { id: 'menu-engineering', name: 'Menu Engineering Matrix', component: MenuEngineeringReport },
  ],
};

ModuleRegistry.register(foodServiceModule);
```

---

## 7.4 Success Metrics

### Phase 1 Success Criteria
- ✅ FIFO and Weighted Average inventory valuation working correctly
- ✅ Cost components tracked for at least 100 cost objects
- ✅ Overhead allocation functioning for at least 3 allocation methods
- ✅ Pricing calculator handles markup vs margin correctly (validated against Doc 04 tables)

### Phase 2 Success Criteria
- ✅ Recipe costing accurate to 6 decimals
- ✅ Menu engineering matrix classifies items correctly
- ✅ Food cost variance report matches manual calculations
- ✅ Utilization and realization rates calculated correctly for services
- ✅ EVM metrics (CPI, SPI, EAC) match PMI formulas

### Phase 3 Success Criteria
- ✅ Break-even analysis matches manual calculations
- ✅ VAT calculation with input tax credit works correctly
- ✅ Sales tax calculated correctly for multi-jurisdiction

### Phase 4 Success Criteria
- ✅ All industry-specific KPIs display correctly
- ✅ Dashboard load time <2 seconds
- ✅ Reports exportable to Excel/PDF
- ✅ User adoption >80% in pilot companies

---

## 7.5 Risk Mitigation

### Technical Risks

**Risk:** FIFO algorithm performance degrades with high transaction volume  
**Mitigation:** 
- Partition inventory_layers table by item_id and date
- Archive depleted layers periodically
- Use materialized views for reporting

**Risk:** Complex triggers slow down transaction processing  
**Mitigation:**
- Queue calculation jobs for asynchronous processing
- Use database partitioning
- Implement caching layer (Redis)

### Business Risks

**Risk:** Users find multi-industry system too complex  
**Mitigation:**
- Industry-specific onboarding flows
- Hide irrelevant modules based on company industry setting
- Provide industry-specific training materials

**Risk:** Pricing/costing errors damage user trust  
**Mitigation:**
- Extensive unit testing of all calculation formulas
- Parallel run with existing systems during pilot
- External audit of calculation logic

---

## 7.6 Next Steps (Immediate Actions)

### Week 1: Database Schema
1. Create core tables (items, inventory_transactions, cost_objects)
2. Implement FIFO inventory layers table
3. Write and test FIFO algorithm
4. Create triggers for moving average

### Week 2: Item Master
1. Build item creation UI
2. Implement inventory transaction recording
3. Create basic inventory reports
4. Test FIFO vs Average valuation

### Week 3: Cost Components
1. Create cost_components table
2. Build cost entry UI
3. Implement cost rollup calculations
4. Create basic cost analysis report

### Week 4: Sprint Review & Planning
1. Demo working FIFO inventory and cost tracking
2. Gather feedback
3. Plan Phase 1 Month 2 features
4. Begin recipe module design (parallel track)

---

## 7.7 Long-Term Vision (12+ months)

### Advanced Features Roadmap

1. **AI-Powered Insights**
   - Anomaly detection (unusual cost variances, food cost spikes)
   - Predictive analytics (forecast food costs, sales)
   - Optimization suggestions (menu mix, pricing)

2. **Mobile Apps**
   - Time tracking for professional services (iOS/Android)
   - Inventory counts (barcode scanning)
   - Manager dashboards (real-time KPIs)

3. **Integrations**
   - Accounting systems (QuickBooks, Xero, SAP)
   - Payment processors (Stripe, Square)
   - Supplier catalogs (auto-update ingredient prices)
   - POS systems (Toast, Square, Clover)

4. **Multi-Currency & Multi-Language**
   - Support for international operations
   - Currency conversion and hedging
   - Localized tax rules (by country)

5. **Advanced Manufacturing**
   - MRP II (Manufacturing Resource Planning)
   - Finite capacity scheduling
   - Quality management (SPC - Statistical Process Control)

---

# CONCLUSION

This consolidated manual synthesizes **14,300+ lines of exhaustive research** across 8 documents covering:

✅ **Cost accounting fundamentals** (types of costs, costing systems, inventory valuation)  
✅ **Industry-specific expertise** (food service, professional services, retail, manufacturing, construction, healthcare)  
✅ **Pricing strategies** (markup vs margin, break-even, elasticity, 8 pricing models)  
✅ **Tax compliance** (VAT/IVA, COGS, depreciation, transfer pricing)  
✅ **System architecture** (data models, SQL schemas, FIFO algorithms, flexible JSONB design)  
✅ **Implementation roadmap** (4 phases, 12 months, prioritized by business value)

---

## How to Use This Manual

**For Developers:**
1. Start with [Section 2: Quick Reference Formulas](#2-quick-reference-formulas) to understand calculations
2. Review [Section 7.3: Technical Architecture](#73-technical-architecture-decisions) for implementation patterns
3. Use SQL schemas from Doc 06 and this manual as blueprint
4. Follow [Section 7.6: Next Steps](#76-next-steps-immediate-actions) for week-by-week plan

**For Product Managers:**
1. Read [Section 1: Executive Summary](#1-executive-summary) for document overviews
2. Review [Section 4: Industry Quick Guides](#4-industry-quick-guides) for feature priorities
3. Use [Section 7.2: Implementation Phases](#72-implementation-phases) for roadmap planning
4. Reference [Section 7.4: Success Metrics](#74-success-metrics) for KPIs

**For Business Users:**
1. Read relevant industry quick guide ([Section 4](#4-industry-quick-guides))
2. Use [Section 2: Quick Reference Formulas](#2-quick-reference-formulas) for calculations
3. Refer to [Section 5: Glossary](#5-glossary-of-terms) for definitions
4. Consult detailed documents (01-06) for deep dives

**For Students/Learners:**
1. Start with [Section 1.1: Fundamentos de Costeo](#11-documento-01-fundamentos-de-costeo)
2. Work through industry-specific sections based on interest
3. Practice with formulas in [Section 2](#2-quick-reference-formulas)
4. Use [Section 3: Key Concepts Index](#3-key-concepts-index) to find topics

---

## Document Status

| Item | Status |
|------|--------|
| **Research Phase** | ✅ 100% Complete |
| **Total Lines Written** | 14,800+ |
| **Documents Completed** | 9/9 |
| **Formulas Documented** | 100+ |
| **Industries Covered** | 6 |
| **Implementation Roadmap** | ✅ Complete (12 months) |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01-06 | Initial release - Complete consolidation of all research |

---

## Contact & Feedback

For questions, corrections, or suggestions regarding this research:
- Project: **G-Admin Mini ERP**
- Location: `I:\Programacion\Proyectos\g-mini\docs\teoria-administrativa\`

---

**END OF MANUAL CONSOLIDADO**

---

**Total Document Statistics:**
- **Lines:** 1,850
- **Sections:** 7 major sections
- **Formulas:** 100+ consolidated
- **Glossary Terms:** 100+
- **Bibliography Entries:** 27
- **SQL Schemas:** Complete multi-industry data model
- **Implementation Timeline:** 12 months, 4 phases
- **Industries Covered:** Manufacturing, Retail, Food Service, Professional Services, Construction, Healthcare

**Research Project Complete: 100%**
