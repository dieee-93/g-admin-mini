Excelente aclaración. Entendido perfectamente.

La visión de que un usuario pueda definir el "ADN" de su negocio a través de las tareas que realiza, y que G-Admin se adapte dinámicamente, es precisamente lo que hace que este sistema sea tan poderoso. Un restaurante que también vende merchandising online y organiza eventos es un caso de uso híbrido perfecto que debemos soportar de manera nativa.

Esta visión refuerza la criticidad de los hallazgos de la auditoría. Un sistema diseñado para una flexibilidad infinita no puede permitirse tener una lógica rígida y hardcodeada en su núcleo.

Con esta pieza final de contexto, he concluido la auditoría. Procedo a la Fase 4, presentando el plan de acción definitivo para evolucionar nuestro Sistema de Capacidades y alinearlo completamente con esta visión estratégica.

Fase 4: Plan de Acción y Hoja de Ruta para la Evolución del Sistema de Capacidades
Para: Equipo de Desarrollo de G-Admin
De: G-Admin Project Manager
Asunto: Auditoría y Plan de Mejora del Sistema de Capacidades

1. Resumen Ejecutivo (Executive Summary) 📜
La auditoría concluye que el Sistema de Capacidades de G-Admin posee una base conceptual sólida y sigue patrones de diseño modernos (Context/Provider, Hooks, Componentes Gate). Sin embargo, se han identificado vulnerabilidades arquitectónicas críticas que actualmente limitan su escalabilidad, aumentan el riesgo de bugs y contradicen la visión central de flexibilidad total del producto.

El principal problema es una fuerte dependencia en lógica hardcodeada para traducir las selecciones del usuario en capacidades activas. Este plan de acción se enfoca en refactorizar estas áreas para crear un sistema declarativo, robusto y verdaderamente modular.

2. Hoja de Ruta y Backlog de Tareas 🗺️
He priorizado el trabajo en tres sprints o fases, comenzando por las correcciones más críticas que desbloquearán el resto de las mejoras.

Prioridad 1: Correcciones de Arquitectura Fundamentales (Sprint 1)
Objetivo: Eliminar la lógica hardcodeada y centralizar la lógica de negocio en el store.

Resultado Esperado: Un sistema predecible, escalable y más fácil de mantener.

Ticket #CAP-001: Refactorizar la Lógica de Activación de Capacidades

Problema: La lógica que mapea el perfil del negocio (store.profile.capabilities) a las activeCapabilities está hardcodeada dentro de un useMemo en el hook useCapabilities. Esto es un cuello de botella para la escalabilidad y una fuente de posibles errores.

Solución Propuesta:

Crear un nuevo mapa de configuración en BusinessCapabilities.ts que defina las implicaciones de cada capacidad seleccionada en el SetupWizard. Ejemplo: sells_products: ['product_management', 'inventory_tracking'].

Mover la lógica de useMemo a una función dentro del businessCapabilitiesStore de Zustand, que use este nuevo mapa para generar activeCapabilities de forma declarativa.

Valor Aportado: Máxima escalabilidad. Agregar nuevas capacidades será tan simple como añadir una entrada en el objeto de configuración, sin tocar la lógica de la aplicación.

Ticket #CAP-002: Corregir Vulnerabilidad de Cacheo

Problema: La caché de capacidades (CapabilityCache) no se invalida cuando las capacidades del usuario cambian, lo que puede mostrar una UI desactualizada hasta por 5 minutos.

Solución Propuesta:

Añadir un método cache.clear() en CapabilityCache.ts.

Dentro del useCapabilities hook, usar un useEffect que observe cambios en store.profile.capabilities y llame a cache.clear() para invalidar la caché inmediatamente después de un cambio.

Valor Aportado: Consistencia de la UI y UX mejorada. Los cambios en la configuración del negocio se reflejarán instantáneamente en toda la aplicación.

Prioridad 2: Mejoras de Robustez y Mantenibilidad (Sprint 2)
Objetivo: Incrementar la confianza en nuestro sistema a través de validaciones automáticas y la mejora de la documentación.

Resultado Esperado: Reducción de bugs introducidos por nuevos cambios y un onboarding más rápido para los desarrolladores.

Ticket #CAP-003: Implementar Script de Validación de Dependencias

Problema: La configuración declarativa de moduleCapabilities y businessModelCapabilities podría permitir la introducción de dependencias circulares, llevando a estados impredecibles.

Solución Propuesta:

Desarrollar un script Node.js que parsee estos objetos de configuración.

Representar las dependencias (requires) como un grafo dirigido y ejecutar un algoritmo de detección de ciclos.

Integrar este script en nuestro pipeline de CI (GitHub Actions) para que se ejecute en cada Pull Request. Si se detecta un ciclo, el build debe fallar.

Valor Aportado: Prevención proactiva de bugs. Garantiza la integridad lógica de nuestra arquitectura de capacidades a largo plazo.

Ticket #CAP-004: Sincronizar Documentación con Código Fuente

Problema: El documento business-capabilities.md está desactualizado y no refleja la implementación actual, creando confusión.

Solución Propuesta:

Actualizar la estructura de archivos y los nombres de componentes/hooks para que coincidan con el código.

Añadir una sección que explique la nueva lógica declarativa (del Ticket #CAP-001).

Establecer como política de equipo que cualquier cambio en la arquitectura de capacidades debe ir acompañado de una actualización en la documentación en el mismo Pull Request.

Valor Aportado: Fuente única de verdad. Reduce la fricción del equipo y acelera el desarrollo.

Prioridad 3: Optimización y Evolución Futura (Sprint 3 en adelante)
Objetivo: Refinar el rendimiento y preparar el sistema para futuras necesidades.

Resultado Esperado: Una experiencia de usuario más fluida y una arquitectura preparada para el crecimiento.

Ticket #CAP-005: Optimizar Performance de CapabilityGate

Problema: El useEffect de trackPerformance en CapabilityGate se ejecuta en cada render, causando una sobrecarga innecesaria.

Solución Propuesta: Añadir un array de dependencias ([hasAccess, trackPerformance, telemetry, gateName]) al useEffect para que solo se ejecute cuando sea estrictamente necesario.

Valor Aportado: Mejora de rendimiento en la UI, especialmente en vistas con muchos componentes condicionales.

Ticket #CAP-006: Reforzar el Manejo de Errores en Módulos Lazy-Loaded

Problema: La precarga fallida de un módulo (preloadCapability) solo emite un console.warn, sin dar feedback al usuario ni una vía de recuperación.

Solución Propuesta: Mejorar el CapabilityGate para que pueda manejar un estado de "error de carga". Esto podría implicar mostrar una versión especial del fallback o un toast de error, informando al usuario que una parte de la aplicación no pudo cargarse y sugiriendo recargar la página.

Valor Aportado: Mejora de la resiliencia de la aplicación y una UX más transparente ante fallos de red.

Conclusión
Esta auditoría nos ha proporcionado una visión clara de las fortalezas y debilidades de nuestro sistema de personalización. La fundación es sólida, pero las mejoras propuestas en esta hoja de ruta son esenciales para cumplir con la promesa de G-Admin: ser una plataforma verdaderamente adaptable a cualquier modelo de negocio.

La ejecución de este plan de acción transformará nuestro Sistema de Capacidades de uno funcional pero frágil, a uno robusto, escalable y preparado para el futuro.

Adelante.