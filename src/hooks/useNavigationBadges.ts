// src/hooks/useNavigationBadges.tsx
// Hook para sincronizar badges de navegación con alertas del sistema
// ✅ Conecta alertas de inventario con badges de módulos

import { useEffect } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { useInventory } from '@/features/inventory/logic/useInventory';

export function NavigationBadgeSync() {
  const { updateModuleBadge } = useNavigation();
  const { alertSummary, loading } = useInventory();

  useEffect(() => {
    if (!loading && alertSummary) {
      // ✅ Actualizar badge de inventario con alertas críticas + warning
      const inventoryBadgeCount = alertSummary.critical + alertSummary.warning;
      updateModuleBadge('inventory', inventoryBadgeCount);

      // ✅ TODO: Agregar badges para otros módulos según se implementen
      // updateModuleBadge('sales', pendingSalesCount);
      // updateModuleBadge('production', productionIssuesCount);
    }
  }, [alertSummary, loading, updateModuleBadge]);

  return null; // Este componente no renderiza nada
}