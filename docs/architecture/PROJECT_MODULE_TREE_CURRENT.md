# Project Module Tree - Current State

**Fecha**: 2026-01-23
**Status**: Current Architecture Snapshot
**Total Modules**: 31

---

## 📊 Árbol Completo DOMINIO → MÓDULO

### 🏢 CORE Domain

```
core/
├── customers/              [Módulo independiente]
│   └── Sin subdominios
├── dashboard/              [Módulo independiente]
│   └── Sin subdominios
├── settings/               [Módulo independiente]
│   └── Sin subdominios
└── debug/                  [Módulo independiente]
    └── Sin subdominios
```

**Rutas**: `/admin/customers`, `/admin/dashboard`, `/admin/settings`, `/debug`

---

### 💰 FINANCE Domain

```
finance/
├── finance-billing/        [Módulo independiente]
│   └── Sin subdominios
├── finance-fiscal/         [Módulo independiente]
│   └── Sin subdominios
├── finance-integrations/   [Módulo independiente]
│   └── Sin subdominios
├── finance-corporate/      [Módulo independiente]
│   └── Sin subdominios
└── cash-management/        [Módulo independiente]
    └── Sin subdominios
```

**Rutas**:
- `/admin/finance/billing`
- `/admin/finance/fiscal`
- `/admin/finance/integrations`
- `/admin/finance/corporate`
- `/admin/finance/cash`

**Módulos sin domain metadata**:
- `cash/` - ❌ Sin domain, sin route (legacy?)

---

### 🔄 OPERATIONS Domain

```
operations/
├── sales/                  [Módulo con subdominios]
│   ├── b2b/               ← Subdominio lógico
│   ├── ecommerce/         ← Subdominio lógico
│   └── (POS implícito en components/)
│
├── fulfillment/            [Módulo con subdominios]
│   ├── delivery/          ← Subdominio lógico (tiene manifest!)
│   ├── onsite/            ← Subdominio lógico (tiene manifest!)
│   └── pickup/            ← Subdominio lógico (tiene manifest!)
│
├── production/             [Módulo con subdominios]
│   └── kitchen/           ← Subdominio lógico (tiene manifest!)
│
├── rentals/                [Módulo con subdominios]
│   └── integrations/      ← Subdominio lógico
│
├── memberships/            [Módulo independiente]
│   └── Sin subdominios
│
└── shift-control/          [Módulo independiente]
    └── Sin subdominios
```

**Rutas**:
- `/admin/operations/sales`
- `/admin/operations/fulfillment` + subpáginas
- `/admin/operations/kitchen`
- `/admin/operations/rentals`
- `/admin/operations/memberships`
- `/admin/operations/shift-control`

**⚠️ INCONSISTENCIA DETECTADA**:
- `fulfillment/delivery/manifest.tsx` existe (submódulo con manifest)
- `fulfillment/onsite/manifest.tsx` existe (submódulo con manifest)
- `fulfillment/pickup/manifest.tsx` existe (submódulo con manifest)
- **vs**
- `sales/b2b/` NO tiene manifest (solo carpeta organizacional)
- `sales/ecommerce/` NO tiene manifest (solo carpeta organizacional)

---

### 👥 RESOURCES Domain

```
resources/
├── staff/                  [Módulo independiente]
│   └── Sin subdominios
├── team/                   [Módulo independiente]
│   └── Sin subdominios
└── scheduling/             [Módulo independiente]
    └── Sin subdominios
```

**Rutas**:
- `/admin/resources/team` (staff y team apuntan a la misma ruta!)
- `/admin/resources/scheduling`

**⚠️ DUPLICACIÓN DETECTADA**: `staff/` y `team/` tienen la misma ruta

---

### 📦 SUPPLY-CHAIN Domain

```
supply-chain/
├── materials/              [Módulo independiente]
│   └── Sin subdominios
├── products/               [Módulo independiente]
│   ├── analytics/         ← Carpeta (no submodinio con manifest)
│   └── Sin subdominios lógicos
├── suppliers/              [Módulo independiente]
│   └── Sin subdominios
├── assets/                 [Módulo independiente]
│   └── Sin subdominios
└── recipe/                 [Módulo independiente]
    └── Sin subdominios
```

**Rutas**:
- `/admin/supply-chain/materials`
- `/admin/supply-chain/products`
- `/admin/supply-chain/suppliers`
- `/admin/supply-chain/assets`
- `/admin/supply-chain/recipes`

---

### 🎮 GAMIFICATION Domain

```
gamification/
├── gamification/           [Módulo independiente]
│   └── Sin subdominios
└── achievements/           [Módulo independiente]
    └── Sin subdominios (no tiene domain metadata)
```

**Rutas**:
- `/admin/gamification`

**⚠️ FALTA DOMAIN**: `achievements/` no tiene domain metadata

---

### 📊 REPORTING Domain

```
reporting/
├── reporting/              [Módulo independiente]
│   └── Sin subdominios
├── intelligence/           [Módulo independiente]
│   └── Sin subdominios
└── executive/              [Módulo independiente]
    └── Sin subdominios
```

**Rutas**:
- `/admin/reporting`
- `/admin/intelligence`
- `/admin/executive`

---

### 📱 MOBILE Domain

```
mobile/
└── mobile/                 [Módulo independiente]
    └── Sin subdominios (no tiene domain metadata)
```

**⚠️ FALTA ROUTE**: No tiene ruta definida

---

## 🔍 Problemas Detectados

### 1. ❌ Inconsistencia: Subdominios con vs sin manifest

**fulfillment/** tiene submódulos con manifest propio:
```
fulfillment/
├── manifest.tsx           ← Parent manifest
├── delivery/
│   └── manifest.tsx       ← Submodule manifest
├── onsite/
│   └── manifest.tsx       ← Submodule manifest
└── pickup/
    └── manifest.tsx       ← Submodule manifest
```

**sales/** tiene subdominios SIN manifest:
```
sales/
├── manifest.tsx           ← Solo este
├── b2b/                   ← Sin manifest
└── ecommerce/             ← Sin manifest
```

**¿Cuál es el patrón correcto?**

---

### 2. ❌ Duplicación: staff vs team

```
staff/manifest.tsx:   route: '/admin/resources/team'
team/manifest.tsx:    route: '/admin/resources/team'
```

Ambos apuntan a la misma ruta. ¿Son el mismo módulo duplicado?

---

### 3. ⚠️ Módulos sin domain metadata

- `cash/` - No tiene domain ni route (módulo legacy?)
- `achievements/` - No tiene domain
- `mobile/` - No tiene domain ni route
- `production/` - Parent no tiene domain (solo kitchen/ lo tiene)
- `fulfillment/delivery/` - No tiene domain (solo route)

---

### 4. ⚠️ Finance: 5 módulos + 1 legacy

**Activos**:
- finance-billing
- finance-fiscal
- finance-integrations
- finance-corporate
- cash-management

**Legacy?**:
- cash/ (sin route, sin domain)

**Pregunta**: ¿`cash/` es versión antigua de `cash-management/`?

---

### 5. ⚠️ Fulfillment: ¿Patrón correcto o sobre-engineered?

**fulfillment/** tiene 4 manifests:
1. `fulfillment/manifest.tsx` (parent)
2. `fulfillment/delivery/manifest.tsx`
3. `fulfillment/onsite/manifest.tsx`
4. `fulfillment/pickup/manifest.tsx`

**Pregunta**: ¿Realmente necesitan manifest separados o deberían ser como sales (carpetas organizacionales)?

---

## 📊 Estadísticas

| Característica | Cantidad |
|----------------|----------|
| Total módulos | 31 |
| Con subdominios lógicos | 5 (sales, fulfillment, production, rentals, products) |
| Subdominios con manifest | 3 (fulfillment submódulos, production/kitchen) |
| Sin domain metadata | 6 módulos |
| Duplicados (misma ruta) | 2 (staff/team) |

---

## 🎯 Preguntas para Reorganización

### 1. Finance Domain

**Situación actual**: 6 módulos (5 activos + 1 legacy)

**Opciones**:
- A. Mantener 5 módulos independientes (finance-*)
- B. Consolidar en 3 (operations, fiscal, accounting) según propuesta anterior
- C. Consolidar en 1 parent + submódulos

**¿Eliminar `cash/` legacy?** ¿Es duplicado de `cash-management/`?

---

### 2. Fulfillment vs Sales Pattern

**fulfillment**: Submódulos con manifest propio
**sales**: Subdominios sin manifest (carpetas organizacionales)

**Pregunta**: ¿Cuál es el estándar del proyecto?
- ¿Simplificar fulfillment (quitar manifests de submódulos)?
- ¿O agregar manifests a sales/b2b y sales/ecommerce?

---

### 3. Staff vs Team

**Situación**: 2 módulos con misma ruta `/admin/resources/team`

**Opciones**:
- Eliminar uno (¿cuál?)
- Consolidar en uno solo
- Diferenciar rutas

---

### 4. Módulos sin metadata

**Completar metadata para**:
- cash/
- achievements/
- mobile/
- production/ (parent)

---

### 5. Domain Naming

**¿Deberían los módulos tener prefijo del domain?**

**Opción A - Con prefijo** (como finance-*):
```
supply-chain-materials/
supply-chain-products/
supply-chain-suppliers/
operations-sales/
operations-fulfillment/
```

**Opción B - Sin prefijo** (actual):
```
materials/
products/
suppliers/
sales/
fulfillment/
```

**¿Cuál preferís?**

---

## 🔄 Próximo Paso

Antes de reorganizar finance, necesitamos:
1. Definir el patrón de submódulos (con o sin manifest)
2. Resolver duplicaciones (staff/team, cash/cash-management)
3. Decidir naming convention (con o sin prefijo domain)
4. Completar metadata faltante

**¿Por dónde empezamos?**

