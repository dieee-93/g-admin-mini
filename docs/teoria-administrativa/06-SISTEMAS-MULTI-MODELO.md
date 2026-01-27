# 06 - SISTEMAS DE COSTEO MULTI-MODELO
## Multi-Industry ERP Costing Systems and Architecture

**Versión:** 1.0  
**Última actualización:** 2025-01-05  
**Documento:** 06/09 del Manual de Teoría Administrativa

---

## Tabla de Contenidos

1. [Introducción a Sistemas Multi-Modelo](#1-introducción-a-sistemas-multi-modelo)
2. [Job Costing vs Process Costing vs Hybrid](#2-job-costing-vs-process-costing-vs-hybrid)
   - 2.1 [Job Costing](#21-job-costing)
   - 2.2 [Process Costing](#22-process-costing)
   - 2.3 [Hybrid Costing](#23-hybrid-costing)
   - 2.4 [Comparación y Selección](#24-comparación-y-selección)
3. [Project-Based Costing](#3-project-based-costing)
   - 3.1 [Work Breakdown Structure (WBS)](#31-work-breakdown-structure-wbs)
   - 3.2 [Earned Value Management](#32-earned-value-management)
   - 3.3 [Project Cost Control](#33-project-cost-control)
4. [Costing por Industria](#4-costing-por-industria)
   - 4.1 [Manufacturing](#41-manufacturing)
   - 4.2 [Retail](#42-retail)
   - 4.3 [Food Service / Gastronomía](#43-food-service--gastronomía)
   - 4.4 [Professional Services](#44-professional-services)
   - 4.5 [Construction](#45-construction)
   - 4.6 [Healthcare](#46-healthcare)
5. [ERP Costing Modules](#5-erp-costing-modules)
   - 5.1 [SAP Costing](#51-sap-costing)
   - 5.2 [Oracle ERP Cloud](#52-oracle-erp-cloud)
   - 5.3 [Microsoft Dynamics 365](#53-microsoft-dynamics-365)
   - 5.4 [Odoo](#54-odoo)
   - 5.5 [NetSuite](#55-netsuite)
6. [Data Model para Multi-Modelo](#6-data-model-para-multi-modelo)
   - 6.1 [Core Entities](#61-core-entities)
   - 6.2 [Flexible Schema Design](#62-flexible-schema-design)
   - 6.3 [Configuration vs Customization](#63-configuration-vs-customization)
7. [Inventory Valuation Methods](#7-inventory-valuation-methods)
   - 7.1 [FIFO, LIFO, Average](#71-fifo-lifo-average)
   - 7.2 [Standard Costing](#72-standard-costing)
   - 7.3 [Actual Costing](#73-actual-costing)
   - 7.4 [Moving Average](#74-moving-average)
8. [Overhead Allocation](#8-overhead-allocation)
   - 8.1 [Traditional Allocation](#81-traditional-allocation)
   - 8.2 [Activity-Based Costing (ABC)](#82-activity-based-costing-abc)
   - 8.3 [Driver-Based Allocation](#83-driver-based-allocation)
9. [Cost Center y Profit Center](#9-cost-center-y-profit-center)
   - 9.1 [Organizational Hierarchy](#91-organizational-hierarchy)
   - 9.2 [Cost Center Accounting](#92-cost-center-accounting)
   - 9.3 [Profit Center Accounting](#93-profit-center-accounting)
10. [Integration Points](#10-integration-points)
    - 10.1 [GL Integration](#101-gl-integration)
    - 10.2 [Procurement to Pay](#102-procurement-to-pay)
    - 10.3 [Order to Cash](#103-order-to-cash)
    - 10.4 [Manufacturing](#104-manufacturing)
11. [Reporting y Analytics](#11-reporting-y-analytics)
    - 11.1 [Standard Cost Reports](#111-standard-cost-reports)
    - 11.2 [Variance Analysis](#112-variance-analysis)
    - 11.3 [Profitability Analysis](#113-profitability-analysis)
    - 11.4 [Dashboards y KPIs](#114-dashboards-y-kpis)
12. [Best Practices para Multi-Modelo](#12-best-practices-para-multi-modelo)
    - 12.1 [Modular Design](#121-modular-design)
    - 12.2 [Parameterization](#122-parameterization)
    - 12.3 [Audit Trail](#123-audit-trail)
13. [Implementation Strategy](#13-implementation-strategy)
14. [Casos de Uso](#14-casos-de-uso)
15. [Referencias y Fuentes](#15-referencias-y-fuentes)

---

## 1. Introducción a Sistemas Multi-Modelo

Un **sistema multi-modelo** de costeo es un ERP capaz de manejar diferentes métodos y approaches de costeo según la industria, tipo de negocio, o incluso diferentes divisiones dentro de la misma empresa.

### Por Qué Multi-Modelo

**Realidad empresarial:**
- Empresas diversificadas operan en múltiples industrias
- Adquisiciones traen diferentes modelos de negocio
- Expansión a nuevos mercados requiere flexibilidad

**Ejemplo:**
```
Empresa Diversificada:
├── División Manufacturing (Job costing)
├── División Retail (Weighted average inventory)
├── División Services (Project-based costing)
└── División Food (Recipe costing, FIFO)
```

### Desafíos del Multi-Modelo

1. **Complejidad Técnica**
   - Múltiples métodos de valuación
   - Diferentes cost drivers
   - Reporting consolidado

2. **Complejidad Operacional**
   - Entrenamiento de usuarios
   - Procesos diferentes por división
   - Governance y control

3. **Complejidad de Datos**
   - Estructuras diferentes
   - Integridad cross-modelo
   - Historical data migration

### Beneficios

✅ **Flexibility:** Adapta a diferentes negocios  
✅ **Consolidation:** Reporting unificado  
✅ **Scalability:** Grow into new industries  
✅ **Cost efficiency:** Un solo sistema vs múltiples  
✅ **Best practices:** Cada industria con su método optimal

---

## 2. Job Costing vs Process Costing vs Hybrid

### 2.1 Job Costing

**Job costing** acumula costos por **trabajo/proyecto individual**.

#### Cuándo Usar

- Productos/servicios **únicos** o customizados
- Cada job es **significativamente diferente**
- Cliente quiere saber costo específico de su orden

#### Industrias Típicas

- **Construction:** Cada edificio es único
- **Custom Manufacturing:** Maquinaria especializada
- **Professional Services:** Consulting projects, legal cases
- **Printing:** Custom print jobs
- **Shipbuilding:** Cada barco customizado

#### Estructura de Datos

```
Job (Work Order)
├── Job Number: #12345
├── Customer: ABC Corp
├── Description: Custom Machine
├── Start Date: 2024-01-15
├── Completion Date: 2024-03-20
└── Costs:
    ├── Direct Materials: $45,000
    ├── Direct Labor: $28,000
    ├── Overhead (allocated): $18,000
    └── Total Cost: $91,000
```

#### Proceso de Costeo

1. **Job creation:** Asignar job number
2. **Cost tracking:** 
   - Materials requisitioned to job
   - Labor hours charged to job
   - Overhead allocated (based on driver)
3. **Job completion:** 
   - Calculate total cost
   - Transfer to finished goods/COGS

#### Ejemplo: Construction Project

**Job #2024-001: Office Building**

| Cost Category | Amount | Method |
|--------------|--------|--------|
| Direct Materials | $500,000 | Actual invoices tracked |
| Direct Labor | $350,000 | Timesheet hours × rates |
| Subcontractors | $200,000 | Actual invoices |
| Equipment rental | $80,000 | Actual rental charges |
| Overhead | $165,000 | 15% of direct labor |
| **Total Job Cost** | **$1,295,000** | |

**Contract Price:** $1,600,000  
**Gross Profit:** $305,000 (19.1% margin)

### 2.2 Process Costing

**Process costing** acumula costos por **proceso/departamento** y luego divide entre todas las unidades producidas.

#### Cuándo Usar

- Productos **homogéneos** (idénticos)
- Producción **continua** o en masa
- Imposible/impráctico rastrear costo individual

#### Industrias Típicas

- **Chemical manufacturing:** Gasolina, químicos
- **Food processing:** Cereales, bebidas
- **Paper production**
- **Textiles**
- **Mining:** Extraction

#### Estructura de Datos

```
Production Period: January 2025
Process: Mixing Department

Costs Incurred:
├── Materials: $100,000
├── Labor: $50,000
├── Overhead: $30,000
└── Total: $180,000

Units:
├── Units started: 10,000
├── Units completed: 9,500
├── Work in Process (ending): 500 (50% complete)
└── Equivalent Units: 9,750

Cost per Unit = $180,000 / 9,750 = $18.46
```

#### Equivalent Units

**Problema:** Work in process está parcialmente completo.

**Solución:** Convertir a "equivalent units" completas.

**Example:**
```
500 units WIP @ 50% complete
= 500 × 0.50 = 250 equivalent units
```

**Total equivalent units:**
```
Completed: 9,500
WIP: 250
Total: 9,750 equivalent units
```

#### Multi-Department Process Costing

**Producto pasa por múltiples departamentos:**

```
Department 1 (Mixing):
  Cost per unit: $18.46

Department 2 (Cooking):
  Costs added:
    - Labor: $40,000
    - Overhead: $25,000
  Units: 9,500 (from Dept 1)
  Additional cost per unit: $6.84
  Cumulative cost: $18.46 + $6.84 = $25.30

Department 3 (Packaging):
  Additional cost per unit: $4.20
  Final cost per unit: $29.50
```

### 2.3 Hybrid Costing

**Hybrid costing** combina elementos de job y process costing.

#### Operation Costing

Usado cuando productos tienen **mismos procesos pero diferentes materiales**.

**Example: Furniture Manufacturing**

```
All sofas go through:
  - Frame assembly (process costing)
  - Upholstering (process costing)
  - Finishing (process costing)

But:
  - Different fabric types (job costing)
  - Different colors (job costing)
```

**Costing:**
```
Process costs (same for all): $200/unit
Material costs (vary by job):
  - Leather sofa: $400
  - Fabric sofa: $150

Total cost:
  - Leather sofa: $600
  - Fabric sofa: $350
```

#### Batch Costing

Similar a job costing pero para **batches** de productos idénticos.

**Example: Pharmaceutical Manufacturing**

```
Batch #2024-567: 10,000 tablets
- Materials: $5,000
- Labor: $2,000
- Overhead: $1,500
- Total: $8,500

Cost per tablet: $8,500 / 10,000 = $0.85
```

### 2.4 Comparación y Selección

| Criterio | Job Costing | Process Costing | Hybrid |
|----------|-------------|-----------------|--------|
| **Producto** | Único/customizado | Homogéneo | Semi-customizado |
| **Volumen** | Bajo-medio | Alto | Medio-alto |
| **Cost tracking** | Por job | Por período/proceso | Mixto |
| **Complejidad** | Alta | Media | Alta |
| **Ejemplos** | Construction, consulting | Chemicals, food | Furniture, pharma |

#### Decision Tree

```
¿Productos homogéneos?
├─ YES → ¿Producción continua?
│         ├─ YES → Process Costing
│         └─ NO → Batch Costing (Hybrid)
└─ NO → ¿Variación solo en materiales?
          ├─ YES → Operation Costing (Hybrid)
          └─ NO → Job Costing
```

---

## 3. Project-Based Costing

**Project-based costing** es similar a job costing pero con énfasis en:
- Projects de largo plazo
- Múltiples fases/milestones
- Resource management
- Budget vs actual tracking

### 3.1 Work Breakdown Structure (WBS)

**WBS** descompone proyecto en componentes manejables.

#### Ejemplo: Software Development Project

```
Project: ERP Implementation
├── 1.0 Requirements
│   ├── 1.1 Business requirements
│   ├── 1.2 Technical requirements
│   └── 1.3 Requirements approval
├── 2.0 Design
│   ├── 2.1 Architecture design
│   ├── 2.2 Database design
│   └── 2.3 UI/UX design
├── 3.0 Development
│   ├── 3.1 Module 1 (Accounting)
│   ├── 3.2 Module 2 (Inventory)
│   └── 3.3 Module 3 (Sales)
├── 4.0 Testing
│   ├── 4.1 Unit testing
│   ├── 4.2 Integration testing
│   └── 4.3 UAT
└── 5.0 Deployment
    ├── 5.1 Data migration
    ├── 5.2 Training
    └── 5.3 Go-live support
```

#### Cost Tracking by WBS Element

| WBS Code | Task | Budget | Actual | Variance |
|----------|------|--------|--------|----------|
| 1.1 | Business requirements | $20,000 | $18,500 | -$1,500 ✅ |
| 1.2 | Technical requirements | $25,000 | $28,000 | +$3,000 ❌ |
| 2.1 | Architecture design | $30,000 | $32,000 | +$2,000 ❌ |
| 3.1 | Accounting module | $80,000 | $75,000 | -$5,000 ✅ |

### 3.2 Earned Value Management (EVM)

**EVM** mide project performance comparando:
- **Planned Value (PV):** Budget planeado hasta ahora
- **Earned Value (EV):** Valor del trabajo completado
- **Actual Cost (AC):** Costo real incurrido

#### Métricas Clave

**1. Cost Variance (CV)**
```
CV = EV - AC
```
- Positive = Under budget ✅
- Negative = Over budget ❌

**2. Schedule Variance (SV)**
```
SV = EV - PV
```
- Positive = Ahead of schedule ✅
- Negative = Behind schedule ❌

**3. Cost Performance Index (CPI)**
```
CPI = EV / AC
```
- CPI > 1.0 = Good cost efficiency ✅
- CPI < 1.0 = Cost overrun ❌

**4. Schedule Performance Index (SPI)**
```
SPI = EV / PV
```
- SPI > 1.0 = Ahead of schedule ✅
- SPI < 1.0 = Behind schedule ❌

#### Ejemplo EVM

**Project Status at Month 6:**

```
Total Budget: $500,000
Planned duration: 12 months
Planned Value (PV) at month 6: $250,000 (50% complete)

Actual progress: 45% complete
Earned Value (EV): $500,000 × 0.45 = $225,000

Actual Cost (AC): $235,000

Analysis:
CV = $225,000 - $235,000 = -$10,000 (over budget)
SV = $225,000 - $250,000 = -$25,000 (behind schedule)

CPI = $225,000 / $235,000 = 0.96 (4% over budget)
SPI = $225,000 / $250,000 = 0.90 (10% behind schedule)
```

**Forecast:**
```
Estimate at Completion (EAC) = Budget / CPI
EAC = $500,000 / 0.96 = $520,833

Expected overrun: $20,833
```

### 3.3 Project Cost Control

#### Mechanisms

1. **Change Order Management**
   - Formal approval process
   - Budget adjustment tracking
   - Customer approval (if billable)

2. **Resource Allocation**
   - Track hours by resource
   - Identify over/under-utilized resources
   - Optimize assignments

3. **Milestone Billing**
   - Link payments to deliverables
   - Cash flow management
   - Risk mitigation

4. **Budget Alerts**
   - Automated warnings at thresholds (80%, 90%, 100%)
   - Require approval for overruns

---

## 4. Costing por Industria

### 4.1 Manufacturing

#### Cost Components

```
Product Cost:
├── Direct Materials (tracked via BOM)
├── Direct Labor (tracked via work orders)
├── Manufacturing Overhead
│   ├── Indirect materials
│   ├── Indirect labor
│   ├── Factory utilities
│   ├── Depreciation
│   └── Maintenance
└── Total Manufacturing Cost
```

#### Costing Methods

**Standard Costing:**
- Predetermined costs
- Variance analysis (actual vs standard)
- Simplified inventory valuation

**Actual Costing:**
- Real costs as incurred
- More accurate but complex
- Requires frequent revaluation

#### Bill of Materials (BOM)

```
Product: Mountain Bike
├── Frame assembly
│   ├── Frame tube (1) - $45.00
│   ├── Fork (1) - $35.00
│   └── Headset (1) - $12.00
├── Wheels (2 sets)
│   ├── Rim (2) - $25.00 each
│   ├── Spokes (72) - $0.50 each
│   └── Tire (2) - $18.00 each
├── Drivetrain
│   ├── Chainring (1) - $22.00
│   ├── Chain (1) - $15.00
│   └── Cassette (1) - $28.00
└── Components
    ├── Brakes (2) - $30.00 each
    ├── Handlebars (1) - $20.00
    └── Saddle (1) - $25.00

Total Material Cost: $378.00
Labor (2.5 hours @ $25/hr): $62.50
Overhead (80% of labor): $50.00

Total Standard Cost: $490.50
```

### 4.2 Retail

#### Key Characteristics

- **High inventory turnover**
- **Markup-based pricing**
- **Seasonal variations**
- **Multiple SKUs**

#### Costing Challenges

1. **Inventory Valuation**
   - Thousands of SKUs
   - Frequent price changes
   - Markdowns and promotions

2. **Shrinkage**
   - Theft
   - Damage
   - Administrative errors

#### Retail Accounting Método

**Retail Inventory Method:**

```
Cost-to-Retail Ratio = Cost of Goods Available / Retail Value of Goods Available

Ending Inventory (Cost) = Ending Inventory (Retail) × Cost-to-Retail Ratio
```

**Example:**

```
Beginning Inventory:
  Cost: $50,000
  Retail: $80,000

Purchases:
  Cost: $200,000
  Retail: $340,000

Goods Available:
  Cost: $250,000
  Retail: $420,000

Cost-to-Retail Ratio = $250,000 / $420,000 = 59.52%

Sales at Retail: $350,000

Ending Inventory (Retail) = $420,000 - $350,000 = $70,000
Ending Inventory (Cost) = $70,000 × 0.5952 = $41,664

COGS = $250,000 - $41,664 = $208,336
```

### 4.3 Food Service / Gastronomía

Ver documento 02 para detalles completos. Resumen:

**Key Elements:**
- **Recipe costing** (ingredient-level tracking)
- **Portion control**
- **Yield analysis**
- **Food cost % (target 28-35%)**
- **Prime cost** (food + labor, target <60%)

**System Requirements:**
- Recipe database con sub-recipes
- Yield percentage tracking
- Unit conversion (kg ↔ lb, L ↔ cups)
- Menu engineering analysis

### 4.4 Professional Services

Ver documento 03 para detalles completos. Resumen:

**Key Elements:**
- **Time tracking** (billable vs non-billable)
- **Utilization rate** (target 70-80%)
- **Realization rate** (target 90-95%)
- **Project-based or hourly billing**

**Cost Structure:**
```
Direct Costs: Labor (60-70% of revenue)
Overhead: 25-40% of revenue
Profit: 15-30% of revenue
```

### 4.5 Construction

#### Unique Aspects

- **Long-term contracts**
- **Percentage of completion** revenue recognition
- **Retention** (holdbacks)
- **Progress billing**

#### Cost Categories

```
Project Costs:
├── Direct Costs
│   ├── Materials
│   ├── Labor (by trade)
│   ├── Subcontractors
│   └── Equipment
├── Indirect Costs
│   ├── Job supervision
│   ├── Temporary facilities
│   └── Job insurance
└── General & Administrative
    ├── Office overhead
    └── Corporate management
```

#### Percentage of Completion

```
% Complete = Costs Incurred to Date / Total Estimated Costs

Revenue Recognized = Contract Value × % Complete
```

**Example:**

```
Contract: $10,000,000
Estimated Total Cost: $8,000,000
Estimated Profit: $2,000,000

Year 1:
Costs incurred: $2,400,000
% Complete = $2,400,000 / $8,000,000 = 30%
Revenue recognized = $10,000,000 × 30% = $3,000,000
Profit recognized = $2,000,000 × 30% = $600,000

Year 2:
Cumulative costs: $5,600,000
% Complete = $5,600,000 / $8,000,000 = 70%
Cumulative revenue = $7,000,000
Year 2 revenue = $7,000,000 - $3,000,000 = $4,000,000
```

### 4.6 Healthcare

#### Cost Drivers

- **Patient encounters** (visits, procedures)
- **DRGs** (Diagnosis Related Groups)
- **Service lines** (cardiology, orthopedics, etc.)

#### Costing Approach

**Patient-level costing:**

```
Patient Visit:
├── Direct costs
│   ├── Physician time
│   ├── Nursing time
│   ├── Medical supplies
│   └── Pharmaceuticals
└── Indirect costs
    ├── Facility overhead
    ├── Administrative
    └── Equipment depreciation
```

**Cost-to-Charge Ratio:**

```
Cost-to-Charge Ratio = Total Costs / Total Charges

Used to estimate costs from charge data
```

---

## 5. ERP Costing Modules

### 5.1 SAP Costing

**SAP CO (Controlling) Module**

#### Components

**1. Cost Element Accounting (CEA)**
- Classifies costs
- Primary cost elements (from GL)
- Secondary cost elements (internal allocations)

**2. Cost Center Accounting (CCA)**
- Tracks costs by department/cost center
- Budget vs actual
- Allocations

**3. Product Cost Controlling (PCC)**
- Product costing
- Material cost estimates
- Variance analysis

**4. Profitability Analysis (CO-PA)**
- Profit by customer, product, region
- Contribution margin analysis

**5. Internal Orders**
- Track costs for specific activities/projects

**6. Activity-Based Costing**
- Complex overhead allocation

#### Costing Variants

SAP permite múltiples "costing variants" paralelas:
- Legal (statutory) costing
- Group reporting costing
- Management costing

#### Ejemplo: Product Cost Estimate

```
Material: Bicycle
Costing Variant: Standard

Cost Components:
├── Raw materials: $250.00
│   └── Via BOM explosion
├── Process costs: $120.00
│   ├── Welding (1.5 hrs @ $40/hr): $60
│   ├── Assembly (1 hr @ $35/hr): $35
│   └── Painting (0.5 hr @ $50/hr): $25
├── External processing: $30.00
└── Overhead: $85.00
    ├── Material overhead (10% of materials): $25
    └── Production overhead (50% of process): $60

Total Standard Cost: $485.00
```

### 5.2 Oracle ERP Cloud

**Oracle Cost Management**

#### Features

**1. Multiple Costing Methods**
- Standard
- Average
- FIFO
- LIFO (where permitted)

**2. Sub-ledger Accounting**
- Real-time integration with GL
- Automatic journal entries

**3. Cost Organization Hierarchy**
- Multi-org architecture
- Transfer pricing between orgs

**4. Item Costs**
- Material, material overhead, resource, overhead, outside processing

**5. Cost Processors**
- Automated cost rollup
- Variance calculation

#### Costing Example

```
Manufacturing Cost Elements:
├── Material: Standard cost from item master
├── Resource: Labor/machine rates
├── Overhead: % or amount based on cost basis
└── OSP (Outside Processing): Actual from PO

Total Item Cost calculated via cost rollup
```

### 5.3 Microsoft Dynamics 365

**D365 Finance & Operations - Costing**

#### Costing Methods

**1. Standard Cost**
- Predefined costs
- Variance posting

**2. Moving Average**
- Recalculated with each receipt
- Suitable for low-volume items

**3. FIFO/LIFO**
- Actual cost layers
- Inventory close process

**4. Weighted Average**
- Date-based or period-based

#### Cost Groups

Classify costs into groups:
- Material
- Labor
- Machine
- Subcontract
- Overhead

**Benefit:** Reporting by cost group.

### 5.4 Odoo

**Odoo Inventory & Manufacturing Costing**

#### Costing Methods (per product)

**1. Standard Price**
- Fixed cost
- Manual updates

**2. Average Cost (AVCO)**
- Automatically updated on receipts
```
New Avg Cost = (Current Qty × Current Avg + Received Qty × Received Cost) / Total Qty
```

**3. FIFO**
- Tracks cost layers
- Automated layer consumption

#### Bill of Materials Costing

```
Product Cost = Sum of Component Costs + Operations Cost

Operations Cost:
  - Work Center hourly rate × duration
```

**Example:**

```
Product: Office Chair

Components:
  - Seat cushion: $25.00
  - Backrest: $30.00
  - Gas lift: $15.00
  - Base: $20.00
  - Wheels (5): $10.00

Operations:
  - Assembly (Work Center "Assembly Line")
    - Duration: 0.5 hours
    - Hourly cost: $40.00
    - Cost: $20.00

Total BOM Cost: $120.00
```

### 5.5 NetSuite

**NetSuite Costing**

#### Costing Methods

**1. Average Cost**
- Default method
- Recalculated on each inventory transaction

**2. Standard Cost**
- Set standard costs
- Variance tracking to GL

**3. FIFO**
- Available with Advanced Inventory

#### Costing Features

**1. Landed Cost**
- Freight, duties, insurance added to item cost

**2. Work Order Costing**
- Actual vs estimated
- Component consumption
- Labor tracking

**3. Assembly/BOM Costing**
- Multi-level BOM explosion
- Automatic cost rollup

---

## 6. Data Model para Multi-Modelo

### 6.1 Core Entities

#### Product/Item Master

```sql
CREATE TABLE products (
  product_id UUID PRIMARY KEY,
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200),
  product_type VARCHAR(50), -- 'manufactured', 'purchased', 'service', 'recipe'
  category_id UUID,
  unit_of_measure VARCHAR(20),
  
  -- Costing
  costing_method VARCHAR(20), -- 'standard', 'average', 'fifo', 'lifo'
  standard_cost DECIMAL(15,2),
  average_cost DECIMAL(15,2),
  last_cost DECIMAL(15,2),
  
  -- Industry-specific
  industry VARCHAR(50), -- 'manufacturing', 'retail', 'food', 'service'
  industry_config JSONB, -- Flexible schema for industry-specific fields
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Industry-specific config examples:**

```json
// Food service
{
  "recipe_yield": 10,
  "recipe_unit": "portions",
  "shelf_life_days": 3,
  "yield_percentage": 85.5
}

// Manufacturing
{
  "bom_id": "BOM-12345",
  "routing_id": "RTG-456",
  "phantom_bom": false
}

// Service
{
  "billable_type": "hourly",
  "standard_rate": 150,
  "skill_level": "senior"
}
```

#### Cost Transaction

```sql
CREATE TABLE cost_transactions (
  transaction_id UUID PRIMARY KEY,
  transaction_date TIMESTAMP,
  product_id UUID REFERENCES products(product_id),
  transaction_type VARCHAR(50), -- 'receipt', 'issue', 'adjustment', 'sale'
  
  quantity DECIMAL(15,6),
  unit_cost DECIMAL(15,2),
  total_cost DECIMAL(15,2),
  
  -- Job/Project linking
  job_id UUID,
  project_id UUID,
  cost_center_id UUID,
  
  -- Inventory layer (for FIFO/LIFO)
  layer_id UUID,
  
  -- GL integration
  gl_posted BOOLEAN DEFAULT FALSE,
  gl_batch_id UUID,
  
  -- Audit
  created_by UUID,
  created_at TIMESTAMP
);
```

#### Bill of Materials (BOM)

```sql
CREATE TABLE bom_headers (
  bom_id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(product_id),
  version INT DEFAULT 1,
  effective_date DATE,
  expiration_date DATE,
  quantity DECIMAL(15,6), -- Quantity produced
  status VARCHAR(20), -- 'active', 'inactive', 'pending'
  
  -- Industry type
  bom_type VARCHAR(50) -- 'manufacturing', 'recipe', 'service_kit'
);

CREATE TABLE bom_lines (
  bom_line_id UUID PRIMARY KEY,
  bom_id UUID REFERENCES bom_headers(bom_id),
  line_number INT,
  component_id UUID REFERENCES products(product_id),
  quantity DECIMAL(15,6),
  unit_of_measure VARCHAR(20),
  scrap_factor DECIMAL(5,2), -- % expected waste
  
  -- Optional: phantom component
  is_phantom BOOLEAN DEFAULT FALSE,
  
  -- Cost override
  override_cost DECIMAL(15,2),
  
  UNIQUE(bom_id, line_number)
);
```

### 6.2 Flexible Schema Design

#### Approach 1: JSONB Fields (PostgreSQL)

**Pros:**
- Extreme flexibility
- No schema changes for new industries
- Queryable (PostgreSQL)

**Cons:**
- Less type safety
- Harder to enforce constraints
- May impact performance if overused

**Example:**

```sql
ALTER TABLE products ADD COLUMN custom_attributes JSONB;

-- Food service product
UPDATE products SET custom_attributes = '{
  "allergens": ["nuts", "dairy"],
  "preparation_time_minutes": 25,
  "cooking_temperature_f": 350
}' WHERE product_id = '...';

-- Query
SELECT * FROM products
WHERE custom_attributes->>'preparation_time_minutes' IS NOT NULL
  AND (custom_attributes->>'preparation_time_minutes')::int < 30;
```

#### Approach 2: EAV (Entity-Attribute-Value)

**Pros:**
- Structured flexibility
- Easier to add new attributes

**Cons:**
- Complex queries
- Performance overhead
- Verbose

**Schema:**

```sql
CREATE TABLE product_attributes (
  attribute_id UUID PRIMARY KEY,
  attribute_name VARCHAR(100),
  data_type VARCHAR(20), -- 'string', 'number', 'boolean', 'date'
  industry VARCHAR(50)
);

CREATE TABLE product_attribute_values (
  product_id UUID REFERENCES products(product_id),
  attribute_id UUID REFERENCES product_attributes(attribute_id),
  value_text TEXT,
  value_number DECIMAL(15,6),
  value_boolean BOOLEAN,
  value_date DATE,
  
  PRIMARY KEY (product_id, attribute_id)
);
```

#### Approach 3: Hybrid (Recommended)

**Core fields** in main table (80% use cases)  
**Industry-specific** in JSONB or separate tables

```sql
CREATE TABLE products (
  -- Core fields (always present)
  product_id UUID PRIMARY KEY,
  sku VARCHAR(50),
  name VARCHAR(200),
  costing_method VARCHAR(20),
  standard_cost DECIMAL(15,2),
  
  -- Industry-specific (JSONB for flexibility)
  industry_config JSONB,
  
  ...
);

-- Separate tables for complex industry-specific entities
CREATE TABLE recipe_components (
  recipe_id UUID REFERENCES products(product_id),
  ingredient_id UUID REFERENCES products(product_id),
  quantity DECIMAL(15,6),
  unit_of_measure VARCHAR(20),
  preparation_notes TEXT
);
```

### 6.3 Configuration vs Customization

#### Configuration (Preferred)

**Definition:** Using built-in system parameters without code changes.

**Examples:**
- Costing method selection (dropdown)
- Overhead allocation percentages
- Report templates
- Workflow rules

**Benefits:**
- Upgrade-safe
- Faster implementation
- Lower cost
- User-manageable

#### Customization

**Definition:** Code changes, new tables, custom logic.

**When necessary:**
- Truly unique business process
- Industry-specific calculation not in standard
- Complex integrations

**Best Practices:**
- Document thoroughly
- Use extension points/APIs when available
- Minimize customization
- Plan for upgrade impact

#### Example: Overhead Allocation

**Configuration approach:**

```
System Setting:
┌─────────────────────────────────────┐
│ Overhead Allocation Method:         │
│ ○ % of Direct Labor                 │
│ ○ % of Direct Material              │
│ ● % of Prime Cost                   │
│ ○ Activity-Based (ABC)              │
│                                      │
│ If Prime Cost:                       │
│   Rate: [  80  ] %                  │
└─────────────────────────────────────┘
```

**Customization approach:**

Custom allocation logic requiring code:
```python
def calculate_overhead(job):
    # Custom formula based on complex business rules
    base = job.material_cost + job.labor_cost
    
    if job.customer.tier == 'A':
        rate = 0.75
    elif job.complexity == 'high':
        rate = 1.20
    else:
        rate = 0.80
    
    return base * rate
```

---

## 7. Inventory Valuation Methods

### 7.1 FIFO, LIFO, Average

Ver documento 01 para detalles teóricos. Aquí: implementación en sistema.

#### FIFO Implementation

**Cost Layer Table:**

```sql
CREATE TABLE inventory_layers (
  layer_id UUID PRIMARY KEY,
  product_id UUID,
  receipt_date TIMESTAMP,
  quantity_received DECIMAL(15,6),
  quantity_remaining DECIMAL(15,6),
  unit_cost DECIMAL(15,2),
  total_cost DECIMAL(15,2),
  status VARCHAR(20) -- 'active', 'depleted'
);
```

**Consumption Logic (FIFO):**

```python
def issue_inventory_fifo(product_id, quantity_to_issue):
    layers = get_active_layers(product_id, order_by='receipt_date ASC')
    
    remaining_to_issue = quantity_to_issue
    total_cost = 0
    
    for layer in layers:
        if remaining_to_issue <= 0:
            break
        
        issue_from_layer = min(layer.quantity_remaining, remaining_to_issue)
        cost = issue_from_layer * layer.unit_cost
        
        # Update layer
        layer.quantity_remaining -= issue_from_layer
        if layer.quantity_remaining == 0:
            layer.status = 'depleted'
        layer.save()
        
        # Accumulate
        remaining_to_issue -= issue_from_layer
        total_cost += cost
    
    average_unit_cost = total_cost / quantity_to_issue
    return average_unit_cost, total_cost
```

### 7.2 Standard Costing

**Standard Cost Storage:**

```sql
CREATE TABLE product_standard_costs (
  product_id UUID,
  effective_date DATE,
  cost_type VARCHAR(50), -- 'material', 'labor', 'overhead'
  standard_cost DECIMAL(15,2),
  
  PRIMARY KEY (product_id, effective_date, cost_type)
);
```

**Variance Calculation:**

```sql
-- Capture variance on transaction
CREATE TABLE cost_variances (
  variance_id UUID PRIMARY KEY,
  transaction_id UUID,
  product_id UUID,
  variance_type VARCHAR(50), -- 'purchase_price', 'usage', 'labor_rate', etc.
  standard_cost DECIMAL(15,2),
  actual_cost DECIMAL(15,2),
  variance_amount DECIMAL(15,2),
  quantity DECIMAL(15,6),
  
  -- GL posting
  gl_account VARCHAR(50), -- Variance account
  gl_posted BOOLEAN
);
```

**Example - Purchase Price Variance:**

```
Purchase Order: 100 units @ $10 standard

Actual Receipt: 100 units @ $11 (invoice)

Purchase Price Variance:
  Standard: 100 × $10 = $1,000
  Actual: 100 × $11 = $1,100
  Variance: $100 (unfavorable)

GL Entry:
  DR Inventory: $1,000 (at standard)
  DR PPV (expense): $100
  CR Accounts Payable: $1,100
```

### 7.3 Actual Costing

**Characteristics:**
- Inventory valued at actual cost received
- No variances (since actual = standard)
- More complex COGS calculation

**Implementation:**

Each receipt has its actual cost:

```sql
INSERT INTO inventory_layers (product_id, receipt_date, quantity_received, unit_cost)
VALUES ('prod-123', NOW(), 100, 11.25); -- Actual cost from invoice
```

### 7.4 Moving Average

**Recalculation on Each Receipt:**

```python
def receive_inventory_moving_average(product_id, quantity, cost):
    current = get_current_inventory(product_id)
    
    # Current state
    current_qty = current.quantity_on_hand
    current_avg = current.average_cost
    current_value = current_qty * current_avg
    
    # New receipt
    new_value = quantity * cost
    
    # Recalculate average
    new_total_qty = current_qty + quantity
    new_total_value = current_value + new_value
    new_average = new_total_value / new_total_qty
    
    # Update
    current.quantity_on_hand = new_total_qty
    current.average_cost = new_average
    current.save()
    
    return new_average
```

**Example:**

```
Current: 50 units @ $10 avg = $500 value

Receive: 30 units @ $12 = $360

New average = ($500 + $360) / (50 + 30) = $860 / 80 = $10.75
```

---

## 8. Overhead Allocation

### 8.1 Traditional Allocation

**Single Pool, Single Driver:**

```
Total Overhead = $500,000
Total Direct Labor Hours = 25,000 hours

Overhead Rate = $500,000 / 25,000 = $20 per DLH

Job with 100 DLH → Overhead = 100 × $20 = $2,000
```

**Implementation:**

```sql
CREATE TABLE overhead_pools (
  pool_id UUID PRIMARY KEY,
  pool_name VARCHAR(100),
  fiscal_year INT,
  total_overhead DECIMAL(15,2),
  allocation_base VARCHAR(50), -- 'direct_labor_hours', 'machine_hours', 'direct_labor_cost'
  total_base_quantity DECIMAL(15,2),
  rate DECIMAL(15,4) -- Calculated: total_overhead / total_base_quantity
);

-- Apply to job
SELECT rate FROM overhead_pools WHERE pool_id = 'pool-1';
-- Allocated overhead = job.direct_labor_hours * rate
```

### 8.2 Activity-Based Costing (ABC)

Ver documento 01 para teoría. Implementación:

**Activities Table:**

```sql
CREATE TABLE abc_activities (
  activity_id UUID PRIMARY KEY,
  activity_name VARCHAR(100),
  cost_driver VARCHAR(100), -- 'number_of_setups', 'inspection_hours'
  total_cost DECIMAL(15,2),
  total_driver_quantity DECIMAL(15,2),
  cost_per_driver DECIMAL(15,4)
);
```

**Example Activities:**

| Activity | Cost Driver | Total Cost | Driver Qty | Rate |
|----------|------------|------------|------------|------|
| Machine setup | # of setups | $80,000 | 400 | $200/setup |
| Quality inspection | Inspection hours | $120,000 | 3,000 | $40/hour |
| Material handling | # of moves | $60,000 | 1,500 | $40/move |

**Apply to Product:**

```sql
CREATE TABLE product_abc_drivers (
  product_id UUID,
  activity_id UUID,
  driver_quantity DECIMAL(15,6), -- How much this product consumes
  
  PRIMARY KEY (product_id, activity_id)
);

-- Calculate ABC overhead for a product
SELECT 
  p.product_id,
  SUM(ad.driver_quantity * a.cost_per_driver) AS total_abc_overhead
FROM products p
JOIN product_abc_drivers ad ON p.product_id = ad.product_id
JOIN abc_activities a ON ad.activity_id = a.activity_id
GROUP BY p.product_id;
```

### 8.3 Driver-Based Allocation

Flexible system where allocation bases can be configured per cost pool.

```sql
CREATE TABLE cost_drivers (
  driver_id UUID PRIMARY KEY,
  driver_name VARCHAR(100),
  driver_type VARCHAR(50), -- 'quantity', 'hours', 'percentage'
  source_table VARCHAR(100), -- Where to get the driver value
  source_column VARCHAR(100)
);

CREATE TABLE overhead_allocation_rules (
  rule_id UUID PRIMARY KEY,
  cost_pool_id UUID,
  cost_driver_id UUID,
  allocation_percentage DECIMAL(5,2) -- If splitting pool across multiple drivers
);
```

**Example Configuration:**

```
Overhead Pool: Factory Utilities ($100,000)
├── 60% allocated by Machine Hours
└── 40% allocated by Square Footage

Driver 1: Machine Hours
  - Total machine hours: 10,000
  - Rate: ($100,000 × 0.60) / 10,000 = $6/MH

Driver 2: Square Footage
  - Total sq ft: 50,000
  - Rate: ($100,000 × 0.40) / 50,000 = $0.80/sq ft
```

---

## 9. Cost Center y Profit Center

### 9.1 Organizational Hierarchy

```
Company
├── Division A (Profit Center)
│   ├── Manufacturing (Cost Center)
│   ├── Sales (Cost Center)
│   └── Admin (Cost Center)
├── Division B (Profit Center)
│   ├── Production (Cost Center)
│   └── Distribution (Cost Center)
└── Corporate (Cost Center)
    ├── IT (Cost Center)
    ├── HR (Cost Center)
    └── Finance (Cost Center)
```

**Data Model:**

```sql
CREATE TABLE organizational_units (
  unit_id UUID PRIMARY KEY,
  unit_code VARCHAR(50),
  unit_name VARCHAR(200),
  unit_type VARCHAR(50), -- 'cost_center', 'profit_center', 'investment_center'
  parent_unit_id UUID REFERENCES organizational_units(unit_id),
  
  -- Hierarchy path for easy querying
  hierarchy_path VARCHAR(500), -- e.g., '/company/divA/manufacturing'
  level INT,
  
  -- Manager
  manager_id UUID,
  
  -- Financial
  budget_amount DECIMAL(15,2),
  
  active BOOLEAN DEFAULT TRUE
);
```

### 9.2 Cost Center Accounting

**Purpose:** Track costs, not revenue.

**Cost Tracking:**

```sql
CREATE TABLE cost_center_costs (
  cost_center_id UUID REFERENCES organizational_units(unit_id),
  fiscal_period VARCHAR(7), -- 'YYYY-MM'
  account_id UUID, -- GL account
  actual_amount DECIMAL(15,2),
  budget_amount DECIMAL(15,2),
  variance DECIMAL(15,2),
  
  PRIMARY KEY (cost_center_id, fiscal_period, account_id)
);
```

**Reporting:**

```sql
SELECT 
  cc.unit_name AS cost_center,
  fp.fiscal_period,
  SUM(ccc.actual_amount) AS total_cost,
  SUM(ccc.budget_amount) AS total_budget,
  SUM(ccc.variance) AS total_variance
FROM cost_center_costs ccc
JOIN organizational_units cc ON ccc.cost_center_id = cc.unit_id
WHERE cc.unit_type = 'cost_center'
  AND fp.fiscal_period = '2024-12'
GROUP BY cc.unit_name, fp.fiscal_period;
```

### 9.3 Profit Center Accounting

**Purpose:** Track both revenue and costs → Calculate profit.

**P&L by Profit Center:**

```sql
CREATE VIEW profit_center_pl AS
SELECT 
  pc.unit_id,
  pc.unit_name,
  fp.fiscal_period,
  SUM(CASE WHEN a.account_type = 'revenue' THEN gl.amount ELSE 0 END) AS revenue,
  SUM(CASE WHEN a.account_type = 'cogs' THEN gl.amount ELSE 0 END) AS cogs,
  SUM(CASE WHEN a.account_type = 'opex' THEN gl.amount ELSE 0 END) AS opex,
  SUM(CASE WHEN a.account_type = 'revenue' THEN gl.amount ELSE 0 END) - 
  SUM(CASE WHEN a.account_type IN ('cogs', 'opex') THEN gl.amount ELSE 0 END) AS net_profit
FROM organizational_units pc
JOIN gl_transactions gl ON pc.unit_id = gl.profit_center_id
JOIN accounts a ON gl.account_id = a.account_id
WHERE pc.unit_type = 'profit_center'
GROUP BY pc.unit_id, pc.unit_name, fp.fiscal_period;
```

---

## 10. Integration Points

### 10.1 GL Integration

**Cost transactions** deben generar **journal entries** en el GL.

**Mapping:**

```sql
CREATE TABLE cost_to_gl_mapping (
  mapping_id UUID PRIMARY KEY,
  transaction_type VARCHAR(50), -- 'receipt', 'issue', 'variance'
  debit_account_id UUID,
  credit_account_id UUID,
  
  -- Conditions
  product_category_id UUID,
  cost_center_id UUID
);
```

**Example: Inventory Receipt**

```
Transaction: Receive 100 units @ $10

Journal Entry:
  DR Inventory Asset (balance sheet) $1,000
  CR Accounts Payable (liability) $1,000
```

**Example: Inventory Issue to Production**

```
Transaction: Issue 50 units @ $10 to Job #123

Journal Entry:
  DR Work in Process (Job #123) $500
  CR Inventory Asset $500
```

### 10.2 Procurement to Pay

**Flow:**

```
Purchase Requisition
  ↓
Purchase Order (encumbrance)
  ↓
Goods Receipt (inventory increase)
  ↓
Invoice Receipt (AP increase)
  ↓
Payment (cash decrease, AP decrease)
```

**Cost Integration Points:**

1. **PO Creation:** Encumber budget
2. **Goods Receipt:** Update inventory at PO price (or standard)
3. **Invoice:** Capture variance if invoice ≠ PO price

### 10.3 Order to Cash

**Flow:**

```
Sales Quote
  ↓
Sales Order (reserve inventory)
  ↓
Pick & Ship (reduce inventory)
  ↓
Invoice (recognize revenue)
  ↓
Payment (cash increase, AR decrease)
```

**Cost Integration:**

1. **Sales Order:** Check available inventory
2. **Shipment:** 
   - Reduce inventory (COGS debit)
   - Recognize revenue (if shipped)

**Journal Entry on Shipment:**

```
DR COGS $500 (cost of items shipped)
CR Inventory $500

DR Accounts Receivable $800 (invoice amount)
CR Revenue $800
```

### 10.4 Manufacturing

**Flow:**

```
Production Order created
  ↓
Materials issued (reduce raw materials inventory)
  ↓
Labor & overhead applied
  ↓
Production completed (increase finished goods)
```

**Costing:**

```sql
CREATE TABLE production_orders (
  order_id UUID PRIMARY KEY,
  product_id UUID,
  quantity_ordered DECIMAL(15,6),
  quantity_completed DECIMAL(15,6),
  
  -- Costs
  material_cost DECIMAL(15,2),
  labor_cost DECIMAL(15,2),
  overhead_cost DECIMAL(15,2),
  total_cost DECIMAL(15,2),
  
  -- Standard vs Actual
  standard_cost_per_unit DECIMAL(15,2),
  actual_cost_per_unit DECIMAL(15,2)
);
```

**Variance on Completion:**

```
Standard cost: 100 units @ $50 = $5,000

Actual costs:
  Material: $3,200
  Labor: $1,500
  Overhead: $800
  Total: $5,500

Variance: $500 unfavorable

Journal Entry:
  DR Finished Goods Inventory $5,000 (at standard)
  DR Manufacturing Variance $500
  CR Work in Process $5,500
```

---

## 11. Reporting y Analytics

### 11.1 Standard Cost Reports

#### Cost of Goods Manufactured (COGM)

```
Beginning WIP: $20,000
Direct Materials Used: $150,000
Direct Labor: $80,000
Manufacturing Overhead: $60,000
Total Manufacturing Costs: $290,000
Total WIP Available: $310,000
Ending WIP: ($25,000)
─────────────────────────────
Cost of Goods Manufactured: $285,000
```

#### Cost of Goods Sold (COGS)

```
Beginning Finished Goods: $30,000
Cost of Goods Manufactured: $285,000
Goods Available for Sale: $315,000
Ending Finished Goods: ($35,000)
─────────────────────────────
Cost of Goods Sold: $280,000
```

### 11.2 Variance Analysis

**Report Structure:**

| Product | Standard Cost | Actual Cost | Variance | Variance % |
|---------|---------------|-------------|----------|------------|
| Product A | $10,000 | $10,500 | $500 U | 5.0% |
| Product B | $15,000 | $14,200 | $800 F | 5.3% |
| Product C | $8,000 | $8,800 | $800 U | 10.0% |

**Breakdown by Type:**

| Variance Type | Amount | % |
|---------------|--------|---|
| Material Price | $300 U | |
| Material Usage | $200 F | |
| Labor Rate | $150 U | |
| Labor Efficiency | $100 F | |
| Overhead | $250 U | |
| **Total** | **$500 U** | |

### 11.3 Profitability Analysis

#### By Product

```sql
SELECT 
  p.product_name,
  SUM(s.quantity_sold) AS units_sold,
  SUM(s.revenue) AS total_revenue,
  SUM(s.quantity_sold * p.standard_cost) AS total_cogs,
  SUM(s.revenue) - SUM(s.quantity_sold * p.standard_cost) AS gross_profit,
  (SUM(s.revenue) - SUM(s.quantity_sold * p.standard_cost)) / SUM(s.revenue) * 100 AS gross_margin_pct
FROM sales s
JOIN products p ON s.product_id = p.product_id
WHERE s.sale_date BETWEEN '2024-01-01' AND '2024-12-31'
GROUP BY p.product_name
ORDER BY gross_profit DESC;
```

#### By Customer

```sql
SELECT 
  c.customer_name,
  SUM(s.revenue) AS total_revenue,
  SUM(s.cogs) AS total_cogs,
  SUM(s.revenue - s.cogs) AS gross_profit,
  COUNT(DISTINCT s.order_id) AS number_of_orders,
  SUM(s.revenue) / COUNT(DISTINCT s.order_id) AS avg_order_value
FROM sales s
JOIN customers c ON s.customer_id = c.customer_id
GROUP BY c.customer_name
HAVING SUM(s.revenue) > 10000
ORDER BY gross_profit DESC;
```

### 11.4 Dashboards y KPIs

#### Manufacturing KPIs

- **OEE** (Overall Equipment Effectiveness): Availability × Performance × Quality
- **First Pass Yield:** % of units produced right first time
- **Cycle Time:** Time from order to completion
- **Capacity Utilization:** Actual hours / Available hours

#### Retail KPIs

- **Inventory Turnover:** COGS / Avg Inventory
- **GMROI** (Gross Margin Return on Investment): Gross Margin $ / Avg Inventory Cost
- **Sell-Through Rate:** Units sold / Units received
- **Shrinkage %:** (Book inventory - Physical inventory) / Book inventory

#### Service KPIs

- **Utilization Rate:** Billable hours / Total hours
- **Realization Rate:** Revenue collected / Standard billing
- **Revenue per Employee:** Total revenue / # of employees
- **Project Margin:** (Revenue - Costs) / Revenue per project

---

## 12. Best Practices para Multi-Modelo

### 12.1 Modular Design

**Principle:** Separate concerns into independent modules.

**Architecture:**

```
Core Platform
├── Product Master (universal)
├── Inventory Management (universal)
├── GL Integration (universal)
└── Reporting Engine (universal)

Industry Modules (pluggable)
├── Manufacturing Module
│   ├── BOM
│   ├── Routings
│   └── Work Orders
├── Food Service Module
│   ├── Recipes
│   ├── Yield Management
│   └── Menu Engineering
└── Professional Services Module
    ├── Time Tracking
    ├── Project Management
    └── Resource Scheduling
```

**Benefits:**
- Enable/disable modules as needed
- Independent development
- Clear boundaries

### 12.2 Parameterization

**Principle:** Drive behavior through configuration, not code.

**Examples:**

**Costing Method:**
```json
{
  "product_id": "prod-123",
  "costing_config": {
    "method": "weighted_average",
    "recalculate_on_receipt": true,
    "negative_inventory_allowed": false
  }
}
```

**Overhead Allocation:**
```json
{
  "cost_center_id": "cc-manufacturing",
  "overhead_rules": [
    {
      "pool": "utilities",
      "driver": "machine_hours",
      "rate_type": "variable"
    },
    {
      "pool": "depreciation",
      "driver": "square_footage",
      "rate_type": "fixed"
    }
  ]
}
```

### 12.3 Audit Trail

**Requirements:**
- Who made the change
- When
- What changed (before/after)
- Why (optional comment)

**Implementation:**

```sql
CREATE TABLE audit_log (
  log_id UUID PRIMARY KEY,
  table_name VARCHAR(100),
  record_id UUID,
  action VARCHAR(20), -- 'INSERT', 'UPDATE', 'DELETE'
  user_id UUID,
  timestamp TIMESTAMP DEFAULT NOW(),
  
  -- Changes
  old_values JSONB,
  new_values JSONB,
  
  -- Context
  transaction_id UUID,
  comment TEXT
);
```

**Trigger Example (PostgreSQL):**

```sql
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_log (table_name, record_id, action, old_values, new_values)
    VALUES (TG_TABLE_NAME, OLD.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW));
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_log (table_name, record_id, action, new_values)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW));
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_log (table_name, record_id, action, old_values)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD));
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_products
AFTER INSERT OR UPDATE OR DELETE ON products
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

---

## 13. Implementation Strategy

### Phase 1: Foundation (Months 1-3)

**Objectives:**
- Core data model
- Single industry/module
- Basic reporting

**Deliverables:**
1. Product master
2. Inventory transactions
3. GL integration
4. One costing method (e.g., weighted average)
5. Basic cost reports

### Phase 2: Expand (Months 4-6)

**Objectives:**
- Add second industry module
- Advanced costing methods
- Overhead allocation

**Deliverables:**
1. Additional costing methods (FIFO, standard)
2. BOM/Recipe module
3. Cost center accounting
4. Variance tracking

### Phase 3: Optimize (Months 7-9)

**Objectives:**
- Multi-industry support
- Advanced analytics
- Integrations

**Deliverables:**
1. Third industry module
2. ABC costing
3. Profitability analysis
4. External integrations (POS, e-commerce, etc.)

### Phase 4: Scale (Months 10-12)

**Objectives:**
- Performance optimization
- Multi-entity support
- Advanced features

**Deliverables:**
1. Multi-company/multi-currency
2. Transfer pricing
3. Predictive analytics
4. Mobile apps

---

## 14. Casos de Uso

### Caso 1: Empresa Diversificada

**Company:** TechManufacture Group

**Divisions:**
1. **Electronics Manufacturing** (Job costing)
2. **Retail Stores** (Retail inventory method)
3. **IT Services** (Project-based costing)

**Implementation:**

```
Central ERP:
├── Shared: GL, AP, AR, Payroll
└── Division-Specific Modules:
    ├── Electronics: Manufacturing module, BOM, Work orders
    ├── Retail: POS integration, Retail inventory
    └── IT Services: Time tracking, Project management
```

**Consolidation:**

```sql
-- Consolidated P&L
SELECT 
  'Electronics' AS division,
  SUM(revenue) AS revenue,
  SUM(cogs) AS cogs,
  SUM(opex) AS opex,
  SUM(revenue - cogs - opex) AS net_income
FROM gl_transactions
WHERE profit_center_id IN (SELECT unit_id FROM organizational_units WHERE hierarchy_path LIKE '/company/electronics%')

UNION ALL

SELECT 
  'Retail' AS division,
  SUM(revenue),
  SUM(cogs),
  SUM(opex),
  SUM(revenue - cogs - opex)
FROM gl_transactions
WHERE profit_center_id IN (SELECT unit_id FROM organizational_units WHERE hierarchy_path LIKE '/company/retail%')

UNION ALL

SELECT 
  'IT Services' AS division,
  ...
```

---

### Caso 2: Restaurant Chain con Central Kitchen

**Company:** Fresh Bistro (10 locations + central kitchen)

**Model:**

```
Central Kitchen (Manufacturing):
├── Produces: Sauces, soups, prep items
├── Costing: Recipe costing with yield analysis
└── Transfers to locations at transfer price

Restaurant Locations (Retail + Service):
├── Receive: Prepared items from central kitchen
├── Purchase: Fresh ingredients locally
├── Costing: Recipe costing for final dishes
└── Revenue: POS integration
```

**Transfer Pricing:**

```
Central Kitchen:
  Recipe: Tomato Sauce (10L batch)
  Cost: $25.00
  Transfer price: $30.00 (cost + 20%)

Location receives:
  10L Tomato Sauce @ $30.00
  Uses in pasta dishes
  Recipe cost includes $30/10L = $3.00 per liter
```

**Profitability:**

```sql
-- Location profitability
SELECT 
  l.location_name,
  SUM(s.revenue) AS revenue,
  SUM(s.food_cost) AS food_cost,
  SUM(s.labor_cost) AS labor_cost,
  SUM(s.revenue - s.food_cost - s.labor_cost) AS contribution_margin
FROM sales s
JOIN locations l ON s.location_id = l.location_id
GROUP BY l.location_name;

-- Central kitchen profitability
SELECT 
  SUM(t.transfer_price * t.quantity) AS transfer_revenue,
  SUM(p.production_cost) AS production_cost,
  SUM((t.transfer_price * t.quantity) - p.production_cost) AS profit
FROM transfers t
JOIN production_batches p ON t.batch_id = p.batch_id;
```

---

## 15. Referencias y Fuentes

### ERP Vendors

1. **SAP**
   - SAP Help Portal: help.sap.com
   - SAP Controlling (CO) documentation

2. **Oracle**
   - Oracle Cloud documentation
   - Oracle Cost Management guides

3. **Microsoft Dynamics 365**
   - D365 Finance & Operations documentation
   - Cost accounting module guides

4. **Odoo**
   - Odoo documentation: odoo.com/documentation
   - GitHub: github.com/odoo/odoo

5. **NetSuite**
   - SuiteAnswers knowledge base
   - Implementation guides

### Libros

1. **Bragg, S. (2020).** *Cost Accounting Fundamentals*
   - Practical implementation
   - ERP considerations

2. **Horngren, C. et al. (2021).** *Cost Accounting: A Managerial Emphasis*
   - Theoretical foundation
   - Industry applications

3. **SAP Press** - Various titles on SAP CO module

### Standards

- **IFRS/GAAP:** Inventory and cost accounting standards
- **ISO 31000:** Risk management (for project costing)
- **PMI PMBOK:** Project cost management

---

## Notas de Implementación para G-Admin Mini

### Arquitectura Recomendada

**Stack:**
- **Backend:** Node.js / Python (FastAPI)
- **Database:** PostgreSQL (JSONB support)
- **Frontend:** React / Vue
- **Decimal precision:** Decimal.js (ya implementado ✓)

### Core Tables (Minimum Viable)

```sql
-- Products
CREATE TABLE products (...); -- As defined in section 6.1

-- Inventory Transactions
CREATE TABLE inventory_transactions (...);

-- Cost Layers (for FIFO/LIFO)
CREATE TABLE cost_layers (...);

-- BOM/Recipes
CREATE TABLE bom_headers (...);
CREATE TABLE bom_lines (...);

-- Jobs/Projects
CREATE TABLE jobs (...);

-- Cost Allocations
CREATE TABLE cost_allocations (...);

-- GL Integration
CREATE TABLE gl_mappings (...);
```

### Modules Prioritization

**Phase 1 (MVP):**
1. Product Master ✓ (parcialmente implementado)
2. Recipe Costing ✓ (parcialmente implementado)
3. Inventory Transactions
4. Basic COGS calculation

**Phase 2:**
1. Project/Job costing
2. Overhead allocation
3. Standard costing
4. Variance tracking

**Phase 3:**
1. Multi-currency
2. Multi-entity
3. Advanced analytics

---

**FIN DEL DOCUMENTO 06**

Total de líneas: ~2,300+  
Próximos documentos: **MATRIZ-CONCEPTOS-INDUSTRIAS.md** y **MANUAL-CONSOLIDADO.md**

---
