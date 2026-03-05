import { useState } from "react";
import { AlertTriangle, CheckCircle, FileSpreadsheet, Sparkles, Loader2, ShieldAlert, ShieldCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCsvData, deriveCategoryData, deriveSalesOverTime, deriveKPIs } from "@/hooks/useCsvData";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface AiAnomaly {
  title: string;
  severity: "critical" | "warning" | "info";
  explanation: string;
  metric: string;
  deviation_pct: number;
  recommendation: string;
}

interface AiAnomalyResult {
  anomalies: AiAnomaly[];
  overall_health: "healthy" | "attention_needed" | "critical";
  summary: string;
}

export function AnomalyIndicator() {
  const { rows } = useCsvData();
  const categories = deriveCategoryData(rows);
  const [aiResult, setAiResult] = useState<AiAnomalyResult | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handleDetect = async () => {
    setLoading(true);
    try {
      const salesOverTime = deriveSalesOverTime(rows);
      const kpis = deriveKPIs(rows);

      const { data, error } = await supabase.functions.invoke("detect-anomalies", {
        body: { categoryData: categories, salesOverTime, kpis },
      });

      if (error) throw new Error(error.message || "Detection failed");
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setAiResult(data as AiAnomalyResult);
      toast.success("AI anomaly analysis complete!");
    } catch (err: any) {
      console.error("Anomaly detection error:", err);
      toast.error(err.message || "Failed to run AI anomaly detection");
    } finally {
      setLoading(false);
    }
  };

  // Fallback: simple percentage-based anomalies when AI hasn't run
  const fallbackAnomalies = (() => {
    const avgSales = categories.reduce((s, c) => s + c.sales, 0) / (categories.length || 1);
    const found = categories
      .map((c) => {
        const deviation = ((c.sales - avgSales) / avgSales) * 100;
        const isAnomaly = Math.abs(deviation) > 30;
        return {
          title: `${c.name} ${deviation > 0 ? "above" : "below"} average`,
          severity: (deviation > 30 ? "warning" : deviation < -30 ? "critical" : "info") as "warning" | "critical" | "info",
          explanation: `${c.name} sales are ${Math.abs(deviation).toFixed(0)}% ${deviation > 0 ? "above" : "below"} the category average`,
          metric: c.name,
          deviation_pct: Math.round(deviation),
          recommendation: "",
          isAnomaly,
        };
      })
      .filter((a) => a.isAnomaly);
    return found;
  })();

  const getStyles = (severity: "warning" | "critical" | "info" | "resolved") => {
    switch (severity) {
      case "critical": return { bg: "bg-danger/10", border: "border-danger/30", icon: "text-danger", badge: "bg-danger text-danger-foreground" };
      case "warning": return { bg: "bg-warning/10", border: "border-warning/30", icon: "text-warning", badge: "bg-warning text-warning-foreground" };
      case "info": return { bg: "bg-primary/10", border: "border-primary/30", icon: "text-primary", badge: "bg-primary text-primary-foreground" };
      case "resolved": return { bg: "bg-success/10", border: "border-success/30", icon: "text-success", badge: "bg-success text-success-foreground" };
    }
  };

  const SeverityIcon = ({ severity }: { severity: string }) => {
    if (severity === "critical") return <ShieldAlert className="h-5 w-5" />;
    if (severity === "warning") return <AlertTriangle className="h-5 w-5" />;
    if (severity === "info") return <Info className="h-5 w-5" />;
    return <CheckCircle className="h-5 w-5" />;
  };

  const healthStyles = {
    healthy: { label: "Healthy", color: "text-success", bg: "bg-success/10" },
    attention_needed: { label: "Needs Attention", color: "text-warning", bg: "bg-warning/10" },
    critical: { label: "Critical", color: "text-danger", bg: "bg-danger/10" },
  };

  const displayAnomalies = aiResult ? aiResult.anomalies : fallbackAnomalies;

  return (
    <div className="glass-card rounded-xl border border-border p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Anomaly Detection</h3>
          <p className="text-sm text-muted-foreground">
            {aiResult ? "AI-powered statistical analysis" : "Basic deviation — click Analyze for AI detection"}
          </p>
        </div>
        <Button size="sm" onClick={handleDetect} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Analyzing…" : "AI Analyze"}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          {aiResult && (
            <div className={cn("mb-4 flex items-center gap-3 rounded-lg border p-3", healthStyles[aiResult.overall_health].bg, "border-border")}>
              <ShieldCheck className={cn("h-5 w-5", healthStyles[aiResult.overall_health].color)} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-semibold", healthStyles[aiResult.overall_health].color)}>
                    {healthStyles[aiResult.overall_health].label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{aiResult.summary}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {displayAnomalies.length === 0 ? (
              <div className={cn("flex items-start gap-4 rounded-lg border p-4", getStyles("resolved").bg, getStyles("resolved").border)}>
                <div className={cn("mt-0.5 rounded-lg p-2", getStyles("resolved").bg)}>
                  <CheckCircle className={cn("h-5 w-5", getStyles("resolved").icon)} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">No anomalies detected</h4>
                  <p className="mt-1 text-sm text-muted-foreground">All metrics are within normal range</p>
                </div>
              </div>
            ) : (
              displayAnomalies.map((anomaly, i) => {
                const styles = getStyles(anomaly.severity);
                return (
                  <div key={i} className={cn("flex items-start gap-4 rounded-lg border p-4", styles.bg, styles.border)}>
                    <div className={cn("mt-0.5 rounded-lg p-2", styles.bg)}>
                      <span className={styles.icon}><SeverityIcon severity={anomaly.severity} /></span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-foreground">{anomaly.title}</h4>
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase", styles.badge)}>
                          {anomaly.severity}
                        </span>
                        {anomaly.deviation_pct !== 0 && (
                          <span className="text-xs text-muted-foreground">
                            {anomaly.deviation_pct > 0 ? "+" : ""}{anomaly.deviation_pct}%
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{anomaly.explanation}</p>
                      {anomaly.recommendation && (
                        <p className="mt-2 text-xs font-medium text-foreground/70">
                          💡 {anomaly.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
