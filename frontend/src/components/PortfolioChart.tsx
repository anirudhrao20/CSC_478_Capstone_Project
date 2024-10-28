import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Stock } from '../types/portfolio';

interface ChartData {
  symbol: string;
  value: number;
  percentage?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function PortfolioChart({ data }: { data: Stock[] }) {
  // Filter out invalid entries and ensure we have values
  const validData = data.filter(item => item.value && item.value > 0);
  
  if (validData.length === 0) {
    return <div className="h-[400px] flex items-center justify-center text-default-500">
      No portfolio data to display
    </div>;
  }

  // Calculate percentages
  const totalValue = validData.reduce((sum, item) => sum + (item.value || 0), 0);
  const dataWithPercentages = validData.map(item => ({
    symbol: item.symbol,
    value: item.value || 0,
    percentage: ((item.value || 0) / totalValue) * 100
  }));

  return (
    <div className="h-[400px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dataWithPercentages}
            dataKey="value"
            nameKey="symbol"
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={150}
            label={({ symbol, percentage }) => 
              `${symbol} (${percentage?.toFixed(1) || '0'}%)`
            }
          >
            {dataWithPercentages.map((entry, index) => (
              <Cell 
                key={entry.symbol} 
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `$${value.toLocaleString()}`}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
