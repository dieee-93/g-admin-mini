import { useState, useMemo } from 'react';
import {
  CurrencyDollarIcon,
  UsersIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import type { SalesAnalytics } from '../../../../../types';
import type { MetricCard } from '../types';

export const useSalesIntelligence = (
  analytics: SalesAnalytics,
  onDateRangeChange: (dateFrom: string, dateTo: string) => void
) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('today');
  const [selectedMetricCategory, setSelectedMetricCategory] = useState<string>('financial');

  // Format metric values
  const formatMetricValue = (value: number, format: string = 'number'): string => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'time': {
        if (value < 60) return `${Math.round(value)}m`;
        const hours = Math.floor(value / 60);
        const minutes = Math.round(value % 60);
        return `${hours}h ${minutes}m`;
      }
      default:
        return value.toLocaleString();
    }
  };

  // Get metric cards based on category
  const getMetricCards = (category: string): MetricCard[] => {
    switch (category) {
      case 'financial':
        return [
          {
            title: 'Daily Revenue',
            value: analytics?.daily_revenue || 0,
            format: 'currency',
            icon: CurrencyDollarIcon,
            color: 'green',
            change: 15.2 // This would come from your analytics
          },
          {
            title: 'Average Order Value',
            value: analytics?.average_order_value || 0,
            format: 'currency',
            icon: ChartBarIcon,
            color: 'blue',
            target: 45 // Target AOV
          },
          {
            title: 'Gross Profit Margin',
            value: analytics?.gross_profit_margin || 0,
            format: 'percentage',
            icon: ArrowTrendingUpIcon,
            color: 'purple',
            target: 70
          },
          {
            title: 'Food Cost %',
            value: analytics?.food_cost_percentage || 0,
            format: 'percentage',
            icon: ChartBarIcon,
            color: (analytics?.food_cost_percentage || 0) > 30 ? 'red' : 'green',
            target: 30
          }
        ];

      case 'operational':
        return [
          {
            title: 'Table Utilization',
            value: analytics?.table_utilization || 0,
            format: 'percentage',
            icon: UsersIcon,
            color: 'orange'
          },
          {
            title: 'Average Service Time',
            value: analytics?.average_service_time || 0,
            format: 'time',
            icon: ClockIcon,
            color: (analytics?.average_service_time || 0) > 45 ? 'red' : 'green',
            target: 30
          },
          {
            title: 'Table Turnover Rate',
            value: analytics?.table_turnover_rate || 0,
            format: 'number',
            icon: ArrowTrendingUpIcon,
            color: 'blue'
          },
          {
            title: 'Average Covers',
            value: analytics?.average_covers || 0,
            format: 'number',
            icon: UsersIcon,
            color: 'cyan'
          }
        ];

      case 'customer':
        return [
          {
            title: 'Customer Acquisition Cost',
            value: analytics?.customer_acquisition_cost || 0,
            format: 'currency',
            icon: UsersIcon,
            color: 'purple'
          },
          {
            title: 'Repeat Customer Rate',
            value: analytics?.repeat_customer_rate || 0,
            format: 'percentage',
            icon: ArrowTrendingUpIcon,
            color: 'green',
            target: 60
          },
          {
            title: 'Customer Lifetime Value',
            value: analytics?.customer_lifetime_value || 0,
            format: 'currency',
            icon: CurrencyDollarIcon,
            color: 'gold'
          },
          {
            title: 'Sales per Labor Hour',
            value: analytics?.sales_per_labor_hour || 0,
            format: 'currency',
            icon: ClockIcon,
            color: 'blue'
          }
        ];

      default:
        return [];
    }
  };

  // Current metric cards
  const currentMetrics = useMemo(() =>
    getMetricCards(selectedMetricCategory),
    [selectedMetricCategory, analytics, getMetricCards]
  );

  // Get trend icon and color
  const getTrendInfo = (change?: number) => {
    if (!change) return { icon: null, color: 'gray' };
    if (change > 0) return { icon: ArrowTrendingUpIcon, color: 'green' };
    if (change < 0) return { icon: ArrowTrendingDownIcon, color: 'red' };
    return { icon: null, color: 'gray' };
  };

  // Handle time range change
  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);

    const now = new Date();
    let dateFrom: string, dateTo: string;

    switch (range) {
      case 'today':
        dateFrom = dateTo = now.toISOString().split('T')[0];
        break;
      case 'yesterday': {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        dateFrom = dateTo = yesterday.toISOString().split('T')[0];
        break;
      }
      case 'week': {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        dateFrom = weekStart.toISOString().split('T')[0];
        dateTo = now.toISOString().split('T')[0];
        break;
      }
      case 'month':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        dateTo = now.toISOString().split('T')[0];
        break;
      default:
        return;
    }

    onDateRangeChange(dateFrom, dateTo);
  };

  return {
    selectedTimeRange,
    selectedMetricCategory,
    setSelectedMetricCategory,
    currentMetrics,
    formatMetricValue,
    getTrendInfo,
    handleTimeRangeChange,
  };
};
