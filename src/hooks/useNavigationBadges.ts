// src/hooks/useNavigationBadges.tsx
// Hook para sincronizar badges de navegación con alertas del sistema
// ✅ Conecta alertas de inventario con badges de módulos

import { useEffect } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { useMaterials } from '@/hooks/useZustandStores';

export function NavigationBadgeSync(): null {
  const { updateModuleBadge } = useNavigation();
  const { stats, loading } = useMaterials();

  useEffect(() => {
    if (!loading && stats) {
      // ✅ Actualizar badge de inventario con alertas críticas + warning
      const materialsBadgeCount = stats.criticalStockCount + stats.lowStockCount;
      updateModuleBadge('materials', materialsBadgeCount);

      // ✅ TODO: Agregar badges para otros módulos según se implementen
      // updateModuleBadge('sales', pendingSalesCount);
      // updateModuleBadge('production', productionIssuesCount);
    }
  }, [stats, loading, updateModuleBadge]);

  return null; // Este componente no renderiza nada
}