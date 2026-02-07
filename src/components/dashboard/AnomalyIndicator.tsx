import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Anomaly {
  id: string;
  type: "warning" | "critical" | "resolved";
  title: string;
  description: string;
  timestamp: string;
  metric: string;
  deviation: number;
}

const anomalies: Anomaly[] = [
  {
    id: "1",
    type: "critical",
    title: "Revenue Drop Detected",
    description: "Q4 Electronics sales 23% below forecast",
    timestamp: "2 hours ago",
    metric: "Revenue",
    deviation: -23,
  },
  {
    id: "2",
    type: "warning",
    title: "Unusual Order Pattern",
    description: "Furniture returns spiked in Northeast region",
    timestamp: "5 hours ago",
    metric: "Returns",
    deviation: 45,
  },
  {
    id: "3",
    type: "resolved",
    title: "Inventory Shortage",
    description: "Office supplies restocked successfully",
    timestamp: "1 day ago",
    metric: "Stock",
    deviation: 0,
  },
];

export function AnomalyIndicator() {
  const getIcon = (type: Anomaly["type"]) => {
    switch (type) {
      case "critical":
        return XCircle;
      case "warning":
        return AlertTriangle;
      case "resolved":
        return CheckCircle;
    }
  };

  const getStyles = (type: Anomaly["type"]) => {
    switch (type) {
      case "critical":
        return {
          bg: "bg-danger/10",
          border: "border-danger/30",
          icon: "text-danger",
          badge: "bg-danger text-danger-foreground",
        };
      case "warning":
        return {
          bg: "bg-warning/10",
          border: "border-warning/30",
          icon: "text-warning",
          badge: "bg-warning text-warning-foreground",
        };
      case "resolved":
        return {
          bg: "bg-success/10",
          border: "border-success/30",
          icon: "text-success",
          badge: "bg-success text-success-foreground",
        };
    }
  };

  return (
    <div className="glass-card rounded-xl border border-border p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Anomaly Detection
          </h3>
          <p className="text-sm text-muted-foreground">
            ML-powered outlier monitoring
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          Live
        </span>
      </div>

      <div className="space-y-3">
        {anomalies.map((anomaly) => {
          const Icon = getIcon(anomaly.type);
          const styles = getStyles(anomaly.type);

          return (
            <div
              key={anomaly.id}
              className={cn(
                "group flex items-start gap-4 rounded-lg border p-4 transition-all hover:bg-secondary/30",
                styles.bg,
                styles.border
              )}
            >
              <div className={cn("mt-0.5 rounded-lg p-2", styles.bg)}>
                <Icon className={cn("h-5 w-5", styles.icon)} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-foreground">
                    {anomaly.title}
                  </h4>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
                      styles.badge
                    )}
                  >
                    {anomaly.type}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {anomaly.description}
                </p>
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{anomaly.timestamp}</span>
                  {anomaly.deviation !== 0 && (
                    <span className={anomaly.deviation > 0 ? "text-danger" : "text-warning"}>
                      {anomaly.deviation > 0 ? "+" : ""}
                      {anomaly.deviation}% deviation
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
