// src/hooks/useNavigationBadges.tsx
// 🚨 SISTEMA UNIFICADO DE BADGES DE NAVEGACIÓN
// ✅ Conecta el nuevo sistema de alertas con badges de módulos

import { useEffect } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { useContextAlerts } from '@/shared/alerts';

export function NavigationBadgeSync(): null {
  // TODO: Temporalmente deshabilitado para evitar bucles infinitos
  // El sistema de alertas necesita optimización para evitar re-renders
  
  /* 
  const { updateModuleBadge } = useNavigation();
  
  // 🚨 NUEVO: Usar sistema unificado de alertas
  const materialsAlerts = useContextAlerts('materials');
  const salesAlerts = useContextAlerts('sales');
  const operationsAlerts = useContextAlerts('operations');
  const staffAlerts = useContextAlerts('staff');
  const fiscalAlerts = useContextAlerts('fiscal');
  const customersAlerts = useContextAlerts('customers');

  useEffect(() => {
    // ✅ Actualizar badges usando el nuevo sistema de alertas
    
    // Materials/Inventory - alertas activas + reconocidas
    const materialsCount = materialsAlerts.activeCount + materialsAlerts.acknowledgedCount;
    updateModuleBadge('materials', materialsCount);

    // Sales - alertas de ventas
    const salesCount = salesAlerts.activeCount + salesAlerts.acknowledgedCount; 
    updateModuleBadge('sales', salesCount);

    // Operations - alertas operacionales
    const operationsCount = operationsAlerts.activeCount + operationsAlerts.acknowledgedCount;
    updateModuleBadge('operations', operationsCount);

    // Staff - alertas de personal
    const staffCount = staffAlerts.activeCount + staffAlerts.acknowledgedCount;
    updateModuleBadge('staff', staffCount);

    // Fiscal - alertas fiscales
    const fiscalCount = fiscalAlerts.activeCount + fiscalAlerts.acknowledgedCount;
    updateModuleBadge('fiscal', fiscalCount);

    // Customers - alertas de clientes
    const customersCount = customersAlerts.activeCount + customersAlerts.acknowledgedCount;
    updateModuleBadge('customers', customersCount);

  }, [
    materialsAlerts.activeCount, materialsAlerts.acknowledgedCount,
    salesAlerts.activeCount, salesAlerts.acknowledgedCount,
    operationsAlerts.activeCount, operationsAlerts.acknowledgedCount,
    staffAlerts.activeCount, staffAlerts.acknowledgedCount,
    fiscalAlerts.activeCount, fiscalAlerts.acknowledgedCount,
    customersAlerts.activeCount, customersAlerts.acknowledgedCount,
    updateModuleBadge
  ]);
  */

  return null; // Este componente no renderiza nada
}