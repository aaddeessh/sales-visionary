import { cn } from "@/lib/utils";

interface Region {
  name: string;
  code: string;
  revenue: number;
  growth: number;
  intensity: number;
}

const regions: Region[] = [
  { name: "North America", code: "NA", revenue: 2450000, growth: 12.5, intensity: 100 },
  { name: "Europe", code: "EU", revenue: 1890000, growth: 8.3, intensity: 77 },
  { name: "Asia Pacific", code: "APAC", revenue: 1650000, growth: 18.7, intensity: 67 },
  { name: "Latin America", code: "LATAM", revenue: 890000, growth: 5.2, intensity: 36 },
  { name: "Middle East", code: "MEA", revenue: 560000, growth: -2.1, intensity: 23 },
  { name: "Africa", code: "AFR", revenue: 320000, growth: 15.8, intensity: 13 },
];

export function RegionalHeatmap() {
  const getIntensityColor = (intensity: number) => {
    if (intensity >= 80) return "bg-primary";
    if (intensity >= 60) return "bg-primary/80";
    if (intensity >= 40) return "bg-primary/60";
    if (intensity >= 20) return "bg-primary/40";
    return "bg-primary/20";
  };

  return (
    <div className="glass-card rounded-xl border border-border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Regional Performance
        </h3>
        <p className="text-sm text-muted-foreground">
          Sales distribution by geography
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {regions.map((region) => (
          <div
            key={region.code}
            className="group relative overflow-hidden rounded-lg border border-border bg-secondary/30 p-4 transition-all hover:border-primary/50 hover:bg-secondary/50"
          >
            <div
              className={cn(
                "absolute inset-0 opacity-20 transition-opacity group-hover:opacity-30",
                getIntensityColor(region.intensity)
              )}
            />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase text-muted-foreground">
                  {region.code}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium",
                    region.growth >= 0 ? "text-success" : "text-danger"
                  )}
                >
                  {region.growth >= 0 ? "+" : ""}
                  {region.growth}%
                </span>
              </div>
              <p className="mt-2 text-lg font-semibold text-foreground">
                ${(region.revenue / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-muted-foreground">{region.name}</p>
            </div>

            {/* Heat indicator bar */}
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-border">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  getIntensityColor(region.intensity)
                )}
                style={{ width: `${region.intensity}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <span className="text-xs text-muted-foreground">Low</span>
        <div className="flex gap-1">
          {[20, 40, 60, 80, 100].map((intensity) => (
            <div
              key={intensity}
              className={cn("h-2 w-6 rounded-sm", getIntensityColor(intensity))}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">High</span>
      </div>
    </div>
  );
}
