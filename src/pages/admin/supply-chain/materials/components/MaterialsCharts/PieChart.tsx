import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

export interface PieChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartDataPoint[];
  colors?: string[];
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
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

export function PieChart({
  data,
  colors = DEFAULT_COLORS,
  showLegend = true,
  innerRadius = 0,
  outerRadius = 80,
  height = 300
}: PieChartProps) {
  const gridColor = '#e2e8f0'; // gray.200

  // Use custom colors from data or fallback to provided colors array
  const getColor = (index: number, item: PieChartDataPoint) => {
    return item.color || colors[index % colors.length];
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
          animationDuration={800}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={getColor(index, entry)}
            />
          ))}
        </Pie>

        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: `1px solid ${gridColor}`,
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          formatter={(value: number) =>
            new Intl.NumberFormat('es-AR').format(value)
          }
        />

        {showLegend && (
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
          />
        )}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
