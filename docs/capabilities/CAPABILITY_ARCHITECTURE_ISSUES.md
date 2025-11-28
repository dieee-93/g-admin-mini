# 🚨 Problemas Arquitectónicos Detectados en Capabilities System

**Fecha**: 2025-01-26
**Contexto**: Diseño de ShiftControlWidget reveló inconsistencias arquitectónicas
**Estado**: 🔴 Requiere discusión y rediseño

---

## 📋 ÍNDICE

1. [Problema 1: mobile_operations - Duplicación de Lógica](#problema-1-mobile_operations)
2. [Problema 2: online_store - Naming y Comportamiento Confuso](#problema-2-online_store)
3. [Problema 3: Solapamiento digital_products vs online_store](#problema-3-digital_products)
4. [Propuestas de Solución](#propuestas-de-solución)
5. [Impacto en ShiftControlWidget](#impacto-en-shiftcontrolwidget)

---

## 🔴 PROBLEMA 1: mobile_operations - Duplicación de Lógica

### 📋 Descripción

**Situación actual**:
```typescript
// Capability
'mobile_operations'  // Operaciones móviles (food truck, servicios a domicilio)

// Features que activa
'mobile_location_tracking'    // GPS tracking
'mobile_route_planning'       // Planificación de rutas
'mobile_inventory_constraints' // Inventario limitado móvil
```

### ❌ Problema Detectado

**GPS Tracking se necesita en MÚLTIPLES contextos**:

| Contexto | Necesita GPS | Usa mobile_operations | Lógico? |
|----------|-------------|---------------------|---------|
| Food Truck | ✅ Trackear ubicación del truck | ✅ Sí | ✅ Sí |
| Delivery (drivers) | ✅ Trackear repartidores | ❓ No está claro | ❌ Confuso |
| Servicios a domicilio (plomero) | ✅ Trackear técnico | ❓ No está claro | ❌ Confuso |
| Cadena con delivery | ✅ Trackear flota | ❓ No está claro | ❌ Confuso |

### 🤔 Contradicción

```typescript
// Restaurante fijo con delivery
Capabilities: ['onsite_service', 'delivery_shipping', 'mobile_operations']
Infrastructure: ['single_location']

// ¿Por qué mobile_operations?
// El RESTAURANTE no es móvil, pero necesita GPS para drivers
// La capability dice "operaciones móviles" pero el negocio NO es móvil
```

**Confusión conceptual**:
- `mobile_operations` suena a "negocio móvil"
- Pero en realidad significa "usa GPS/tracking"
- Se solapa con `mobile_business` (Infrastructure)

### 🎯 Pregunta Clave

**¿GPS tracking debería ser una Feature transversal, no una Capability?**

```typescript
// Opción A: Capability actual (confusa)
'mobile_operations' → activa GPS features

// Opción B: Feature transversal (más clara)
'gps_tracking' → Feature activada por MÚLTIPLES capabilities:
  - delivery_shipping (trackear drivers)
  - mobile_business (trackear ubicación del negocio)
  - professional_services (trackear técnicos a domicilio)
```

---

## 🔴 PROBLEMA 2: online_store - Naming y Comportamiento Confuso

### 📋 Descripción del Usuario

> "El término e-commerce es confuso. Se trata de **operar fuera de horario**, no necesariamente de tener tienda online. La app incluye catálogo online para todos los comercios, pero si activas `online_store` permite **pre-pactar citas, pre-comprar pedidos, arreglar retiros** fuera del horario operativo."

### ❌ Problema de Naming

**Nombre actual**:
```typescript
'online_store'  // E-commerce 24/7 (was: async_operations)
```

**Expectativa del nombre**: Tienda online estilo Amazon
**Realidad funcional**: Operaciones asíncronas fuera de horario

### 🎯 Casos de Uso Reales

#### Caso 1: Restaurante con pre-orders
```typescript
Capabilities: ['onsite_service', 'physical_products', 'online_store']

Horario operativo: 12:00 - 23:00

Comportamiento CON online_store:
├─ 02:00 AM (fuera de horario)
│  ├─ Cliente puede ver catálogo ✅
│  ├─ Cliente puede hacer pedido para mañana ✅
│  ├─ Sistema registra pedido como "programado" ✅
│  └─ Personal procesa al abrir a las 12:00 ✅
│
└─ 15:00 PM (dentro de horario)
   ├─ Cliente puede ordenar ahora ✅
   └─ Sistema procesa inmediatamente ✅
```

#### Caso 2: Salón de Belleza con booking 24/7
```typescript
Capabilities: ['professional_services', 'online_store']

Horario operativo: 10:00 - 20:00

Comportamiento CON online_store:
├─ 23:00 PM (fuera de horario)
│  ├─ Cliente puede ver disponibilidad ✅
│  ├─ Cliente puede agendar cita para mañana ✅
│  └─ Sistema confirma automáticamente ✅
│
└─ 14:00 PM (dentro de horario)
   ├─ Cliente puede agendar walk-in ✅
   └─ Sistema muestra slots en tiempo real ✅
```

#### Caso 3: Tienda Digital Pura (el único 24/7 real)
```typescript
Capabilities: ['digital_products', 'online_store']

NO hay horario operativo (funciona 24/7)

Comportamiento:
├─ Cliente descarga producto al instante ✅
├─ NO requiere staff ✅
└─ NO requiere turno ✅
```

### 🤔 Contradicción Conceptual

**Pregunta**: ¿Qué significa "turno" si `online_store` está activa?

```typescript
// Restaurante con online_store
├─ DENTRO de horario: Turno abierto + Staff activo + Cash session
└─ FUERA de horario: ¿Qué mostramos en el widget?

Opciones:
A) "Cerrado pero recibiendo pedidos online" ✅
B) "Turno cerrado" (ignora online_store) ❌
C) "Online 24/7" (confuso si hay horario físico) ❌
```

### 🎯 Pregunta Clave

**¿Debería renombrarse `online_store` a algo más descriptivo?**

**Opciones**:
```typescript
// Opción A: Mantener nombre actual
'online_store'  // Confuso, suena a e-commerce puro

// Opción B: Renombrar a funcionalidad real
'async_operations'  // Operaciones asíncronas fuera de horario

// Opción C: Ser más específico
'after_hours_booking'  // Reservas fuera de horario

// Opción D: Dividir en 2 capabilities
'online_catalog'       // Catálogo siempre disponible
'after_hours_orders'   // Pedidos fuera de horario
```

---

## 🔴 PROBLEMA 3: Solapamiento digital_products vs online_store

### 📋 Descripción

```typescript
// Capability 1
'digital_products'  // Productos digitales descargables

// Capability 2
'online_store'      // E-commerce 24/7

// ¿Qué pasa si ambas están activas?
```

### ❌ Confusión

**Caso**: Tienda de cursos online

```typescript
Capabilities: ['digital_products', 'online_store']

Preguntas sin respuesta:
├─ ¿Necesito AMBAS? ¿O solo digital_products?
├─ ¿online_store agrega algo a digital_products?
├─ ¿digital_products implica 24/7 por defecto?
└─ ¿Cómo se comporta el widget?
```

### 🎯 Análisis

#### Si `digital_products` está activa:
```typescript
Comportamiento esperado:
├─ NO hay inventario físico ✅
├─ NO hay staff operativo ✅
├─ NO hay cash session ✅
├─ Entrega inmediata (download) ✅
└─ ¿Necesita turno? ❌ NO

Conclusión: digital_products ES 24/7 por naturaleza
```

#### Si `online_store` también está activa:
```typescript
¿Qué agrega online_store a digital_products?

Posibilidad 1: NADA (redundante)
Posibilidad 2: Agrega pre-orders programados (¿tiene sentido para digital?)
Posibilidad 3: Error de diseño, no deberían combinarse
```

### 🤔 Contradicción

**digital_products debería implicar 24/7 automáticamente**

```typescript
// ❌ ACTUAL: Requiere 2 capabilities
['digital_products', 'online_store']

// ✅ DEBERÍA: Solo una
['digital_products']  // Ya es 24/7 por naturaleza
```

---

## 💡 PROPUESTAS DE SOLUCIÓN

### 🔧 Propuesta 1: Refactor de mobile_operations

#### Opción A: Convertir en Feature Transversal

```typescript
// ELIMINAR capability
❌ 'mobile_operations'

// CREAR feature transversal
✅ 'gps_location_tracking'  // Feature

// Activar automáticamente si:
- delivery_shipping está activa, O
- mobile_business está activo, O
- professional_services + onsite_service = false (servicios a domicilio)

// Engine logic
if (hasCapability('delivery_shipping') ||
    hasInfrastructure('mobile_business') ||
    (hasCapability('professional_services') && !hasCapability('onsite_service'))) {
  activateFeature('gps_location_tracking');
}
```

**Ventajas**:
- ✅ Elimina redundancia
- ✅ GPS se activa automáticamente donde se necesita
- ✅ Naming más claro

**Desventajas**:
- ❌ Cambio breaking (usuarios que seleccionaron mobile_operations)
- ❌ Requiere migración de datos

---

#### Opción B: Renombrar y Clarificar

```typescript
// Renombrar capability
'mobile_operations' → 'location_services'

// Descripción nueva
'location_services': "Servicios de GPS, tracking y rutas (para deliveries, food trucks, servicios móviles)"

// Features que activa (sin cambios)
- 'mobile_location_tracking'
- 'mobile_route_planning'
- 'mobile_inventory_constraints'
```

**Ventajas**:
- ✅ Menos invasivo
- ✅ Naming más claro
- ✅ No requiere migración

**Desventajas**:
- ❌ Sigue siendo una capability extra que elegir
- ❌ No resuelve redundancia total

---

### 🔧 Propuesta 2: Refactor de online_store

#### Opción A: Renombrar a `async_operations`

```typescript
// Renombrar capability
'online_store' → 'async_operations'

// Nueva descripción
"Operaciones asíncronas: permite recibir pedidos, reservas y citas fuera del horario operativo"

// Comportamiento widget
if (hasCapability('async_operations')) {
  // Dentro de horario: Widget normal
  // Fuera de horario: "Cerrado - Recibiendo pedidos online"
}
```

**Ventajas**:
- ✅ Naming claro
- ✅ No confunde con e-commerce puro
- ✅ Widget sabe cómo comportarse

**Desventajas**:
- ❌ Cambio breaking

---

#### Opción B: Dividir en 2 Capabilities

```typescript
// Capability 1: Catálogo online (para todos)
'online_catalog'  // CORE: Todos los negocios tienen catálogo web

// Capability 2: Pedidos fuera de horario
'after_hours_orders'  // OPTIONAL: Permite pre-orders

// Comportamiento
if (hasCapability('after_hours_orders')) {
  // Fuera de horario: Permite pedidos programados
} else {
  // Fuera de horario: Solo muestra catálogo read-only
}
```

**Ventajas**:
- ✅ Máxima claridad
- ✅ Separación de concerns
- ✅ Granularidad fina

**Desventajas**:
- ❌ Más capabilities para elegir
- ❌ Complejiza wizard

---

### 🔧 Propuesta 3: Resolver digital_products

#### Opción A: digital_products implica 24/7 automáticamente

```typescript
// Engine logic
if (hasCapability('digital_products')) {
  // Auto-activar operación 24/7
  alwaysOperational = true;

  // NO requiere online_store
  // NO requiere turno
  // NO requiere cash session
}

// Widget
if (hasCapability('digital_products') && !hasCapability('physical_products')) {
  return null;  // No renderizar widget (no tiene sentido)
}
```

**Ventajas**:
- ✅ Lógico: digital = 24/7 por naturaleza
- ✅ Simplifica UX del wizard
- ✅ Widget no se confunde

---

#### Opción B: Separar "digital puro" vs "digital híbrido"

```typescript
// Caso 1: Digital puro (cursos online)
['digital_products']  // Solo esto, implica 24/7

// Caso 2: Híbrido (restaurante + venta de e-books)
['physical_products', 'digital_products', 'onsite_service']

// Widget
if (hasAnyPhysicalCapability()) {
  return <ShiftControlWidget />;  // Mostrar turno físico
} else {
  return null;  // Pure digital, no turno
}
```

---

## 🎯 RECOMENDACIONES PARA DISCUSIÓN

### 🔥 CRÍTICO (Bloquea ShiftControlWidget)

1. **Decidir comportamiento de online_store**:
   - [ ] ¿Renombrar a `async_operations`?
   - [ ] ¿Dividir en `online_catalog` + `after_hours_orders`?
   - [ ] ¿Mantener nombre actual?

2. **Definir widget behavior para digital_products**:
   - [ ] ¿No renderizar widget si es 100% digital?
   - [ ] ¿Mostrar widget simplificado?

### ⚠️ IMPORTANTE (Mejora arquitectura)

3. **Resolver mobile_operations**:
   - [ ] ¿Convertir a feature transversal?
   - [ ] ¿Renombrar a `location_services`?
   - [ ] ¿Mantener como está y documentar mejor?

### 📝 NICE TO HAVE (Futuro)

4. **Documentar todas las combinaciones válidas**
5. **Crear validation rules en el wizard**
6. **Testing exhaustivo de edge cases**

---

## 🚀 IMPACTO EN SHIFTCONTROLWIDGET

### Decisiones Bloqueantes

**No podemos implementar el widget hasta resolver**:

1. ✅ **¿Cómo detectar "negocio 24/7"?**
   ```typescript
   // Opción A: Solo online_store
   isAlwaysOpen = hasCapability('online_store');

   // Opción B: online_store O digital_products
   isAlwaysOpen = hasCapability('online_store') ||
                  hasCapability('digital_products');

   // Opción C: Renombrar
   isAlwaysOpen = hasCapability('async_operations');
   ```

2. ✅ **¿Qué mostrar fuera de horario con async operations?**
   ```typescript
   if (isOutsideBusinessHours && hasCapability('async_operations')) {
     return (
       <Box>
         <Badge colorPalette="orange">
           CERRADO - Recibiendo pedidos online
         </Badge>
         <OnlineOrdersQueue />
       </Box>
     );
   }
   ```

3. ✅ **¿Renderizar widget para digital_products puro?**
   ```typescript
   if (hasCapability('digital_products') &&
       !hasAnyPhysicalCapability()) {
     return null;  // ¿O mostrar algo?
   }
   ```

---

## 📋 SIGUIENTE PASO SUGERIDO

**Crear documento de discusión colaborativo**:

```
CAPABILITY_REDESIGN_PROPOSAL.md
├─ Problema 1: mobile_operations
│  ├─ Opciones A, B, C
│  ├─ Pros/Cons de cada una
│  └─ Votación/Decisión
│
├─ Problema 2: online_store
│  ├─ Opciones A, B, C
│  └─ Votación/Decisión
│
└─ Problema 3: digital_products
   ├─ Opciones A, B
   └─ Votación/Decisión
```

**Luego**: Implementar ShiftControlWidget con las decisiones aprobadas.

---

## 🤝 PREGUNTAS PARA EL EQUIPO

1. ¿Cuál es la prioridad?
   - [ ] Implementar widget con arquitectura actual (workarounds)
   - [ ] Resolver problemas arquitectónicos primero

2. ¿Quién toma decisiones finales sobre capabilities?
   - [ ] Product Owner
   - [ ] Tech Lead
   - [ ] Votación del equipo

3. ¿Hay usuarios en producción?
   - [ ] Sí → Migración breaking es compleja
   - [ ] No → Podemos refactorear libremente

4. ¿Preferencia de naming?
   - [ ] Inglés técnico (`async_operations`)
   - [ ] Español descriptivo (`pedidos_fuera_horario`)
   - [ ] Inglés user-friendly (`after_hours_booking`)

---

**Documento creado por**: Claude Code
**Última actualización**: 2025-01-26
**Estado**: 🔴 Requiere discusión urgente
**Bloqueador de**: ShiftControlWidget implementation
