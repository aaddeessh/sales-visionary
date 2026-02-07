import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { TrendingUp, Target, Calendar } from "lucide-react";

const forecastData = [
  { period: "W1", actual: 82000, predicted: 80000, lower: 75000, upper: 85000 },
  { period: "W2", actual: 78000, predicted: 82000, lower: 77000, upper: 87000 },
  { period: "W3", actual: 91000, predicted: 85000, lower: 80000, upper: 90000 },
  { period: "W4", actual: 88000, predicted: 89000, lower: 84000, upper: 94000 },
  { period: "W5", actual: null, predicted: 92000, lower: 86000, upper: 98000 },
  { period: "W6", actual: null, predicted: 95000, lower: 88000, upper: 102000 },
  { period: "W7", actual: null, predicted: 98000, lower: 90000, upper: 106000 },
  { period: "W8", actual: null, predicted: 102000, lower: 93000, upper: 111000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg border border-border p-3 shadow-xl">
        <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: ${(entry.value / 1000).toFixed(0)}K
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function ForecastingPanel() {
  return (
    <div className="glass-card rounded-xl border border-border p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Demand Forecasting
          </h3>
          <p className="text-sm text-muted-foreground">
            8-week sales prediction with confidence intervals
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-0.5 w-4 bg-primary" />
            Actual
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-0.5 w-4 border-b-2 border-dashed border-warning" />
            Predicted
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-secondary/50 p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-xs text-muted-foreground">Expected Growth</span>
          </div>
          <p className="mt-1 text-xl font-bold text-success">+24.3%</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Accuracy</span>
          </div>
          <p className="mt-1 text-xl font-bold text-foreground">94.2%</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-warning" />
            <span className="text-xs text-muted-foreground">Next Update</span>
          </div>
          <p className="mt-1 text-xl font-bold text-foreground">6h</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={forecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38, 92%, 55%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(38, 92%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="period"
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
            <ReferenceLine
              x="W4"
              stroke="hsl(222, 30%, 30%)"
              strokeDasharray="3 3"
              label={{ value: "Today", position: "top", fill: "hsl(215, 20%, 55%)", fontSize: 10 }}
            />
            <Line
              type="monotone"
              dataKey="upper"
              stroke="hsl(38, 92%, 55%)"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              name="Upper Bound"
            />
            <Line
              type="monotone"
              dataKey="lower"
              stroke="hsl(38, 92%, 55%)"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              name="Lower Bound"
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="hsl(38, 92%, 55%)"
              strokeWidth={2}
              dot={{ fill: "hsl(38, 92%, 55%)", strokeWidth: 0, r: 3 }}
              name="Predicted"
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="hsl(190, 95%, 45%)"
              strokeWidth={2}
              dot={{ fill: "hsl(190, 95%, 45%)", strokeWidth: 0, r: 4 }}
              name="Actual"
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 rounded-lg bg-primary/5 p-3">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-primary">Model:</span> Prophet + XGBoost ensemble | 
          <span className="ml-2 font-medium text-primary">Training:</span> 24 months historical data |
          <span className="ml-2 font-medium text-primary">Features:</span> Seasonality, trend, holidays
        </p>
      </div>
    </div>
  );
}
