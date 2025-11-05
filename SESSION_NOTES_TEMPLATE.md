# Session Notes: [Session Title]

**Fecha**: [YYYY-MM-DD HH:mm]
**Duración**: [X.X] horas
**Objetivo**: [Clear goal from session plan]

---

## 🎯 Contexto de la Sesión

### Problema a Resolver
[Descripción del problema o feature a implementar]

### Por qué es importante
[Valor de negocio, dependencias bloqueadas, etc.]

### Enfoque elegido
[Arquitectura, patrón, tecnología seleccionada]

---

## 🏗️ Decisiones Arquitectónicas

### Decisión 1: [Título descriptivo]

**Problema**: [Qué necesitábamos decidir]

**Opciones consideradas**:
1. **Opción A**: [Descripción]
   - Pros: [Ventajas]
   - Contras: [Desventajas]

2. **Opción B**: [Descripción]
   - Pros: [Ventajas]
   - Contras: [Desventajas]

**Decisión final**: [Opción elegida]

**Razón**: [Por qué elegimos esta opción]

**Validación**: [Consultamos system-architect? Qué dijo?]

---

### Decisión 2: [Si hubo otra decisión importante]

[Mismo formato]

---

## 🔍 Análisis con Agentes

### system-architect
**Pregunta**: [Qué le preguntamos]

**Respuesta**: [Qué respondió]

**Acción tomada**: [Cómo aplicamos su recomendación]

### gap-analyzer (si se usó)
**Encontró duplicados**: ✅ Sí / ❌ No

**Detalles**: [Qué encontró y cómo se resolvió]

### bug-investigator (si se usó)
**Bug investigado**: [Descripción]

**Root cause**: [Qué encontró]

**Fix aplicado**: [Cómo se resolvió]

---

## 💻 Implementación

### Componentes Creados

#### [ComponentName].tsx
```tsx
// Pseudocódigo o snippet clave
interface ComponentProps {
  // Key props
}

export const Component: FC<ComponentProps> = (props) => {
  // Key logic
};
```

**Ubicación**: `src/path/to/component.tsx`

**Responsabilidad**: [Qué hace este componente]

**Patrones usados**:
- [Patrón 1]: Compound components
- [Patrón 2]: Custom hooks
- [Patrón 3]: EventBus integration

---

#### [ServiceName].ts

**Ubicación**: `src/path/to/service.ts`

**Responsabilidad**: [Qué hace este servicio]

**APIs expuestas**:
```typescript
export const ServiceAPI = {
  method1: (params) => Promise<Result>,
  method2: (params) => Promise<Result>,
};
```

**Integraciones**:
- EventBus: Emite `event.name`, escucha `response.event`
- Database: Tabla `table_name`
- External API: [Si aplica]

---

### Hooks Creados

#### useCustomHook
```typescript
export function useCustomHook(params) {
  // Key logic
  return { data, loading, error, actions };
}
```

**Ubicación**: `src/path/to/hooks/useCustomHook.ts`

**Responsabilidad**: [Qué maneja]

**Dependencies**: [Otros hooks o servicios]

---

### EventBus Integration

#### Events Emitted
```typescript
// Module A emits
eventBus.emit('domain.module.action', {
  // payload structure
  id: string;
  data: SomeType;
  timestamp: number;
});
```

#### Events Listened
```typescript
// Module B listens
eventBus.on('domain.module.action', async (payload) => {
  // Handler logic
  // Side effects
  // Response emission (if needed)
});
```

#### Deduplication Strategy
[Cómo prevenimos procesamiento duplicado]

---

## 🧪 Testing

### Unit Tests

**Archivos creados**:
- `src/path/to/Component.test.tsx`
- `src/path/to/service.test.ts`

**Cobertura**:
- Component: XX% (XX/XX lines)
- Service: XX% (XX/XX lines)

**Casos de prueba clave**:
1. [Test case 1]: [Qué valida]
2. [Test case 2]: [Qué valida]
3. [Test case 3]: [Qué valida]

### Integration Tests

**Archivo**: `src/__tests__/integration/[name].test.ts`

**Workflow testeado**: [Module A] → [EventBus] → [Module B]

**Resultado**: ✅ Passing / ⚠️  Warnings / ❌ Failing

---

## 🎨 Patrones de Código

### Patrón 1: [Nombre del patrón]
**Usado en**: [Dónde se aplicó]

**Ejemplo**:
```typescript
// Code example showing the pattern
```

**Beneficio**: [Por qué usamos este patrón]

---

### Patrón 2: [Otro patrón si aplica]
[Mismo formato]

---

## 🔧 Configuración y Setup

### Cambios en Registries

#### FeatureRegistry.ts
```typescript
// Si se agregó o modificó una feature
export const FEATURES = {
  // ...
  new_feature: {
    id: 'feature_id',
    name: 'Feature Name',
    domain: 'domain_name',
    // ...
  }
};
```

#### BusinessModelRegistry.ts
```typescript
// Si se agregó capability mapping
export const BUSINESS_MODELS = {
  // ...
};
```

### Module Manifest
```typescript
// Si se modificó manifest
export const moduleManifest: ModuleManifest = {
  // Changes
};
```

---

## 🐛 Problemas Encontrados y Resoluciones

### Problema 1: [Título descriptivo]

**Síntoma**: [Qué observamos]

**Root cause**: [Qué lo causaba]

**Investigación**:
1. [Paso 1 de debugging]
2. [Paso 2 de debugging]
3. [Paso 3 de debugging]

**Solución**: [Cómo se resolvió]

**Prevención**: [Cómo evitar en el futuro]

---

### Problema 2: [Si hubo otro]
[Mismo formato]

---

## 📚 Aprendizajes y Conocimientos

### Qué aprendimos
1. **[Lección 1]**: [Descripción]
2. **[Lección 2]**: [Descripción]
3. **[Lección 3]**: [Descripción]

### Qué funcionó bien
- [Práctica que dio buenos resultados]
- [Herramienta que fue útil]
- [Patrón que aceleró desarrollo]

### Qué mejorar
- [Algo que no funcionó bien]
- [Proceso que se puede optimizar]

### Para próximas sesiones
- [Recomendación 1]
- [Recomendación 2]

---

## 🔗 Referencias

### Código relacionado
- [Module/Component 1]: `src/path/to/reference.tsx`
- [Module/Component 2]: `src/path/to/reference.ts`

### Documentación consultada
- [Link 1]: [Descripción]
- [Link 2]: [Descripción]

### PRs / Issues relacionados
- [Link si aplica]

---

## 📊 Métricas de la Sesión

### Code Stats
- **Archivos creados**: X
- **Archivos modificados**: X
- **Líneas agregadas**: +XXX
- **Líneas eliminadas**: -XXX
- **Tests creados**: X

### Quality
- **TypeScript errors**: 0
- **ESLint warnings**: 0
- **Test coverage**: XX%
- **Build time**: X.Xs

### Time Breakdown
- **Planning**: XX min
- **Implementation**: XX min
- **Testing**: XX min
- **Debugging**: XX min
- **Documentation**: XX min

---

## ⏭️ Próximos Pasos

### Inmediatos (Próxima sesión)
1. [ ] [Task 1]
2. [ ] [Task 2]
3. [ ] [Task 3]

### Mediano plazo
- [ ] [Task o feature relacionada]
- [ ] [Refactoring pendiente]

### Deuda técnica identificada
- [ ] [Technical debt 1]
- [ ] [Technical debt 2]

---

## 📝 Notas Adicionales

[Cualquier otra información relevante que no cabe en las secciones anteriores]
