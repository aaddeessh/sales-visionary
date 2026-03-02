import { AlertTriangle, CheckCircle, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCsvData, deriveCategoryData } from "@/hooks/useCsvData";

export function AnomalyIndicator() {
  const { rows } = useCsvData();
  const categories = deriveCategoryData(rows);

  if (rows.length === 0) {
    return (
      <div className="glass-card rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground">Anomaly Detection</h3>
        <div className="flex h-48 flex-col items-center justify-center text-muted-foreground">
          <FileSpreadsheet className="mb-2 h-10 w-10 opacity-40" />
          <p className="text-sm">Upload a CSV to detect anomalies</p>
        </div>
      </div>
    );
  }

  // Derive simple anomalies: categories with very low or very high sales relative to average
  const avgSales = categories.reduce((s, c) => s + c.sales, 0) / (categories.length || 1);
  const anomalies = categories
    .map((c) => {
      const deviation = ((c.sales - avgSales) / avgSales) * 100;
      const isAnomaly = Math.abs(deviation) > 30;
      return {
        id: c.name,
        type: deviation > 30 ? ("warning" as const) : deviation < -30 ? ("critical" as const) : ("resolved" as const),
        title: `${c.name} ${deviation > 0 ? "above" : "below"} average`,
        description: `${c.name} sales are ${Math.abs(deviation).toFixed(0)}% ${deviation > 0 ? "above" : "below"} the category average`,
        deviation: Math.round(deviation),
        isAnomaly,
      };
    })
    .filter((a) => a.isAnomaly);

  if (anomalies.length === 0) {
    anomalies.push({
      id: "none",
      type: "resolved",
      title: "No anomalies detected",
      description: "All categories are within normal range",
      deviation: 0,
      isAnomaly: false,
    });
  }

  const getStyles = (type: "warning" | "critical" | "resolved") => {
    switch (type) {
      case "critical": return { bg: "bg-danger/10", border: "border-danger/30", icon: "text-danger", badge: "bg-danger text-danger-foreground" };
      case "warning": return { bg: "bg-warning/10", border: "border-warning/30", icon: "text-warning", badge: "bg-warning text-warning-foreground" };
      case "resolved": return { bg: "bg-success/10", border: "border-success/30", icon: "text-success", badge: "bg-success text-success-foreground" };
    }
  };

  return (
    <div className="glass-card rounded-xl border border-border p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Anomaly Detection</h3>
          <p className="text-sm text-muted-foreground">Based on uploaded data analysis</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          Live
        </span>
      </div>
      <div className="space-y-3">
        {anomalies.map((anomaly) => {
          const styles = getStyles(anomaly.type);
          const Icon = anomaly.type === "resolved" ? CheckCircle : AlertTriangle;
          return (
            <div key={anomaly.id} className={cn("flex items-start gap-4 rounded-lg border p-4", styles.bg, styles.border)}>
              <div className={cn("mt-0.5 rounded-lg p-2", styles.bg)}>
                <Icon className={cn("h-5 w-5", styles.icon)} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-foreground">{anomaly.title}</h4>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", styles.badge)}>{anomaly.type}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{anomaly.description}</p>
                {anomaly.deviation !== 0 && (
                  <p className={cn("mt-2 text-xs", anomaly.deviation > 0 ? "text-warning" : "text-danger")}>
                    {anomaly.deviation > 0 ? "+" : ""}{anomaly.deviation}% deviation
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
