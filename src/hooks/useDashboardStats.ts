import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';

interface DashboardStats {
  totalItems: number;
  totalStockValue: number;
  stockEntriesThisMonth: number;
  lowStockItems: number;
  loading: boolean;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    totalStockValue: 0,
    stockEntriesThisMonth: 0,
    lowStockItems: 0,
    loading: true,
  });

  const loadStats = async () => {
    try {
      // ✅ OPCIÓN 1: Usar get_dashboard_stats si existe
      try {
        const { data: dashboardData, error: dashboardError } = await supabase
          .rpc('get_dashboard_stats');
        
        if (!dashboardError && dashboardData) {
          setStats({
            totalItems: dashboardData.total_items || 0,
            totalStockValue: dashboardData.total_stock_value || 0,
            stockEntriesThisMonth: dashboardData.stock_entries_this_month || 0,
            lowStockItems: dashboardData.low_stock_items || 0,
            loading: false,
          });
          return;
        }
      } catch (dashboardErr) {
        console.warn('get_dashboard_stats failed, using individual queries');
      }

      // ✅ FALLBACK: Consultas individuales
      const [itemsCount, itemsWithStock, entriesCount, alertsData] = await Promise.all([
        // Total de items
        supabase.from('items').select('*', { count: 'exact', head: true }),
        
        // Valor total del stock
        supabase.from('items').select('stock, unit_cost').not('unit_cost', 'is', null),
        
        // Entradas este mes
        supabase.from('stock_entries')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        
        // ✅ Usar nuestra nueva función para alertas de stock
        supabase.rpc('get_low_stock_alert', { p_threshold: 10 })
      ]);

      // Calcular valor total del stock con precisión Decimal.js
      const totalStockValue = itemsWithStock.data?.reduce((total, item) => {
        const stockValue = DecimalUtils.calculateStockValue(
          item.stock || 0, 
          item.unit_cost || 0
        );
        return DecimalUtils.add(total, stockValue, 'inventory');
      }, DecimalUtils.fromValue(0, 'inventory')) || DecimalUtils.fromValue(0, 'inventory');

      const totalStockValueNumber = DecimalUtils.toNumber(totalStockValue);

      setStats({
        totalItems: itemsCount.count || 0,
        totalStockValue: totalStockValueNumber,
        stockEntriesThisMonth: entriesCount.count || 0,
        lowStockItems: alertsData.data?.length || 0, // ✅ Contar alertas
        loading: false,
      });

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return { stats, reloadStats: loadStats };
}