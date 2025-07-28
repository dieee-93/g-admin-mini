import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
      // Total de items
      const { count: itemsCount } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true });

      // Valor total del stock (stock * unit_cost para cada item)
      const { data: itemsWithStock } = await supabase
        .from('items')
        .select('stock, unit_cost')
        .not('unit_cost', 'is', null);

      const totalStockValue = itemsWithStock?.reduce((total, item) => {
        return total + (item.stock * (item.unit_cost || 0));
      }, 0) || 0;

      // Items con stock bajo (menos de 10 unidades)
      const { count: lowStockCount } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .lt('stock', 10);

      // Entradas de stock este mes
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: entriesCount } = await supabase
        .from('stock_entries')
        .select('*', { count: 'exact', head: true })
        .gte('date', startOfMonth.toISOString());

      setStats({
        totalItems: itemsCount || 0,
        totalStockValue,
        stockEntriesThisMonth: entriesCount || 0,
        lowStockItems: lowStockCount || 0,
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