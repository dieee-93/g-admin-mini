# 🧪 Playwright Testing Guide - Toast Progress Bug

## 📋 Resumen

Tests automatizados E2E para validar el fix crítico del sistema de toasts:
- **Bug:** Progress tracking calculaba desde `alert.createdAt` (cuando se creó) en vez de cuando apareció el toast
- **Fix:** Implementado `toastStartTimes` para trackear cuándo el toast entra al stack visible
- **Impacto:** Alertas pre-existentes se auto-dismisseaban instantáneamente

## 🎯 Archivo de Tests

`tests/e2e/alerts-toast-progress.spec.ts`

### Test Suites

1. **Toast Progress Tracking** (7 tests)
   - ✅ New alerts progress 0% → 100%
   - ✅ Bulk creation queuing
   - ✅ Pre-existing alerts NO instant dismiss
   - ✅ Critical alerts NO countdown
   - ✅ Dismiss cleanup
   - ✅ Sequential independent progress
   - ✅ No console errors

2. **Toast Stack Visual Behavior** (3 tests)
   - ✅ Positioning top-right
   - ✅ Framer Motion animations
   - ✅ Max 3 toasts visible

3. **Toast Visual Regression** (5 tests)
   - 📸 Empty state snapshot
   - 📸 Single toast snapshot
   - 📸 Multiple toasts snapshot
   - 📸 Progress bar states (0%, 50%)
   - 📸 Severity colors

## 🚀 Comandos

### Ejecutar TODOS los tests
```powershell
pnpm exec playwright test
```

### Ejecutar SOLO tests de toasts
```powershell
pnpm exec playwright test alerts-toast-progress
```

### Ejecutar con UI (modo visual interactivo)
```powershell
pnpm exec playwright test --ui
```

### Generar snapshots baseline (primera vez)
```powershell
pnpm exec playwright test alerts-toast-progress
```
Los snapshots se guardan en `tests/e2e/alerts-toast-progress.spec.ts-snapshots/`

### Actualizar snapshots (después de cambios intencionales)
```powershell
pnpm exec playwright test --update-snapshots
```

### Ver reporte HTML
```powershell
pnpm exec playwright show-report
```

### Debug mode (paso a paso)
```powershell
pnpm exec playwright test --debug
```

### Ejecutar en navegador específico
```powershell
pnpm exec playwright test --project=chrome
pnpm exec playwright test --project=firefox
pnpm exec playwright test --project=webkit
```

## 📊 Visual Testing

Playwright usa **pixelmatch** para comparaciones visuales:

### Configuración actual (playwright.config.ts)
```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixels: 100,      // Máximo 100 píxeles diferentes
    threshold: 0.2,          // 20% threshold (0 = estricto, 1 = permisivo)
    animations: 'disabled',  // Desactiva animaciones para consistencia
  }
}
```

### Estructura de snapshots
```
tests/e2e/
├── alerts-toast-progress.spec.ts
└── alerts-toast-progress.spec.ts-snapshots/
    ├── toast-stack-empty-chromium-win32.png
    ├── single-toast-chromium-win32.png
    ├── multiple-toasts-chromium-win32.png
    ├── progress-0-percent-chromium-win32.png
    ├── progress-50-percent-chromium-win32.png
    └── severity-colors-chromium-win32.png
```

**Nota:** Los snapshots incluyen `platform-os` en el nombre porque el rendering varía entre sistemas.

## 🐛 Debugging

### Ver qué test falló
```powershell
pnpm exec playwright test --reporter=list
```

### Ver screenshots de fallos
Los screenshots se guardan automáticamente en `test-results/` cuando un test falla.

### Trace viewer (ver paso a paso)
```powershell
pnpm exec playwright show-trace test-results/path/to/trace.zip
```

## 📝 Casos de Prueba Manuales vs Automatizados

### Comparación con MANUAL_TESTING_GUIDE.md

| Test Manual | Test Automatizado | Estado |
|-------------|-------------------|--------|
| ✅ Item 1-3: Toast rendering | ✅ `toast stack initial state` | Cubierto |
| ✅ Item 4: Max 3 toasts | ✅ `max 3 toasts visible` | Cubierto |
| ✅ Item 5: Progress bars | ✅ `new alerts progress 0-100` | Cubierto |
| ❌ Item 6: NotificationCenter | ⏸️ Debug log check | Parcial |
| ⏸️ Item 7-15: Pending | ⚠️ No automatizado aún | Manual |

## 🎨 Visual Regression Testing - Mejores Prácticas

### ¿Cuándo usar visual testing?

✅ **SÍ usar para:**
- Progress bars (verificar posición, color, tamaño)
- Severity colors (verificar paleta de colores correcta)
- Animaciones (capturar frames clave)
- Layout consistency (positioning, spacing)
- Cross-browser rendering differences

❌ **NO usar para:**
- Timing preciso (usar asserts de timing)
- Funcionalidad lógica (usar unit tests)
- Contenido dinámico (texto variable, timestamps)

### Patrones comunes

#### 1. Snapshot de estado inicial
```typescript
await expect(page).toHaveScreenshot('empty-state.png');
```

#### 2. Snapshot de componente específico
```typescript
const toast = page.locator('[role="alert"]').first();
await expect(toast).toHaveScreenshot('toast.png');
```

#### 3. Snapshot con área delimitada (clip)
```typescript
await expect(page).toHaveScreenshot('header.png', {
  clip: { x: 0, y: 0, width: 800, height: 100 }
});
```

#### 4. Snapshot ignorando animaciones
```typescript
await expect(element).toHaveScreenshot({
  animations: 'disabled'
});
```

#### 5. Snapshot con tolerancia flexible
```typescript
await expect(element).toHaveScreenshot({
  maxDiffPixels: 200,  // Para elementos con animaciones
  threshold: 0.3       // 30% diferencia permitida
});
```

## 🔄 Workflow Recomendado

### Primera ejecución (crear baseline)
1. Asegúrate que la app esté en localhost:5173
2. Ejecuta: `pnpm dev` (en terminal aparte)
3. Ejecuta: `pnpm exec playwright test alerts-toast-progress`
4. Verifica snapshots en `tests/e2e/...-snapshots/`
5. Commitea snapshots al repo

### Después de cambios en el código
1. Ejecuta tests: `pnpm exec playwright test`
2. **Si falla por cambio intencional:**
   - Revisa diff visual en HTML report
   - Actualiza: `pnpm exec playwright test --update-snapshots`
   - Commitea nuevos snapshots
3. **Si falla por bug:**
   - Investiga el test-results/
   - Analiza screenshots de fallo
   - Corrige el código
   - Re-ejecuta tests

### CI/CD Integration
```yaml
# .github/workflows/playwright.yml (ejemplo)
- name: Run Playwright tests
  run: pnpm exec playwright test
  
- name: Upload test results
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## 🎯 Mejores Prácticas Encontradas

### De react-toastify Issues:
1. ❌ **NO usar `createdAt` para progress** → Usar timestamp de aparición
2. ✅ **Trackear independientemente** → Cada toast con su propio timer
3. ✅ **Cleanup al dismiss** → Eliminar tracking state
4. ✅ **Queue management** → Max visible + cola FIFO

### De Playwright Docs:
1. ✅ **Esperar estabilidad** → `waitForLoadState('networkidle')`
2. ✅ **Deshabilitar animaciones** → `animations: 'disabled'`
3. ✅ **Tolerancia razonable** → `maxDiffPixels` para rendering differences
4. ✅ **Clip regions** → Snapshot solo región relevante

## 📚 Referencias

- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [React-Toastify Common Issues](https://github.com/fkhadra/react-toastify/issues)
- [Pixelmatch Library](https://github.com/mapbox/pixelmatch)
- G-Mini: `/docs/alert/MANUAL_TESTING_GUIDE.md`
- G-Mini: `/tests/e2e/alerts-toast-progress.spec.ts`

## 🚨 Troubleshooting

### "Screenshot comparison failed"
- **Causa:** Rendering differences entre runs
- **Solución:** Aumentar `maxDiffPixels` o `threshold`

### "Snapshots missing"
- **Causa:** Primera ejecución o cambio de proyecto
- **Solución:** Los snapshots se generan automáticamente, commitearlos

### "Timeout waiting for element"
- **Causa:** Página no carga o elemento no renderiza
- **Solución:** Verificar `pnpm dev` corriendo, aumentar timeout

### "Animation differences"
- **Causa:** Timing de animaciones varía
- **Solución:** Usar `animations: 'disabled'` o esperar más tiempo

## ✅ Checklist de Validación

Antes de considerar el fix completo:

- [ ] Todos los tests pasan: `pnpm exec playwright test alerts-toast-progress`
- [ ] Snapshots committed al repo
- [ ] Manual testing completado (MANUAL_TESTING_GUIDE.md items 1-15)
- [ ] NotificationCenter abre correctamente
- [ ] Badges funcionan
- [ ] No console errors en ningún test
- [ ] Performance OK (FPS > 30 con toasts activos)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)

## 🎉 Siguiente Fase

Una vez validado el fix con Playwright:
1. Marcar todo completo en MANUAL_TESTING_GUIDE.md
2. Actualizar todo list: "Testing manual con navegador" → DONE
3. Considerar Phase 10: Supabase schema updates (OPCIONAL)
4. Documentar lecciones aprendidas en ARCHITECTURE_V2
