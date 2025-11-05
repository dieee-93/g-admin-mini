# 🇦🇷 MEJORES PRÁCTICAS FISCALES MULTI-LOCATION - ARGENTINA

**Created**: 2025-01-15
**Research Date**: 2025-01-15
**Sources**: AFIP/ARCA (oficial), Contadores Públicos, Normativa vigente
**Status**: ✅ VERIFIED - Basado en investigación exhaustiva

---

## 📋 RESUMEN EJECUTIVO

### ✅ DECISIÓN RECOMENDADA: UN SOLO CUIT

**Para empresas con múltiples sucursales/locales en Argentina:**

✅ **CORRECTO**: Un solo CUIT para toda la empresa
✅ **CORRECTO**: Múltiples Puntos de Venta (PDV) - uno por sucursal
✅ **CORRECTO**: Reportes IVA consolidados
✅ **CORRECTO**: Mismo certificado AFIP para todos los PDV

❌ **INCORRECTO**: Un CUIT diferente por sucursal (excepto franquicias independientes)
❌ **INCORRECTO**: Usar el mismo PDV para todas las sucursales

---

## 🏛️ MARCO LEGAL Y NORMATIVO

### Regulación AFIP/ARCA

**Resoluciones relevantes:**
- **RG 4597**: Libro IVA Digital
- **RG 2485**: Facturación Electrónica
- **RG 3749**: Administración de Puntos de Venta

**Fuentes oficiales:**
- AFIP (ahora ARCA): https://www.afip.gob.ar
- Servicio "Administración de Puntos de Venta y Domicilios"
- Portal IVA: https://serviciosweb.afip.gob.ar

---

## 🏢 ESTRUCTURA FISCAL PARA MÚLTIPLES LOCALES

### Caso: Restaurante con 3 Sucursales

**Estructura correcta:**

```
Empresa: "LA PIZZERÍA S.A."
CUIT: 30-71234567-8 (UN SOLO CUIT)

├── Sucursal Palermo
│   ├── PDV: 00001
│   ├── Domicilio: Av. Santa Fe 1234, CABA
│   ├── Facturas: 00001-00000001, 00001-00000002, ...
│   └── Constancia de Inscripción: Con domicilio Palermo
│
├── Sucursal Belgrano
│   ├── PDV: 00002
│   ├── Domicilio: Av. Cabildo 5678, CABA
│   ├── Facturas: 00002-00000001, 00002-00000002, ...
│   └── Constancia de Inscripción: Con domicilio Belgrano
│
└── Sucursal Caballito
    ├── PDV: 00003
    ├── Domicilio: Av. Rivadavia 9012, CABA
    ├── Facturas: 00003-00000001, 00003-00000002, ...
    └── Constancia de Inscripción: Con domicilio Caballito
```

**Reportes IVA:**
- ✅ UN SOLO reporte consolidado mensual
- ✅ Incluye operaciones de los 3 PDV
- ✅ Se presenta con el CUIT 30-71234567-8
- ✅ Libro IVA Digital: Un archivo con todos los PDV

---

## 🔢 NUMERACIÓN DE FACTURAS ELECTRÓNICAS

### Formato Oficial AFIP

**Estructura de número de factura:**
```
[PDV: 5 dígitos] - [Número: 8 dígitos]
```

**Ejemplos reales:**

| Sucursal | PDV | Primera Factura | Décima Factura | Factura 1000 |
|----------|-----|-----------------|----------------|--------------|
| Palermo | 00001 | 00001-00000001 | 00001-00000010 | 00001-00001000 |
| Belgrano | 00002 | 00002-00000001 | 00002-00000010 | 00002-00001000 |
| Caballito | 00003 | 00003-00000001 | 00003-00000010 | 00003-00001000 |

**Características:**
- ✅ Numeración **INDEPENDIENTE** por cada PDV
- ✅ Numeración **CONSECUTIVA** dentro del mismo PDV
- ✅ Numeración **PROGRESIVA** (no se puede retroceder)
- ✅ Cada tipo de comprobante tiene su propia secuencia (A, B, C)

### Ejemplo Completo - Palermo PDV 00001

```
Factura A N° 00001-00000001  → Cliente: Empresa XYZ S.A.
Factura B N° 00001-00000001  → Cliente: Juan Pérez (monotributista)
Factura C N° 00001-00000001  → Cliente: Consumidor Final
Factura A N° 00001-00000002  → Cliente: Otra Empresa
Factura C N° 00001-00000002  → Cliente: Otro Consumidor Final
```

**Nota**: Factura A, B, C tienen secuencias independientes dentro del mismo PDV.

---

## 📊 REPORTES FISCALES CONSOLIDADOS

### Libro IVA Digital (RG 4597)

**Cómo funciona:**

1. **Un solo reporte por CUIT**
   - Se presenta mensualmente
   - Incluye todas las operaciones de todos los PDV
   - Formato: Archivo digital en Portal IVA

2. **Identificación de sucursales**
   - Cada operación incluye el PDV donde se emitió
   - Campo "Punto de Venta" en cada registro
   - Ejemplo de registro:
     ```
     PDV: 00001, Comprobante: A, Número: 00000123, ...
     PDV: 00002, Comprobante: B, Número: 00000045, ...
     PDV: 00003, Comprobante: C, Número: 00000789, ...
     ```

3. **Ventajas del consolidado**
   - ✅ Simplificación administrativa
   - ✅ Un solo contador puede manejar todo
   - ✅ Visión global del negocio
   - ✅ Menor costo de cumplimiento

### Declaración Jurada IVA

**Proceso mensual:**

```
1. Recopilar datos de los 3 PDV
   ├── Ventas Palermo (PDV 00001): $500,000
   ├── Ventas Belgrano (PDV 00002): $650,000
   └── Ventas Caballito (PDV 00003): $400,000

2. Consolidar en Portal IVA
   ├── Total Ventas: $1,550,000
   ├── IVA Débito Fiscal: $325,500 (21%)
   ├── IVA Crédito Fiscal: $120,000 (compras)
   └── Saldo a pagar: $205,500

3. Presentar DJ con CUIT 30-71234567-8
   └── Vencimiento: Según terminación CUIT
```

**Documentación de respaldo:**
- Libro IVA Ventas (con detalle de PDV)
- Libro IVA Compras (con detalle de PDV si aplica)
- Facturas emitidas por cada PDV
- Comprobantes de compra asignados a cada PDV

---

## 🔧 CONFIGURACIÓN AFIP PASO A PASO

### 1. Registro de Domicilios

**Servicio**: Sistema Registral

**Pasos:**
1. Ingresar con Clave Fiscal (nivel 3 mínimo)
2. Ir a "Sistema Registral"
3. Agregar cada domicilio comercial:
   - Domicilio Palermo: Av. Santa Fe 1234, CABA
   - Domicilio Belgrano: Av. Cabildo 5678, CABA
   - Domicilio Caballito: Av. Rivadavia 9012, CABA
4. Esperar 3 días hábiles para que se activen

### 2. Alta de Puntos de Venta

**Servicio**: "Administración de Puntos de Venta y Domicilios"

**Pasos por cada PDV:**
```
1. Ingresar con Clave Fiscal
2. Seleccionar "Administración de Puntos de Venta y Domicilios"
3. Opción A/B/M (Alta, Baja, Modificación)
4. Seleccionar "Alta de Punto de Venta"
5. Completar:
   ├── Número PDV: 00001 (asignado automáticamente)
   ├── Nombre fantasía: "Sucursal Palermo" (opcional)
   ├── Domicilio asociado: Seleccionar Av. Santa Fe 1234
   └── Sistema: Facturación Electrónica
6. Confirmar
7. Repetir para PDV 00002 (Belgrano) y 00003 (Caballito)
```

### 3. Configuración Facturación Electrónica

**Servicio**: Facturación Electrónica

**Requisitos:**
- ✅ Clave Fiscal nivel 3
- ✅ Servicio "Comprobantes en línea" habilitado
- ✅ Certificado digital AFIP (si se usa API)

**Para cada PDV:**
1. Configurar sistema de facturación (POS)
2. Asociar certificado AFIP (mismo para todos)
3. Configurar PDV en el software:
   - Palermo POS → PDV 00001
   - Belgrano POS → PDV 00002
   - Caballito POS → PDV 00003
4. Probar emisión de factura electrónica
5. Solicitar CAE (Código de Autorización Electrónica)

### 4. Obtención de CAE

**Proceso por factura:**

```
Al emitir factura en Palermo:
1. Cliente: María González
2. Tipo: Factura C (consumidor final)
3. PDV: 00001
4. Número: Automático (ej: 00001-00000123)
5. Total: $2,500.00
6. Sistema envía a AFIP:
   ├── CUIT emisor: 30-71234567-8
   ├── PDV: 00001
   ├── Tipo comprobante: C
   ├── Número: 00000123
   └── Importe: $2,500.00
7. AFIP responde:
   ├── CAE: 74125896321547
   ├── Vencimiento CAE: 2025-01-25
   └── Estado: Aprobado
8. Se imprime factura con CAE
```

---

## 📜 CONSTANCIAS Y DOCUMENTACIÓN REQUERIDA

### Por Cada Sucursal (Obligatorio)

**1. Constancia de Inscripción**
- Descargar de AFIP con domicilio de la sucursal
- Actualizar cada 30 días
- Exhibir en lugar visible

**2. Formulario 960/Data Fiscal**
- Código QR con datos fiscales
- Imprimir en tamaño A4
- Exhibir en zona de cajas
- Contenido:
  ```
  CUIT: 30-71234567-8
  Razón Social: LA PIZZERÍA S.A.
  Domicilio: [Domicilio de la sucursal]
  Condición IVA: Responsable Inscripto
  Inicio Actividades: [Fecha]
  ```

**3. Libro Rubricado (si aplica)**
- Solo si no se usa facturación electrónica
- Para gastronomía con FE obligatoria: NO necesario

**4. Habilitación Municipal**
- Cada sucursal necesita habilitación del municipio
- Renovación anual
- Inspecciones de Bromatología (gastronomía)

---

## 💰 ASPECTOS CONTABLES

### Estructura de Cuentas Contables

**Sugerencia para contador público:**

```
Plan de Cuentas con discriminación por sucursal:

41.01.001 - Ventas Palermo (PDV 00001)
41.01.002 - Ventas Belgrano (PDV 00002)
41.01.003 - Ventas Caballito (PDV 00003)

21.01.001 - IVA Débito Fiscal Palermo
21.01.002 - IVA Débito Fiscal Belgrano
21.01.003 - IVA Débito Fiscal Caballito

11.02.001 - Inventario Palermo
11.02.002 - Inventario Belgrano
11.02.003 - Inventario Caballito
```

### Reportes Internos Recomendados

**Mensuales:**
- P&L por sucursal
- Ventas por sucursal y PDV
- Margen bruto por sucursal
- Costos operativos por sucursal
- Comparativa entre sucursales

**Consolidados:**
- Balance general consolidado
- Estado de resultados consolidado
- Flujo de efectivo consolidado
- Declaración jurada IVA consolidada

---

## ⚠️ ERRORES COMUNES A EVITAR

### ❌ ERROR 1: Usar el mismo PDV para todas las sucursales
**Problema**: Numeración duplicada, imposible identificar origen
**Solución**: Un PDV diferente por sucursal

### ❌ ERROR 2: No registrar domicilios en Sistema Registral
**Problema**: No se pueden habilitar PDV
**Solución**: Registrar todos los domicilios con 3 días de anticipación

### ❌ ERROR 3: Confundir PDV con número de factura
**Problema**: Errores en la facturación
**Ejemplo**:
  - ❌ Incorrecto: Factura N° 1-123 (sin ceros)
  - ✅ Correcto: Factura N° 00001-00000123

### ❌ ERROR 4: No actualizar Constancia de Inscripción
**Problema**: Multas en inspecciones
**Solución**: Actualizar cada 30 días y exhibir en lugar visible

### ❌ ERROR 5: Saltear números de factura
**Problema**: Observaciones de AFIP
**Solución**: Numeración consecutiva obligatoria

### ❌ ERROR 6: No diferenciar por tipo de comprobante (A/B/C)
**Problema**: Secuencias mezcladas
**Solución**: Cada tipo tiene su propia secuencia dentro del PDV

---

## 🎯 RESPUESTAS A LAS 7 PREGUNTAS CRÍTICAS

### ✅ Q1: ¿Mismo CUIT o CUITs diferentes?

**RESPUESTA RECOMENDADA: MISMO CUIT (Opción A)**

**Fundamento:**
- Es la práctica estándar en Argentina para empresas con sucursales
- Una sola persona jurídica = Un solo CUIT
- Reportes fiscales consolidados (más simple)
- Menor costo administrativo
- Visión unificada del negocio

**Excepción (CUIT diferente):**
- Solo si son empresas legalmente independientes
- Franquicias con distintos propietarios
- Filiales (sociedades diferentes)

**Para G-Admin Mini:**
```typescript
// Configuración recomendada
interface AFIPConfiguration {
  cuit: string;                    // MISMO para todas las locations
  certificate_path: string;        // MISMO certificado
  private_key_path: string;        // MISMA clave
  environment: 'testing' | 'production';

  // POR LOCATION:
  location_id: string;
  punto_venta: number;             // DIFERENTE (1, 2, 3, ...)
  location_name: string;
  location_address: string;
}
```

---

### ✅ Q2: ¿Ya tienen PDVs registrados?

**ESCENARIOS:**

**A. Negocio nuevo (no tienen PDVs):**
1. Registrar domicilios en Sistema Registral
2. Esperar 3 días hábiles
3. Dar de alta PDV 00001, 00002, 00003
4. Configurar sistema de facturación

**B. Ya tienen un PDV (local único actualmente):**
1. PDV existente (ej: 00001) → Sucursal principal
2. Registrar nuevos domicilios
3. Dar de alta PDV 00002, 00003 para nuevas sucursales
4. Mantener numeración existente del PDV 00001

**C. Ya tienen múltiples PDV:**
1. Verificar mapeo actual: PDV → Domicilio
2. Actualizar información en AFIP si cambió algo
3. Documentar mapeo en sistema G-Admin Mini

**Para G-Admin Mini:**
```typescript
// Tabla: locations
{
  id: '...',
  name: 'Palermo',
  code: 'PAL',
  punto_venta_afip: 1,      // ← PDV asignado en AFIP
  domicilio_afip: 'Av. Santa Fe 1234, CABA',
  is_main: true
}
```

---

### ✅ Q3: ¿Ubicación del Location Selector?

**RESPUESTA RECOMENDADA: GLOBAL EN NAVBAR (Opción A)**

**Fundamento:**
- Consistencia UX
- Una sola selección para toda la sesión
- Menos decisiones cognitivas para el usuario
- Más simple de implementar

**Implementación:**
```tsx
<Navbar>
  <Logo />
  <LocationSelector />  {/* Solo visible si multi_location capability activa */}
  <UserMenu />
</Navbar>

// LocationContext persiste la selección:
localStorage.setItem('selected_location_id', locationId);
```

**Excepciones (selector adicional per-module):**
- Dashboard: Toggle "Vista consolidada" vs "Location actual"
- Reportes: Opción de generar reporte multi-location

---

### ✅ Q4: ¿Modo default al abrir sistema?

**RESPUESTA RECOMENDADA: ÚLTIMA LOCATION + FALLBACK A ALL**

**Lógica:**
```typescript
const getDefaultLocation = () => {
  // 1. Try última location del usuario
  const lastLocationId = localStorage.getItem('selected_location_id');
  if (lastLocationId && locationExists(lastLocationId)) {
    return lastLocationId;
  }

  // 2. Try location principal del usuario (si está asignado)
  if (currentUser.primary_location_id) {
    return currentUser.primary_location_id;
  }

  // 3. Fallback: "All Locations" (vista consolidada)
  return null; // null = All Locations
};
```

**Ventaja:**
- Usuario retoma donde quedó
- Menos friction al empezar
- Vista consolidada disponible siempre

---

### ✅ Q5: ¿Empleados trabajan en múltiples locales?

**RESPUESTA RECOMENDADA: PRIMARY LOCATION (simple)**

**Fundamento:**
- La mayoría del staff es fijo en una location
- Más simple administrativamente
- Costos laborales claros por location

**Schema:**
```sql
ALTER TABLE employees
  ADD COLUMN primary_location_id UUID REFERENCES locations(id);

-- Para casos excepcionales (gerente regional):
CREATE TABLE employee_locations (
  employee_id UUID REFERENCES employees(id),
  location_id UUID REFERENCES locations(id),
  role VARCHAR(100),  -- "manager", "support", etc.
  PRIMARY KEY (employee_id, location_id)
);
```

**Uso:**
- 95% de casos: Solo `primary_location_id`
- 5% de casos (gerentes, encargados regionales): Usar `employee_locations`

---

### ✅ Q6: ¿Productos disponibles solo en algunos locales?

**RESPUESTA RECOMENDADA: PRODUCTOS GLOBALES, INVENTARIO POR LOCATION**

**Fundamento:**
- Menú es el mismo en todas las sucursales (típico en gastronomía)
- Solo varía el stock/inventario disponible
- Más simple de mantener

**Schema:**
```sql
-- products table: SIN location_id (global)
CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(200),
  price NUMERIC(10, 2),
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true
);

-- stock_entries: CON location_id (por sucursal)
ALTER TABLE stock_entries
  ADD COLUMN location_id UUID REFERENCES locations(id);

-- Vista de disponibilidad:
SELECT
  p.name,
  l.name AS location,
  COALESCE(SUM(se.quantity), 0) AS stock_available
FROM products p
CROSS JOIN locations l
LEFT JOIN stock_entries se ON se.product_id = p.id AND se.location_id = l.id
GROUP BY p.id, l.id;
```

**Caso excepcional (productos únicos por location):**
```sql
-- Solo si es necesario:
CREATE TABLE product_locations (
  product_id UUID REFERENCES products(id),
  location_id UUID REFERENCES locations(id),
  is_available BOOLEAN DEFAULT true,
  PRIMARY KEY (product_id, location_id)
);
```

---

### ✅ Q7: ¿Transferencias de inventario entre locales?

**RESPUESTA RECOMENDADA: SÍ (feature útil)**

**Fundamento:**
- Optimizar stock entre sucursales
- Evitar rupturas de stock
- Aprovechar compras consolidadas

**Schema:**
```sql
CREATE TABLE inventory_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Origin & Destination
  from_location_id UUID NOT NULL REFERENCES locations(id),
  to_location_id UUID NOT NULL REFERENCES locations(id),

  -- Transfer details
  transfer_number VARCHAR(50) UNIQUE,  -- TR-2025-001
  transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'pending',  -- pending, in_transit, completed, cancelled

  -- Items
  items JSONB NOT NULL,  -- [{ material_id, quantity, unit_cost }]

  -- Tracking
  requested_by UUID REFERENCES employees(id),
  approved_by UUID REFERENCES employees(id),
  completed_at TIMESTAMPTZ,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT different_locations CHECK (from_location_id != to_location_id)
);
```

**UI en Materials module:**
```tsx
<Tabs>
  <Tab>Inventory</Tab>
  <Tab>Analytics</Tab>
  <Tab>Transfers</Tab>  {/* 🆕 NEW TAB */}
</Tabs>

// Botón en toolbar:
<Button onClick={openTransferModal}>
  <Icon icon={ArrowsRightLeftIcon} />
  Transfer Stock
</Button>
```

---

## 📚 RECURSOS Y CONTACTOS

### Documentación Oficial AFIP/ARCA

- **Portal principal**: https://www.afip.gob.ar
- **Facturación electrónica**: https://www.afip.gob.ar/fe/
- **Libro IVA Digital**: https://www.afip.gob.ar/libro-iva-digital/
- **Consultas frecuentes**: https://servicioscf.afip.gob.ar/publico/abc/

### Servicios Web AFIP

- **Mis Aplicaciones Web**: https://serviciosweb.afip.gob.ar
- **Portal IVA**: Para presentación DJ IVA
- **Sistema Registral**: Para domicilios
- **Comprobantes en línea**: Para facturación manual

### Asistencia Profesional

**RECOMENDACIÓN CRÍTICA:**
Contratar un Contador Público matriculado con experiencia en:
- Gastronomía multi-local
- Facturación electrónica AFIP
- Libro IVA Digital
- Asesoramiento mensual en declaraciones juradas

**Costo estimado**: $80,000 - $150,000 ARS/mes (según complejidad)

---

## 🚀 ROADMAP DE IMPLEMENTACIÓN FISCAL

### Paso 1: Preparación Legal (Semana 1)
- [ ] Contratar contador público
- [ ] Verificar inscripción CUIT vigente
- [ ] Obtener Clave Fiscal nivel 3
- [ ] Registrar domicilios en Sistema Registral

### Paso 2: Alta de PDV (Semana 2)
- [ ] Esperar 3 días hábiles (domicilios)
- [ ] Dar de alta PDV 00001, 00002, 00003
- [ ] Documentar mapeo: Location → PDV
- [ ] Obtener Constancias de Inscripción por domicilio

### Paso 3: Configuración Sistema (Semana 3)
- [ ] Implementar tabla `locations` en DB
- [ ] Agregar `location_id` + `punto_venta` a `invoices`
- [ ] Actualizar `afip_configuration` con PDV
- [ ] Configurar LocationContext en frontend

### Paso 4: Testing Fiscal (Semana 4)
- [ ] Probar emisión de factura en cada PDV
- [ ] Verificar CAE por cada PDV
- [ ] Validar numeración correlativa
- [ ] Probar reportes consolidados

### Paso 5: Go Live (Semana 5)
- [ ] Capacitar staff en cada sucursal
- [ ] Exhibir Formulario 960 en cajas
- [ ] Activar facturación electrónica en producción
- [ ] Monitorear primeros reportes IVA

---

## ✅ DECISIONES FINALES PARA G-ADMIN MINI

| Pregunta | Decisión | Fundamento |
|----------|----------|------------|
| **Q1: CUIT** | ✅ Mismo CUIT | Práctica estándar Argentina, reportes consolidados |
| **Q2: PDVs** | Registrar nuevos | Un PDV por location, numeración independiente |
| **Q3: Selector** | ✅ Global navbar | Consistencia UX, selección persistente |
| **Q4: Default** | ✅ Última + fallback | Menor friction, retoma donde quedó |
| **Q5: Empleados** | ✅ Primary location | Simple, cubre 95% de casos |
| **Q6: Productos** | ✅ Globales | Menú unificado, stock por location |
| **Q7: Transfers** | ✅ Sí | Optimización de stock, feature útil |

---

## 🎯 IMPLEMENTACIÓN EN CÓDIGO

### Database Schema Final

```sql
-- 1. locations table
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,

  -- AFIP Data
  punto_venta_afip INTEGER UNIQUE NOT NULL,  -- 1, 2, 3, ...
  domicilio_afip TEXT NOT NULL,

  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Argentina',
  is_active BOOLEAN DEFAULT true,
  is_main BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. invoices (CRÍTICO para AFIP)
ALTER TABLE invoices
  ADD COLUMN location_id UUID REFERENCES locations(id),
  ADD COLUMN punto_venta INTEGER NOT NULL,
  ADD CONSTRAINT unique_invoice_per_location
    UNIQUE (location_id, punto_venta, invoice_number);

CREATE INDEX idx_invoices_location ON invoices(location_id);
CREATE INDEX idx_invoices_pdv ON invoices(punto_venta);

-- 3. afip_configuration (uno por location)
ALTER TABLE afip_configuration
  ADD COLUMN location_id UUID UNIQUE REFERENCES locations(id);

-- 4. sales
ALTER TABLE sales
  ADD COLUMN location_id UUID REFERENCES locations(id);

-- 5. stock_entries
ALTER TABLE stock_entries
  ADD COLUMN location_id UUID REFERENCES locations(id);

-- 6. employees
ALTER TABLE employees
  ADD COLUMN primary_location_id UUID REFERENCES locations(id);

-- 7. inventory_transfers
CREATE TABLE inventory_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_location_id UUID NOT NULL REFERENCES locations(id),
  to_location_id UUID NOT NULL REFERENCES locations(id),
  transfer_number VARCHAR(50) UNIQUE,
  status VARCHAR(50) DEFAULT 'pending',
  items JSONB NOT NULL,
  requested_by UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT different_locations CHECK (from_location_id != to_location_id)
);
```

---

**STATUS**: ✅ **INVESTIGACIÓN COMPLETA** - Listo para implementar

**Próximo Paso**: Implementar Phase 1 (Foundation) con estas decisiones validadas

**Confidencia**: Alta - Basado en normativa oficial AFIP/ARCA vigente 2025
