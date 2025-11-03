export interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  target?: number;
  format?: 'currency' | 'percentage' | 'number' | 'time';
  icon?: React.ElementType;
  color?: string;
}
