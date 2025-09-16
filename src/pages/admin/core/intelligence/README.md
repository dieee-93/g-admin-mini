# TODO: Refactorización Estratégica a Futuro

Este módulo (`CompetitiveIntelligence`) se ha aislado aquí de forma temporal para limpiar el `dashboard`.
La decisión estratégica a largo plazo es descomponer sus funcionalidades e integrarlas en los módulos de negocio donde aportan más valor:

1.  **Análisis de Precios**: La lógica y la UI del `PricingAnalysisPanel` deberían moverse al módulo `supply-chain/products` para informar directamente las estrategias de precios de los productos.
2.  **Análisis de Tendencias y Mercado**: Los paneles `MarketTrendsPanel` y `MarketInsightsPanel` podrían convertirse en componentes del módulo `operations/sales` o widgets para el dashboard principal.

Esta descomposición debe planificarse en un sprint futuro para asegurar que la lógica de negocio esté lo más cerca posible del dominio que la utiliza.
