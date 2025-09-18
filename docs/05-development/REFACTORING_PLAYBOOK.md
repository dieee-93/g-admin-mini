# G-Admin: Manual de Refactorización de Módulos ("Playbook")

**Versión 1.0**

## Objetivo

Este documento es una guía práctica y paso a paso para refactorizar cualquier módulo existente en G-Admin y alinearlo con la arquitectura "Estándar de Oro". El objetivo es eliminar la inconsistencia, la lógica duplicada y las funcionalidades desconectadas.

El módulo `Products` (`src/pages/admin/supply-chain/products/`) ha sido refactorizado siguiendo este manual y sirve como el ejemplo de referencia.

## Principios Arquitectónicos

1.  **Separación de Concerns:** La UI (Componentes), la Orquestación (Hooks) y la Lógica de Negocio (Servicios) deben vivir en capas separadas.
2.  **Fuente Única de Verdad:** El estado global se maneja a través de los stores de Zustand. Las funcionalidades se muestran/ocultan **únicamente** a través del `CapabilityGate`.
3.  **Servicios para la Lógica:** Cada módulo debe tener un servicio principal (`[module]Service.ts`) que orquesta toda su lógica de negocio.
4.  **Reutilización Inteligente:** La lógica de negocio compartida por 2 o más módulos debe vivir en `src/business-logic/`. La lógica específica de un módulo vive en su propio servicio.

## Proceso de Refactorización Paso a Paso

### Paso 1: Diagnóstico Inicial del Módulo

Antes de cambiar nada, entiende el estado actual del módulo.

1.  **Lista la estructura de archivos:** ¿Existen las carpetas `components/`, `hooks/`, `services/`, `types/`?
2.  **Identifica el Hook Orquestador:** Busca el hook principal (ej. `use[Module]Page.ts`).
3.  **Encuentra la Lógica de Negocio:** ¿Dónde se hacen las llamadas a la API? ¿Dónde se realizan los cálculos? La lógica puede estar en el hook orquestador, en hooks específicos, o peor, dentro de los componentes.

### Paso 2: Centralizar la Lógica de Negocio en un Servicio

El objetivo es crear un "cerebro" para el módulo.

1.  **Crea/Verifica el Servicio de API:** Asegúrate de que exista un archivo `services/[module]Api.ts`. Mueve todas las llamadas a Supabase (o cualquier API externa) a este archivo. Las funciones deben ser simples y solo encargarse de la comunicación.
    ```typescript
    // Ejemplo: src/pages/admin/supply-chain/products/services/productApi.ts
    export async function fetchProductsWithIntelligence(): Promise<ProductWithIntelligence[]> {
      const { data, error } = await supabase.rpc("get_products_with_availability");
      if (error) throw error;
      return data;
    }
    ```
2.  **Crea el Servicio del Módulo:** Crea el archivo `services/[module]Service.ts`. Este será el único lugar donde se orqueste la lógica de negocio.
    ```typescript
    // Ejemplo: src/pages/admin/supply-chain/products/services/productsService.ts
    import { useProductsStore } from '@/store/productsStore';
    import { productApi } from './productApi';

    class ProductsService {
      private getStore = () => useProductsStore.getState();

      async loadProducts() {
        const { setLoading, setError, setProducts } = this.getStore();
        setLoading(true);
        try {
          const products = await productApi.fetchProductsWithIntelligence();
          // Aquí puedes añadir transformaciones o llamar a otros servicios
          setProducts(products);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      }
    }
    export const productsService = new ProductsService();
    ```

### Paso 3: Refactorizar el Hook Orquestador

El hook de la página debe ser ligero y delegar todo el trabajo al servicio.

1.  **Limpia el Hook:** Elimina toda la lógica de negocio, llamadas a API, y cálculos del hook.
2.  **Conéctalo al Servicio:** Haz que el hook llame a los métodos del servicio que creaste en el paso anterior.
3.  **Conéctalo al Store:** El hook debe obtener su estado (`data`, `isLoading`, `error`) directamente del store de Zustand.
4.  **Elimina Hooks Redundantes:** Si había otros hooks que contenían lógica (como `useProducts.ts`), muéveles la lógica al servicio y elimínalos.

```typescript
// Ejemplo: src/pages/admin/supply-chain/products/hooks/useProductsPage.ts
import { useEffect } from 'react';
import { useProductsStore } from '@/store/productsStore';
import { productsService } from '../services/productsService';

export function useProductsPage() {
  const { products, isLoading, error } = useProductsStore();

  useEffect(() => {
    productsService.loadProducts();
  }, []);

  const handleNewProduct = () => {
    // productsService.openNewProductModal();
  };

  return { products, isLoading, error, handleNewProduct };
}
```

### Paso 4: Conectar la UI al Sistema de `Business Capabilities`

Haz que tu módulo sea dinámico y consciente del contexto.

1.  **Identifica Funcionalidades Condicionales:** Determina qué partes de tu UI son para usuarios "avanzados" o para ciertos modelos de negocio (ej. "Análisis de Costos", "Ingeniería de Menú").
2.  **Usa el `CapabilityGate`:** Envuelve esos componentes en el `<CapabilityGate>`.
3.  **Define la Capacidad Requerida:** Usa la prop `requires` para especificar la capacidad que el usuario debe tener para ver el componente. Si la capacidad no existe, invéntala de forma descriptiva (ej. `can_view_cost_analysis`).

```jsx
// Ejemplo: src/pages/admin/supply-chain/products/page.tsx
import { CapabilityGate } from '@/components/personalization/CapabilityGate';
import { CostAnalysisTab } from './components';

// ... dentro del componente de la página
<CapabilityGate requires="can_view_cost_analysis">
  <Section title="Cost Analysis">
    <CostAnalysisTab />
  </Section>
</CapabilityGate>
```

## Checklist de Verificación Final

Después de refactorizar, asegúrate de que tu módulo cumple con lo siguiente:
- [ ] ¿La `page.tsx` es solo para layout y renderizado condicional con `CapabilityGate`?
- [ ] ¿Existe un único hook orquestador (ej. `useProductsPage.ts`) y es ligero?
- [ ] ¿Toda la lógica de negocio está en el `[module]Service.ts`?
- [ ] ¿Todas las llamadas a la API están aisladas en el `[module]Api.ts`?
- [ ] ¿Se utilizan los motores de `src/business-logic/` para cálculos complejos y compartidos?
- [ ] ¿El estado se lee y se escribe en el store de Zustand correspondiente?
- [ ] ¿Se han eliminado los hooks y archivos redundantes?

### Paso 5 (Avanzado): Hacer el Módulo Extensible con Slots

Una vez que un módulo está limpio y conectado a las `Capabilities`, el siguiente paso es permitir que otros módulos inyecten contenido en él. Para esto se usa el `Slot System`.

1.  **Identifica Puntos de Extensión:** Dentro de tu módulo, decide dónde quieres que otros puedan añadir contenido. ¿En un dashboard? ¿En una barra lateral? ¿Debajo de una lista?
2.  **Define un `<Slot>`:** Coloca el componente `<Slot>` en esa ubicación, dándole un nombre único y descriptivo.

    ```jsx
    // Ejemplo: En el futuro, dentro de un panel de analytics del módulo Products
    import { Slot } from '@/lib/composition';

    // ...
    <Grid>
      <MainChart />
      {/* Otros módulos (ej. Gamification) pueden inyectar widgets aquí */}
      <Slot name="product.analytics.widgets" />
    </Grid>
    ```
3.  **Inyecta Contenido desde Otro Módulo:** Desde otro módulo (ej. `Gamification`), puedes usar el hook `useSlotContent` para añadir un componente a ese slot.

    ```jsx
    // Ejemplo: Desde un widget del módulo de Gamification
    import { useSlotContent } from '@/lib/composition';

    function TopSellersWidget() {
      // Este hook le dice al SlotProvider que renderice MyWidget en el slot con ese nombre
      useSlotContent('product.analytics.widgets', <MyWidget />);

      // Este componente no renderiza nada por sí mismo
      return null;
    }
    ```
