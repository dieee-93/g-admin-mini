# Fundamentos de Costeo: Teoría y Métodos

> Investigación exhaustiva sobre principios fundamentales de contabilidad de costos aplicables a sistemas ERP multi-modelo

**Fecha**: 2025-01-05  
**Versión**: 1.0  
**Estado**: ✅ Completado

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Teoría General de Costos](#teoría-general-de-costos)
3. [Tipos de Costos](#tipos-de-costos)
4. [Métodos de Valuación de Inventario](#métodos-de-valuación-de-inventario)
5. [Sistemas de Costeo](#sistemas-de-costeo)
6. [Cost Pools y Cost Drivers](#cost-pools-y-cost-drivers)
7. [Elementos del Costo](#elementos-del-costo)
8. [Ejemplos Prácticos](#ejemplos-prácticos)
9. [Aplicabilidad por Industria](#aplicabilidad-por-industria)
10. [Referencias](#referencias)

---

## Introducción

La contabilidad de costos es una rama de la gestión financiera que ayuda a las organizaciones a rastrear y evaluar los gastos incurridos para crear productos o entregar servicios. A diferencia de la contabilidad financiera que produce estados financieros para evaluación externa, la contabilidad de costos se utiliza exclusivamente para decisiones de gestión interna.

### Objetivos Principales

1. **Determinar costos reales** de productos o servicios
2. **Proveer datos** para presupuestación y planificación
3. **Soportar decisiones** de pricing
4. **Identificar áreas** para reducción de costos
5. **Medir eficiencia** operativa
6. **Informar decisiones** estratégicas

### Contexto Histórico

El costeo moderno emergió durante la Revolución Industrial (1880s) cuando las empresas necesitaron mejores formas de rastrear costos de manufactura y mejorar eficiencia:

- **1880s**: Introducción de principios de gestión científica
- **1900s**: Desarrollo de métodos de costeo estándar
- **1950-1960s**: Auge del análisis costo-volumen-beneficio
- **1980-1990s**: Introducción de ABC (Activity-Based Costing) y lean accounting
- **Actualidad**: Integración con tecnologías digitales y análisis en tiempo real

---

## Teoría General de Costos

### Definición de Costo

Un **costo** es un recurso económico sacrificado o renunciado para alcanzar un objetivo específico. En el contexto empresarial, representa el valor monetario de recursos consumidos en la producción de bienes o prestación de servicios.

### Principios Fundamentales

#### 1. Causalidad
Los costos deben poder relacionarse con sus causas (actividades, productos, servicios).

#### 2. Rastreabilidad (Traceability)
Capacidad de vincular costos directamente con objetos de costo específicos.

#### 3. Consistencia
Los métodos de costeo deben aplicarse de forma consistente período tras período (requerimiento GAAP).

#### 4. Relevancia
Solo costos relevantes para la decisión deben considerarse en el análisis.

### Jerarquía de Costos

```
Total de Costos de la Empresa
│
├─ Costos Directos
│  ├─ Materiales Directos
│  └─ Mano de Obra Directa
│
└─ Costos Indirectos (Overhead)
   ├─ Costos Indirectos de Fabricación (CIF)
   ├─ Gastos Administrativos
   └─ Gastos de Ventas
```

---

## Tipos de Costos

### 1. Costos Fijos (Fixed Costs)

**Definición**: Costos que permanecen constantes independientemente del nivel de producción o actividad del negocio.

**Características**:
- No varían con cambios en volumen de producción (en el corto plazo)
- Deben pagarse independientemente de si la empresa genera beneficios
- El costo fijo por unidad **disminuye** cuando aumenta la producción (economías de escala)

**Ejemplos Comunes**:
- Renta o arrendamiento de edificios/equipos
- Primas de seguro
- Impuestos sobre la propiedad
- Depreciación de equipos
- Salarios de personal permanente
- Servicios profesionales (legal, contable) con retainer

**Fórmula**:
```
Costo Fijo Total = Constante (independiente del volumen)
Costo Fijo por Unidad = Costo Fijo Total / Unidades Producidas
```

**Ejemplo Numérico**:
```
Renta mensual: $10,000

Producción de 100 unidades:
- Costo fijo total: $10,000
- Costo fijo por unidad: $10,000 / 100 = $100/unidad

Producción de 1,000 unidades:
- Costo fijo total: $10,000
- Costo fijo por unidad: $10,000 / 1,000 = $10/unidad
```

---

### 2. Costos Variables (Variable Costs)

**Definición**: Costos que cambian en proporción directa al nivel de producción o actividad del negocio.

**Características**:
- Aumentan o disminuyen con el volumen de producción
- El costo variable **por unidad** permanece relativamente constante
- En producción cero, el costo variable es cero

**Ejemplos Comunes**:
- Materias primas e insumos
- Mano de obra por pieza/hora (piece-rate labor)
- Utilidades vinculadas a producción (electricidad, agua en planta)
- Comisiones de ventas
- Embalaje
- Costos de envío/distribución

**Fórmula**:
```
Costo Variable Total = Costo Variable por Unidad × Cantidad Producida
Costo Variable por Unidad = Constante
```

**Ejemplo Numérico**:
```
Costo de materias primas por unidad: $5

Producción de 100 unidades:
- Costo variable total: $5 × 100 = $500
- Costo variable por unidad: $5

Producción de 1,000 unidades:
- Costo variable total: $5 × 1,000 = $5,000
- Costo variable por unidad: $5
```

---

### 3. Costos Semi-Variables (Mixed Costs)

**Definición**: Costos que contienen componentes tanto fijos como variables.

**Ejemplos**:
- Factura eléctrica (cargo fijo base + consumo variable)
- Salarios con comisiones (sueldo base fijo + % de ventas)
- Costos de telefonía (plan base + minutos adicionales)

**Fórmula**:
```
Costo Semi-Variable = Componente Fijo + (Costo Variable por Unidad × Cantidad)
```

---

### 4. Costos Directos vs Costos Indirectos

#### Costos Directos

**Definición**: Costos que pueden ser rastreados directamente a un producto, servicio o centro de costos específico.

**Ejemplos**:
- Madera para fabricar una silla
- Tela para confeccionar un vestido
- Horas de trabajo de un carpintero en un mueble específico
- Componentes electrónicos de un smartphone

**Ejemplo Práctico** (Manufactura de Sillas):
```
Silla Individual:
- Madera: $50
- Tornillos y herrajes: $10
- Horas de carpintero (5h @ $20/h): $100
Total Costo Directo: $160
```

#### Costos Indirectos (Overhead)

**Definición**: Costos que benefician a la organización en general y no pueden rastrearse directamente a un producto específico.

**Ejemplos**:
- Salarios administrativos y gerenciales
- Depreciación de edificio de fábrica
- Mantenimiento de equipos
- Control de calidad
- Seguro de planta
- Supervisión general

**Nota Importante**: La clasificación directa/indirecta depende del **objeto de costo** en consideración.

---

### 5. Costos del Producto vs Costos del Período

#### Costos del Producto

Costos que se incorporan al inventario y se convierten en **COGS** (Cost of Goods Sold) cuando el producto se vende.

**Incluye**:
- Materiales directos
- Mano de obra directa
- Overhead de manufactura (fijo y variable)

#### Costos del Período

Gastos que se reconocen en el período en que se incurren, sin importar cuándo se venden los productos.

**Incluye**:
- Gastos de venta y marketing
- Gastos administrativos
- Investigación y desarrollo (en algunos casos)

---

### 6. Costos Hundidos (Sunk Costs)

**Definición**: Costos que ya se han incurrido y no pueden recuperarse.

**Principio Fundamental**: Los costos hundidos **NO deben** considerarse en decisiones futuras.

**Ejemplo**:
```
Situación: Empresa compró máquina por $100,000 hace 2 años

Decisión actual: ¿Reemplazar con nueva máquina?

Análisis CORRECTO:
✅ Comparar: Costos operativos de máquina actual vs nueva
✅ Considerar: Valor de rescate de máquina actual
❌ NO considerar: Los $100,000 ya gastados (sunk cost)
```

---

## Métodos de Valuación de Inventario

La valuación de inventario es crítica pues afecta tanto el **COGS** como el **valor del inventario final** en el balance.

### 1. FIFO (First In, First Out)

**Principio**: Los primeros artículos comprados/producidos son los primeros en venderse.

**Características**:
- El inventario final refleja **costos más recientes**
- En inflación, resulta en **menor COGS** y **mayor utilidad neta**
- Requerido por IFRS en muchas jurisdicciones
- Sigue el flujo natural de inventario en muchos negocios

**Ejemplo**:

```
Compras:
1 Ene:  100 unidades @ $10 = $1,000
15 Ene: 150 unidades @ $12 = $1,800
30 Ene: 200 unidades @ $15 = $3,000

Ventas: 250 unidades en febrero

COGS (FIFO):
- Primeras 100 unidades @ $10 = $1,000
- Siguientes 150 unidades @ $12 = $1,800
Total COGS = $2,800

Inventario Final:
- 200 unidades @ $15 = $3,000
Valor del inventario = $3,000
```

**Ventajas**:
- ✅ Refleja el flujo real de inventario
- ✅ Inventario valorado a costos actuales
- ✅ Fácil de entender
- ✅ Aceptado internacionalmente

**Desventajas**:
- ❌ Puede sobrestimar utilidades en inflación
- ❌ Mayor carga impositiva potencial

---

### 2. LIFO (Last In, First Out)

**Principio**: Los últimos artículos comprados/producidos son los primeros en venderse.

**Características**:
- El inventario final refleja **costos más antiguos**
- En inflación, resulta en **mayor COGS** y **menor utilidad neta**
- Permitido en US GAAP pero **prohibido** por IFRS
- Ventaja fiscal en ambientes inflacionarios

**Ejemplo** (mismos datos que FIFO):

```
COGS (LIFO):
- Primeras 200 unidades @ $15 = $3,000
- Siguientes 50 unidades @ $12 = $600
Total COGS = $3,600

Inventario Final:
- 100 unidades @ $10 = $1,000
- 100 unidades @ $12 = $1,200
Valor del inventario = $2,200
```

**Comparación FIFO vs LIFO**:
```
                    FIFO        LIFO
COGS                $2,800      $3,600
Inventario Final    $3,000      $2,200
Utilidad Neta       Mayor       Menor
Impuestos           Mayores     Menores
```

---

### 3. Costo Promedio Ponderado (Weighted Average Cost)

**Principio**: Asignar un costo promedio a todas las unidades disponibles para venta.

**Fórmula**:
```
Costo Promedio = Costo Total de Inventario Disponible / Unidades Totales Disponibles
```

**Ejemplo** (mismos datos):

```
Total Inventory Cost: $1,000 + $1,800 + $3,000 = $5,800
Total Units: 100 + 150 + 200 = 450 unidades

Costo Promedio = $5,800 / 450 = $12.89 por unidad

COGS (250 unidades vendidas):
250 × $12.89 = $3,222.50

Inventario Final (200 unidades):
200 × $12.89 = $2,578
```

**Ventajas**:
- ✅ Simple de calcular
- ✅ Suaviza fluctuaciones de precio
- ✅ Difícil de manipular para infladores utilidades
- ✅ Apropiado para productos indistinguibles

**Desventajas**:
- ❌ No refleja flujo real de inventario
- ❌ Requiere recalcular con cada compra (en sistema perpetuo)

---

### 4. Identificación Específica (Specific Identification)

**Principio**: Rastrea el costo real de cada unidad individual vendida.

**Aplicación**: Apropiado para artículos de alto valor y fácilmente distinguibles.

**Ejemplos**:
- Automóviles (por VIN)
- Joyas
- Bienes raíces
- Arte
- Maquinaria pesada

**Ventajas**:
- ✅ Precisión máxima
- ✅ Refleja costo real exacto

**Desventajas**:
- ❌ Administrativamente costoso
- ❌ Impracticable para grandes volúmenes
- ❌ Potencial de manipulación de utilidades

---

## Sistemas de Costeo

### 1. Costeo por Absorción (Absorption Costing)

**Definición**: Método que incluye **todos** los costos de manufactura (fijos y variables) como parte del costo del producto.

**Componentes Incluidos**:
- Materiales directos
- Mano de obra directa
- Overhead variable de manufactura
- Overhead fijo de manufactura

**Fórmula**:
```
Costo del Producto = MD + MOD + OH Variable + OH Fijo

Donde:
MD = Materiales Directos
MOD = Mano de Obra Directa
OH = Overhead
```

**Ejemplo**:
```
Producción de 1,000 unidades:

Costos Variables por Unidad:
- Materiales: $10
- Mano de Obra: $8
- OH Variable: $2
Subtotal Variable: $20/unidad

Costos Fijos Totales:
- OH Fijo: $15,000

Costeo por Absorción:
= $20 + ($15,000 / 1,000)
= $20 + $15
= $35 por unidad
```

**Requerimientos**:
- ✅ Requerido por GAAP para reportes externos
- ✅ Requerido por IFRS
- ✅ Necesario para propósitos fiscales

---

### 2. Costeo Directo/Variable (Variable/Direct Costing)

**Definición**: Solo costos **variables** se asignan a productos. Costos fijos se tratan como gastos del período.

**Componentes del Producto**:
- Materiales directos
- Mano de obra directa
- Overhead variable

**Costos del Período**:
- Overhead fijo (NO parte del costo del producto)

**Ejemplo** (mismos datos):
```
Costeo Variable:
= $10 + $8 + $2
= $20 por unidad

Costos Fijos ($15,000) = Gastos del período
```

**Ventajas**:
- ✅ Mejor para decisiones de gestión
- ✅ Facilita análisis de contribución marginal
- ✅ No distorsiona utilidades con cambios en inventario

**Limitaciones**:
- ❌ NO aceptado para reportes externos (GAAP/IFRS)
- ❌ NO válido para impuestos

---

### 3. Activity-Based Costing (ABC)

**Definición**: Asigna costos indirectos (overhead) a productos basándose en **actividades** que consumen recursos, en lugar de métricas volumétricas simples.

**Proceso ABC**:

1. **Identificar actividades** que generan costos
2. **Asignar costos** a cada actividad (crear cost pools)
3. **Identificar cost drivers** para cada actividad
4. **Calcular tasas** por actividad
5. **Asignar costos** a productos según consumo de actividades

**Ejemplo**:

```
Empresa fabrica 2 productos: Simple (1,000 unid) y Complejo (500 unid)

Actividad          Costo Total    Cost Driver         Simple  Complejo
─────────────────────────────────────────────────────────────────────
Setup de máquinas  $50,000        # Setups             10      40
Control Calidad    $30,000        # Inspecciones       20      80  
Compras            $20,000        # Órdenes de Compra  30      70
─────────────────────────────────────────────────────────────────────

Cálculo de Tasas:
- Setup: $50,000 / 50 setups = $1,000 por setup
- QC: $30,000 / 100 inspecciones = $300 por inspección
- Compras: $20,000 / 100 órdenes = $200 por orden

Asignación a Producto Complejo:
- Setup: 40 × $1,000 = $40,000
- QC: 80 × $300 = $24,000
- Compras: 70 × $200 = $14,000
Total OH = $78,000

OH por Unidad Complejo = $78,000 / 500 = $156/unidad
```

**Comparación con Costeo Tradicional**:
```
Método Tradicional (base: horas máquina):
- Asume distribución uniforme
- Producto Complejo: $67/unidad (subestimado)

Método ABC:
- Refleja consumo real de recursos
- Producto Complejo: $156/unidad (real)
```

**Ventajas de ABC**:
- ✅ Mayor precisión en costos de productos
- ✅ Identifica actividades que no agregan valor
- ✅ Mejora decisiones de pricing
- ✅ Facilita gestión basada en actividades

**Desventajas**:
- ❌ Costoso de implementar y mantener
- ❌ Requiere sistemas sofisticados
- ❌ Selección de cost drivers puede ser subjetiva

---

### 4. Lean Accounting

**Origen**: Desarrollado por Toyota como parte de manufactura lean.

**Principios**:
1. **Eliminar desperdicios** en todos los procesos
2. **Value stream costing** en lugar de costeo por producto
3. **Simplificar** sistemas de contabilidad
4. **Métricas visuales** y dashboards
5. **Decisiones rápidas** con información simple

**Value Stream Costing**:
```
Value Stream = Conjunto completo de actividades para entregar valor al cliente

Costos del Value Stream:
├─ Materiales
├─ Mano de Obra
├─ Equipos
├─ Facilidades
└─ Servicios de soporte

Total / Unidades del Stream = Costo por Unidad
```

**Diferencias con Contabilidad Tradicional**:

| Aspecto | Tradicional | Lean |
|---------|-------------|------|
| Foco | Costeo de productos | Flujo de valor |
| Complejidad | Alta (muchas asignaciones) | Baja (costos directos al stream) |
| Varianza | Análisis detallado | Solo varianzas significativas |
| Inventario | Asset en balance | Indicador de desperdicio |
| Métricas | Financieras | Operativas + Financieras |

---

### 5. Costeo Estándar (Standard Costing)

**Definición**: Establece costos predeterminados ("estándares") para componentes de producción, luego compara con costos reales.

**Componentes**:
- **Costo estándar de materiales**: Precio estándar × Cantidad estándar
- **Costo estándar de MOD**: Tasa estándar × Horas estándar
- **Costo estándar de OH**: Tasa estándar × Base de aplicación

**Análisis de Varianzas**:

```
Varianza Total = Costo Real - Costo Estándar

Varianzas de Materiales:
├─ Varianza de Precio = (Precio Real - Precio Estándar) × Cantidad Real
└─ Varianza de Cantidad = (Cantidad Real - Cantidad Estándar) × Precio Estándar

Varianzas de Mano de Obra:
├─ Varianza de Tasa = (Tasa Real - Tasa Estándar) × Horas Reales
└─ Varianza de Eficiencia = (Horas Reales - Horas Estándar) × Tasa Estándar
```

**Ejemplo**:
```
Producto: Silla de Madera

Estándares:
- Madera: 5kg @ $10/kg = $50
- MOD: 2 horas @ $20/hora = $40

Producción Real (100 sillas):
- Madera usada: 520kg @ $11/kg = $5,720
- Horas trabajadas: 210 horas @ $19/hora = $3,990

Análisis:
Varianza Precio Madera = ($11 - $10) × 520 = $520 (D) desfavorable
Varianza Cantidad Madera = (520 - 500) × $10 = $200 (D)

Varianza Tasa MOD = ($19 - $20) × 210 = ($210) (F) favorable
Varianza Eficiencia MOD = (210 - 200) × $20 = $200 (D)
```

---

## Cost Pools y Cost Drivers

### Cost Pools (Grupos de Costos)

**Definición**: Agrupación de costos indirectos individuales relacionados.

**Ejemplos de Cost Pools**:

```
1. Mantenimiento de Planta
   ├─ Salarios de mecánicos
   ├─ Repuestos
   ├─ Herramientas
   └─ Lubricantes

2. Departamento de Compras
   ├─ Salarios del equipo
   ├─ Software de compras
   ├─ Espacio de oficina
   └─ Suministros

3. Control de Calidad
   ├─ Salarios inspectores
   ├─ Equipos de medición
   ├─ Calibración
   └─ Laboratorio
```

### Cost Drivers (Inductores de Costo)

**Definición**: Factor que causa cambios en el costo de una actividad.

**Tipos**:

1. **Transaction Drivers**: Cuenta frecuencia de actividad
   - Número de setups
   - Número de órdenes procesadas
   - Número de inspecciones

2. **Duration Drivers**: Mide tiempo de actividad
   - Horas de setup
   - Tiempo de inspección
   - Horas de soporte

**Selección de Cost Drivers**:

Criterios:
- ✅ **Causalidad**: Relación causa-efecto con el costo
- ✅ **Medibilidad**: Fácil de medir y rastrear
- ✅ **Comprensibilidad**: Fácil de entender por stakeholders
- ✅ **Costo-Beneficio**: Beneficio de precisión > costo de medición

**Ejemplo de Selección**:

```
Cost Pool: Mantenimiento de Maquinaria ($100,000/año)

Opciones de Cost Driver:
1. Horas Máquina → Alta correlación, fácil de medir ✅
2. Unidades Producidas → Correlación media
3. Número de empleados → Baja correlación ❌

Selección: Horas Máquina
- Total horas/año: 10,000
- Tasa: $100,000 / 10,000 = $10/hora

Producto A usa 500 horas → $5,000 de mantenimiento
```

---

## Elementos del Costo

### Costo Primo (Prime Cost)

**Definición**: Suma de materiales directos y mano de obra directa.

```
Costo Primo = Materiales Directos + Mano de Obra Directa
```

**Importancia**: Representa costos más directamente rastreables al producto.

---

### Costo de Conversión (Conversion Cost)

**Definición**: Suma de mano de obra directa y overhead de manufactura.

```
Costo de Conversión = Mano de Obra Directa + Overhead de Manufactura
```

**Concepto**: Costos necesarios para "convertir" materias primas en productos terminados.

---

### Costo Total de Producción

```
Costo Total = Materiales Directos + Mano de Obra Directa + Overhead

O alternativamente:
Costo Total = Costo Primo + Overhead
Costo Total = Materiales Directos + Costo de Conversión
```

---

## Ejemplos Prácticos

### Ejemplo 1: Panadería Artesanal

```
Producto: 100 panes artesanales

COSTOS DIRECTOS:
Materiales:
- Harina: 50kg @ $2/kg = $100
- Levadura: 2kg @ $10/kg = $20
- Sal: 1kg @ $1/kg = $1
- Agua: incluida en overhead
Total Materiales Directos = $121

Mano de Obra Directa:
- Panadero: 8 horas @ $15/hora = $120

COSTOS INDIRECTOS:
Overhead Fijo:
- Renta de local: $2,000/mes
- Depreciación horno: $500/mes
Total OH Fijo = $2,500/mes

Overhead Variable:
- Electricidad (horno): $50 por batch
- Gas: $30 por batch
- Embalaje: $0.50/pan × 100 = $50
Total OH Variable = $130

CÁLCULO (Costeo por Absorción):
Para este batch de 100 panes:
- OH Fijo asignado (asumiendo 10 batches/mes): $2,500/10 = $250

Costo Total:
= MD + MOD + OH Variable + OH Fijo
= $121 + $120 + $130 + $250
= $621

Costo por Pan = $621 / 100 = $6.21
```

---

### Ejemplo 2: Taller de Muebles (Job Costing)

```
Orden #1234: Mesa de Comedor Personalizada

COSTOS DIRECTOS:
Materiales:
- Madera de roble: $800
- Tornillos y pegamento: $50
- Barniz: $60
Total MD = $910

Mano de Obra (rate card):
- Carpintero senior: 20h @ $30/h = $600
- Ayudante: 15h @ $15/h = $225
Total MOD = $825

COSTOS INDIRECTOS:
Overhead aplicado:
- Base: Horas de MOD = 35 horas
- Tasa predeterminada: $25/hora MOD
- OH aplicado = 35h × $25 = $875

COSTO TOTAL:
= $910 + $825 + $875
= $2,610

Pricing:
Si margen objetivo = 40%
Precio = $2,610 / (1 - 0.40) = $4,350
```

---

### Ejemplo 3: Empresa de Software (Service Costing)

```
Proyecto: Desarrollo de App Móvil

COSTOS DIRECTOS:
Mano de Obra (200 horas total):
- Desarrollador Senior: 100h @ $80/h = $8,000
- Desarrollador Junior: 80h @ $40/h = $3,200
- QA Tester: 20h @ $35/h = $700
Total MOD = $11,900

Materiales/Servicios Directos:
- Licencias de software: $500
- Servicios de API: $200
Total MD = $700

COSTOS INDIRECTOS:
Overhead (base: horas laborables):
- Tasa OH: $30/hora
- OH aplicado: 200h × $30 = $6,000

COSTO TOTAL DEL PROYECTO:
= $11,900 + $700 + $6,000
= $18,600

Cotización al Cliente:
- Costo: $18,600
- Margen 35%: $6,510
- Precio Total: $25,110
```

---

## Aplicabilidad por Industria

### Manufactura

**Métodos Recomendados**:
- Costeo por Absorción (requerido para reportes)
- ABC para productos complejos
- Costeo Estándar para producción repetitiva

**Énfasis**:
- Valuación de inventario (FIFO/LIFO/Promedio)
- Control de varianzas
- Eficiencia de producción

---

### Gastronomía

**Métodos Recomendados**:
- Recipe costing (costeo de recetas)
- Costeo de porciones
- ABC para menús complejos

**Métricas Clave**:
- Food Cost % (25-35% típicamente)
- Prime Cost (60-65% de ventas)
- Portion control

**Fórmula Fundamental**:
```
Food Cost % = (Costo de Ingredientes / Precio de Venta) × 100
```

---

### Servicios Profesionales

**Métodos Recomendados**:
- Time-based costing (por hora)
- Project costing (por proyecto)
- ABC para servicios complejos

**Estructura de Costos**:
- Alto componente de mano de obra (60-80%)
- Bajo componente de materiales directos
- Overhead moderado

---

### Retail

**Métodos Recomendados**:
- Retail method (método de retail)
- FIFO para perecederos
- Promedio ponderado para mayoría de productos

**Énfasis**:
- Rotación de inventario
- Shrinkage control
- Markup vs Margin

---

## Referencias

### Fuentes Académicas

1. **Horngren, C.T., Datar, S.M., & Rajan, M.V.** (2015). *Cost Accounting: A Managerial Emphasis*. Pearson Education.

2. **Hansen, D.R., & Mowen, M.M.** (2020). *Managerial Accounting*. Cengage Learning.

3. **Garrison, R.H., Noreen, E.W., & Brewer, P.C.** (2018). *Managerial Accounting*. McGraw-Hill Education.

### Estándares Profesionales

4. **FASB** (Financial Accounting Standards Board) - GAAP Guidelines

5. **IFRS** (International Financial Reporting Standards) - International Standards

6. **IMA** (Institute of Management Accountants) - Cost Management Standards

### Recursos Online

7. **Investopedia** - Cost Accounting Definitions and Concepts
   - Activity-Based Costing: https://www.investopedia.com/terms/a/abc.asp
   - Variable Cost: https://www.investopedia.com/terms/v/variablecost.asp
   - FIFO Method: https://www.investopedia.com/terms/f/fifo.asp

8. **CGMA** (Chartered Global Management Accountant) - ABC Resources

---

## Notas de Implementación para Sistemas ERP

### Consideraciones Técnicas

1. **Flexibilidad de Métodos**: Sistema debe soportar múltiples métodos de costeo simultáneamente
2. **Precision Decimal**: Usar tipos decimales apropiados (6+ decimales para cantidades, 4+ para costos)
3. **Auditabilidad**: Mantener trazabilidad completa de cálculos de costos
4. **Revaluación**: Permitir ajustes y recálculos retrospectivos

### Configuración por Industria

```javascript
const costingConfig = {
  manufacturing: {
    methods: ['absorption', 'standard', 'abc'],
    inventoryValuation: ['fifo', 'lifo', 'average'],
    varianceTracking: true
  },
  food_service: {
    methods: ['recipe', 'portion'],
    inventoryValuation: ['fifo', 'average'],
    yieldManagement: true
  },
  professional_services: {
    methods: ['time_based', 'project'],
    inventoryValuation: null,
    laborTracking: true
  }
}
```

---

**Versión**: 1.0  
**Última Actualización**: 2025-01-05  
**Próximo Documento**: [02-COSTEO-GASTRONOMIA.md](./02-COSTEO-GASTRONOMIA.md)
