# Guía Completa de Playwright: Selectores, Locators y Buenas Prácticas

Esta guía documenta los estándares y mejores prácticas para la implementación de tests End-to-End (E2E) robustos utilizando Playwright en el proyecto **g-mini**.

## 1. Selectores y Locators

Playwright recomienda priorizar selectores que se asemejen a cómo los usuarios interactúan con la página. Evita selectores frágiles como XPath o selectores CSS complejos vinculados a la estructura del DOM.

### Jerarquía de Prioridad (Recomendada)

1.  **`page.getByRole(role, options)`**  
    *   **Uso:** La forma más robusta y accesible. Interactúa con elementos semánticos (botones, links, headings, inputs).
    *   **Ejemplos:**
        ```typescript
        // Preferido
        await page.getByRole('button', { name: 'Guardar' }).click();
        await page.getByRole('heading', { name: 'Recetas' }).toBeVisible();
        await page.getByRole('checkbox', { name: 'Activo' }).check();
        ```

2.  **`page.getByText(text, options)`**  
    *   **Uso:** Para elementos no semánticos o contenido textual simple.
    *   **Ejemplo:** `await page.getByText('Bienvenido al sistema').toBeVisible();`

3.  **`page.getByLabel(label)`**  
    *   **Uso:** Excelente para formularios etiquetados correctamente (`<label for="...">`).
    *   **Ejemplo:** `await page.getByLabel('Correo Electrónico').fill('test@g-mini.com');`

4.  **`page.getByPlaceholder(text)`**  
    *   **Uso:** Para inputs que solo tienen placeholder y no label visible.
    *   **Nota:** `getByPlaceholderText` está **DEPRECADO/LEGACY**. Usa `getByPlaceholder`.
    *   **Ejemplo:** `await page.getByPlaceholder('Buscar receta...').fill('Burger');`

5.  **`page.getByTestId(testId)`**  
    *   **Uso:** Cuando no hay atributos semánticos únicos y el texto es dinámico.
    *   **Configuración:** Requiere agregar `data-testid="..."` en el código fuente.
    *   **Ejemplo:** `await page.getByTestId('recipe-save-button').click();`

### Selectores a Evitar
*   `page.locator('div > span:nth-child(3)')` (Muy frágil ante cambios de diseño)
*   XPath complejos (`//div[@id="root"]/main/div[2]`)

---

## 2. Aserciones (Assertions)

Utiliza siempre "Web-First Assertions" (`await expect(...)`). Estas aserciones esperan automáticamente (retry-ability) hasta que la condición se cumpla o expire el timeout.

### Aserciones Comunes

| Aserción | Uso |
| :--- | :--- |
| `await expect(locator).toBeVisible()` | Verifica que el elemento esté en el DOM y visible. |
| `await expect(locator).toHaveText(/Exitoso/i)` | Verifica texto completo o parcial (Regex). |
| `await expect(locator).toHaveValue('10')` | Verifica el valor de un input. |
| `await expect(locator).toBeEnabled()` | Verifica que un botón/input sea interactuable. |
| `await expect(page).toHaveURL(/.*recipes/)` | Verifica la URL actual. |

### Soft Assertions
Útil si quieres verificar múltiples cosas sin detener el test ante el primer fallo.
```typescript
// Si esto falla, el test continúa
await expect.soft(page.getByTestId('status')).toHaveText('Activo'); 
await expect(page.getByRole('button')).toBeVisible();
```

---

## 3. Manejo de Errores Comunes

### "Strict Mode Violation"
*   **Error:** `resolved to 2 elements`
*   **Causa:** Tu selector es ambiguo y matchea múltiples elementos.
*   **Solución:**
    1.  Ser más específico: `getByRole('button', { name: 'Guardar', exact: true })`
    2.  Filtrar por contenedor: `page.locator('#header').getByRole('button')`
    3.  Iterar (si es intencional): `await locator.first().click()` (Úsalo con precaución).

### Tipos de Deprecación
*   ❌ `getByPlaceholderText` -> ✅ **`getByPlaceholder`**
*   ❌ `waitForTimeout(5000)` -> ✅ **`await expect(...).toBeVisible()`** (Evita esperas fijas).

---

## 4. Buenas Prácticas Generales

1.  **Aislar Tests:** Cada test (`test(...)`) debe ser independiente. Usa `test.beforeEach` para la navegación/setup común.
2.  **Usa `codegen`:** Si tienes dudas de cómo seleccionar un elemento, corre `npx playwright codegen` y haz clic en el elemento en el navegador. Copia el selector que genera.
3.  **Variables de Entorno:** No hardcodees credenciales ni URLs base. Usa `playwright.config.ts`.
4.  **Traces:** Configura `trace: 'on-first-retry'` para tener un video y timeline completos cuando un test falla en CI.

---

## 5. Cheatsheet de Migración

| Código Viejo / Frágil | Código Nuevo / Robusto |
| :--- | :--- |
| `await page.click('text=Guardar')` | `await page.getByRole('button', { name: /Guardar/i }).click()` |
| `await page.fill('#name', 'Memo')` | `await page.getByLabel('Nombre').fill('Memo')` |
| `await page.waitForTimeout(1000)` | `await expect(page.getByText('Cargado')).toBeVisible()` |
| `page.getByPlaceholderText(...)` | `page.getByPlaceholder(...)` |

---

## 6. Estrategias Específicas para Chakra UI

Chakra UI presenta desafíos únicos debido a su sistema de animaciones, portales y componentes accesibles personalizados.

### 6.1. Dropdowns y Selects Personalizados
Chakra UI a menudo usa componentes `Menu` o wrappers personalizados que **NO** son elementos `<select>` nativos.
*   **Problema:** `page.selectOption(...)` no funciona.
*   **Solución:** Simula la interacción del usuario.
    ```typescript
    // 1. Abrir el dropdown
    await page.getByRole('button', { name: 'Seleccionar Opción' }).click();
    // 2. Esperar opcionalmente (si hay animación) o cliquear la opción
    await page.getByRole('option', { name: 'Opción Deseada' }).click();
    ```

### 6.2. Modales, Dialogs y Drawers (Portales)
Chakra renderiza estos componentes en un "Portal" (generalmente al final del `<body>`), fuera de la jerarquía normal del DOM en React.
*   **Consejo:** No busques estos elementos dentro de un contenedor específico de página. Usa selectores globales por rol.
    ```typescript
    // ✅ Correcto: Busca en todo el documento (incluyendo portales)
    await expect(page.getByRole('dialog', { name: 'Confirmar Acción' })).toBeVisible();

    // ❌ Incorrecto: Puede fallar si 'main-content' no contiene el portal
    await page.locator('#main-content').getByRole('dialog')...
    ```

### 6.3. Toasts (Notificaciones)
Los Toasts aparecen y desaparecen automáticamente.
*   **Estrategia:** Aumentar el timeout si es necesario o verificar la presencia inmediata.
    ```typescript
    // Verificar que aparece y contiene el mensaje de éxito
    await expect(page.getByText('Guardado exitosamente')).toBeVisible();
    
    // Si desaparece muy rápido, puedes verificar que NO esté visible después
    await expect(page.getByText('Guardado exitosamente')).toBeHidden({ timeout: 10000 });
    ```

### 6.4. Deshabilitar Animaciones (Crucial para Estabilidad)
Las animaciones de Chakra pueden causar errores de "element is moving" o "element is not stable".
*   **Solución:** Asegurar que `playwright.config.ts` inyecte estilos para desactivar transiciones.
    *   *Nota: Ya está configurado en nuestro proyecto via `disable-animations.css`.*

---

## 7. Patrón Page Object Model (POM)

Para mantener los tests organizados y reutilizables, recomendamos el patrón "Page Object".

**Ejemplo de Estructura:**
`tests/e2e/pages/RecipePage.ts`
```typescript
import { expect, type Locator, type Page } from '@playwright/test';

export class RecipePage {
  readonly page: Page;
  readonly createButton: Locator;
  readonly nameInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createButton = page.getByRole('button', { name: 'Nueva Receta' });
    this.nameInput = page.getByPlaceholder('Nombre de la receta');
    // ... más locators
  }

  async goto() {
    await this.page.goto('/admin/supply-chain/recipes');
  }

  async createRecipe(name: string) {
    await this.createButton.click();
    await this.nameInput.fill(name);
    // ... lógica encapsulada
  }
}
```

**Uso en el Test:**
```typescript
import { test } from '@playwright/test';
import { RecipePage } from '../pages/RecipePage';

test('crear receta', async ({ page }) => {
  const recipePage = new RecipePage(page);
  await recipePage.goto();
  await recipePage.createRecipe('Hamburguesa Clásica');
});
```

---

## 8. Patrones Avanzados y Tips Adicionales (2025)

Basado en las últimas recomendaciones de la industria, incorpora estos patrones para tests de nivel profesional.

### 8.1. Network Mocking e Intercepción
No dependas siempre del backend real. Usa `page.route()` para simular respuestas, especialmente para casos de error o datos difíciles de reproducir.

```typescript
// Simular un Error 500 del servidor
await page.route('**/api/recipes', route => {
  route.fulfill({
    status: 500,
    body: JSON.stringify({ message: 'Internal Server Error' }),
  });
});

// Verificar que la UI maneja el error correctamente
await expect(page.getByText('Error al cargar recetas')).toBeVisible();
```

### 8.2. Visual Regression Testing
Para asegurar que no haya regresiones visuales (colores, alineación, spacing) que los selectores de texto no captan.

```typescript
// Compara una captura de pantalla actual con la versión "baseline" aprobada
await expect(page).toHaveScreenshot('homepage.png', {
  maxDiffPixels: 100, // Tolerancia a pequeños cambios de renderizado
});
```

### 8.3. Autenticación Reutilizable (`storageState`)
No te loguees en cada test. Usa el patrón de "Setup Project" para loguearte una vez, guardar el estado (cookies/tokens) y reutilizarlo.
*   **Configuración:** Ya implementado en `playwright.config.ts` (ver proyecto `setup` y `authenticated`).
*   **Beneficio:** Reduce el tiempo de ejecución drásticamente.

### 8.4. Anti-Patterns a Evitar ⛔
1.  **Wait for Timeout:** `await page.waitForTimeout(5000)` es una "red flag". Indica que no sabes qué estás esperando. Usa `await expect(...).toBeVisible()`.
2.  **Testear Implementación en lugar de Comportamiento:** No testees que el componente `Button` tenga la clase `.chakra-button`. Testea que el botón diga "Guardar" y sea cliqueable.
3.  **Setup de Datos vía UI:** Si necesitas 10 ingredientes para un test, no los crees uno por uno en la UI. Usa una API request (`request.post(...)`) en el `beforeAll` para "sembrar" la base de datos rápidamente.

