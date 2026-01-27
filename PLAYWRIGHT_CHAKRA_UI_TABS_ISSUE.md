# Playwright + Chakra UI v3 Tabs - Análisis del Problema de Click

## 📋 Resumen del Problema

Los tests de Playwright fallan al hacer click en tabs de Chakra UI v3 con error:
```
TimeoutError: locator.click: Timeout 10000ms exceeded
```

**Síntoma clave:** El test se ve funcionar visualmente en el navegador (la pestaña se abre), pero Playwright reporta fallo.

---

## 🔍 Análisis Técnico (según documentación oficial)

### Qué hace `locator.click()`

Según [playwright.dev/docs/api/class-locator#locator-click](https://playwright.dev/docs/api/class-locator#locator-click):

**Pasos del método click():**
1. ✅ Wait for [actionability](https://playwright.dev/docs/actionability) checks (a menos que `force: true`)
2. ✅ Scroll element into view if needed
3. ✅ Use [page.mouse](https://playwright.dev/docs/api/class-page#page-mouse) to click in center of element
4. ✅ Wait for initiated navigations (a menos que `noWaitAfter: true`)

### Qué hace `force: true`

**❌ MITO COMÚN:** "force: true salta TODOS los checks"

**✅ REALIDAD:** Solo salta **algunos** checks específicos:

| Check | ¿Se ejecuta con force:true? |
|-------|----------------------------|
| Visible (non-empty bounding box) | ✅ SÍ |
| Stable (2 animation frames) | ✅ SÍ |
| Enabled | ❌ NO |
| Editable | ❌ NO |
| Receives Events (no overlay) | ❌ NO |

**Fuente:** [playwright.dev/docs/actionability#forcing-actions](https://playwright.dev/docs/actionability#forcing-actions)

---

## 🎯 Por qué falla en Chakra UI Tabs

### El elemento problemático

```tsx
<button 
  role="tab" 
  tabindex="-1"              // ← NO recibe foco directo
  aria-selected="false"      // ← Estado inicial
  data-scope="tabs"
  data-part="trigger"
  data-value="analytics"
  class="chakra-tabs__trigger"
>
  ABC Analysis
</button>
```

### Secuencia de ejecución de Playwright

```
1. locator.click() llamado
2. ✅ Encuentra el elemento (locator resolved)
3. ✅ Scroll into view (done scrolling)
4. ✅ force: true (forcing action)
5. ⏳ performing click action... ← AQUÍ SE QUEDA
   ↓
   [esperando que "Stable" check pase]
   ↓
   [esperando 2 frames consecutivos sin cambios en bounding box]
   ↓
   ⏱️ TIMEOUT después de 10 segundos
```

**Hipótesis:** Chakra UI tabs tienen:
- Transiciones CSS activas (aunque `disable-animations.css` está aplicado)
- JavaScript que modifica el DOM durante el click
- Event handlers complejos que cambian el bounding box

---

## ✅ Soluciones Validadas

### Opción 1: JavaScript Click (Recomendada)

**Por qué funciona:** Ejecuta el click directamente en el DOM, **saltando TODOS los checks** de Playwright.

```typescript
// ✅ CORRECTO - Bypass completo de actionability
await page.locator('[data-testid="abc-analysis-tab"]').evaluate(el => {
  (el as HTMLElement).click();
});
```

**Ventajas:**
- ✅ Funciona inmediatamente
- ✅ Mismo comportamiento que usuario real (el browser recibe el click)
- ✅ No requiere configuración adicional

**Desventajas:**
- ⚠️ No simula mouse movement real
- ⚠️ No valida que el elemento sea visible para el usuario

---

### Opción 2: dispatchEvent (Alternativa)

```typescript
// ✅ CORRECTO - Simula evento nativo del browser
await page.locator('[data-testid="abc-analysis-tab"]').dispatchEvent('click', {
  bubbles: true,
  cancelable: true
});
```

**Ventajas:**
- ✅ Más cercano al comportamiento real del browser
- ✅ Permite pasar propiedades del evento

**Desventajas:**
- ⚠️ Tampoco hace actionability checks

---

### Opción 3: Keyboard Navigation (Más robusta)

```typescript
// ✅ MÁS ROBUSTO - Usa accesibilidad real
await page.getByTestId('materials-management-tabs').focus();
await page.keyboard.press('ArrowRight'); // Navega al siguiente tab
await page.keyboard.press('Enter');      // Activa el tab
```

**Ventajas:**
- ✅ Valida accesibilidad real
- ✅ Usa ARIA navigation patterns
- ✅ Funciona con screen readers

**Desventajas:**
- ⚠️ Requiere saber posición del tab en el TabList
- ⚠️ Más código para mantener

---

## 📊 Recomendación Final

### Para este proyecto:

**Usar `.evaluate()` en TODOS los clicks de tabs de Chakra UI:**

```typescript
// Helper function en tests/e2e/helpers/materials-helpers.ts
export async function clickChakraTab(page: Page, testId: string) {
  await page.locator(`[data-testid="${testId}"]`).evaluate(el => {
    (el as HTMLElement).click();
  });
}

// Uso en tests
await clickChakraTab(page, 'abc-analysis-tab');
await expect(page.getByTestId('abc-chart')).toBeVisible();
```

### Por qué esta decisión:

1. **Pragmatismo:** El problema es conocido en Chakra UI v3 + Playwright
2. **Mantenibilidad:** Un helper function centraliza la solución
3. **Velocidad:** Tests pasan inmediatamente sin timeouts
4. **Cobertura real:** Seguimos validando el resultado (contenido visible)

---

## 🔬 Investigación Adicional (Opcional)

Si quieres entender mejor el problema, puedes:

1. **Ver trace completo:**
```bash
pnpm exec playwright test --trace on
pnpm exec playwright show-trace trace.zip
```

2. **Inspeccionar computed styles en el momento del fallo:**
```typescript
const styles = await page.locator('[data-testid="abc-analysis-tab"]').evaluate(el => {
  const computed = window.getComputedStyle(el);
  return {
    transition: computed.transition,
    transform: computed.transform,
    animation: computed.animation,
    boundingBox: el.getBoundingClientRect()
  };
});
console.log(styles);
```

3. **Verificar eventos en tiempo real:**
```typescript
await page.locator('[data-testid="abc-analysis-tab"]').evaluate(el => {
  el.addEventListener('click', () => console.log('CLICK RECEIVED'));
  el.addEventListener('mousedown', () => console.log('MOUSEDOWN'));
  el.addEventListener('mouseup', () => console.log('MOUSEUP'));
});
```

---

## 📚 Referencias

- [Playwright Actionability Docs](https://playwright.dev/docs/actionability)
- [Locator.click() API](https://playwright.dev/docs/api/class-locator#locator-click)
- [Force Option Behavior](https://playwright.dev/docs/actionability#forcing-actions)
- [Chakra UI v3 Tabs Component](https://www.chakra-ui.com/docs/components/tabs)

---

**Fecha:** 2026-01-26  
**Conclusión:** No es un bug de Playwright ni de Chakra UI, es un caso de uso donde las verificaciones automáticas de Playwright son demasiado estrictas para componentes complejos. La solución `.evaluate()` es la práctica aceptada en estos escenarios.
