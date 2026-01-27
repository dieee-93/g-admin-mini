# Material Elaborado - Rediseño de Formulario

> **Fecha**: 2026-01-07
> **Status**: 🔧 EN PROGRESO
> **Prioridad**: 🔥 ALTA

---

## ❌ Problemas Actuales Identificados

### 1. **Secciones Innecesarias**
- ✅ ~~AdvancedOptionsSection mostrándose en complexity='minimal'~~ **RESUELTO**
- ✅ ~~Botones de scaling en OutputConfigSection~~ **RESUELTO**
- ⚠️ Badge "Item de Salida" con helper text redundante

### 2. **Diseño Visual Pobre**
- Demasiadas secciones expandibles (CardWrapper)
- Pérdida de contexto visual entre secciones
- Mucho espacio vertical desperdiciado

### 3. **Flujo UX Confuso**
- No es claro qué es obligatorio vs opcional
- Orden de secciones no refleja flujo mental del usuario
- Labels y helper texts demasiado verbosos

---

## 🎯 Propuesta de Rediseño

### Flujo Mental del Usuario

Cuando un usuario crea un Material Elaborado, piensa:

1. **"¿Qué necesito?"** → Lista de ingredientes
2. **"¿Cuánto obtengo?"** → Cantidad de salida
3. **"¿Cuándo lo hago?"** → Producción inmediata/programada
4. **"¿Cuánto cuesta?"** → Resumen de costos

### Diseño Propuesto: Formulario Compacto

```
┌─────────────────────────────────────────────────────┐
│ INGREDIENTES (1/4)                           [?]    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ [+ Agregar Ingrediente]                             │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 🥕 Harina 000         500 g     $125.00        │ │
│ │ 🥛 Leche             250 ml      $85.00    [×] │ │
│ │ 🧈 Manteca            50 g       $45.00        │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ Total ingredientes: $255.00                         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ PRODUCCIÓN (2/4)                             [?]    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Producto: [Pan Casero]                              │
│ Cantidad: [1.0] kg                                  │
│                                                     │
│ Costo por unidad: $255.00 / 1.0 kg = $255.00/kg    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ EJECUCIÓN (3/4)                              [?]    │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ○ Producir más tarde                                │
│ ● Producir ahora                                    │
│                                                     │
│ ┌─ Medición Post-Producción ─────────────────────┐ │
│ │ Cantidad Real:  [0.95] kg  ⚠️ Yield: 95%      │ │
│ │ Desperdicio:    [0.05] kg                      │ │
│ │ Motivo:         [Merma normal ▼]               │ │
│ └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ RESUMEN (4/4)                                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Costo Total:        $255.00                         │
│ Cantidad Producida:    0.95 kg (yield 95%)         │
│ Costo por kg:       $268.42                         │
│                                                     │
│                    [Cancelar] [Crear Material]      │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 Principios de Diseño

### 1. **Progreso Visual**
- Numeración clara: (1/4), (2/4), (3/4), (4/4)
- Indicador de completitud por sección
- Flecha o línea de progreso opcional

### 2. **Density Apropiada**
- Agrupar campos relacionados sin CardWrapper excesivo
- Usar borders sutiles en lugar de cards completos
- Reducir padding vertical entre secciones

### 3. **Feedback Inmediato**
- Cálculos en tiempo real (costo por unidad)
- Validación inline (yield % con colores)
- Resumen siempre visible

### 4. **Claridad Visual**
- Labels cortos y directos
- Helper texts solo cuando necesarios
- Íconos para quick scan (🥕, 🥛, ⚠️, ✅)

---

## 🔧 Cambios Técnicos Necesarios

### 1. Componente InputsEditorSection

**Estado Actual**: Lista verbose con CardWrappers individuales

**Propuesta**: Tabla compacta con acciones inline

```typescript
// Diseño tipo DataGrid
<Table>
  <Thead>
    <Tr>
      <Th>Ingrediente</Th>
      <Th>Cantidad</Th>
      <Th>Costo</Th>
      <Th width="40px"></Th>
    </Tr>
  </Thead>
  <Tbody>
    {inputs.map(input => (
      <Tr key={input.id}>
        <Td>{input.name}</Td>
        <Td>{input.quantity} {input.unit}</Td>
        <Td>${input.cost}</Td>
        <Td><IconButton icon={<X />} /></Td>
      </Tr>
    ))}
  </Tbody>
</Table>
```

### 2. OutputConfigSection

**Eliminar**:
- ❌ Badge de "Item de Salida"
- ❌ Helper text redundante

**Simplificar a**:
```typescript
<Stack gap="2">
  <Text fontSize="sm" color="fg.muted">
    Producto: <strong>{itemName}</strong>
  </Text>
  <HStack>
    <Field label="Cantidad" flex="1">
      <Input type="number" />
    </Field>
    <Text pt="8">{unit}</Text>
  </HStack>
  <Text fontSize="xs" color="fg.muted">
    Costo por {unit}: ${costPerUnit.toFixed(2)}
  </Text>
</Stack>
```

### 3. ProductionConfigSection

**Mejorar**:
- Radio buttons en lugar de checkboxes (mutuamente excluyentes)
- Campos de medición más compactos
- Cálculo de yield con código de color automático

### 4. Eliminar CardWrappers Excesivos

**Antes**: Cada sección con `<CardWrapper>` completo

**Después**: Solo border superior + título simple

```typescript
<Box borderTopWidth="2px" borderColor="border" pt="6" mt="6">
  <HStack mb="4">
    <Text fontSize="lg" fontWeight="semibold">
      {title} ({step}/4)
    </Text>
    {helpIcon}
  </HStack>
  {children}
</Box>
```

---

## 📊 Métricas de Éxito

### Antes (estimado)
- Altura vertical: ~1800px
- Clicks para completar: ~15
- Tiempo promedio: ~3 min
- Confusión: Alta (Opciones Avanzadas, scaling, etc.)

### Después (objetivo)
- Altura vertical: ~1200px ✅ -33%
- Clicks para completar: ~10 ✅ -33%
- Tiempo promedio: ~2 min ✅ -33%
- Confusión: Baja (flujo claro, opciones relevantes)

---

## 🚀 Plan de Implementación

### Fase 1: Limpieza (✅ COMPLETADO)
- ✅ Eliminar AdvancedOptionsSection en minimal
- ✅ Remover botones de scaling
- ✅ Simplificar OutputConfigSection

### Fase 2: InputsEditor Compacto
- [ ] Rediseñar como tabla/grid
- [ ] Acciones inline (editar, eliminar)
- [ ] Agregar suma total inline

### Fase 3: Layout Compacto
- [ ] Remover CardWrappers excesivos
- [ ] Implementar numeración de pasos
- [ ] Reducir padding/spacing vertical

### Fase 4: ProductionConfig Mejorado
- [ ] Radio buttons en lugar de checkboxes
- [ ] Campos de medición más compactos
- [ ] Yield % con colores (verde >95%, amarillo >85%, rojo <85%)

### Fase 5: Resumen Siempre Visible
- [ ] Sticky footer con resumen
- [ ] Cálculos en tiempo real
- [ ] Botones de acción siempre accesibles

---

## 💭 Consideraciones Adicionales

### Mobile
- En mobile, colapsar secciones en accordion
- Botones de acción sticky bottom
- Inputs full-width

### Accesibilidad
- Labels correctos para screen readers
- Focus management entre secciones
- Shortcuts de teclado (Tab, Enter, Esc)

### Performance
- Debounce en cálculos de costo
- Virtualization si >20 ingredientes
- Lazy load ProductionConfig solo cuando "Producir ahora"

---

## ❓ Preguntas Abiertas

1. ¿Progreso visual (1/4, 2/4) o sin numeración?
2. ¿InputsEditor como tabla o mantener lista?
3. ¿Resumen sticky o solo al final?
4. ¿Wizard multi-step o single-page?

---

**Próximo paso**: Discutir con usuario y definir approach final antes de implementar.
