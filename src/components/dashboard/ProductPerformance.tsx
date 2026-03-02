import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useCsvData, deriveCategoryData } from "@/hooks/useCsvData";
import { FileSpreadsheet } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg border border-border p-3 shadow-xl">
        <p className="mb-1 text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm text-primary">Revenue: ${(payload[0].value / 1000).toFixed(1)}K</p>
        <p className="text-xs text-muted-foreground">Units: {payload[0].payload.units.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export function ProductPerformance() {
  const { rows } = useCsvData();
  const productData = deriveCategoryData(rows);

  if (productData.length === 0) {
    return (
      <div className="glass-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground">Product Performance</h3>
        <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
          <FileSpreadsheet className="mb-2 h-10 w-10 opacity-40" />
          <p className="text-sm">Upload a CSV with category data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl border border-border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Product Performance</h3>
        <p className="text-sm text-muted-foreground">Revenue by category</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={productData} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}K`} />
            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} width={80} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(222, 30%, 14%)" }} />
            <Bar dataKey="sales" fill="hsl(190, 95%, 45%)" radius={[0, 4, 4, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
