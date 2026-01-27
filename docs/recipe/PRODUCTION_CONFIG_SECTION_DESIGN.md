# ProductionConfigSection - Diseño

> **Versión**: 1.0
> **Fecha**: 2026-01-07
> **Status**: 📝 DISEÑO PROPUESTO

---

## 🎯 Propósito

Componente que maneja la **ejecución de producción** para Materiales Elaborados, distinguiendo entre:
- **Producción inmediata** (con medición post-producción)
- **Producción programada** (scheduling)

**NO aplica a Productos/Servicios** (ellos usan BOM on-demand).

---

## 📐 Diseño de Interfaz

### Caso: Material Elaborado

```
┌──────────────────────────────────────────────────┐
│ EJECUCIÓN DE PRODUCCIÓN                          │
├──────────────────────────────────────────────────┤
│                                                  │
│ [✓] Producir ahora                               │
│                                                  │
│ ┌─ Si "Producir ahora" = true ─────────────────┐│
│ │ MEDICIÓN POST-PRODUCCIÓN                     ││
│ │                                              ││
│ │ Cantidad Esperada:  1.0 kg (read-only)      ││
│ │ Cantidad Obtenida:  [0.95] kg ⚠️ Yield: 95% ││
│ │ Desperdicio (Scrap): [0.05] kg               ││
│ │ Motivo: [Merma normal ▼]                     ││
│ │ Notas: [_________________________]           ││
│ └──────────────────────────────────────────────┘│
│                                                  │
│ [ ] Programar producción                         │
│                                                  │
│ ┌─ Si "Programar" = true ───────────────────────┐│
│ │ Fecha/Hora:   [2026-01-08 10:00]            ││
│ │ Frecuencia:   [Una vez ▼]                   ││
│ │ Próxima ejecución: 8 ene 10:00              ││
│ └──────────────────────────────────────────────┘│
└──────────────────────────────────────────────────┘
```

### Caso: Producto/Servicio

```
┌──────────────────────────────────────────────────┐
│ INFORMACIÓN DE BOM                                │
├──────────────────────────────────────────────────┤
│ ℹ️ Esta receta se ejecuta automáticamente:       │
│    • Producto: Al momento de cada venta          │
│    • Servicio: Al ejecutar el servicio           │
│                                                  │
│ Los ingredientes se consumen en cada ejecución.  │
└──────────────────────────────────────────────────┘
```

---

## 🔌 Integración con Módulos

### 1. Scheduling Module
- **Usar**: `src/modules/scheduling/*` (si existe)
- **Crear job**: `scheduleProductionBatch({ recipe_id, scheduled_at, frequency })`
- **Comunicación**: EventBus evento `production.scheduled`

### 2. Inventory Module
- **Consumir ingredientes**: Al ejecutar producción
- **Generar stock**: Del material elaborado producido
- **Evento**: `inventory.batch_produced`

### 3. Production Batches (nueva tabla)
```sql
CREATE TABLE production_batches (
  id UUID PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id),
  material_id UUID REFERENCES materials(id),
  scheduled_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  expected_quantity DECIMAL(10,3),
  actual_quantity DECIMAL(10,3),
  yield_percentage DECIMAL(5,2),
  scrap_quantity DECIMAL(10,3),
  scrap_reason TEXT
);
```

---

## 🎨 Props del Componente

```typescript
interface ProductionConfigSectionProps {
  entityType: 'material' | 'product' | 'service'
  recipe: Partial<Recipe>
  updateRecipe: (updates: Partial<Recipe>) => void
}
```

---

## 🔄 Flujos

### Flujo: Producir Ahora
1. Usuario marca checkbox "Producir ahora"
2. Completa medición post-producción (cantidad real, scrap)
3. Al guardar → ejecuta `executeProductionBatch()`
4. Consume ingredientes + genera stock

### Flujo: Programar
1. Usuario marca checkbox "Programar"
2. Selecciona fecha/hora + frecuencia
3. Al guardar → crea job en scheduler
4. Job se ejecuta automáticamente en la fecha programada

---

## ✅ Validaciones

- Si `produceNow = true`:
  - `actual_quantity` es **requerido**
  - `scrap_reason` es **requerido** si `scrap_quantity > 0`

- Si `scheduleProduction = true`:
  - `scheduled_at` debe ser **futuro**
  - `frequency` es **requerido**

- `produceNow` y `scheduleProduction` son **mutuamente excluyentes**

---

## 📝 Notas de Implementación

1. **ChakraUI**: Usar componentes existentes del proyecto
2. **EventBus**: Emitir eventos para comunicación entre módulos
3. **Scheduler**: Investigar si existe módulo de scheduling o crear wrapper
4. **Error Handling**: Manejar fallos en producción (ingredientes insuficientes, etc.)

---

**Próximos pasos**:
- Investigar módulo de scheduling existente
- Definir eventos de EventBus necesarios
- Crear migration para `production_batches`
- Implementar componente con ChakraUI
