// ✅ PERFORMANCE: React.memo for chart optimization (Phase 2 Round 2)
import { memo } from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';

export interface BarChartDataPoint {
  name: string;
  value: number;
  color?: string;
  [key: string]: string | number | undefined;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  dataKey?: string;
  xAxisKey?: string;
  color?: string;
  colors?: string[];
  showGrid?: boolean;
  showLegend?: boolean;
  layout?: 'horizontal' | 'vertical';
  height?: number;
}

const DEFAULT_COLORS = [
  '#3182ce', // blue.500
  '#38a169', // green.500
  '#d69e2e', // yellow.500
  '#e53e3e', // red.500
  '#805ad5', // purple.500
  '#dd6b20', // orange.500
];

export const BarChart = memo<BarChartProps>(function BarChart({
  data,
  dataKey = 'value',
  xAxisKey = 'name',
  color,
  colors = DEFAULT_COLORS,
  showGrid = true,
  showLegend = false,
  layout = 'horizontal',
  height = 300
}: BarChartProps) {
  // Use ChakraUI v3 color tokens
  const defaultColor = color || '#3182ce'; // blue.500
  const gridColor = 'gray.200'; // gray.200
  const textColor = 'gray.600'; // gray.600

  const getColor = (index: number, item: BarChartDataPoint) => {
    return item.color || colors[index % colors.length];
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        layout={layout}
        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={gridColor}
            horizontal={layout === 'horizontal'}
            vertical={layout === 'vertical'}
          />
        )}

        {layout === 'horizontal' ? (
          <>
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
          </>
        ) : (
          <>
            <XAxis
              type="number"
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
            <YAxis
              type="category"
              dataKey={xAxisKey}
              stroke={textColor}
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
              width={100}
            />
          </>
        )}

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

        <Bar
          dataKey={dataKey}
          fill={defaultColor}
          radius={[4, 4, 0, 0]}
          animationDuration={800}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={getColor(index, entry)}
            />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
});

BarChart.displayName = 'BarChart';
