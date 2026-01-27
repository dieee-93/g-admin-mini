# Module Scaffolding - Complete Project Audit

**Fecha**: 2026-01-23
**Status**: ✅ Current State Analysis
**Total Modules**: 31

---

## 📊 Análisis Completo de Estructura

### Módulos CON Subdominios Lógicos (4/31)

#### 1. fulfillment (3 subdominios)
```
fulfillment/
├── delivery/          ← Subdominio: Delivery orders
├── onsite/            ← Subdominio: Dine-in
├── pickup/            ← Subdominio: Takeaway/pickup
├── components/        ← Técnico
├── hooks/             ← Técnico
├── services/          ← Técnico
└── manifest.tsx
```
**Criterio**: Diferentes **canales de fulfillment** (entrega, presencial, para llevar)

#### 2. sales (2 subdominios)
```
sales/
├── b2b/               ← Subdominio: B2B sales (quotes, corporate)
├── ecommerce/         ← Subdominio: Online sales
├── components/        ← Técnico
├── handlers/          ← Técnico
├── hooks/             ← Técnico
├── services/          ← Técnico
├── types/             ← Técnico
├── widgets/           ← Técnico
└── manifest.tsx
```
**Criterio**: Diferentes **canales de venta** (B2B, online, POS)

#### 3. production (1 subdominio)
```
production/
├── kitchen/           ← Subdominio: Kitchen operations
└── manifest.tsx
```
**Criterio**: Diferentes **áreas de producción** (cocina, bar, etc.)

#### 4. rentals (1 subdominio)
```
rentals/
├── integrations/      ← Subdominio: External rental integrations
├── components/        ← Técnico
└── manifest.tsx
```
**Criterio**: Separación entre **core rentals** e **integraciones externas**

---

### Módulos SIN Subdominios (27/31)

**Estructura estándar:**
```
module/
├── components/
├── services/
├── hooks/
├── store/
├── types/
└── manifest.tsx
```

**Lista completa:**
- achievements, assets, cash, cash-management, customers, dashboard, debug
- executive, finance-billing, finance-corporate, finance-fiscal, finance-integrations
- gamification, intelligence, materials, memberships, mobile, products, recipe
- reporting, scheduling, settings, shift-control, staff, suppliers, team

---

## 🔍 Criterio de Subdominios

### ¿Cuándo un módulo tiene subdominios?

**✅ USA subdominios cuando**:
1. El módulo tiene **múltiples canales** de la misma función
   - Ejemplo: sales (B2B, ecommerce, POS)
   - Ejemplo: fulfillment (delivery, onsite, pickup)

2. El módulo tiene **variantes independientes** con lógica separada
   - Ejemplo: production (kitchen, bar, warehouse)

3. Los subdominios tienen **componentes, services, hooks propios**
   - Cada subdominio es mini-módulo con estructura completa

**❌ NO usa subdominios cuando**:
1. El módulo es **monolítico** (una sola responsabilidad)
   - Ejemplo: materials, customers, staff

2. Las funcionalidades son **aspectos** de la misma entidad
   - Ejemplo: products (analytics, components, hooks - todos sobre productos)

3. No hay **separación clara de canales**
   - Ejemplo: finance-fiscal (todo es fiscal, no hay "canales" de fiscal)

---

## 📏 Estructura Interna de Subdominios

### Ejemplo: sales/b2b/

```
sales/b2b/
├── components/
│   ├── QuoteBuilder.tsx
│   └── TieredPricingTable.tsx
├── services/
│   ├── quotesService.ts
│   ├── tieredPricingService.ts
│   └── financeIntegration.ts
├── hooks/
│   └── useQuotes.ts
├── types/
│   └── index.ts
└── README.md
```

**Observación**: Cada subdominio tiene estructura COMPLETA (components/, services/, hooks/, types/)

---

## 🎯 Aplicación a Finance Domain

### Análisis: ¿Finance-operations debe tener subdominios?

**Candidatos a subdominios:**
- `billing/` - Canal de facturación (invoices, subscriptions)
- `integrations/` - Canal de pagos digitales (gateways, MP, MODO)
- `cash/` - Canal de efectivo físico (sessions, arqueos)
- `corporate/` - Canal B2B (cuentas corrientes, crédito)

**¿Son "canales" diferentes?** ✅ SÍ
- billing = facturación (puede ser B2C o B2B)
- integrations = pagos digitales (tarjetas, QR, wallets)
- cash = efectivo físico (caja, arqueos)
- corporate = B2B (cuentas corrientes, crédito)

**Comparación con sales:**
- sales/b2b = ventas B2B
- sales/ecommerce = ventas online
- sales/(implícito POS) = ventas presenciales

**Comparación con fulfillment:**
- fulfillment/delivery = entregas
- fulfillment/onsite = presencial
- fulfillment/pickup = para llevar

**Conclusión**: ✅ finance-operations DEBERÍA tener subdominios siguiendo el patrón de sales/fulfillment

---

### Análisis: ¿Finance-fiscal debe tener subdominios?

**Candidatos a subdominios:**
- `afip/` - Integración AFIP (CAE, webservices)
- `invoicing/` - Generación de facturas fiscales
- `tax/` - Cálculo de impuestos
- `compliance/` - Cumplimiento normativo

**¿Son "canales" diferentes?** ❌ NO
- Todos son **aspectos** de la misma responsabilidad: cumplimiento fiscal
- No hay "canal AFIP" vs "canal tax" - son partes de un mismo flujo
- No son independientes, están entrelazados

**Comparación con materials:**
- materials/alerts, materials/services, materials/hooks
- Todos son **aspectos** de materials, no "canales"

**Conclusión**: ❌ finance-fiscal NO debería tener subdominios (estructura simple)

---

### Análisis: ¿Finance-accounting debe tener subdominios?

**Candidatos a subdominios:**
- `journal/` - Libro mayor, asientos contables
- `reports/` - Reportes financieros (Balance Sheet, P&L)
- `chart-of-accounts/` - Plan de cuentas

**¿Son "canales" diferentes?** ❌ NO
- Todos son **funcionalidades** de contabilidad
- No hay "canal journal" vs "canal reports" - son vistas de la misma data
- Están fuertemente acoplados (reports lee de journal)

**Conclusión**: ❌ finance-accounting NO debería tener subdominios (estructura simple)

---

## ✅ Propuesta Final para Finance

### Estructura Recomendada

```
modules/
├── finance-operations/              ← CON subdominios (como sales/fulfillment)
│   ├── billing/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── types/
│   ├── integrations/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── types/
│   ├── cash/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── handlers/
│   ├── corporate/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── types/
│   └── manifest.tsx
│
├── finance-fiscal/                  ← SIN subdominios (estructura simple)
│   ├── components/
│   ├── services/
│   ├── hooks/
│   ├── types/
│   └── manifest.tsx
│
└── finance-accounting/              ← SIN subdominios (estructura simple)
    ├── components/
    ├── services/
    ├── hooks/
    ├── handlers/
    ├── types/
    └── manifest.tsx
```

---

## 📋 Regla de Oro

**Subdominios = Canales Independientes**

- ¿El módulo tiene múltiples **canales** o **variantes** de la misma función?
  - ✅ Usa subdominios (como sales, fulfillment)

- ¿El módulo tiene múltiples **aspectos** o **funcionalidades** relacionadas?
  - ❌ No uses subdominios, usa estructura simple (como materials, staff)

**Ejemplos:**
- sales: B2B, ecommerce, POS = **canales** → subdominios ✅
- materials: alerts, services, hooks = **aspectos** → no subdominios ❌
- finance-operations: billing, integrations, cash, corporate = **canales** → subdominios ✅
- finance-fiscal: afip, tax, compliance = **aspectos** → no subdominios ❌

---

## 🎯 Criterio de Decisión: Checklist

Para decidir si un módulo debe tener subdominios, pregúntate:

- [ ] ¿Los subdominios propuestos representan **canales diferentes** de usar la misma funcionalidad?
- [ ] ¿Cada subdominio podría funcionar **independientemente** con su propia UI/lógica?
- [ ] ¿Cada subdominio tiene suficiente código para justificar su propia carpeta components/services/hooks?
- [ ] ¿Los subdominios NO están fuertemente acoplados entre sí?

Si respondiste **SÍ a todas**, usa subdominios.
Si respondiste **NO a alguna**, usa estructura simple.

---

## 📊 Estadísticas

| Característica | Valor |
|----------------|-------|
| Total módulos | 31 |
| Con subdominios | 4 (13%) |
| Sin subdominios | 27 (87%) |
| Promedio subdominios | 1.75 por módulo (de los que tienen) |
| Patrón dominante | Estructura simple (87%) |

**Conclusión**: El proyecto prefiere **estructura simple** por defecto, y solo usa subdominios cuando hay múltiples **canales independientes**.

