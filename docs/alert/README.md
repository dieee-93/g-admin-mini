# 🔔 Documentación del Sistema de Alertas

**Versión:** 4.0.0 - Consolidada  
**Última Actualización:** Enero 27, 2026

---

## 🎯 START HERE - Guía Consolidada

### **[ALERTS_COMPLETE_GUIDE.md](./ALERTS_COMPLETE_GUIDE.md)** ⭐ **RECOMENDADO**

**📘 Guía Completa del Sistema de Alertas** - TODO en un solo lugar

Esta es la **guía definitiva** que explica TODO el sistema de alertas:

- ✅ **Las 3 Capas del Sistema** explicadas claramente
- ✅ **¿Cuándo usar cada capa?** con flowchart y ejemplos
- ✅ **Layer 1: Toasts** - Feedback inmediato (código real)
- ✅ **Layer 2: Alerts** - Notificaciones persistentes (código real)
- ✅ **Layer 3: Predictive** - Machine Learning (roadmap)
- ✅ **Arquitectura Técnica** validada con codebase
- ✅ **Ejemplos Prácticos Completos** de módulos reales
- ✅ **Testing y Debugging** 
- ✅ **Best Practices** con DO/DON'T
- ✅ **Troubleshooting** de problemas comunes

**Audiencia:** Todos los desarrolladores  
**Lectura estimada:** 30-40 minutos (pero es referencia permanente)  
**Estado:** ✅ Validado con código real de la app

---

## 📚 Documentación Complementaria

Después de leer la guía principal, consulta estos docs para casos específicos:

### Quick References

**1. [TOAST_QUICK_REFERENCE.md](./TOAST_QUICK_REFERENCE.md)**
- Referencia rápida para Layer 1 (Toasts)
- Patrones de uso comunes
- Ejemplos copy-paste

**2. [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)**
- API reference completa de useAlerts()
- Todas las funciones y opciones
- Tipos TypeScript

### Documentación Técnica

**3. [TOASTER_ARCHITECTURE_AUDIT.md](./TOASTER_ARCHITECTURE_AUDIT.md)**
- Auditoría de arquitectura del Toaster
- Fix del error de contexto (ChakraProvider)
- Detalles técnicos de implementación

**4. [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)**
- 8 ejemplos prácticos detallados
- Implementaciones específicas por módulo

**5. [MANUAL_TESTING_GUIDE.md](./MANUAL_TESTING_GUIDE.md)**
- Cómo hacer testing manual del sistema
- Checklist de validación

---

## 🗄️ Documentación Avanzada (Referencia Histórica)

> **⚠️ NOTA:** Los siguientes documentos contienen información histórica o detalles de arquitectura V2.
> Para uso diario, usa **ALERTS_COMPLETE_GUIDE.md** que está actualizado con el código real.

**6. [ALERT_ARCHITECTURE_V2.md](./ALERT_ARCHITECTURE_V2.md)**
- Diseño de arquitectura V2 (Nov 2025)
- Sistema de 3 capas (diseño original)
- Module alert matrix (31 módulos)
- ⚠️ **NOTA:** Algunas partes no están implementadas (ej: SmartAlertsEngine)

**7. [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)**
- Resumen ejecutivo de implementación V2
- Status de implementación
- Timeline y roadmap
- ⚠️ **NOTA:** Algunos componentes en "Pending" no existen aún

**8. [SMART_ALERTS_GUIDE.md](./SMART_ALERTS_GUIDE.md)**
- Tutorial para crear smart alerts
- Uso de SmartAlertsEngine (conceptual)
- ⚠️ **NOTA:** SmartAlertsEngine NO está implementado, se usa patrón manual
- 🔍 **Debugging**: Herramientas de depuración

**Audiencia:** Desarrolladores implementando features  
**Lectura estimada:** 5-10 minutos

---

## 📁 Documentación Especializada

### UI/UX
- [MODERN_UX_PROPOSAL.md](./MODERN_UX_PROPOSAL.md) - Propuesta de UX moderna
- [UI_UX_REFACTORING_COMPLETE.md](./UI_UX_REFACTORING_COMPLETE.md) - Refactoring UI completo
- [QUICK_ANSWERS_UI_UX.md](./QUICK_ANSWERS_UI_UX.md) - Q&A sobre UI/UX

### Testing
- [PLAYWRIGHT_TOAST_TESTING_GUIDE.md](./PLAYWRIGHT_TOAST_TESTING_GUIDE.md) - Testing con Playwright

### Patterns
- [USEINTERVAL_PATTERN.md](./USEINTERVAL_PATTERN.md) - Patrón useInterval para polling

### Legacy (Archivo)
- [archive/](./archive/) - Documentación histórica archivada

---

## 🚀 Flujo de Aprendizaje Recomendado

### Para Nuevos Desarrolladores

1. **Lee primero:** [ALERTS_COMPLETE_GUIDE.md](./ALERTS_COMPLETE_GUIDE.md) (30-40 min)
   - Entiende las 3 capas
   - Aprende cuándo usar cada una
   - Ve ejemplos prácticos

2. **Referencia rápida:** [TOAST_QUICK_REFERENCE.md](./TOAST_QUICK_REFERENCE.md) (5 min)
   - Para uso diario de toasts

3. **API Reference:** [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) (10 min)
   - Cuando necesites detalles de la API

4. **Casos específicos:** [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)
   - Para implementaciones detalladas

### Para Troubleshooting

1. **Check:** [ALERTS_COMPLETE_GUIDE.md - Section Troubleshooting](./ALERTS_COMPLETE_GUIDE.md#troubleshooting)
2. **Si es problema de Toaster:** [TOASTER_ARCHITECTURE_AUDIT.md](./TOASTER_ARCHITECTURE_AUDIT.md)
3. **Para testing manual:** [MANUAL_TESTING_GUIDE.md](./MANUAL_TESTING_GUIDE.md)

---

## ⚠️ Documentación Deprecada

Los siguientes documentos están **OBSOLETOS** o contienen información **INCOMPLETA/INCORRECTA**:

### ❌ NO USAR:

1. **REFACTORING_PLAN_IN_PLACE.md** - Plan obsoleto, ya completado
2. **archive/SMART_ALERTS_V2_REFACTOR_COMPLETE.md** - Versión antigua
3. **archive/ALERTS_SYSTEM_AUDIT.md** - Audit obsoleto
4. **archive/CODE_AUDIT_REPORT.md** - Report viejo
5. **archive/DOCUMENTATION_AUDIT_REPORT.md** - Audit viejo

> **Estos archivos se mantienen solo como referencia histórica.**  
> **Para uso actual, consulta ALERTS_COMPLETE_GUIDE.md**

---

## 🔍 Búsqueda Rápida

### "¿Cómo hago X?"

| Quiero... | Ve a... |
|-----------|---------|
| Mostrar confirmación de guardado | [ALERTS_COMPLETE_GUIDE.md - Layer 1](./ALERTS_COMPLETE_GUIDE.md#layer-1-toasts---feedback-inmediato) |
| Crear alerta de stock bajo | [ALERTS_COMPLETE_GUIDE.md - Layer 2](./ALERTS_COMPLETE_GUIDE.md#layer-2-alerts---notificaciones-del-sistema) |
| Saber qué capa usar | [ALERTS_COMPLETE_GUIDE.md - Decisión](./ALERTS_COMPLETE_GUIDE.md#cuándo-usar-cada-capa) |
| Fix error de contexto | [TOASTER_ARCHITECTURE_AUDIT.md](./TOASTER_ARCHITECTURE_AUDIT.md) |
| Ver ejemplos completos | [ALERTS_COMPLETE_GUIDE.md - Ejemplos](./ALERTS_COMPLETE_GUIDE.md#ejemplos-prácticos-completos) |
| API completa | [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) |

---

## 📊 Estado del Sistema

### ✅ Implementado (Layer 1 & 2a)
- Toast System (Layer 1)
- Alerts Provider (Layer 2)
- Simple Alerts (Layer 2a)
- Database schema con `intelligence_level`
- NotificationCenter UI
- Badges en módulos

### 🚧 Parcialmente Implementado (Layer 2b)
- Smart Alerts (Layer 2b)
  - ✅ Tipos y schema de DB listos
  - ✅ Patrones manuales funcionando
  - ❌ SmartAlertsEngine NO implementado (solo docs/tests)
  - ⚠️ Se usa patrón manual de detección

### 🔮 Roadmap (Layer 3)
- Predictive Alerts (Q1 2026)
- ML/AI integration
- Forecasting
- Anomaly detection

---

## 📞 Soporte

### ¿Tienes dudas?

1. ✅ Lee [ALERTS_COMPLETE_GUIDE.md](./ALERTS_COMPLETE_GUIDE.md)
2. ✅ Busca en [Troubleshooting](./ALERTS_COMPLETE_GUIDE.md#troubleshooting)
3. ✅ Revisa [ejemplos prácticos](./ALERTS_COMPLETE_GUIDE.md#ejemplos-prácticos-completos)
4. ✅ Consulta el código en `src/shared/alerts/`

### ¿Encontraste un bug?

1. Documenta el problema
2. Check si está en [Troubleshooting](./ALERTS_COMPLETE_GUIDE.md#troubleshooting)
3. Revisa los tipos en `src/shared/alerts/types.ts`
4. Verifica implementación en `src/shared/alerts/AlertsProvider.tsx`

---

**Versión:** 4.0.0 - Consolidada  
**Última Actualización:** Enero 27, 2026  
**Mantenido por:** Equipo de Desarrollo



### 5. [SMART_ALERTS_GUIDE.md](./SMART_ALERTS_GUIDE.md) 🆕
**Guía Completa: Implementar Smart Alerts**

Tutorial paso a paso para crear alertas inteligentes:

- 🧠 **Smart vs Simple**: Diferencias clave
- 📝 **Creating Rules**: Anatomía de reglas de negocio
- ⚙️ **SmartAlertsEngine**: Uso del motor
- 🔗 **Module Integration**: Ejemplo completo (Rentals)
- 🧪 **Testing**: Unit + Integration tests
- ✅ **Best Practices**: Organización, performance, naming
- 🎯 **Common Patterns**: Threshold, date-based, relational alerts
- 🐛 **Troubleshooting**: Solución de problemas comunes

**Audiencia:** Desarrolladores implementando smart alerts  
**Lectura estimada:** 30-40 minutos  
**Código:** 8 ejemplos completos copy-paste ready

---

### 6. [MODERN_UX_PROPOSAL.md](./MODERN_UX_PROPOSAL.md) 🎨 **NEW**
**Propuesta de Diseño Moderno: Toast Stack Unificado** - Enero 2025

Rediseño completo de la experiencia de usuario para alertas:

- 🚨 **Problema Actual**: Dual notification system (AlertsProvider + Toaster)
- ✨ **Solución Propuesta**: Toast stack unificado (top-right)
- 🏗️ **Arquitectura Nueva**: Toast Stack + Notification Center + Badges
- 🎨 **Especificaciones de Diseño**: Tokens, animaciones, micro-interacciones
- 🔄 **Flujo de Usuario**: User journey completo
- 📊 **Comparación**: Antes vs Después (fragmentado vs unificado)
- 🛠️ **Plan de Implementación**: 5 fases (6-8 días)
- 🎯 **Métricas de Éxito**: KPIs cuantitativos y cualitativos

**Inspiración:** Vercel, Linear, Notion (2025 best practices)  
**Audiencia:** Product, Design, Frontend Developers  
**Lectura estimada:** 15-20 minutos  
**Status:** 📋 Propuesta pendiente de aprobación

---

## 📂 Documentación Archivada

Documentos históricos del proceso de refactoring V1 → V2 movidos a [`./archive/`](./archive/):

- **ALERTS_SYSTEM_AUDIT.md** - Auditoría completa del sistema V1
- **CODE_AUDIT_REPORT.md** - Identificación de código duplicado
- **CODE_REFACTORING_PLAN.md** - Plan de refactoring V1 → V2
- **SMART_ALERTS_V2_REFACTOR_COMPLETE.md** - Reporte final de refactoring
- **DOCUMENTATION_AUDIT_REPORT.md** - Auditoría de documentación
- **LOADING_ARCHITECTURE_ANALYSIS.md** - Análisis de estrategias de carga

Ver [`./archive/README.md`](./archive/README.md) para más información sobre estos documentos.

---

## 🆕 Diferencia entre Alertas Simple y Smart

> **📐 Complete Explanation:** See [ALERT_ARCHITECTURE_V2.md Section "3-Layer Alert System"](./ALERT_ARCHITECTURE_V2.md#3-layer-alert-system-explained) for full technical details

### 🔔 Alertas Simple (Layer 1)
- **Propósito**: Feedback inmediato de acciones del usuario
- **Ejemplos**: "Material creado", "Orden guardada", "Config actualizada"
- **Duración**: 5-15 min (auto-expire)
- **Persistencia**: No (solo en memoria)
- **Código**: `intelligence_level: 'simple'`

### 🧠 Alertas Smart (Layer 2) ← **Current Focus**
- **Propósito**: Inteligencia de negocio basada en reglas
- **Ejemplos**: "5 materiales bajo stock", "Orden vencida", "Margen <20%"
- **Duración**: Hasta resolverse
- **Persistencia**: Sí (Supabase `alerts` table)
- **Código**: `SmartAlertsEngine` + business rules

### 🔮 Alertas Predictive (Layer 3)
- **Propósito**: Predicciones ML/AI
- **Ejemplos**: "Material se agotará en 3 días"
- **Status**: 🚧 Roadmap Q1 2026

> **💡 Code Examples:** See [SMART_ALERTS_GUIDE.md Section 2](./SMART_ALERTS_GUIDE.md#smart-alerts-vs-simple-alerts) for comparison table and code

---

## 🎯 ¿Qué Módulos Tienen Qué Tipo de Alertas?

> **📊 Complete Matrix:** See [ALERT_ARCHITECTURE_V2.md Section "Module Alert Matrix"](./ALERT_ARCHITECTURE_V2.md#complete-module-alert-matrix) for all 31 modules

### Tier 1: Critical Modules (7) - Layer 1 + Layer 2
Materials, Production, Sales, Fulfillment, Delivery, Finance Fiscal, Finance Billing

### Tier 2: Standard Modules (18) - Layer 1 + Layer 2
Products, Suppliers, Assets, Rentals, Memberships, Staff, Scheduling, etc.

### Tier 3: Low-Alert Modules (6) - Layer 1 only
Dashboard, Settings, Debug, Achievements, Gamification, Executive

---

## 🚀 Inicio Rápido

### Para Nuevos Desarrolladores

1. **Leer primero**: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Sección "Quick Start"
2. **Explorar ejemplos**: [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) - Ejemplo 1 (Stock)
3. **Documentación completa**: [ALERTS_SYSTEM_AUDIT.md](./ALERTS_SYSTEM_AUDIT.md) - Según necesidad

### Para Arquitectos/Líderes Técnicos

1. **Arquitectura**: [ALERTS_SYSTEM_AUDIT.md](./ALERTS_SYSTEM_AUDIT.md) - Secciones 2-4
2. **Performance**: [ALERTS_SYSTEM_AUDIT.md](./ALERTS_SYSTEM_AUDIT.md) - Sección 8
3. **Roadmap**: [ALERTS_SYSTEM_AUDIT.md](./ALERTS_SYSTEM_AUDIT.md) - Sección 11

### Para Resolver Problemas Específicos

- **Error al crear alertas**: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - "Common Pitfalls"
- **Performance issues**: [ALERTS_SYSTEM_AUDIT.md](./ALERTS_SYSTEM_AUDIT.md) - Sección 8
- **Alertas no aparecen**: [ALERTS_SYSTEM_AUDIT.md](./ALERTS_SYSTEM_AUDIT.md) - Problema 1
- **Implementar en nuevo módulo**: [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) - Ejemplo 1

---

## 📂 Estructura del Sistema

```
src/shared/alerts/
├── types.ts                    # Tipos centralizados (15+ interfaces)
├── index.ts                    # Exports públicos
├── AlertsProvider.tsx          # Provider principal (700 LOC)
├── Alert.test.tsx              # Tests unitarios
├── hooks/
│   └── useAlerts.ts            # Hook principal con 6 variantes
├── components/
│   ├── GlobalAlertsDisplay.tsx # UI global flotante
│   ├── AlertDisplay.tsx        # Display individual
│   └── AlertBadge.tsx          # Badges (5 variantes)
└── utils/
    ├── index.ts
    ├── severityMapping.ts      # Mapeo de severidades
    ├── alertPrioritization.ts  # Algoritmos de ordenamiento
    ├── alertFormatting.ts      # Enriquecimiento de texto
    └── alertLifecycle.ts       # Reglas de expiración
```

---

## 🎯 Conceptos Clave

### AlertStatus
Estados del ciclo de vida: `active` → `acknowledged` → `resolved` | `dismissed`

### AlertSeverity
Niveles de urgencia: `critical` > `high` > `medium` > `low` > `info`

### AlertContext
Dominio de negocio: `materials`, `sales`, `staff`, `customers`, etc. (16 totales)

### AlertType
Clasificación: `stock`, `validation`, `business`, `system`, `operational`, `achievement`

---

## ⚡ Características Principales

- ✅ **Unificado**: API centralizada para todos los módulos
- ✅ **Performance**: Split contexts + bulk operations (50x faster)
- ✅ **Tipado**: TypeScript completo con validación
- ✅ **Persistente**: localStorage con auto-expiración
- ✅ **EventBus**: Integración cross-module
- ✅ **Smart**: Motores de inteligencia (ABC analysis, predicción)
- ✅ **Actionable**: Alertas con acciones ejecutables
- ✅ **Extensible**: Fácil agregar nuevos tipos/contextos

---

## 📊 Estado de Implementación

| Módulo | Integración | Generación | Notas |
|--------|------------|------------|-------|
| Materials | ✅ | ✅ Smart Engine | 40+ alertas inteligentes |
| Products | ✅ | ✅ Smart Engine | Lazy loading + persist |
| Sales | ✅ | 🟡 Manual | Validación de pedidos |
| Scheduling | ✅ | ✅ Predictive | Alertas de staffing |
| Customers | ✅ | 🟡 Manual | RFM analysis |
| Dashboard | ✅ | ❌ | Agregación global |
| Otros | 🟡 | ⚠️ | En progreso |

---

## 🔗 Enlaces Relacionados

### Documentación del Proyecto
- **Copilot Instructions**: `/.github/copilot-instructions.md`
- **Architecture V2**: `/docs/architecture-v2/`
- **Module Manifests**: `/src/modules/`

### Reports Relacionados
- `ALERTS_ARCHITECTURE_FIX_REPORT.md` - Fix de lazy loading
- `ALERTS_SYSTEM_PERFORMANCE_FIX.md` - Optimizaciones
- `NAVIGATION_AUDIT_FINDINGS.md` - Integración con navegación

### Archivos Principales
- AlertsProvider: `src/shared/alerts/AlertsProvider.tsx`
- Main Hook: `src/shared/alerts/hooks/useAlerts.ts`
- Smart Engine: `src/pages/admin/supply-chain/materials/services/smartAlertsEngine.ts`
- Global Init: `src/hooks/useGlobalAlertsInit.ts`

---

## 🛠️ Contribuir

### Agregar Alerta a Nuevo Módulo

1. Importar hook: `import { useAlerts } from '@/shared/alerts';`
2. Usar en componente: `const { actions } = useAlerts();`
3. Crear alertas: `await actions.create({ ... });`
4. Ver [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) ejemplo 1

### Implementar Smart Engine

1. Crear engine file: `services/smartEngine.ts`
2. Implementar análisis de datos
3. Usar SmartAlertsAdapter pattern
4. Ver [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) ejemplo 6

### Agregar Nuevo Tipo de Alerta

1. Editar `src/shared/alerts/types.ts` - agregar a `AlertType`
2. Actualizar `ALERTS_SYSTEM_AUDIT.md` - documentar nuevo tipo
3. Agregar utility helpers si necesario
4. Crear ejemplos de uso

---

## ❓ FAQ

**P: ¿Cómo creo una alerta simple?**  
R: Ver [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) sección "Crear Alertas"

**P: ¿Por qué mis alertas no aparecen?**  
R: Ver [ALERTS_SYSTEM_AUDIT.md](./ALERTS_SYSTEM_AUDIT.md) problema 1

**P: ¿Cómo optimizo performance con muchas alertas?**  
R: Usar `bulkCreate()` y split contexts - ver [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) "Performance Tips"

**P: ¿Cómo filtro alertas por módulo?**  
R: `useAlerts({ context: 'materials' })` - ver ejemplos

**P: ¿Cómo persisten las alertas entre sesiones?**  
R: Automático via localStorage - ver [ALERTS_SYSTEM_AUDIT.md](./ALERTS_SYSTEM_AUDIT.md) sección 9

---

## 📝 Changelog

### v3.1 (Noviembre 2025)
- ✅ Split contexts para performance
- ✅ Bulk create optimizado (50x faster)
- ✅ Smart engines para Materials y Products
- ✅ Documentación completa
- ✅ 8 ejemplos de uso
- ✅ EventBus integration

### v3.0 (Octubre 2025)
- ✅ Sistema unificado de alertas
- ✅ Provider centralizado
- ✅ Persistencia en localStorage
- ✅ Auto-expiración
- ✅ UI components

---

## 📧 Contacto y Soporte

Para preguntas, reportar bugs o sugerencias:

1. **Documentación**: Revisar estos archivos primero
2. **Código**: Ver ejemplos en `USAGE_EXAMPLES.md`
3. **Issues**: Crear issue con tag `alerts`
4. **Copilot**: Usar `.github/copilot-instructions.md` como contexto

---

**Última actualización:** 18 de noviembre, 2025  
**Versión del sistema:** G-Mini v3.1 EventBus Enterprise Edition  
**Documentado por:** GitHub Copilot (Claude Sonnet 4.5)
