import { useState } from "react";
import {
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, Target, Calendar, FileSpreadsheet, Sparkles, Loader2 } from "lucide-react";
import { useCsvData, deriveSalesOverTime } from "@/hooks/useCsvData";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface AiForecast {
  predictions: { month: string; predicted: number; lower_bound: number; upper_bound: number }[];
  summary: string;
  confidence_level: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg border border-border p-3 shadow-xl">
        <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
        {payload
          .filter((entry: any) => entry.value != null && entry.dataKey !== "upper_bound" && entry.dataKey !== "lower_bound")
          .map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: ₹{(entry.value / 1000).toFixed(1)}K
            </p>
          ))}
        {payload.find((e: any) => e.dataKey === "upper_bound") && (
          <p className="text-xs text-muted-foreground">
            Range: ₹{(payload.find((e: any) => e.dataKey === "lower_bound")?.value / 1000).toFixed(1)}K – ₹
            {(payload.find((e: any) => e.dataKey === "upper_bound")?.value / 1000).toFixed(1)}K
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function ForecastingPanel() {
  const { rows } = useCsvData();
  const salesOverTime = deriveSalesOverTime(rows);
  const [forecast, setForecast] = useState<AiForecast | null>(null);
  const [loading, setLoading] = useState(false);

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

  // Build chart data
  const lastValue = salesOverTime[salesOverTime.length - 1]?.sales || 0;
  const firstValue = salesOverTime[0]?.sales || 0;
  const growthPct = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;

  // Merge actual + forecast data for the chart
  const chartData = salesOverTime.map((d) => ({
    month: d.month,
    sales: d.sales,
    predicted: null as number | null,
    lower_bound: null as number | null,
    upper_bound: null as number | null,
  }));

  if (forecast) {
    // Bridge: last actual point also gets predicted value for continuity
    if (chartData.length > 0) {
      chartData[chartData.length - 1].predicted = chartData[chartData.length - 1].sales;
    }
    forecast.predictions.forEach((p) => {
      chartData.push({
        month: p.month,
        sales: null as any,
        predicted: p.predicted,
        lower_bound: p.lower_bound,
        upper_bound: p.upper_bound,
      });
    });
  } else {
    // Fallback linear trend
    const growthRate = salesOverTime.length > 1 ? (lastValue - firstValue) / (salesOverTime.length - 1) : 0;
    if (chartData.length > 0) {
      chartData[chartData.length - 1].predicted = chartData[chartData.length - 1].sales;
    }
    for (let i = 1; i <= 3; i++) {
      chartData.push({
        month: `F+${i}`,
        sales: null as any,
        predicted: Math.round(lastValue + growthRate * i),
        lower_bound: null,
        upper_bound: null,
      });
    }
  }

  const handleGenerateForecast = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("forecast", {
        body: { salesData: salesOverTime },
      });

      if (error) {
        throw new Error(error.message || "Forecast failed");
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setForecast(data as AiForecast);
      toast.success("AI forecast generated!");
    } catch (err: any) {
      console.error("Forecast error:", err);
      toast.error(err.message || "Failed to generate forecast. Using linear fallback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-xl border border-border p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Demand Forecasting</h3>
          <p className="text-sm text-muted-foreground">
            {forecast ? "AI-powered prediction with confidence intervals" : "Linear trend — click Generate for AI forecast"}
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleGenerateForecast}
          disabled={loading}
          className="gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Analyzing…" : "Generate AI Forecast"}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-secondary/50 p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-xs text-muted-foreground">Growth</span>
              </div>
              <p className="mt-1 text-xl font-bold text-success">
                {growthPct >= 0 ? "+" : ""}{growthPct.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">
                  {forecast ? "Confidence" : "Data Points"}
                </span>
              </div>
              <p className="mt-1 text-xl font-bold text-foreground">
                {forecast ? `${forecast.confidence_level}%` : rows.length}
              </p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-warning" />
                <span className="text-xs text-muted-foreground">Periods</span>
              </div>
              <p className="mt-1 text-xl font-bold text-foreground">{salesOverTime.length}</p>
            </div>
          </div>

          {forecast?.summary && (
            <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <p className="text-sm text-foreground">
                <Sparkles className="mb-0.5 mr-1 inline h-3.5 w-3.5 text-primary" />
                {forecast.summary}
              </p>
            </div>
          )}

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip content={<CustomTooltip />} />
                {forecast && (
                  <Area
                    type="monotone"
                    dataKey="upper_bound"
                    stroke="none"
                    fill="hsl(38, 92%, 55%)"
                    fillOpacity={0.1}
                    connectNulls={false}
                  />
                )}
                {forecast && (
                  <Area
                    type="monotone"
                    dataKey="lower_bound"
                    stroke="none"
                    fill="hsl(var(--background))"
                    fillOpacity={1}
                    connectNulls={false}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(190, 95%, 45%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(190, 95%, 45%)", r: 3 }}
                  name="Actual"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="hsl(38, 92%, 55%)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "hsl(38, 92%, 55%)", r: 3 }}
                  name="Forecast"
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
