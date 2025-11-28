# Guía de Nomenclatura de Componentes para React Scan

## Problema

React Scan muestra nombres genéricos como `chakra(div)`, `Box`, `Stack` que dificultan identificar qué componentes se están re-renderizando.

## Soluciones

### 1. Agregar displayName a Componentes Memoizados

Ejecuta el script automático:

```bash
node scripts/add-display-names.mjs
```

O manualmente:

```typescript
const MyComponent = memo(function MyComponent() {
  return <div>...</div>;
});

// ✅ Agrega displayName
MyComponent.displayName = 'MyComponent';
```

### 2. Usar Nombres de Función Descriptivos

React infiere automáticamente el nombre si usas PascalCase:

```typescript
// ✅ React Scan mostrará "AlertCard"
const AlertCard = memo(function AlertCard({ alert }) {
  return <Box>...</Box>;
});
```

### 3. Crear Componentes Wrapper para Chakra UI

Para componentes de Chakra que se usan frecuentemente:

#### **Ejemplo: AlertContainer (wrapper de Box)**

```typescript
// src/shared/ui/AlertContainer.tsx
import { Box, type BoxProps } from '@chakra-ui/react';
import { memo } from 'react';

export const AlertContainer = memo(function AlertContainer(props: BoxProps) {
  return <Box {...props} />;
});
AlertContainer.displayName = 'AlertContainer';
```

#### **Ejemplo: AlertButton (wrapper de Button)**

```typescript
// src/shared/ui/AlertButton.tsx
import { Button, type ButtonProps } from '@/shared/ui';
import { memo } from 'react';

export const AlertButton = memo(function AlertButton(props: ButtonProps) {
  return <Button {...props} />;
});
AlertButton.displayName = 'AlertButton';
```

#### **Uso:**

```typescript
// ❌ Antes: React Scan muestra "Box" y "Button"
<Box>
  <Button onClick={...}>Action</Button>
</Box>

// ✅ Después: React Scan muestra "AlertContainer" y "AlertButton"
<AlertContainer>
  <AlertButton onClick={...}>Action</AlertButton>
</AlertContainer>
```

### 4. Componentes Específicos por Contexto

Crea componentes wrapper específicos para cada módulo:

```typescript
// src/pages/admin/supply-chain/materials/components/AlertComponents.tsx

export const MaterialAlertContainer = memo(function MaterialAlertContainer(props: BoxProps) {
  return <Box {...props} />;
});
MaterialAlertContainer.displayName = 'MaterialAlertContainer';

export const MaterialAlertButton = memo(function MaterialAlertButton(props: ButtonProps) {
  return <Button {...props} />;
});
MaterialAlertButton.displayName = 'MaterialAlertButton';

export const MaterialAlertStack = memo(function MaterialAlertStack(props: StackProps) {
  return <Stack {...props} />;
});
MaterialAlertStack.displayName = 'MaterialAlertStack';
```

## Componentes Problemáticos Identificados

Según React Scan, estos son los componentes con más renders:

1. **chakra(div)** - 739 renders
   - Solución: Crear wrappers específicos como `AlertContainer`, `CardContainer`

2. **chakra(button)** - 360 renders
   - Solución: Crear `AlertButton`, `ActionButton`

3. **Button** - 693 renders
   - Ya tiene nombre, pero considera wrappers específicos por contexto

4. **Stack** - 510 renders
   - Solución: Crear `AlertStack`, `CardStack`

## Estrategia Recomendada

### Fase 1: Componentes de Alta Frecuencia

Crear wrappers solo para los componentes más usados en áreas críticas:

```typescript
// src/shared/ui/wrappers/index.ts
export { AlertContainer } from './AlertContainer';
export { AlertButton } from './AlertButton';
export { AlertStack } from './AlertStack';
```

### Fase 2: Componentes por Módulo

Si necesitas más granularidad, crea wrappers por módulo:

```typescript
// src/modules/materials/components/ui/
MaterialsCard.tsx
MaterialsButton.tsx
MaterialsStack.tsx
```

### Fase 3: Verificación

1. Corre el script: `node scripts/add-display-names.mjs`
2. Usa React Scan en la interacción problemática
3. Verifica que los nombres sean más descriptivos

## Herramientas

### Script Automático

```bash
# Agrega displayName a componentes memoizados
node scripts/add-display-names.mjs
```

### React DevTools

Instala la extensión para ver nombres de componentes:
- Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/

### React Scan

Ya lo tienes instalado, úsalo para verificar mejoras:
- Captura el formatted data antes y después
- Compara el número de renders y nombres de componentes

## Notas

- **No edites node_modules**: Cualquier cambio se perderá al reinstalar
- **Wrapper overhead**: Los wrappers agregan una capa mínima de overhead, pero mejoran la trazabilidad
- **Trade-off**: Balance entre trazabilidad y simplicidad del código
