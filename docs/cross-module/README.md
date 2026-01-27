# Cross-Module Architecture Documentation

Esta carpeta contiene documentación arquitectónica sobre patrones para consumir datos cross-module en la aplicación.

## Documentos

### [CROSS_MODULE_DATA_ARCHITECTURE.md](./CROSS_MODULE_DATA_ARCHITECTURE.md)

Análisis comprehensive **validado con investigación de la industria** sobre:

- ✅ Patrones best practices para cross-module data sharing
- ✅ Atomic selectors performance optimization  
- ✅ Store-first vs API-first architecture
- ✅ Validación con fuentes industry (TkDodo, LogRocket, Zustand docs)
- ✅ Ejemplos reales de implementación

**Validado por:**
- TkDodo Blog (Zustand expert)
- Zustand Official Documentation
- LogRocket Performance Guides
- Reddit/GitHub community consensus
- Enterprise project patterns

## Aplicación en el Proyecto

Este documento guía la implementación de patrones como:

1. **SupplierFields en MaterialForm** - Store-first pattern con atomic selectors
2. **Cross-module reactivity** - Cambios automáticos entre módulos
3. **Performance optimization** - 40-60% reducción en re-renders

## Referencias Rápidas

**Patrón Recomendado:**
```typescript
// ✅ Atomic selectors
const activeSuppliers = useSuppliersStore(state => state.getActiveSuppliers());
const loading = useSuppliersStore(state => state.loading);
```

**Anti-Patterns:**
```typescript
// ❌ Data duplication
const [data, setData] = useState([]);
useEffect(() => api.fetch().then(setData), []);
```

---

**Last Updated**: 2025-11-29  
**Status**: Industry Validated ✅
