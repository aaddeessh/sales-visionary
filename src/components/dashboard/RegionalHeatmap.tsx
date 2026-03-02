import { cn } from "@/lib/utils";
import { FileSpreadsheet } from "lucide-react";
import { useCsvData, deriveRegionData } from "@/hooks/useCsvData";

export function RegionalHeatmap() {
  const { rows } = useCsvData();
  const regions = deriveRegionData(rows);

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 80) return "bg-primary";
    if (intensity >= 60) return "bg-primary/80";
    if (intensity >= 40) return "bg-primary/60";
    if (intensity >= 20) return "bg-primary/40";
    return "bg-primary/20";
  };

  if (regions.length === 0) {
    return (
      <div className="glass-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground">Regional Performance</h3>
        <div className="flex h-48 flex-col items-center justify-center text-muted-foreground">
          <FileSpreadsheet className="mb-2 h-10 w-10 opacity-40" />
          <p className="text-sm">Upload a CSV with region data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl border border-border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Regional Performance</h3>
        <p className="text-sm text-muted-foreground">Sales distribution by geography</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {regions.map((region) => (
          <div key={region.code} className="group relative overflow-hidden rounded-lg border border-border bg-secondary/30 p-4 transition-all hover:border-primary/50">
            <div className={cn("absolute inset-0 opacity-20", getIntensityColor(region.intensity))} />
            <div className="relative">
              <span className="text-xs font-medium uppercase text-muted-foreground">{region.code}</span>
              <p className="mt-2 text-lg font-semibold text-foreground">
                ${region.revenue >= 1000000 ? `${(region.revenue / 1000000).toFixed(1)}M` : `${(region.revenue / 1000).toFixed(1)}K`}
              </p>
              <p className="text-xs text-muted-foreground">{region.name}</p>
            </div>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-border">
              <div className={cn("h-full rounded-full", getIntensityColor(region.intensity))} style={{ width: `${region.intensity}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
