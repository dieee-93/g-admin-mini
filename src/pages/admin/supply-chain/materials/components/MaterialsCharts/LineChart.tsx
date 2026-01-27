// ✅ PERFORMANCE: React.memo for chart optimization (Phase 2 Round 2)
import { memo } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export interface LineChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface LineChartProps {
  data: LineChartDataPoint[];
  dataKey?: string;
  xAxisKey?: string;
  color?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  strokeWidth?: number;
  height?: number;
}

export const LineChart = memo<LineChartProps>(function LineChart({
  data,
  dataKey = 'value',
  xAxisKey = 'name',
  color,
  showGrid = true,
  showLegend = false,
  strokeWidth = 2,
  height = 300
}: LineChartProps) {
  // Use ChakraUI v3 color tokens
  const lineColor = color || '#3182ce'; // blue.500
  const gridColor = '#e2e8f0'; // gray.200
  const textColor = '#718096'; // gray.600

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
        data={data}
        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={gridColor}
            vertical={false}
          />
        )}

        <XAxis
          dataKey={xAxisKey}
          stroke={textColor}
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: gridColor }}
        />

        <YAxis
          stroke={textColor}
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: gridColor }}
          tickFormatter={(value) =>
            new Intl.NumberFormat('es-AR', {
              notation: 'compact',
              compactDisplay: 'short'
            }).format(value)
          }
        />

        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: `1px solid ${gridColor}`,
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          labelStyle={{ color: textColor, fontWeight: 600 }}
          formatter={(value: number) =>
            new Intl.NumberFormat('es-AR').format(value)
          }
        />

        {showLegend && <Legend />}

        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={lineColor}
          strokeWidth={strokeWidth}
          dot={{ fill: lineColor, r: 4 }}
          activeDot={{ r: 6 }}
          animationDuration={800}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
});

LineChart.displayName = 'LineChart';
