import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const productData = [
  { name: "Electronics", sales: 124500, units: 1245 },
  { name: "Furniture", sales: 98200, units: 892 },
  { name: "Clothing", sales: 87600, units: 2340 },
  { name: "Office", sales: 76400, units: 1567 },
  { name: "Sports", sales: 65800, units: 987 },
  { name: "Books", sales: 45200, units: 3421 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg border border-border p-3 shadow-xl">
        <p className="mb-1 text-sm font-medium text-foreground">{label}</p>
        <p className="text-sm text-primary">
          Revenue: ${(payload[0].value / 1000).toFixed(1)}K
        </p>
        <p className="text-xs text-muted-foreground">
          Units: {payload[0].payload.units.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export function ProductPerformance() {
  return (
    <div className="glass-card rounded-xl border border-border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Product Performance
        </h3>
        <p className="text-sm text-muted-foreground">
          Revenue by category this quarter
        </p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={productData} layout="vertical" margin={{ left: 20 }}>
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
              tickFormatter={(value) => `$${value / 1000}K`}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(222, 30%, 14%)" }} />
            <Bar
              dataKey="sales"
              fill="hsl(190, 95%, 45%)"
              radius={[0, 4, 4, 0]}
              barSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
