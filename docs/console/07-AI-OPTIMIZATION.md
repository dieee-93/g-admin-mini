# 🎧 ConsoleHelper - AI Optimization Guide

## 🤖 Optimización para Análisis con IA (Claude, ChatGPT, etc.)

Esta guía está diseñada específicamente para **consumo por IA**, documentando estrategias para minimizar tokens y maximizar información útil.

---

## 🎯 Por Qué ConsoleHelper Existe

### Problema Original
**Chrome DevTools MCP** herramienta `list_console_messages` retorna **123,000 tokens** de logs, lo cual:
- ❌ Excede límite de 25K tokens de Claude
- ❌ Falla con error de overflow
- ❌ 95% del contenido es ruido irrelevante

### Solución: ConsoleHelper
- ✅ Reduce 123K → **<1K tokens** con filtrado inteligente
- ✅ Formato compacto optimizado para parsing
- ✅ Truncamiento automático de campos largos
- ✅ Eliminación de duplicados

**Ahorro**: ~99% reducción de tokens sin pérdida de información crítica

---

## 📊 Token Efficiency Comparison

| Método | Tokens | Información | Uso Recomendado |
|--------|--------|-------------|-----------------|
| `list_console_messages` | 123,000 | 100% (con 95% ruido) | ❌ Never |
| `exportFull(1000)` | ~10,000 | 100% | ⚠️ Rarely (offline analysis) |
| `exportFull(100)` | ~1,000 | 100% (últimos 100) | ⚠️ Occasionally |
| `exportForAI()` default | ~600 | 90% (últimos 50, 60s) | ✅ Daily debugging |
| `exportForAI({ level: 'error' })` | ~300-500 | 95% (solo errores) | ✅✅ Error analysis |
| `getSummary()` | ~50 | 60% (overview) | ✅✅✅ Quick checks |

---

## 🔧 1. API Methods - Token Cost Analysis

### Ultra-Compact (~50 tokens)

```javascript
__CONSOLE_HELPER__.getSummary()
// {
//   active: true,
//   total: 150,
//   errors: 2,
//   warnings: 5,
//   topModule: 'NavigationContext',
//   uptime: '45s'
// }
```

**Uso**: Primer paso de debugging - overview rápido

---

### Compact (~300-600 tokens)

```javascript
__CONSOLE_HELPER__.exportForAI({ level: 'error' })
// [
//   { time: "14:32:15.123", lvl: "E", mod: "MaterialsStore", ... }
// ]
```

**Uso**: Análisis de errores específicos

---

### Medium (~1K tokens)

```javascript
__CONSOLE_HELPER__.exportForAI({ 
  module: 'Materials',
  limit: 30 
})
```

**Uso**: Deep-dive en módulo problemático

---

### Large (~10K tokens - usar con moderación)

```javascript
__CONSOLE_HELPER__.exportFull(100)
```

**Uso**: Análisis offline, debugging extremo

---

## 🎯 2. Prompts Optimizados para IA

### Template: Error Analysis

```
Analiza estos logs de error de G-Mini v3.1:

[Ejecutar en Chrome DevTools]:
__CONSOLE_HELPER__.exportForAI({ level: 'error' })

[Resultado aquí]

Contexto:
- Sistema: React 19 + Zustand + Supabase
- Módulo: [nombre del módulo problemático]
- Issue: [descripción breve del problema]

Preguntas:
1. ¿Cuál es la causa raíz del error?
2. ¿Hay un patrón en los timestamps?
3. ¿Qué módulos están afectados?
4. ¿Cuál es el fix recomendado?

Responde en formato estructurado.
```

**Tokens**: ~700-1,000 (prompt + logs + contexto)

---

### Template: Performance Analysis

```
Analiza performance issues en G-Mini:

[Ejecutar]:
const report = {
  summary: __CONSOLE_HELPER__.getSummary(),
  topModules: __CONSOLE_HELPER__.getTopModules(10),
  renders: __CONSOLE_HELPER__.search('RENDER', 30)
};

[Resultado aquí]

Issue: [ej: Navegación lenta, re-renders infinitos]

Identifica:
1. Módulos con excesivos renders
2. Posibles causas (useEffect, state changes)
3. Fix prioritizado por impacto

Formato: Lista numerada, concisa.
```

**Tokens**: ~900-1,200

---

### Template: Module Deep-Dive

```
Debug profundo de módulo [ModuleName]:

[Ejecutar]:
__CONSOLE_HELPER__.exportForAI({ 
  module: '[ModuleName]',
  limit: 30
})

[Resultado aquí]

Buscar:
- Errores silenciosos
- Warnings recurrentes
- Patrones anormales
- Timing issues

Output: Bullet points con findings + recomendaciones.
```

**Tokens**: ~800-1,000

---

## 📈 3. Token Reduction Strategies

### Strategy 1: Filtrado Agresivo

**❌ BAD** (~10K tokens):
```javascript
__CONSOLE_HELPER__.exportFull(1000)
```

**✅ GOOD** (~600 tokens):
```javascript
__CONSOLE_HELPER__.exportForAI({ 
  level: 'error',
  limit: 20 
})
```

**Reducción**: 94%

---

### Strategy 2: Export Incremental

En lugar de 1 export grande:

```javascript
// ❌ BAD - 1 export de 5K tokens
__CONSOLE_HELPER__.exportFull(500)

// ✅ GOOD - 3 exports de 600 tokens c/u
const errors = __CONSOLE_HELPER__.exportForAI({ level: 'error' });
const warnings = __CONSOLE_HELPER__.exportForAI({ level: 'warn' });
const moduleContext = __CONSOLE_HELPER__.exportForAI({ module: 'X', limit: 20 });

// Enviar a IA en mensajes separados
```

**Ventaja**: IA puede procesar incrementalmente y pedir más si necesita

---

### Strategy 3: Summarize First, Detail Later

```
// Message 1 a IA (~100 tokens)
"Tengo un problema con el módulo Materials. Quick summary:
[paste __CONSOLE_HELPER__.getSummary()]
[paste __CONSOLE_HELPER__.getTopModules(5)]

¿Qué info adicional necesitas?"

// IA responde: "Envía errores del módulo Materials"

// Message 2 (~500 tokens)
"Aquí están:
[paste __CONSOLE_HELPER__.exportForAI({ module: 'Materials', level: 'error' })]"
```

**Ventaja**: Conversación iterativa vs dump masivo

---

## 🎨 4. Formato de Export Optimizado

### Estructura Compacta

ConsoleHelper usa formato compacto por defecto:

```javascript
// Full format (~200 tokens por log)
{
  timestamp: 1703512345678,
  level: 'error',
  module: 'MaterialsStore',
  domain: 'Stores',
  message: 'Failed to fetch materials from Supabase API',
  data: { error: 'Network timeout', retryCount: 3 },
  stack: 'Error: Network timeout\n  at fetchMaterials...'
}

// Compact format (~40 tokens por log) ✅
{
  time: "14:32:15.123",
  lvl: "E",
  mod: "MaterialsStore",
  dom: "Stores",
  msg: "Failed to fetch materials...",
  data: "{error:'Network timeout'}"
}
```

**Ahorro**: 80% por log

---

### Custom Ultra-Compact Format

Si necesitas aún menos tokens:

```javascript
function ultraCompactExport(options = {}) {
  const logs = __CONSOLE_HELPER__.exportForAI(options);
  
  // Format: time|lvl|mod|msg
  return logs.map(log => 
    `${log.time}|${log.lvl}|${log.mod}|${log.msg.substring(0, 50)}`
  ).join('\n');
}

// Usage
const ultra = ultraCompactExport({ level: 'error' });
console.log(ultra);
// 14:32:15.123|E|MaterialsStore|Failed to fetch materials...
// 14:32:16.456|E|SalesStore|Order validation failed...
```

**Ahorro**: 90% vs formato completo

**Costo**: Pierde `domain` y `data`, menos legible

---

## 🧠 5. IA-Friendly Report Formats

### Format 1: Executive Summary

**Tokens**: ~200

```javascript
const executive = {
  timestamp: new Date().toISOString(),
  summary: __CONSOLE_HELPER__.getSummary(),
  topIssues: __CONSOLE_HELPER__.getErrors(3).map(e => e.message),
  topModules: __CONSOLE_HELPER__.getTopModules(3),
  recommendation: "Focus on: " + __CONSOLE_HELPER__.getSummary().topModule
};

copy(JSON.stringify(executive, null, 2));
```

**Uso**: Primer contacto con IA

---

### Format 2: Detailed Report

**Tokens**: ~1,000

```javascript
const detailed = {
  timestamp: new Date().toISOString(),
  summary: __CONSOLE_HELPER__.getSummary(),
  stats: __CONSOLE_HELPER__.getStats(),
  errors: __CONSOLE_HELPER__.exportForAI({ level: 'error', limit: 10 }),
  warnings: __CONSOLE_HELPER__.exportForAI({ level: 'warn', limit: 10 }),
  topModules: __CONSOLE_HELPER__.getTopModules(10)
};

copy(JSON.stringify(detailed, null, 2));
```

**Uso**: Análisis profundo

---

### Format 3: Timeline Report

**Tokens**: ~600-800

```javascript
const timeline = {
  period: "Last 60 seconds",
  logs: __CONSOLE_HELPER__.exportForAI({ 
    since: Date.now() - 60000,
    limit: 40
  }).map(log => ({
    t: log.time,
    l: log.lvl,
    m: log.mod,
    msg: log.msg.substring(0, 40)
  }))
};

copy(JSON.stringify(timeline, null, 2));
```

**Uso**: Debugging de secuencias temporales

---

## 🎯 6. Context Management

### Minimum Context (~300 tokens)

```javascript
// Solo lo esencial para IA
{
  system: "G-Mini v3.1",
  issue: "Materials page not loading",
  errors: __CONSOLE_HELPER__.getErrors(5)
}
```

**Cuándo**: Debugging simple, respuesta rápida

---

### Medium Context (~800 tokens)

```javascript
// Contexto + datos
{
  system: "G-Mini v3.1 - React 19 + Zustand + Supabase",
  issue: "Performance degradation after navigation",
  summary: __CONSOLE_HELPER__.getSummary(),
  errors: __CONSOLE_HELPER__.exportForAI({ level: 'error' }),
  context: __CONSOLE_HELPER__.getTopModules(5)
}
```

**Cuándo**: Debugging standard, la mayoría de casos

---

### Full Context (~1,500 tokens)

```javascript
// Contexto completo + timeline
{
  system: "G-Mini v3.1",
  architecture: "React 19 + Zustand stores + Supabase + EventBus",
  issue: "Complex navigation bug",
  summary: __CONSOLE_HELPER__.getSummary(),
  stats: __CONSOLE_HELPER__.getStats(),
  errors: __CONSOLE_HELPER__.exportForAI({ level: 'error', limit: 15 }),
  warnings: __CONSOLE_HELPER__.exportForAI({ level: 'warn', limit: 15 }),
  timeline: __CONSOLE_HELPER__.exportForAI({ since: Date.now() - 120000, limit: 30 }),
  topModules: __CONSOLE_HELPER__.getTopModules(10)
}
```

**Cuándo**: Issues complejos que requieren análisis holístico

---

## 🔍 7. Prompt Engineering for ConsoleHelper

### Good Prompts ✅

#### Ejemplo 1: Error Diagnosis
```
Analiza estos errores de G-Mini:

[logs from exportForAI({ level: 'error' })]

Dame:
1. Root cause (1 línea)
2. Affected modules (lista)
3. Fix steps (numerado, máx 5 pasos)

Keep it concise.
```

**Por qué funciona**:
- Datos específicos (solo errores)
- Output estructurado pedido
- Límites claros (5 pasos máx)

---

#### Ejemplo 2: Performance Analysis
```
Tengo re-renders excesivos en G-Mini. Logs:

[logs from search('RENDER', 30)]

Identifica:
- Top 3 módulos problemáticos
- Causa probable c/u (1 línea)
- Fix prioritized by impact

Format: Tabla markdown
```

**Por qué funciona**:
- Problema específico (re-renders)
- Datos filtrados (solo RENDER logs)
- Formato de output especificado

---

### Bad Prompts ❌

#### Ejemplo 1: Demasiado Vago
```
"Aquí están mis logs, ¿qué está mal?"

[10,000 tokens de logs sin filtrar]
```

**Por qué falla**:
- No especifica el problema
- Demasiados datos sin filtrar
- No pide output específico

---

#### Ejemplo 2: Sin Contexto
```
"Fix this error:

{ lvl: 'E', msg: 'Failed to fetch' }"
```

**Por qué falla**:
- Log único sin contexto
- No dice qué módulo, cuándo, por qué
- IA no puede inferir root cause

---

## 🎓 8. Best Practices para IA

### DO ✅

1. **Filtrar antes de enviar**
   ```javascript
   // ✅ Filtrado
   exportForAI({ level: 'error', module: 'Materials' })
   
   // ❌ Sin filtrar
   exportFull(1000)
   ```

2. **Proporcionar contexto mínimo**
   ```
   "G-Mini v3.1, React 19, módulo Materials, error en fetch"
   
   vs
   
   "Tengo un error" ❌
   ```

3. **Usar formato compacto**
   ```javascript
   // ✅ Compact
   exportForAI()
   
   // ❌ Full
   exportFull()
   ```

4. **Especificar output esperado**
   ```
   "Dame: 1) Root cause, 2) Fix steps (max 3)"
   
   vs
   
   "Ayuda" ❌
   ```

---

### DON'T ❌

1. **No enviar logs sin filtrar**
   ```javascript
   // ❌ 10K tokens
   __CONSOLE_HELPER__.exportFull(1000)
   ```

2. **No hacer dump masivo**
   ```
   "Aquí hay 5000 líneas de logs, analiza todo" ❌
   ```

3. **No omitir contexto crítico**
   ```
   "[logs]" ❌
   
   vs
   
   "G-Mini v3.1, módulo X, error Y [logs]" ✅
   ```

4. **No pedir análisis general**
   ```
   "¿Qué opinas de estos logs?" ❌
   
   vs
   
   "¿Cuál es la causa de este error X?" ✅
   ```

---

## 🚀 9. Advanced AI Workflows

### Workflow 1: Iterative Debugging

```
Human → IA:
"Summary: [getSummary()]
Tengo errores en Materials. ¿Qué necesitas?"

IA → Human:
"Envía: getErrors(5) + getByModule('Materials', 10)"

Human → IA:
"Aquí: [logs]"

IA → Human:
"Root cause: RLS policy blocking. Fix: [steps]"
```

**Ventaja**: ~1K tokens total vs 10K+ dump

---

### Workflow 2: Automated Reports

```javascript
// Script que genera report automático
function generateAIReport() {
  const hasCriticalErrors = __CONSOLE_HELPER__.getSummary().errors > 5;
  
  if (!hasCriticalErrors) {
    return { status: 'healthy', summary: __CONSOLE_HELPER__.getSummary() };
  }
  
  return {
    status: 'needs_attention',
    summary: __CONSOLE_HELPER__.getSummary(),
    errors: __CONSOLE_HELPER__.exportForAI({ level: 'error', limit: 10 }),
    topModules: __CONSOLE_HELPER__.getTopModules(5),
    prompt: "Analiza estos errores críticos y sugiere fix prioritizado."
  };
}

const report = generateAIReport();
copy(JSON.stringify(report, null, 2));
```

---

### Workflow 3: Multi-Stage Analysis

**Stage 1**: High-level overview (~100 tokens)
```javascript
__CONSOLE_HELPER__.getSummary()
```

**Stage 2**: Identify problem area (~300 tokens)
```javascript
__CONSOLE_HELPER__.getTopModules(10)
__CONSOLE_HELPER__.getSummary()
```

**Stage 3**: Deep-dive (~800 tokens)
```javascript
__CONSOLE_HELPER__.exportForAI({ 
  module: '[identified problem module]',
  limit: 30
})
```

**Total**: ~1,200 tokens (vs 10K+ en 1 stage)

---

## 📚 10. Token Budgeting Guide

### Small Budget (500-1K tokens)

**Use**:
- `getSummary()` (~50)
- `exportForAI({ level: 'error' })` (~300-500)
- Contexto minimal (~100)

**Total**: ~500-700 tokens

**Good for**: Error analysis simple, quick debugging

---

### Medium Budget (1K-3K tokens)

**Use**:
- `getSummary()` (~50)
- `getStats()` (~300)
- `exportForAI({ level: 'error', limit: 20 })` (~600)
- `exportForAI({ level: 'warn', limit: 20 })` (~600)
- `getTopModules(10)` (~200)
- Contexto (~200)

**Total**: ~2K tokens

**Good for**: Debugging standard, performance analysis

---

### Large Budget (3K-5K tokens)

**Use**:
- Full reports (~1,500)
- Timeline analysis (~800)
- Multiple module deep-dives (~1,000 each)
- Contexto extenso (~500)

**Total**: ~4K tokens

**Good for**: Complex issues, architectural problems

---

## 🎯 Summary: Guía Rápida para IA

| Situación | Comando | Tokens | Propósito |
|-----------|---------|--------|-----------|
| **Quick check** | `getSummary()` | ~50 | Overview rápido |
| **Error simple** | `exportForAI({ level: 'error' })` | ~300-500 | Análisis de errores |
| **Performance issue** | `search('RENDER', 30)` + `getTopModules()` | ~600-800 | Detectar re-renders |
| **Module deep-dive** | `exportForAI({ module: 'X', limit: 30 })` | ~800-1K | Debugging específico |
| **Complex issue** | Full report (ver sección 5) | ~1-2K | Análisis holístico |

---

## 🤖 IA-Optimized Cheatsheet

```javascript
// === ULTRA-COMPACT (50 tokens) ===
__CONSOLE_HELPER__.getSummary()

// === COMPACT (300-600 tokens) ===
__CONSOLE_HELPER__.exportForAI({ level: 'error' })
__CONSOLE_HELPER__.exportForAI({ module: 'X', limit: 20 })

// === MEDIUM (800-1K tokens) ===
{
  summary: __CONSOLE_HELPER__.getSummary(),
  errors: __CONSOLE_HELPER__.exportForAI({ level: 'error' }),
  context: __CONSOLE_HELPER__.getTopModules(5)
}

// === DETAILED (1-2K tokens) ===
{
  summary: __CONSOLE_HELPER__.getSummary(),
  stats: __CONSOLE_HELPER__.getStats(),
  errors: __CONSOLE_HELPER__.exportForAI({ level: 'error', limit: 15 }),
  warnings: __CONSOLE_HELPER__.exportForAI({ level: 'warn', limit: 15 }),
  topModules: __CONSOLE_HELPER__.getTopModules(10)
}
```

---

**Conclusión**: ConsoleHelper reduce 123K tokens → <1K sin pérdida de información crítica. Usa filtros específicos, formatos compactos y prompts estructurados para maximizar eficiencia.

---

**FIN DE DOCUMENTACIÓN COMPLETA** 🎉
