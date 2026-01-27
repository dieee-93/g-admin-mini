# 🎧 Console Helper - Documentación Completa

**Sistema de Debugging y Logging para G-Mini v3.1**

---

## 📚 Índice de Documentación

Este directorio contiene toda la documentación relacionada con el sistema **ConsoleHelper**, una herramienta de debugging avanzada que captura y filtra logs en memoria para análisis con IA.

### Documentos Disponibles

1. **[01-OVERVIEW.md](./01-OVERVIEW.md)** - Visión general del sistema
   - Qué es ConsoleHelper y por qué existe
   - Problema que resuelve (123K tokens → <1K)
   - Arquitectura general
   - Casos de uso principales

2. **[02-API-REFERENCE.md](./02-API-REFERENCE.md)** - Referencia completa de API
   - Todas las funciones disponibles
   - Parámetros y tipos
   - Valores de retorno
   - Ejemplos de uso para cada método

3. **[03-QUICK-START.md](./03-QUICK-START.md)** - Guía rápida de inicio
   - Setup inicial
   - Comandos esenciales
   - Primeros pasos
   - Verificación de funcionamiento

4. **[04-USAGE-PATTERNS.md](./04-USAGE-PATTERNS.md)** - Patrones de uso comunes
   - Debug de re-renders infinitos
   - Análisis de errores de API
   - Monitoreo de performance
   - Debugging de navegación
   - Integración con React DevTools

5. **[05-INTEGRATION.md](./05-INTEGRATION.md)** - Integración con otros sistemas
   - Logger system
   - EventBus
   - Chrome DevTools MCP
   - React DevTools
   - CI/CD pipelines

6. **[06-ADVANCED.md](./06-ADVANCED.md)** - Funcionalidades avanzadas
   - Filtrado complejo
   - Export strategies
   - Performance optimization
   - Custom interceptors
   - Troubleshooting

7. **[07-AI-OPTIMIZATION.md](./07-AI-OPTIMIZATION.md)** - Optimización para IA
   - Reducción de tokens
   - Formatos de export
   - Prompts optimizados
   - Análisis automatizado

---

## 🚀 Quick Links

### Para Usuarios Nuevos
Empieza con [03-QUICK-START.md](./03-QUICK-START.md) para comenzar a usar ConsoleHelper inmediatamente.

### Para Debugging
Ve directamente a [04-USAGE-PATTERNS.md](./04-USAGE-PATTERNS.md) para encontrar el patrón que necesitas.

### Para Integración
Revisa [05-INTEGRATION.md](./05-INTEGRATION.md) si necesitas integrar ConsoleHelper con otras herramientas.

### Para Referencia Completa
Consulta [02-API-REFERENCE.md](./02-API-REFERENCE.md) para ver todos los métodos disponibles.

---

## 🎯 Características Principales

- ✅ **Captura inteligente de logs** - Intercepta console.* y logger.* automáticamente
- ✅ **Filtrado avanzado** - Por nivel, módulo, dominio, tiempo, texto
- ✅ **Optimizado para IA** - Reduce 123K tokens a <1K con `exportForAI()`
- ✅ **Zero overhead en producción** - Solo activo en modo desarrollo
- ✅ **Debouncing integrado** - Evita logs duplicados (500ms window)
- ✅ **Domain detection** - Categorización automática de logs
- ✅ **Stats en tiempo real** - Métricas y top modules actualizados
- ✅ **Global window access** - Disponible como `window.__CONSOLE_HELPER__`

---

## 📖 Uso Básico

```javascript
// En la consola del navegador (Chrome DevTools)

// 1. Verificar que está activo
__CONSOLE_HELPER__.isActive()
// → true

// 2. Ver resumen rápido
__CONSOLE_HELPER__.getSummary()
// → { active: true, total: 150, errors: 2, warnings: 5, ... }

// 3. Ver últimos errores
__CONSOLE_HELPER__.getErrors(10)

// 4. Buscar en un módulo específico
__CONSOLE_HELPER__.getByModule('Materials', 20)

// 5. Export optimizado para análisis con IA
__CONSOLE_HELPER__.exportForAI({ level: 'error' })
```

---

## 🔗 Ubicación del Código

- **Implementación**: `src/lib/logging/ConsoleHelper.ts`
- **Exports**: `src/lib/logging/index.ts`
- **Inicialización**: `src/App.tsx` (línea 238-240)
- **Tests**: (Pendiente implementación)

---

## 🤝 Contribuir

Si encuentras bugs o quieres agregar funcionalidades:
1. Revisa la [API Reference](./02-API-REFERENCE.md)
2. Consulta [Advanced](./06-ADVANCED.md) para patrones complejos
3. Asegúrate de mantener la compatibilidad con IA ([AI Optimization](./07-AI-OPTIMIZATION.md))

---

## 📝 Changelog

### v1.0.0 (Enero 2025)
- ✅ Sistema inicial de captura de logs
- ✅ Filtrado avanzado
- ✅ Export optimizado para IA
- ✅ Domain detection automático
- ✅ Debouncing de logs duplicados
- ✅ Global window access

---

**Última actualización**: Diciembre 25, 2025
**Mantenido por**: G-Admin Team
