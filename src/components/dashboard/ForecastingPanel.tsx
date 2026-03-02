import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, Target, Calendar, FileSpreadsheet } from "lucide-react";
import { useCsvData, deriveSalesOverTime } from "@/hooks/useCsvData";

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
  const { rows } = useCsvData();
  const salesOverTime = deriveSalesOverTime(rows);

  if (salesOverTime.length === 0) {
    return (
      <div className="glass-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground">Demand Forecasting</h3>
        <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
          <FileSpreadsheet className="mb-2 h-10 w-10 opacity-40" />
          <p className="text-sm">Upload a CSV with date and sales data</p>
        </div>
      </div>
    );
  }

  // Simple forecast: extend with a trend line
  const lastValue = salesOverTime[salesOverTime.length - 1]?.sales || 0;
  const firstValue = salesOverTime[0]?.sales || 0;
  const growthRate = salesOverTime.length > 1 ? (lastValue - firstValue) / (salesOverTime.length - 1) : 0;
  const growthPct = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

  const forecastData = salesOverTime.map((d) => ({ ...d, predicted: null as number | null }));
  for (let i = 1; i <= 3; i++) {
    forecastData.push({
      month: `F+${i}`,
      sales: 0,
      predicted: Math.round(lastValue + growthRate * i),
    });
  }

  return (
    <div className="glass-card rounded-xl border border-border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Demand Forecasting</h3>
        <p className="text-sm text-muted-foreground">Trend-based prediction from uploaded data</p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-secondary/50 p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-xs text-muted-foreground">Growth</span>
          </div>
          <p className="mt-1 text-xl font-bold text-success">{growthPct >= 0 ? "+" : ""}{growthPct.toFixed(1)}%</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Data Points</span>
          </div>
          <p className="mt-1 text-xl font-bold text-foreground">{rows.length}</p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-warning" />
            <span className="text-xs text-muted-foreground">Periods</span>
          </div>
          <p className="mt-1 text-xl font-bold text-foreground">{salesOverTime.length}</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={forecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="sales" stroke="hsl(190, 95%, 45%)" strokeWidth={2} dot={{ fill: "hsl(190, 95%, 45%)", r: 3 }} name="Actual" connectNulls={false} />
            <Line type="monotone" dataKey="predicted" stroke="hsl(38, 92%, 55%)" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "hsl(38, 92%, 55%)", r: 3 }} name="Forecast" connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
