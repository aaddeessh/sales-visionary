import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCsvData, deriveSalesOverTime } from "@/hooks/useCsvData";
import { FileSpreadsheet } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg border border-border p-3 shadow-xl">
        <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: ₹{(entry.value / 1000).toFixed(1)}K
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function SalesChart() {
  const { rows } = useCsvData();
  const salesData = deriveSalesOverTime(rows);

  if (salesData.length === 0) {
    return (
      <div className="glass-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground">Revenue Overview</h3>
        <div className="flex h-80 flex-col items-center justify-center text-muted-foreground">
          <FileSpreadsheet className="mb-2 h-10 w-10 opacity-40" />
          <p className="text-sm">Upload a CSV to view revenue trends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl border border-border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Revenue Overview</h3>
        <p className="text-sm text-muted-foreground">Sales over time from uploaded data</p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(190, 95%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(190, 95%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="sales" stroke="hsl(190, 95%, 45%)" strokeWidth={2} fill="url(#salesGradient)" name="Sales" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
