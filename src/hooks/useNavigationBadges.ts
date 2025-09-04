// src/hooks/useNavigationBadges.ts
// ✅ NUEVO HOOK EFICIENTE PARA OBTENER RECUENTOS DE BADGES DE NAVEGACIÓN
// Reemplaza el antiguo componente NavigationBadgeSync que causaba bucles infinitos.

import { useMemo } from 'react';
import { useAlerts } from '@/shared/alerts';
import { type AlertContext } from '@/shared/alerts/types';

export type NavigationBadges = Record<AlertContext, number>;

/**
 * Hook centralizado para obtener los recuentos de todas las alertas
 * que necesitan mostrarse como badges en la navegación principal.
 * 
 * Llama a useAlerts() una sola vez y calcula los recuentos para cada módulo,
 * evitando re-renders ineficientes y bucles de dependencias.
 * 
 * @returns Un objeto donde las claves son los contextos de los módulos
 * y los valores son el número de alertas activas o reconocidas.
 */
export function useNavigationBadges(): NavigationBadges {
  // 1. Obtener todas las alertas relevantes de una sola vez.
  // Solo nos interesan las que están 'activas' o 'reconocidas'.
  const { alerts } = useAlerts({
    status: ['active', 'acknowledged'],
    autoFilter: true,
  });

  // 2. Calcular los recuentos para cada módulo de forma memoizada.
  // Este cálculo solo se re-ejecutará si la lista de alertas relevantes cambia.
  const badgeCounts = useMemo<NavigationBadges>(() => {
    // Inicializar todos los contadores a 0.
    const counts: NavigationBadges = {
      materials: 0,
      sales: 0,
      operations: 0,
      staff: 0,
      fiscal: 0,
      customers: 0,
      dashboard: 0,
      global: 0,
      security: 0,
      system: 0,
      validation: 0,
      business: 0,
    };

    // 3. Iterar una sola vez sobre las alertas para poblar los contadores.
    for (const alert of alerts) {
      if (counts[alert.context] !== undefined) {
        counts[alert.context]++;
      }
    }

    return counts;
  }, [alerts]);

  return badgeCounts;
}
