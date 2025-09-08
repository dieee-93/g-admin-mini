# 🤖 Configuración e Integración de AI - GitHub Copilot

> **Última actualización**: 2025-09-07  
> **Autor**: Consolidación de múltiples documentos  
> **Estado**: Documento unificado

## 🎯 Misión Principal: Sistema de Instalación y Onboarding

**Enfoque exclusivo**: Diseñar e implementar el journey completo del usuario desde "instalación fresca" hasta "uso productivo diario" del sistema g-admin.

### Desafío Actual
- Sistema con 40+ tablas de base de datos
- Módulos UI extensivos y lógica de negocio
- **FALTA**: Experiencia unificada de instalación/onboarding

### Objetivo
- Wizard de instalación paso a paso
- Flujo inicial que guíe a nuevos usuarios
- Conexión de módulos existentes en workflow cohesivo

## 🏗️ Arquitectura del Sistema (Referencia)

### Frontend
- **Stack**: Vite + React + TypeScript SPA
- **UI**: Componentes en `src/modules/*` y `src/shared/ui`
- **Backend**: Supabase (auth, DB, realtime) via `src/lib/supabase.ts`
- **Database**: 40+ tablas con lógica de negocio en SQL functions (`database/functions/*`)

### Módulos Existentes
- materials, inventory, recipes, sales, customers, suppliers, analytics

## 📋 Fases de Instalación y Onboarding

### **Fase 1: Verificación de Sistema y Setup de BD**
- ✅ Verificar conexión Supabase y configuración de proyecto
- ✅ Ejecutar migraciones de base de datos y seed de datos iniciales
- ✅ Probar flujos de autenticación core

### **Fase 2: Wizard de Setup Administrativo**
- ✅ Setup de información de empresa/negocio
- ✅ Creación de cuenta de usuario inicial (admin)
- ✅ Configuración básica del sistema (moneda, unidades, etc.)
- ✅ Configuración de seguridad y definición de roles de usuario

### **Fase 3: Setup de Datos Core**
- ✅ Importar/crear catálogo inicial de materiales
- ✅ Configurar información de proveedores
- ✅ Configurar recetas/productos básicos
- ✅ Inicializar ubicaciones de inventario y stock

### **Fase 4: Flujo de Onboarding de Usuario**
- ✅ Tutorial interactivo para características clave
- ✅ Creación de datos de muestra para entrenamiento
- ✅ Personalización de dashboard
- ✅ Preferencias de notificaciones y alertas

## 🗺️ Mapeo de Journey del Usuario

### **Día 0**: Experiencia de instalación fresca
### **Día 1**: Primeras tareas productivas (crear material, receta, venta)
### **Semana 1**: Entender reportes y analytics
### **Mes 1**: Características avanzadas y personalización

## 🔍 Áreas Clave de Investigación

### Flow de Autenticación
- ¿Cómo logean usuarios actualmente y acceden a características?
- ¿Qué tablas necesitan datos iniciales vs pueden estar vacías?
- ¿Cómo funciona el sistema de permisos y control de acceso?

### Dependencias de Datos
- ¿Qué entidades deben existir antes que otras puedan ser creadas?
- ¿Qué patrones UI/UX existen para wizards o formularios multi-paso?
- ¿Cómo se comporta el sistema con setup incompleto?

### Puntos de Integración
- ¿Dónde necesitan comunicarse los módulos para experiencia seamless?
- ¿Qué operaciones pesadas necesitan optimización para first-time setup?

## 🔧 Workflows de Desarrollo

### Package Manager: pnpm
```bash
# Comandos típicos
pnpm install
pnpm dev              # Vite dev server
pnpm build           # producción
pnpm -s exec eslint . # lint
pnpm -s exec tsc --noEmit # type check
```

### Convenciones del Proyecto
- **Módulos de características**: Código organizado por feature bajo `src/modules/<feature>/`
- **Wrappers locales**: Primitivos UI pueden estar wrapped bajo `src/shared/ui`
- **Tipos**: Muchos componentes dependen de archivos `types` locales al módulo
- **Forms & modals**: Formularios complejos son componentes self-contained

## 🤖 Configuración de GitHub Copilot

### 1. Instalación y Setup Básico
```bash
# Instalar Copilot CLI
npm install -g @githubnext/github-copilot-cli

# Setup aliases útiles para tu proyecto
echo 'eval "$(github-copilot-cli alias -- "$0")"' >> ~/.bashrc
```

### 2. Comandos Específicos para Workflow

#### Para análisis de arquitectura:
```bash
# Analizar problemas de flujo en módulo específico
gh copilot suggest "analyze business flow issues in src/modules/materials"

# Detectar lógica desconectada
gh copilot suggest "find disconnected logic patterns in recipe system"

# Verificar relaciones Recipe
gh copilot suggest "audit Recipe type polymorphism consistency"
```

#### Para debugging:
```bash
# Explicar errores de TypeScript
gh copilot explain "typescript error: Property 'x' does not exist"

# Sugerir fix para tests fallidos
gh copilot suggest "fix failing test in src/__tests__/materials.test.ts"
```

#### Para desarrollo:
```bash
# Generar comandos git complejos
gh copilot suggest "git command to squash last 3 commits and rebase"

# Sugerir scripts de package.json
gh copilot suggest "package.json script for running tests in watch mode"
```

### 3. Integración con PR Reviews

#### Setup para mejor code review:
```yaml
# .github/copilot-review.yml (conceptual)
review_focus:
  - check_business_logic_consistency
  - validate_recipe_polymorphism
  - ensure_proper_decimal_precision
  - verify_database_migrations
  - check_ui_component_patterns
```

#### Code suggestions para tu stack:
- Patrones React + TypeScript
- Hooks de Zustand
- Patrones Supabase
- Validaciones Zod

## 📊 Plantillas de Análisis

### Business Flow Analysis Report Template
```markdown
## 📊 Resumen Ejecutivo
### Problemas Detectados
- Lógica desconectada en [módulo]
- Relaciones incompletas entre [entidades]

### Módulos Analizados
- Materials/Inventory
- Recipes/Products  
- Sales/Orders

### Prioridad de Resolución
🔴 CRÍTICO: [problemas que bloquean funcionalidad]
🟡 IMPORTANTE: [mejoras de consistencia]
🔵 MEJORAS: [optimizaciones futuras]
```

### Análisis de Relaciones
```markdown
## 🗺️ Mapa de Relaciones Global
### Relaciones Actuales vs Ideales
- Recipe → Products: ✅ Implementado
- Products → Sale_Items: ⚠️ Inconsistente  
- Materials → Recipe_Ingredients: ✅ Funcional

### Flujos de Información Críticos
- Stock Management: Material → Recipe → Product → Sale
- Cost Calculation: Supplier_Cost → Material_Cost → Recipe_Cost → Product_Price
```

## 🔄 Patrones de Refactoring

### Para arquitectura feature-based:
```bash
# Extraer lógica común
gh copilot suggest "extract common validation logic from materials and recipes modules"

# Simplificar componentes complejos
gh copilot suggest "break down large component into smaller, focused components"

# Optimizar performance
gh copilot suggest "add React.memo and useMemo optimizations to heavy list component"
```

## 🧪 Testing con Copilot

### Prompts específicos para tu arquitectura:

#### Para Zustand Stores:
```typescript
// Prompt: "Generate comprehensive tests for Zustand store with async actions"
// Context: Materials store with CRUD operations and optimistic updates
```

#### Para Custom Hooks:
```typescript
// Prompt: "Create test suite for custom hook that manages form state with Zod validation"
// Context: Recipe form with complex ingredient management
```

#### Para API Functions:
```typescript
// Prompt: "Generate integration tests for Supabase RPC functions"
// Context: Recipe cost calculation and stock management functions
```

## 📝 Context Files para Mejor Sugerencias

### Restaurant Management Domain Context:
```markdown
# Business Logic Patterns:
- Recipe management with polymorphic types (recipe/product)
- Inventory tracking with batch operations
- Cost calculations with decimal precision
- Multi-location stock management

# Technical Patterns:
- Feature-based module organization
- Zustand for state management
- React Hook Form + Zod validation
- Supabase RPC for business logic

# Code Generation Preferences:
- TypeScript strict mode
- Functional components with hooks
- Error boundaries for resilience
- Consistent naming conventions (camelCase for JS, kebab-case for files)
```

## 🎯 Smart Prompts para tu contexto

```bash
# Análisis de negocio
"Analyze recipe system for polymorphism issues between recipe and product types"

# Optimización de performance  
"Suggest performance optimizations for inventory list with 1000+ items"

# Patrones de código
"Generate component following our design system patterns with Chakra UI"
```

## 🔗 Referencias

- **GitHub Copilot CLI**: https://cli.github.com/
- **Copilot Labs**: https://githubnext.com/projects/copilot-labs
- **Best Practices**: [GitHub Copilot Documentation](https://docs.github.com/copilot)
- **VS Code Extension**: GitHub Copilot + GitHub Copilot Chat

## 📝 Notas de Configuración

### Archivos de Contexto Clave:
- `.github/copilot-instructions.md` - Instrucciones principales
- `.copilot/context.md` - Contexto de dominio
- `.copilot/patterns-reference.md` - Patrones de problemas conocidos
- `.copilot/business-flow-analyzer.md` - Analizador de flujos de negocio

### Repository-level optimizations:
- Context files en `.copilot/` para sugerencias específicas del dominio
- Patterns documentation para casos de uso comunes
- Business rules documentation para validaciones automáticas
