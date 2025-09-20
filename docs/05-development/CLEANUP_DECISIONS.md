# 📋 DECISIONES DE LIMPIEZA DOCUMENTAL - FASE FINAL

**FECHA**: 2025-09-19
**CONTEXTO**: Auditoría final antes de pérdida de contexto IA

---

## ✅ **DOCUMENTOS MAESTROS (MANTENER)**

### **CORE KNOWLEDGE BASE**
1. `AI_KNOWLEDGE_BASE.md` - **FUENTE ÚNICA** - Memoria persistente IA
2. `MODULE_PLANNING_MASTER_GUIDE.md` - **FUENTE ÚNICA** - Planificación modular
3. `STATE_MANAGEMENT_GUIDE.md` - **FUENTE ÚNICA** - Zustand patterns
4. `component-library.md` - **FUENTE ÚNICA** - Design System v2.1

### **DOCUMENTOS TÉCNICOS ESPECÍFICOS**
5. `decimal-precision.md` - **VALOR ÚNICO** - Sistema matemático bancario
6. `G_ADMIN_DECISION_TREE.md` - **VALOR ÚNICO** - Decision trees para desarrollo

### **ANÁLISIS ESPECÍFICOS (VALOR PARA CASOS DE ESTUDIO)**
7. `MATERIALS_MODULE_ANALYSIS.md` - **MANTENER** - Caso de estudio Materials
8. `VISUAL_CONSISTENCY_ANALYSIS.md` - **MANTENER** - Diagnóstico UI actual
9. `MODULE_DESIGN_CONVENTIONS.md` - **MANTENER** - Convenciones UI específicas

---

## ❌ **DOCUMENTOS OBSOLETOS (ELIMINAR/ARCHIVAR)**

### **DUPLICACIÓN CONFIRMADA**
10. `MODULAR_PLANNING_FRAMEWORK.md` - **OBSOLETO** - Duplica MODULE_PLANNING_MASTER_GUIDE
11. `MODULE_PLANNING_TEMPLATES.md` - **OBSOLETO** - Duplica MODULE_PLANNING_MASTER_GUIDE
12. `ARCHITECTURAL_DECISION_CHECKLIST.md` - **OBSOLETO** - Duplica MODULE_PLANNING_MASTER_GUIDE

---

## 🎯 **ACCIONES REQUERIDAS**

### **IMMEDIATE CLEANUP**
```bash
# Mover a archivo (no eliminar por si acaso)
mv MODULAR_PLANNING_FRAMEWORK.md ../99-archive/obsolete-dec-2024/
mv MODULE_PLANNING_TEMPLATES.md ../99-archive/obsolete-dec-2024/
mv ARCHITECTURAL_DECISION_CHECKLIST.md ../99-archive/obsolete-dec-2024/
```

### **KNOWLEDGE BASE ENRICHMENT**
- [ ] Extraer info única de docs obsoletos antes de archivar
- [ ] Verificar que AI_KNOWLEDGE_BASE.md tenga toda la info relevante
- [ ] Confirmar que no falta documentación técnica específica

### **CROSS-REFERENCES**
- [ ] Actualizar referencias en documentos que apunten a obsoletos
- [ ] Verificar que todos los docs maestros se referencien entre sí

---

## 📚 **ESTRUCTURA FINAL RECOMENDADA**

```
/docs/05-development/
├── 🧠 AI_KNOWLEDGE_BASE.md              # Memoria persistente IA
├── 📋 MODULE_PLANNING_MASTER_GUIDE.md   # Planificación modular maestra
├── 🗃️ STATE_MANAGEMENT_GUIDE.md        # Zustand patterns
├── 🎨 component-library.md             # Design System v2.1
├── 🧮 decimal-precision.md             # Sistema matemático
├── 🌳 G_ADMIN_DECISION_TREE.md         # Decision trees
├── 📊 MATERIALS_MODULE_ANALYSIS.md     # Caso de estudio
├── 🎯 VISUAL_CONSISTENCY_ANALYSIS.md   # Análisis UI
└── 🎛️ MODULE_DESIGN_CONVENTIONS.md    # Convenciones UI
```

**TOTAL**: 9 documentos (vs 12 actuales) = 25% reducción, 0% pérdida de información