# ✅ DEBUGGING TOOLS SETUP - COMPLETADO

**Fecha**: 2025-01-28
**Tiempo total**: ~15 minutos

---

## 🛠️ HERRAMIENTAS CONFIGURADAS

### 1. ✅ why-did-you-render (v10.0.1)
**Ubicación**: `src/wdyr.ts`
**Función**: Muestra en consola POR QUÉ cada componente re-renderizó

**Configuración aplicada**:
- ✅ Instalado como dev dependency
- ✅ Configurado en `vite.config.ts` con `jsxImportSource` para modo desarrollo
- ✅ Importado como primera línea en `main.tsx`
- ✅ Tracking de hooks habilitado (useCallback, useMemo, useEffect)
- ✅ Log detallado de diferentes valores que causan re-renders

**Modo de uso**:
```typescript
// La herramienta ya está activa en desarrollo
// Solo trackea componentes marcados con:
ComponentName.whyDidYouRender = true;
```

---

### 2. ✅ react-scan
**Ubicación**: `src/wdyr.ts` (ya estaba configurado)
**Función**: Overlay visual que resalta componentes que re-renderizan

**Configuración existente**:
- ✅ Toolbar visual habilitada
- ✅ Tracking de todos los componentes
- ✅ Reporte de renders lentos (>16ms)

---

## 📍 COMPONENTES MARCADOS PARA TRACKING

### SalesPage
**Archivo**: `src/pages/admin/operations/sales/page.tsx`
**Líneas**: 335-337
```typescript
if (import.meta.env.DEV) {
  SalesPage.whyDidYouRender = true;
}
```

### NavigationProvider
**Archivo**: `src/contexts/NavigationContext.tsx`
**Líneas**: 613-615
```typescript
if (import.meta.env.DEV) {
  NavigationProvider.whyDidYouRender = true;
}
```

---

## 🎯 PRÓXIMOS PASOS (CAPA 2)

### Paso 1: Configuración manual de React DevTools Profiler
⚠️ **DEBE HACERSE MANUALMENTE EN EL NAVEGADOR**:

1. Abrir http://localhost:5173/admin/operations/sales
2. Abrir React DevTools (F12 → pestaña "Components" o "Profiler")
3. Click en ⚙️ Settings
4. Tab "Profiler"
5. ✅ MARCAR: "Record why each component rendered while profiling"
6. ✅ DESMARCAR: "Hide commits below X ms"
7. Close

### Paso 2: Captura de datos empíricos

Una vez configurado el Profiler:

**Test A: React DevTools Profiler** (5 min)
1. Recargar Sales page
2. Abrir Profiler tab
3. Click 🔴 Record
4. Esperar 2-3 segundos
5. Click ⏹️ Stop
6. Analizar Flamegraph:
   - ¿Qué componente tiene MÁS renders?
   - Click en ese componente
   - Ver panel derecho "Why did this render?"
   - Si dice "Hook(s) X changed" → Ir a Components tab
   - Seleccionar el componente → Ver hooks en panel derecho
   - Hook #X es el culpable

**Test B: why-did-you-render Console Logs** (2 min)
1. Abrir Console
2. Buscar mensajes `[WDYR]`
3. Ejemplo de log esperado:
   ```
   [WDYR] SalesPage re-rendered because:
     - different objects that are equal by value
     - hook 5: useCallback changed
   ```

**Test C: react-scan Visual Overlay** (1 min)
1. Observar qué componentes flashean constantemente en rojo
2. Los que flashean más = los que re-renderizan más

---

## 🔍 QUÉ ESPERAMOS ENCONTRAR

### Escenario A: Loop causado por NavigationContext
**Síntoma esperado en logs**:
```
[WDYR] SalesPage re-rendered because:
  - setQuickActions changed
[WDYR] NavigationProvider re-rendered because:
  - (alguna dependencia cambió)
```

**Profiler mostraría**:
- NavigationProvider con ~50+ renders en 3 segundos
- SalesPage con ~50+ renders en 3 segundos

### Escenario B: Loop causado por useSalesPage internamente
**Síntoma esperado en logs**:
```
[WDYR] SalesPage re-rendered because:
  - hook 15: useCallback changed (refreshSalesData)
```

**Profiler mostraría**:
- SalesPage con ~50+ renders
- Algún hook específico cambiando constantemente

### Escenario C: Loop causado por componente hijo
**Síntoma esperado en logs**:
```
[WDYR] SalesManagement re-rendered because:
  - props.data changed
```

**Profiler mostraría**:
- Un componente hijo específico con muchos renders
- SalesPage re-renderizando por consecuencia

---

## 📊 ARCHIVOS MODIFICADOS

| Archivo | Cambio | Líneas |
|---------|--------|--------|
| `vite.config.ts` | Agregado `jsxImportSource` condicional | 6-13, 161 |
| `src/wdyr.ts` | Agregado why-did-you-render config | 36-77 |
| `src/pages/admin/operations/sales/page.tsx` | Agregado flag `whyDidYouRender` | 335-337 |
| `src/contexts/NavigationContext.tsx` | Agregado flag `whyDidYouRender` | 613-615 |
| `package.json` | Instalado `@welldone-software/why-did-you-render` | devDependencies |

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Setup completado:
- [x] why-did-you-render instalado
- [x] vite.config.ts modificado
- [x] wdyr.ts configurado
- [x] main.tsx ya importaba wdyr.ts (como primera línea)
- [x] SalesPage marcado con whyDidYouRender = true
- [x] NavigationProvider marcado con whyDidYouRender = true

### Pendiente (Usuario):
- [ ] React DevTools Profiler configurado en navegador
- [ ] Servidor dev iniciado
- [ ] Tests de captura de datos ejecutados

---

## 📝 NOTAS IMPORTANTES

1. **why-did-you-render impacta performance**: Solo usar en desarrollo
2. **Los logs pueden ser abundantes**: Por eso solo trackeamos componentes específicos
3. **react-scan + why-did-you-render**: Son complementarias, usar ambas
4. **Profiler es la herramienta definitiva**: Muestra el "Hook(s) X changed" exacto

---

**Siguiente paso**: Usuario debe configurar React DevTools Profiler manualmente y ejecutar los Tests A, B y C.
