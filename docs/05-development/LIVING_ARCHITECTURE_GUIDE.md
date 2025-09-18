# G-Admin: Guía de Arquitectura Viva

**Versión 1.0**

## 1. Misión

Este es un documento vivo que sirve como la "Constitución" para el desarrollo de G-Admin. Su propósito es garantizar la consistencia, calidad y mantenibilidad del codebase a largo plazo. Todas las decisiones de desarrollo futuras deben adherirse a los principios y procesos aquí descritos.

## 2. Principios Fundamentales

Estos son los pilares innegociables de nuestra arquitectura:

1.  **Separación de Concerns:** La UI (Componentes), la Orquestación de la UI (Hooks de Página) y la Lógica de Negocio (Servicios) son capas distintas y no deben mezclarse.
2.  **`CapabilityGate` como Única Fuente de Verdad para la UI:** La visibilidad de cualquier funcionalidad, componente o elemento de la UI debe estar controlada **exclusivamente** por el sistema de `Business Capabilities` a través del componente `<CapabilityGate>`. No se debe usar estado local para este propósito.
3.  **Servicios como Cerebros de los Módulos:** Toda la lógica de negocio de un módulo (orquestación de llamadas a API, cálculos, manejo de estado) debe residir en su `[module]Service.ts`.
4.  **Reutilización Inteligente de la Lógica de Negocio:**
    *   La lógica de negocio específica de un solo módulo pertenece a su servicio.
    *   La lógica de negocio que es compartida por **dos o más módulos** debe ser promovida a un "Motor" reutilizable en la carpeta `src/business-logic/`.
5.  **Backend-Driven Logic:** Los cálculos críticos para la integridad de los datos (financieros, de stock, etc.) deben realizarse en el backend siempre que sea posible, y ser consumidos a través de la capa de API.

## 3. Workflow para Nuevos Módulos

Todo nuevo módulo que se cree en G-Admin debe seguir el patrón establecido en el `REFACTORING_PLAYBOOK.md`. El proceso es el siguiente:

1.  **Diseñar Primero:** Antes de escribir código, definir la estructura de archivos, los componentes, el servicio y cómo se integrará con el `CapabilityGate`.
2.  **Seguir el Patrón:** Construir el módulo siguiendo la estructura del "Estándar de Oro" (`Products`).
3.  **Revisión de Código Obligatoria:** Ningún módulo nuevo puede ser mergeado a la rama principal sin una revisión de código que verifique explícitamente el cumplimiento de los principios de esta guía.

## 4. Gobernanza Arquitectónica

Para evitar la "deriva arquitectónica" y la reintroducción del caos, se establecen los siguientes procesos:

1.  **Revisiones de Código (Pull Requests):**
    *   **Checklist de Arquitectura:** Cada PR debe ser revisado no solo por su funcionalidad, sino también por su alineación con esta guía. Se debe usar el "Checklist de Verificación Final" del playbook.
    *   **Prohibido el "Vibe Coding":** Cualquier código que no siga la estructura (ej. lógica en componentes, llamadas a la API desde hooks) debe ser rechazado y refactorizado antes de ser aceptado.

2.  **Sugerencia de Linters (Futuro):**
    *   Se recomienda configurar reglas de ESLint personalizadas para detectar automáticamente anti-patrones. Ejemplos:
        *   `no-direct-supabase-call-from-component`: Prohíbe importar `supabase` en archivos de componentes React.
        *   `service-layer-required`: Asegura que los hooks de página interactúen con un servicio en lugar de manejar la lógica directamente.

3.  **Architectural Decision Records (ADRs):**
    *   Cualquier decisión futura que implique un cambio o una adición a esta guía (ej. adoptar una nueva librería de estado, reintroducir la `ModuleFactory`) **debe** ser documentada en un nuevo archivo Markdown en una carpeta `docs/adr/`.
    *   El ADR debe explicar el contexto del problema, las opciones consideradas y la justificación de la decisión final. Esto mantiene un historial de por qué la arquitectura evoluciona.

## 5. Visión y Evolución a Futuro

Una vez que la mayoría de los módulos hayan sido alineados con el "Estándar de Oro" (La Gran Convergencia), podemos considerar las siguientes evoluciones:

1.  **Re-evaluación de la `ModuleFactory`:**
    *   **Cuándo:** Cuando tengamos al menos 5-7 módulos que sigan un patrón manual idéntico y repetitivo.
    *   **Por qué:** En ese punto, tendremos un entendimiento tan profundo del patrón que podremos considerar automatizarlo con una versión mejorada de la fábrica, una que esté integrada con el `CapabilityGate` y los `Slots`. Intentarlo antes es prematuro.

2.  **Base de Datos Dinámica:**
    *   **Qué:** La idea de generar el esquema de la base de datos o tablas específicas basadas en las `Business Capabilities` seleccionadas durante el setup.
    *   **Cuándo:** Esto debe ser considerado una mejora de "v4.0". Es una funcionalidad de muy alta complejidad que solo puede ser abordada cuando el 100% de la capa de la aplicación sea estable y consistente.

3.  **Optimización de Performance:**
    *   **Cuándo:** Después de la "Gran Convergencia".
    *   **Por qué:** Con una arquitectura limpia y predecible, es mucho más fácil identificar y solucionar cuellos de botella reales, ya sea en el frontend (bundle size, re-renders) o en el backend (queries lentas).

Este documento es la referencia final para asegurar que G-Admin se convierta en la aplicación robusta, mantenible y escalable que fue diseñada para ser.
