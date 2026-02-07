import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const salesData = [
  { month: "Jan", sales: 45000, forecast: 42000 },
  { month: "Feb", sales: 52000, forecast: 48000 },
  { month: "Mar", sales: 48000, forecast: 50000 },
  { month: "Apr", sales: 61000, forecast: 55000 },
  { month: "May", sales: 55000, forecast: 58000 },
  { month: "Jun", sales: 67000, forecast: 62000 },
  { month: "Jul", sales: 72000, forecast: 68000 },
  { month: "Aug", sales: 69000, forecast: 72000 },
  { month: "Sep", sales: 78000, forecast: 75000 },
  { month: "Oct", sales: 82000, forecast: 80000 },
  { month: "Nov", sales: 91000, forecast: 88000 },
  { month: "Dec", sales: null, forecast: 95000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg border border-border p-3 shadow-xl">
        <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: ${(entry.value / 1000).toFixed(0)}K
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function SalesChart() {
  return (
    <div className="glass-card rounded-xl border border-border p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Revenue Overview</h3>
          <p className="text-sm text-muted-foreground">
            Actual vs Forecasted Sales
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-warning" />
            <span className="text-xs text-muted-foreground">Forecast</span>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(190, 95%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(190, 95%, 45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38, 92%, 55%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(38, 92%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(222, 30%, 16%)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
              tickFormatter={(value) => `$${value / 1000}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="hsl(190, 95%, 45%)"
              strokeWidth={2}
              fill="url(#salesGradient)"
              name="Actual Sales"
              connectNulls={false}
            />
            <Area
              type="monotone"
              dataKey="forecast"
              stroke="hsl(38, 92%, 55%)"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#forecastGradient)"
              name="Forecast"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
