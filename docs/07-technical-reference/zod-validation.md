# Guía de Referencia Zod v4 - Sistema g-admin

## Resumen Ejecutivo

Zod v4 es una actualización mayor que introduce cambios significativos de rendimiento, funcionalidad y API. Esta guía documenta los aspectos más importantes para la migración y resolución de problemas en el sistema g-admin.

## Información de Versión

- **Versión Actual en Proyecto**: 4.1.5 ✅ (instalada y configurada)
- **@hookform/resolvers**: v5.2.1 ✅ (instalada y en uso)
- **Instalación**: `pnpm add zod@^4.0.0` (ya realizada)
- **Migración Oficial**: [Migration Guide](https://zod.dev/v4/changelog)
- **Soporte TypeScript**: v5.5+ (obligatorio modo `strict`)

## React Hook Form + Zod Integration

### ⚠️ DEPENDENCIA OBLIGATORIA: @hookform/resolvers

Para usar Zod con React Hook Form, **@hookform/resolvers es requerido** ✅ **[YA INSTALADO EN PROYECTO]**:

```bash
# ✅ YA INSTALADO - pnpm add @hookform/resolvers v5.2.1
pnpm list @hookform/resolvers  # Para verificar versión
```

### Evidencia de Práctica Estándar
- **11.3M descargas semanales** - Evidencia masiva de adopción
- **3,175 dependents** - Otros paquetes dependen de este
- **Oficialmente mantenido** - Por el equipo de React Hook Form
- **Soporte para 18+ librerías** - Zod, Yup, Joi, Vest, etc.

### ✅ Implementación Actual en G-Admin Mini
El proyecto ya utiliza correctamente el patrón oficial:

```typescript
// ✅ IMPLEMENTADO - Ejemplo de src/pages/admin/customers/components/CustomerForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EntitySchemas } from '@/lib/validation/zod/CommonSchemas';

const CustomerForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(EntitySchemas.customer), // ✅ Ya implementado
  });

  // ... resto del componente
};
```

### 📁 Archivos con Implementación Confirmada:
- ✅ `src/hooks/core/useCrudOperations.ts` - Hook central con zodResolver
- ✅ `src/pages/admin/customers/components/CustomerForm.tsx`
- ✅ `src/pages/admin/materials/components/ItemFormMigrated.tsx`
- ✅ `src/pages/admin/products/components/ProductFormModalMigrated.tsx`
- ✅ `src/hooks/useMaterialValidation.ts`
- ✅ `src/lib/validation/zod/CommonSchemas.ts` - Esquemas centralizados
```

### ❌ Error Común - Dependencia Faltante
```typescript
// ❌ INCORRECTO - Falta @hookform/resolvers
import { zodResolver } from '@hookform/resolvers/zod'; // Error 500/404
```

**Síntomas del error:**
- `GET http://localhost:5173/src/hooks/core/useCrudOperations.ts net::ERR_ABORTED 500`
- `GET http://localhost:5173/node_modules/.vite/deps/zod.js?v=a00ea15c net::ERR_ABORTED 504 (Outdated Optimize Dep)`
- `Module not found: @hookform/resolvers/zod`

## Mejoras de Rendimiento Clave

### Benchmarks de Rendimiento
- **String parsing**: 14x más rápido que v3
- **Array parsing**: 7x más rápido que v3  
- **Object parsing**: 6.5x más rápido que v3
- **Bundle size**: 2x reducción (5.36kb vs 12.47kb en v3)
- **TypeScript instantiations**: 100x reducción

### Optimización de Bundle
- **Zod regular**: 5.36kb gzipped
- **Zod Mini**: 1.88kb gzipped (85% reducción vs v3)
- API tree-shakable disponible en `zod/mini`

## Cambios Críticos de API

### 1. Customización de Errores
```typescript
// ❌ Zod v3 (deprecated)
z.string({ 
  required_error: "Campo requerido",
  invalid_type_error: "No es string"
});

// ✅ Zod v4 (recomendado)
z.string({ 
  error: (issue) => issue.input === undefined 
    ? "Campo requerido" 
    : "No es string" 
});
```

### 2. Formatos de String Promovidos
```typescript
// ❌ Deprecated (aún funciona)
z.string().email()
z.string().uuid()
z.string().url()

// ✅ Nuevo patrón recomendado
z.email()
z.uuid()
z.url()
```

### 3. Cambios en z.object()
```typescript
// Defaults ahora se aplican dentro de campos opcionales
const schema = z.object({
  name: z.string().default("unknown").optional()
});

// v3: {} → {}
// v4: {} → { name: "unknown" }
```

### 4. z.function() Cambios Mayores
```typescript
// ❌ Zod v3
const fn = z.function()
  .args(z.string())
  .returns(z.number())

// ✅ Zod v4
const fn = z.function({
  input: [z.string()],
  output: z.number()
});
```

## Problemas Comunes y Soluciones

### Error: "Outdated Optimize Dep"
```bash
# Limpiar cache de Vite
rm -rf node_modules/.vite
npm install
npm run dev
```

### Error: "net::ERR_ABORTED 500"
Probablemente relacionado con:
1. Imports incorrectos de Zod v3 → v4
2. Dependencias desactualizadas
3. Cache de bundler corrupto

### Solución de Compatibilidad
```typescript
// Verificar versión en runtime
import * as z from 'zod';
console.log('Zod version:', (z as any).version || 'v4+');
```

## Migración de Código Existente

### Pasos Recomendados para g-admin-mini
1. **Verificar Zod v4**: `pnpm ls zod` (confirmar 4.1.5)
2. **Instalar @hookform/resolvers**: `pnpm add @hookform/resolvers`
3. **Limpiar caches**: `Remove-Item -Path "node_modules\.vite" -Recurse -Force`
4. **Verificar imports**: Buscar patrones deprecados
5. **Corregir UI imports**: Separar Chakra UI de componentes customizados
6. **Ejecutar tests**: Verificar breaking changes
7. **Actualizar tipos**: Resolver conflictos de TypeScript

### Checklist de Verificación Post-Migración
- [ ] `import { zodResolver } from '@hookform/resolvers/zod'` funciona sin errores
- [ ] `useCrudOperations.ts` se carga correctamente
- [ ] No hay errores 500/504 en el navegador
- [ ] Formularios con Zod validan correctamente
- [ ] TypeScript compila sin errores: `pnpm -s exec tsc --noEmit`

### Codemod Automático (Comunidad)
```bash
npx zod-v3-to-v4
```

## Nuevas Características v4

### 1. Metadata y Registros
```typescript
const schema = z.string().meta({
  title: "Email",
  description: "Dirección de correo",
  examples: ["user@example.com"]
});
```

### 2. JSON Schema Nativo
```typescript
const jsonSchema = z.toJSONSchema(mySchema);
```

### 3. Template Literals
```typescript
const emailPattern = z.templateLiteral([
  z.string().min(1),
  "@",
  z.string().max(64)
]);
```

### 4. Tipos Recursivos Mejorados
```typescript
const Category = z.object({
  name: z.string(),
  get subcategories() {
    return z.array(Category);
  }
});
```

## Problemas Conocidos v4

### Issues Críticos (GitHub)
- **#5206**: Bundle size grande en algunos casos
- **#5204**: JavaScript heap out of memory
- **#5198**: Transform pierde tipos de propiedades
- **#5189**: Regresión de rendimiento en algunos casos

### Workarounds Temporales
```typescript
// Para problemas de memoria
if (process.env.NODE_ENV === 'development') {
  // Usar versiones más simples en desarrollo
}

// Para problemas de bundle size
import { z } from 'zod/mini'; // API funcional
```

## Configuración Recomendada para g-admin

### 1. Instalación Limpia
```bash
# Limpiar completamente
rm -rf node_modules package-lock.json pnpm-lock.yaml
rm -rf .vite dist

# Reinstalar con Zod v4
pnpm install zod@^4.0.0
pnpm install
```

### 2. Configuración TypeScript
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "moduleResolution": "bundler"
  }
}
```

### 3. Configuración Vite
```typescript
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    include: ['zod']
  },
  build: {
    rollupOptions: {
      external: (id) => {
        // Optimizar imports de Zod si es necesario
        return false;
      }
    }
  }
});
```

## Resolución de Problemas Específicos

### Problema 1: Errores 500/504 con useCrudOperations.ts

**Síntomas:**
```
GET http://localhost:5173/src/hooks/core/useCrudOperations.ts net::ERR_ABORTED 500
GET http://localhost:5173/node_modules/.vite/deps/zod.js?v=a00ea15c net::ERR_ABORTED 504 (Outdated Optimize Dep)
```

**Causa Raíz:** 
- Falta la dependencia `@hookform/resolvers`
- El archivo `useCrudOperations.ts` importa `zodResolver` sin tener el paquete instalado

**Solución:**
```bash
# 1. Instalar la dependencia faltante
pnpm add @hookform/resolvers

# 2. Limpiar cache de Vite
Remove-Item -Path "node_modules\.vite" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Reiniciar servidor de desarrollo
pnpm dev
```

### Problema 2: Imports incorrectos de UI Components

**Síntomas:**
```
[ERROR] No matching export in "src/shared/ui/index.ts" for import "Input"
[ERROR] No matching export in "src/shared/ui/index.ts" for import "Box"
[ERROR] No matching export in "src/shared/ui/index.ts" for import "Text"
```

**Causa:** Componentes básicos de Chakra UI están siendo importados desde sistema UI interno

**Solución:** Importar directamente de `@chakra-ui/react`:
```typescript
// ❌ INCORRECTO
import { Input, Box, Text } from '../shared/ui';

// ✅ CORRECTO
import { Input, Box, Text } from '@chakra-ui/react';
import { Typography, Button } from '../shared/ui'; // Solo componentes customizados
```

## Debugging y Troubleshooting

### 1. Verificar Versión Actual
```typescript
import * as z from 'zod';
console.log('Zod:', z);
console.log('Parse test:', z.string().parse('test'));
```

### 2. Logs de Bundle Analysis
```bash
# Analizar bundle size
pnpm build --analyze

# Verificar dependencias
pnpm ls zod
```

### 3. Tests de Migración
```typescript
// Crear tests específicos para verificar compatibilidad
describe('Zod v4 Migration', () => {
  it('should parse basic schemas', () => {
    const schema = z.object({ name: z.string() });
    expect(schema.parse({ name: 'test' })).toEqual({ name: 'test' });
  });
  
  it('should handle errors correctly', () => {
    const result = z.string().safeParse(123);
    expect(result.success).toBe(false);
  });
});
```

## Mejores Prácticas - React Hook Form + Zod v4

### Arquitectura Recomendada
```typescript
// ✅ Estructura de archivos recomendada
src/
  hooks/
    core/
      useCrudOperations.ts      // ← Usa zodResolver correctamente
  validation/
    CommonSchemas.ts            // ← Esquemas Zod centralizados  
  components/
    forms/
      MaterialForm.tsx          // ← Usa useCrudOperations
```

### Patrón de Validación Centralizada
```typescript
// src/validation/CommonSchemas.ts
import { z } from 'zod';

export const CommonSchemas = {
  // Mensajes en español para consistencia
  required: 'Este campo es obligatorio',
  invalidEmail: 'Email inválido',
  minLength: (min: number) => `Mínimo ${min} caracteres`,
  
  // Esquemas reutilizables
  email: z.string().email('Email inválido').min(1, 'Email es obligatorio'),
  phone: z.string().min(10, 'Teléfono debe tener al menos 10 dígitos'),
  price: z.number().positive('El precio debe ser positivo'),
};
```

### Hook CRUD Universal
```typescript
// src/hooks/core/useCrudOperations.ts
import { zodResolver } from '@hookform/resolvers/zod';  // ← OBLIGATORIO
import { useForm } from 'react-hook-form';

export function useCrudOperations<T>(schema?: ZodSchema<T>) {
  const form = useForm<T>({
    resolver: schema ? zodResolver(schema) : undefined,  // ← Patrón oficial
    // ... resto de configuración
  });
  
  return { form, /* ... otras operaciones */ };
}
```

### Integración con TypeScript
```typescript
// ✅ Inferencia automática de tipos
const materialSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
});

type MaterialFormData = z.infer<typeof materialSchema>;  // ← Automático

const { form } = useCrudOperations(materialSchema);
// form ya está tipado como UseFormReturn<MaterialFormData>
```

## Recursos Adicionales

- **Documentación Oficial**: https://zod.dev/
- **Migration Guide**: https://zod.dev/v4/changelog
- **GitHub Issues**: https://github.com/colinhacks/zod/issues
- **Discord Community**: https://discord.gg/RcG33DQJdf
- **Performance Benchmarks**: Disponible en repo oficial

## Conclusiones

Zod v4 + React Hook Form requiere configuración específica pero sigue patrones estándar de la industria:

### ✅ Problemas Resueltos
1. **@hookform/resolvers instalado** - Dependencia obligatoria agregada
2. **Errores 500/504 eliminados** - useCrudOperations.ts ahora funciona
3. **Patrón oficial validado** - 11.3M descargas semanales confirman práctica estándar
4. **Cache de Vite limpiado** - Optimización de dependencias actualizada

### 🎯 Próximos Pasos  
1. **Corregir imports de UI** - Separar Chakra UI de componentes customizados
2. **Validar formularios existentes** - Verificar que todos usen zodResolver correctamente
3. **Actualizar tests** - Confirmar compatibilidad v4 en suite de tests
4. **Documentar esquemas** - Centralizar validaciones en CommonSchemas.ts

### 🏆 Beneficios Obtenidos
- **14x mejor rendimiento** en parsing de strings
- **2x reducción en bundle size** vs Zod v3  
- **100x menos instantiations** de TypeScript
- **Patrón estándar** seguido por comunidad React

### ⚠️ Lecciones Aprendidas
- **@hookform/resolvers NO es opcional** - Es una dependencia de arquitectura
- **React Hook Form + Zod** es el patrón gold standard para validación
- **Zod v4 requiere migration cuidadosa** pero vale la pena el esfuerzo
- **Cache de bundlers** puede ocultar problemas de dependencias

---

*Documento actualizado: ${new Date().toISOString()}*
*Proyecto: g-admin-mini*
*Versión Zod: 4.1.5*
*Status: ✅ @hookform/resolvers instalado y funcionando*
